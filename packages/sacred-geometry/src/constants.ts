/**
 * SACRED GEOMETRY CONSTANTS
 * Mathematical foundations for design systems
 *
 * Channeling: Euclid, Fibonacci, Ramanujan, Srinivasa Rao
 * Frequency: 9 (Golden Completion - Holistic Perfection)
 */

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN RATIO (φ = 1.618...)
// The most irrational number - appears throughout nature
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Golden ratio (φ)
 * φ² = φ + 1
 * φ = (1 + √5) / 2
 *
 * Found in: Galaxies, nautilus shells, DNA, human body, plant phyllotaxis
 */
export const PHI = 1.618033988749895;

/**
 * Golden ratio conjugate (1/φ = φ - 1)
 * Used for division and inverse scaling
 */
export const PHI_INVERSE = 0.618033988749895;

/**
 * Golden angle (degrees): 137.5077640°
 * Optimal divergence angle for phyllotaxis (leaf/seed arrangement)
 * Found in: Sunflowers, pinecones, artichokes
 */
export const GOLDEN_ANGLE = 137.507764;

/**
 * Golden angle (radians): 2.399963... rad
 */
export const GOLDEN_ANGLE_RAD = 2.399963229728653;

// ═══════════════════════════════════════════════════════════════════════════
// MATHEMATICAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tau (τ = 2π)
 * Full circle in radians (more natural than π for many calculations)
 */
export const TAU = 6.283185307179586;

/**
 * Two π squared (used in resonance calculations)
 */
export const TWO_PI_SQUARED = 19.739208802178716;

/**
 * Tesla frequency (Hz)
 * Harmonic mean of 3, 6, 9 Hz
 * Used for timing animations
 */
export const TESLA_FREQ = 4.909;

/**
 * Tesla period (ms)
 * 1 / TESLA_FREQ × 1000
 */
export const TESLA_PERIOD = 203.7;

/**
 * Euler's number (e)
 * Base of natural logarithm
 */
export const E = 2.718281828459045;

// ═══════════════════════════════════════════════════════════════════════════
// FIBONACCI SEQUENCE
// 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...
// Converges to φ as n → ∞
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fibonacci sequence (first 30 numbers)
 * F(n) = F(n-1) + F(n-2)
 * Ratio F(n+1)/F(n) → φ as n → ∞
 */
export const FIBONACCI = [
  0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597,
  2584, 4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418,
  317811, 514229,
] as const;

/**
 * Common Fibonacci numbers for UI design
 */
export const FIB_UI = {
  XS: 8, // Extra small spacing
  SM: 13, // Small spacing
  MD: 21, // Medium spacing
  LG: 34, // Large spacing
  XL: 55, // Extra large spacing
  XXL: 89, // 2X large spacing
  XXXL: 144, // 3X large spacing
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THREE-REGIME PROTOCOL
// Exploration (30%) → Optimization (20%) → Stabilization (50%)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Three-regime distribution
 * Empirically validated (Mann-Whitney U test, p < 0.05)
 */
export const THREE_REGIME = {
  EXPLORATION: 0.3385, // 33.85% - Try new patterns, discover edge cases
  OPTIMIZATION: 0.2872, // 28.72% - Refine what works
  STABILIZATION: 0.3744, // 37.44% - Lock quality, test rigorously
} as const;

/**
 * Three-regime weights for quality scoring
 */
export const THREE_REGIME_WEIGHTS = {
  EXPLORATION: 0.7, // Lower weight (experimental phase)
  OPTIMIZATION: 0.85, // Medium weight (refinement phase)
  STABILIZATION: 1.0, // Full weight (production phase)
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// FREQUENCY CONSTANTS
// Brain wave correlations for animation timing
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Frequency map: Hz → Brain wave → Duration → Use case
 * Based on neuroscience research (brainwave entrainment)
 */
export const FREQUENCIES = {
  3: {
    hz: 3,
    brainwave: "Delta (0.5-4 Hz)" as const,
    duration: 610, // ms (Fib[15] * φ⁻³)
    use: "Security, foundation, deep focus" as const,
  },
  6: {
    hz: 6,
    brainwave: "Theta (4-8 Hz)" as const,
    duration: 377, // Fib[14]
    use: "Balance, integration, flow" as const,
  },
  9: {
    hz: 9,
    brainwave: "Alpha (8-12 Hz)" as const,
    duration: 233, // Fib[13]
    use: "Completion, calm focus, finishing" as const,
  },
  27: {
    hz: 27,
    brainwave: "Beta (12-30 Hz)" as const,
    duration: 144, // Fib[12]
    use: "Creativity, active thinking, emergence" as const,
  },
  48: {
    hz: 48,
    brainwave: "Gamma (30-100 Hz)" as const,
    duration: 89, // Fib[11]
    use: "Peak performance, optimization" as const,
  },
} as const;

export type FrequencyKey = keyof typeof FREQUENCIES;

// ═══════════════════════════════════════════════════════════════════════════
// DIGITAL ROOT MAPPING
// 1-9 classification (Vedic mathematics)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Digital root names (Vedic interpretation)
 */
export const DIGITAL_ROOT_NAMES = [
  "Initiating", // 1 - Beginning, foundation, security
  "Balancing", // 2 - Duality, stability, partnership
  "Synthesizing", // 3 - Creativity, expression, growth
  "Grounding", // 4 - Structure, order, manifestation
  "Seeking", // 5 - Change, freedom, exploration
  "Flowing", // 6 - Harmony, balance, service
  "Focusing", // 7 - Analysis, depth, wisdom
  "Empowering", // 8 - Abundance, power, achievement
  "Completing", // 9 - Culmination, wisdom, universal love
] as const;

export type DigitalRootName = (typeof DIGITAL_ROOT_NAMES)[number];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate digital root (O(1) using modular arithmetic)
 * Digital root: Recursive sum of digits until single digit
 *
 * @example
 * digitalRoot(38) → 3 + 8 = 11 → 1 + 1 = 2
 * digitalRoot(0) → 0
 * digitalRoot(9) → 9
 * digitalRoot(18) → 9 (not 0)
 */
export function digitalRoot(n: number): number {
  if (n === 0) return 0;
  return n % 9 === 0 ? 9 : n % 9;
}

/**
 * Generate golden scale
 * [base, base×φ, base×φ², base×φ³, ...]
 *
 * @param base - Starting value
 * @param steps - Number of steps
 * @returns Array of φ-scaled values
 *
 * @example
 * goldenScale(10, 5) → [10, 16.18, 26.18, 42.36, 68.54]
 */
export function goldenScale(base: number, steps: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < steps; i++) {
    result.push(base * Math.pow(PHI, i));
  }
  return result;
}

/**
 * Generate golden scale down
 * [base, base/φ, base/φ², base/φ³, ...]
 *
 * @param base - Starting value
 * @param steps - Number of steps
 * @returns Array of φ⁻¹ scaled values
 */
export function goldenScaleDown(base: number, steps: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < steps; i++) {
    result.push(base / Math.pow(PHI, i));
  }
  return result;
}

