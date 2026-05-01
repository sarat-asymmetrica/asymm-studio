import { describe, expect, it } from 'vitest';

import { CoherenceCalculator, PPGExtractor, UnifiedSignalExtractor, type ExtractedSignals } from './signal-extractor.js';
import type { ImageFrame } from '../math/biomimetic-kernels.js';

function imageFrame(width: number, height: number, green: number): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 80;
    data[index + 1] = green;
    data[index + 2] = 80;
    data[index + 3] = 255;
  }
  return { width, height, data };
}

describe('signal extraction', () => {
  it('returns null instead of garbage BPM for flat PPG', () => {
    const ppg = new PPGExtractor({ sampleRate: 30, bufferSeconds: 4 });
    for (let index = 0; index < 120; index += 1) ppg.addSample(128);
    expect(ppg.process().bpm).toBeNull();
  });

  it('gates BPM by confidence and valid heart-rate range', () => {
    const ppg = new PPGExtractor({ sampleRate: 30, bufferSeconds: 4, confidenceThreshold: 0.1 });
    for (let index = 0; index < 120; index += 1) {
      ppg.addSample(128 + Math.sin((2 * Math.PI * index) / 30) * 24);
    }
    const reading = ppg.process();
    expect(reading.bpm === null || (reading.bpm >= 40 && reading.bpm <= 200)).toBe(true);
  });

  it('clamps coherence to [0, 1]', () => {
    const calculator = new CoherenceCalculator();
    const signals: ExtractedSignals = {
      ppg: { bpm: 70, variance: 10, confidence: 5 },
      flow: { magnitude: -10, direction: 0, breathSignal: 1 },
      hum: { frequency: 108, amplitude: 1, isHumming: true, resonanceMatch: 10 },
      coherence: null,
      luminance: 0.5,
      colorComplexity: 0.2,
      motionMagnitude: -10,
      faceDetected: true
    };
    const reading = calculator.update(signals);
    expect(reading.coherence).toBeGreaterThanOrEqual(0);
    expect(reading.coherence).toBeLessThanOrEqual(1);
  });

  it('extracts bounded unified signals from a frame', () => {
    const extractor = new UnifiedSignalExtractor();
    const signals = extractor.extract(imageFrame(8, 8, 128), null, null);
    expect(signals.luminance).toBeGreaterThan(0);
    expect(signals.coherence?.coherence).toBeGreaterThanOrEqual(0);
    expect(extractor.getPresenceVector()).toHaveLength(7);
  });
});
