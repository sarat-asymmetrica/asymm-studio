import { describe, expect, it } from 'vitest';

import { SeedToQuaternion } from '../seed/quaternion.js';
import { getAestheticRegion } from '../seed/regions.js';
import { applyVariation, type ComponentDefinition, type StyledComponent } from './variations.js';

const component: ComponentDefinition = {
  name: 'ShojiModal',
  file: 'src/lib/components/ShojiModal.svelte',
  category: 'modal-dialog',
  description: 'Japanese Shoji-inspired modal with paper texture'
};

const categories: readonly string[] = [
  'interactive-3d',
  'cyberpunk',
  'animation-text',
  'physics-interactive',
  'modal-dialog',
  '3d-loader',
  'form-toggle',
  'notification',
  'interactive-button',
  'temporal-ui'
];

describe('component variations', () => {
  it('is deterministic for the same component, seed, and region', () => {
    const region = getAestheticRegion('wabi-sabi');
    const first: StyledComponent = applyVariation(component, SeedToQuaternion(144), region);
    const second: StyledComponent = applyVariation(component, SeedToQuaternion(144), region);

    expect(first).toEqual(second);
  });

  it('changes visual variables without changing component structure', () => {
    const region = getAestheticRegion('ananta-warm');
    const first: StyledComponent = applyVariation(component, SeedToQuaternion(144), region);
    const second: StyledComponent = applyVariation(component, SeedToQuaternion(233), region);

    expect(first.structure).toEqual(second.structure);
    expect(first.cssVariables).not.toEqual(second.cssVariables);
  });

  it('supports at least ten component category variation profiles', () => {
    const region = getAestheticRegion('modernist-strict');

    for (const category of categories) {
      const varied: StyledComponent = applyVariation(
        { ...component, name: category, category },
        SeedToQuaternion(category),
        region
      );

      expect(varied.traits.length).toBeGreaterThanOrEqual(3);
      expect(Object.keys(varied.cssVariables).length).toBeGreaterThan(20);
    }
  });
});
