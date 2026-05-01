import { SCHUMANN_RESONANCE, ThreeRegimeTracker } from '../math/quaternion.js';
import type { ImageFrame } from '../math/biomimetic-kernels.js';

export interface Landmark {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
}

export interface PPGConfig {
  readonly sampleRate: number;
  readonly bufferSeconds: number;
  readonly lowCutoff: number;
  readonly highCutoff: number;
  readonly minBpm: number;
  readonly maxBpm: number;
  readonly confidenceThreshold: number;
}

export interface PPGReading {
  readonly bpm: number | null;
  readonly variance: number;
  readonly confidence: number;
}

export interface FlowReading {
  readonly magnitude: number;
  readonly direction: number;
  readonly breathSignal: number;
}

export interface HumReading {
  readonly frequency: number;
  readonly amplitude: number;
  readonly isHumming: boolean;
  readonly resonanceMatch: number;
}

export interface CoherenceReading {
  readonly coherence: number;
  readonly stableTime: number;
  readonly regimes: {
    readonly r1: number;
    readonly r2: number;
    readonly r3: number;
  };
  readonly singularityRisk: 'OK' | 'WARNING' | 'EMERGENCY';
  readonly isUnlockReady: boolean;
}

export interface ExtractedSignals {
  ppg: PPGReading | null;
  flow: FlowReading | null;
  hum: HumReading | null;
  coherence: CoherenceReading | null;
  luminance: number;
  colorComplexity: number;
  motionMagnitude: number;
  faceDetected: boolean;
}

const DEFAULT_PPG_CONFIG: PPGConfig = {
  sampleRate: 30,
  bufferSeconds: 4,
  lowCutoff: 0.7,
  highCutoff: 4,
  minBpm: 40,
  maxBpm: 200,
  confidenceThreshold: 0.7
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function percentile(values: readonly number[], quantile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((left: number, right: number) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * quantile)))] ?? 0;
}

export class PPGExtractor {
  private readonly config: PPGConfig;
  private readonly bufferSize: number;
  private readonly buffer: number[] = [];
  public reading: PPGReading = { bpm: null, variance: 0, confidence: 0 };

  public constructor(config: Partial<PPGConfig> = {}) {
    this.config = { ...DEFAULT_PPG_CONFIG, ...config };
    this.bufferSize = Math.max(4, Math.round(this.config.sampleRate * this.config.bufferSeconds));
  }

  public update(imageData: ImageFrame, landmarks: readonly Landmark[] | null = null): PPGReading {
    const { width, height, data } = imageData;
    if (width <= 0 || height <= 0) return this.reading;
    const roi = this.resolveRoi(width, height, landmarks);
    let greenSum = 0;
    let count = 0;
    for (let y = roi.y; y < roi.y + roi.height; y += 1) {
      for (let x = roi.x; x < roi.x + roi.width; x += 1) {
        greenSum += data[(y * width + x) * 4 + 1] ?? 0;
        count += 1;
      }
    }
    if (count > 0) this.addSample(greenSum / count);
    this.reading = this.process();
    return this.reading;
  }

  public addSample(greenAverage: number): void {
    this.buffer.push(greenAverage);
    if (this.buffer.length > this.bufferSize) this.buffer.shift();
  }

  public process(): PPGReading {
    if (this.buffer.length < this.bufferSize * 0.5) return { bpm: null, variance: 0, confidence: 0 };
    const filtered = this.bandpassFilter(this.detrend(this.buffer));
    const peaks = this.findPeaks(filtered);
    if (peaks.length < 2) return { bpm: null, variance: 0, confidence: 0 };
    const intervals = peaks.slice(1).map((peak: number, index: number) => peak - peaks[index]);
    const avgInterval = intervals.reduce((sum: number, interval: number) => sum + interval, 0) / intervals.length;
    const bpm = (this.config.sampleRate / avgInterval) * 60;
    if (bpm < this.config.minBpm || bpm > this.config.maxBpm) return { bpm: null, variance: 0, confidence: 0 };
    const avgMs = avgInterval * (1000 / this.config.sampleRate);
    const variance = Math.sqrt(intervals.reduce((sum: number, interval: number) => {
      const ms = interval * (1000 / this.config.sampleRate);
      return sum + (ms - avgMs) ** 2;
    }, 0) / intervals.length);
    const amplitude = percentile(filtered.map((value: number) => Math.abs(value)), 0.9);
    const confidence = clamp01((1 - (variance / Math.max(1, avgMs)) * 2) * clamp01(amplitude / 0.8));
    return { bpm: confidence > this.config.confidenceThreshold ? bpm : null, variance, confidence };
  }

