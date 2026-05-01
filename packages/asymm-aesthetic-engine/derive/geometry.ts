import { BORDER_RADIUS, SPACING } from '../../sacred-geometry/src/spacing.js';

import type { Quaternion } from '../seed/quaternion.js';

export interface GeometryTokens {
  readonly radius: {
    readonly small: string;
    readonly medium: string;
    readonly large: string;
    readonly asymmetric: string;
  };
  readonly tilt: string;
  readonly blur: string;
  readonly textureOpacity: number;
  readonly spacing: {
    readonly xs: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
  };
}

function px(value: number): string {
  return `${Math.round(value)}px`;
}

function unit(value: number): number {
  return Math.max(0, Math.min(1, (value + 1) / 2));
}

export function seedToGeometry(quaternion: Quaternion): GeometryTokens {
  const softness: number = unit(quaternion.w);
  const atmosphere: number = 1 - unit(quaternion.x);
  const radiusBase: number = softness < 0.24 ? BORDER_RADIUS[0] : BORDER_RADIUS[2] + softness * 18;
  const tilt: number = (quaternion.y - quaternion.z) * 4;
  const blur: number = atmosphere * 18;
  const spacingMultiplier: number = 0.75 + softness * 0.9;

  return {
    radius: {
      small: px(radiusBase * 0.5),
      medium: px(radiusBase),
      large: px(radiusBase * 1.618),
      asymmetric: `${px(Math.abs(quaternion.w) * 18 + BORDER_RADIUS[1])} ${px(Math.abs(quaternion.x) * 18 + BORDER_RADIUS[1])} ${px(Math.abs(quaternion.z) * 18 + BORDER_RADIUS[1])} ${px(Math.abs(quaternion.y) * 18 + BORDER_RADIUS[1])}`
    },
    tilt: `${tilt.toFixed(2)}deg`,
    blur: px(blur),
    textureOpacity: Number((0.02 + Math.abs(quaternion.y) * 0.08).toFixed(3)),
    spacing: {
      xs: px(SPACING[1] * spacingMultiplier),
      sm: px(SPACING[2] * spacingMultiplier),
      md: px(SPACING[3] * spacingMultiplier),
      lg: px(SPACING[4] * spacingMultiplier),
      xl: px(SPACING[5] * spacingMultiplier)
    }
  };
}
