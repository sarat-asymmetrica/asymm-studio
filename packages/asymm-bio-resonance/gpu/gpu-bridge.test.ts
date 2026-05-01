import { describe, expect, it } from 'vitest';

import { GPUBridge, type FetchLike } from './gpu-bridge.js';

describe('GPUBridge', () => {
  it('opens the circuit after repeated failures', async () => {
    const failingFetch: FetchLike = async () => {
      throw new Error('offline');
    };
    const bridge = new GPUBridge({ retryCount: 1, circuitFailureCount: 3, circuitWindowMs: 30000, circuitCooldownMs: 60000 }, failingFetch);
    await expect(bridge.fetch('/a')).rejects.toThrow();
    await expect(bridge.fetch('/b')).rejects.toThrow();
    await expect(bridge.fetch('/c')).rejects.toThrow();
    expect(bridge.isCircuitOpen()).toBe(true);
  });

  it('performs periodic health checks no more often than interval', async () => {
    let calls = 0;
    const okFetch: FetchLike = async () => {
      calls += 1;
      return { ok: true, status: 200, statusText: 'OK', json: async () => ({ status: 'healthy' }) };
    };
    const bridge = new GPUBridge({ healthCheckIntervalMs: 10000 }, okFetch);
    expect(await bridge.periodicHealthCheck(20000)).toBe(true);
    expect(await bridge.periodicHealthCheck(20001)).toBe(true);
    expect(calls).toBe(1);
  });
});
