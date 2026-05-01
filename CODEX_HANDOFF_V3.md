# CODEX_HANDOFF_V3.md — Visual Polish & Region Identity

**Status**: Ready for autonomous execution
**Estimated scope**: ~12 tickets, ~1 hour
**Integration depth**: alpha (same as V2)
**Prerequisite**: Read `AGENTS.md`, `WORK_LOG.md`, `DECISIONS.md` first

---

## Preamble — What You Built Is Excellent

V1 and V2 shipped an extraordinary foundation in under 2.5 hours combined:

- **12 static pages** with consistent layout, breadcrumbs, and navigation
- **77 tests** across 22 files, all passing
- **46 architectural decisions** documented with rationale and alternatives
- **Complete port map** accounting for every source file
- **Stripe-quality copy** — "The page slows down when the body asks for room" is genuinely beautiful writing
- **Privacy discipline** — every bio-resonance page carries honest, visible privacy language
- **Seed Explorer** — the crown jewel. Live slider, real-time tokens, region detection, 10 component primitives responding to seed changes

The architecture is sound. Package boundaries are clean. Test coverage is real. The methodology artifacts (DECISIONS.md, PORT_MAP.md, WORK_LOG.md) are best-in-class.

**V3 is not a correction — it's elevation.** The foundation deserves a visual layer that matches its architectural quality. The goal: make the lab site a living proof of what the aesthetic engine produces.

---

## The One Principle Behind Every Ticket

**The design engine should demonstrate itself.**

Every region card should BE its region. Every component card should SHOW its component. Every theme switch should transform the page. The product is the proof.

---

## Tickets

### Ticket 1: Typography Scale Tightening

**Problem**: H1 titles are ~80-100px and create visual canyons. "Aesthetic Engine" wraps to 3 lines on desktop. The jump from h1 to body text is too steep.

**Fix**: Implement a fluid clamp-based type scale using PHI from sacred-geometry.

```css
/* Target scale — adjust exact values to feel right */
--type-h1: clamp(2.4rem, 4vw + 1rem, 4rem);
--type-h2: clamp(1.8rem, 2.5vw + 0.8rem, 2.8rem);
--type-h3: clamp(1.2rem, 1.5vw + 0.6rem, 1.6rem);
--type-body: clamp(0.95rem, 0.5vw + 0.8rem, 1.1rem);
```

**Where**: `apps/lab-site/src/styles/` — the CSS foundation layer from V2.

**Checklist**:
- [ ] H1 never wraps more than 2 lines at 1440px
- [ ] H1 to body ratio feels like a smooth staircase, not a cliff
- [ ] Mobile h1 is readable without scrolling sideways
- [ ] All 12 pages checked — no title overflow anywhere

### Ticket 2: Card Grid Responsive Fix

**Problem**: Region cards on `/aesthetic-engine/` and component cards on `/aesthetic-engine/components/` clip horizontally. Titles like "Neumorphic-soft", "Testimonials", "Timeline" are cut off because the grid uses fixed column widths.

**Fix**: Switch to responsive `auto-fill` / `minmax` grid.

```css
/* Target — cards flow and never clip */
grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
```

**Checklist**:
- [ ] No card title clips at 1440px, 1024px, 768px, or 375px
- [ ] Cards wrap naturally — 4 per row on desktop, 2 on tablet, 1 on mobile
- [ ] Consistent gap between cards (use Fibonacci spacing from sacred-geometry)

### Ticket 3: Theme Switcher Repositioning

**Problem**: The floating bottom-right theme widget overlaps region cards, token labels, and body text on multiple pages.

**Fix**: Move the theme switcher inline — either into the site header (right side, next to nav) or as a collapsible sidebar panel. It should be always accessible but never overlay content.

**Checklist**:
- [ ] Theme switcher no longer overlaps any page content
- [ ] Accessible on every page without scrolling
- [ ] Keyboard navigable (arrow keys through options)
- [ ] Current theme clearly indicated
- [ ] Does not interfere with mobile hamburger menu

### Ticket 4: Region Cards Demonstrate Their Aesthetic

**This is the highest-leverage ticket in V3.**

**Problem**: All 8 region cards on `/aesthetic-engine/` look identical — white background, colored border, 3 small color dots, same font. The design engine's main selling point is that different seeds produce different aesthetics, but the overview page doesn't show this.

**Fix**: Each region card should render using its own region's derived tokens. The card IS its region.

