import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { applyVariation, type ComponentDefinition } from './components/index.js';
import {
  contrastRatio,
  deriveAll,
  hexHue,
  isHexColor,
  relativeLuminance,
  seedToGeometry,
  seedToMotion,
  seedToPalette,
  seedToTypography
} from './derive/index.js';
import {
  AESTHETIC_REGIONS,
  SeedToQuaternion,
  contentHash,
  getAestheticRegion,
  seedToQuaternion,
  temporalSeed,
  visitorSeed
} from './seed/index.js';
import { transmute } from './transmute/index.js';

const packageDir = fileURLToPath(new URL('.', import.meta.url));

describe('public aesthetic engine API', () => {
  it('covers seed and region exports', () => {
    const mayFirstSeed: number = temporalSeed(new Date('2026-05-01T00:00:00Z'));

    expect(contentHash('alpha')).toBe(contentHash('alpha'));
    expect(SeedToQuaternion(1).magnitude()).toBeCloseTo(1);
    expect(seedToQuaternion('region').magnitude()).toBeCloseTo(1);
    expect(Number.isInteger(mayFirstSeed)).toBe(true);
    expect(mayFirstSeed).toBe(temporalSeed(new Date('2026-05-01T12:00:00Z')));
    expect(mayFirstSeed).not.toBe(temporalSeed(new Date('2026-05-02T00:00:00Z')));
    expect(visitorSeed('explicit')).toBe(visitorSeed('explicit'));
    expect(AESTHETIC_REGIONS.map((region) => region.name)).toContain('wabi-sabi');
    expect(getAestheticRegion('wabi-sabi').label).toBe('Wabi-Sabi');
  });

  it('covers derive and color utility exports', () => {
    const quaternion = SeedToQuaternion(987);
    const tokens = deriveAll(quaternion);

    expect(seedToPalette(quaternion).primary).toBe(tokens.color.primary);
    expect(seedToTypography(quaternion).sizes.base).toBe(tokens.typography.sizes.base);
    expect(seedToGeometry(quaternion).spacing.md).toBe(tokens.geometry.spacing.md);
    expect(seedToMotion(quaternion).duration).toBe(tokens.motion.duration);
    expect(isHexColor(tokens.color.primary)).toBe(true);
    expect(relativeLuminance(tokens.color.background)).toBeGreaterThanOrEqual(0);
    expect(contrastRatio(tokens.color.text, tokens.color.background)).toBeGreaterThanOrEqual(4.5);
    expect(hexHue(tokens.color.primary)).toBeGreaterThanOrEqual(0);
  });

  it('covers component variation and transmutation exports', () => {
    const component: ComponentDefinition = {
      name: 'AgingButton',
      file: 'button.svelte',
      category: 'interactive-button',
      description: 'Seeded button'
    };
    const varied = applyVariation(component, SeedToQuaternion(34), getAestheticRegion('indie-craft'));
    const html = transmute('<h1>Hello</h1><script>bad()</script>', SeedToQuaternion(34), getAestheticRegion('indie-craft'));

    expect(varied.cssVariables['--asymm-color-primary']).toBeDefined();
    expect(varied.cssVariables['--asymm-patina']).toBeDefined();
    expect(html).toContain('text-bloom');
    expect(html).not.toContain('<script>');
  });

  it('covers primitive barrel exports statically for Astro consumers', () => {
    const primitiveIndex = readFileSync(join(packageDir, 'primitives', 'index.ts'), 'utf8');

    for (const name of ['ShojiModal', 'KintsugiAlert', 'AgingButton', 'InkBrushInput', 'TextBloom', 'HoloCard', 'GravityGrid', 'VitruvianLoader', 'StoneSwitch', 'ChronosDial']) {
      expect(primitiveIndex).toContain(`as ${name}`);
    }
  });
});
