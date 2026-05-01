## Pretext

Internal notes for contributors and agents. Use `README.md` as the public source of truth for API examples and user-facing limitations. See `DEVELOPMENT.md` for the current command surface and the canonical dashboards/snapshots to consult before making browser-accuracy or benchmark claims. Use `TODO.md` for the current priorities.

### Commands

See `DEVELOPMENT.md` for the current command surface and packaging/release checks. Keep the higher-level workflow notes below in sync with that command list rather than duplicating it here.

### Important files

- `package.json` — published entrypoints now target `dist/layout.js` + `dist/layout.d.ts`; keep the package/export surface aligned with the emitted files
- `tsconfig.build.json` — publish-time emit config for `dist/`
- `scripts/package-smoke-test.ts` — tarball-level JS/TS consumer verification for the published package shape
- `src/layout.ts` — core library; keep `layout()` fast and allocation-light
- `src/analysis.ts` — normalization, segmentation, glue rules, and text-analysis phase for `prepare()`
- `src/measurement.ts` — canvas measurement runtime, segment metrics cache, emoji correction, and engine-profile shims
- `src/line-break.ts` — internal line-walking core shared by the rich layout APIs and the hot-path line counter
- `src/bidi.ts` — simplified bidi metadata helper for the rich `prepareWithSegments()` path
- `src/test-data.ts` — shared corpus for browser accuracy pages/checkers and benchmarks
- `src/layout.test.ts` — small durable invariant tests for the exported prepare/layout APIs
- `pages/accuracy.ts` — browser sweep plus per-line diagnostics
- `status/dashboard.json` — machine-readable main status dashboard derived from the checked-in accuracy and benchmark snapshots
- `accuracy/chrome.json` / `accuracy/safari.json` / `accuracy/firefox.json` — checked-in raw accuracy rows
- `pages/benchmark.ts` — performance comparisons
- `benchmarks/chrome.json` / `benchmarks/safari.json` — checked-in current benchmark snapshots
- `corpora/dashboard.json` — machine-readable long-form corpus dashboard derived from the corpus snapshots and notes
- `corpora/representative.json` — checked-in representative corpus anchor rows
- `corpora/chrome-sampled.json` / `corpora/chrome-step10.json` — checked-in Chrome corpus sweep snapshots
- `pages/diagnostic-utils.ts` — shared grapheme-safe diagnostic helpers used by the browser check pages
- `scripts/pre-wrap-check.ts` — small permanent browser-oracle sweep for the non-default `{ whiteSpace: 'pre-wrap' }` mode
- `pages/demos/index.html` — public static demo landing page used as the GitHub Pages site root
- `pages/demos/bubbles.ts` — bubble shrinkwrap demo using the rich non-materializing line-range walker
- `pages/demos/dynamic-layout.ts` — fixed-height editorial spread with a continuous two-column flow, obstacle-aware title routing, and live logo-driven reflow

### Implementation notes

