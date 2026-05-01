import { digitalRoot } from '../../sacred-geometry/src/constants.js';

import { deriveAll, type DesignTokens } from '../derive/index.js';
import type { Quaternion } from '../seed/quaternion.js';
import type { AestheticRegion } from '../seed/regions.js';

export interface ComponentDefinition {
  readonly name: string;
  readonly file: string;
  readonly category: string;
  readonly description: string;
}

export interface StyledComponent {
  readonly name: string;
  readonly category: string;
  readonly description: string;
  readonly region: string;
  readonly structure: {
    readonly element: string;
    readonly role: string;
    readonly slots: readonly string[];
  };
  readonly cssVariables: Readonly<Record<string, string>>;
  readonly traits: readonly string[];
}

interface ComponentProfile {
  readonly element: string;
  readonly role: string;
  readonly slots: readonly string[];
  readonly traits: readonly string[];
}

const DEFAULT_PROFILE: ComponentProfile = {
  element: 'section',
  role: 'group',
  slots: ['root', 'label', 'content'],
  traits: ['tokenized', 'responsive']
};

const CATEGORY_PROFILES: Readonly<Record<string, ComponentProfile>> = {
  'interactive-3d': { element: 'article', role: 'group', slots: ['root', 'media', 'content', 'glare'], traits: ['tilt', 'glare', 'depth'] },
  cyberpunk: { element: 'pre', role: 'log', slots: ['root', 'header', 'output', 'scanline'], traits: ['scanline', 'monospace', 'glow'] },
  'animation-text': { element: 'span', role: 'text', slots: ['root', 'glyphs'], traits: ['stagger', 'decode', 'text'] },
  'physics-interactive': { element: 'div', role: 'application', slots: ['root', 'field', 'body'], traits: ['spring', 'cursor-reactive', 'kinetic'] },
  'modal-dialog': { element: 'dialog', role: 'dialog', slots: ['backdrop', 'panel', 'title', 'content', 'actions'], traits: ['paper', 'focus-trap', 'overlay'] },
  '3d-loader': { element: 'div', role: 'status', slots: ['root', 'geometry', 'label'], traits: ['rotation', 'sacred-geometry', 'status'] },
  'form-toggle': { element: 'button', role: 'switch', slots: ['track', 'thumb', 'label'], traits: ['spring', 'binary', 'tactile'] },
  notification: { element: 'aside', role: 'status', slots: ['root', 'icon', 'message', 'action'], traits: ['ephemeral', 'stacked', 'motion'] },
  'interactive-button': { element: 'button', role: 'button', slots: ['root', 'label', 'patina'], traits: ['pressable', 'patina', 'stateful'] },
  'temporal-ui': { element: 'time', role: 'timer', slots: ['root', 'dial', 'ticks', 'value'], traits: ['cyclical', 'ticks', 'time'] },
  'form-input': { element: 'label', role: 'group', slots: ['root', 'input', 'stroke', 'hint'], traits: ['focus', 'ink', 'form'] },
  'form-slider': { element: 'label', role: 'group', slots: ['root', 'track', 'thumb', 'value'], traits: ['range', 'string', 'feedback'] },
  visualization: { element: 'figure', role: 'img', slots: ['root', 'plot', 'caption'], traits: ['data', 'organic', 'chart'] },
  feedback: { element: 'aside', role: 'alert', slots: ['root', 'icon', 'message', 'repair'], traits: ['repair', 'alert', 'gold'] },
  'hero-section': { element: 'section', role: 'banner', slots: ['root', 'headline', 'copy', 'action'], traits: ['hero', 'commerce', 'conversion'] }
};

function profileFor(category: string): ComponentProfile {
  return CATEGORY_PROFILES[category] ?? DEFAULT_PROFILE;
}

function quaternionSignature(quaternion: Quaternion): number {
  const scaled: number = Math.abs(
    Math.round(quaternion.w * 1000) +
      Math.round(quaternion.x * 2000) +
      Math.round(quaternion.y * 3000) +
      Math.round(quaternion.z * 4000)
  );

  return scaled === 0 ? 1 : scaled;
}

