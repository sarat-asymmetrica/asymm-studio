import { CSS_EASING_MAP, getCSSEasing } from '../../sacred-geometry/src/easing.js';
import { FREQUENCIES, type FrequencyKey } from '../../sacred-geometry/src/constants.js';

import type { Quaternion } from '../seed/quaternion.js';

export interface MotionTokens {
  readonly easingName: string;
  readonly easing: string;
  readonly duration: string;
  readonly durationScale: number;
  readonly frequency: FrequencyKey;
  readonly spring: {
    readonly stiffness: number;
    readonly damping: number;
  };
  readonly reducedMotion: {
    readonly duration: string;
    readonly easing: string;
  };
}

const EASING_NAMES: readonly string[] = ['apana', 'phi', 'spanda', 'prana', 'easeInOut', 'linear'];
const FREQUENCY_KEYS: readonly FrequencyKey[] = [3, 6, 9, 27, 48];

function unit(value: number): number {
  return Math.max(0, Math.min(1, (value + 1) / 2));
}

function pickIndex(value: number, length: number): number {
  return Math.min(length - 1, Math.floor(unit(value) * length));
}

export function seedToMotion(quaternion: Quaternion): MotionTokens {
  const easingName: string = EASING_NAMES[pickIndex(quaternion.y, EASING_NAMES.length)];
  const frequency: FrequencyKey = FREQUENCY_KEYS[pickIndex(quaternion.z, FREQUENCY_KEYS.length)];
  const durationScale: number = Number((0.72 + unit(quaternion.w) * 0.92).toFixed(2));
  const durationMs: number = Math.round(FREQUENCIES[frequency].duration * durationScale);
  const precision: number = unit(quaternion.x);

  return {
    easingName,
    easing: getCSSEasing(easingName),
    duration: `${durationMs}ms`,
    durationScale,
    frequency,
    spring: {
      stiffness: Number((0.04 + precision * 0.08).toFixed(3)),
      damping: Number((0.24 + (1 - precision) * 0.18).toFixed(3))
    },
    reducedMotion: {
      duration: '1ms',
      easing: CSS_EASING_MAP.linear
    }
  };
}
