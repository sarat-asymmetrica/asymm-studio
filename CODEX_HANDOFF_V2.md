# Codex Autonomous Execution Spec — V2

**Date**: 2026-05-01
**From**: Claude (Senior Architect) + Commander Sarat
**To**: Codex (GPT, Senior Architect)
**Run Target**: ~2 hours autonomous execution
**Integration Depth**: `alpha` (real IO where possible, graceful fallback where not)
**Previous Run**: V1 completed 13/13 tickets in 52m51s. All code in repo is from that run.

---

## 0. What Changed In V2 (Read This First)

This run incorporates YOUR feedback from V1. Specifically:

### New Methodology Additions

1. **Integration Depth Knob** — This run is `alpha`: real IO with graceful fallback. MediaPipe should use the actual `@mediapipe/tasks-vision` package. Signals should process real camera frames where possible. Demos that can't run without a camera should show a compelling simulated fallback, not a blank page.

2. **Machine Gates** — Run `npm run verify` before each checkpoint. It executes three scans:
   - `verify:privacy` — no localStorage/fetch/beacon in bio-resonance (outside gpu-bridge)
   - `verify:a11y` — aria labels, roles, prefers-reduced-motion
   - `verify:forbidden` — no console.log, TODO, `as any`, `import *`, eval, innerHTML

3. **Decision Ledger** — Maintain `DECISIONS.md`. Every non-obvious architectural choice gets a one-liner: what, why, alternatives considered. This is your engineering diary.

4. **Per-Ticket Checklist** — Each ticket below includes a `### Checklist` section. Verify each item before checkpointing.

5. **PORT_MAP.md** — For any ticket that ports or extends V1 code, note: source → target, what changed, what was intentionally skipped.

### What You're Building On

V1 delivered:
- `packages/asymm-aesthetic-engine/` — seed layer (quaternion, content-hash, temporal, visitor), 8 regions with Design DNA, derive tokens (colors, typography, geometry, motion), component variations (27-catalog), alchemist transmuter
- `packages/asymm-bio-resonance/` — math (quaternion, biomimetic kernels, PDE tissue), signals (PPG, optical flow, coherence), identity (sovereign, Ed25519, rate-limited), engine (UVM, gestures, frame cap), GPU (SLERP, circuit breaker), MediaPipe (facemesh, landmarks), calibration (gaze, anatomical, hand, presence, ritual sequencer), 4 Svelte components (CalibrationRitual, PresenceAuth, GazeCursor, StressAdaptiveReader)
- `apps/lab-site/` — 7 Astro pages (index, aesthetic showcase, component catalog, 3 bio demos, manifesto)
- 55 tests passing, TypeScript compiles clean, lab site builds

**All V1 code is your foundation. Extend, refine, and deepen — don't rebuild.**

---

## 1. Governance (Same as V1 + Additions)

You are still governed by `AGENTS.md`. All V1 rules apply. Additional V2 rules:

- **Run `npm run verify` before every checkpoint.** If it fails, fix the violation before proceeding.
- **Append every non-obvious decision to `DECISIONS.md`** as a one-liner.
- **Integration depth is `alpha`**: wire real APIs/libraries where the sandbox allows. Where it doesn't (e.g., no physical camera in CI), provide deterministic simulation that exercises the same code paths with clearly labeled mock data.
- **Coherence checkpoint**: At tickets 10, 20, and the final ticket, re-read `AGENTS.md` and `WORK_LOG.md` to re-anchor your context. This combats drift in long sessions.

---

## 2. Ticket Structure — 25 Tickets in 5 Tracks

### Dependency Graph

```
TRACK A: Aesthetic Engine → Interactive (Tickets 1-7)
  1 → 2 → 3
  1 → 4 → 5
  1 → 6
  1 → 7

TRACK B: Bio-Resonance → Alpha Depth (Tickets 8-14)
  8 → 9 → 10
  8 → 11 → 12
  8 → 13
  8 → 14

TRACK C: Visual Polish (Tickets 15-19)
  15 → 16
  15 → 17
  15 → 18 → 19

TRACK D: Cross-Engine Integration (Tickets 20-22)
  depends on A + B complete
  20 → 21 → 22

TRACK E: Methodology Infrastructure (Tickets 23-25)
  23, 24, 25 are independent, can run anytime
```

