import { describe, expect, it } from 'vitest';

import { SeedToQuaternion } from '../seed/quaternion.js';
import { contrastRatio, deriveAll, isHexColor, seedToPalette } from './index.js';

describe('derive layer', () => {
  it('derives distinct tokens for distinct quaternions', () => {
    const first = deriveAll(SeedToQuaternion('wabi-sabi'));
    const second = deriveAll(SeedToQuaternion('brutal-raw'));

    expect(first).not.toEqual(second);
    expect(first.color.primary).not.toBe(second.color.primary);
  });

  it('emits valid CSS color and length tokens', () => {
    const tokens = deriveAll(SeedToQuaternion(144));

    expect(isHexColor(tokens.color.primary)).toBe(true);
    expect(isHexColor(tokens.color.background)).toBe(true);
    expect(tokens.color.scale.every((color: string) => isHexColor(color))).toBe(true);
    expect(tokens.typography.sizes.h1).toMatch(/^\d+px$/);
    expect(tokens.geometry.radius.asymmetric).toMatch(/^\d+px \d+px \d+px \d+px$/);
    expect(tokens.motion.duration).toMatch(/^\d+ms$/);
  });

  it('keeps generated text and background at WCAG AA contrast', () => {
    const seeds: ReadonlyArray<number | string> = [0, 1, 144, 233, 'glass', 'research', 'ananta'];

    for (const seed of seeds) {
      const palette = seedToPalette(SeedToQuaternion(seed));
      expect(contrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