- The published package ships built ESM from `dist/`; `dist/` is publish-time output, not checked-in source.
- Keep shipped library source imports runtime-honest with `.js` specifiers inside `.ts` files. That keeps plain `tsc` emit producing correct JS and `.d.ts` files without a declaration rewrite step.
- `prepare()` / `prepareWithSegments()` do horizontal-only work. `layout()` / `layoutWithLines()` take explicit `lineHeight`.
- `setLocale(locale?)` retargets the hoisted word segmenter for future `prepare()` calls and clears shared caches. Use it before preparing new text when the app wants a specific `Intl.Segmenter` locale instead of the runtime default.
- `prepare()` should stay the opaque fast-path handle. If a page/script needs segment arrays, that should usually flow through `prepareWithSegments()` instead of re-exposing internals on the main prepared type.
- `walkLineRanges()` is the rich-path batch geometry API: no string materialization, but still browser-like line widths/cursors/discretionary-hyphen state. Prefer it over private line walkers for shrinkwrap or aggregate layout work.
- `prepare()` is internally split into a text-analysis phase and a measurement phase; keep that seam clear, but keep the public API simple unless requirements force a change.
- The internal segment model now distinguishes at least eight break kinds: normal text, collapsible spaces, preserved spaces, tabs, non-breaking glue (`NBSP` / `NNBSP` / `WJ`-like runs), zero-width break opportunities, soft hyphens, and hard breaks. Do not collapse those back into one boolean unless the model gets richer in a better way.
- `layout()` is the resize hot path: no DOM reads, no canvas calls, no string work, and avoid gratuitous allocations.
- Segment metrics cache is `Map<font, Map<segment, metrics>>`; shared across texts and resettable via `clearCache()`. Width is only one cached fact now; grapheme widths and other segment-derived facts can be populated lazily.
- Word and grapheme segmenters are hoisted at module scope. Any locale reset should also clear the word cache.
- Punctuation is merged into preceding word-like segments only, never into spaces.
- Keep script-specific break-policy fixes in preprocessing, not `layout()`. That includes Arabic no-space punctuation clusters, Arabic punctuation-plus-mark clusters, and `" " + combining marks` before Arabic text.
- `NBSP`-style glue should survive `prepare()` as visible content and prevent ordinary word-boundary wrapping; `ZWSP` should survive as a zero-width break opportunity.
- Soft hyphens should stay invisible when unbroken, but if the engine chooses that break, the broken line should expose a visible trailing hyphen in `layoutWithLines()`.
- If a soft hyphen wins the break, the rich line APIs should still expose the visible trailing `-` in `line.text`, even though the public line types do not currently carry a separate soft-hyphen metadata flag.
- `layoutNextLine()` is the rich-path escape hatch for variable-width userland layout. It now hides its grapheme-cache bookkeeping again by internally splitting line stepping from text materialization. Keep that internal split semantically aligned with `layoutWithLines()`, but do not pull its extra bookkeeping into the hot `layout()` path.
- Astral CJK ideographs, compatibility ideographs, and the later extension blocks must still hit the CJK path; do not rely on BMP-only `charCodeAt()` checks there.
- Non-word, non-space segments are break opportunities, same as words.
- CJK grapheme splitting plus kinsoku merging keeps prohibited punctuation attached to adjacent graphemes.
- Emoji correction is auto-detected per font size, constant per emoji grapheme, and effectively font-independent.
- Bidi levels now stay on the rich `prepareWithSegments()` path as custom-rendering metadata only. The opaque fast `prepare()` handle should not pay for bidi metadata that `layout()` does not consume, and line breaking itself does not read those levels.
- A larger pure-TS Unicode stack like `text-shaper` is useful as reference material, especially for Unicode coverage and richer bidi metadata, but its runtime segmentation and greedy glyph-line breaker are not replacements for our browser-facing `Intl.Segmenter` + preprocessing + canvas-measurement model.
- Supported CSS target is still the common app-text configuration: `white-space: normal`, `word-break: normal`, `overflow-wrap: break-word`, `line-break: auto`.
- There is now a second explicit whitespace mode, `{ whiteSpace: 'pre-wrap' }`, for ordinary spaces, `\t` tabs, and `\n` hard breaks. Tabs follow the default browser-style tab stops. Treat it as editor/input-oriented, not the whole CSS `pre-wrap` surface.
- Keep the permanent `pre-wrap` coverage small and explicit. A one-time raw-source validation was useful, but the standing repo coverage should stay a compact oracle set rather than a giant sweep over wiki scaffolding.
- That default target means narrow widths may still break inside words, but only at grapheme boundaries. Keep the core engine honest to that behavior; if an editorial page wants stricter whole-word handling, layer it on top in userland instead of quietly changing the library default.
- `system-ui` is unsafe for accuracy; canvas and DOM can resolve different fonts on macOS.
- Accuracy pages and checkers are now expected to be green in all three installed browsers on fresh runs; if a page disagrees, suspect stale tabs/servers before changing the algorithm.
- The browser automation lock is self-healing for stale dead-owner files now, but it is still single-owner per browser. If a checker times out on the lock, confirm a live checker process still owns it before changing the algorithm.
- Accuracy/corpus/Gatsby checkers can use background-safe browser automation, but benchmark runs should stay foreground. Do not “optimize away” benchmark focus; throttled/background tabs make the numbers less trustworthy.
- Accuracy and the coarse corpus/Gatsby sweep paths now batch widths in-page after a single navigation. Prefer those sweep entrypoints over userland “navigate once per width” loops, and keep the slow single-width checkers for diagnosis.
- Keep the transport split deliberate: small automation reports can ride the hash, but large batched reports should use the local POST side channel instead of stuffing every row into `#report=...`.
- Browser-automation timeouts now report the last page phase they saw (`loading`, `measuring`, or `posting`). Treat `posting` timeouts as transport-side clues first; they usually point at the report side channel rather than the text engine.
- For deep perf or memory work, prefer an isolated debuggable Chrome over a pure Bun microbenchmark. Bun is fine for quick hypotheses, but Chrome profiling is the better source of truth for CPU hotspots, allocation churn, and retained-heap checks.
- Refresh `benchmarks/chrome.json` and `benchmarks/safari.json` when a diff changes benchmark methodology or the text engine hot path (`src/analysis.ts`, `src/measurement.ts`, `src/line-break.ts`, `src/layout.ts`, `src/bidi.ts`, or `pages/benchmark.ts`). Regenerate `status/dashboard.json` after those snapshot changes.
- `bun start` is the stable human-facing dev server. Use `bun run start:watch` only when you explicitly want Bun's watch/reload client. The scripted checkers intentionally keep using `--no-hmr` temporary servers so their runs stay deterministic and easy to tear down.
- Do not run multiple browser corpus/sweep/font-matrix jobs in parallel against the same browser. The automation session and temporary page server paths interfere with each other and can make a healthy corpus look hung or flaky.
- An `ERR_CONNECTION_REFUSED` tab on `localhost:3210` or a similar temporary checker port usually means you caught a per-run Bun server after teardown. That is expected after the script exits; it is not, by itself, evidence of a bad measurement.
- Keep `src/layout.test.ts` small and durable. For browser-specific or narrow hypothesis work, prefer throwaway probes/scripts and promote only the stable invariants into permanent tests.
- For Gatsby canary work, sweep widths cheaply first and only diagnose the mismatching widths in detail. The slow detailed checker is for narrowing root causes, not for every width by default.
- For Arabic corpus/probe work, use normalized slices, the exact corpus font, and the RTL `Range`-based diagnostics. Raw offsets or rough fallback fonts will mislead you.
- For `pre-wrap` probe work, Safari span extraction is currently a better cross-check than Safari `Range` extraction around preserved spaces and hard breaks. Keep using `Range` for the default `white-space: normal` diagnostics unless the mode itself is the thing under test.
- For Southeast Asian and Arabic/Urdu raw-diagnostic work, keep using the script-appropriate extractor instead of forcing one Safari rule everywhere.
- The corpus/probe diagnostic pages now compute our line offsets directly from prepared segments and grapheme fallbacks; do not go back to reconstructing them from `layoutWithLines().line.text.length`.
- `/corpus`, `corpus-check`, and `corpus-sweep` now accept `font` / `lineHeight` overrides. Use those before inventing a second page or checker when the question is “does this same corpus stay healthy under another font?”
- Prefer Chrome for the first font-matrix pass. Safari font-matrix automation is slower and noisier, so treat it as follow-up smoke coverage.
- Mixed app text is now a first-class canary. Use it to catch product-shaped classes like URL/query-string wrapping, emoji ZWJ runs, and mixed-script punctuation before tuning another book corpus.
- URL-like runs such as `https://...` / `www...` are currently modeled as two breakable preprocessing units when a query exists: the path through the query introducer (`?`), then the query string. This is intentionally narrow and exists to stop obviously bad mid-path URL breaks without forcing the whole query string to fragment character-by-character.
- Mixed app text also pulled in two more keep-worthy preprocessing rules: contextual escaped quote clusters like `\"word\"`, and numeric/time-range runs like `२४×७` / `7:00-9:00`.
- For Southeast Asian scripts or mixed text containing Thai/Lao/Khmer/Myanmar, trust the `Range`-based corpus diagnostics over span-probing; span units can perturb line breaking there.
- The remaining Chrome mixed-app `710px` soft-hyphen miss is extractor-sensitive and not cleanly local. Treat it as paragraph-scale / accumulation-sensitive until a cleaner reproducer appears, and do not patch the engine from only one extractor view.
- Safari `Range`-based probe extraction can over-advance across URL query text (`...path?q`) even when the real DOM height and the `span` extractor are exact. Cross-check `--method=span` before changing the engine on Safari URL/query probe misses.
- Keep the current corpus lessons in mind:
  - Thai: contextual ASCII quotes were a real keep
  - Khmer: explicit zero-width separators from clean source text are useful signal
  - Lao: wrapped raw-law text was a bad canary and was rejected
  - Myanmar: punctuation/medial-glue keeps survived, broader Chrome-only fixes did not
  - Japanese: kana iteration marks are CJK line-start-prohibited
  - Chinese: the remaining broad Chrome-positive field is real and not obviously another punctuation bug
