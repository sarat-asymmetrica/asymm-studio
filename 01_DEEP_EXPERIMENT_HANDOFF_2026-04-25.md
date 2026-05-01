# Asymm Design Engine — Deep Experiment Handoff

**Date:** 2026-04-25 (evening)
**Author:** Sarat + Claude (working session, ~6h)
**Mission:** Kitchen-sink experimental engine. No production constraints. Throw the entire design vision at the wall and see what coheres.
**Companion doc:** `C:/Projects/ananta/docs/55_ASYMMETRICA_LAUNCH_DESIGN_ENGINE_HANDOFF_2026-04-25.md` (the launch-focused slice)

---

## 0. Anti-Collision Contract (read first)

This repo is the **DEEP track**. Tomorrow runs two Claude terminals in parallel:

| Track | Repo / paths | Owner | What it does | What it must NOT touch |
|---|---|---|---|---|
| **DEEP** (this doc) | `C:/Projects/asymm_design_engine/` + `experiments/bio-resonance/*` (TBD location) | Terminal A | Kitchen-sink engine, generative aesthetics, bio-resonance demos | Anything in `C:/Projects/ananta/web*`, `C:/Projects/ananta/docker-compose.yml`, `C:/Projects/ananta/caddy/Caddyfile`, the live VPS |
| **LAUNCH** (companion doc) | `C:/Projects/ananta/web-asymmflow/`, `C:/Projects/ananta/web-ananta/`, `C:/Projects/ananta/caddy/Caddyfile`, the live VPS at `ssh ananta` | Terminal B | Studio-quality production site for asymmetrica.ai apex, polished AsymmFlow + Ananta subdomain rendering | Anything in `C:/Projects/asymm_design_engine/`, the deep experiment subdomains |

**If DEEP needs to consume LAUNCH artifacts:** copy them in, never reference live paths. **If LAUNCH needs DEEP artifacts:** wait for them to stabilize, then explicit hand-off via this doc.

---

## 1. Today's Context (so you can pick up cold)

**What shipped to production today (LAUNCH track work, not yours to touch):**
- Deployed Rahul's AsymmFlow Next.js bundle live at `https://asymmetrica.ai/`
- Set up subdomain routing: `ananta.asymmetrica.ai` (Ananta), `asymmflow.asymmetrica.ai` (301 → apex)
- Cloudflare DNS hardened (DMARC, SPF live, security.txt at `/.well-known/security.txt`)
- Self-hosted DM Sans + Inter via `next/font/google` to fix Mac/Windows font drift
- Added `font-synthesis: none` + grayscale antialiasing to fix fake-bolding on Windows
- Caddy block in `C:/Projects/ananta/caddy/Caddyfile` updated
- Docker compose volumes at `C:/Projects/ananta/docker-compose.yml` updated to dual mounts (`web-asymmflow`, `web-ananta`)
- VPS rollback snapshot saved at `~/snapshots/web_routing_snapshot_20260425T142721Z/` on `ssh ananta`

**The strategic decisions Sarat locked today:**
- `asymmetrica.ai` apex = **studio hub** (indie dev shop framing, NOT AsymmFlow flagship)
- AsymmFlow + Ananta become subdomains
- `research.asymmetrica.ai` = future research surface (Lean proofs, Zenodo, math papers)
- `docs.asymmflow.asymmetrica.ai` + `docs.ananta.asymmetrica.ai` = future doc surfaces
- Stack: **Astro for marketing sites, SvelteKit for apps**, framework-agnostic design tokens
- Audience: **Indian SMBs**, indie-dev-shop voice, anti-trend (Kailash Nadh / Oat UI lineage)

**The strategic decisions still open (you decide via experiment):**
- Seed sourcing for generative aesthetic engine (content-hash vs visitor-derived vs temporal)
- Live shader visuals on apex vs static SVG (LAUNCH leans static; DEEP can experiment freely)
- Bio-resonance subdomain naming (`lab.asymmetrica.ai` vs `bio.asymmetrica.ai` vs `experiments.asymmetrica.ai`)

