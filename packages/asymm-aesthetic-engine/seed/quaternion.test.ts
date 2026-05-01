import { describe, expect, it } from 'vitest';

import { SeedToQuaternion } from './quaternion.js';

function deterministicSeeds(count: number): number[] {
  const seeds: number[] = [];
  let state: number = 0x9e3779b9;

  for (let index: number = 0; index < count; index += 1) {
    state = Math.imul(state ^ (state >>> 15), 2246822507) >>> 0;
    seeds.push(state);
  }

  return seeds;
}

describe('SeedToQuaternion', () => {
  it('projects numeric seeds onto the S3 unit sphere', () => {
    for (const seed of deterministicSeeds(1000)) {
      const magnitude: number = SeedToQuaternion(seed).magnitude();
      expect(Math.abs(magnitude - 1)).toBeLessThanOrEqual(1e-10);
    }
  });

  it('returns the same quaternion for the same seed', () => {
    expect(SeedToQuaternion(144).toArray()).toEqual(SeedToQuaternion(144).toArray());
    expect(SeedToQuaternion('ananta-warm').toArray()).toEqual(
      SeedToQuaternion('ananta-warm').toArray()
    );
  });

  it('returns distinct quaternions for distinct seeds', () => {
    expect(SeedToQuaternion(144).toArray()).not.toEqual(SeedToQuaternion(233).toArray());
    expect(SeedToQuaternion('wabi-sabi').toArray()).not.toEqual(
      SeedToQuaternion('glass-ethereal').toArray()
    );
  });
});
