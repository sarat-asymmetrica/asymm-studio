import { describe, expect, it } from 'vitest';

import { createFaceMeshDetector } from './factory.js';
import { FaceMeshIntegration, createFaceMeshIntegration } from './facemesh-integration.js';
import { MockFaceMeshDetector, createMockFaceLandmarks } from './mock-facemesh.js';
import type { FaceMeshDetector, FaceMeshDetection } from './mock-facemesh.js';

class TestLiveDetector implements FaceMeshDetector {
  public readonly mode = 'live';

  public async processFrame(): Promise<FaceMeshDetection> {
    return { mode: this.mode, landmarks: createMockFaceLandmarks(), message: null };
  }

  public close(): void {
    return;
  }
}

describe('MockFaceMeshDetector', () => {
  it('returns deterministic landmarks for the same seed and timestamp', async () => {
    const first = new MockFaceMeshDetector({ seed: 8 });
    const second = new MockFaceMeshDetector({ seed: 8 });
    const left = await first.processFrame(null, { timestampMs: 1000 });
    const right = await second.processFrame(null, { timestampMs: 1000 });
    expect(left.landmarks).toEqual(right.landmarks);
    expect(left.landmarks?.length).toBeGreaterThanOrEqual(468);
  });

  it('can simulate face absence without throwing', async () => {
    const detector = new MockFaceMeshDetector({ facePresent: false });
    const result = await detector.processFrame(null);
    expect(result.landmarks).toBeNull();
    expect(result.message).toContain('no face');
  });
});

describe('createFaceMeshDetector', () => {
  it('selects mock mode when requested', async () => {
    const result = await createFaceMeshDetector({ mode: 'mock', mock: { seed: 3 } });
    expect(result.mode).toBe('mock');
    expect(result.detector.mode).toBe('mock');
  });

  it('falls back to mock when browser camera APIs are unavailable', async () => {
    const result = await createFaceMeshDetector({
      mode: 'auto',
      environment: { hasNavigator: false, hasCameraApi: false, hasWindow: false }
    });
    expect(result.mode).toBe('mock');
    expect(result.reason).toContain('unavailable');
  });

  it('uses live mode when the environment and loader are available', async () => {
    const result = await createFaceMeshDetector({
      mode: 'auto',
      environment: { hasNavigator: true, hasCameraApi: true, hasWindow: true },
      liveDetectorFactory: async () => new TestLiveDetector()
    });
    expect(result.mode).toBe('live');
    expect(result.detector.mode).toBe('live');
  });

  it('falls back to mock when live MediaPipe loading fails', async () => {
    const result = await createFaceMeshDetector({
      mode: 'auto',
      environment: { hasNavigator: true, hasCameraApi: true, hasWindow: true },
      liveDetectorFactory: async () => {
        throw new Error('blocked');
      }
    });
    expect(result.mode).toBe('mock');
    expect(result.reason).toContain('MediaPipe');
  });
});

describe('FaceMeshIntegration factory wiring', () => {
  it('processes detector output through blink and gesture state', async () => {
    const integration = await createFaceMeshIntegration({ mode: 'mock', mock: { seed: 13 } });
    const state = await integration.processFrame(null, 1000);
    expect(state.detectorMode).toBe('mock');
    expect(state.faceDetected).toBe(true);
    expect(integration.getPPGRegion()?.landmarks.length).toBeGreaterThan(0);
  });

  it('can lazily initialize a detector from processFrame', async () => {
    const integration = new FaceMeshIntegration({ mode: 'mock' });
    const state = await integration.processFrame(null, 1000);
    expect(state.detectorMode).toBe('mock');
    expect(state.landmarks?.length).toBeGreaterThanOrEqual(468);
  });
});
