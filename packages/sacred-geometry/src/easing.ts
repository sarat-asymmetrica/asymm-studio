/**
 * EASING SYSTEM
 * Kashmir Shaivism-inspired easing curves + Standard easings
 *
 * Philosophy: Prana (inhale), Apana (exhale), Phi (golden ratio), Spanda (primordial vibration)
 * Foundation: Mathematical curves that feel natural
 */

import { PHI, PHI_INVERSE } from "./constants.js";

// ═══════════════════════════════════════════════════════════════════════════
// EASING FUNCTION TYPE
// Maps input time (0→1) to output progress (0→1)
// ═══════════════════════════════════════════════════════════════════════════

export type EasingFunction = (t: number) => number;

// ═══════════════════════════════════════════════════════════════════════════
// KASHMIR SHAIVISM EASINGS
// Inspired by breath, golden ratio, primordial vibration
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Prana (Inhale) easing
 * Ease-in curve using golden ratio
 * Feels like inhalation - slow start, accelerating
 */
export const prana: EasingFunction = (t: number): number => {
  return Math.pow(t, PHI_INVERSE);
};

/**
 * Apana (Exhale) easing
 * Ease-out curve using golden ratio
 * Feels like exhalation - fast start, decelerating
 */
export const apana: EasingFunction = (t: number): number => {
  return 1 - Math.pow(1 - t, PHI_INVERSE);
};

/**
 * Phi (Golden ratio) easing
 * Balanced ease-in-out using φ
 * Natural-feeling curve
 */
export const phi: EasingFunction = (t: number): number => {
  if (t < 0.5) {
    return Math.pow(t * 2, PHI) / 2;
  } else {
    return 1 - Math.pow(2 - t * 2, PHI) / 2;
  }
};

/**
 * Spanda (Primordial vibration) easing
 * Smooth with slight overshoot (0.22, 1, 0.36, 1)
 * Vibrant, alive feeling
 */
export const spanda: EasingFunction = cubicBezier(0.22, 1, 0.36, 1);

/**
 * Prana-Apana combined
 * Breathing rhythm (from vedic-constants.ts)
 */
export const pranaApana: EasingFunction = (t: number): number => {
  if (t < 0.5) {
    return Math.pow(t * 2, PHI_INVERSE); // Inhale (Prana)
  } else {
    return 1 - Math.pow(2 - t * 2, PHI_INVERSE); // Exhale (Apana)
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// STANDARD EASINGS (Penner's equations)
// ═══════════════════════════════════════════════════════════════════════════

export const linear: EasingFunction = (t: number): number => t;

// Quadratic
export const easeInQuad: EasingFunction = (t: number): number => t * t;
export const easeOutQuad: EasingFunction = (t: number): number => t * (2 - t);
export const easeInOutQuad: EasingFunction = (t: number): number =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

// Cubic
export const easeInCubic: EasingFunction = (t: number): number => t * t * t;
export const easeOutCubic: EasingFunction = (t: number): number => {
  t--;
  return t * t * t + 1;
};
export const easeInOutCubic: EasingFunction = (t: number): number => {
  if (t < 0.5) {
    return 4 * t * t * t;
  } else {
    t = 2 * t - 2;
    return (t * t * t + 2) / 2;
  }
};

// Sine
export const easeInSine: EasingFunction = (t: number): number =>
  1 - Math.cos(t * Math.PI / 2);

export const easeOutSine: EasingFunction = (t: number): number =>
  Math.sin(t * Math.PI / 2);

export const easeInOutSine: EasingFunction = (t: number): number =>
  -(Math.cos(Math.PI * t) - 1) / 2;

// Exponential
export const easeInExpo: EasingFunction = (t: number): number =>
  t === 0 ? 0 : Math.pow(2, 10 * (t - 1));

export const easeOutExpo: EasingFunction = (t: number): number =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

export const easeInOutExpo: EasingFunction = (t: number): number => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
  return (2 - Math.pow(2, -20 * t + 10)) / 2;
};

// Back
const backConstant = 1.70158;

export const easeInBack: EasingFunction = (t: number): number =>
  t * t * ((backConstant + 1) * t - backConstant);

export const easeOutBack: EasingFunction = (t: number): number => {
  t--;
  return t * t * ((backConstant + 1) * t + backConstant) + 1;
};

export const easeInOutBack: EasingFunction = (t: number): number => {
  const s = backConstant * 1.525;
  t *= 2;
  if (t < 1) {
    return (t * t * ((s + 1) * t - s)) / 2;
  }
  t -= 2;
  return (t * t * ((s + 1) * t + s) + 2) / 2;
};

// Elastic
export const easeInElastic: EasingFunction = (t: number): number => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
};

