import { PHI, Quaternion, QuaternionField, SCHUMANN_RESONANCE } from './quaternion.js';

export interface TissueSignals {
  readonly luminanceGradient?: Float32Array;
  readonly opticalFlow?: number;
  readonly coherence?: number;
  readonly heartRate?: number;
  readonly humFrequency?: number;
  readonly humAmplitude?: number;
}

export interface GestureForcing {
  readonly force?: number;
}

function clampPhi(value: number): number {
  return Math.max(-2, Math.min(2, value));
}

export class PDETissue {
  public readonly name: string;
  public readonly width: number;
  public readonly height: number;
  public field: Float32Array;
  protected fieldPrev: Float32Array;
  public diffusionCoeff: number = 0.1;
  public reactionStrength: number = 1;
  public enabled: boolean = true;
  public dx: number = 1;

  public constructor(name: string, width: number, height: number) {
    this.name = name;
    this.width = Math.max(0, Math.trunc(width));
    this.height = Math.max(0, Math.trunc(height));
    this.field = new Float32Array(this.width * this.height);
    this.fieldPrev = new Float32Array(this.width * this.height);
  }

  public get(x: number, y: number): number {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
    return this.field[y * this.width + x] ?? 0;
  }

  public set(x: number, y: number, value: number): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) this.field[y * this.width + x] = clampPhi(value);
  }

  public laplacian(x: number, y: number): number {
    return this.get(x - 1, y) + this.get(x + 1, y) + this.get(x, y - 1) + this.get(x, y + 1) - 4 * this.get(x, y);
  }

  public reaction(_x: number, _y: number, _value: number): number {
    return 0;
  }

  public forcing(_x: number, _y: number, _signals: TissueSignals, _gestures: GestureForcing): number {
    return 0;
  }

  public assertStableDt(dt: number): void {
    const maxDt: number = (this.dx * this.dx) / (4 * Math.max(this.diffusionCoeff, 1e-12));
    if (dt > maxDt) throw new Error(`CFL stability violation for ${this.name}: dt=${dt} exceeds ${maxDt}.`);
  }

  public step(dt: number, signals: TissueSignals = {}, gestures: GestureForcing = {}): void {
    if (!this.enabled) return;
    this.assertStableDt(dt);
    [this.field, this.fieldPrev] = [this.fieldPrev, this.field];
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const idx = y * this.width + x;
        const value = this.fieldPrev[idx] ?? 0;
        const diffusion = this.diffusionCoeff * this.laplacianPrev(x, y);
        const reaction = this.reactionStrength * this.reaction(x, y, value);
        this.field[idx] = clampPhi(value + dt * (diffusion + reaction + this.forcing(x, y, signals, gestures)));
      }
    }
  }

  protected laplacianPrev(x: number, y: number): number {
    const get = (px: number, py: number): number => (px < 0 || px >= this.width || py < 0 || py >= this.height ? 0 : this.fieldPrev[py * this.width + px] ?? 0);
    return get(x - 1, y) + get(x + 1, y) + get(x, y - 1) + get(x, y + 1) - 4 * get(x, y);
  }

  public getEnergy(): number {
    if (this.field.length === 0) return 0;
    let energy = 0;
    for (const value of this.field) energy += value * value;
    return Math.sqrt(energy / this.field.length);
  }
}

export class VisionSurfaceTissue extends PDETissue {
  public edgeThreshold: number = 0.1;

  public constructor(width: number, height: number) {
    super('VisionSurface', width, height);
    this.diffusionCoeff = 0.05;
    this.reactionStrength = 0.8;
  }

  public override reaction(_x: number, _y: number, value: number): number {
    return value * (1 - value) * (value - this.edgeThreshold);
  }

  public override forcing(x: number, y: number, signals: TissueSignals): number {
    let force = 0;
    if (signals.luminanceGradient) {
      const gradIdx = Math.floor((y / Math.max(1, this.height)) * signals.luminanceGradient.length);
      force += (signals.luminanceGradient[gradIdx] ?? 0) * 0.1;
    }
    if (signals.opticalFlow) force += signals.opticalFlow * 0.2;
    return force;
  }

  public initFromLuminance(luminanceArray: Float32Array, imgWidth: number, imgHeight: number): void {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const srcX = Math.floor((x * imgWidth) / Math.max(1, this.width));
        const srcY = Math.floor((y * imgHeight) / Math.max(1, this.height));
        this.set(x, y, luminanceArray[srcY * imgWidth + srcX] ?? 0);
      }
    }
  }
}

