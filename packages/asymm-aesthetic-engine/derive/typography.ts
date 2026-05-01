import { PHI } from '../../sacred-geometry/src/constants.js';

import type { Quaternion } from '../seed/quaternion.js';

export interface TypeScale {
  readonly fontFamily: string;
  readonly weights: {
    readonly heading: number;
    readonly body: number;
  };
  readonly sizes: {
    readonly xs: string;
    readonly sm: string;
    readonly base: string;
    readonly h3: string;
    readonly h2: string;
    readonly h1: string;
  };
  readonly letterSpacing: string;
  readonly lineHeight: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundPx(value: number): string {
  return `${Math.round(value)}px`;
}

export function seedToTypography(quaternion: Quaternion): TypeScale {
  const precision: number = (quaternion.x + 1) / 2;
  const warmth: number = (quaternion.y + 1) / 2;
  const base: number = 15 + Math.round(warmth * 3);
  const headingWeight: number = Math.round(clamp(300 + precision * 500, 300, 800) / 50) * 50;
  const bodyWeight: number = precision > 0.72 ? 450 : 400;
  const letterSpacing: string = `${(0.02 - precision * 0.02).toFixed(3)}em`;
  const lineHeight: number = Number((1.45 + (1 - precision) * 0.35).toFixed(2));

  return {
    fontFamily: warmth > 0.62 ? "'DM Sans', Georgia, system-ui, sans-serif" : "'DM Sans', Inter, system-ui, sans-serif",
    weights: {
      heading: headingWeight,
      body: bodyWeight
    },
    sizes: {
      xs: roundPx(base / PHI),
      sm: roundPx(base / Math.sqrt(PHI)),
      base: roundPx(base),
      h3: roundPx(base * PHI),
      h2: roundPx(base * PHI * PHI),
      h1: roundPx(base * PHI * PHI * PHI)
    },
    letterSpacing,
    lineHeight
  };
}