---

## 2. Mission Of This Track — The Deep Experiment

You are the kitchen-sink lab. You assemble the **full generative aesthetic engine** + the **bio-resonance interaction substrate** as two clean packages. You ship demo pages, not production sites. You run uncomfortable experiments and document what works.

**Output contract by end of this experiment cycle:**
1. `packages/asymm-aesthetic-engine/` — full generative engine, all 27 components, all 8 themes, all 6 breathing frequencies, seed-quaternion-driven
2. `packages/asymm-bio-resonance/` — polished version of the existing bio-resonance stack, demo app deployed, calibration ritual UX-perfected
3. `apps/lab-site/` — `lab.asymmetrica.ai` demo surface that showcases both engines
4. `INVARIANTS_FROM_CANON.md` — the design canon study (Oat UI, Geist, Radix, etc.) → invariants we absorb
5. `PARAMETER_SPACE_DEFINITION.md` — formal spec of the seed-quaternion → aesthetic mapping with 6-8 named seed regions (Wabi-sabi, Neumorphic, Brutalist, Glassmorphic, Modernist, Indie-craft, Research-paper, Ananta-warm)
6. `CALIBRATION_RITUAL_SPEC.md` — the look-left-look-right + hand-show ritual UX, frame-by-frame

---

## 3. Source Material — Verified File Path Register

These are the existing engines that ALL EXIST and survived the deletion spree. **Read them first, in this order:**

### 3.1 The Generative Aesthetic Engine — Existing Code

