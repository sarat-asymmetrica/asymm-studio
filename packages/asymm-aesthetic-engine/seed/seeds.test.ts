import { describe, expect, it } from 'vitest';

import { contentHash } from './content-hash.js';
import { temporalSeed } from './temporal.js';
import { visitorSeed } from './visitor.js';

describe('seed helpers', () => {
  it('hashes content deterministically', () => {
    expect(contentHash('same semantic page')).toBe(contentHash('same semantic page'));
    expect(contentHash('same semantic page')).not.toBe(contentHash('different semantic page'));
  });

  it('derives temporal seeds from the UTC calendar day', () => {
    const morning: Date = new Date('2026-05-01T01:00:00.000Z');
    const evening: Date = new Date('2026-05-01T23:00:00.000Z');
    const nextDay: Date = new Date('2026-05-02T00:00:00.000Z');

    expect(temporalSeed(morning)).toBe(temporalSeed(evening));
    expect(temporalSeed(morning)).not.toBe(temporalSeed(nextDay));
  });

  it('requires an explicit fingerprint string for visitor-derived seeds', () => {
    expect(visitorSeed('opt-in-device-a')).toBe(visitorSeed('opt-in-device-a'));
    expect(visitorSeed('opt-in-device-a')).not.toBe(visitorSeed('opt-in-device-b'));
  });
});
