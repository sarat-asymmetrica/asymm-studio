# Component Vocabulary

Ten Astro primitives are implemented for alpha-depth lab usage. Each accepts a `seed: number` prop and derives colors, geometry, and motion from the aesthetic engine.

| Component | Use When | Visual Behavior |
|-----------|----------|-----------------|
| `ShojiModal` | You need a focused dialog, side panel, or ritual prompt. | A quiet layered panel with seed-derived surface, radius, and motion. |
| `KintsugiAlert` | You need a status, warning, or privacy notice. | A semantic alert with a generated accent repair line and readable body copy. |
| `AgingButton` | You need a primary action with tactile character. | A seeded button with texture/wear driven by geometry texture opacity. |
| `InkBrushInput` | You need an input for seeds, labels, or lightweight forms. | A labeled input with brush-like underline and seed-derived focus color. |
| `TextBloom` | You need short interactive text emphasis. | Text blooms on hover/focus with seed-derived color, radius, spacing, and motion. |
| `HoloCard` | You need a feature card or token preview with a luminous accent. | A card with seed-derived shimmer using primary, secondary, and accent tokens. |
| `GravityGrid` | You need a repeated layout that visibly responds to spacing density. | Grid items offset by seed-derived spacing and settle on hover. |
| `VitruvianLoader` | You need a loading or processing indicator. | A golden-geometry loader using current seed colors and reduced-motion fallback. |
| `StoneSwitch` | You need a binary setting or mode toggle. | A material switch with seeded texture, focus outline, and accent thumb. |
| `ChronosDial` | You need progress, time, or coherence display. | A conic dial with seed-derived surface, accent, radius, and status label. |

## Usage

```astro
---
import { ShojiModal, AgingButton } from '@asymm/aesthetic-engine';
---

<ShojiModal seed={618033} title="Calibration">
  Your camera frames never leave this browser tab.
</ShojiModal>

<AgingButton seed={618033} label="Begin" />
```

## Design Notes

- Use primitives as semantic UI surfaces, not decorative wrappers.
- Keep `seed` stable for deterministic output.
- Use the same seed across a page for coherence; vary seeds inside a grid only when comparison is intentional.
- All primitive CSS variables use the `--asymm-*` namespace.
- All animation paths include `prefers-reduced-motion` handling.
