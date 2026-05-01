<script lang="ts">
  import {
    AESTHETIC_REGIONS,
    SeedToQuaternion,
    temporalSeed,
    type AestheticRegion,
    type AestheticRegionName,
    type Quaternion
  } from '../../../../packages/asymm-aesthetic-engine/index.js';

  interface RegionPalette {
    readonly paper: string;
    readonly surface: string;
    readonly ink: string;
    readonly muted: string;
    readonly line: string;
    readonly accent: string;
  }

  const dayMs = 86_400_000;
  const palettes: Record<AestheticRegionName, RegionPalette> = {
    'wabi-sabi': { paper: '#f8f3e7', surface: '#fffdf8', ink: '#221b16', muted: '#5e5143', line: '#d8cfc0', accent: '#7a4312' },
    'neumorphic-soft': { paper: '#e9f0ed', surface: '#f8fbfa', ink: '#1c2926', muted: '#53665e', line: '#c9d6d0', accent: '#496f62' },
    'brutal-raw': { paper: '#f4f0e8', surface: '#ffffff', ink: '#111111', muted: '#333333', line: '#111111', accent: '#c02e1b' },
    'glass-ethereal': { paper: '#eaf7fb', surface: '#ffffff', ink: '#15252d', muted: '#455e68', line: '#bddde8', accent: '#236f93' },
    'modernist-strict': { paper: '#ffffff', surface: '#f4f4f4', ink: '#101010', muted: '#4d4d4d', line: '#d7d7d7', accent: '#295f9a' },
    'indie-craft': { paper: '#fff3df', surface: '#fffaf0', ink: '#2b201b', muted: '#614737', line: '#e4cdb1', accent: '#98411f' },
    'research-paper': { paper: '#fbfbf7', surface: '#ffffff', ink: '#1d1d1d', muted: '#4c5662', line: '#d9d9d2', accent: '#43546d' },
    'ananta-warm': { paper: '#fff1d8', surface: '#fff9ee', ink: '#10201b', muted: '#526052', line: '#e5c894', accent: '#7b4d05' }
  };
  const darkPalettes: Record<AestheticRegionName, RegionPalette> = {
    'wabi-sabi': { paper: '#17120e', surface: '#251c16', ink: '#f8eadb', muted: '#cdbba8', line: '#5b4434', accent: '#e2a15b' },
    'neumorphic-soft': { paper: '#121a18', surface: '#1c2925', ink: '#ecf8f4', muted: '#b3c9c1', line: '#39514a', accent: '#9bd0c0' },
    'brutal-raw': { paper: '#050505', surface: '#141414', ink: '#ffffff', muted: '#d2d2d2', line: '#ffffff', accent: '#ff6247' },
    'glass-ethereal': { paper: '#0c1a22', surface: '#152a34', ink: '#ecfbff', muted: '#b7d4dd', line: '#315a69', accent: '#8fd6f0' },
    'modernist-strict': { paper: '#111111', surface: '#1d1d1d', ink: '#f7f7f7', muted: '#c8c8c8', line: '#555555', accent: '#9ec6f1' },
    'indie-craft': { paper: '#1d130e', surface: '#2a1d15', ink: '#fff0dc', muted: '#d4bda5', line: '#5b3e2d', accent: '#f2a070' },
    'research-paper': { paper: '#141414', surface: '#202020', ink: '#f4f1e9', muted: '#c2c7d0', line: '#4a4a43', accent: '#b8c3dc' },
    'ananta-warm': { paper: '#15130b', surface: '#262010', ink: '#fff2d4', muted: '#d5c79f', line: '#5c4a1e', accent: '#f0bd49' }
  };

  let offset = $state(0);
  const activeDate: Date = $derived(new Date(Date.now() + offset * dayMs));
  const seed: number = $derived(temporalSeed(activeDate));
  const region: AestheticRegion = $derived(detectRegion(SeedToQuaternion(seed)));
  const dateKey: string = $derived(formatDateKey(activeDate));
  const palette: RegionPalette = $derived(palettes[region.name]);

  function formatDateKey(date: Date): string {
    const year = date.getFullYear().toString().padStart(4, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  function inBounds(value: number, bounds: readonly [number, number]): boolean {
    return value >= bounds[0] && value <= bounds[1];
  }

  function detectRegion(value: Quaternion): AestheticRegion {
    const direct = AESTHETIC_REGIONS.find((candidate: AestheticRegion) =>
      inBounds(value.w, candidate.bounds.w) &&
      inBounds(value.x, candidate.bounds.x) &&
      inBounds(value.y, candidate.bounds.y) &&
      inBounds(value.z, candidate.bounds.z)
    );
    if (direct) return direct;

    return AESTHETIC_REGIONS.reduce((best: AestheticRegion, candidate: AestheticRegion) => {
      const candidateDistance = distanceToCenter(value, candidate);
      const bestDistance = distanceToCenter(value, best);
      return candidateDistance < bestDistance ? candidate : best;
    }, AESTHETIC_REGIONS[0]);
  }

  function distanceToCenter(value: Quaternion, candidate: AestheticRegion): number {
    const centerW = (candidate.bounds.w[0] + candidate.bounds.w[1]) / 2;
    const centerX = (candidate.bounds.x[0] + candidate.bounds.x[1]) / 2;
    const centerY = (candidate.bounds.y[0] + candidate.bounds.y[1]) / 2;
    const centerZ = (candidate.bounds.z[0] + candidate.bounds.z[1]) / 2;
    return Math.hypot(value.w - centerW, value.x - centerX, value.y - centerY, value.z - centerZ);
  }

  function applyPalette(): void {
    const root = document.documentElement;
    const mode = root.dataset.colorMode;
    const useDark = mode === 'dark' || (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const activePalette = useDark ? darkPalettes[region.name] : palette;
    root.dataset.region = region.name;
    root.style.setProperty('--paper', activePalette.paper);
    root.style.setProperty('--surface', activePalette.surface);
    root.style.setProperty('--surface-soft', activePalette.paper);
    root.style.setProperty('--ink', activePalette.ink);
    root.style.setProperty('--muted', activePalette.muted);
    root.style.setProperty('--line', activePalette.line);
    root.style.setProperty('--green', activePalette.accent);
    root.style.setProperty('--asymm-bg', activePalette.paper);
    root.style.setProperty('--asymm-surface', activePalette.surface);
    root.style.setProperty('--asymm-text', activePalette.ink);
    root.style.setProperty('--asymm-muted', activePalette.muted);
    root.style.setProperty('--asymm-accent', activePalette.accent);
  }

  $effect(() => {
    applyPalette();
  });
</script>

<section class="living-seed" aria-labelledby="living-seed-title">
  <div>
    <p class="eyebrow">Living Lab</p>
    <h2 id="living-seed-title">Today's seed: {dateKey} -> {region.label}</h2>
    <p>Temporal seeds make the lab drift daily while remaining deterministic and inspectable.</p>
  </div>
  <div class="seed-card" aria-live="polite">
    <span>Seed</span>
    <strong>{seed}</strong>
    <small>{region.mood.join(' / ')}</small>
  </div>
  <div class="seed-actions" aria-label="Temporal seed preview">
    <button type="button" onclick={() => { offset -= 1; }} aria-label="Preview yesterday's seed">Yesterday</button>
    <button type="button" onclick={() => { offset = 0; }} aria-label="Return to today's seed">Today</button>
    <button type="button" onclick={() => { offset += 1; }} aria-label="Preview tomorrow's seed">Tomorrow</button>
  </div>
</section>

<style>
  .living-seed {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-21, 21px);
    align-items: end;
    margin-top: var(--space-34, 34px);
    padding: var(--space-21, 21px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-8, 8px);
    background: var(--surface);
    color: var(--ink);
  }

  .eyebrow {
    margin: 0 0 var(--space-8, 8px);
    color: var(--ink);
    font-size: var(--type--1, 0.618rem);
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: clamp(var(--type-1, 1.618rem), 4vw, var(--type-2, 2.618rem));
    line-height: var(--line-title, 1.05);
  }

  p {
    margin: var(--space-8, 8px) 0 0;
    color: var(--muted);
  }

  .seed-card {
    display: grid;
    gap: var(--space-3, 3px);
    min-width: var(--space-233, 233px);
    padding: var(--space-13, 13px);
    border-radius: var(--radius-8, 8px);
    background: var(--paper);
  }

  .seed-card span,
  .seed-card small {
    color: var(--muted);
    font-weight: 800;
  }

  .seed-card strong {
    overflow-wrap: anywhere;
    font-size: var(--type-1, 1.618rem);
  }

  .seed-actions {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-8, 8px);
  }

  button {
    min-height: var(--space-34, 34px);
    padding: var(--space-8, 8px) var(--space-13, 13px);
    border: var(--space-1, 1px) solid var(--ink);
    border-radius: var(--radius-5, 5px);
    background: var(--ink);
    color: var(--paper);
    font: inherit;
    font-weight: 900;
  }

  @media (max-width: 47.5rem) {
    .living-seed {
      grid-template-columns: 1fr;
    }

    .seed-card {
      min-width: 0;
    }
  }
</style>