**Parallelizable**: Tracks A and B are independent. Track E can run alongside anything.

---

## 3. Tickets

---

### Ticket 1: Aesthetic Astro Component Primitives (Batch 1)
**Depth**: alpha | **Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Nothing

Build the first 5 of the 27 catalog components as real Astro components that accept a seed and render with derived tokens:

**Deliverables:**
- `packages/asymm-aesthetic-engine/primitives/ShojiModal.astro` — sliding panel modal with seed-derived colors, radii, motion
- `packages/asymm-aesthetic-engine/primitives/KintsugiAlert.astro` — alert with golden "repair" accent lines, seed-derived palette
- `packages/asymm-aesthetic-engine/primitives/AgingButton.astro` — button that visually "ages" (texture, wear) based on seed
- `packages/asymm-aesthetic-engine/primitives/InkBrushInput.astro` — text input with brush-stroke underline, seed-derived weight
- `packages/asymm-aesthetic-engine/primitives/TextBloom.astro` — text that "blooms" on hover/focus with seed-derived motion
- `packages/asymm-aesthetic-engine/primitives/index.ts` — barrel export
- Tests for each component: renders without error, accepts seed prop, produces distinct output for different seeds

### Checklist
- [ ] Each component accepts `seed: number` prop
- [ ] Each component calls `deriveAll(SeedToQuaternion(seed))` for tokens
- [ ] CSS variables use `--asymm-*` namespace
- [ ] `prefers-reduced-motion` respected
- [ ] No hardcoded colors — all from derived palette
- [ ] `npm run verify` passes
- [ ] Tests pass

---

### Ticket 2: Aesthetic Astro Component Primitives (Batch 2)
**Depth**: alpha | **Modes**: ARCHITECT → BUILDER → VERIFIER
**Depends on**: Ticket 1

Build the next 5 components:

**Deliverables:**
- `packages/asymm-aesthetic-engine/primitives/HoloCard.astro` — card with holographic shimmer effect from seed
- `packages/asymm-aesthetic-engine/primitives/GravityGrid.astro` — grid layout with items that have seed-derived gravitational pull (spacing)
- `packages/asymm-aesthetic-engine/primitives/VitruvianLoader.astro` — loading indicator based on golden spiral
- `packages/asymm-aesthetic-engine/primitives/StoneSwitch.astro` — toggle switch with stone/material texture from seed
- `packages/asymm-aesthetic-engine/primitives/ChronosDial.astro` — time/progress dial using golden angle segments
- Tests

### Checklist
- [ ] Same constraints as Ticket 1
- [ ] Components are compositionally independent (no cross-dependencies between primitives)
- [ ] `npm run verify` passes

---

### Ticket 3: Interactive Seed Explorer
**Depth**: alpha | **Modes**: ARCHITECT → BUILDER → PERSONA STORM
**Depends on**: Tickets 1 + 2

**Deliverables:**
- `apps/lab-site/src/pages/aesthetic-engine/explorer.astro` — Interactive page where user changes seed via slider/input and watches ALL derived tokens + component previews update live
- `apps/lab-site/src/components/SeedExplorer.svelte` — client-side Svelte island: seed input (number slider 0-999999), live token display (colors, typography, geometry, motion), live component preview grid showing all 10 primitives
- Region auto-detection: as slider moves through quaternion space, highlight which named region the seed falls into

### Checklist
- [ ] Real-time updates (no page reload)
- [ ] Shows derived tokens as CSS variables AND visual swatches
- [ ] Region name updates as seed changes
- [ ] Mobile responsive
- [ ] PERSONA STORM: "Can a designer use this to explore the design space without reading code?"
- [ ] `npm run verify` passes

---

### Ticket 4: Region A/B Comparison
**Depth**: alpha | **Modes**: BUILDER → VERIFIER
**Depends on**: Ticket 1

**Deliverables:**
- `apps/lab-site/src/pages/aesthetic-engine/compare.astro` — Side-by-side comparison: same content block rendered with two different aesthetic regions
- `apps/lab-site/src/components/RegionCompare.svelte` — Svelte island with two region dropdowns + live preview
- Identical sample content (a heading, paragraph, button, card, alert) rendered in each region

