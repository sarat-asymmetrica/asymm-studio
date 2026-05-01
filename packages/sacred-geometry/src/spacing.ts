/**
 * SPACING SYSTEM
 * Fibonacci-based spacing scale for layouts
 *
 * Philosophy: Natural rhythm through mathematical progression
 * Foundation: Fibonacci sequence (8, 13, 21, 34, 55, 89, 144)
 */

import { FIBONACCI, PHI, fibonacci, goldenScale } from "./constants.js";

// ═══════════════════════════════════════════════════════════════════════════
// SPACING SCALE (Fibonacci pixels)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Fibonacci spacing scale (in pixels)
 * Each step is a Fibonacci number
 *
 * Usage:
 * - 0: No spacing
 * - 1: 8px (caption/tight spacing)
 * - 2: 13px (small spacing)
 * - 3: 21px (medium spacing - base)
 * - 4: 34px (large spacing)
 * - 5: 55px (extra large spacing)
 * - 6: 89px (2XL spacing)
 * - 7: 144px (3XL spacing)
 * - 8: 233px (hero spacing)
 */
export const SPACING = {
  0: 0,
  1: 8, // Fib[6]
  2: 13, // Fib[7]
  3: 21, // Fib[8] - Base unit
  4: 34, // Fib[9]
  5: 55, // Fib[10]
  6: 89, // Fib[11]
  7: 144, // Fib[12]
  8: 233, // Fib[13]
} as const;

export type SpacingKey = keyof typeof SPACING;

/**
 * Semantic spacing aliases
 * Named by purpose rather than size
 */
export const SPACING_SEMANTIC = {
  NONE: SPACING[0],
  TIGHT: SPACING[1], // 8px - Tight spacing (buttons, inline elements)
  COZY: SPACING[2], // 13px - Cozy spacing (form fields)
  COMFORTABLE: SPACING[3], // 21px - Comfortable (paragraphs, cards)
  RELAXED: SPACING[4], // 34px - Relaxed (sections)
  SPACIOUS: SPACING[5], // 55px - Spacious (page sections)
  EXPANSIVE: SPACING[6], // 89px - Expansive (hero sections)
  GRAND: SPACING[7], // 144px - Grand (page margins)
  MONUMENTAL: SPACING[8], // 233px - Monumental (splash screens)
} as const;

/**
 * Responsive spacing multipliers
 * Adjust spacing based on viewport size
 */
