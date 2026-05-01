import { Quaternion, QuaternionField } from '../math/index.js';

export interface GPUBridgeConfig {
  readonly backendUrl: string;
  readonly timeout: number;
  readonly retryCount: number;
  readonly retryDelay: number;
  readonly circuitFailureCount: number;
  readonly circuitWindowMs: number;
  readonly circuitCooldownMs: number;
  readonly healthCheckIntervalMs: number;
}

export type FetchLike = (input: string, init?: RequestInit) => Promise<{ readonly ok: boolean; readonly status: number; readonly statusText: string; json(): Promise<unknown> }>;

export class GPUBridge {
  public readonly config: GPUBridgeConfig;
  public isConnected = false;
  public lastHealthCheck = 0;
  public requestCount = 0;
  public avgLatency = 0;
  private totalLatency = 0;
  private readonly failures: number[] = [];
  private circuitOpenUntil = 0;

  public constructor(config: Partial<GPUBridgeConfig> = {}, private readonly fetchImpl: FetchLike = fetch) {
    this.config = { backendUrl: 'http://localhost:9999', timeout: 5000, retryCount: 3, retryDelay: 1000, circuitFailureCount: 3, circuitWindowMs: 30000, circuitCooldownMs: 60000, healthCheckIntervalMs: 10000, ...config };
  }

  public isCircuitOpen(now: number = Date.now()): boolean {
    return now < this.circuitOpenUntil;
  }

  public async initialize(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      this.isConnected = readStatus(health) === 'healthy';
      return this.isConnected;
    } catch {
      this.isConnected = false;
      return false;
    }
  }

  public async healthCheck(): Promise<unknown> {
    const response = await this.fetch('/health');
    this.lastHealthCheck = Date.now();
    return response;
  }

  public async periodicHealthCheck(now: number = Date.now()): Promise<boolean> {
    if (now - this.lastHealthCheck < this.config.healthCheckIntervalMs) return this.isConnected;
    return this.initialize();
  }

  public async fetch(endpoint: string, options: RequestInit = {}): Promise<unknown> {
    const now = Date.now();
    if (this.isCircuitOpen(now)) throw new Error('GPU bridge circuit breaker is open.');
    const url = `${this.config.backendUrl}${endpoint}`;
    const start = performance.now();
    for (let attempt = 0; attempt < this.config.retryCount; attempt += 1) {
      try {
        const response = await this.fetchImpl(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        const latency = performance.now() - start;
        this.requestCount += 1;
        this.totalLatency += latency;
        this.avgLatency = this.totalLatency / this.requestCount;
        return data;
      } catch (error: unknown) {
        this.recordFailure();
        if (attempt === this.config.retryCount - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
      }
    }
    throw new Error('GPU bridge request failed.');
  }

  public async evolveQuaternionField(field: QuaternionField, dt: number, signals: { readonly coherence?: { readonly coherence: number }; readonly ppg?: { readonly bpm: number | null }; readonly flow?: { readonly magnitude: number } } = {}): Promise<QuaternionField | null> {
    if (!this.isConnected) return null;
    try {
      const flat: number[] = [];
      for (let y = 0; y < field.height; y += 1) for (let x = 0; x < field.width; x += 1) flat.push(...field.get(x, y).toArray());
      const response = await this.fetch('/quaternion/evolve', { method: 'POST', body: JSON.stringify({ field: flat, width: field.width, height: field.height, dt, signals: { coherence: signals.coherence?.coherence ?? 0, heartRate: signals.ppg?.bpm ?? 0, motion: signals.flow?.magnitude ?? 0 } }) });
      if (!isFieldResponse(response)) return null;
      const evolved = new QuaternionField(field.width, field.height);
      for (let index = 0; index < response.field.length; index += 4) evolved.set((index / 4) % field.width, Math.floor(index / 4 / field.width), new Quaternion(response.field[index], response.field[index + 1], response.field[index + 2], response.field[index + 3]).normalize());
      return evolved;
    } catch {
      return null;
    }
  }

  private recordFailure(now: number = Date.now()): void {
    this.failures.push(now);
    while (this.failures.length > 0 && now - (this.failures[0] ?? now) > this.config.circuitWindowMs) this.failures.shift();
    if (this.failures.length >= this.config.circuitFailureCount) this.circuitOpenUntil = now + this.config.circuitCooldownMs;
  }
}

function readStatus(value: unknown): string | null {
  return typeof value === 'object' && value !== null && 'status' in value ? String((value as { status: unknown }).status) : null;
}

function isFieldResponse(value: unknown): value is { readonly field: number[] } {
  return typeof value === 'object' && value !== null && Array.isArray((value as { field?: unknown }).field);
}

let bridgeInstance: GPUBridge | null = null;

export function getGPUBridge(config: Partial<GPUBridgeConfig> = {}): GPUBridge {
  bridgeInstance ??= new GPUBridge(config);
  return bridgeInstance;
}

export async function initializeGPUBridge(config: Partial<GPUBridgeConfig> = {}): Promise<GPUBridge> {
  const bridge = getGPUBridge(config);
  await bridge.initialize();
  return bridge;
}
