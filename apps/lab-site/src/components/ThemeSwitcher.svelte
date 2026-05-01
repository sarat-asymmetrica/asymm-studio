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
  const modeStorageKey = 'asymm-color-mode';
  type ColorMode = 'system' | 'light' | 'dark';

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
  const darkPalettes: Record<AestheticRegionName, ThemePalette> = {
    'wabi-sabi': { paper: '#17120e', surface: '#251c16', ink: '#f8eadb', muted: '#cdbba8', line: '#5b4434', accent: '#e2a15b' },
    'neumorphic-soft': { paper: '#121a18', surface: '#1c2925', ink: '#ecf8f4', muted: '#b3c9c1', line: '#39514a', accent: '#9bd0c0' },
    'brutal-raw': { paper: '#050505', surface: '#141414', ink: '#ffffff', muted: '#d2d2d2', line: '#ffffff', accent: '#ff6247' },
    'glass-ethereal': { paper: '#0c1a22', surface: '#152a34', ink: '#ecfbff', muted: '#b7d4dd', line: '#315a69', accent: '#8fd6f0' },
    'modernist-strict': { paper: '#111111', surface: '#1d1d1d', ink: '#f7f7f7', muted: '#c8c8c8', line: '#555555', accent: '#9ec6f1' },
    'indie-craft': { paper: '#1d130e', surface: '#2a1d15', ink: '#fff0dc', muted: '#d4bda5', line: '#5b3e2d', accent: '#f2a070' },
    'research-paper': { paper: '#141414', surface: '#202020', ink: '#f4f1e9', muted: '#c2c7d0', line: '#4a4a43', accent: '#b8c3dc' },
    'ananta-warm': { paper: '#15130b', surface: '#262010', ink: '#fff2d4', muted: '#d5c79f', line: '#5c4a1e', accent: '#f0bd49' }
  };

  let activeName: AestheticRegionName = $state('wabi-sabi');
  let colorMode: ColorMode = $state('system');
  const activeRegion: AestheticRegion = $derived(AESTHETIC_REGIONS.find((region: AestheticRegion) => region.name === activeName) ?? AESTHETIC_REGIONS[0]);
  const modeLabel: string = $derived(colorMode === 'dark' ? 'Dark' : colorMode === 'light' ? 'Light' : 'System');

  function isDarkMode(mode: ColorMode): boolean {
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function applyTheme(name: AestheticRegionName): void {
    const palette = isDarkMode(colorMode) ? darkPalettes[name] : palettes[name];
    const root = document.documentElement;
    root.dataset.region = name;
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

  function applyColorMode(mode: ColorMode): void {
    const root = document.documentElement;
    if (mode === 'system') {
      delete root.dataset.colorMode;
      return;
    }

    root.dataset.colorMode = mode;
  }

  function selectRegion(event: Event): void {
    const select = event.currentTarget;
    if (!(select instanceof HTMLSelectElement)) return;
    activeName = select.value as AestheticRegionName;
    sessionStorage.setItem(storageKey, activeName);
    applyTheme(activeName);
  }

  function toggleColorMode(): void {
    colorMode = colorMode === 'dark' ? 'light' : 'dark';
    sessionStorage.setItem(modeStorageKey, colorMode);
    applyColorMode(colorMode);
    applyTheme(activeName);
  }

  $effect(() => {
    const stored = sessionStorage.getItem(storageKey);
    const candidate = AESTHETIC_REGIONS.find((region: AestheticRegion) => region.name === stored);
    if (candidate) activeName = candidate.name;
    const storedMode = sessionStorage.getItem(modeStorageKey);
    if (storedMode === 'light' || storedMode === 'dark') colorMode = storedMode;
    applyTheme(activeName);
    applyColorMode(colorMode);
  });
</script>

<aside class="theme-switcher" aria-label="Aesthetic region theme switcher">
  <label>
    <span>Theme</span>
    <select value={activeName} onchange={selectRegion} aria-label="Switch active aesthetic region">
      {#each AESTHETIC_REGIONS as region}
        <option value={region.name}>{region.label}</option>
      {/each}
    </select>
  </label>
  <button type="button" class="mode-toggle" onclick={toggleColorMode} aria-pressed={colorMode === 'dark'} aria-label={`Switch color mode. Current mode is ${modeLabel}`}>
    {modeLabel}
  </button>
  <p aria-live="polite">{activeRegion.label}</p>
</aside>

<style>
  .theme-switcher {
    display: flex;
    align-items: center;
    gap: var(--space-8, 8px);
    min-width: min(100%, 18rem);
    padding: var(--space-5, 5px) var(--space-8, 8px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-8, 8px);
    background: var(--surface);
    color: var(--ink);
    box-shadow: var(--shadow-1, 0 1px 3px rgb(0 0 0 / 0.08));
  }

  label {
    display: grid;
    gap: var(--space-3, 3px);
    color: var(--muted);
    font-size: var(--type-small, 0.78rem);
    font-weight: 900;
    text-transform: uppercase;
  }

  select {
    width: 100%;
    min-width: 10.5rem;
    min-height: var(--space-34, 34px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-5, 5px);
    background: var(--paper);
    color: var(--ink);
    font: inherit;
    font-size: 0.9rem;
    text-transform: none;
  }

  .mode-toggle {
    min-height: var(--space-34, 34px);
    padding: var(--space-8, 8px) var(--space-13, 13px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-5, 5px);
    background: var(--ink);
    color: var(--paper);
    cursor: pointer;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 900;
  }

  p {
    margin: 0;
    color: var(--ink);
    font-size: var(--type-small, 0.78rem);
    font-weight: 900;
  }

  @media (max-width: 68rem) {
    .theme-switcher {
      min-width: 0;
    }

    p {
      display: none;
    }
  }

  @media (max-width: 47.5rem) {
    .theme-switcher {
      flex: 1 1 11rem;
      order: 2;
    }

    label {
      width: 100%;
    }

    select {
      min-width: 0;
    }

    .mode-toggle {
      flex: 0 0 auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .theme-switcher {
      transition: none;
    }
  }
</style>