### Checklist
- [ ] Both panels update live when region changes
- [ ] Visual difference is immediately obvious (not subtle)
- [ ] Same content, different aesthetic — proves the engine works
- [ ] `npm run verify` passes

---

### Ticket 5: Live Theme Switcher
**Depth**: alpha | **Modes**: BUILDER → VERIFIER → PERSONA STORM
**Depends on**: Ticket 4

**Deliverables:**
- `apps/lab-site/src/components/ThemeSwitcher.svelte` — floating dropdown (like FrequencySwitcher) that changes the active seed region site-wide
- Wire into `LabLayout.astro` so it appears on every lab page
- Switching regions updates CSS variables on `:root`, causing all seed-derived content to re-render
- Persist selection in `sessionStorage` (NOT localStorage — session only)

### Checklist
- [ ] All 8 regions available
- [ ] Switching is instant (CSS variable swap, no page reload)
- [ ] Selection persists across page navigation within session
- [ ] Accessible: keyboard navigable, aria-label
- [ ] PERSONA STORM: "Does switching feel magical or jarring?"
- [ ] `npm run verify` passes

---

### Ticket 6: Aesthetic Engine README + API Docs
**Depth**: alpha | **Modes**: ARCHITECT
**Depends on**: Ticket 1

**Deliverables:**
- `packages/asymm-aesthetic-engine/README.md` — Complete API documentation: installation, quick start (5 lines to derive tokens from seed), full API reference for seed/, derive/, components/, transmute/
- `packages/asymm-aesthetic-engine/docs/COMPONENT_VOCABULARY.md` — The 10 implemented components: what each does, when to use, visual example description

### Checklist
- [ ] Quick start code example actually works if copy-pasted
- [ ] Every exported function is documented
- [ ] No TODOs or "coming soon" — only document what exists

---

### Ticket 7: Aesthetic Engine Package Polish
**Depth**: alpha | **Modes**: VERIFIER → BUILDER
**Depends on**: Tickets 1-6

**Deliverables:**
- Fix any TypeScript errors across the aesthetic engine package
- Ensure all barrel exports are complete and correct
- Add any missing test coverage (target: every exported function has at least one test)
- Run full test suite, fix any failures
- Update package.json version to 0.2.0

### Checklist
- [ ] `npx tsc --noEmit` clean
- [ ] `npx vitest run` all pass
- [ ] `npm run verify` passes
- [ ] No unused exports
- [ ] No circular dependencies

---

### Ticket 8: MediaPipe Live Wiring
**Depth**: alpha | **Modes**: ARCHITECT → BUILDER → RED TEAM
**Depends on**: Nothing

Wire the bio-resonance stack to use real `@mediapipe/tasks-vision` for face landmark detection.

**Deliverables:**
- `packages/asymm-bio-resonance/mediapipe/live-facemesh.ts` — Real MediaPipe FaceLandmarker initialization, model loading (from CDN or bundled), frame processing pipeline
- `packages/asymm-bio-resonance/mediapipe/mock-facemesh.ts` — Deterministic mock that returns synthetic landmark data (for testing and no-camera environments)
- `packages/asymm-bio-resonance/mediapipe/factory.ts` — Factory that returns live or mock based on environment detection (camera available? MediaPipe loadable?)
- Update `facemesh-integration.ts` to use the factory
- Tests for mock, factory selection logic

### Checklist
- [ ] Real MediaPipe loads if camera available
- [ ] Graceful fallback to mock if not
- [ ] No crash on camera permission denial — friendly message
- [ ] RED TEAM: camera frames stay in local processing, never transmitted
- [ ] Model URL is configurable (CDN vs local)
- [ ] `npm run verify` passes

---

### Ticket 9: Live PPG + Coherence Pipeline
**Depth**: alpha | **Modes**: BUILDER → VERIFIER
**Depends on**: Ticket 8

Wire real PPG extraction using live camera frames through the signal extractor.

**Deliverables:**
- `packages/asymm-bio-resonance/signals/live-pipeline.ts` — Connects MediaPipe landmarks → PPG ROI → signal extraction → coherence calculation. Real-time pipeline running at engine FPS.
- `packages/asymm-bio-resonance/signals/mock-pipeline.ts` — Deterministic pipeline using synthetic frame data (sinusoidal PPG at 72 BPM, smooth coherence ramp from 0→1 over 10s)
- Update signal-extractor to accept frame data from either pipeline
- Tests for mock pipeline determinism

