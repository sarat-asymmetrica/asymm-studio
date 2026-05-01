import { describe, expect, it } from 'vitest';

import { SeedToQuaternion } from '../seed/quaternion.js';
import { getAestheticRegion } from '../seed/regions.js';
import { transmute } from './alchemist.js';

describe('alchemist transmuter', () => {
  it('transmutes semantic class markers into styled HTML', () => {
    const output: string = transmute(
      '<div class="asymm-card">Hello</div>',
      SeedToQuaternion(144),
      getAestheticRegion('wabi-sabi')
    );

    expect(output).toContain('class="asymm-transmuted holocard"');
    expect(output).toContain('--asymm-color-bg:');
    expect(output).toContain('Hello');
  });

  it('removes executable XSS vectors from input and generated output', () => {
    const output: string = transmute(
      '<div class="asymm-card"><img src=x onerror="alert(1)">Hi<script>alert(2)</script></div><a href="javascript:alert(3)" onclick="alert(4)">bad</a>',
      SeedToQuaternion('xss'),
      getAestheticRegion('research-paper')
    );

    expect(output.toLowerCase()).not.toContain('<script');
    expect(output.toLowerCase()).not.toContain('onerror');
    expect(output.toLowerCase()).not.toContain('onclick');
    expect(output.toLowerCase()).not.toContain('javascript:');
    expect(output).toContain('Hi');
    expect(output).not.toContain('alert(2)');
  });

  it('wraps headings with text bloom without trusting attributes', () => {
    const output: string = transmute(
      '<h2 onclick="alert(1)">Discovery</h2>',
      SeedToQuaternion(233),
      getAestheticRegion('ananta-warm')
    );

    expect(output).toBe('<h2><span class="text-bloom">Discovery</span></h2>');
  });
});