| Region | Card treatment |
|--------|---------------|
| Wabi-sabi | Warm paper background, slightly asymmetric border-radius, muted text, textured feel |
| Neumorphic-soft | Soft inner/outer shadows, rounded corners, pastel surface, no hard borders |
| Brutal-raw | High contrast black/white, sharp edges, heavy bold type, no radius |
| Glass-ethereal | Semi-transparent background, subtle blur, light borders, thin type |
| Modernist-strict | Grid-precise padding, medium-weight sans, geometric border, neutral surface |
| Indie-craft | Slightly irregular spacing, warm tones, hand-drawn border feel |
| Research-paper | Dense serif-friendly type, wide margins, footnote-like descriptors |
| Ananta-warm | Golden accents, generous spacing, breathing rhythm, devotional warmth |

**Implementation**: Use the existing `deriveAll()` from the aesthetic engine to generate per-region tokens, then apply them as inline CSS custom properties on each card.

**Checklist**:
- [ ] Each card is visually distinct at a glance
- [ ] Color swatches are larger (at least 24px diameter, up from current ~16px)
- [ ] Each card has a 1-line unique flavor description (not "Deterministic tokens from seed-space position" for all)
- [ ] Cards still pass WCAG AA contrast
- [ ] Grid layout from Ticket 2 is preserved

### Ticket 5: Component Catalog Enrichment

**Problem**: All 12 component cards on `/aesthetic-engine/components/` share the same description and show no visual preview.

**Fix**:
1. Add a unique 1-line description per component (what it IS, not what system it uses)
2. Add a small visual preview or icon representing the component shape

| Component | Description |
|-----------|------------|
| Hero | Full-width landing section with headline and call to action |
| Navbar | Horizontal navigation bar with logo and links |
| Card | Contained content block with image, title, and body |
| Button | Interactive action trigger with seed-derived weight |
| Modal | Overlay dialog for focused interaction |
| Pricing | Feature-comparison pricing table |
| Testimonial | Quote block with attribution and avatar |
| Gallery | Image grid with seed-derived spacing |
| Code Block | Syntax-highlighted code with region-aware chrome |
| Data Table | Structured data rows with sortable headers |
| Timeline | Chronological event sequence with connecting line |
| Command Bar | Keyboard-driven command palette overlay |

**Checklist**:
- [ ] Each card has a unique description
- [ ] No card says "Region-aware palette, radius, shadow, texture, and motion variables"
- [ ] Cards render with their current theme's token styling
- [ ] Grid doesn't clip (Ticket 2 dependency)

### Ticket 6: Dark Mode

**Problem**: V2 Track C specified dark mode via `prefers-color-scheme`. Not implemented.

**Fix**: Add dark mode CSS tokens to the foundation layer. Respect `prefers-color-scheme: dark` automatically. Add a manual light/dark toggle near the theme switcher.

**Approach**: Each region should have a dark variant. The token derivation already produces foreground/background pairs — swap their roles for dark mode. Keep contrast ratios valid.

**Checklist**:
- [ ] `prefers-color-scheme: dark` triggers dark mode automatically
- [ ] Manual toggle overrides system preference
- [ ] All 12 pages are legible in dark mode
- [ ] Bio-resonance camera preview areas differentiate from dark page background
- [ ] Privacy footer readable in dark mode
- [ ] Color contrast still passes WCAG AA

### Ticket 7: Full-Page Theme Cascade

**Problem**: Currently theme changes only affect component-level CSS variables. Switching to "Brutal Raw" doesn't change the page background, heading weight, or spacing. The page feels the same in every theme.

**Fix**: Make theme selection cascade to the full page. The root `<html>` element should receive region-derived tokens for:
- Page background and surface colors
- Heading font weight and letter spacing
- Base border radius
- Default spacing scale
- Link and accent colors

**Checklist**:
- [ ] Switching themes visibly transforms the entire page, not just cards
- [ ] Wabi-sabi feels warm and muted site-wide
- [ ] Brutal-raw feels stark and high-contrast site-wide
- [ ] Glass-ethereal feels light and airy site-wide
- [ ] All 8 regions produce noticeably different full-page experiences
- [ ] Theme transition is smooth (a CSS transition on root variables, ~200ms)

### Ticket 8: Token Table Mobile Layout

**Problem**: The Seed Explorer's token swatch grid (--asymm-bg, --asymm-surface, etc.) doesn't reflow on mobile. Text overlaps and is unreadable at 375px.

**Fix**: Stack tokens vertically on mobile. Each token gets its own row: swatch circle + variable name + value.

**Checklist**:
- [ ] Token table readable at 375px without horizontal scroll
- [ ] Swatch circles remain visible and correctly colored
- [ ] Variable names don't truncate

### Ticket 9: Simulated Camera Animation

**Problem**: The dark grey "Simulated demo" box on Calibration, Gaze, Reader, and Auth pages is visually inert. It communicates nothing about what the feature does.