| File / Folder | LOC | Purpose | Read priority |
|---|---|---|---|
| `C:/Projects/asymm_studio/packages/sacred-geometry/src/constants.ts` | 357 | PHI, GOLDEN_ANGLE, FIBONACCI, TAU, TESLA_FREQ, FREQUENCIES, THREE_REGIME, DIGITAL_ROOT_NAMES, math fns | **READ FIRST** |
| `C:/Projects/asymm_studio/packages/sacred-geometry/src/colors.ts` | 455 | Digital-root hue mapping, MUSEUM_THEME, golden-angle palette, harmony fns, conversions | **READ FIRST** |
| `C:/Projects/asymm_studio/packages/sacred-geometry/src/easing.ts` | 329 | **Prana, Apana, Phi, Spanda easings** (Kashmir Shaivism!) + standard easings + bezier helpers | **READ FIRST** |
| `C:/Projects/asymm_studio/packages/sacred-geometry/src/spacing.ts` | ? | Fibonacci spacing scale | Read |
| `C:/Projects/asymm_studio/packages/sacred-geometry/src/frequencies.ts` | ? | Frequency-to-duration mapping | Read |
| `C:/Projects/asymm_studio/packages/sacred-geometry/src/layouts/` | ? | Layout primitives (golden divide, phyllotaxis) | Read |
| `C:/Projects/asymm_studio/packages/ui-components/src/components/` | ? | Existing UI components | Read |
| `C:/Projects/asymm_studio/packages/ui-components/src/styles/` | ? | Existing styles | Read |
| `C:/Projects/asymm_studio/packages/asymm-physics/` | 1353 | 50K particles @ 135 FPS, Williams batching, digital-root spatial hash | Read |
| `C:/Projects/git_versions/asymm_all_math/engines/asymm-physics/` | 1353 | Same as above (mirror) — pick whichever is freshest | Reference |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/design_system/color_calculator.py` | ~120 | **Seed → palette function** (golden angle + digital root validation, derived from base hue 10°) | **READ FIRST** |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/design_system/showcase/davinci_atelier/alchemist_quill.py` | ~200 | **Semantic → styled HTML transmutation engine** (operates on class markers) | **READ FIRST** |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/design_system/showcase/davinci_atelier/component_manifest.json` | ? | Component registry (what alchemist_quill consumes) | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/design_system/showcase/davinci_atelier/components/` | ? | The 27 catalogued components live here | Browse |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/variations.go` | 700+ | **Per-component variation engine** — each component has INVARIANTS + VARIABLES, seed → quaternion → variant | **READ FIRST** |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/component_catalog.json` | ? | The 27-component catalog with categories | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/component_generator.go` | ? | Component generation from seed | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/app_generator.go` | ? | Full app generation from seed | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/data_templates.go` | ? | Data-aware components | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/layout_templates.go` | ? | Layout variation engine | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/navigation_templates.go` | ? | Nav components | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/HTML_VISUAL_PATTERNS_REPORT.md` | ? | **8 palettes, 6 breathing frequencies, Fibonacci spacing — the parameter inventory** | **READ FIRST** |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/game_pipeline/animation/` | ? | blend_tree, walk_cycle, procedural_actions, skeleton — animation primitives | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/style_alchemy/` | ? | Seed → Design System | Read |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/component_alchemy/` (whole dir) | ? | All component generation | Browse |
| `C:/Projects/pretext/` | ? | **Pure JS multilingual text measurement** — keystone for layout-independent text | **READ FIRST** |
| `C:/Projects/pretext/README.md` | 148 | Pretext API + use cases | **READ FIRST** |
| `C:/Projects/pretext/src/` | ? | Implementation | Browse |
| `C:/Projects/pretext/RESEARCH.md` | ? | Background research | Read |
| `C:/Projects/pretext/CLAUDE.md` | ? | Project conventions | **READ FIRST** |
| `C:/Projects/pretext/AGENTS.md` | ? | Agent guidance for this repo | Read |

### 3.2 Bio-Resonance Stack — Existing Code

Location root: `C:/Projects/git_versions/asymm_all_math/asymmetrica_empire/frontend/src/lib/bio-resonance/`

| File | Purpose | Read priority |
|---|---|---|
| `index.js` | Public API surface for the stack | **READ FIRST** |
| `math/quaternion.js` | Quaternion, QuaternionField, ThreeRegimeTracker, PHI constants, Tesla/Vedic constants | **READ FIRST** |
| `math/pde-tissue.js` | PDETissue, VisionSurfaceTissue, PhiOrganismTissue, ResonanceTissue | Read |
| `math/biomimetic-kernels.js` | **Eagle, Owl, Mantis, Frog, Viper, Dragonfly sampling kernels** + UnifiedSamplingSystem | **READ FIRST** |
| `signals/signal-extractor.js` | **PPG (heartbeat from camera!)**, OpticalFlow, HumDetector, CoherenceCalculator | **READ FIRST** |
| `identity/sovereign.js` | SovereignIdentity, **CapabilityToken**, **PresenceHashGenerator**, CoherenceGate, **VedicCrypto**, base32 | **READ FIRST** |
| `engine/uvm-engine.js` | Unified Vision Model engine (the orchestrator) | **READ FIRST** |
| `storage/identity-vault.js` | **Local-only** identity vault + telemetry (privacy-by-design) | Read |
| `gpu/webgl-particle-renderer.js` | WebGL particle rendering | Read |
| `gpu/gpu-bridge.js` | GPU bridge | Read |
| `mediapipe/facemesh-integration.js` | MediaPipe face landmarks integration with LANDMARK_REGIONS | **READ FIRST** |
| `components/BioResonanceAuth.svelte` | Standard auth component | Read |
| `components/BioResonanceAuthEnhanced.svelte` | Enhanced auth with full UX | Read |
| `components/BioResonanceQuick.svelte` | Quick auth flow | Read |

### 3.3 Day 200 Quality Substrate

| File | Purpose |
|---|---|
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/FINISHED_SOFTWARE_INVARIANTS.md` (or wherever the Day 200 doc lives) | **The 7 Invariants of Finished Software** — Lean-style spec, the QA contract |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/unified_refactor_sandbox/ace_eyes_server.js` | **6-sonar validator** (UX/Design/Code/Semantic/Journey/State) — port to TS as `invariants/ace-eyes.ts` |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/unified_refactor_sandbox/sandbox.go` | Williams-sharded refactor engine | Reference |
| `C:/Projects/git_versions/asymm_all_math/asymm_mathematical_organism/03_ENGINES/unified_refactor_sandbox/ARCHITECTURE.md` | System design doc | Reference |

