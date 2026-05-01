import type { ImageFrame } from '../math/biomimetic-kernels.js';
import { createMockFaceLandmarks } from '../mediapipe/index.js';
import { UnifiedSignalExtractor, type CoherenceReading, type ExtractedSignals } from './signal-extractor.js';
import type { SignalPipelineReading } from './live-pipeline.js';

export interface MockSignalPipelineConfig {
  readonly width?: number;
  readonly height?: number;
  readonly bpm?: number;
  readonly sampleRate?: number;
  readonly coherenceRampSeconds?: number;
  readonly seed?: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function syntheticFrame(width: number, height: number, timestampMs: number, bpm: number): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  const pulse = Math.sin((timestampMs / 1000) * (bpm / 60) * Math.PI * 2);
  const green = Math.round(132 + pulse * 22);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const vignette = Math.hypot(x / width - 0.5, y / height - 0.34);
      data[index] = Math.max(0, Math.round(88 - vignette * 18));
      data[index + 1] = Math.max(0, Math.round(green - vignette * 12));
      data[index + 2] = Math.max(0, Math.round(96 - vignette * 16));
      data[index + 3] = 255;
    }
  }
  return { width, height, data };
}

export class MockSignalPipeline {
  private readonly extractor: UnifiedSignalExtractor;
  private readonly width: number;
  private readonly height: number;
  private readonly bpm: number;
  private readonly sampleRate: number;
  private readonly rampSeconds: number;
  private readonly seed: number;
  private frameIndex = 0;

  public constructor(config: MockSignalPipelineConfig = {}, extractor: UnifiedSignalExtractor = new UnifiedSignalExtractor({ sampleRate: config.sampleRate ?? 30, bufferSeconds: 2, confidenceThreshold: 0.05 })) {
    this.extractor = extractor;
    this.width = Math.max(16, config.width ?? 96);
    this.height = Math.max(16, config.height ?? 72);
    this.bpm = Math.min(80, Math.max(60, config.bpm ?? 72));
    this.sampleRate = Math.max(1, config.sampleRate ?? 30);
    this.rampSeconds = Math.max(1, config.coherenceRampSeconds ?? 10);
    this.seed = config.seed ?? 1;
  }

  public async processFrame(timestampMs: number = (this.frameIndex / this.sampleRate) * 1000): Promise<SignalPipelineReading> {
    const frame = syntheticFrame(this.width, this.height, timestampMs, this.bpm);
    const landmarks = createMockFaceLandmarks(478, this.seed, timestampMs);
    const extracted = this.extractor.extract(frame, landmarks, null);
    const coherenceValue = clamp01(timestampMs / (this.rampSeconds * 1000));
    const coherence: CoherenceReading = {
      coherence: coherenceValue,
      stableTime: coherenceValue * this.rampSeconds,
      regimes: extracted.coherence?.regimes ?? { r1: coherenceValue, r2: coherenceValue, r3: coherenceValue },
      singularityRisk: extracted.coherence?.singularityRisk ?? 'OK',
      isUnlockReady: coherenceValue >= 0.5
    };
    const signals: ExtractedSignals = {
      ...extracted,
      ppg: { bpm: this.bpm, variance: extracted.ppg?.variance ?? 18, confidence: Math.max(0.86, extracted.ppg?.confidence ?? 0) },
      coherence,
      faceDetected: true
    };
    this.frameIndex += 1;
    return {
      mode: 'mock',
      signals,
      face: {
        faceDetected: true,
        landmarks,
        detectorMode: 'mock',
        detectorMessage: 'Deterministic simulated PPG and face landmarks are active.',
        blink: { totalBlinks: 0, blinkRate: 0, isBlinking: false },
        gesture: { type: null, confidence: 0 }
      },
      timestampMs,
      skippedFrame: false,
      message: 'Deterministic simulated PPG and coherence pipeline.'
    };
  }
}