**Fix**: Add a subtle animation to the simulated camera area. Options (pick one that respects `prefers-reduced-motion`):
- Gentle gradient pulse cycling through muted tones
- Minimal particle field (3-5 slowly drifting dots)
- Soft radial breathing animation (expand/contract)

The animation should convey "a living signal would appear here" without being distracting.

**Checklist**:
- [ ] Simulated camera area has visible but calm animation
- [ ] `prefers-reduced-motion: reduce` disables animation entirely
- [ ] Animation does not distract from adjacent interactive elements
- [ ] "Simulated demo" badge remains clearly visible

### Ticket 10: Hover States & Micro-Interactions

**Problem**: Cards and navigation links have no hover feedback. Interactive elements don't signal interactivity.

**Fix**: Add subtle hover states throughout:
- Region/component cards: gentle lift (translateY -2px + shadow increase)
- Navigation links: underline slide-in or opacity shift
- "View DNA" links: arrow slide on hover
- Buttons (Start/Stop): subtle scale pulse

All transitions should use sacred-geometry timing (PHI-based duration: ~160ms or ~260ms).

**Checklist**:
- [ ] Every clickable element has a visible hover state
- [ ] Hover transitions feel smooth, not instant
- [ ] No hover effect is jarring or distracting
- [ ] `prefers-reduced-motion` respected — hover still shows but without animation

### Ticket 11: Region Color Swatch Enhancement

**Problem**: The 3 small circles per region card (~16px diameter) are hard to distinguish. Glass-ethereal and Modernist-strict look nearly identical at a glance.

**Fix**: Increase swatch size to 28-32px. Show 5 colors instead of 3 (bg, surface, text, primary, accent). Add a subtle tooltip or label on hover showing the variable name.

**Checklist**:
- [ ] Swatches are visually distinct at a glance between all 8 regions
- [ ] At least 5 colors shown per region
- [ ] Accessible (not relying solely on color — shape or label available)

### Ticket 12: Final Verification & Polish Pass

**Gates** (all must pass):
- [ ] `npx vitest run` — all tests pass
- [ ] `npm run verify` — privacy, a11y, forbidden scans pass
- [ ] TypeScript `--noEmit` passes for both packages
- [ ] `npm run build` in `apps/lab-site` — all pages build
- [ ] Visual check: all 12 pages at 1440px, 1024px, 768px, 375px — no overflow, no clipping
- [ ] Dark mode check: all 12 pages legible
- [ ] Theme cascade check: switching themes transforms the full page
- [ ] Region cards: all 8 are visually distinct
- [ ] Component cards: all have unique descriptions
- [ ] `prefers-reduced-motion`: verified on animated elements

**Append to DECISIONS.md** any new architectural choices made during V3.
**Append to WORK_LOG.md** with full checkpoint format per ticket.

---

## Dependency Graph

```
Ticket 1 (typography) ──┐
Ticket 2 (card grid) ───┤── Ticket 4 (region cards) ──┐
Ticket 3 (theme pos.) ──┘                              │
                                                        ├── Ticket 7 (full cascade) ── Ticket 12
Ticket 5 (component cards) ────────────────────────────┤
Ticket 6 (dark mode) ──────────────────────────────────┤
Ticket 8 (token mobile) ──────────────────────────────┤
Ticket 9 (camera anim.) ──────────────────────────────┤
Ticket 10 (hover states) ──────────────────────────────┤
Ticket 11 (swatches) ──────────────────────────────────┘
```

Tickets 1-3 should complete first (CSS foundation). Ticket 4 depends on 2. Ticket 7 depends on 4. All others are independent.

---

## Autonomy Contract

- You have full permissions. Start with Ticket 1.
- Follow the Cognitive Rotation Protocol from `AGENTS.md`.
- Run `npm run verify` before every checkpoint.
- Append decisions to `DECISIONS.md` as you go.
- Coherence checkpoint at Ticket 6 (midpoint): re-read `AGENTS.md` and `WORK_LOG.md`.
- Do not stop until all 12 tickets are complete.
- Spiral exit rule: 3 failures on the same error → document the limitation, write the best partial solution, move on.

---

## What Comes After V3

Once this visual polish lands, the next phase is **real bio-resonance wiring** — connecting the calibration ritual to actual MediaPipe landmarks, PPG extraction from live camera feed, and using that signal to drive the adaptive reader and presence guard in real-time.

The design philosophy document at `docs/DESIGN_PHILOSOPHY.md` describes the full vision: biomimetic interaction, cross-modal phantom sensation, personalized calibration, and behavioral field components. V3 gives us the visual foundation to build that on.

You've built something worth being proud of. Let's make it shine. ✦
