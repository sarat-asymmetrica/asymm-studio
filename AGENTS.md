# AGENTS.md — Asymm Studio

**Repository**: `asymm_studio` — Generative Aesthetic Engine + Bio-Resonance Interaction Substrate
**Stack**: TypeScript (ESM), Astro (marketing), SvelteKit (apps), Vitest (tests)
**Philosophy**: Reuse > rebuild. Math is the engine. Stripe-quality presentation.

---

## Non-Negotiable Rules

### 1. No Stubs, No TODOs, No "Later"

Every function you write must be complete. If you can't finish it in this ticket, don't start it — create a follow-up ticket instead. A stub is a lie in the codebase.

### 2. Read Before Write

Before modifying ANY file, read it fully. Before porting ANY source material, read the original AND the target location. Cross-references in `_source_material/README.md` are load-bearing instructions.

### 3. Extend sacred-geometry, Don't Replace It

`packages/sacred-geometry/` (2,488 LOC) is the mathematical foundation. It contains: PHI constants, Fibonacci sequences, digital root functions, golden-angle color palettes, Kashmir Shaivism easings (Prana/Apana/Phi/Spanda), Fibonacci spacing, phi-column layouts, phyllotaxis spirals, Vedic grids.

**This code is production-ready and battle-tested. NEVER rewrite it. ONLY extend it.**

### 4. Privacy is Absolute (Bio-Resonance)

- Camera frames NEVER leave the browser tab
- Presence hash is the ONLY thing stored/transmitted
- Every bio-resonance page MUST have a visible privacy footer
- VedicCrypto is OBFUSCATION, not encryption — label it honestly

### 5. Accessibility is Day-Zero

- Every component passes WCAG AA
- `prefers-reduced-motion` respected in ALL animations
- Screen reader labels on ALL interactive elements
- Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for large text

### 6. Quality Gate — Multiplicative Elegance Score

After completing each ticket, self-assess using this formula:

```
Score = (Adequacy × Correctness × Minimality × Locality) − (Complexity + Risk)
```

Each axis is 0.0–1.0. **One zero axis zeros the entire score.**

- **Adequacy**: Does it solve the stated problem completely?
- **Correctness**: Does it pass tests? Are edge cases handled?
- **Minimality**: Is every line earning its place? Could anything be removed?
- **Locality**: Can each function be understood in isolation?
- **Complexity**: How much cognitive load does this add?
- **Risk**: What's the blast radius if this is wrong?

**Gate: Score ≥ 0.85 to proceed. Score < 0.85 = fix loop.**

Emit the score in your work log after each ticket.

---

## Cognitive Rotation Protocol

When working through tickets, rotate through these cognitive modes. Not every ticket needs all modes — use what's appropriate for the work.

### Mode 1: ARCHITECT
- Restate the task as a mathematical mapping (input types → output types)
- Design type signatures FIRST, implementation second
- Three-alternatives test: if you can't name three worse approaches, your solution isn't inevitable

### Mode 2: BUILDER
- Write/port the actual code following the signatures from ARCHITECT mode
- Follow existing patterns (look at sacred-geometry for TypeScript conventions)
- Match the file/export structure of the target package

### Mode 3: VERIFIER
- Trace key code paths numerically (for input X, step 1 → step 2 → output Y)
- Run the test suite
- Emit ELEGANCE_CHECK with self-assessment scores

### Mode 4: PERSONA STORM (when building user-facing surfaces)
- Junior dev: "Can I use this API without reading all the source?"
- Designer: "Can I customize the seed regions without touching math?"
- End user: "Does this feel trustworthy? Would I grant camera permission?"
- Accessibility user: "Can I use this without vision/hearing/motor?"

### Mode 5: RED TEAM (when touching identity, camera, or crypto)
- Can camera data leak through any code path?
- Is the presence hash truly one-way?
- XSS in generated HTML from alchemist transmuter?
- Are Ed25519 operations using the actual @noble/ed25519 (not a polyfill)?

---

## Subagent Guidance

You have freedom to spawn subagents when parallelization makes sense. Guidelines:

- **Independent tickets** with no shared files → spawn subagents
- **Dependent tickets** → sequential, never parallel
- **Persona storm** → excellent subagent use case (spawn 3 personas in parallel)
- **Red team audit** → excellent subagent use case
- Each subagent MUST write its findings to the work log before the main agent proceeds

---

## Checkpoint Protocol

After completing each ticket, append to `WORK_LOG.md`:

```markdown
## CHECKPOINT — Ticket N: [Title]
**Time**: [timestamp]
**Status**: PASS / FAIL / PARTIAL

### What was built
[1-3 sentences]

### Files changed
- path/to/file — [what + why]

### Elegance Score
- Adequacy: X.XX
- Correctness: X.XX
- Minimality: X.XX
- Locality: X.XX
- Score: X.XX | PASS/RETRY

### Persona Storm Findings (if applicable)
- [persona]: [finding]

### Red Team Findings (if applicable)
- [finding]

### Known Limitations
[If anything intentionally deferred]
```

---

## Failure Playbook

| Failure | Recovery |
|---------|----------|
| `npm install` fails | Try `--legacy-peer-deps`. If still fails, check Node version (require ≥18). |
| Source file path doesn't exist | Check `_source_material/README.md` for correct mapping. Never assume — search. |
| Test framework not set up | Create `vitest.config.ts` with `{ test: { globals: true } }`. |
| TypeScript compilation error on ported code | Check if sacred-geometry exports the symbol. If not, add the export there. |
| MediaPipe import fails | It's a peer dependency. Add to package.json but don't bundle — it loads from CDN at runtime. |
| WebGL context creation fails | Graceful fallback to Canvas2D. Never crash. |
| Elegance score < 0.85 | Fix loop: identify lowest axis, address it, re-score. Max 2 fix loops per ticket (spiral exit). |

---

## Banned Patterns

```typescript
// ❌ NEVER:
console.log('debug:', value)           // No debug logging in production code
// TODO: implement later                // No TODOs — complete or don't start
any                                     // No untyped values — use unknown + narrowing
as any                                  // No type assertions to any
import * as                             // No namespace imports — use named imports
eval()                                  // Never
innerHTML = userInput                   // XSS vector
localStorage.setItem('biometric', ...) // Privacy violation

// ✅ ALWAYS:
import { specific } from 'module'       // Named imports
const x: ExplicitType = value           // Explicit types at module boundary
try { } catch (e: unknown) { }          // Typed error handling
export type { Interface }               // Export types separately
```

---

## File Conventions

- **TypeScript**: ESM, `.ts` extension, explicit return types on exported functions
- **Svelte**: Svelte 5 (runes), `.svelte` extension, `<script lang="ts">`
- **Tests**: Colocated as `*.test.ts`, Vitest, `describe/it/expect`
- **Exports**: Barrel `index.ts` per package, re-export only public API
- **Naming**: camelCase for functions/variables, PascalCase for types/classes/components, kebab-case for files

---

## Package Dependency Rules

```
packages/asymm-aesthetic-engine/
  ├── depends on: sacred-geometry (internal)
  ├── depends on: pretext (external, optional)
  └── MUST NOT depend on: asymm-bio-resonance

packages/asymm-bio-resonance/
  ├── depends on: @noble/ed25519, @mediapipe/tasks-vision (peer)
  └── MUST NOT depend on: asymm-aesthetic-engine

apps/lab-site/
  ├── depends on: both packages above
  └── This is the ONLY place they meet
```