- The corpus diagnostics should derive our candidate lines from `layoutWithLines()`, not from a second local line-walker. That avoids SHY and future custom-break drift between the hot path and the diagnostic path.
- Current line-fit tolerance is `0.005` for Chromium/Gecko and `1/64` for Safari/WebKit. That bump was justified by the remaining Arabic fine-width field and did not move the solved browser corpus or Gatsby coarse canary.
- Refresh `accuracy/chrome.json`, `accuracy/safari.json`, and `accuracy/firefox.json` when a diff changes the browser sweep methodology or the main text engine behavior (`src/analysis.ts`, `src/measurement.ts`, `src/line-break.ts`, `src/layout.ts`, `src/bidi.ts`, or `pages/accuracy.ts`).
- Refresh `corpora/representative.json` when a diff intentionally changes one of the tracked representative canaries or their canonical anchor behavior. Keep it compact: anchors and designated fragile-width sentinels, not every exploratory sweep result.
- Refresh `corpora/chrome-sampled.json`, `corpora/chrome-step10.json`, and then regenerate `corpora/dashboard.json` when the corpus sweep methodology or long-form canary behavior changes in a way that moves the dashboard counts.

### Open questions

- Decide whether line-fit tolerance should stay as a browser-specific shim or move to runtime calibration alongside emoji correction.
- If a future Arabic corpus still exposes misses after preprocessing and corpus cleanup, decide whether that needs a richer break-policy model or a truly shaping-aware architecture beyond segment-sum layout.
- `layoutWithLines()` now returns line boundary cursors (`start` / `end`) in addition to `{ text, width }`; keep that data model useful for future manual reflow work, especially for the richer editorial demos.
- The dynamic-layout demo is the current real consumer of the rich line API. If a future custom-layout page wants more metadata, make it prove that need there before expanding the rich API again.
- The browser demos should increasingly dogfood `layoutNextLine()` rather than depending on `layoutWithLines()` for whole-paragraph materialization. That keeps the streaming userland path honest.
- ASCII fast path could skip some CJK, bidi, and emoji overhead.
- Benchmark methodology still needs review.
- Additional CSS configs are still untested: `break-all`, `keep-all`, `strict`, `loose`, `anywhere`.

### Related

- `../text-layout/` — Sebastian Markbage's original prototype + our experimental variants.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **pretext** (763 symbols, 2262 relationships, 60 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/pretext/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/pretext/context` | Codebase overview, check index freshness |
| `gitnexus://repo/pretext/clusters` | All functional areas |
| `gitnexus://repo/pretext/processes` | All execution flows |
| `gitnexus://repo/pretext/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