export const SPACING_RESPONSIVE = {
  MOBILE: 0.618, // Multiply by φ⁻¹ on mobile
  TABLET: 1.0, // Base scale on tablet
  DESKTOP: 1.618, // Multiply by φ on desktop
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS (Fibonacci progression)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Border radius scale (Fibonacci)
 * [0, 1, 2, 3, 5, 8, 13, 21]
 *
 * Usage:
 * - 0: No rounding (sharp corners)
 * - 1: 1px (very subtle)
 * - 2: 2px (subtle)
 * - 3: 3px (gentle)
 * - 4: 5px (noticeable)
 * - 5: 8px (rounded)
 * - 6: 13px (very rounded)
 * - 7: 21px (pill-like)
 */
export const BORDER_RADIUS = {
  0: 0, // Sharp
  1: 1, // Fib[2]
  2: 2, // Fib[3]
  3: 3, // Fib[4]
  4: 5, // Fib[5]
  5: 8, // Fib[6]
  6: 13, // Fib[7]
  7: 21, // Fib[8]
  FULL: 9999, // Fully rounded (circle/pill)
} as const;

export type BorderRadiusKey = keyof typeof BORDER_RADIUS;

/**
 * Semantic border radius
 */
export const BORDER_RADIUS_SEMANTIC = {
  SHARP: BORDER_RADIUS[0],
  SUBTLE: BORDER_RADIUS[2],
  GENTLE: BORDER_RADIUS[3],
  ROUNDED: BORDER_RADIUS[5],
  PILL: BORDER_RADIUS[7],
  CIRCLE: BORDER_RADIUS.FULL,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CONTAINER WIDTHS (Golden ratio based)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Container max widths (golden ratio progression)
 * Based on 1440px design (common 2025 standard)
 */
export const CONTAINER_WIDTHS = {
  XS: 320, // Mobile portrait
  SM: 640, // Mobile landscape / Small tablet
  MD: 768, // Tablet portrait
  LG: 1024, // Tablet landscape / Small laptop
  XL: 1280, // Desktop
  XXL: 1440, // Large desktop
  XXXL: 1920, // Full HD
  READING: 680, // Optimal reading width (60-75 characters @ 16px)
  CONTENT: Math.round(1440 * PHI ** -1), // 890px - Golden ratio content
  WIDE: Math.round(1440 * PHI), // 2330px - Ultra-wide
} as const;

export type ContainerWidthKey = keyof typeof CONTAINER_WIDTHS;

// ═══════════════════════════════════════════════════════════════════════════
// GRID SYSTEM (12 column + Golden ratio gutter)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Grid configuration
 * 12 columns (divisible by 2, 3, 4, 6)
 * Gutter: Fibonacci-based
 */
export const GRID = {
  COLUMNS: 12,
  GUTTER: {
    MOBILE: SPACING[2], // 13px
    TABLET: SPACING[3], // 21px
    DESKTOP: SPACING[4], // 34px
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Z-INDEX SCALE (Fibonacci)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Z-index scale (Fibonacci)
 * Prevents z-index wars by using predefined scale
 */
export const Z_INDEX = {
  NEGATIVE: -1,
  BASE: 0,
  RAISED: 1, // Fib[2]
  OVERLAY: 8, // Fib[6] - Tooltips, dropdowns
  MODAL: 13, // Fib[7] - Modals, dialogs
  POPOVER: 21, // Fib[8] - Popovers
  TOAST: 34, // Fib[9] - Notifications
  TOOLTIP: 55, // Fib[10] - Tooltips (highest)
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get spacing value at scale level
 * @param scale - Spacing scale (0-8)
 * @returns Spacing in pixels
 */
export function spacing(scale: SpacingKey): number {
  return SPACING[scale];
}

/**
 * Get responsive spacing
 * @param scale - Spacing scale (0-8)
 * @param breakpoint - Viewport size ('mobile' | 'tablet' | 'desktop')
 * @returns Adjusted spacing in pixels
 */
export function spacingResponsive(
  scale: SpacingKey,
  breakpoint: keyof typeof SPACING_RESPONSIVE
): number {
  const base = SPACING[scale];
  const multiplier =
    SPACING_RESPONSIVE[breakpoint.toUpperCase() as keyof typeof SPACING_RESPONSIVE];
  return Math.round(base * multiplier);
}

/**
 * Generate custom spacing scale
 * @param baseUnit - Base spacing unit
 * @param steps - Number of steps
 * @returns Array of spacing values (Fibonacci scaled)
 */
export function generateSpacingScale(baseUnit: number, steps: number = 7): number[] {
  // Use Fibonacci indices: 6, 7, 8, 9, 10, 11, 12
  const fibIndices = Array.from({ length: steps }, (_, i) => i + 6);

  // Scale to match base unit
  const scale = baseUnit / fibonacci(fibIndices[0]);

  return fibIndices.map((idx) => Math.round(fibonacci(idx) * scale));
}

/**
 * Get golden ratio column widths
 * Divide total width into golden ratio proportions
 *
 * @param totalWidth - Total width to divide
 * @param count - Number of columns
 * @returns Array of column widths
 *
 * @example
 * goldenColumns(1000, 2) → [618, 382]
 * goldenColumns(1000, 3) → [618, 236, 146]
 */
export function goldenColumns(totalWidth: number, count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [totalWidth];

  const result: number[] = [];
  let remaining = totalWidth;

  for (let i = 0; i < count; i++) {
    if (i === count - 1) {
      // Last column gets remaining width
      result.push(remaining);
    } else {
      // Each column is φ⁻¹ of remaining
      const width = Math.round(remaining * PHI ** -1);
      result.push(width);
      remaining -= width;
    }
  }

  return result;
}

/**
 * Calculate optimal number of columns for container width
 * Aims for ~60-75 characters per column (optimal reading)
 *
 * @param containerWidth - Container width in pixels
 * @param fontSize - Font size in pixels
 * @returns Optimal number of columns
 */
export function optimalColumns(containerWidth: number, fontSize: number = 16): number {
  // Assuming ~0.5em per character
  const charWidth = fontSize * 0.5;
  const targetColumnWidth = charWidth * 67.5; // ~67.5 chars (middle of 60-75)

  const gutterWidth = GRID.GUTTER.DESKTOP;

  let cols = Math.floor(containerWidth / (targetColumnWidth + gutterWidth));

  // Clamp to 1-4 columns (more than 4 is rarely readable)
  return Math.max(1, Math.min(4, cols));
}

/**
 * Generate padding values (TRBL)
 * @param top - Top spacing key
 * @param right - Right spacing key (defaults to top)
 * @param bottom - Bottom spacing key (defaults to top)
 * @param left - Left spacing key (defaults to right)
 * @returns [top, right, bottom, left] in pixels
 */
export function padding(
  top: SpacingKey,
  right?: SpacingKey,
  bottom?: SpacingKey,
  left?: SpacingKey
): [number, number, number, number] {
  return [
    SPACING[top],
    SPACING[right ?? top],
    SPACING[bottom ?? top],
    SPACING[left ?? right ?? top],
  ];
}

/**
 * Generate margin values (TRBL)
 * @param top - Top spacing key
 * @param right - Right spacing key (defaults to top)
 * @param bottom - Bottom spacing key (defaults to top)
 * @param left - Left spacing key (defaults to right)
 * @returns [top, right, bottom, left] in pixels
 */
export function margin(
  top: SpacingKey,
  right?: SpacingKey,
  bottom?: SpacingKey,
  left?: SpacingKey
): [number, number, number, number] {
  return padding(top, right, bottom, left); // Same logic
}