  private resolveRoi(width: number, height: number, landmarks: readonly Landmark[] | null): { readonly x: number; readonly y: number; readonly width: number; readonly height: number } {
    const left = landmarks?.[103];
    const right = landmarks?.[332];
    const top = landmarks?.[10];
    const bottom = landmarks?.[151];
    if (left && right && top && bottom) {
      const minX = Math.max(0, Math.min(left.x, right.x, top.x, bottom.x) * width);
      const maxX = Math.min(width, Math.max(left.x, right.x, top.x, bottom.x) * width);
      const minY = Math.max(0, Math.min(left.y, right.y, top.y, bottom.y) * height);
      const maxY = Math.min(height, Math.max(left.y, right.y, top.y, bottom.y) * height);
      return { x: Math.floor(minX), y: Math.floor(minY), width: Math.max(1, Math.floor(maxX - minX)), height: Math.max(1, Math.floor(maxY - minY)) };
    }
    return { x: Math.floor(width * 0.4), y: Math.floor(height * 0.1), width: Math.max(1, Math.floor(width * 0.2)), height: Math.max(1, Math.floor(height * 0.15)) };
  }

  private detrend(signal: readonly number[]): number[] {
    const n = signal.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    for (let index = 0; index < n; index += 1) {
      sumX += index;
      sumY += signal[index] ?? 0;
      sumXY += index * (signal[index] ?? 0);
      sumXX += index * index;
    }
    const denominator = n * sumXX - sumX * sumX;
    if (Math.abs(denominator) < 1e-9) return signal.map(() => 0);
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    return signal.map((value: number, index: number) => value - (slope * index + intercept));
  }

  private bandpassFilter(signal: readonly number[]): number[] {
    const highPassWindow = Math.max(3, Math.round(this.config.sampleRate / this.config.lowCutoff));
    const lowPassWindow = Math.max(5, Math.round(this.config.sampleRate / this.config.highCutoff) * 2 + 1);
    const highPassed = this.subtractMovingAverage(signal, highPassWindow);
    return this.firSmooth(highPassed, lowPassWindow);
  }

  private firSmooth(signal: readonly number[], window: number): number[] {
    const half = Math.floor(window / 2);
    return signal.map((_value: number, index: number) => {
      let sum = 0;
      let weightSum = 0;
      for (let offset = -half; offset <= half; offset += 1) {
        const sample = signal[index + offset];
        if (sample === undefined) continue;
        const weight = half + 1 - Math.abs(offset);
        sum += sample * weight;
        weightSum += weight;
      }
      return weightSum > 0 ? sum / weightSum : 0;
    });
  }

  private subtractMovingAverage(signal: readonly number[], window: number): number[] {
    const smoothed = this.firSmooth(signal, window);
    return signal.map((value: number, index: number) => value - (smoothed[index] ?? 0));
  }

  private findPeaks(signal: readonly number[]): number[] {
    const threshold = percentile(signal, 0.7);
    const peaks: number[] = [];
    for (let index = 2; index < signal.length - 2; index += 1) {
      const value = signal[index] ?? 0;
      if (value > threshold && value > (signal[index - 1] ?? 0) && value > (signal[index + 1] ?? 0) && value > (signal[index - 2] ?? 0) && value > (signal[index + 2] ?? 0)) peaks.push(index);
    }
    return peaks;
  }
}

export class OpticalFlowExtractor {
  private readonly gridSize: number;
  private previousFrame: Float32Array | null = null;
  private readonly breathPattern: number[] = [];

  public constructor(gridSize: number = 8) {
    this.gridSize = Math.max(1, gridSize);
  }