### Checklist
- [ ] Live pipeline processes real frames when camera available
- [ ] Mock pipeline provides realistic-looking BPM (60-80 range) and coherence ramp
- [ ] Coherence value always in [0, 1]
- [ ] Pipeline handles frame drops gracefully (skip, don't crash)
- [ ] `npm run verify` passes

---

### Ticket 10: Interactive Calibration Ritual (Alpha)
**Depth**: alpha | **Modes**: BUILDER → PERSONA STORM → RED TEAM
**Depends on**: Tickets 8 + 9
**COHERENCE CHECKPOINT**: Re-read AGENTS.md and WORK_LOG.md before starting.

Upgrade the calibration ritual Svelte component to use real camera input.

**Deliverables:**
- Update `CalibrationRitual.svelte` to use the MediaPipe factory (live or mock)
- Real gaze dots that track where you're looking during calibration
- Real hand detection feedback (open palm / fist / point recognized indicator)
- Display real measurements after calibration: IPD, gaze span, resting heart rate, presence hash
- Privacy footer with live/mock indicator ("Using your camera" vs "Simulated demo")

### Checklist
- [ ] Works with real camera (if available)
- [ ] Works with simulated data (compelling demo even without camera)
- [ ] Smooth transitions between calibration steps
- [ ] Presence hash displayed at end
- [ ] PERSONA STORM: "Would I grant camera permission? Does the ritual feel trustworthy?"
- [ ] RED TEAM: no network calls during calibration, verify with browser devtools
- [ ] `npm run verify` passes

---

### Ticket 11: Interactive Gaze Cursor Demo (Alpha)
**Depth**: alpha | **Modes**: BUILDER → PERSONA STORM
**Depends on**: Ticket 8

Upgrade the gaze cursor to actually track gaze position (or simulate it convincingly).

**Deliverables:**
- Update `GazeCursor.svelte` to use calibration data for gaze→screen mapping
- Highlight paragraph under gaze
- Smooth cursor movement (SLERP interpolation between gaze positions)
- "Look at top → scroll up, look at bottom → scroll down" behavior
- Article content: use a real interesting text block (something about the math behind bio-resonance)

### Checklist
- [ ] Gaze cursor moves smoothly (no jitter)
- [ ] Paragraphs highlight on gaze
- [ ] Scroll behavior works
- [ ] Works as simulated demo without camera (cursor follows a scripted path)
- [ ] PERSONA STORM: "Is this impressive enough to share on social media?"
- [ ] `npm run verify` passes

---

### Ticket 12: Interactive Stress-Adaptive Reader (Alpha)
**Depth**: alpha | **Modes**: BUILDER → VERIFIER
**Depends on**: Ticket 9

Upgrade the stress-adaptive reader to respond to real (or simulated) HRV changes.

**Deliverables:**
- Update `StressAdaptiveReader.svelte` to consume coherence/HRV from the signal pipeline
- When HRV drops (stress rising): increase line-height, reduce density, slow scroll, warm color shift, pause margin motion
- When HRV rises (calm): tighter layout, normal speed, cooler tones
- Show a small HRV graph in corner with adaptation annotations
- Simulated mode: sine wave HRV that oscillates between stressed/calm every 15 seconds (so viewer can SEE the adaptation)

### Checklist
- [ ] Visual changes are noticeable but not jarring
- [ ] Transitions use sacred-geometry easings (Prana/Apana)
- [ ] HRV graph updates in real-time
- [ ] Simulated mode is compelling standalone demo
- [ ] `prefers-reduced-motion` disables adaptation animations
- [ ] `npm run verify` passes

---

### Ticket 13: Continuous Auth Guard Demo
**Depth**: alpha | **Modes**: BUILDER → PERSONA STORM → RED TEAM
**Depends on**: Ticket 9

New demo: a workspace that stays unlocked only while you're present.

**Deliverables:**
- `packages/asymm-bio-resonance/components/ContinuousAuthGuard.svelte` — Workspace content visible only when coherence gate is unlocked. When coherence drops below threshold (face gone, looking away for >5s), content blurs/fades and shows "Presence lost — look at screen to continue"
- `apps/lab-site/src/pages/bio-resonance/continuous-auth.astro` — Demo page wrapping the component around a sample banking dashboard mockup
- Simulated mode: coherence oscillates, showing lock/unlock cycle

### Checklist
- [ ] Content genuinely blurs/hides (not just overlay — actual CSS filter)
- [ ] Recovery is smooth (content fades back in over 1s)
- [ ] PERSONA STORM: "Would I trust this for banking/medical data?"
- [ ] RED TEAM: blur is CSS only (content still in DOM — note this limitation in docs)
- [ ] Privacy footer present
- [ ] `npm run verify` passes

---

### Ticket 14: Bio-Resonance Package Polish
**Depth**: alpha | **Modes**: VERIFIER → BUILDER
**Depends on**: Tickets 8-13

**Deliverables:**
- Fix any TypeScript errors across bio-resonance package
- Ensure all barrel exports complete
- Full test suite green
- `packages/asymm-bio-resonance/README.md` — API docs: installation, quick start, privacy model, component gallery
- Update package.json version to 0.2.0

### Checklist
- [ ] `npx tsc --noEmit` clean
- [ ] `npx vitest run` all pass
- [ ] `npm run verify` passes
- [ ] README quick start is copy-pasteable
- [ ] Privacy thesis linked from README

---

### Ticket 15: Design System CSS Foundation
**Depth**: alpha | **Modes**: ARCHITECT → BUILDER
**Depends on**: Nothing

Create a Stripe-quality CSS foundation for the lab site.

**Deliverables:**
- `apps/lab-site/src/styles/tokens.css` — CSS custom properties derived from sacred-geometry: spacing scale, type scale, color primitives, border radii, shadows, z-indices
- `apps/lab-site/src/styles/reset.css` — Modern CSS reset (box-sizing, margin, font smoothing)
- `apps/lab-site/src/styles/typography.css` — DM Sans / system-ui stack, golden ratio type scale, reading-optimized line heights
- Update `lab.css` to import these foundations
- Dark mode support via `@media (prefers-color-scheme: dark)` — Museum theme dark palette

### Checklist
- [ ] All spacing uses Fibonacci scale (no arbitrary pixel values)
- [ ] Type scale uses golden ratio progression
- [ ] Dark mode doesn't break any component
- [ ] Fonts load from self-hosted woff2 (no Google Fonts CDN)
- [ ] `npm run verify` passes

---

### Ticket 16: Component Visual Polish (Bio-Resonance)
**Depth**: alpha | **Modes**: BUILDER → PERSONA STORM
**Depends on**: Ticket 15

Apply the CSS foundation to all 5 bio-resonance Svelte components.

**Deliverables:**
- Restyle CalibrationRitual, PresenceAuth, GazeCursor, StressAdaptiveReader, ContinuousAuthGuard
- Stripe aesthetics: generous whitespace, restrained typography, muted palette, single accent, purposeful animation
- Error states: friendly, never technical ("Camera access needed" not "getUserMedia failed")
- Loading states: skeleton screens, not spinners

### Checklist
- [ ] Consistent spacing (Fibonacci scale throughout)
- [ ] Consistent typography (DM Sans / system-ui)
- [ ] Error messages are human-friendly
- [ ] Loading states use skeleton screens
- [ ] PERSONA STORM: "Does this look like a Stripe/Linear product page?"
- [ ] `npm run verify` passes

---

### Ticket 17: Lab Site Navigation Polish
**Depth**: alpha | **Modes**: BUILDER
**Depends on**: Ticket 15

**Deliverables:**
- Update `LabLayout.astro` with polished navigation: logo, section links, active state indicator
- Breadcrumb navigation on subpages
- Footer with privacy statement, links to manifesto, "Built with Asymmetrica" branding
- Responsive hamburger menu on mobile

### Checklist
- [ ] Navigation works on mobile (hamburger or similar)
- [ ] Active page highlighted in nav
- [ ] Footer on every page
- [ ] Keyboard navigable (tab through all links)
- [ ] `npm run verify` passes

---

### Ticket 18: Lab Site Page Polish
**Depth**: alpha | **Modes**: BUILDER → PERSONA STORM
**Depends on**: Tickets 15 + 17

**Deliverables:**
- Polish ALL existing pages: index, aesthetic showcase, component catalog, 3+1 bio demos, manifesto
- Each page has: clear heading, one-paragraph description, the demo/content, contextual navigation
- Index page: hero section with project description + cards linking to each section
- Manifesto page: privacy thesis, mathematical foundation, philosophy, link to open-source intent

### Checklist
- [ ] Every page has a clear purpose statement
- [ ] No "lorem ipsum" or placeholder text
- [ ] Responsive on mobile viewport
- [ ] PERSONA STORM: "Would I share this lab site URL with a colleague?"
- [ ] `npm run verify` passes

---

### Ticket 19: Lab Site Responsive + Accessibility Audit
**Depth**: alpha | **Modes**: VERIFIER → BUILDER
**Depends on**: Ticket 18

**Deliverables:**
- Test every page at 320px, 768px, 1024px, 1440px widths
- Fix any layout breakage
- Tab-order audit: every interactive element reachable via keyboard
- Color contrast check: all text meets WCAG AA (4.5:1)
- `prefers-reduced-motion` audit: no motion when preference set
- Screen reader landmark check: main, nav, header, footer, headings

### Checklist
- [ ] No horizontal scroll at 320px
- [ ] All interactive elements keyboard-reachable
- [ ] All text passes WCAG AA contrast
- [ ] No motion with `prefers-reduced-motion: reduce`
- [ ] Semantic HTML landmarks present
- [ ] `npm run verify` passes

---

### Ticket 20: Aesthetic-Driven Bio-Resonance UI
**Depth**: alpha | **Modes**: ARCHITECT → BUILDER
**Depends on**: Tracks A + B complete
**COHERENCE CHECKPOINT**: Re-read AGENTS.md and WORK_LOG.md before starting.

The cross-engine integration: bio-resonance components styled by the aesthetic engine.

**Deliverables:**
- `apps/lab-site/src/pages/integration/aesthetic-auth.astro` — Calibration ritual rendered in each of the 8 aesthetic regions (user picks region, then does calibration in that visual style)
- Wire the ThemeSwitcher to affect bio-resonance component styling
- Prove that the two packages compose cleanly without coupling

### Checklist
- [ ] Same calibration ritual, 8 different visual styles
- [ ] Region selector works
- [ ] No imports from asymm-aesthetic-engine inside asymm-bio-resonance (they meet only in lab-site)
- [ ] `npm run verify` passes

---

### Ticket 21: Living Lab (Temporal Seeds)
**Depth**: alpha | **Modes**: BUILDER
**Depends on**: Ticket 20

**Deliverables:**
- Lab site index page uses `temporalSeed()` — aesthetic changes daily
- Show current date and seed value: "Today's seed: 20260501 → Region: indie-craft"
- Yesterday/tomorrow preview buttons (peek at adjacent days)
- The lab literally looks different every day you visit

### Checklist
- [ ] Aesthetic changes with date
- [ ] Yesterday/tomorrow preview works
- [ ] Current region name displayed
- [ ] `npm run verify` passes

---

### Ticket 22: Integration Showcase Page
**Depth**: alpha | **Modes**: BUILDER → PERSONA STORM
**Depends on**: Tickets 20 + 21

**Deliverables:**
- `apps/lab-site/src/pages/integration/index.astro` — "Where the engines meet" showcase:
  1. Aesthetic-driven calibration (from ticket 20)
  2. Living lab preview (from ticket 21)
  3. Stress-adaptive reader that changes BOTH density AND aesthetic region based on HRV (new: when stressed, shift toward wabi-sabi/calming region; when calm, allow any region)
- This page is the "money shot" of the lab — the thing that makes people go "oh, THAT'S what this is"

### Checklist
- [ ] All three integrations work on one page
- [ ] HRV→region mapping is smooth (not jarring switches)
- [ ] PERSONA STORM: "Is this the page I'd screenshot and tweet?"
- [ ] `npm run verify` passes

---

### Ticket 23: DECISIONS.md Ledger
**Depth**: alpha | **Modes**: ARCHITECT
**Depends on**: Nothing (run alongside any track)

**Deliverables:**
- `DECISIONS.md` — Capture every non-obvious architectural decision from BOTH V1 and V2 runs. Format:

```markdown
| # | Decision | Why | Alternatives Considered |
|---|----------|-----|------------------------|
| 1 | Stable JSON instead of CBOR for tokens | Avoid binary dep in v1 | CBOR (richer), MessagePack |
| 2 | ... | ... | ... |
```

Scan WORK_LOG.md and your own V2 decisions for entries.

### Checklist
- [ ] At least 15 decisions documented (V1 + V2 combined)
- [ ] Each entry has Why and Alternatives
- [ ] No stubs ("TBD", "TODO")

---

### Ticket 24: PORT_MAP.md Traceability
**Depth**: alpha | **Modes**: ARCHITECT
**Depends on**: Nothing

**Deliverables:**
- `PORT_MAP.md` — For every file ported from `_source_material/`, document:

```markdown
| Source | Target | Ported Concepts | Intentional Changes | Not Ported (Why) |
|--------|--------|-----------------|--------------------|--------------------|
| bio-resonance/math/quaternion.js | math/quaternion.ts | S³ algebra, SLERP, ... | Configurable thresholds | toRGB ad-hoc mapping (replaced with derive/colors) |
```

### Checklist
- [ ] Every `_source_material/` file accounted for
- [ ] Intentional changes justified
- [ ] "Not ported" items explained

---

### Ticket 25: Final Verification + Lab Build
**Depth**: alpha | **Modes**: VERIFIER
**Depends on**: All previous tickets
**COHERENCE CHECKPOINT**: Re-read AGENTS.md and WORK_LOG.md before starting.

**Deliverables:**
- Full test suite run: `npx vitest run` — all pass
- Full verify suite: `npm run verify` — all pass
- Full type check: `npx tsc --noEmit` (both packages) — clean
- Lab site build: `npm run build` in apps/lab-site — all pages build
- Lab site dev server: `npm run dev` in apps/lab-site — runs at localhost:4321
- Final WORK_LOG.md checkpoint with summary stats: total tickets, total tests, total files, total LOC added, elapsed time, coherence observations

### Checklist
- [ ] 0 test failures
- [ ] 0 verify violations
- [ ] 0 TypeScript errors
- [ ] Lab site builds clean
- [ ] Dev server starts
- [ ] WORK_LOG.md complete with all checkpoints

---

## 4. The Autonomy Contract (V2)

Same as V1 with these additions:

- **Run `npm run verify` before every checkpoint.** This is a hard gate — violations must be fixed before proceeding.
- **Coherence checkpoints at tickets 10, 20, and 25** — re-read AGENTS.md and your own WORK_LOG.md to combat drift.
- **Decision ledger is continuous** — append to DECISIONS.md as you go, don't batch at the end.
- **2-hour target** — if you complete all 25 tickets before 2 hours, use remaining time for additional polish. If approaching 2 hours with tickets remaining, prioritize: finish current ticket cleanly → skip to Ticket 25 (final verification) → document incomplete tickets in WORK_LOG.md.

**Work through the tickets in order within each track. Parallelize across tracks where dependencies allow. Do not stop until all 25 tickets are complete or 2 hours have elapsed.**

---

## 5. Summary

| Resource | Location |
|----------|----------|
| Quality contract | `AGENTS.md` |
| V1 work log | `WORK_LOG.md` (read for context) |
| V2 spec (this doc) | `CODEX_HANDOFF_V2.md` |
| Source material | `_source_material/` + `_source_material/README.md` |
| Machine gates | `npm run verify` (`scripts/verify-*.mjs`) |
| Decision ledger | `DECISIONS.md` (you create and maintain) |
| Port map | `PORT_MAP.md` (you create) |
| Existing packages | `packages/asymm-aesthetic-engine/`, `packages/asymm-bio-resonance/` |
| Lab site | `apps/lab-site/` |

**Start with Ticket 1 (Track A) and Ticket 8 (Track B) in parallel if subagents are available. Read AGENTS.md. Run `npm run verify` to confirm gates work. Then build.**

---

Built with Love × Simplicity × Truth × Joy.

🕉️ Om Lokah Samastah Sukhino Bhavantu
