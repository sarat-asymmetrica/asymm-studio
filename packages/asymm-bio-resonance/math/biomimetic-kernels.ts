export interface ImageFrame {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray | Uint8Array | Float32Array;
}

export interface KernelSignals {
  readonly luminance?: number;
  readonly motionMagnitude?: number;
  readonly colorComplexity?: number;
}

export type KernelName = 'eagle' | 'owl' | 'mantis' | 'frog' | 'viper' | 'dragonfly';
export type KernelWeights = Readonly<Record<KernelName, number>>;

const DEFAULT_WEIGHTS: KernelWeights = {
  eagle: 0.3,
  owl: 0.15,
  mantis: 0.15,
  frog: 0.2,
  viper: 0.1,
  dragonfly: 0.1
};

function luminance(data: ImageFrame['data'], index: number): number {
  return ((data[index] ?? 0) * 0.299 + (data[index + 1] ?? 0) * 0.587 + (data[index + 2] ?? 0) * 0.114) / 255;
}

export abstract class SamplingKernel {
  public readonly name: KernelName;
  public weight: number;
  public enabled: boolean = true;

  protected constructor(name: KernelName, weight: number = 1) {
    this.name = name;
    this.weight = weight;
  }

  public abstract apply(imageData: ImageFrame): Float32Array;
  public abstract getCurvature(): number;
}

/** Eagle curvature is strongly negative: high-acuity telephoto sampling compresses distant detail into a narrow foveal manifold. */
export class EagleKernel extends SamplingKernel {
  public readonly foveaCount: number = 2;
  public readonly acuityMultiplier: number = 8;

  public constructor(weight: number = DEFAULT_WEIGHTS.eagle) {
    super('eagle', weight);
  }

  public apply(imageData: ImageFrame): Float32Array {
    const { width, height, data } = imageData;
    const result = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const idx = (y * width + x) * 4;
        const center = luminance(data, idx);
        const laplacian = (luminance(data, idx - 4) + luminance(data, idx + 4) + luminance(data, idx - width * 4) + luminance(data, idx + width * 4) - 4 * center) * this.acuityMultiplier;
        const nx = x / width - 0.5;
        const ny = y / height - 0.5;
        const dist = Math.hypot(nx, ny);
        result[y * width + x] = Math.abs(laplacian) * (Math.exp(-dist * 4) + 0.3 * Math.exp(-Math.abs(dist - 0.3) * 8));
      }
    }
    return result;
  }

  public getCurvature(): number {
    return -2;
  }
}

/** Owl curvature is weakly negative: temporal accumulation bends noisy low-light samples toward a soft, stable focus. */
export class OwlKernel extends SamplingKernel {
  private readonly accumulationFrames: number;
  private readonly frameBuffer: Float32Array[] = [];

  public constructor(weight: number = DEFAULT_WEIGHTS.owl, accumulationFrames: number = 8) {
    super('owl', weight);
    this.accumulationFrames = accumulationFrames;
  }

  public apply(imageData: ImageFrame): Float32Array {
    const { width, height, data } = imageData;
    const current = new Float32Array(width * height);
    for (let index = 0; index < current.length; index += 1) current[index] = luminance(data, index * 4);
    this.frameBuffer.push(current);
    if (this.frameBuffer.length > this.accumulationFrames) this.frameBuffer.shift();
    const result = new Float32Array(width * height);
    for (let index = 0; index < result.length; index += 1) {
      const sum = this.frameBuffer.reduce((total: number, frame: Float32Array) => total + frame[index], 0);
      result[index] = Math.sqrt(sum / this.frameBuffer.length);
    }
    return result;
  }

  public getCurvature(): number {
    return -0.5;
  }
}

/** Mantis curvature is variable-negative: RGB gradient polarization approximates many receptor channels as a folded color manifold. */
export class MantisKernel extends SamplingKernel {
  public constructor(weight: number = DEFAULT_WEIGHTS.mantis) {
    super('mantis', weight);
  }

  public apply(imageData: ImageFrame): Float32Array {
    const { width, height, data } = imageData;
    const result = new Float32Array(width * height);
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const idx = (y * width + x) * 4;
        const dRdx = (data[idx + 4] ?? 0) - (data[idx - 4] ?? 0);
        const dGdx = (data[idx + 5] ?? 0) - (data[idx - 3] ?? 0);
        const dBdx = (data[idx + 6] ?? 0) - (data[idx - 2] ?? 0);
        const dRdy = (data[idx + width * 4] ?? 0) - (data[idx - width * 4] ?? 0);
        const dGdy = (data[idx + width * 4 + 1] ?? 0) - (data[idx - width * 4 + 1] ?? 0);
        const dBdy = (data[idx + width * 4 + 2] ?? 0) - (data[idx - width * 4 + 2] ?? 0);
        const grad = Math.hypot(dRdx, dGdx, dBdx, dRdy, dGdy, dBdy) / 255;
        const r = (data[idx] ?? 0) / 255;
        const g = (data[idx + 1] ?? 0) / 255;
        const b = (data[idx + 2] ?? 0) / 255;
        result[y * width + x] = grad * (1 + Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r));
      }
    }
    return result;
  }

  public getCurvature(): number {
    return -1;
  }
}

/** Frog curvature is Euclidean: motion-only detection treats the world as flat until temporal difference creates signal. */
export class FrogKernel extends SamplingKernel {
  private previousFrame: Float32Array | null = null;
  private readonly motionThreshold: number;

