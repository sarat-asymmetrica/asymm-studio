import { CoherenceGate } from '../identity/index.js';
import { QuaternionField, ThreeRegimeTracker } from '../math/index.js';
import { PDETissueRegistry } from '../math/pde-tissue.js';
import { UnifiedSamplingSystem, type ImageFrame } from '../math/biomimetic-kernels.js';
import { UnifiedSignalExtractor, type ExtractedSignals, type Landmark } from '../signals/index.js';

export interface UVMEngineConfig {
  readonly width: number;
  readonly height: number;
  readonly targetFPS: number;
  readonly coherenceThreshold: number;
  readonly unlockTime: number;
  readonly faceLossRecoveryMs: number;
}

export interface GestureState {
  readonly openness: number;
  readonly tension: number;
  readonly force: number;
  readonly focalPoint: { readonly x: number; readonly y: number };
  readonly velocity: { readonly x: number; readonly y: number };
}

export interface EngineFrame {
  readonly quaternionField: QuaternionField;
  readonly signals: ExtractedSignals;
  readonly gestures: GestureState;
  readonly fps: number;
  readonly dt: number;
}

export class GestureProcessor {
  private previousLandmarks: readonly Landmark[] | null = null;
  private state: GestureState = { openness: 0, tension: 0, force: 0, focalPoint: { x: 0.5, y: 0.5 }, velocity: { x: 0, y: 0 } };

  public process(landmarks: readonly Landmark[] | null): GestureState {
    if (!landmarks || landmarks.length < 21) return this.state;
    const palm = landmarks[0];
    const fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]].filter((point: Landmark | undefined): point is Landmark => point !== undefined);
    const openness = fingertips.reduce((sum: number, tip: Landmark) => sum + Math.hypot(tip.x - palm.x, tip.y - palm.y, (tip.z ?? 0) - (palm.z ?? 0)), 0) / Math.max(1, fingertips.length);
    const avgX = fingertips.reduce((sum: number, tip: Landmark) => sum + tip.x, 0) / Math.max(1, fingertips.length);
    const avgY = fingertips.reduce((sum: number, tip: Landmark) => sum + tip.y, 0) / Math.max(1, fingertips.length);
    const tension = Math.sqrt(fingertips.reduce((sum: number, tip: Landmark) => sum + (tip.x - avgX) ** 2 + (tip.y - avgY) ** 2, 0) / Math.max(1, fingertips.length));
    const previousPalm = this.previousLandmarks?.[0];
    const velocity = previousPalm ? { x: palm.x - previousPalm.x, y: palm.y - previousPalm.y } : { x: 0, y: 0 };
    this.previousLandmarks = landmarks;
    this.state = { openness, tension, force: Math.hypot(velocity.x, velocity.y), focalPoint: { x: landmarks[8]?.x ?? 0.5, y: landmarks[8]?.y ?? 0.5 }, velocity };
    return this.state;
  }

  public getState(): GestureState {
    return this.state;
  }
}

export class UVMEngine {
  public readonly config: UVMEngineConfig;
  public readonly signalExtractor = new UnifiedSignalExtractor();
  public readonly tissueRegistry: PDETissueRegistry;
  public readonly regimeTracker = new ThreeRegimeTracker();
  public readonly samplingSystem = new UnifiedSamplingSystem();
  public readonly coherenceGate: CoherenceGate;
  public readonly gestureProcessor = new GestureProcessor();
  public quaternionField: QuaternionField;
  public signals: ExtractedSignals = { ppg: null, flow: null, hum: null, coherence: null, luminance: 0, colorComplexity: 0, motionMagnitude: 0, faceDetected: false };
  public gestures: GestureState = this.gestureProcessor.getState();
  public fps = 0;
  private lastFrameTime = 0;
  private lastValidFaceLandmarks: readonly Landmark[] | null = null;
  private lastFaceSeenAt = 0;