  public compute(luminance: Float32Array, width: number, height: number): FlowReading {
    if (!this.previousFrame) {
      this.previousFrame = luminance.slice();
      return { magnitude: 0, direction: 0, breathSignal: 0 };
    }
    let totalX = 0;
    let totalY = 0;
    let count = 0;
    const cellW = Math.max(1, Math.floor(width / this.gridSize));
    const cellH = Math.max(1, Math.floor(height / this.gridSize));
    for (let gy = 0; gy < this.gridSize; gy += 1) {
      for (let gx = 0; gx < this.gridSize; gx += 1) {
        for (let y = gy * cellH + 1; y < Math.min((gy + 1) * cellH - 1, height - 1); y += 1) {
          for (let x = gx * cellW + 1; x < Math.min((gx + 1) * cellW - 1, width - 1); x += 1) {
            const idx = y * width + x;
            const ix = ((luminance[idx + 1] ?? 0) - (luminance[idx - 1] ?? 0)) / 2;
            const iy = ((luminance[idx + width] ?? 0) - (luminance[idx - width] ?? 0)) / 2;
            const it = (luminance[idx] ?? 0) - (this.previousFrame[idx] ?? 0);
            const denominator = ix * ix + iy * iy + 0.001;
            totalX -= (ix * it) / denominator;
            totalY -= (iy * it) / denominator;
            count += 1;
          }
        }
      }
    }
    const flowX = count > 0 ? totalX / count : 0;
    const flowY = count > 0 ? totalY / count : 0;
    this.breathPattern.push(flowY);
    if (this.breathPattern.length > 90) this.breathPattern.shift();
    this.previousFrame = luminance.slice();
    return { magnitude: Math.hypot(flowX, flowY), direction: Math.atan2(flowY, flowX), breathSignal: this.detectBreathCycle() };
  }

  private detectBreathCycle(): number {
    if (this.breathPattern.length < 30) return 0;
    let zeroCrossings = 0;
    for (let index = 1; index < this.breathPattern.length; index += 1) {
      if (((this.breathPattern[index] ?? 0) > 0) !== ((this.breathPattern[index - 1] ?? 0) > 0)) zeroCrossings += 1;
    }
    const breathRate = zeroCrossings / 2;
    return breathRate > 0.5 && breathRate < 3 ? 1 : 0;
  }
}

export class HumDetector {
  private readonly sampleRate: number;
  private readonly fftSize: number;
  private readonly targetFrequencies: readonly number[];

  public constructor(sampleRate: number = 44100, fftSize: number = 2048, targetFrequencies: readonly number[] = [SCHUMANN_RESONANCE, 14.3, 20.8, 27.3, 33.8]) {
    this.sampleRate = sampleRate;
    this.fftSize = fftSize;
    this.targetFrequencies = targetFrequencies;
  }

  public analyze(audioData: Float32Array): HumReading {
    if (audioData.length < this.fftSize) return { frequency: 0, amplitude: 0, isHumming: false, resonanceMatch: 0 };
    let maxMagnitude = 0;
    let maxIndex = 0;
    for (let k = 1; k < this.fftSize / 2; k += 1) {
      let real = 0;
      let imag = 0;
      for (let n = 0; n < this.fftSize; n += 1) {
        const angle = (-2 * Math.PI * k * n) / this.fftSize;
        const sample = audioData[n] ?? 0;
        real += sample * Math.cos(angle);
        imag += sample * Math.sin(angle);
      }
      const magnitude = Math.hypot(real, imag);
      if (magnitude > maxMagnitude) {
        maxMagnitude = magnitude;
        maxIndex = k;
      }
    }
    const frequency = (maxIndex * this.sampleRate) / this.fftSize;
    const amplitude = maxMagnitude / this.fftSize;
    const isHumming = amplitude > 0.01 && frequency > 50 && frequency < 500;
    return { frequency, amplitude, isHumming, resonanceMatch: this.getResonanceMatch(frequency, isHumming) };
  }

  private getResonanceMatch(frequency: number, isHumming: boolean): number {
    if (!isHumming) return 0;
    let best = 0;
    for (const target of this.targetFrequencies) {
      for (let harmonic = 1; harmonic <= 8; harmonic += 1) best = Math.max(best, Math.exp(-(Math.abs(frequency - target * harmonic) ** 2) / 100));
    }
    return best;
  }
}

export class CoherenceCalculator {
  private readonly regimeTracker: ThreeRegimeTracker;
  private readonly history: Array<{ readonly coherence: number; readonly timestamp: number }> = [];
  private stableTime = 0;
  private lastUpdate = Date.now();

  public constructor(regimeTracker: ThreeRegimeTracker = new ThreeRegimeTracker()) {
    this.regimeTracker = regimeTracker;
  }

