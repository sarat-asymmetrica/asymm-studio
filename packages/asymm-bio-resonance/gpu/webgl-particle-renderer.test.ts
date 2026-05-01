import { describe, expect, it } from 'vitest';

import { WebGLParticleRenderer, type MinimalGL } from './webgl-particle-renderer.js';
import { Quaternion, QuaternionField } from '../math/index.js';

describe('WebGLParticleRenderer', () => {
  it('uses real quaternion SLERP during particle updates', () => {
    const field = new QuaternionField(1, 1);
    field.set(0, 0, Quaternion.fromAxisAngle([0, 1, 0], Math.PI));
    const renderer = new WebGLParticleRenderer(null, { particleCount: 1, maxParticleCount: 1 });
    renderer.update(field, 0.016);
    const q = new Quaternion(renderer.quaternions[0], renderer.quaternions[1], renderer.quaternions[2], renderer.quaternions[3]);
    expect(q.norm()).toBeCloseTo(1, 6);
  });

  it('deletes old framebuffer resources on resize', () => {
    const deleted: unknown[] = [];
    const gl: MinimalGL = {
      createFramebuffer: () => ({}),
      createTexture: () => ({}),
      deleteFramebuffer: (framebuffer: unknown) => deleted.push(framebuffer),
      deleteTexture: (texture: unknown) => deleted.push(texture)
    };
    const renderer = new WebGLParticleRenderer(gl, { particleCount: 1, maxParticleCount: 1 });
    renderer.initialize(10, 10);
    renderer.resize(20, 20);
    expect(deleted.length).toBe(6);
  });
});
