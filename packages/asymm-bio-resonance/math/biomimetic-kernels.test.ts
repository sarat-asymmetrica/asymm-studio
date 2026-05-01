import { describe, expect, it } from 'vitest';

import { EagleKernel, UnifiedSamplingSystem, type ImageFrame } from './biomimetic-kernels.js';

function frame(width: number, height: number, value: number): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = value;
    data[index + 1] = value;
    data[index + 2] = value;
    data[index + 3] = 255;
  }
  return { width, height, data };
}

describe('biomimetic kernels', () => {
  it('handles empty frames', () => {
    expect(new EagleKernel().apply(frame(0, 0, 0))).toHaveLength(0);
  });

  it('accepts configurable kernel weights', () => {
    const system = new UnifiedSamplingSystem({ eagle: 0.9, owl: 0.01 });
    expect(system.weights.eagle).toBe(0.9);
    expect(system.weights.owl).toBe(0.01);
  });

  it('returns bounded combined sampling output', () => {
    const system = new UnifiedSamplingSystem();
    const signal = system.apply(frame(4, 4, 128));
    expect(signal).toHaveLength(16);
    expect(Array.from(signal).every((value: number) => Number.isFinite(value))).toBe(true);
  });
});