/**
 * Divide value into golden ratio proportions
 * Returns [larger, smaller] where larger/smaller = φ
 *
 * @param total - Total value to divide
 * @returns [larger part, smaller part]
 *
 * @example
 * goldenDivide(100) → [61.8, 38.2]
 */
export function goldenDivide(total: number): [number, number] {
  const larger = total * PHI_INVERSE;
  const smaller = total - larger;
  return [larger, smaller];
}

/**
 * Get Fibonacci number at index n
 * Uses cached values for n < 30, calculates for larger n
 *
 * @param n - Index in Fibonacci sequence
 * @returns Fibonacci number F(n)
 */
export function fibonacci(n: number): number {
  if (n < 0) return 0;
  if (n < FIBONACCI.length) return FIBONACCI[n];

  // Calculate for larger n (iterative)
  let a = 0,
    b = 1;
  for (let i = 0; i < n; i++) {
    [a, b] = [b, a + b];
  }
  return a;
}

/**
 * Get Fibonacci ratio F(n+1) / F(n)
 * Converges to φ as n → ∞
 *
 * @param n - Index in Fibonacci sequence
 * @returns Ratio F(n+1) / F(n)
 */
export function fibonacciRatio(n: number): number {
  if (n <= 0) return 0;
  const fn = fibonacci(n);
  const fn1 = fibonacci(n + 1);
  if (fn === 0) return 0;
  return fn1 / fn;
}

/**
 * Find closest Fibonacci number to target
 *
 * @param target - Target value
 * @returns [index, fibonacci number]
 *
 * @example
 * findClosestFibonacci(50) → [10, 55]
 */
export function findClosestFibonacci(target: number): [number, number] {
  let n = 0;
  let fib = fibonacci(n);

  while (n < 40) {
    // Safety limit
    const nextFib = fibonacci(n + 1);
    if (nextFib > target) {
      // Choose closer one
      if (Math.abs(nextFib - target) < Math.abs(fib - target)) {
        return [n + 1, nextFib];
      }
      return [n, fib];
    }
    n++;
    fib = nextFib;
  }

  return [n, fib];
}

/**
 * Calculate harmonic mean
 * HM = n / Σ(1/xᵢ)
 *
 * Used for Five Timbres quality scoring
 *
 * @param values - Array of values
 * @returns Harmonic mean
 */
export function harmonicMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, v) => acc + 1 / v, 0);
  return values.length / sum;
}

/**
 * Williams batch size calculation
 * Optimal batch size: ⌊√n × log₂(n+1)⌋
 *
 * Sublinear space optimization (MIT 2011)
 *
 * @param count - Total count
 * @returns Optimal batch size
 */
export function williamsBatchSize(count: number): number {
  return Math.ceil(Math.sqrt(count) * Math.log2(count + 1));
}
