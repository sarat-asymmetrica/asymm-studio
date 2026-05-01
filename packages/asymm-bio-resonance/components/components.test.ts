import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const componentNames = ['CalibrationRitual', 'PresenceAuth', 'GazeCursor', 'StressAdaptiveReader'] as const;
const componentDir = fileURLToPath(new URL('.', import.meta.url));

function readComponent(name: (typeof componentNames)[number]): string {
  return readFileSync(join(componentDir, `${name}.svelte`), 'utf8');
}

describe('bio-resonance Svelte components', () => {
  it('exposes camera lifecycle teardown and error recovery in every demo component', () => {
    for (const name of componentNames) {
      const source = readComponent(name);
      expect(source).toContain('onMount');
      expect(source).toContain('return (): void');
      expect(source).toContain('track.stop()');
      expect(source).toContain('catch (error: unknown)');
      expect(source).toContain('cameraError');
    }
  });

  it('keeps privacy and accessibility visible at the component surface', () => {
    for (const name of componentNames) {
      const source = readComponent(name);
      expect(source).toContain('PRIVACY_FOOTER');
      expect(source).toContain('aria-label');
      expect(source).toContain('prefers-reduced-motion');
      expect(source).not.toContain('localStorage');
      expect(source).not.toContain('sessionStorage');
      expect(source).not.toContain('fetch(');
      expect(source).not.toContain('innerHTML');
      expect(source).not.toContain('console.log');
    }
  });
});
