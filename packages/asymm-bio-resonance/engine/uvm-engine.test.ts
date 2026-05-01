import { describe, expect, it } from 'vitest';

import { UVMEngine } from './uvm-engine.js';
import type { ImageFrame } from '../math/biomimetic-kernels.js';
import type { Landmark } from '../signals/index.js';

function frame(width: number, height: number): ImageFrame {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let index = 0; index < data.length; index += 4) {
    data[index] = 100;
    data[index + 1] = 120;
    data[index + 2] = 100;
    data[index + 3] = 255;
  }
  return { width, height, data };
}

function landmarks(count: number): readonly Landmark[] {
  return Array.from({ length: count }, (_value, index) => ({ x: 0.3 + index * 0.0001, y: 0.3, z: 0 }));
}

describe('UVMEngine', () => {
  it('caps processing at configured FPS', async () => {
    const engine = new UVMEngine({ targetFPS: 30 });
    expect(await engine.processImageFrame(frame(4, 4), 0.016, 1000)).not.toBeNull();
    expect(await engine.processImageFrame(frame(4, 4), 0.016, 1010)).toBeNull();
  });

  it('bounds dt before stepping PDE tissues', async () => {
    const engine = new UVMEngine({ targetFPS: 1000 });
    const result = await engine.processImageFrame(frame(4, 4), 1, 1000);
    expect(result?.dt).toBe(0.05);
  });

  it('recovers from short face tracking loss', async () => {
    const engine = new UVMEngine({ targetFPS: 1000, faceLossRecoveryMs: 500 });
    await engine.processImageFrame(frame(4, 4), 0.01, 1000, landmarks(500));
    const recovered = await engine.processImageFrame(frame(4, 4), 0.01, 1100, null);
    const expired = await engine.processImageFrame(frame(4, 4), 0.01, 1700, null);
    expect(recovered?.signals.faceDetected).toBe(true);
    expect(expired?.signals.faceDetected).toBe(false);
  });
});
