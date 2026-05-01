import { describe, expect, it } from 'vitest';

import { Quaternion, QuaternionField, ThreeRegimeTracker } from './quaternion.js';

describe('bio quaternion math', () => {
  it('normalizes zero quaternions to identity', () => {
    expect(new Quaternion(0, 0, 0, 0).normalize().toArray()).toEqual([1, 0, 0, 0]);
  });

  it('keeps SLERP on the unit 3-sphere', () => {
    const first = Quaternion.fromAxisAngle([1, 0, 0], Math.PI / 2);
    const second = Quaternion.fromAxisAngle([0, 1, 0], Math.PI / 2);
    expect(first.slerp(second, 0.5).norm()).toBeCloseTo(1, 10);
  });

  it('supports empty quaternion fields without energy blowup', () => {
    expect(new QuaternionField(0, 0).computeEnergy()).toBe(0);
  });

  it('uses configurable three-regime convergence thresholds', () => {
    const tracker = new ThreeRegimeTracker({ exploration: 0.25, optimization: 0.25, stabilization: 0.5 });
    expect(tracker.isConverged(0.01)).toBe(true);
  });
});
