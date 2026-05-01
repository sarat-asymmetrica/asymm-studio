export const PHI = 1.618033988749895;
export const PHI_SQUARED = 2.618033988749895;
export const PHI_RECIPROCAL = 0.618033988749895;
export const SCHUMANN_RESONANCE = 7.93;
export const TESLA_432 = 432;
export const VEDIC_108 = 108;
export const GOLDEN_ANGLE = 137.5077640500378;

export type Vector3 = readonly [number, number, number];
export interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export class Quaternion {
  public readonly w: number;
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  public constructor(w: number = 1, x: number = 0, y: number = 0, z: number = 0) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public norm(): number {
    return Math.hypot(this.w, this.x, this.y, this.z);
  }

  public normalize(): Quaternion {
    const norm: number = this.norm();
    return norm < 1e-10 ? Quaternion.identity() : new Quaternion(this.w / norm, this.x / norm, this.y / norm, this.z / norm);
  }

  public conjugate(): Quaternion {
    return new Quaternion(this.w, -this.x, -this.y, -this.z);
  }

  public multiply(other: Quaternion): Quaternion {
    return new Quaternion(
      this.w * other.w - this.x * other.x - this.y * other.y - this.z * other.z,
      this.w * other.x + this.x * other.w + this.y * other.z - this.z * other.y,
      this.w * other.y - this.x * other.z + this.y * other.w + this.z * other.x,
      this.w * other.z + this.x * other.y - this.y * other.x + this.z * other.w
    );
  }

  public dot(other: Quaternion): number {
    return this.w * other.w + this.x * other.x + this.y * other.y + this.z * other.z;
  }

  public add(other: Quaternion): Quaternion {
    return new Quaternion(this.w + other.w, this.x + other.x, this.y + other.y, this.z + other.z);
  }

  public scale(scalar: number): Quaternion {
    return new Quaternion(this.w * scalar, this.x * scalar, this.y * scalar, this.z * scalar);
  }

  public slerp(other: Quaternion, t: number): Quaternion {
    const clampedT: number = Math.max(0, Math.min(1, t));
    let dot: number = this.dot(other);
    let target: Quaternion = other;

    if (dot < 0) {
      target = new Quaternion(-other.w, -other.x, -other.y, -other.z);
      dot = -dot;
    }

    if (dot > 0.9995) {
      return new Quaternion(
        this.w + clampedT * (target.w - this.w),
        this.x + clampedT * (target.x - this.x),
        this.y + clampedT * (target.y - this.y),
        this.z + clampedT * (target.z - this.z)
      ).normalize();
    }

    const theta: number = Math.acos(Math.max(-1, Math.min(1, dot)));
    const sinTheta: number = Math.sin(theta);
    const scale0: number = Math.sin((1 - clampedT) * theta) / sinTheta;
    const scale1: number = Math.sin(clampedT * theta) / sinTheta;

    return new Quaternion(
      scale0 * this.w + scale1 * target.w,
      scale0 * this.x + scale1 * target.x,
      scale0 * this.y + scale1 * target.y,
      scale0 * this.z + scale1 * target.z
    ).normalize();
  }

  public toAxisAngle(): { readonly axis: Vector3; readonly angle: number } {
    const q: Quaternion = this.normalize();
    const angle: number = 2 * Math.acos(Math.min(1, Math.max(-1, q.w)));
    const s: number = Math.sqrt(1 - q.w * q.w);
    return s < 1e-10 ? { axis: [1, 0, 0], angle: 0 } : { axis: [q.x / s, q.y / s, q.z / s], angle };
  }

  public rotateVector(vector: Vector3): Vector3 {
    const vQuat: Quaternion = new Quaternion(0, vector[0], vector[1], vector[2]);
    const rotated: Quaternion = this.multiply(vQuat).multiply(this.conjugate());
    return [rotated.x, rotated.y, rotated.z];
  }

  public toRGB(): RGB {
    const brightness: number = (this.w + 1) / 2;
    return { r: Math.abs(this.x) * brightness, g: Math.abs(this.y) * brightness, b: Math.abs(this.z) * brightness };
  }

  public toArray(): readonly [number, number, number, number] {
    return [this.w, this.x, this.y, this.z];
  }

  public log(): Quaternion {
    const q: Quaternion = this.normalize();
    const theta: number = Math.acos(Math.min(1, Math.max(-1, q.w)));
    if (theta < 1e-10) return new Quaternion(0, q.x, q.y, q.z);
    const s: number = theta / Math.sin(theta);
    return new Quaternion(0, q.x * s, q.y * s, q.z * s);
  }

  public distanceTo(other: Quaternion): number {
    return 2 * Math.acos(Math.min(1, Math.abs(this.dot(other.normalize()))));
  }

  public toString(): string {
    return `Q(${this.w.toFixed(4)}, ${this.x.toFixed(4)}, ${this.y.toFixed(4)}, ${this.z.toFixed(4)})`;
  }

  public static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const len: number = Math.hypot(axis[0], axis[1], axis[2]);
    if (len < 1e-10) return Quaternion.identity();
    const halfAngle: number = angle / 2;
    const s: number = Math.sin(halfAngle) / len;
    return new Quaternion(Math.cos(halfAngle), axis[0] * s, axis[1] * s, axis[2] * s).normalize();
  }

  public static fromArray(values: readonly [number, number, number, number]): Quaternion {
    return new Quaternion(values[0], values[1], values[2], values[3]);
  }

  public static identity(): Quaternion {
    return new Quaternion(1, 0, 0, 0);
  }

  public static exp(v: Quaternion): Quaternion {
    const theta: number = Math.hypot(v.x, v.y, v.z);
    if (theta < 1e-10) return new Quaternion(1, v.x, v.y, v.z).normalize();
    const s: number = Math.sin(theta) / theta;
    return new Quaternion(Math.cos(theta), v.x * s, v.y * s, v.z * s).normalize();
  }
}

