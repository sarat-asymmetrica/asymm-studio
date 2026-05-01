import { describe, expect, it } from 'vitest';

import { estimateAnatomy } from './anatomical-calibration.js';
import { GazeCalibration } from './gaze-calibration.js';
import { classifyHandPose } from './hand-calibration.js';
import { PresenceBaselineCollector } from './presence-baseline.js';
import { PRIVACY_FOOTER, RitualSequencer } from './ritual-sequencer.js';
import type { Landmark } from '../signals/index.js';

function hand(distance: number): Landmark[] {
  const points = Array.from({ length: 21 }, () => ({ x: 0, y: 0, z: 0 }));
  for (const index of [4, 8, 12, 16, 20]) points[index] = { x: distance, y: 0, z: 0 };
  return points;
}

describe('calibration ritual', () => {
  it('calibrates four gaze corners', () => {
    const gaze = new GazeCalibration();
    gaze.addSample({ point: 'upper-left', x: 0.1, y: 0.1, timestamp: 0 });
    gaze.addSample({ point: 'upper-right', x: 0.9, y: 0.1, timestamp: 1 });
    gaze.addSample({ point: 'lower-right', x: 0.9, y: 0.9, timestamp: 2 });
    const result = gaze.addSample({ point: 'lower-left', x: 0.1, y: 0.9, timestamp: 3 });
    expect(result.complete).toBe(true);
    expect(gaze.mapToScreen(0.5, 0.5).x).toBeCloseTo(0.5);
  });

  it('estimates anatomy from landmarks', () => {
    const landmarks = Array.from({ length: 500 }, () => ({ x: 0.5, y: 0.5, z: 0 }));
    landmarks[33] = { x: 0.4, y: 0.5, z: 0 };
    landmarks[263] = { x: 0.6, y: 0.5, z: 0 };
    const measurements = estimateAnatomy(landmarks, 640);
    expect(measurements.interpupillaryDistancePx).toBeGreaterThan(0);
  });

  it('classifies hand poses', () => {
    expect(classifyHandPose(hand(0.35)).pose).toBe('open-palm');
    expect(classifyHandPose(hand(0.05)).pose).toBe('fist');
  });

  it('collects presence baseline only from confident PPG', () => {
    const collector = new PresenceBaselineCollector();
    collector.addPPG({ bpm: 70, variance: 8, confidence: 0.9 });
    collector.addPPG({ bpm: null, variance: 0, confidence: 0.1 });
    collector.addBlinkRate(15);
    expect(collector.getBaseline().restingHeartRate).toBe(70);
  });

  it('advances the ritual with a visible privacy footer and no network hooks', () => {
    const sequencer = new RitualSequencer();
    sequencer.start(0);
    const state = sequencer.update(3000);
    expect(state.step.id).toBe('look-upper-right');
    expect(state.privacyFooter).toBe(PRIVACY_FOOTER);
  });
});
