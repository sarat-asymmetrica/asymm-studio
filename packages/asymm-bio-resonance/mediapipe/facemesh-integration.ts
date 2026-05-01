import type { Landmark } from '../signals/index.js';
import { createFaceMeshDetector } from './factory.js';
import type { FaceMeshDetector, FaceMeshDetection } from './mock-facemesh.js';
import type { FaceMeshFactoryConfig, FaceMeshFactoryResult } from './factory.js';

export const LANDMARK_REGIONS = {
  FOREHEAD: [10, 67, 69, 104, 108, 109, 151, 299, 297, 333, 337, 338],
  LEFT_CHEEK: [50, 101, 116, 117, 118, 119, 123, 147, 187, 205, 206, 207],
  RIGHT_CHEEK: [280, 330, 345, 346, 347, 348, 352, 376, 411, 425, 426, 427],
  LEFT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
  RIGHT_EYE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
  FACE_OVAL: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
} as const;

export interface FaceMeshConfig {
  readonly maxFaces: number;
  readonly earThreshold: number;
  readonly blinkConsecutiveFrames: number;
  readonly gestureDeltaThreshold: number;
}

export type FaceMeshIntegrationConfig = FaceMeshConfig & Omit<FaceMeshFactoryConfig, 'maxFaces'>;

export interface FaceMeshState {
  readonly faceDetected: boolean;
  readonly landmarks: readonly Landmark[] | null;
  readonly detectorMode: 'live' | 'mock' | null;
  readonly detectorMessage: string | null;
  readonly blink: {
    readonly totalBlinks: number;
    readonly blinkRate: number;
    readonly isBlinking: boolean;
  };
  readonly gesture: {
    readonly type: 'nod' | 'shake' | null;
    readonly confidence: number;
  };
}

interface PoseSample {
  readonly yaw: number;
  readonly pitch: number;
  readonly timestamp: number;
}

export class FaceMeshIntegration {
  private readonly config: FaceMeshIntegrationConfig;
  private detector: FaceMeshDetector | null;
  private detectorMode: 'live' | 'mock' | null = null;
  private detectorMessage: string | null = null;
  private landmarks: readonly Landmark[] | null = null;
  private blinkFrameCounter = 0;
  private totalBlinks = 0;
  private blinkRate = 0;
  private lastBlinkTime = 0;
  private readonly headPoseHistory: PoseSample[] = [];
  private lastGesture: 'nod' | 'shake' | null = null;
  private gestureConfidence = 0;

  public constructor(config: Partial<FaceMeshIntegrationConfig> = {}, detector: FaceMeshDetector | null = null, detectorMessage: string | null = null) {
    this.config = { maxFaces: 1, earThreshold: 0.21, blinkConsecutiveFrames: 2, gestureDeltaThreshold: 0.02, ...config };
    this.detector = detector;
    this.detectorMode = detector?.mode ?? null;
    this.detectorMessage = detectorMessage;
  }

  public async initializeDetector(): Promise<FaceMeshFactoryResult> {
    const result = await createFaceMeshDetector(this.config);
    this.detector = result.detector;
    this.detectorMode = result.mode;
    this.detectorMessage = result.reason;
    return result;
  }

  public async processFrame(frame: TexImageSource | null, timestampMs: number = Date.now()): Promise<FaceMeshState> {
    if (!this.detector) await this.initializeDetector();
    const detection: FaceMeshDetection = this.detector
      ? await this.detector.processFrame(frame, { timestampMs })
      : { mode: 'mock', landmarks: null, message: 'Face tracking is unavailable.' };
    this.detectorMode = detection.mode;
    this.detectorMessage = detection.message;
    return this.processResults(detection.landmarks);
  }

  public processResults(landmarks: readonly Landmark[] | null): FaceMeshState {
    this.landmarks = landmarks && landmarks.length > 0 ? landmarks : null;
    if (this.landmarks) {
      this.detectBlink();
      this.detectGestures();
    }
    return this.getState();
  }