export class QuaternionField {
  public readonly width: number;
  public readonly height: number;
  private readonly data: Quaternion[];

  public constructor(width: number, height: number) {
    this.width = Math.max(0, Math.trunc(width));
    this.height = Math.max(0, Math.trunc(height));
    this.data = Array.from({ length: this.width * this.height }, () => Quaternion.identity());
  }

  public get(x: number, y: number): Quaternion {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return Quaternion.identity();
    return this.data[y * this.width + x] ?? Quaternion.identity();
  }

  public set(x: number, y: number, q: Quaternion): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) this.data[y * this.width + x] = q;
  }

  public rotateAll(rotation: Quaternion): void {
    for (let index = 0; index < this.data.length; index += 1) this.data[index] = rotation.multiply(this.data[index]).normalize();
  }

  public slerpBlend(other: QuaternionField, t: number): QuaternionField {
    const result: QuaternionField = new QuaternionField(this.width, this.height);
    for (let index = 0; index < this.data.length; index += 1) result.data[index] = this.data[index].slerp(other.data[index] ?? Quaternion.identity(), t);
    return result;
  }

  public computeEnergy(): number {
    if (this.data.length === 0) return 0;
    const identity: Quaternion = Quaternion.identity();
    return this.data.reduce((sum: number, q: Quaternion) => sum + q.distanceTo(identity), 0) / this.data.length;
  }

  public toRGBArray(): Float32Array {
    const rgb: Float32Array = new Float32Array(this.width * this.height * 3);
    for (let index = 0; index < this.data.length; index += 1) {
      const color: RGB = this.data[index].toRGB();
      rgb[index * 3] = color.r;
      rgb[index * 3 + 1] = color.g;
      rgb[index * 3 + 2] = color.b;
    }
    return rgb;
  }
}

export interface ThreeRegimeThresholds {
  readonly exploration: number;
  readonly optimization: number;
  readonly stabilization: number;
  readonly spread: number;
}

export class ThreeRegimeTracker {
  public r1: number;
  public r2: number;
  public r3: number;
  public readonly history: Array<{ readonly r1: number; readonly r2: number; readonly r3: number; readonly timestamp: number }> = [];
  private readonly thresholds: ThreeRegimeThresholds;

  public constructor(thresholds: Partial<ThreeRegimeThresholds> = {}) {
    this.thresholds = { exploration: 0.3, optimization: 0.2, stabilization: 0.5, spread: 0.5, ...thresholds };
    this.r1 = this.thresholds.exploration;
    this.r2 = this.thresholds.optimization;
    this.r3 = this.thresholds.stabilization;
  }

  public update(states: readonly number[]): void {
    if (states.length === 0) return;
    const magnitudes: number[] = states.map((state: number) => Math.abs(state));
    const mean: number = magnitudes.reduce((sum: number, state: number) => sum + state, 0) / magnitudes.length;
    const variance: number = magnitudes.reduce((sum: number, state: number) => sum + (state - mean) ** 2, 0) / magnitudes.length;
    const stddev: number = Math.sqrt(variance);
    const thresholdHigh: number = mean + this.thresholds.spread * stddev;
    const thresholdLow: number = mean - this.thresholds.spread * stddev;
    let r1Count = 0;
    let r2Count = 0;
    let r3Count = 0;

    for (const value of magnitudes) {
      if (value > thresholdHigh) r1Count += 1;
      else if (value > thresholdLow) r2Count += 1;
      else r3Count += 1;
    }

    this.r1 = r1Count / magnitudes.length;
    this.r2 = r2Count / magnitudes.length;
    this.r3 = r3Count / magnitudes.length;
    this.history.push({ r1: this.r1, r2: this.r2, r3: this.r3, timestamp: Date.now() });
    if (this.history.length > 100) this.history.shift();
  }

  public isConverged(tolerance: number = 0.1): boolean {
    return Math.abs(this.r1 - this.thresholds.exploration) < tolerance && Math.abs(this.r2 - this.thresholds.optimization) < tolerance && Math.abs(this.r3 - this.thresholds.stabilization) < tolerance;
  }

  public getSingularityRisk(): 'OK' | 'WARNING' | 'EMERGENCY' {
    if (this.r3 < this.thresholds.stabilization) return 'EMERGENCY';
    if (this.r3 < this.thresholds.stabilization + 0.05) return 'WARNING';
    return 'OK';
  }

  public getCoherence(): number {
    const deviation: number = Math.abs(this.r1 - this.thresholds.exploration) + Math.abs(this.r2 - this.thresholds.optimization) + Math.abs(this.r3 - this.thresholds.stabilization);
    return Math.max(0, Math.min(1, 1 - deviation));
  }
}