  public update(signals: ExtractedSignals): CoherenceReading {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;
    const values: number[] = [];
    if (signals.ppg && signals.ppg.confidence > 0.3) {
      values.push((signals.ppg.bpm ?? 0) / 100, signals.ppg.variance / 50);
    }
    if (signals.flow) values.push(signals.flow.magnitude, signals.flow.breathSignal);
    if (signals.hum?.isHumming) values.push(signals.hum.resonanceMatch);
    if (values.length > 0) this.regimeTracker.update(values);
    const ppgScore = signals.ppg ? signals.ppg.confidence * 0.25 : 0;
    const stillness = signals.flow ? Math.max(0, 1 - signals.flow.magnitude * 3) : 0.6;
    const face = signals.faceDetected ? 0.7 : 0.5;
    const hum = signals.hum?.isHumming ? signals.hum.resonanceMatch * 0.1 : 0;
    const coherence = clamp01((ppgScore + this.regimeTracker.getCoherence() * 0.25 + stillness * 0.3 + face * 0.2 + hum) / (signals.hum?.isHumming ? 1.1 : 1));
    this.stableTime = coherence > 0.5 ? this.stableTime + dt : Math.max(0, this.stableTime - dt * 2);
    this.history.push({ coherence, timestamp: now });
    if (this.history.length > 300) this.history.shift();
    return { coherence, stableTime: this.stableTime, regimes: { r1: this.regimeTracker.r1, r2: this.regimeTracker.r2, r3: this.regimeTracker.r3 }, singularityRisk: this.regimeTracker.getSingularityRisk(), isUnlockReady: this.stableTime >= 1.5 && coherence > 0.5 };
  }

  public getTrend(): 'unknown' | 'rising' | 'falling' | 'stable' {
    if (this.history.length < 60) return 'unknown';
    const recent = this.history.slice(-30);
    const older = this.history.slice(-60, -30);
    const recentAvg = recent.reduce((sum: number, item) => sum + item.coherence, 0) / recent.length;
    const olderAvg = older.reduce((sum: number, item) => sum + item.coherence, 0) / older.length;
    const diff = recentAvg - olderAvg;
    if (diff > 0.05) return 'rising';
    if (diff < -0.05) return 'falling';
    return 'stable';
  }
}

export class UnifiedSignalExtractor {
  public readonly ppg: PPGExtractor;
  public readonly flow: OpticalFlowExtractor;
  public readonly hum: HumDetector;
  public readonly coherence: CoherenceCalculator;
  public signals: ExtractedSignals = { ppg: null, flow: null, hum: null, coherence: null, luminance: 0, colorComplexity: 0, motionMagnitude: 0, faceDetected: false };

  public constructor(ppgConfig: Partial<PPGConfig> = {}) {
    this.ppg = new PPGExtractor(ppgConfig);
    this.flow = new OpticalFlowExtractor();
    this.hum = new HumDetector();
    this.coherence = new CoherenceCalculator();
  }

  public extract(imageData: ImageFrame, landmarks: readonly Landmark[] | null = null, audioData: Float32Array | null = null): ExtractedSignals {
    const { width, height, data } = imageData;
    const luminance = new Float32Array(width * height);
    let lumSum = 0;
    let rSum = 0;
    let gSum = 0;
    let bSum = 0;
    for (let index = 0; index < width * height; index += 1) {
      const idx = index * 4;
      const r = (data[idx] ?? 0) / 255;
      const g = (data[idx + 1] ?? 0) / 255;
      const b = (data[idx + 2] ?? 0) / 255;
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      luminance[index] = lum;
      lumSum += lum;
      rSum += r;
      gSum += g;
      bSum += b;
    }
    const pixelCount = Math.max(1, width * height);
    const flow = this.flow.compute(luminance, width, height);
    const rAvg = rSum / pixelCount;
    const gAvg = gSum / pixelCount;
    const bAvg = bSum / pixelCount;
    this.signals = {
      ppg: this.ppg.update(imageData, landmarks),
      flow,
      hum: audioData ? this.hum.analyze(audioData) : this.signals.hum,
      coherence: null,
      luminance: lumSum / pixelCount,
      colorComplexity: Math.abs(rAvg - gAvg) + Math.abs(gAvg - bAvg) + Math.abs(bAvg - rAvg),
      motionMagnitude: flow.magnitude,
      faceDetected: landmarks !== null && landmarks.length > 0
    };
    this.signals.coherence = this.coherence.update(this.signals);
    return this.signals;
  }

  public getPresenceVector(): readonly number[] {
    return [this.signals.ppg?.bpm ?? 0, this.signals.ppg?.variance ?? 0, this.signals.luminance, this.signals.colorComplexity, this.signals.flow?.magnitude ?? 0, this.signals.hum?.frequency ?? 0, this.signals.coherence?.coherence ?? 0];
  }
}
