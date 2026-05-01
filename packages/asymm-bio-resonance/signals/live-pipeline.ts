import type { ImageFrame } from '../math/biomimetic-kernels.js';
import { FaceMeshIntegration, type FaceMeshIntegrationConfig, type FaceMeshState } from '../mediapipe/index.js';
import { UnifiedSignalExtractor, type ExtractedSignals } from './signal-extractor.js';

export type PipelineFrame = ImageFrame | TexImageSource | null;

export interface SignalPipelineReading {
  readonly mode: 'live' | 'mock' | null;
  readonly signals: ExtractedSignals;
  readonly face: FaceMeshState | null;
  readonly timestampMs: number;
  readonly skippedFrame: boolean;
  readonly message: string | null;
}

export interface LiveSignalPipelineConfig {
  readonly faceMesh?: Partial<FaceMeshIntegrationConfig>;
  readonly maxFps?: number;
  readonly frameWidth?: number;
  readonly frameHeight?: number;
}

function isImageFrame(frame: PipelineFrame): frame is ImageFrame {
  return frame !== null && 'data' in frame && 'width' in frame && 'height' in frame;
}

function neutralFrame(width: number, height: number): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 96;
    data[index + 1] = 112;
    data[index + 2] = 104;
    data[index + 3] = 255;
  }
  return { width, height, data };
}

function frameDimensions(frame: TexImageSource, fallbackWidth: number, fallbackHeight: number): { readonly width: number; readonly height: number } {
  const video = frame as { readonly videoWidth?: number; readonly videoHeight?: number };
  const natural = frame as { readonly naturalWidth?: number; readonly naturalHeight?: number };
  const intrinsic = frame as { readonly width?: number; readonly height?: number };
  const width = video.videoWidth ?? natural.naturalWidth ?? intrinsic.width ?? fallbackWidth;
  const height = video.videoHeight ?? natural.naturalHeight ?? intrinsic.height ?? fallbackHeight;
  return { width: Math.max(1, Math.floor(width)), height: Math.max(1, Math.floor(height)) };
}

function drawFrame(frame: TexImageSource, width: number, height: number): ImageFrame | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(frame as CanvasImageSource, 0, 0, width, height);
  const image = context.getImageData(0, 0, width, height);
  return { width, height, data: image.data };
}

export class LiveSignalPipeline {
  private readonly faceMesh: FaceMeshIntegration;
  private readonly extractor: UnifiedSignalExtractor;
  private readonly maxFps: number;
  private readonly fallbackWidth: number;
  private readonly fallbackHeight: number;
  private readonly minimumFrameMs: number;
  private lastTimestampMs = 0;
  private lastReading: SignalPipelineReading | null = null;

  public constructor(config: LiveSignalPipelineConfig = {}, faceMesh: FaceMeshIntegration = new FaceMeshIntegration(config.faceMesh), extractor: UnifiedSignalExtractor = new UnifiedSignalExtractor()) {
    this.faceMesh = faceMesh;
    this.extractor = extractor;
    this.maxFps = Math.max(1, config.maxFps ?? 30);
    this.fallbackWidth = Math.max(16, config.frameWidth ?? 96);
    this.fallbackHeight = Math.max(16, config.frameHeight ?? 72);
    this.minimumFrameMs = 1000 / this.maxFps;
  }

  public async processFrame(frame: PipelineFrame, timestampMs: number = Date.now()): Promise<SignalPipelineReading> {
    if (this.lastReading && timestampMs - this.lastTimestampMs > 0 && timestampMs - this.lastTimestampMs < this.minimumFrameMs) {
      return { ...this.lastReading, timestampMs, skippedFrame: true, message: 'Frame skipped to respect pipeline FPS cap.' };
    }
    this.lastTimestampMs = timestampMs;

    const face = await this.faceMesh.processFrame(isImageFrame(frame) ? null : frame, timestampMs);
    const image = this.resolveImageFrame(frame);
    if (!image) return this.remember(face, timestampMs, true, 'Frame unavailable; retained previous signal state.');

    const signals = this.extractor.extract(image, face.landmarks, null);
    return this.remember(face, timestampMs, false, face.detectorMessage, signals);
  }

  public close(): void {
    this.faceMesh.close();
  }

  private resolveImageFrame(frame: PipelineFrame): ImageFrame | null {
    if (isImageFrame(frame)) return frame;
    if (frame === null) return this.lastReading ? null : neutralFrame(this.fallbackWidth, this.fallbackHeight);
    const { width, height } = frameDimensions(frame, this.fallbackWidth, this.fallbackHeight);
    return drawFrame(frame, width, height) ?? neutralFrame(width, height);
  }

  private remember(face: FaceMeshState | null, timestampMs: number, skippedFrame: boolean, message: string | null, signals: ExtractedSignals = this.extractor.signals): SignalPipelineReading {
    const reading: SignalPipelineReading = { mode: face?.detectorMode ?? null, signals, face, timestampMs, skippedFrame, message };
    this.lastReading = reading;
    return reading;
  }
}