  public constructor(config: Partial<UVMEngineConfig> = {}) {
    this.config = { width: 64, height: 64, targetFPS: 30, coherenceThreshold: 0.65, unlockTime: 3, faceLossRecoveryMs: 500, ...config };
    this.tissueRegistry = new PDETissueRegistry(this.config.width, this.config.height);
    this.quaternionField = new QuaternionField(this.config.width, this.config.height);
    this.coherenceGate = new CoherenceGate(this.config.coherenceThreshold, this.config.unlockTime);
  }

  public shouldProcessFrame(timestamp: number): boolean {
    const minFrameMs = 1000 / this.config.targetFPS;
    if (this.lastFrameTime > 0 && timestamp - this.lastFrameTime < minFrameMs) return false;
    this.lastFrameTime = timestamp;
    return true;
  }

  public async processImageFrame(imageData: ImageFrame, dt: number, timestamp: number = performance.now(), faceLandmarks: readonly Landmark[] | null = null, handLandmarks: readonly Landmark[] | null = null): Promise<EngineFrame | null> {
    if (!this.shouldProcessFrame(timestamp)) return null;
    const boundedDt = Math.max(0.001, Math.min(0.05, dt));
    const recoveredFace = this.resolveFaceLandmarks(faceLandmarks, timestamp);
    this.gestures = this.gestureProcessor.process(handLandmarks);
    this.signals = this.signalExtractor.extract(imageData, recoveredFace, null);
    this.samplingSystem.updateWeights({ luminance: this.signals.luminance, motionMagnitude: this.signals.motionMagnitude, colorComplexity: this.signals.colorComplexity });
    const sampled = this.samplingSystem.apply(imageData);
    const vision = this.tissueRegistry.get('vision');
    if (vision) for (let index = 0; index < Math.min(vision.field.length, sampled.length); index += 1) vision.field[index] = sampled[index] ?? 0;
    this.tissueRegistry.stepAll(
      boundedDt,
      {
        coherence: this.signals.coherence?.coherence ?? 0,
        ...(this.signals.ppg?.bpm ? { heartRate: this.signals.ppg.bpm } : {}),
        opticalFlow: this.signals.flow?.magnitude ?? 0
      },
      this.gestures
    );
    this.quaternionField = this.tissueRegistry.toQuaternionField();
    this.regimeTracker.update(Array.from(this.tissueRegistry.getCombinedField()));
    if (this.signals.coherence) await this.coherenceGate.update(this.signals.coherence, this.signalExtractor.getPresenceVector());
    this.fps = 1 / boundedDt;
    return { quaternionField: this.quaternionField, signals: this.signals, gestures: this.gestures, fps: this.fps, dt: boundedDt };
  }

  public getQuaternionAt(x: number, y: number) {
    return this.quaternionField.get(Math.floor(x * this.config.width), Math.floor(y * this.config.height));
  }

  public getGradientAt(x: number, y: number): { readonly x: number; readonly y: number } {
    const combined = this.tissueRegistry.getCombinedField();
    const px = Math.floor(x * this.config.width);
    const py = Math.floor(y * this.config.height);
    const idx = py * this.config.width + px;
    const left = px > 0 ? combined[idx - 1] ?? 0 : combined[idx] ?? 0;
    const right = px < this.config.width - 1 ? combined[idx + 1] ?? 0 : combined[idx] ?? 0;
    const up = py > 0 ? combined[idx - this.config.width] ?? 0 : combined[idx] ?? 0;
    const down = py < this.config.height - 1 ? combined[idx + this.config.width] ?? 0 : combined[idx] ?? 0;
    return { x: (right - left) / 2, y: (down - up) / 2 };
  }

  private resolveFaceLandmarks(landmarks: readonly Landmark[] | null, timestamp: number): readonly Landmark[] | null {
    if (landmarks && landmarks.length > 0) {
      this.lastValidFaceLandmarks = landmarks;
      this.lastFaceSeenAt = timestamp;
      return landmarks;
    }
    return timestamp - this.lastFaceSeenAt <= this.config.faceLossRecoveryMs ? this.lastValidFaceLandmarks : null;
  }
}

export function createUVMEngine(config: Partial<UVMEngineConfig> = {}): UVMEngine {
  return new UVMEngine(config);
}
