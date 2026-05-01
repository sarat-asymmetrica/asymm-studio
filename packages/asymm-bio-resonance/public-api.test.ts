import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { GazeCalibration, RitualSequencer } from './calibration/index.js';
import { PresenceHashGenerator, VedicObfuscation } from './identity/index.js';
import { Quaternion } from './math/index.js';
import { createFaceMeshDetector } from './mediapipe/index.js';
import { MockSignalPipeline, UnifiedSignalExtractor } from './signals/index.js';

const packageDir = fileURLToPath(new URL('.', import.meta.url));

describe('public bio-resonance API', () => {
  it('covers math, calibration, and identity exports', () => {
    const gaze = new GazeCalibration();
    gaze.addSample({ point: 'upper-left', x: 0.1, y: 0.1, timestamp: 0 });
    gaze.addSample({ point: 'lower-right', x: 0.9, y: 0.9, timestamp: 1 });
    const ritual = new RitualSequencer();
    const hash = PresenceHashGenerator.generate([72, 0.4, 0.8]);

    expect(new Quaternion().slerp(new Quaternion(0, 1, 0, 0), 0.5).norm()).toBeCloseTo(1);
    expect(gaze.mapToScreen(0.5, 0.5).x).toBeGreaterThan(0);
    expect(ritual.start(0).step.id).toBe('look-upper-left');
    expect(hash).toHaveLength(32);
    expect(VedicObfuscation.obfuscatePresence([0.4, 0.7], 108)).toHaveLength(2);
  });

  it('covers MediaPipe factory and signal pipeline exports', async () => {
    const detector = await createFaceMeshDetector({ mode: 'mock', mock: { seed: 7 } });
    const detection = await detector.detector.processFrame(null, { timestampMs: 1000 });
    const pipeline = new MockSignalPipeline({ bpm: 72 });
    const reading = await pipeline.processFrame(10_000);
    const extractor = new UnifiedSignalExtractor();

    expect(detector.mode).toBe('mock');
    expect(detection.landmarks?.length).toBeGreaterThanOrEqual(468);
    expect(reading.signals.ppg?.bpm).toBeGreaterThanOrEqual(60);
    expect(reading.signals.coherence?.coherence).toBeGreaterThanOrEqual(0);
    expect(extractor.getPresenceVector()).toHaveLength(7);
  });

  it('covers component barrel exports statically for Svelte consumers', () => {
    const componentIndex = readFileSync(join(packageDir, 'components', 'index.ts'), 'utf8');

    for (const name of ['CalibrationRitual', 'GazeCursor', 'PresenceAuth', 'StressAdaptiveReader', 'ContinuousAuthGuard']) {
      expect(componentIndex).toContain(`as ${name}`);
    }
  });
});