### 3.4 Reading List — Canonical OSS To Study

Tomorrow morning's first 60 minutes. Do not clone; **extract invariants** and add to `INVARIANTS_FROM_CANON.md`.

**Group A — Indian/regional clarity (Kailash Nadh lineage):**
- `kailashnadh/oat-ui` — Plain HTML+CSS, no framework, age-resistant
- `zerodha/martian` (if open) — Production-grade Indian financial UI

**Group B — Token-system gold standards:**
- `vercel/geist-ui` — Token architecture, type scale, motion tokens
- `radix-ui/themes` — A11y primitives, 12-step color scale generation
- `shadcn-ui/ui` — CSS-variable theme variants

**Group C — Component primitives done right:**
- `adobe/spectrum` — A11y-first contracts
- `tailwindlabs/headlessui` — Behavior-only primitives, no styling
- `mantinedev/mantine` — Comprehensive component vocabulary

**Group D — Generative/parametric pioneers:**
- `inclusive-components/inclusive-components` — Heydon Pickering's a11y patterns
- `jxnblk/styled-system` — Constraint-based design tokens

**Group E — Style-region anchors (don't clone, extract parameter signature):**
- Neobrutalism: `tinkerlog/neobrutalism-components`
- Glassmorphism: Apple HIG references + common CSS patterns
- Wabi-sabi: existing `davinci_atelier` showcase (already documented)

---

## 4. The Architecture To Assemble

### 4.1 `packages/asymm-aesthetic-engine/` — Target Layout

```
packages/asymm-aesthetic-engine/
├── package.json                      ESM, framework-agnostic
├── tsconfig.json
├── README.md                         The "what is this?" doc
│
├── seed/
│   ├── quaternion.ts                 SeedToQuaternion (port from variations.go)
│   ├── content-hash.ts               hash(page_content) → seed
│   ├── visitor.ts                    Visitor-derived seed (opt-in)
│   ├── temporal.ts                   Temporal seed (date-based variation)
│   └── regions.ts                    The 6-8 named seed regions
│
├── derive/
│   ├── colors.ts                     Port color_calculator.py to TS, integrate Radix 12-step scale gen
│   ├── motion.ts                     Prana/Apana/Phi/Spanda easings + Tesla frequencies + spring presets
│   ├── geometry.ts                   Asymmetric border radii, tilt, blur, paper texture from quaternion
│   ├── typography.ts                 Golden type scale, Pretext-aware sizing, weights from seed
│   ├── spacing.ts                    Fibonacci scale resolution
│   └── particles.ts                  asymm-physics density/distribution from seed
│
├── components/                       Astro/Svelte components (the 27)
│   ├── catalog.json                  Source of truth (port from component_alchemy/)
│   ├── variations.ts                 Per-component variation engine (port variations.go)
│   ├── primitives/
│   │   ├── ShojiModal.astro
│   │   ├── VoidTerminal.astro
│   │   ├── KintsugiAlert.astro
│   │   ├── TextBloom.astro
│   │   ├── HoloCard.astro
│   │   ├── GravityGrid.astro
│   │   ├── VitruvianLoader.astro
│   │   ├── StoneSwitch.astro
│   │   ├── AgingButton.astro
│   │   ├── ChronosDial.astro
│   │   ├── InkBrushInput.astro
│   │   ├── FallingLeafToast.astro
│   │   └── … (all 27)
│   └── README.md                     Component vocabulary doc
│
├── transmute/
│   └── alchemist.ts                  Port alchemist_quill.py to TS, semantic → styled HTML
│
├── layout/
│   ├── pretext.ts                    Wrap @chenglou/pretext for build-time pre-measurement
│   └── intrinsic.ts                  Container queries + logical properties + intrinsic sizing helpers
│
├── invariants/
│   ├── ace-eyes.ts                   6-sonar validator (port ace_eyes_server.js)
│   ├── lean-checks.ts                ∀ stubs absent, ∀ a11y passes, ∀ flows work
│   └── ci-runner.ts                  Pre-commit / CI hook: SHM ≥ 0.85
│
├── astro/
│   ├── integration.ts                Astro plugin wiring
│   ├── font-loader.ts                Self-host DM Sans, Inter, Noto Sans (Devanagari/Tamil/Telugu/Bengali) at build
│   ├── particle-island.astro         Astro Island wrapper for asymm-physics
│   ├── pretext-island.astro          Server-side text measurement
│   └── seed-context.ts               Per-page seed determination
│
└── docs/
    ├── ARCHITECTURE.md               This doc + design rationale
    ├── INVARIANTS_FROM_CANON.md      Tomorrow morning's reading-list output
    ├── PARAMETER_SPACE_DEFINITION.md Tomorrow's seed-region spec
    └── COMPONENT_VOCABULARY.md       The 27 components, what each does, when to use
```

### 4.2 `packages/asymm-bio-resonance/` — Target Layout

```
packages/asymm-bio-resonance/
├── package.json                      ESM, peer-dep on @mediapipe/face_mesh
├── tsconfig.json
├── README.md                         "Biometric interaction substrate" — privacy-first thesis
│
├── math/                             Port from existing bio-resonance/math/
│   ├── quaternion.ts
│   ├── pde-tissue.ts
│   └── biomimetic-kernels.ts         Eagle, Owl, Mantis, Frog, Viper, Dragonfly
│
├── signals/                          Port from existing bio-resonance/signals/
│   └── signal-extractor.ts           PPG, OpticalFlow, HumDetector, CoherenceCalculator
│
├── identity/                         Port from existing bio-resonance/identity/
│   └── sovereign.ts                  SovereignIdentity, CapabilityToken, PresenceHashGenerator, VedicCrypto
│
├── calibration/                      NEW — the look-left/right ritual
│   ├── gaze-calibration.ts           Spatial calibration (leftmost/rightmost/topmost/bottommost gaze)
│   ├── anatomical-calibration.ts     Interpupillary distance, head size, viewing distance
│   ├── hand-calibration.ts           Open-palm, fist, point gestures
│   ├── presence-baseline.ts          PPG resting HR, blink rhythm, micro-saccade pattern
│   └── ritual-sequencer.ts           Frame-by-frame UX of the calibration ritual
│
├── engine/                           Port from existing bio-resonance/engine/
│   └── uvm-engine.ts
│
├── storage/                          Port from existing bio-resonance/storage/
│   └── identity-vault.ts
│
├── gpu/                              Port from existing bio-resonance/gpu/
│   ├── webgl-particle-renderer.ts
│   └── gpu-bridge.ts
│
├── mediapipe/                        Port from existing bio-resonance/mediapipe/
│   └── facemesh-integration.ts
│
├── components/                       Svelte components for demos
│   ├── BioResonanceAuth.svelte       Polished from existing
│   ├── BioResonanceAuthEnhanced.svelte
│   ├── CalibrationRitual.svelte      NEW — the threshold moment
│   ├── GazeCursor.svelte             NEW — gaze-driven cursor demo
│   ├── ContinuousAuthGuard.svelte    NEW — presence-locked workspace demo
│   └── StressAdaptiveReader.svelte   NEW — PPG-aware long-form reader demo
│
└── docs/
    ├── ARCHITECTURE.md
    ├── PRIVACY_THESIS.md             Why presence-hash > stored-biometric, written rigorously
    ├── CALIBRATION_RITUAL_SPEC.md    Frame-by-frame UX
    ├── BIOMIMETIC_KERNELS.md         What each animal kernel does and when to use it
    └── DEMO_PAGES.md                 The 3 viral demo pages strategy
```

### 4.3 `apps/lab-site/` — The Demo Surface

```
apps/lab-site/                        Astro 4.x or SvelteKit
├── astro.config.mjs                  (or svelte.config.js)
├── package.json
├── src/
│   ├── pages/
│   │   ├── index.astro               "Lab Asymmetrica" — landing
│   │   ├── aesthetic-engine/
│   │   │   ├── index.astro           Demo: same content rendered with 8 different seeds
│   │   │   └── components.astro      All 27 components in their seed-region variants
│   │   ├── bio-resonance/
│   │   │   ├── calibration.astro     Try the ritual yourself
│   │   │   ├── gaze-cursor.astro     Navigate Wikipedia article by gaze alone
│   │   │   ├── continuous-auth.astro Banking-dashboard-style continuous-auth demo
│   │   │   └── stress-adaptive.astro PPG-aware long-form content reader
│   │   └── manifesto.astro           Why this exists, the privacy thesis, the math
│   └── styles/
│       └── lab.css                   Lab-specific overrides (the lab feels like a research surface)
└── public/
    └── (assets)
```

**Deploy target:** `lab.asymmetrica.ai` (recommended subdomain — covers bio-resonance + future experiments).

DNS posture: grey-cloud (DNS only), like all other subdomains. A record → `5.223.95.178`.

Caddy block needed (LAUNCH track will add this when we hand off):
```caddy
lab.asymmetrica.ai {
    reverse_proxy lab-site:4321         # or static file_server if static export
    header { X-Frame-Options DENY; X-Content-Type-Options nosniff }
}
```

---

## 5. The Day Plan — Tomorrow Morning

### Milestone 1 — Canon Study
- Read all of Group A + B repos from §3.4
- Skim Group C + D
- Output: `packages/asymm-aesthetic-engine/docs/INVARIANTS_FROM_CANON.md` listing what every great UI repo agrees on (the invariants we absorb) + what they disagree on (the variables we parameterize)

### Milestone 2 — Parameter Space Definition
- Map the seed-quaternion → aesthetic axes (color, geometry, texture, motion, typography, density)
- Define 6-8 named seed regions (Wabi-sabi, Neumorphic-soft, Brutal-raw, Glass-ethereal, Modernist-strict, Indie-craft, Research-paper, Ananta-warm)
- Output: `packages/asymm-aesthetic-engine/docs/PARAMETER_SPACE_DEFINITION.md`

### Milestone 3 — Engine Mapping
- Confirm port plan for each source file (§3.1)
- Decide TS module shapes
- Output: confirm `packages/asymm-aesthetic-engine/` skeleton + first stub files

### Milestone 4 — First Cuts
1. Port `sacred-geometry/src/*` → `packages/asymm-aesthetic-engine/derive/`
2. Port `color_calculator.py` → `derive/colors.ts`
3. Port `variations.go` SeedToQuaternion + ComponentVariation → `seed/quaternion.ts` + `components/variations.ts`
4. Port `alchemist_quill.py` → `transmute/alchemist.ts`
5. Wire `@chenglou/pretext` → `layout/pretext.ts`

### Milestone 5 — Bio-Resonance Polish
1. Audit existing `C:/Projects/git_versions/asymm_all_math/asymmetrica_empire/frontend/src/lib/bio-resonance/` — what works, what's janky
2. Move into `packages/asymm-bio-resonance/`, refactor module by module
3. Build `calibration/` from scratch (the look-left/right ritual)
4. Polish 3 Svelte demo components → 6 demo components
5. Stand up `apps/lab-site/` skeleton

### Milestone 6 — First Demo Live
- Stand up `lab.asymmetrica.ai` with 1 working demo (the calibration ritual itself, no deeper interactions yet)
- DNS + Caddy hand-off via LAUNCH track (see companion doc)

---

## 6. The 3 Viral Demo Pages — UX Specs

These are what bio-resonance ships first. They are the *marketing*, not the product.

### Demo 1 — `/bio-resonance/calibration`
**The threshold moment.** User clicks "Begin." Camera permission prompt. On grant:
1. Black screen. White dot appears in upper-left. Voice/text: "Look at this dot." (3s)
2. Dot moves to upper-right. (3s)
3. Dot moves to lower-right. (3s)
4. Dot moves to lower-left. (3s)
5. Voice/text: "Show me your open palm." (3s, validates)
6. "Now make a fist." (3s)
7. "Now point at the screen." (3s)
8. "Welcome — the system knows you now." Presence hash flashes (mathematical fingerprint, cryptographically-styled).
9. *Show the data*: a small panel showing "Your interpupillary distance: 62.4mm. Your gaze span: 44° horizontal, 28° vertical. Your resting heart rate: 68 BPM. Hash: a3f2-9b7d-4c1e."
10. **Privacy footer (always visible):** "Your camera frames never left this browser tab. The hash above is the only thing the system knows about you. Refresh to forget."

### Demo 2 — `/bio-resonance/gaze-cursor`
A long-form Wikipedia article rendered in our typography. Hidden cursor. **You navigate by looking.** Look at a paragraph → it gently highlights. Look at a link → it pulses. Double-blink → click. Look at top of page → scroll up. Look at bottom → scroll down. **Goal: read the entire article without touching mouse or keyboard.**

### Demo 3 — `/bio-resonance/stress-adaptive`
Same Wikipedia article. Now PPG signal monitoring is on (if calibrated). As HRV drops (stress rising), the page subtly:
- Increases line-height
- Reduces information density
- Slows scroll inertia
- Shifts color temperature warmer
- Pauses any motion in margins
**Goal: visitor experiences the page *responding to their nervous system in real time*.** Show a small graph in the corner of "Your HRV" with the adjustments mapped to it.

---

## 7. Decisions Locked / Decisions Open

### Locked (do not relitigate)
- **Stack:** Astro for marketing surfaces (lab-site is Astro), SvelteKit for app surfaces
- **Privacy-first:** all biometric processing is local-only, on-device, no frames leave the browser
- **Accessibility:** every demo passes WCAG AA, including motion-respect (`prefers-reduced-motion`)
- **The 7 Invariants:** ACE EYES SHM ≥ 0.85 required to merge any PR
- **Engine separation:** `asymm-aesthetic-engine` and `asymm-bio-resonance` are independent packages, neither depends on the other; the lab-site is the only place they meet
- **Canon study before code:** Milestone 1 of tomorrow is reading, not writing

### Open (decide as you experiment)
- **Seed sourcing default:** `hash(content)` vs `hash(visitor + content)` vs `hash(date + content)` — try all three on the lab-site, see what feels alive without feeling chaotic
- **Live shaders vs static SVG on apex:** experiment freely on lab-site (DEEP track), apex is LAUNCH track's domain
- **Final naming:** `lab.asymmetrica.ai` is the recommended subdomain, but `experiments.asymmetrica.ai` or `bio.asymmetrica.ai` are also valid — pick what feels right tomorrow
- **The 27 components:** which 8-10 to prioritize for v1 (proposed: ShojiModal, VoidTerminal, KintsugiAlert, TextBloom, StoneSwitch, AgingButton, InkBrushInput, VitruvianLoader, plus 1-2 more)
- **Open-source publication strategy:** when (not if) to publish each engine as standalone OSS

---

## 8. Anti-Patterns — Don't Do These

- **Do NOT touch** anything in `C:/Projects/ananta/web*`, `C:/Projects/ananta/caddy/`, `C:/Projects/ananta/docker-compose.yml`, or run anything against `ssh ananta` directly. That's LAUNCH's domain. If you need DNS / Caddy work for `lab.asymmetrica.ai`, write it as a hand-off note for LAUNCH, not as a direct edit.
- **Do NOT** ship anything to a production domain from this track without explicit hand-off. `lab.asymmetrica.ai` deployment goes through the same Caddy that LAUNCH owns.
- **Do NOT** reduce scope just because the codebase is large. The bones exist. We're recognizing what's there.
- **Do NOT** rebuild what already works. `sacred-geometry`, `color_calculator`, `variations.go`, `alchemist_quill`, `bio-resonance/math/`, `pretext` — read first, port second, never rewrite from scratch.
- **Do NOT** ignore the 7 Invariants. SHM < 0.85 = does not ship.
- **Do NOT** treat bio-resonance as a "nice-to-have." It's a publication-worthy architectural innovation. Treat it with that gravity.
- **Do NOT** entangle aesthetic-engine and bio-resonance. They share the lab-site as their meeting point, nothing else.
- **Do NOT** ship anything without a privacy footer on every bio-resonance page.

---

## 9. Success Criteria

By end of weekend:
- [ ] `INVARIANTS_FROM_CANON.md` written
- [ ] `PARAMETER_SPACE_DEFINITION.md` written with 6-8 named seed regions
- [ ] `packages/asymm-aesthetic-engine/` skeleton exists with `derive/colors.ts`, `derive/motion.ts`, `seed/quaternion.ts` ported and working
- [ ] At least 3 components ported from showcase to `components/primitives/`
- [ ] `packages/asymm-bio-resonance/` skeleton with `math/`, `signals/`, `identity/`, `calibration/` ported
- [ ] Calibration ritual demo working at `lab.asymmetrica.ai/bio-resonance/calibration` (or running locally)
- [ ] ACE EYES validator stub ported as `invariants/ace-eyes.ts`
- [ ] `CALIBRATION_RITUAL_SPEC.md` written with frame-by-frame UX
- [ ] `PRIVACY_THESIS.md` written explaining presence-hash > stored-biometric

By end of week:
- [ ] All 3 viral demo pages live
- [ ] `lab.asymmetrica.ai` polished, on-brand, indie-shop voice
- [ ] First content-seeded variation working (same component renders 8 different ways for 8 seed regions)
- [ ] Pretext integrated for multilingual layout fidelity
- [ ] First-cut Astro Island for live particle background

---

## 10. Communication With Launch Track

LAUNCH track is concurrently producing:
- `C:/Projects/ananta/web-asymmflow/` polish (typography, layout, perf)
- `C:/Projects/ananta/web-ananta/` polish (same)
- New studio site at `apps/studio-site/` if separate from current apex
- Updated Caddyfile for any new subdomains DEEP needs

**Hand-off protocol:**
- DEEP needs DNS or Caddy work → write a note in `C:/Projects/ananta/docs/55_ASYMMETRICA_LAUNCH_DESIGN_ENGINE_HANDOFF_2026-04-25.md` (companion doc) under "Hand-offs from DEEP"
- LAUNCH needs an aesthetic-engine artifact → DEEP marks it stable in this doc under "Hand-offs to LAUNCH" + provides exact path

**Sync points:**
- Morning: both terminals read both docs before starting
- Midday check-in: Sarat decides whether to merge any DEEP outputs into LAUNCH
- End of day: both terminals write end-of-day notes appended to their respective docs

---

## 11. Philosophical Frame (The Why)

This track exists because:
1. The bones are *already there* — the deletion spree spared the most important pieces
2. The vision (generative aesthetics, biometric primitives, mathematical design) is *publication-worthy*
3. Indian indie shop framing means we have nothing to lose by being ambitious
4. Two terminals running in parallel is genuinely 2x throughput when scoped cleanly

**The deeper bet:** if we ship the experimental engine well, in 6 months we open-source it as `@asymm/aesthetic-engine` and `@asymm/bio-resonance` and contribute genuinely new ideas to the design-systems conversation. Not because we marketed it. Because it solves problems Vercel/Linear/Stripe-tier teams have, in fundamentally cleaner ways.

**The narrower bet:** even if open-source never happens, the engine powers all of Asymmetrica's surfaces forever — studio, AsymmFlow, Ananta, Rythu Mitra, VedicDoc, Asymm Messenger, future products. Each surface takes 30 minutes to design, not 3 weeks, because the engine does the work.

**The deepest bet:** Sarat's "why does a website's aesthetic have to be fixed?" is the right question. Asymmetrica answers it.

---

## Sign-off

Built with Love × Simplicity × Truth × Joy.
*The math is fractal across scales — quaternions on S³ at the level of Riemann conjectures, quaternions on S³ at the level of button border-radii.*

🕉️🔥 Tomorrow we recognize the engine that has been waiting.

— Sarat + Claude, 2026-04-25