  public getPPGRegion(): { readonly x: number; readonly y: number; readonly width: number; readonly height: number; readonly landmarks: readonly Landmark[] } | null {
    if (!this.landmarks) return null;
    const points = LANDMARK_REGIONS.FOREHEAD.map((index: number) => this.landmarks?.[index]).filter((point: Landmark | undefined): point is Landmark => point !== undefined);
    if (points.length === 0) return null;
    const xs = points.map((point: Landmark) => point.x);
    const ys = points.map((point: Landmark) => point.y);
    return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys), landmarks: points };
  }

  public calculateEAR(eyeIndices: readonly number[]): number {
    if (!this.landmarks || eyeIndices.length < 6) return 1;
    const points = eyeIndices.map((index: number) => this.landmarks?.[index]);
    if (points.some((point: Landmark | undefined) => point === undefined)) return 1;
    const typed = points as Landmark[];
    const vertical1 = this.distance(typed[1], typed[5]);
    const vertical2 = this.distance(typed[2], typed[4]);
    const horizontal = Math.max(1e-6, this.distance(typed[0], typed[3]));
    return (vertical1 + vertical2) / (2 * horizontal);
  }

  public getState(): FaceMeshState {
    return { faceDetected: this.landmarks !== null, landmarks: this.landmarks, detectorMode: this.detectorMode, detectorMessage: this.detectorMessage, blink: { totalBlinks: this.totalBlinks, blinkRate: this.blinkRate, isBlinking: this.blinkFrameCounter >= this.config.blinkConsecutiveFrames }, gesture: { type: this.lastGesture, confidence: this.gestureConfidence } };
  }

  public close(): void {
    this.detector?.close();
    this.detector = null;
    this.detectorMode = null;
    this.detectorMessage = null;
  }

  private detectBlink(): void {
    const avgEAR = (this.calculateEAR(LANDMARK_REGIONS.LEFT_EYE) + this.calculateEAR(LANDMARK_REGIONS.RIGHT_EYE)) / 2;
    if (avgEAR < this.config.earThreshold) {
      this.blinkFrameCounter += 1;
      return;
    }
    if (this.blinkFrameCounter >= this.config.blinkConsecutiveFrames) {
      const now = Date.now();
      this.totalBlinks += 1;
      if (this.lastBlinkTime > 0) this.blinkRate = 60 / ((now - this.lastBlinkTime) / 1000);
      this.lastBlinkTime = now;
    }
    this.blinkFrameCounter = 0;
  }

  private detectGestures(): void {
    if (!this.landmarks) return;
    const left = this.landmarks[234];
    const right = this.landmarks[454];
    const forehead = this.landmarks[10];
    const chin = this.landmarks[152];
    if (!left || !right || !forehead || !chin) return;
    this.headPoseHistory.push({ yaw: Math.atan2((right.z ?? 0) - (left.z ?? 0), right.x - left.x), pitch: Math.atan2(chin.y - forehead.y, (chin.z ?? 0) - (forehead.z ?? 0)), timestamp: Date.now() });
    if (this.headPoseHistory.length > 30) this.headPoseHistory.shift();
    if (this.headPoseHistory.length < 15) return;
    this.lastGesture = this.analyzeHeadGesture();
  }

  private analyzeHeadGesture(): 'nod' | 'shake' | null {
    const recent = this.headPoseHistory.slice(-15);
    let pitchChanges = 0;
    let yawChanges = 0;
    let pitchDirection = 0;
    let yawDirection = 0;
    for (let index = 1; index < recent.length; index += 1) {
      const pitchDiff = recent[index].pitch - recent[index - 1].pitch;
      const yawDiff = recent[index].yaw - recent[index - 1].yaw;
      if (Math.abs(pitchDiff) > this.config.gestureDeltaThreshold) {
        pitchChanges += 1;
        pitchDirection += Math.sign(pitchDiff);
      }
      if (Math.abs(yawDiff) > this.config.gestureDeltaThreshold) {
        yawChanges += 1;
        yawDirection += Math.sign(yawDiff);
      }
    }
    if (pitchChanges > 4 && Math.abs(pitchDirection) < 3) {
      this.gestureConfidence = pitchChanges / 14;
      return 'nod';
    }
    if (yawChanges > 4 && Math.abs(yawDirection) < 3) {
      this.gestureConfidence = yawChanges / 14;
      return 'shake';
    }
    return null;
  }

  private distance(left: Landmark, right: Landmark): number {
    return Math.hypot(left.x - right.x, left.y - right.y, (left.z ?? 0) - (right.z ?? 0));
  }
}

export async function createFaceMeshIntegration(config: Partial<FaceMeshIntegrationConfig> = {}): Promise<FaceMeshIntegration> {
  const result = await createFaceMeshDetector(config);
  return new FaceMeshIntegration(config, result.detector, result.reason);
}
