import { describe, expect, it } from 'vitest';

import { AESTHETIC_REGIONS, type AestheticRegion, type QuaternionBounds } from './regions.js';

function rangesOverlap(left: readonly [number, number], right: readonly [number, number]): boolean {
  return left[0] <= right[1] && right[0] <= left[1];
}

function boundsOverlap(left: QuaternionBounds, right: QuaternionBounds): boolean {
  return (
    rangesOverlap(left.w, right.w) &&
    rangesOverlap(left.x, right.x) &&
    rangesOverlap(left.y, right.y) &&
    rangesOverlap(left.z, right.z)
  );
}

describe('aesthetic regions', () => {
  it('defines eight named regions', () => {
    expect(AESTHETIC_REGIONS).toHaveLength(8);
  });

  it('keeps quaternion bounds non-overlapping', () => {
    AESTHETIC_REGIONS.forEach((left: AestheticRegion, leftIndex: number) => {
      AESTHETIC_REGIONS.slice(leftIndex + 1).forEach((right: AestheticRegion) => {
        expect(boundsOverlap(left.bounds, right.bounds), `${left.name} overlaps ${right.name}`).toBe(
          false
        );
      });
    });
  });
});
