import { describe, expect, it } from 'vitest';

import { MockSignalPipeline } from './mock-pipeline.js';
import { LiveSignalPipeline, type SignalPipelineReading } from './live-pipeline.js';
import { FaceMeshIntegration } from '../mediapipe/index.js';
import { MockFaceMeshDetector } from '../mediapipe/mock-facemesh.js';
import type { ImageFrame } from '../math/biomimetic-kernels.js';

function imageFrame(width: number, height: number, green: number): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 88;
    data[index + 1] = green;
    data[index + 2] = 96;
    data[index + 3] = 255;
  }
  return { width, height, data };
}

describe('signal pipelines', () => {
  it('provides deterministic mock BPM and coherence ramp', async () => {
    const first = new MockSignalPipeline({ bpm: 72, sampleRate: 30, seed: 8 });
    const second = new MockSignalPipeline({ bpm: 72, sampleRate: 30, seed: 8 });
    let firstReading: SignalPipelineReading | null = null;
    let secondReading: SignalPipelineReading | null = null;

    for (let frame = 0; frame <= 300; frame += 1) {
      const timestampMs = (frame / 30) * 1000;
      firstReading = await first.processFrame(timestampMs);
      secondReading = await second.processFrame(timestampMs);
    }

    expect(firstReading?.signals.ppg?.bpm).toBeGreaterThanOrEqual(60);
    expect(firstReading?.signals.ppg?.bpm).toBeLessThanOrEqual(80);
    expect(firstReading?.signals.coherence?.coherence).toBe(1);
    expect(secondReading?.signals.ppg).toEqual(firstReading?.signals.ppg);
    expect(secondReading?.signals.coherence?.coherence).toBe(firstReading?.signals.coherence?.coherence);
  });

  it('keeps coherence bounded during the mock ramp', async () => {
    const pipeline = new MockSignalPipeline({ coherenceRampSeconds: 10 });
    for (const timestampMs of [0, 2500, 5000, 7500, 10000, 12500]) {
      const reading = await pipeline.processFrame(timestampMs);
      expect(reading.signals.coherence?.coherence).toBeGreaterThanOrEqual(0);
      expect(reading.signals.coherence?.coherence).toBeLessThanOrEqual(1);
    }
  });

  it('processes live pipeline image frames through detector landmarks', async () => {
    const faceMesh = new FaceMeshIntegration({ mode: 'mock' }, new MockFaceMeshDetector({ seed: 2 }), 'test detector');
    const pipeline = new LiveSignalPipeline({ maxFps: 30 }, faceMesh);
    const reading = await pipeline.processFrame(imageFrame(32, 24, 128), 1000);

    expect(reading.mode).toBe('mock');
    expect(reading.face?.faceDetected).toBe(true);
    expect(reading.signals.faceDetected).toBe(true);
    expect(reading.signals.coherence?.coherence).toBeGreaterThanOrEqual(0);
    expect(reading.signals.coherence?.coherence).toBeLessThanOrEqual(1);
  });

  it('skips frame drops without crashing', async () => {
    const pipeline = new LiveSignalPipeline({ maxFps: 10, faceMesh: { mode: 'mock' } });
    await pipeline.processFrame(imageFrame(32, 24, 128), 1000);
    const skipped = await pipeline.processFrame(null, 1005);

    expect(skipped.skippedFrame).toBe(true);
    expect(skipped.message).toContain('FPS cap');
  });
});
