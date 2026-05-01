import { describe, expect, it } from 'vitest';

import { PDETissue, PhiOrganismTissue, PDETissueRegistry } from './pde-tissue.js';

describe('PDE tissue', () => {
  it('throws when dt violates the CFL stability guard', () => {
    const tissue = new PDETissue('test', 4, 4);
    tissue.diffusionCoeff = 1;
    expect(() => tissue.step(0.26)).toThrow(/CFL stability violation/);
  });

  it('clamps phi field values to prevent blowup', () => {
    const tissue = new PhiOrganismTissue(2, 2);
    tissue.set(0, 0, 10);
    expect(tissue.get(0, 0)).toBe(2);
  });

  it('handles empty registries and converts to quaternion fields', () => {
    const registry = new PDETissueRegistry(2, 2);
    registry.stepAll(0.01);
    expect(registry.getTotalEnergy()).toBeGreaterThanOrEqual(0);
    expect(registry.toQuaternionField().get(0, 0).norm()).toBeCloseTo(1, 10);
  });
});
