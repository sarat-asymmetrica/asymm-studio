import { describe, expect, it } from 'vitest';

import { FaceMeshIntegration, LANDMARK_REGIONS } from './facemesh-integration.js';
import type { Landmark } from '../signals/index.js';

function face(): Landmark[] {
  return Array.from({ length: 500 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
}

describe('FaceMeshIntegration', () => {
  it('keeps landmark regions available', () => {
    expect(LANDMARK_REGIONS.FOREHEAD.length).toBeGreaterThan(0);
  });

  it('uses configurable EAR threshold for blink detection', () => {
    const integration = new FaceMeshIntegration({ earThreshold: 2, blinkConsecutiveFrames: 1 });
    const landmarks = face();
    integration.processResults(landmarks);
    expect(integration.getState().blink.isBlinking).toBe(true);
  });
});
