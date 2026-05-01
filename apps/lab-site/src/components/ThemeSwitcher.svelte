<script lang="ts">
  import {
    AESTHETIC_REGIONS,
    type AestheticRegion,
    type AestheticRegionName
  } from '../../../../packages/asymm-aesthetic-engine/index.js';

  interface ThemePalette {
    readonly paper: string;
    readonly surface: string;
    readonly ink: string;
    readonly muted: string;
    readonly line: string;
    readonly accent: string;
  }

  const storageKey = 'asymm-active-region';
  const palettes: Record<AestheticRegionName, ThemePalette> = {
    'wabi-sabi': { paper: '#f8f3e7', surface: '#fffdf8', ink: '#221b16', muted: '#5e5143', line: '#d8cfc0', accent: '#7a4312' },
    'neumorphic-soft': { paper: '#e9f0ed', surface: '#f8fbfa', ink: '#1c2926', muted: '#53665e', line: '#c9d6d0', accent: '#496f62' },
    'brutal-raw': { paper: '#f4f0e8', surface: '#ffffff', ink: '#111111', muted: '#333333', line: '#111111', accent: '#e43d25' },
    'glass-ethereal': { paper: '#eaf7fb', surface: '#ffffff', ink: '#15252d', muted: '#455e68', line: '#bddde8', accent: '#236f93' },
    'modernist-strict': { paper: '#ffffff', surface: '#f4f4f4', ink: '#101010', muted: '#4d4d4d', line: '#d7d7d7', accent: '#295f9a' },
    'indie-craft': { paper: '#fff3df', surface: '#fffaf0', ink: '#2b201b', muted: '#614737', line: '#e4cdb1', accent: '#98411f' },
    'research-paper': { paper: '#fbfbf7', surface: '#ffffff', ink: '#1d1d1d', muted: '#4c5662', line: '#d9d9d2', accent: '#43546d' },
    'ananta-warm': { paper: '#fff1d8', surface: '#fff9ee', ink: '#10201b', muted: '#526052', line: '#e5c894', accent: '#7b4d05' }
  };

  let activeName: AestheticRegionName = $state('wabi-sabi');
  const activeRegion: AestheticRegion = $derived(AESTHETIC_REGIONS.find((region: AestheticRegion) => region.name === activeName) ?? AESTHETIC_REGIONS[0]);

  function applyTheme(name: AestheticRegionName): void {
    const palette = palettes[name];
    const root = document.documentElement;
    root.style.setProperty('--paper', palette.paper);
    root.style.setProperty('--surface', palette.surface);
    root.style.setProperty('--ink', palette.ink);
    root.style.setProperty('--muted', palette.muted);
    root.style.setProperty('--line', palette.line);
    root.style.setProperty('--green', palette.accent);
    root.style.setProperty('--asymm-bg', palette.paper);
    root.style.setProperty('--asymm-surface', palette.surface);
    root.style.setProperty('--asymm-text', palette.ink);
    root.style.setProperty('--asymm-muted', palette.muted);
    root.style.setProperty('--asymm-accent', palette.accent);
  }

  function selectRegion(event: Event): void {
    const select = event.currentTarget;
    if (!(select instanceof HTMLSelectElement)) return;
    activeName = select.value as AestheticRegionName;
    sessionStorage.setItem(storageKey, activeName);
    applyTheme(activeName);
  }

  $effect(() => {
    const stored = sessionStorage.getItem(storageKey);
    const candidate = AESTHETIC_REGIONS.find((region: AestheticRegion) => region.name === stored);
    if (candidate) activeName = candidate.name;
    applyTheme(activeName);
  });
</script>

<aside class="theme-switcher" aria-label="Aesthetic region theme switcher">
  <label>
    <span>Theme</span>
    <select value={activeName} on:change={selectRegion} aria-label="Switch active aesthetic region">
      {#each AESTHETIC_REGIONS as region}
        <option value={region.name}>{region.label}</option>
      {/each}
    </select>
  </label>
  <p aria-live="polite">{activeRegion.label}</p>
</aside>

<style>
  .theme-switcher {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 30;
    display: flex;
    align-items: end;
    gap: 10px;
    padding: 10px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    color: var(--ink);
    box-shadow: 0 18px 50px color-mix(in srgb, var(--ink), transparent 88%);
  }

  label {
    display: grid;
    gap: 4px;
    color: var(--muted);
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  select {
    min-width: 170px;
    min-height: 38px;
    border: 1px solid var(--line);
    border-radius: 6px;
    background: var(--paper);
    color: var(--ink);
    font: inherit;
    font-size: 0.92rem;
    text-transform: none;
  }

  p {
    margin: 0;
    color: var(--ink);
    font-size: 0.88rem;
    font-weight: 900;
  }

  @media (max-width: 680px) {
    .theme-switcher {
      right: 10px;
      bottom: 10px;
      left: 10px;
      justify-content: space-between;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-switcher {
      transition: none;
    }
  }
</style>
