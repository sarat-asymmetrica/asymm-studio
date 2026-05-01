export type GazePointName = 'upper-left' | 'upper-right' | 'lower-right' | 'lower-left';

export interface GazeSample {
  readonly point: GazePointName;
  readonly x: number;
  readonly y: number;
  readonly timestamp: number;
}

export interface GazeCalibrationResult {
  readonly samples: readonly GazeSample[];
  readonly bounds: {
    readonly minX: number;
    readonly maxX: number;
    readonly minY: number;
    readonly maxY: number;
  };
  readonly horizontalSpan: number;
  readonly verticalSpan: number;
  readonly complete: boolean;
}

export class GazeCalibration {
  private readonly samples: GazeSample[] = [];

  public addSample(sample: GazeSample): GazeCalibrationResult {
    this.samples.push(sample);
    return this.getResult();
  }

  public getResult(): GazeCalibrationResult {
    const xs = this.samples.map((sample: GazeSample) => sample.x);
    const ys = this.samples.map((sample: GazeSample) => sample.y);
    const minX = xs.length > 0 ? Math.min(...xs) : 0;
    const maxX = xs.length > 0 ? Math.max(...xs) : 0;
    const minY = ys.length > 0 ? Math.min(...ys) : 0;
    const maxY = ys.length > 0 ? Math.max(...ys) : 0;
    const seen = new Set(this.samples.map((sample: GazeSample) => sample.point));
    return { samples: [...this.samples], bounds: { minX, maxX, minY, maxY }, horizontalSpan: maxX - minX, verticalSpan: maxY - minY, complete: seen.size === 4 };
  }

  public mapToScreen(x: number, y: number): { readonly x: number; readonly y: number } {
    const result = this.getResult();
    const width = Math.max(1e-6, result.horizontalSpan);
    const height = Math.max(1e-6, result.verticalSpan);
    return { x: Math.max(0, Math.min(1, (x - result.bounds.minX) / width)), y: Math.max(0, Math.min(1, (y - result.bounds.minY) / height)) };
  }
}
