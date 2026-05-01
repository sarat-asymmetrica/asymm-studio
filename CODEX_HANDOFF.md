# Codex Autonomous Execution Spec — Asymm Studio

**Date**: 2026-05-01
**From**: Claude (Senior Architect, Asymmetrica) + Commander Sarat
**To**: Codex (GPT, Senior Architect)
**Mission**: Assemble the generative aesthetic engine + bio-resonance interaction substrate from existing source material. Ship demo pages. Do not stop until the full scope is achieved.

---

## 0. Who You Are

You are a **senior architect** who happens to also write code. You are not a code monkey executing a checklist — you are a peer engineer who reads existing implementations, understands their mathematical intent, and ports them with the same rigor and care as the original author.

You have full permissions to:
- Read, write, and modify any file in this repository
- Install npm packages
- Run tests, builds, and dev servers
- Spawn subagents for parallel work or specialized perspectives
- Make architectural judgment calls within the constraints of AGENTS.md

**You are governed by `AGENTS.md` in this repository. Read it before starting any work.**

---

## 1. What Already Exists (Your Starting Position)

### Production-Ready Packages (DO NOT REBUILD)

**`packages/sacred-geometry/`** — 2,488 LOC, TypeScript
The mathematical foundation. Contains:
- `constants.ts`: PHI, Fibonacci, digitalRoot, williamsBatchSize, THREE_REGIME, FREQUENCIES
- `colors.ts`: MUSEUM_THEME, DIGITAL_ROOT_COLORS, goldenAnglePalette, color harmony (complementary/triadic/tetradic/analogous), HSL↔RGB↔Hex conversions
- `easing.ts`: Prana/Apana/Phi/Spanda (Kashmir Shaivism) + all Penner easings + cubicBezier with Newton-Raphson
- `spacing.ts`: Fibonacci scale (8→233px), responsive φ multipliers, BORDER_RADIUS, CONTAINER_WIDTHS, Z_INDEX, goldenColumns
- `frequencies.ts`: 5 brain-wave frequencies mapped to animation durations (Delta 610ms → Gamma 89ms)
- `layouts/`: phi-columns (golden ratio split), phyllotaxis (sunflower spiral), vedic-grid (9×9 digital root)

**This IS your derive/ layer. Extend it, never replace it.**

**`packages/ui-components/`** — 917 LOC, React + TypeScript
4 working components: Button, Card, Modal, FrequencySwitcher. All use Fibonacci spacing, frequency-based transitions, Museum theme colors.

**`packages/asymm-physics/`** — ~900 LOC, Go
Quaternion with SLERP (82M ops/sec), digital root O(1), Williams batching. Reference for TS ports.

### Source Material (READ-ONLY Reference)

**`_source_material/`** — 40 files of existing implementations to port.
**Read `_source_material/README.md` FIRST** — it maps every source file to its port target with specific instructions.

Key source directories:
- `bio-resonance/` — 6,500 LOC JS bio-resonance stack (quaternion PDE, biomimetic kernels, PPG signals, sovereign identity)
- `component-alchemy/` — Go-based seed→quaternion→component variation engine
- `design-system/` — Python color calculator + alchemist transmuter
- `pretext/` — TypeScript multilingual text measurement
- `methodology-reference/` — CME quality standards (your quality bar), AGENTS.md patterns

---

## 2. The Cognitive Rotation Protocol

You are not just building code. At each phase of each ticket, you adopt the cognitive mode that serves that phase best. This produces output that feels like a senior team built it, not a single agent grinding through a list.

**The modes are defined in AGENTS.md.** Here is when to use them:

| Ticket Phase | Cognitive Mode | What You Do |
|-------------|---------------|-------------|
| Design | ARCHITECT | Type signatures, mathematical mapping, three-alternatives test |
| Implementation | BUILDER | Write/port code, follow patterns from sacred-geometry |
| Validation | VERIFIER | Numerical traces, test suite, ELEGANCE_CHECK |
| UX surface work | PERSONA STORM | Junior dev, designer, end user, accessibility user |
| Identity/camera/crypto | RED TEAM | Privacy audit, XSS check, hash irreversibility |

