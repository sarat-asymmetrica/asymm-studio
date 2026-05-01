# Source Material Index

**Purpose:** Reference implementations for Codex to port. These files are READ-ONLY reference — never modify them directly. Port into the target packages.

---

## Directory Map

### `bio-resonance/` → Port to `packages/asymm-bio-resonance/`

| Source File | LOC | Port Target | Action |
|-------------|-----|-------------|--------|
| `math/quaternion.js` | 467 | `math/quaternion.ts` | Port JS→TS. Keep all S³ algebra. Data-drive ThreeRegimeTracker thresholds. |
| `math/biomimetic-kernels.js` | 492 | `math/biomimetic-kernels.ts` | Port JS→TS. Make kernel weights configurable. Document curvature rationale. |
| `math/pde-tissue.js` | 418 | `math/pde-tissue.ts` | Port JS→TS. Add CFL stability check. Bound Φ to prevent blowup. |
| `signals/signal-extractor.js` | 677 | `signals/signal-extractor.ts` | Port JS→TS. Strengthen bandpass filter. Add PPG confidence gating. |
| `identity/sovereign.js` | 482 | `identity/sovereign.ts` | Port JS→TS. Relabel VedicCrypto as obfuscation (NOT encryption). Add rate limiting to identity generation. |
| `engine/uvm-engine.js` | 492 | `engine/uvm-engine.ts` | Port JS→TS. Add frame-rate cap. Add face tracking loss recovery. Bound PDE dt. |
| `mediapipe/facemesh-integration.js` | 579 | `mediapipe/facemesh-integration.ts` | Port JS→TS. Keep landmark regions. Improve gesture detection thresholds. |
| `gpu/webgl-particle-renderer.js` | 818 | `gpu/webgl-particle-renderer.ts` | Port JS→TS. Fix fake SLERP (use real quaternion interpolation). Fix framebuffer memory leak on resize. |
| `gpu/gpu-bridge.js` | 403 | `gpu/gpu-bridge.ts` | Port JS→TS. Add circuit breaker. Add periodic health checks. |
| `storage/identity-vault.js` | — | `storage/identity-vault.ts` | Port JS→TS. Privacy-by-design local storage. |
| `index.js` | 129 | `index.ts` | Barrel export. |
| `components/*.svelte` | ~1200 | `components/*.svelte` | **REBUILD from scratch** — Stripe-quality UI. Keep phase state machine from BioResonanceQuick. Discard heavy logging, hardcoded sizes, raw implementation details. Progressive disclosure: show coherence + heart rate only. |

### `component-alchemy/` → Port to `packages/asymm-aesthetic-engine/`

| Source File | LOC | Port Target | Action |
|-------------|-----|-------------|--------|
| `variations.go` | 700+ | `seed/quaternion.ts` + `components/variations.ts` | **READ FIRST.** Port SeedToQuaternion and ComponentVariation logic to TS. This is the core seed→aesthetic mapping. |
| `component_catalog.json` | — | `components/catalog.json` | Copy and extend. The 27-component vocabulary. |
| `component_generator.go` | — | `components/generator.ts` | Port Go→TS. Component generation from seed. |
| `app_generator.go` | — | Reference only | Full app generation — reference for architecture, don't port in v1. |
| `data_templates.go` | — | Reference only | Data-aware components — reference for v2. |
| `layout_templates.go` | — | `layout/templates.ts` | Port layout variation logic. |
| `navigation_templates.go` | — | Reference only | Nav components — reference for v2. |
| `HTML_VISUAL_PATTERNS_REPORT.md` | — | **READ FIRST** | 8 palettes, 6 breathing frequencies, Fibonacci spacing — the parameter inventory. |
| `html_patterns.json` | — | Reference only | Pattern definitions. |

### `design-system/` → Port to `packages/asymm-aesthetic-engine/`

| Source File | Port Target | Action |
|-------------|-------------|--------|
| `color_calculator.py` | `derive/colors.ts` | **READ FIRST.** Port seed→palette function. Integrate with existing `sacred-geometry/colors.ts` (extend, don't replace). |
| `davinci-atelier/alchemist_quill.py` | `transmute/alchemist.ts` | Port semantic→styled HTML transmutation engine. |
| `davinci-atelier/component_manifest.json` | Reference only | Component registry consumed by alchemist. |

### `pretext/` → Wire into `packages/asymm-aesthetic-engine/layout/`

| Source File | Port Target | Action |
|-------------|-------------|--------|
| `README.md` | **READ FIRST** | Understand the Pretext API and use cases. |
| `CLAUDE.md` | **READ FIRST** | Project conventions. |
| `src/*.ts` | `layout/pretext.ts` | Wrap as build-time text measurement integration. Reference, don't copy — install as dependency if published, else inline key functions. |

### `methodology-reference/` → DO NOT PORT — Reference Only

| File | Purpose |
|------|---------|
| `CME_V2_2_4.md` | CodeMathEngine v2.2.4 — 15 clauses for greenfield quality. Your quality standard. |
| `CME_V2_5_SWEBENCH.md` | CME v2.5 — 26 clauses for production codebase modification. |
| `ANANTA_AGENTS_REFERENCE.md` | How Commander structures AGENTS.md. Pattern reference. |

---

## What Already Exists (DO NOT RE-PORT)

The following are already production-ready in this repo under `packages/`:

- **`packages/sacred-geometry/`** (2,488 LOC) — constants, colors, easing, spacing, frequencies, layouts
- **`packages/ui-components/`** (917 LOC) — Button, Card, Modal, FrequencySwitcher
- **`packages/asymm-physics/`** (Go, ~900 LOC) — quaternion, digital root, Williams batching

**The sacred-geometry package IS the derive/ layer.** Extend it with seed-driven selection, don't rebuild it.
