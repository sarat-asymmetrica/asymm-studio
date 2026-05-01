/**
 * COLOR SYSTEM
 * Digital root mapping + Museum atelier aesthetic
 *
 * Philosophy: Deep blacks (#0a0a0a), electric blues (#0ea5e9), NO mystical language
 * Foundation: Digital root (1-9) → Distinct hues (40° apart on color wheel)
 */

import { digitalRoot, DIGITAL_ROOT_NAMES, GOLDEN_ANGLE, PHI } from "./constants.js";

// ═══════════════════════════════════════════════════════════════════════════
// COLOR TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface RGBA {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a: number; // 0-1
}

export interface HSLA {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a: number; // 0-1
}

// ═══════════════════════════════════════════════════════════════════════════
// MUSEUM ATELIER PALETTE
// Deep blacks, electric blues, NO clutter
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Museum atelier theme
 * Inspired by: Yohji Yamamoto, MoMA, Guggenheim, Edward Tufte
 *
 * "Black is modest and arrogant at the same time" - Yohji Yamamoto
 */
export const MUSEUM_THEME = {
  // Backgrounds (deep blacks, breathing room)
  BG: {
    PRIMARY: "#0a0a0a", // Deep black (museum walls)
    SECONDARY: "#171717", // Slightly lighter
    TERTIARY: "#262626", // Card backgrounds
    ELEVATED: "#333333", // Elevated surfaces
  },

  // Text (almost white to gray scale)
  TEXT: {
    PRIMARY: "#fafafa", // Almost white (high contrast)
    SECONDARY: "#a3a3a3", // Gray (secondary info)
    TERTIARY: "#525252", // Darker gray (captions)
    DISABLED: "#404040", // Disabled state
  },

  // Accents (electric blues, surgical precision)
  ACCENT: {
    PRIMARY: "#0ea5e9", // Electric blue (primary action)
    SECONDARY: "#06b6d4", // Cyan (secondary action)
    SUCCESS: "#10b981", // Emerald (success state)
    WARNING: "#f59e0b", // Amber (warning state)
    ERROR: "#ef4444", // Red (error state)
    INFO: "#3b82f6", // Blue (info state)
  },

  // Borders (subtle, museum-like)
  BORDER: {
    SUBTLE: "#262626", // Barely visible
    DEFAULT: "#333333", // Default border
    STRONG: "#525252", // Strong border
    ACCENT: "#0ea5e9", // Accent border
  },

  // Shadows (subtle, museum lighting)
  SHADOW: {
    SM: "rgba(0, 0, 0, 0.05)",
    MD: "rgba(0, 0, 0, 0.1)",
    LG: "rgba(0, 0, 0, 0.2)",
    XL: "rgba(0, 0, 0, 0.3)",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DIGITAL ROOT COLOR MAPPING (1-9)
// Each digital root gets a distinct hue (40° apart on color wheel)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Digital root color wheel
 * 360° / 9 = 40° per root
 *
 * Hue progression:
 * 1: 0° (Red) - Initiating
 * 2: 40° (Deep Orange) - Balancing
 * 3: 80° (Orange/Yellow) - Synthesizing
 * 4: 120° (Green) - Grounding
 * 5: 160° (Teal) - Seeking
 * 6: 200° (Cyan/Blue) - Flowing
 * 7: 240° (Blue) - Focusing
 * 8: 280° (Violet) - Empowering
 * 9: 320° (Magenta) - Completing
 */
export const DIGITAL_ROOT_COLORS: Record<number, string> = {
  1: "#ef4444", // Red (0°) - Initiating
  2: "#ea580c", // Deep orange (40°) - Balancing
  3: "#f97316", // Orange (80°) - Synthesizing
  4: "#84cc16", // Lime (120°) - Grounding
  5: "#14b8a6", // Teal (160°) - Seeking
  6: "#0ea5e9", // Sky (200°) - Flowing
  7: "#3b82f6", // Blue (240°) - Focusing
  8: "#8b5cf6", // Violet (280°) - Empowering
  9: "#d946ef", // Magenta (320°) - Completing
} as const;

/**
 * Get color for digital root
 * @param dr - Digital root (1-9)
 * @returns Hex color
 */
export function getDigitalRootColor(dr: number): string {
  if (dr < 1 || dr > 9) return DIGITAL_ROOT_COLORS[5]; // Default to teal (middle)
  return DIGITAL_ROOT_COLORS[dr];
}

/**
 * Get color for any number (using digital root)
 * @param n - Any number
 * @returns Hex color
 */
export function getNumberColor(n: number): string {
  return getDigitalRootColor(digitalRoot(n));
}

// ═══════════════════════════════════════════════════════════════════════════
// PHASE COLORS (VOID → FLOW → SOLUTION)
// Ananta reasoning pattern visualization
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Phase colors (Ananta reasoning)
 */
export const PHASE_COLORS = {
  VOID: "#8b5cf6", // Purple - Deep exploration, uncertainty
  FLOW: "#0ea5e9", // Electric blue - Active processing, flow state
  SOLUTION: "#10b981", // Green - Synthesis complete, clarity
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// GOLDEN ANGLE PALETTE
// For themes that need harmonious color relationships
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate golden angle palette
 * Colors spaced by golden angle (137.5°) on hue wheel
 *
 * @param baseHue - Starting hue (0-360)
 * @param count - Number of colors
 * @param saturation - Saturation (0-100)
 * @param lightness - Lightness (0-100)
 * @returns Array of hex colors
 *
 * @example
 * goldenAnglePalette(30, 5, 70, 50)
 * → ["#d9964d", "#4dd991", "#914dd9", "#d94d7f", "#7fd94d"]
 */
export function goldenAnglePalette(
  baseHue: number = 30,
  count: number = 7,
  saturation: number = 75,
  lightness: number = 55
): string[] {
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * GOLDEN_ANGLE) % 360;
    const color = hslToHex(hue, saturation, lightness);
    colors.push(color);
  }

  return colors;
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR SPACE CONVERSIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert HSL to RGB
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns RGBA object
 */
export function hslToRgb(h: number, s: number, l: number): RGBA {
  h = ((h % 360) + 360) % 360; // Normalize to [0, 360)
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a: 1,
  };
}

/**
 * Convert RGB to HSL
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns HSLA object
 */
export function rgbToHsl(r: number, g: number, b: number): HSLA {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: 1,
  };
}

