import type { Quaternion } from '../seed/quaternion.js';

import { seedToPalette, type Palette } from './colors.js';
import { seedToGeometry, type GeometryTokens } from './geometry.js';
import { seedToMotion, type MotionTokens } from './motion.js';
import { seedToTypography, type TypeScale } from './typography.js';

export interface DesignTokens {
  readonly color: Palette;
  readonly typography: TypeScale;
  readonly geometry: GeometryTokens;
  readonly motion: MotionTokens;
}

export function deriveAll(quaternion: Quaternion): DesignTokens {
  return {
    color: seedToPalette(quaternion),
    typography: seedToTypography(quaternion),
    geometry: seedToGeometry(quaternion),
    motion: seedToMotion(quaternion)
  };
}

export { contrastRatio, hexHue, isHexColor, relativeLuminance, seedToPalette } from './colors.js';
export { seedToGeometry } from './geometry.js';
export { seedToMotion } from './motion.js';
export { seedToTypography } from './typography.js';
export type { GeometryTokens, MotionTokens, Palette, TypeScale };
