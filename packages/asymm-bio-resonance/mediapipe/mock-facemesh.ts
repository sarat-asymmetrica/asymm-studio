import type { Landmark } from '../signals/index.js';

export type FaceMeshDetectorMode = 'live' | 'mock';

export interface FaceMeshFrameInfo {
  readonly timestampMs?: number;
}

export interface FaceMeshDetection {
  readonly mode: FaceMeshDetectorMode;
  readonly landmarks: readonly Landmark[] | null;
  readonly message: string | null;
}

export interface FaceMeshDetector {
  readonly mode: FaceMeshDetectorMode;
  processFrame(frame: TexImageSource | null, info?: FaceMeshFrameInfo): Promise<FaceMeshDetection>;
  close(): void;
}

export interface MockFaceMeshConfig {
  readonly seed: number;
  readonly landmarkCount: number;
  readonly facePresent: boolean;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function seededNoise(index: number, seed: number): number {
  const value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

export class MockFaceMeshDetector implements FaceMeshDetector {
  public readonly mode = 'mock';
  private readonly config: MockFaceMeshConfig;
  private frameIndex = 0;

  public constructor(config: Partial<MockFaceMeshConfig> = {}) {
    this.config = { seed: 1, landmarkCount: 478, facePresent: true, ...config };
  }

  public async processFrame(_frame: TexImageSource | null, info: FaceMeshFrameInfo = {}): Promise<FaceMeshDetection> {
    if (!this.config.facePresent) return { mode: this.mode, landmarks: null, message: 'Simulated camera: no face present.' };
    const timestampMs = info.timestampMs ?? this.frameIndex * 33.333;
    const landmarks = createMockFaceLandmarks(this.config.landmarkCount, this.config.seed, timestampMs);
    this.frameIndex += 1;
    return { mode: this.mode, landmarks, message: 'Simulated face landmarks are active.' };
  }

  public close(): void {
    this.frameIndex = 0;
  }
}

export function createMockFaceLandmarks(count: number = 478, seed: number = 1, timestampMs: number = 0): readonly Landmark[] {
  const safeCount = Math.max(468, Math.floor(count));
  const phase = timestampMs / 1000;
  const breath = Math.sin(phase * Math.PI * 2 * 0.18) * 0.012;
  const blink = Math.sin(phase * Math.PI * 2 * 0.5) > 0.96 ? 0.012 : 0.032;
  const points: Landmark[] = Array.from({ length: safeCount }, (_unused: unknown, index: number) => {
    const angle = index * 2.399963229728653;
    const radius = 0.03 + seededNoise(index, seed) * 0.32;
    const ovalX = Math.cos(angle) * radius * 0.55;
    const ovalY = Math.sin(angle) * radius * 0.72;
    return {
      x: clamp01(0.5 + ovalX + Math.sin(phase + index * 0.017) * 0.002),
      y: clamp01(0.52 + ovalY + breath),
      z: Math.cos(angle) * 0.025
    };
  });

  setLandmark(points, 10, 0.5, 0.22 + breath, -0.02);
  setLandmark(points, 67, 0.43, 0.26 + breath, -0.015);
  setLandmark(points, 69, 0.45, 0.24 + breath, -0.014);
  setLandmark(points, 103, 0.41, 0.28 + breath, -0.012);
  setLandmark(points, 104, 0.47, 0.25 + breath, -0.016);
  setLandmark(points, 108, 0.49, 0.24 + breath, -0.017);
  setLandmark(points, 109, 0.46, 0.22 + breath, -0.018);
  setLandmark(points, 151, 0.5, 0.31 + breath, -0.01);
  setLandmark(points, 299, 0.53, 0.25 + breath, -0.016);
  setLandmark(points, 297, 0.55, 0.24 + breath, -0.014);
  setLandmark(points, 332, 0.59, 0.28 + breath, -0.012);
  setLandmark(points, 333, 0.57, 0.26 + breath, -0.015);
  setLandmark(points, 337, 0.51, 0.24 + breath, -0.017);
  setLandmark(points, 338, 0.54, 0.22 + breath, -0.018);

  setEye(points, [33, 7, 163, 144, 145, 153], 0.41, 0.42 + breath, blink);
  setEye(points, [362, 382, 381, 380, 374, 373], 0.59, 0.42 + breath, blink);
  setLandmark(points, 133, 0.46, 0.42 + breath, -0.01);
  setLandmark(points, 263, 0.54, 0.42 + breath, -0.01);
  setLandmark(points, 234, 0.28, 0.52 + breath, 0.01);
  setLandmark(points, 454, 0.72, 0.52 + breath, -0.01);
  setLandmark(points, 152, 0.5, 0.78 + breath, 0.02);

  return points;
}

function setEye(points: Landmark[], indices: readonly number[], centerX: number, centerY: number, openness: number): void {
  setLandmark(points, indices[0] ?? 0, centerX - 0.045, centerY, -0.01);
  setLandmark(points, indices[1] ?? 0, centerX - 0.025, centerY - openness, -0.012);
  setLandmark(points, indices[2] ?? 0, centerX, centerY - openness * 1.15, -0.013);
  setLandmark(points, indices[3] ?? 0, centerX + 0.045, centerY, -0.01);
  setLandmark(points, indices[4] ?? 0, centerX, centerY + openness * 1.15, -0.013);
  setLandmark(points, indices[5] ?? 0, centerX - 0.025, centerY + openness, -0.012);
}

function setLandmark(points: Landmark[], index: number, x: number, y: number, z: number): void {
  if (index < 0 || index >= points.length) return;
  points[index] = { x: clamp01(x), y: clamp01(y), z };
}
