import type { FaceLandmarker, FaceLandmarkerResult, ImageSource, NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { Landmark } from '../signals/index.js';
import type { FaceMeshDetection, FaceMeshDetector, FaceMeshFrameInfo } from './mock-facemesh.js';

export interface LiveFaceMeshConfig {
  readonly modelAssetPath: string;
  readonly wasmBaseUrl: string;
  readonly maxFaces: number;
  readonly minFaceDetectionConfidence: number;
  readonly minFacePresenceConfidence: number;
  readonly minTrackingConfidence: number;
  readonly delegate: 'CPU' | 'GPU';
}

export const DEFAULT_MEDIAPIPE_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';
export const DEFAULT_MEDIAPIPE_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm';

export class LiveFaceMeshDetector implements FaceMeshDetector {
  public readonly mode = 'live';
  private readonly landmarker: FaceLandmarker;

  public constructor(landmarker: FaceLandmarker) {
    this.landmarker = landmarker;
  }

  public async processFrame(frame: TexImageSource | null, info: FaceMeshFrameInfo = {}): Promise<FaceMeshDetection> {
    if (!frame) return { mode: this.mode, landmarks: null, message: 'Camera frame is not ready yet.' };
    try {
      const timestampMs = info.timestampMs ?? nowMs();
      const result = this.landmarker.detectForVideo(frame as ImageSource, timestampMs);
      return { mode: this.mode, landmarks: firstFace(result), message: null };
    } catch (_error: unknown) {
      return { mode: this.mode, landmarks: null, message: 'Face tracking paused. Check camera permission and try again.' };
    }
  }

  public close(): void {
    this.landmarker.close();
  }
}

export async function createLiveFaceMeshDetector(config: Partial<LiveFaceMeshConfig> = {}): Promise<LiveFaceMeshDetector> {
  const resolved: LiveFaceMeshConfig = {
    modelAssetPath: DEFAULT_MEDIAPIPE_MODEL_URL,
    wasmBaseUrl: DEFAULT_MEDIAPIPE_WASM_URL,
    maxFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    delegate: 'GPU',
    ...config
  };
  const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
  const fileset = await FilesetResolver.forVisionTasks(resolved.wasmBaseUrl);
  const landmarker = await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: resolved.modelAssetPath,
      delegate: resolved.delegate
    },
    runningMode: 'VIDEO',
    numFaces: resolved.maxFaces,
    minFaceDetectionConfidence: resolved.minFaceDetectionConfidence,
    minFacePresenceConfidence: resolved.minFacePresenceConfidence,
    minTrackingConfidence: resolved.minTrackingConfidence
  });
  return new LiveFaceMeshDetector(landmarker);
}

function firstFace(result: FaceLandmarkerResult): readonly Landmark[] | null {
  const face = result.faceLandmarks[0];
  if (!face || face.length === 0) return null;
  return face.map((point: NormalizedLandmark): Landmark => ({ x: point.x, y: point.y, z: point.z }));
}

function nowMs(): number {
  if (typeof performance !== 'undefined') return performance.now();
  return Date.now();
}