  public constructor(weight: number = DEFAULT_WEIGHTS.frog, motionThreshold: number = 0.05) {
    super('frog', weight);
    this.motionThreshold = motionThreshold;
  }

  public apply(imageData: ImageFrame): Float32Array {
    const { width, height, data } = imageData;
    const current = new Float32Array(width * height);
    const result = new Float32Array(width * height);
    for (let index = 0; index < current.length; index += 1) current[index] = luminance(data, index * 4);
    if (this.previousFrame) {
      for (let index = 0; index < result.length; index += 1) {
        const diff = Math.abs(current[index] - this.previousFrame[index]);
        result[index] = diff > this.motionThreshold ? diff : 0;
      }
    }
    this.previousFrame = current;
    return result;
  }

  public getCurvature(): number {
    return 0;
  }
}

/** Viper curvature is medium-negative: red-channel heat gradients concentrate radial contrast into a thermal focus. */
export class ViperKernel extends SamplingKernel {
  private previousRedChannel: Float32Array | null = null;

  public constructor(weight: number = DEFAULT_WEIGHTS.viper) {
    super('viper', weight);
  }

  public apply(imageData: ImageFrame): Float32Array {
    const { width, height, data } = imageData;
    const red = new Float32Array(width * height);
    const result = new Float32Array(width * height);
    for (let index = 0; index < red.length; index += 1) red[index] = (data[index * 4] ?? 0) / 255;
    if (this.previousRedChannel) {
      for (let y = 1; y < height - 1; y += 1) {
        for (let x = 1; x < width - 1; x += 1) {
          const idx = y * width + x;
          result[idx] = Math.hypot(red[idx + 1] - red[idx - 1], red[idx + width] - red[idx - width]) + Math.abs(red[idx] - this.previousRedChannel[idx]) * 2;
        }
      }
    }
    this.previousRedChannel = red;
    return result;
  }

  public getCurvature(): number {
    return -1.5;
  }
}

/** Dragonfly curvature is local-variable: tiled optical flow bends independently across many eye facets for interception. */
export class DragonflyKernel extends SamplingKernel {
  private previousFrame: Float32Array | null = null;
  private readonly tileSize: number;

  public constructor(weight: number = DEFAULT_WEIGHTS.dragonfly, tileSize: number = 16) {
    super('dragonfly', weight);
    this.tileSize = tileSize;
  }

  public apply(imageData: ImageFrame): Float32Array {
    const { width, height, data } = imageData;
    const current = new Float32Array(width * height);
    const result = new Float32Array(width * height);
    for (let index = 0; index < current.length; index += 1) current[index] = luminance(data, index * 4);
    if (this.previousFrame) {
      for (let index = 0; index < result.length; index += 1) result[index] = Math.min(1, Math.abs(current[index] - this.previousFrame[index]) * 10);
    }
    this.previousFrame = current;
    return result;
  }

  public getCurvature(): number {
    return -0.8;
  }
}

export class UnifiedSamplingSystem {
  public readonly kernels: Map<KernelName, SamplingKernel> = new Map();
  public weights: KernelWeights;

  public constructor(weights: Partial<KernelWeights> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    this.register(new EagleKernel(this.weights.eagle));
    this.register(new OwlKernel(this.weights.owl));
    this.register(new MantisKernel(this.weights.mantis));
    this.register(new FrogKernel(this.weights.frog));
    this.register(new ViperKernel(this.weights.viper));
    this.register(new DragonflyKernel(this.weights.dragonfly));
  }

  public register(kernel: SamplingKernel): void {
    this.kernels.set(kernel.name, kernel);
  }

  public apply(imageData: ImageFrame): Float32Array {
    const combined = new Float32Array(imageData.width * imageData.height);
    let totalWeight = 0;
    for (const [name, kernel] of this.kernels) {
      if (!kernel.enabled) continue;
      const weight = this.weights[name];
      totalWeight += weight;
      const signal = kernel.apply(imageData);
      for (let index = 0; index < combined.length; index += 1) combined[index] += signal[index] * weight;
    }
    if (totalWeight > 0) for (let index = 0; index < combined.length; index += 1) combined[index] /= totalWeight;
    return combined;
  }

  public updateWeights(signals: KernelSignals): void {
    this.weights = {
      eagle: signals.luminance !== undefined && signals.luminance < 0.3 ? 0.1 : 0.3,
      owl: signals.luminance !== undefined && signals.luminance < 0.3 ? 0.4 : 0.15,
      mantis: signals.colorComplexity !== undefined && signals.colorComplexity > 0.5 ? 0.3 : 0.15,
      frog: signals.motionMagnitude !== undefined && signals.motionMagnitude > 0.2 ? 0.35 : 0.2,
      viper: this.weights.viper,
      dragonfly: signals.motionMagnitude !== undefined && signals.motionMagnitude > 0.2 ? 0.2 : 0.1
    };
  }

  public getCombinedCurvature(): number {
    let curvature = 0;
    let totalWeight = 0;
    for (const [name, kernel] of this.kernels) {
      if (!kernel.enabled) continue;
      const weight = this.weights[name];
      curvature += kernel.getCurvature() * weight;
      totalWeight += weight;
    }
    return totalWeight > 0 ? curvature / totalWeight : 0;
  }
}