**Not every ticket needs all modes.** A pure math port needs ARCHITECT + BUILDER + VERIFIER. A Svelte component rebuild needs all five. Use judgment.

---

## 3. Output Formats

### 3.1 Design DNA JSON (per seed region)

For each named aesthetic region, produce a JSON following this schema:

```json
{
  "name": "wabi-sabi",
  "seed_range": { "w": [0.8, 1.0], "x": [-0.2, 0.2], "y": [-0.2, 0.2], "z": [-0.2, 0.2] },
  "design_system": {
    "color": { "palette_type": "earth-tones", "contrast_strategy": "soft", "primary_hue_range": [20, 45] },
    "typography": { "heading_weight": 300, "body_weight": 400, "letter_spacing": "0.02em", "line_height": 1.8 },
    "spacing": { "density": "spacious", "base_multiplier": 1.618 },
    "shape": { "border_radius": { "small": 2, "medium": 4, "large": 8 }, "border_usage": "minimal" },
    "elevation": { "shadow_style": "diffuse", "depth_cues": "subtle" },
    "motion": { "easing": "apana", "duration_scale": 1.4, "philosophy": "gentle, organic" }
  },
  "design_style": {
    "aesthetic": { "mood": ["contemplative", "warm", "imperfect"], "genre": "wabi-sabi", "personality_traits": ["humble", "aged", "natural"] },
    "visual_language": { "complexity": "low", "ornamentation": "none", "whitespace_usage": "generous", "texture_usage": "paper, grain" }
  }
}
```

Produce one of these for each of the 6-8 named regions.

### 3.2 DESIGN.md (Google format, per region)

For each region, also produce a `DESIGN.md` file following Google's agent-facing format:

```yaml
---
name: Wabi-Sabi
version: 1.0
colors:
  primary: "#8B7355"
  secondary: "#A0937D"
  background: "#FAF6F0"
  text: "#3C3632"
typography:
  fontFamily: "'DM Sans', system-ui, sans-serif"
  fontSize: { base: 16, h1: 36, h2: 28, h3: 22 }
  fontWeight: { heading: 300, body: 400 }
rounded: { sm: 2, md: 4, lg: 8 }
spacing: { xs: 8, sm: 13, md: 21, lg: 34, xl: 55 }
---

# Wabi-Sabi Aesthetic

[Prose description of the visual philosophy, suitable for an AI coding agent to understand]
```

---

## 4. Ticket Structure

### Dependency Graph

```
Ticket 1 (Project scaffold) ──────────────────────────────────────┐
  │                                                                │
  ├── Ticket 2 (Seed layer) ─────────────────────┐                │
  │                                               │                │
  ├── Ticket 3 (Aesthetic regions) ───────────────┤                │
  │                                               │                │
  ├── Ticket 4 (Derive extensions) ──────────┐    │                │
  │                                          │    │                │
  │   ┌──────────────────────────────────────┘    │                │
  │   │                                           │                │
  │   Ticket 5 (Variations engine) ───────────────┤                │
  │                                               │                │
  │   Ticket 6 (Alchemist transmuter) ────────────┘                │
  │                                                                │
  ├── Ticket 7 (Bio-resonance math port) ─────────────────┐       │
  │                                                        │       │
  ├── Ticket 8 (Bio-resonance signals port) ──────────────┤       │
  │                                                        │       │
  ├── Ticket 9 (Bio-resonance identity port) ─────────────┤       │
  │                                                        │       │
  ├── Ticket 10 (Bio-resonance engine port) ──────────────┤       │
  │                                                        │       │
  │   Ticket 11 (Calibration ritual) ─────────────────────┤       │
  │                                                        │       │
  │   Ticket 12 (Stripe-quality components) ──────────────┘       │
  │                                                                │
  └── Ticket 13 (Lab site + demos) ────────────────────────────────┘
```

