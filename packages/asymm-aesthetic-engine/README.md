# @asymm/aesthetic-engine

Deterministic design DNA for Asymm Studio. A seed becomes a unit quaternion, the quaternion becomes color, typography, geometry, motion, and component styling tokens.

## Quick Start

```ts
import { SeedToQuaternion, deriveAll } from '@asymm/aesthetic-engine';

const quaternion = SeedToQuaternion(618033);
const tokens = deriveAll(quaternion);
document.documentElement.style.setProperty('--asymm-primary', tokens.color.primary);
document.documentElement.style.setProperty('--asymm-radius', tokens.geometry.radius.medium);
```

## Seed API

`contentHash(value: string): number`
Returns a deterministic FNV-1a content hash for stable content-derived seeds.

`SeedToQuaternion(seed: number | string): Quaternion`
Maps a seed onto the S3 unit sphere.

`seedToQuaternion(seed: number | string): Quaternion`
Alias for `SeedToQuaternion`.

`Quaternion`
Value object with `w`, `x`, `y`, `z`, `magnitude()`, `norm()`, `normalize()`, and `toArray()`.

`temporalSeed(date?: Date): number`
Returns a UTC calendar-day seed.

`visitorSeed(fingerprint: string): number`
Maps an explicit opt-in fingerprint string to a seed. The package does not collect fingerprints.

`AESTHETIC_REGIONS`
Eight named quaternion-space regions: wabi-sabi, neumorphic-soft, brutal-raw, glass-ethereal, modernist-strict, indie-craft, research-paper, and ananta-warm.

`getAestheticRegion(name: AestheticRegionName): AestheticRegion`
Returns a named region definition or throws for an unknown name.

## Derive API

`deriveAll(quaternion: Quaternion): DesignTokens`
Returns `{ color, typography, geometry, motion }`.

`seedToPalette(quaternion: Quaternion): Palette`
Returns golden-angle color tokens, including a 12-step scale and readable text/background pairing.

`seedToTypography(quaternion: Quaternion): TypeScale`
Returns font family, weights, golden-ratio sizes, letter spacing, and line height.

`seedToGeometry(quaternion: Quaternion): GeometryTokens`
Returns radii, asymmetry, blur, texture opacity, and Fibonacci spacing.

`seedToMotion(quaternion: Quaternion): MotionTokens`
Returns easing, duration, frequency, spring, and reduced-motion tokens.

`contrastRatio(foreground: string, background: string): number`
Computes WCAG contrast ratio for two hex colors.

`relativeLuminance(hex: string): number`
Computes WCAG relative luminance.

`isHexColor(value: string): boolean`
Validates six-digit hex colors.

`hexHue(hex: string): number`
Returns the HSL hue for a hex color.

## Component Variation API

`applyVariation(component: ComponentDefinition, quaternion: Quaternion, region: AestheticRegion): StyledComponent`
Preserves component structure while deriving CSS variables, palette, motion, radii, and category-specific traits.

Types exported: `ComponentDefinition`, `StyledComponent`.

## Astro Primitives

The package exports ten Astro primitives:

`ShojiModal`, `KintsugiAlert`, `AgingButton`, `InkBrushInput`, `TextBloom`, `HoloCard`, `GravityGrid`, `VitruvianLoader`, `StoneSwitch`, `ChronosDial`.

Each primitive accepts `seed: number`, calls `deriveAll(SeedToQuaternion(seed))`, and emits `--asymm-*` CSS variables. See `docs/COMPONENT_VOCABULARY.md` for usage intent.

## Transmutation API

`transmute(html: string, quaternion: Quaternion, region: AestheticRegion): string`
Transforms conservative semantic HTML into sanitized seed-styled HTML. The transmuter strips dangerous blocks, permits only a small tag and attribute whitelist, and only allows generated `--asymm-*` style declarations.

## Package Boundaries

This package depends on `packages/sacred-geometry` for PHI constants, golden-angle math, spacing, color helpers, and easing. It does not depend on `@asymm/bio-resonance`; both engines meet only in `apps/lab-site`.
