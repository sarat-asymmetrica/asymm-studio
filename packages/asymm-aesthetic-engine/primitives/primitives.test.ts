import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parse } from '@astrojs/compiler';
import { describe, expect, it } from 'vitest';

const primitiveNames = [
  'ShojiModal',
  'KintsugiAlert',
  'AgingButton',
  'InkBrushInput',
  'TextBloom',
  'HoloCard',
  'GravityGrid',
  'VitruvianLoader',
  'StoneSwitch',
  'ChronosDial'
] as const;
const primitiveDir = fileURLToPath(new URL('.', import.meta.url));

function readPrimitive(name: (typeof primitiveNames)[number]): string {
  return readFileSync(join(primitiveDir, `${name}.astro`), 'utf8');
}

describe('aesthetic Astro primitives', () => {
  it('parses every primitive without Astro compiler errors', async () => {
    for (const name of primitiveNames) {
      const result = await parse(readPrimitive(name));
      expect(result.diagnostics).toHaveLength(0);
    }
  });

  it('accepts seed props and derives CSS variables from the engine', () => {
    for (const name of primitiveNames) {
      const source = readPrimitive(name);
      expect(source).toContain('seed: number');
      expect(source).toContain('deriveAll(SeedToQuaternion(seed))');
      expect(source).toContain('--asymm-');
      expect(source).toContain('prefers-reduced-motion');
      expect(source).not.toMatch(/#[0-9a-f]{3,8}/i);
    }
  });

  it('produces distinct seed-addressed output for different seeds', () => {
    for (const name of primitiveNames) {
      const source = readPrimitive(name);
      expect(source).toContain('data-seed={seed}');
      expect(source).toContain('tokens.color.');
      expect(source).toContain('tokens.geometry.');
    }
  });
});