**Parallelizable groups:**
- Tickets 2, 3, 4 can run in parallel (seed, regions, derive — independent)
- Tickets 7, 8, 9 can run in parallel (bio-resonance math, signals, identity — independent)
- Ticket 5 depends on 2 + 4
- Ticket 6 depends on 5
- Tickets 10, 11, 12 depend on 7 + 8 + 9
- Ticket 13 depends on everything

---

## 5. Tickets

### Ticket 1: Project Scaffold
**Modes**: ARCHITECT
**Depends on**: Nothing

**Deliverables:**
- `packages/asymm-aesthetic-engine/package.json` (ESM, TypeScript)
- `packages/asymm-aesthetic-engine/tsconfig.json`
- `packages/asymm-bio-resonance/package.json` (ESM, TypeScript, peer deps: @noble/ed25519, @mediapipe/tasks-vision)
- `packages/asymm-bio-resonance/tsconfig.json`
- `apps/lab-site/package.json` (Astro 4.x)
- `apps/lab-site/astro.config.mjs`
- `vitest.config.ts` (root)
- `WORK_LOG.md` (empty, you'll fill it)
- Directory skeleton for both packages (all subdirs from architecture in Deep Experiment doc)

**Acceptance:**
- `npm install` succeeds in all three directories
- `npx tsc --noEmit` passes for both packages (empty index.ts files are fine)
- Vitest runs with 0 tests, 0 failures

---

### Ticket 2: Seed Layer
**Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Ticket 1

**Source**: `_source_material/component-alchemy/variations.go` (SeedToQuaternion function)

**Deliverables:**
- `packages/asymm-aesthetic-engine/seed/quaternion.ts` — SeedToQuaternion: `(seed: number | string) => Quaternion` that maps any seed to a unit quaternion on S³
- `packages/asymm-aesthetic-engine/seed/content-hash.ts` — `(content: string) => number` using FNV-1a or similar fast hash
- `packages/asymm-aesthetic-engine/seed/temporal.ts` — `(date?: Date) => number` date-based seed for daily variation
- `packages/asymm-aesthetic-engine/seed/visitor.ts` — `(fingerprint: string) => number` opt-in visitor-derived seed
- `packages/asymm-aesthetic-engine/seed/index.ts` — barrel export
- Tests: `seed/*.test.ts` — verify quaternion is always unit (||q|| = 1.0), verify same seed → same quaternion, verify different seeds → different quaternions

**Acceptance:**
- All seed functions return deterministic results
- `SeedToQuaternion(x).magnitude()` ≈ 1.0 for 1000 random seeds (tolerance 1e-10)
- Tests pass

---

### Ticket 3: Aesthetic Region Definitions
**Modes**: ARCHITECT → BUILDER → PERSONA STORM (designer persona)
**Depends on**: Ticket 1

**Source**: `_source_material/component-alchemy/HTML_VISUAL_PATTERNS_REPORT.md`, `_source_material/design-system/color_calculator.py`

**Deliverables:**
- `packages/asymm-aesthetic-engine/seed/regions.ts` — 8 named regions with quaternion bounds + design parameters
- `packages/asymm-aesthetic-engine/docs/regions/wabi-sabi.design.md` — Google DESIGN.md format
- `packages/asymm-aesthetic-engine/docs/regions/wabi-sabi.design.json` — Design DNA JSON
- Repeat for: `neumorphic-soft`, `brutal-raw`, `glass-ethereal`, `modernist-strict`, `indie-craft`, `research-paper`, `ananta-warm`
- `packages/asymm-aesthetic-engine/docs/PARAMETER_SPACE_DEFINITION.md` — formal spec of seed→aesthetic mapping

**Region definitions** (use these as starting points, refine based on the source material):

| Region | Mood | Shape | Motion | Color | Spacing |
|--------|------|-------|--------|-------|---------|
| Wabi-sabi | Contemplative, imperfect | Low radius, organic edges | Apana easing, slow | Earth tones, low saturation | Generous whitespace |
| Neumorphic-soft | Clean, tactile | High radius, soft shadows | Phi easing, medium | Pastels, monochromatic | Balanced |
| Brutal-raw | Bold, confrontational | Zero radius, hard edges | Linear, fast | High contrast, black+accent | Dense, tight |
| Glass-ethereal | Ethereal, floating | High radius, blur | Spanda easing, slow | Translucent, cool tones | Airy |
| Modernist-strict | Precise, systematic | Geometric, consistent | EaseInOut, medium | Limited palette, swiss grid | Grid-strict |
| Indie-craft | Warm, handmade | Irregular, playful | Prana easing, bouncy | Warm palette, varied | Relaxed |
| Research-paper | Academic, serious | Minimal, no decoration | None/minimal | Black on white, sparse accent | Reading-optimized |
| Ananta-warm | Inviting, Indian | Fibonacci radius, golden | PranaApana breathing | Warm palette, saffron accent | Golden ratio |

**Acceptance:**
- 8 DESIGN.md files + 8 Design DNA JSONs produced
- Each region has distinct, non-overlapping quaternion bounds
- PARAMETER_SPACE_DEFINITION.md is coherent and complete
- Designer persona confirms: "I can understand and customize these without reading source code"

---

### Ticket 4: Derive Layer Extensions
**Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Ticket 1

**Source**: `_source_material/design-system/color_calculator.py`, existing `packages/sacred-geometry/`

**Deliverables:**
- `packages/asymm-aesthetic-engine/derive/colors.ts` — extends sacred-geometry colors with `seedToPalette(quaternion) => Palette`. Port the golden-angle hue walk from `color_calculator.py`. Use Radix-style 12-step scale generation.
- `packages/asymm-aesthetic-engine/derive/typography.ts` — golden type scale: `seedToTypography(quaternion) => TypeScale` (heading weight, body weight, letter spacing, line height derived from quaternion components)
- `packages/asymm-aesthetic-engine/derive/geometry.ts` — `seedToGeometry(quaternion) => GeometryTokens` (border-radii, tilt, blur, paper texture parameters from quaternion)
- `packages/asymm-aesthetic-engine/derive/motion.ts` — `seedToMotion(quaternion) => MotionTokens` (selects easing from sacred-geometry registry, derives duration scale, spring presets)
- `packages/asymm-aesthetic-engine/derive/index.ts` — barrel + `deriveAll(quaternion) => DesignTokens` composing all derivations
- Tests for each derive function

**Acceptance:**
- `deriveAll(q1) !== deriveAll(q2)` for distinct quaternions
- All derived values are valid CSS (colors are hex, spacing is px, etc.)
- Color palettes pass WCAG AA contrast check (text on background ≥ 4.5:1)
- Tests pass

---

### Ticket 5: Component Variation Engine
**Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Tickets 2 + 4

**Source**: `_source_material/component-alchemy/variations.go`, `_source_material/component-alchemy/component_catalog.json`

**Deliverables:**
- `packages/asymm-aesthetic-engine/components/catalog.json` — the 27-component vocabulary (copied + extended from source)
- `packages/asymm-aesthetic-engine/components/variations.ts` — `applyVariation(component, quaternion, region) => StyledComponent` — the core variation engine ported from Go
- `packages/asymm-aesthetic-engine/components/index.ts` — barrel
- Tests: same component + different seeds → visually distinct but structurally identical output

**Acceptance:**
- At least 10 of the 27 components have working variations
- Same seed always produces same variation (deterministic)
- Different seeds produce measurably different CSS output
- Tests pass

---

### Ticket 6: Alchemist Transmuter
**Modes**: ARCHITECT → BUILDER → VERIFIER → RED TEAM (XSS)
**Depends on**: Ticket 5

**Source**: `_source_material/design-system/davinci-atelier/alchemist_quill.py`

**Deliverables:**
- `packages/asymm-aesthetic-engine/transmute/alchemist.ts` — `transmute(html: string, quaternion: Quaternion, region: Region) => string` — takes semantic HTML with class markers, applies seed-driven styling
- Tests: verify output is valid HTML, verify no XSS vectors (no raw user input in output)

**Acceptance:**
- Input: `<div class="asymm-card">Hello</div>` + seed → Output: fully styled HTML with inline CSS variables
- RED TEAM: no `innerHTML`, no `eval`, no unescaped user strings in output
- Tests pass

---

### Ticket 7: Bio-Resonance Math Port
**Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Ticket 1

**Source**: `_source_material/bio-resonance/math/`

**Deliverables:**
- `packages/asymm-bio-resonance/math/quaternion.ts` — Port from JS. Keep full S³ algebra. Data-drive ThreeRegimeTracker thresholds (make them constructor parameters, not hardcoded).
- `packages/asymm-bio-resonance/math/biomimetic-kernels.ts` — Port from JS. Make kernel weights configurable via constructor. Document each animal's curvature rationale in JSDoc.
- `packages/asymm-bio-resonance/math/pde-tissue.ts` — Port from JS. **CRITICAL**: Add CFL stability check (dt ≤ dx²/4D). Add Φ saturation bound (clamp to [-2, 2]) to prevent blowup.
- Tests for all three modules

**Acceptance:**
- TypeScript compiles with strict mode
- ThreeRegimeTracker thresholds are constructor parameters with sensible defaults
- PDE tissue has explicit stability guard (throws if dt violates CFL)
- Tests pass (including edge cases: zero quaternion, empty frame, extreme dt)

---

### Ticket 8: Bio-Resonance Signals Port
**Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Ticket 1

**Source**: `_source_material/bio-resonance/signals/signal-extractor.js`

**Deliverables:**
- `packages/asymm-bio-resonance/signals/signal-extractor.ts` — Port from JS. Improve bandpass filter (replace moving average with proper 2nd-order Butterworth or at minimum a larger-window FIR). Add PPG confidence gating (only use BPM if confidence > 0.7). Make all thresholds configurable.
- Tests

**Acceptance:**
- PPG extraction produces BPM in [40, 200] range or returns `null` (never garbage values)
- Coherence calculation returns [0, 1] always (clamped)
- All thresholds are configurable constructor parameters
- Tests pass

---

### Ticket 9: Bio-Resonance Identity Port
**Modes**: ARCHITECT → BUILDER → VERIFIER → RED TEAM
**Depends on**: Ticket 1

**Source**: `_source_material/bio-resonance/identity/sovereign.js`

**Deliverables:**
- `packages/asymm-bio-resonance/identity/sovereign.ts` — Port from JS. **CRITICAL changes:**
  1. Relabel VedicCrypto functions as `obfuscate`/`deobfuscate` (NOT encrypt/decrypt)
  2. Add rate limiting: max 1 identity generation per 2 seconds
  3. Handle all-zero presence vector (return error, don't generate empty hash)
  4. Use `@noble/ed25519` for Ed25519 operations
- Tests

**Acceptance:**
- RED TEAM: presence hash is one-way (cannot recover presence vector from hash)
- RED TEAM: VedicCrypto labeled as obfuscation in all docstrings and exports
- Rate limiting works (second call within 2s returns cached identity, not new one)
- Tests pass including: empty vector rejection, hash determinism, token expiry

---

### Ticket 10: Bio-Resonance Engine Port
**Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Tickets 7 + 8 + 9

**Source**: `_source_material/bio-resonance/engine/uvm-engine.js`, `_source_material/bio-resonance/mediapipe/facemesh-integration.js`

**Deliverables:**
- `packages/asymm-bio-resonance/engine/uvm-engine.ts` — Port from JS. Add frame-rate cap (configurable, default 30fps). Add face tracking loss recovery (use last valid landmarks for up to 500ms, then pause processing). Bound PDE dt to [0.001, 0.05].
- `packages/asymm-bio-resonance/mediapipe/facemesh-integration.ts` — Port from JS. Keep landmark regions. Improve EAR threshold (make configurable, default 0.21).
- `packages/asymm-bio-resonance/gpu/webgl-particle-renderer.ts` — Port from JS. **Fix fake SLERP** (use real quaternion SLERP from math/quaternion.ts). **Fix framebuffer memory leak** (delete old FBOs on resize).
- `packages/asymm-bio-resonance/gpu/gpu-bridge.ts` — Port from JS. Add circuit breaker (3 failures in 30s → stop retrying for 60s). Add periodic health check (every 10s).
- Barrel exports

**Acceptance:**
- Engine runs at configurable FPS (not monitor refresh rate)
- Face tracking loss doesn't crash — graceful degradation
- SLERP in particle renderer uses real quaternion interpolation
- No WebGL memory leaks on resize
- Tests pass

---

### Ticket 11: Calibration Ritual
**Modes**: ARCHITECT → BUILDER → PERSONA STORM → RED TEAM
**Depends on**: Tickets 7 + 8 + 9

**Deliverables:**
- `packages/asymm-bio-resonance/calibration/gaze-calibration.ts` — 4-point gaze calibration (corners)
- `packages/asymm-bio-resonance/calibration/anatomical-calibration.ts` — Interpupillary distance, head size, viewing distance estimation
- `packages/asymm-bio-resonance/calibration/hand-calibration.ts` — Open palm, fist, point detection
- `packages/asymm-bio-resonance/calibration/presence-baseline.ts` — PPG resting heart rate, blink rhythm baseline
- `packages/asymm-bio-resonance/calibration/ritual-sequencer.ts` — Frame-by-frame UX of the calibration ritual (state machine)
- `packages/asymm-bio-resonance/docs/CALIBRATION_RITUAL_SPEC.md` — Complete UX spec
- `packages/asymm-bio-resonance/docs/PRIVACY_THESIS.md` — Why presence-hash > stored-biometric

**The ritual sequence:**
1. Black screen → white dot upper-left → "Look at this dot" (3s)
2. Dot moves upper-right (3s)
3. Dot moves lower-right (3s)
4. Dot moves lower-left (3s)
5. "Show your open palm" (3s)
6. "Make a fist" (3s)
7. "Point at the screen" (3s)
8. "Welcome" → show presence hash + measurements
9. Privacy footer: "Your camera frames never left this browser tab."

**Acceptance:**
- Ritual sequencer has clean state machine (no spaghetti transitions)
- Each step has configurable duration
- PERSONA STORM: "Would I trust this enough to grant camera permission?"
- RED TEAM: Camera frames truly never leave the tab (verify no network calls during ritual)
- Tests pass

---

### Ticket 12: Stripe-Quality Svelte Components
**Modes**: ARCHITECT → BUILDER → PERSONA STORM → RED TEAM
**Depends on**: Tickets 10 + 11

**Source**: `_source_material/bio-resonance/components/*.svelte` (reference for logic, NOT for design)

**Deliverables:**
- `packages/asymm-bio-resonance/components/CalibrationRitual.svelte` — Stripe-clean calibration UI
- `packages/asymm-bio-resonance/components/PresenceAuth.svelte` — Minimal auth: camera feed (subtle frosted overlay), coherence progress bar, heart rate, privacy footer. Progressive disclosure — NO raw implementation details.
- `packages/asymm-bio-resonance/components/GazeCursor.svelte` — Gaze-driven cursor for the demo page
- `packages/asymm-bio-resonance/components/StressAdaptiveReader.svelte` — PPG-aware content reader that adjusts typography/density based on HRV

**Design principles (Stripe-level):**
- Generous whitespace, restrained typography (DM Sans or system-ui)
- Muted color palette with single accent color
- Animations: subtle, purposeful, respect `prefers-reduced-motion`
- Error states: helpful, never technical ("Camera access needed" not "getUserMedia failed")
- Loading states: skeleton screens, never spinners
- Responsive: works on mobile viewport
- Privacy footer on EVERY component that uses camera

**Acceptance:**
- PERSONA STORM (4 personas): junior dev can integrate, designer can restyle, end user feels trust, accessibility user can navigate
- No `console.log` in any component
- All components pass WCAG AA
- Privacy footer always visible when camera is active
- Tests for component lifecycle (mount, unmount, error recovery)

---

### Ticket 13: Lab Site + Demo Pages
**Modes**: ARCHITECT → BUILDER → PERSONA STORM
**Depends on**: All previous tickets

**Deliverables:**
- `apps/lab-site/src/pages/index.astro` — "Lab Asymmetrica" landing
- `apps/lab-site/src/pages/aesthetic-engine/index.astro` — Same content rendered with all 8 seed regions side by side
- `apps/lab-site/src/pages/aesthetic-engine/components.astro` — All ported components in their regional variants
- `apps/lab-site/src/pages/bio-resonance/calibration.astro` — Live calibration ritual demo
- `apps/lab-site/src/pages/bio-resonance/gaze-cursor.astro` — Gaze-only navigation demo
- `apps/lab-site/src/pages/bio-resonance/stress-adaptive.astro` — PPG-aware reading demo
- `apps/lab-site/src/pages/manifesto.astro` — Why this exists, privacy thesis, the math
- `apps/lab-site/src/styles/lab.css` — Research surface aesthetic (clean, academic, purposeful)

**Acceptance:**
- `npm run dev` starts the Astro dev server
- All pages render without errors
- Aesthetic engine demo shows visually distinct output for each seed region
- Bio-resonance demos work with webcam permission (graceful fallback without)
- PERSONA STORM: "Would I share this link on Twitter?"
- Responsive on mobile

---

## 6. The Autonomy Contract

### Do Not Stop

You have everything you need. The source material is in `_source_material/`. The existing foundation is in `packages/`. The quality gates are in `AGENTS.md`. The tickets are ordered with dependencies.

**Work through the tickets in order. When a ticket is complete (passes its acceptance criteria and scores ≥ 0.85 on the elegance check), move to the next one. Do not stop until you have completed all 13 tickets or encountered a blocking dependency that requires human input.**

### When to Pause (Not Stop)

- If a ticket requires a decision that only Commander can make → document the decision needed in `WORK_LOG.md`, skip to the next non-blocked ticket, continue
- If a test framework can't be configured after 2 attempts → document the issue, proceed without tests for that ticket, flag in work log
- If MediaPipe won't install in the sandbox → mock it with type stubs, flag in work log

### Spiral Exit Rule

If the same error occurs 3 times on the same ticket after different fix attempts:
1. Document the error and what you tried
2. Write your best partial solution
3. Mark the ticket as PARTIAL in the work log
4. Move to the next ticket

Never burn more than 20 minutes on a single error. Time is better spent on the next ticket.

---

## 7. Summary

| What | Where |
|------|-------|
| Quality contract | `AGENTS.md` |
| Source material | `_source_material/` (read `_source_material/README.md` first) |
| Existing foundation | `packages/sacred-geometry/`, `packages/ui-components/`, `packages/asymm-physics/` |
| This spec | `CODEX_HANDOFF.md` |
| Your progress log | `WORK_LOG.md` (you create and maintain this) |
| Deep Experiment context | `01_DEEP_EXPERIMENT_HANDOFF_2026-04-25.md` (background reading, not actionable) |

**Start with Ticket 1. Read `AGENTS.md`. Read `_source_material/README.md`. Then build.**

---

Built with Love × Simplicity × Truth × Joy.

*"Why does a website's aesthetic have to be fixed?" — Commander Sarat, 2026*

🕉️ Om Lokah Samastah Sukhino Bhavantu