function categoryTreatment(category: string, tokens: DesignTokens): Readonly<Record<string, string>> {
  const treatments: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    'interactive-3d': { '--asymm-depth': tokens.geometry.tilt, '--asymm-glare': tokens.color.scale[3] },
    cyberpunk: { '--asymm-scanline-color': tokens.color.accent, '--asymm-font-mode': 'mono' },
    'animation-text': { '--asymm-stagger': '34ms', '--asymm-glyph-color': tokens.color.accent },
    'physics-interactive': { '--asymm-field-blur': tokens.geometry.blur, '--asymm-spring-k': String(tokens.motion.spring.stiffness) },
    'modal-dialog': { '--asymm-backdrop': tokens.color.scale[11], '--asymm-panel-texture': String(tokens.geometry.textureOpacity) },
    '3d-loader': { '--asymm-rotation-duration': tokens.motion.duration, '--asymm-orbit-color': tokens.color.accent },
    'form-toggle': { '--asymm-track': tokens.color.scale[2], '--asymm-thumb': tokens.color.primary },
    notification: { '--asymm-toast-border': tokens.color.accent, '--asymm-toast-duration': tokens.motion.duration },
    'interactive-button': { '--asymm-press-depth': tokens.geometry.tilt, '--asymm-patina': tokens.color.secondary },
    'temporal-ui': { '--asymm-tick-color': tokens.color.mutedText, '--asymm-cycle': tokens.motion.duration },
    'form-input': { '--asymm-focus-stroke': tokens.color.accent, '--asymm-input-radius': tokens.geometry.radius.medium },
    'form-slider': { '--asymm-string-color': tokens.color.secondary, '--asymm-thumb-radius': tokens.geometry.radius.large },
    visualization: { '--asymm-plot-color': tokens.color.primary, '--asymm-plot-accent': tokens.color.accent },
    feedback: { '--asymm-repair-color': tokens.color.accent, '--asymm-alert-color': tokens.color.danger },
    'hero-section': { '--asymm-hero-accent': tokens.color.accent, '--asymm-hero-gap': tokens.geometry.spacing.xl }
  };

  return treatments[category] ?? { '--asymm-component-accent': tokens.color.accent };
}

export function applyVariation(
  component: ComponentDefinition,
  quaternion: Quaternion,
  region: AestheticRegion
): StyledComponent {
  const tokens: DesignTokens = deriveAll(quaternion);
  const profile: ComponentProfile = profileFor(component.category);
  const root: number = digitalRoot(quaternionSignature(quaternion));
  const categoryVariables: Readonly<Record<string, string>> = categoryTreatment(component.category, tokens);

  return {
    name: component.name,
    category: component.category,
    description: component.description,
    region: region.name,
    structure: {
      element: profile.element,
      role: profile.role,
      slots: profile.slots
    },
    cssVariables: {
      '--asymm-color-bg': tokens.color.background,
      '--asymm-color-surface': tokens.color.surface,
      '--asymm-color-text': tokens.color.text,
      '--asymm-color-muted': tokens.color.mutedText,
      '--asymm-color-primary': tokens.color.primary,
      '--asymm-color-secondary': tokens.color.secondary,
      '--asymm-color-accent': tokens.color.accent,
      '--asymm-radius-sm': tokens.geometry.radius.small,
      '--asymm-radius-md': tokens.geometry.radius.medium,
      '--asymm-radius-lg': tokens.geometry.radius.large,
      '--asymm-radius-asymmetric': tokens.geometry.radius.asymmetric,
      '--asymm-space-md': tokens.geometry.spacing.md,
      '--asymm-space-lg': tokens.geometry.spacing.lg,
      '--asymm-type-heading': String(tokens.typography.weights.heading),
      '--asymm-type-body': String(tokens.typography.weights.body),
      '--asymm-line-height': String(tokens.typography.lineHeight),
      '--asymm-letter-spacing': tokens.typography.letterSpacing,
      '--asymm-motion-duration': tokens.motion.duration,
      '--asymm-motion-easing': tokens.motion.easing,
      '--asymm-digital-root': String(root),
      ...categoryVariables
    },
    traits: [...profile.traits, region.name]
  };
}
