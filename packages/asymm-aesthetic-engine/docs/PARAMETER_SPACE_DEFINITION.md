# Parameter Space Definition

The aesthetic engine maps a seed into a unit quaternion `q = (w, x, y, z)` on S3, then interprets that point as a compact design genome.

## Axes

- `w`: atmosphere and overall softness. High positive values produce quiet, humane surfaces; negative values produce rawer, more declarative systems.
- `x`: structural precision. Positive values tighten grids and geometry; negative values increase translucency and atmospheric depth.
- `y`: warmth and material irregularity. Positive values support luminous or glass systems; negative values support handmade craft.
- `z`: editorial gravity and ritual depth. Positive values bias toward research and Ananta surfaces; negative values bias toward aggressive or sparse systems.

Each axis is a normalized quaternion component in `[-1, 1]`. Bounds are written as closed intervals, so `w: [0.82, 1.0]` means a seed belongs to that region only when its `w` component is at least `0.82` and at most `1.0`.

Designers do not need to read the TypeScript implementation to adjust a region. Use this file to choose the desired direction on each axis, edit the matching `seed_range` in the region's `.design.json`, then mirror the same bounds in `seed/regions.ts` so runtime classification and documentation stay identical.

## Named Regions

| Region | Bounds Summary | Design Intent |
| --- | --- | --- |
| Wabi-Sabi | high `w`, centered `x/y/z` | contemplative, imperfect, generous |
| Neumorphic Soft | positive `w`, positive `x` | clean tactile panels, soft contrast |
| Brutal Raw | negative `w`, positive `x` | hard edges, dense spacing, high contrast |
| Glass Ethereal | positive `w`, negative `x`, positive `y` | translucent cool surfaces and blur |
| Modernist Strict | centered `w`, high `x` | Swiss grid, restrained geometry |
| Indie Craft | positive `w`, negative `y`, positive `z` | warm handmade variation |
| Research Paper | negative `w`, high `z` | readable academic editorial surfaces |
| Ananta Warm | positive `w`, negative `x`, positive `z` | saffron warmth, golden cadence |

## Derivation Contract

Region definitions are disjoint hyperrectangles, so a seed can be classified without ambiguity. Derived tokens use Fibonacci spacing, phi-powered typography, golden-angle hue walks, and the six breathing frequencies found in the source visual-pattern inventory.

Designers can tune a region by editing bounds or parameter values in `seed/regions.ts` without touching quaternion generation or sacred-geometry math.

## Customization Checklist

1. Pick the nearest named region by mood and usage.
2. Adjust color, typography, radius, spacing, or motion tokens in the region `.design.json`.
3. If the region should catch a different family of seeds, adjust one axis at a time and keep at least one non-overlapping axis gap from every other region.
4. Run the region tests; they verify that all eight quaternion bounds remain non-overlapping.