export const easeOutElastic: EasingFunction = (t: number): number => {
  if (t === 0) return 0;
  if (t === 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// Bounce
export const easeOutBounce: EasingFunction = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    t -= 1.5 / d1;
    return n1 * t * t + 0.75;
  } else if (t < 2.5 / d1) {
    t -= 2.25 / d1;
    return n1 * t * t + 0.9375;
  }
  t -= 2.625 / d1;
  return n1 * t * t + 0.984375;
};

export const easeInBounce: EasingFunction = (t: number): number =>
  1 - easeOutBounce(1 - t);

// ═══════════════════════════════════════════════════════════════════════════
// CUBIC BEZIER (CSS-style custom easing)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create cubic bezier easing function
 * @param p1x - Control point 1 X
 * @param p1y - Control point 1 Y
 * @param p2x - Control point 2 X
 * @param p2y - Control point 2 Y
 * @returns Easing function
 */
export function cubicBezier(p1x: number, p1y: number, p2x: number, p2y: number): EasingFunction {
  return (t: number): number => {
    // Newton-Raphson iteration
    let guess = t;

    for (let i = 0; i < 4; i++) {
      const currentX =
        3 * (1 - guess) * (1 - guess) * guess * p1x +
        3 * (1 - guess) * guess * guess * p2x +
        guess * guess * guess;

      const derivative =
        3 * (1 - guess) * (1 - guess) * p1x +
        6 * (1 - guess) * guess * (p2x - p1x) +
        3 * guess * guess * (1 - p2x);

      if (Math.abs(derivative) < 1e-6) break;

      guess = guess - (currentX - t) / derivative;
    }

    const y =
      3 * (1 - guess) * (1 - guess) * guess * p1y +
      3 * (1 - guess) * guess * guess * p2y +
      guess * guess * guess;

    return y;
  };
}

// CSS presets
export const ease = cubicBezier(0.25, 0.1, 0.25, 1.0);
export const easeIn = cubicBezier(0.42, 0, 1.0, 1.0);
export const easeOut = cubicBezier(0, 0, 0.58, 1.0);
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1.0);

// ═══════════════════════════════════════════════════════════════════════════
// EASING REGISTRY
// Quick access by string name
// ═══════════════════════════════════════════════════════════════════════════

export const EASING_REGISTRY: Record<string, EasingFunction> = {
  // Kashmir Shaivism
  prana,
  apana,
  phi,
  spanda,
  pranaApana,

  // Standard
  linear,

  // Quad
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,

  // Cubic
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,

  // Sine
  easeInSine,
  easeOutSine,
  easeInOutSine,

  // Expo
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,

  // Back
  easeInBack,
  easeOutBack,
  easeInOutBack,

  // Elastic
  easeInElastic,
  easeOutElastic,

  // Bounce
  easeInBounce,
  easeOutBounce,

  // CSS
  ease,
  easeIn,
  easeOut,
  easeInOut,
} as const;

/**
 * Get easing function by name
 * @param name - Easing name
 * @returns Easing function (defaults to linear if not found)
 */
export function getEasing(name: string): EasingFunction {
  return EASING_REGISTRY[name] || linear;
}

/**
 * Get all available easing names
 */
export function getEasingNames(): string[] {
  return Object.keys(EASING_REGISTRY);
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS CONVERSION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert easing function to CSS cubic-bezier string
 * Only works for named CSS easings
 */
export const CSS_EASING_MAP: Record<string, string> = {
  prana: "cubic-bezier(0.4, 0, 0.2, 1)", // ease-in
  apana: "cubic-bezier(0, 0, 0.2, 1)", // ease-out
  phi: `cubic-bezier(${PHI_INVERSE}, 0, ${1 - PHI_INVERSE}, 1)`, // φ-based
  spanda: "cubic-bezier(0.22, 1, 0.36, 1)", // vibrant

  linear: "linear",
  ease: "cubic-bezier(0.25, 0.1, 0.25, 1.0)",
  easeIn: "cubic-bezier(0.42, 0, 1.0, 1.0)",
  easeOut: "cubic-bezier(0, 0, 0.58, 1.0)",
  easeInOut: "cubic-bezier(0.42, 0, 0.58, 1.0)",
} as const;

/**
 * Get CSS easing string
 * @param name - Easing name
 * @returns CSS cubic-bezier string
 */
export function getCSSEasing(name: string): string {
  return CSS_EASING_MAP[name] || "ease-in-out";
}