export class PhiOrganismTissue extends PDETissue {
  public coherenceTarget: number = 0.65;

  public constructor(width: number, height: number) {
    super('PhiOrganism', width, height);
    this.diffusionCoeff = 0.02;
    this.reactionStrength = 1;
  }

  public override reaction(_x: number, _y: number, value: number): number {
    return value * value * PHI - value * 0.1;
  }

  public override forcing(x: number, y: number, signals: TissueSignals, gestures: GestureForcing): number {
    let force = signals.coherence !== undefined ? (this.coherenceTarget - signals.coherence) * 0.05 : 0;
    if (signals.heartRate && signals.heartRate > 0) force += Math.sin((Date.now() / 1000) * (signals.heartRate / 60) * 2 * Math.PI) * 0.02;
    if (gestures.force) force += gestures.force * Math.exp(-Math.hypot(x / Math.max(1, this.width) - 0.5, y / Math.max(1, this.height) - 0.5) * 5) * 0.1;
    return force;
  }

  public getCoherence(): number {
    if (this.field.length === 0) return 0;
    let sum = 0;
    let sumSq = 0;
    for (const value of this.field) {
      sum += value;
      sumSq += value * value;
    }
    const mean = sum / this.field.length;
    const variance = sumSq / this.field.length - mean * mean;
    return Math.max(0, Math.min(1, 1 - Math.sqrt(Math.max(0, variance)) * 2));
  }
}

export class ResonanceTissue extends PDETissue {
  public readonly baseFrequency: number = SCHUMANN_RESONANCE;
  public readonly harmonics: readonly number[] = [1, 2, 3, 5, 8];

  public constructor(width: number, height: number) {
    super('Resonance', width, height);
    this.diffusionCoeff = 0.08;
    this.reactionStrength = 0.5;
  }

  public override reaction(_x: number, _y: number, value: number): number {
    return -value * 0.05;
  }

  public override forcing(x: number, y: number, signals: TissueSignals): number {
    if (!signals.humFrequency || !signals.humAmplitude) return 0;
    const t = Date.now() / 1000;
    let force = 0;
    for (const harmonic of this.harmonics) force += Math.sin(t * signals.humFrequency * harmonic * 2 * Math.PI) * signals.humAmplitude / harmonic;
    const spatialPhase = (x / Math.max(1, this.width) + y / Math.max(1, this.height)) * Math.PI * 2;
    return force * 0.1 * (1 + 0.5 * Math.sin(spatialPhase));
  }
}

export class PDETissueRegistry {
  public readonly width: number;
  public readonly height: number;
  public readonly tissues: Map<string, PDETissue> = new Map();

  public constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.register('vision', new VisionSurfaceTissue(width, height));
    this.register('phi', new PhiOrganismTissue(width, height));
    this.register('resonance', new ResonanceTissue(width, height));
  }

  public register(name: string, tissue: PDETissue): void {
    this.tissues.set(name, tissue);
  }

  public get(name: string): PDETissue | undefined {
    return this.tissues.get(name);
  }

  public stepAll(dt: number, signals: TissueSignals = {}, gestures: GestureForcing = {}): void {
    for (const tissue of this.tissues.values()) tissue.step(dt, signals, gestures);
  }

  public getCombinedField(weights: Readonly<Record<string, number>> = {}): Float32Array {
    const combined = new Float32Array(this.width * this.height);
    let totalWeight = 0;
    for (const [name, tissue] of this.tissues) {
      const weight = weights[name] ?? 1;
      totalWeight += weight;
      for (let index = 0; index < combined.length; index += 1) combined[index] += (tissue.field[index] ?? 0) * weight;
    }
    if (totalWeight > 0) for (let index = 0; index < combined.length; index += 1) combined[index] /= totalWeight;
    return combined;
  }

  public getTotalEnergy(): number {
    let energy = 0;
    for (const tissue of this.tissues.values()) energy += tissue.getEnergy();
    return energy;
  }

  public toQuaternionField(): QuaternionField {
    const qField = new QuaternionField(this.width, this.height);
    const combined = this.getCombinedField();
    const phi = this.get('phi');
    const resonance = this.get('resonance');
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        const idx = y * this.width + x;
        const p = phi?.field[idx] ?? 0;
        const r = resonance?.field[idx] ?? 0;
        qField.set(x, y, Quaternion.fromAxisAngle([Math.cos(p * Math.PI), Math.sin(p * Math.PI), r], (combined[idx] ?? 0) * Math.PI));
      }
    }
    return qField;
  }
}
