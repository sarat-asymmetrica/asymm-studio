/**
 * FREQUENCY SYSTEM
 * Brain wave correlation for animation timing
 *
 * Foundation: 3→6→9→27→48 Hz progression
 * Correlation: Delta, Theta, Alpha, Beta, Gamma brain waves
 */

import { FREQUENCIES, type FrequencyKey } from "./constants.js";

// ═══════════════════════════════════════════════════════════════════════════
// FREQUENCY TRANSITIONS
// Map frequency to animation duration + brain wave state
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get frequency configuration
 * @param freq - Frequency key (3, 6, 9, 27, 48)
 * @returns Frequency config (hz, brainwave, duration, use)
 */
export function getFrequency(freq: FrequencyKey) {
  return FREQUENCIES[freq];
}

/**
 * Get duration for frequency
 * @param freq - Frequency key
 * @returns Duration in milliseconds
 */
export function getFrequencyDuration(freq: FrequencyKey): number {
  return FREQUENCIES[freq].duration;
}

/**
 * Transition element between frequencies
 * @param element - HTML element
 * @param fromFreq - Starting frequency
 * @param toFreq - Target frequency
 * @param easingCurve - CSS easing curve (default: ease-in-out)
 */
export function transitionFrequency(
  element: HTMLElement,
  fromFreq: FrequencyKey,
  toFreq: FrequencyKey,
  easingCurve: string = "ease-in-out"
): void {
  const to = FREQUENCIES[toFreq];

  element.style.transition = `all ${to.duration}ms ${easingCurve}`;

  // Trigger reflow
  element.offsetHeight;

  // Apply transform (subtle scale based on φ)
  element.style.transform = `scale(${1 + 0.618 * 0.1})`;

  setTimeout(() => {
    element.style.transform = "scale(1)";
  }, to.duration);
}

/**
 * Get CSS transition string for frequency
 * @param freq - Frequency key
 * @param easingCurve - CSS easing curve
 * @returns CSS transition string
 */
export function getFrequencyTransition(freq: FrequencyKey, easingCurve: string = "ease-in-out"): string {
  return `all ${FREQUENCIES[freq].duration}ms ${easingCurve}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// FREQUENCY COLOR MAPPING
// Map frequency to digital root color
// ═══════════════════════════════════════════════════════════════════════════

import { DIGITAL_ROOT_COLORS } from "./colors.js";

/**
 * Get color for frequency
 * Maps frequency Hz to digital root color
 */
export const FREQUENCY_COLORS: Record<FrequencyKey, string> = {
  3: DIGITAL_ROOT_COLORS[3], // Orange - Synthesizing
  6: DIGITAL_ROOT_COLORS[6], // Sky - Flowing
  9: DIGITAL_ROOT_COLORS[9], // Magenta - Completing
  27: DIGITAL_ROOT_COLORS[9], // Magenta - Also golden (3×9)
  48: DIGITAL_ROOT_COLORS[3], // Orange - Back to foundation (4+8=12→3)
} as const;

/**
 * Get color for frequency
 * @param freq - Frequency key
 * @returns Hex color
 */
export function getFrequencyColor(freq: FrequencyKey): string {
  return FREQUENCY_COLORS[freq];
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENTATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Frequency usage guide:
 *
 * 3 Hz (Delta):
 * - Deep focus states
 * - Security confirmations
 * - Foundation animations
 * - Duration: 610ms
 *
 * 6 Hz (Theta):
 * - Balance and integration
 * - Flow state transitions
 * - Default animations
 * - Duration: 377ms
 *
 * 9 Hz (Alpha):
 * - Completion states
 * - Calm focus
 * - Success animations
 * - Duration: 233ms
 *
 * 27 Hz (Beta):
 * - Creative thinking
 * - Active state changes
 * - Quick interactions
 * - Duration: 144ms
 *
 * 48 Hz (Gamma):
 * - Peak performance
 * - Optimization feedback
 * - Instant responses
 * - Duration: 89ms
 */