/**
 * Convert hex to RGBA
 * @param hex - Hex color string (#RRGGBB or RRGGBB)
 * @returns RGBA object
 */
export function hexToRgb(hex: string): RGBA {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b, a: 1 };
}

/**
 * Convert RGBA to hex
 * @param r - Red (0-255)
 * @param g - Green (0-255)
 * @param b - Blue (0-255)
 * @returns Hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HSL to hex
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR MANIPULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Lighten a color by percentage
 * @param hex - Hex color
 * @param percent - Amount to lighten (0-100)
 * @returns Lighter hex color
 */
export function lighten(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.min(100, hsl.l + percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Darken a color by percentage
 * @param hex - Hex color
 * @param percent - Amount to darken (0-100)
 * @returns Darker hex color
 */
export function darken(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.l = Math.max(0, hsl.l - percent);
  return hslToHex(hsl.h, hsl.s, hsl.l);
}

/**
 * Add opacity to hex color
 * @param hex - Hex color
 * @param opacity - Opacity (0-1)
 * @returns RGBA string
 */
export function withOpacity(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex);
  opacity = Math.max(0, Math.min(1, opacity));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

/**
 * Mix two colors
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param weight - Weight of first color (0-1, default 0.5)
 * @returns Mixed hex color
 */
export function mix(color1: string, color2: string, weight: number = 0.5): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  weight = Math.max(0, Math.min(1, weight));

  const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight));
  const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight));
  const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight));

  return rgbToHex(r, g, b);
}

// ═══════════════════════════════════════════════════════════════════════════
// COLOR HARMONY
// Generate harmonious color schemes
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate complementary color (180° opposite)
 * @param hex - Base hex color
 * @returns Complementary hex color
 */
export function complementary(hex: string): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newHue = (hsl.h + 180) % 360;
  return hslToHex(newHue, hsl.s, hsl.l);
}

/**
 * Generate triadic colors (120° apart)
 * @param hex - Base hex color
 * @returns [base, triadic1, triadic2]
 */
export function triadic(hex: string): [string, string, string] {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return [
    hex,
    hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  ];
}

/**
 * Generate tetradic colors (90° apart)
 * @param hex - Base hex color
 * @returns [base, tetradic1, tetradic2, tetradic3]
 */
export function tetradic(hex: string): [string, string, string, string] {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return [
    hex,
    hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l),
  ];
}

/**
 * Generate analogous colors (30° apart)
 * @param hex - Base hex color
 * @returns [analogous1, base, analogous2]
 */
export function analogous(hex: string): [string, string, string] {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  return [
    hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
    hex,
    hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
  ];
}
