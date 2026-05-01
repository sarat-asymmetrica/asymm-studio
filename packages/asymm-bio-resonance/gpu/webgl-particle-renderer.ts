import { GOLDEN_ANGLE, PHI, Quaternion, QuaternionField } from '../math/index.js';

export interface ParticleRendererConfig {
  readonly particleCount: number;
  readonly maxParticleCount: number;
  readonly baseSize: number;
  readonly bloomEnabled: boolean;
}

export interface FramebufferResource {
  readonly framebuffer: unknown;
  readonly texture: unknown;
  readonly width: number;
  readonly height: number;
}

export interface MinimalGL {
  createFramebuffer(): unknown;
  createTexture(): unknown;
  deleteFramebuffer(framebuffer: unknown): void;
  deleteTexture(texture: unknown): void;
}

export class WebGLParticleRenderer {
  public readonly config: ParticleRendererConfig;
  public readonly positions: Float32Array;
  public readonly quaternions: Float32Array;
  public readonly ages: Float32Array;
  public readonly sizes: Float32Array;
  public readonly velocities: Float32Array;
  public bloomFramebuffers: FramebufferResource[] = [];
  public sceneFramebuffer: FramebufferResource | null = null;
  public time = 0;
  public coherence = 0;
  public initialized = false;

  public constructor(private readonly gl: MinimalGL | null, config: Partial<ParticleRendererConfig> = {}) {
    this.config = { particleCount: 5000, maxParticleCount: 10000, baseSize: 3, bloomEnabled: true, ...config };
    const count = this.config.maxParticleCount;
    this.positions = new Float32Array(count * 2);
    this.quaternions = new Float32Array(count * 4);
    this.ages = new Float32Array(count);
    this.sizes = new Float32Array(count);
    this.velocities = new Float32Array(count * 2);
    this.initializeParticles();
  }

  public initialize(width: number = 1, height: number = 1): boolean {
    if (!this.gl) return false;
    this.initialized = true;
    if (this.config.bloomEnabled) this.createBloomFramebuffers(width, height);
    return true;
  }

  public update(quaternionField: QuaternionField, dt: number, signals: { readonly coherence?: { readonly coherence: number } } = {}): void {
    this.time += dt;
    this.coherence = signals.coherence?.coherence ?? 0;
    for (let index = 0; index < this.config.particleCount; index += 1) {
      const px = this.positions[index * 2] ?? 0;
      const py = this.positions[index * 2 + 1] ?? 0;
      const fieldX = Math.max(0, Math.min(quaternionField.width - 1, Math.floor(px * quaternionField.width)));
      const fieldY = Math.max(0, Math.min(quaternionField.height - 1, Math.floor(py * quaternionField.height)));
      const current = new Quaternion(this.quaternions[index * 4] ?? 1, this.quaternions[index * 4 + 1] ?? 0, this.quaternions[index * 4 + 2] ?? 0, this.quaternions[index * 4 + 3] ?? 0).normalize();
      const target = quaternionField.get(fieldX, fieldY);
      const next = current.slerp(target, 0.1);
      this.quaternions[index * 4] = next.w;
      this.quaternions[index * 4 + 1] = next.x;
      this.quaternions[index * 4 + 2] = next.y;
      this.quaternions[index * 4 + 3] = next.z;
      this.velocities[index * 2] = ((this.velocities[index * 2] ?? 0) + next.x * 0.0001) * 0.98;
      this.velocities[index * 2 + 1] = ((this.velocities[index * 2 + 1] ?? 0) + next.y * 0.0001) * 0.98;
      this.positions[index * 2] = wrap01(px + (this.velocities[index * 2] ?? 0));
      this.positions[index * 2 + 1] = wrap01(py + (this.velocities[index * 2 + 1] ?? 0));
      this.ages[index] = ((this.ages[index] ?? 0) + dt * 0.1) % 1;
    }
  }

  public resize(width: number, height: number): void {
    this.deleteFramebuffers();
    if (this.config.bloomEnabled) this.createBloomFramebuffers(width, height);
  }

  public destroy(): void {
    this.deleteFramebuffers();
    this.initialized = false;
  }

  private initializeParticles(): void {
    const goldenAngleRad = (GOLDEN_ANGLE * Math.PI) / 180;
    for (let index = 0; index < this.config.particleCount; index += 1) {
      const t = index / Math.max(1, this.config.particleCount);
      const radius = Math.sqrt(t) * 0.4 + 0.1;
      const angle = index * goldenAngleRad;
      this.positions[index * 2] = 0.5 + radius * Math.cos(angle);
      this.positions[index * 2 + 1] = 0.5 + radius * Math.sin(angle);
      this.quaternions[index * 4] = 1;
      this.quaternions[index * 4 + 1] = Math.sin(index * PHI) * 0.05;
      this.quaternions[index * 4 + 2] = Math.cos(index * PHI) * 0.05;
      this.quaternions[index * 4 + 3] = 0;
      this.sizes[index] = this.config.baseSize;
    }
  }

  private createFramebuffer(width: number, height: number): FramebufferResource {
    if (!this.gl) return { framebuffer: null, texture: null, width, height };
    return { framebuffer: this.gl.createFramebuffer(), texture: this.gl.createTexture(), width, height };
  }

  private createBloomFramebuffers(width: number, height: number): void {
    this.sceneFramebuffer = this.createFramebuffer(width, height);
    this.bloomFramebuffers = [this.createFramebuffer(width / 2, height / 2), this.createFramebuffer(width / 2, height / 2)];
  }

  private deleteFramebuffers(): void {
    if (!this.gl) return;
    const resources = this.sceneFramebuffer ? [this.sceneFramebuffer, ...this.bloomFramebuffers] : [...this.bloomFramebuffers];
    for (const resource of resources) {
      if (resource.framebuffer) this.gl.deleteFramebuffer(resource.framebuffer);
      if (resource.texture) this.gl.deleteTexture(resource.texture);
    }
    this.sceneFramebuffer = null;
    this.bloomFramebuffers = [];
  }
}

function wrap01(value: number): number {
  if (value < 0) return value + 1;
  if (value > 1) return value - 1;
  return value;
}

export function createParticleRenderer(gl: MinimalGL | null, config: Partial<ParticleRendererConfig> = {}): WebGLParticleRenderer | null {
  const renderer = new WebGLParticleRenderer(gl, config);
  return renderer.initialize() ? renderer : null;
}
