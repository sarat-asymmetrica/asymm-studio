import { GOLDEN_ANGLE } from '../../sacred-geometry/src/constants.js';
import { hexToRgb, hslToHex, rgbToHsl } from '../../sacred-geometry/src/colors.js';

import type { Quaternion } from '../seed/quaternion.js';

export interface Palette {
  readonly baseHue: number;
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly danger: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly mutedText: string;
  readonly scale: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ];
}

type TwelveStepScale = Palette['scale'];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function componentToUnit(value: number): number {
  return clamp((value + 1) / 2, 0, 1);
}

function normalizeHue(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const channels: readonly number[] = [rgb.r, rgb.g, rgb.b].map((channel: number) => {
    const normalized: number = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });

  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

export function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance: number = relativeLuminance(foreground);
  const backgroundLuminance: number = relativeLuminance(background);
  const lighter: number = Math.max(foregroundLuminance, backgroundLuminance);
  const darker: number = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function readableText(background: string): string {
  return contrastRatio('#111111', background) >= contrastRatio('#ffffff', background)
    ? '#111111'
    : '#ffffff';
}

function radixScale(baseHue: number, saturation: number): Palette['scale'] {
  const lightness: readonly number[] = [99, 97, 94, 90, 84, 76, 66, 56, 46, 36, 26, 16];
  const colors: string[] = lightness.map((step: number, index: number) =>
    hslToHex(normalizeHue(baseHue + index * 0.6), clamp(saturation - index * 1.5, 18, 82), step)
  );

  if (colors.length !== 12) {
    throw new Error('Radix-style color scale must contain exactly 12 steps.');
  }

  return [
    colors[0]!,
    colors[1]!,
    colors[2]!,
    colors[3]!,
    colors[4]!,
    colors[5]!,
    colors[6]!,
    colors[7]!,
    colors[8]!,
    colors[9]!,
    colors[10]!,
    colors[11]!
  ] satisfies TwelveStepScale;
}

export function seedToPalette(quaternion: Quaternion): Palette {
  const baseHue: number = normalizeHue(10 + componentToUnit(quaternion.w) * 80);
  const saturation: number = 42 + componentToUnit(quaternion.y) * 34;
  const scale: Palette['scale'] = radixScale(baseHue, saturation);
  const accentHue: number = normalizeHue(baseHue + GOLDEN_ANGLE);
  const secondaryHue: number = normalizeHue(baseHue + GOLDEN_ANGLE * 4);
  const primary: string = hslToHex(baseHue, saturation, 44 + componentToUnit(quaternion.x) * 10);
  const background: string = scale[0];
  const text: string = readableText(background);

  return {
    baseHue,
    primary,
    secondary: hslToHex(secondaryHue, clamp(saturation - 10, 30, 70), 42),
    accent: hslToHex(accentHue, clamp(saturation + 8, 45, 84), 48),
    danger: hslToHex(0, 68, 48),
    background,
    surface: scale[1],
    text,
    mutedText: text === '#111111' ? '#4b5563' : '#d1d5db',
    scale
  };
}

export function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function hexHue(hex: string): number {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb.r, rgb.g, rgb.b).h;
}
