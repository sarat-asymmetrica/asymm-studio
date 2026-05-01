<script lang="ts">
  import {
    AESTHETIC_REGIONS,
    type AestheticRegion,
    type AestheticRegionName
  } from '../../../../packages/asymm-aesthetic-engine/index.js';
  import CalibrationRitual from '../../../../packages/asymm-bio-resonance/components/CalibrationRitual.svelte';

  interface RegionPalette {
    readonly paper: string;
    readonly surface: string;
    readonly ink: string;
    readonly muted: string;
    readonly line: string;
    readonly accent: string;
  }

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

  let activeName: AestheticRegionName = $state('wabi-sabi');
  const activeRegion: AestheticRegion = $derived(AESTHETIC_REGIONS.find((region: AestheticRegion) => region.name === activeName) ?? AESTHETIC_REGIONS[0]);
  const activePalette: RegionPalette = $derived(palettes[activeRegion.name]);
  const stageStyle: string = $derived([
    `--paper:${activePalette.paper}`,
    `--surface:${activePalette.surface}`,
    `--surface-soft:${activePalette.paper}`,
    `--ink:${activePalette.ink}`,
    `--muted:${activePalette.muted}`,
    `--line:${activePalette.line}`,
    `--green:${activePalette.accent}`,
    `--asymm-bg:${activePalette.paper}`,
    `--asymm-surface:${activePalette.surface}`,
    `--asymm-text:${activePalette.ink}`,
    `--asymm-muted:${activePalette.muted}`,
    `--asymm-accent:${activePalette.accent}`
  ].join(';'));

  function selectRegion(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) activeName = select.value as AestheticRegionName;
  }
</script>

<section class="aesthetic-auth" style={stageStyle} aria-labelledby="aesthetic-auth-title">
  <div class="aesthetic-auth__header">
    <div>
      <p class="eyebrow">Cross-engine</p>
      <h2 id="aesthetic-auth-title">{activeRegion.label} calibration</h2>
      <p>The calibration ritual is unchanged. Only lab-owned CSS variables from the selected aesthetic region shape its surface.</p>
    </div>
    <label>
      <span>Region</span>
      <select value={activeName} on:change={selectRegion} aria-label="Select calibration aesthetic region">
        {#each AESTHETIC_REGIONS as region}
          <option value={region.name}>{region.label}</option>
        {/each}
      </select>
    </label>
  </div>

  <div class="region-strip" aria-label="Available aesthetic regions">
    {#each AESTHETIC_REGIONS as region}
      {@const palette = palettes[region.name]}
      <button
        type="button"
        class:active={region.name === activeName}
        style={`--chip-bg:${palette.paper};--chip-ink:${palette.ink};--chip-accent:${palette.accent}`}
        on:click={() => { activeName = region.name; }}
        aria-label={`Use ${region.label} region`}
      >
        <span>{region.label}</span>
      </button>
    {/each}
  </div>

  <div class="ritual-stage">
    <CalibrationRitual />
  </div>
</section>

<style>
  .aesthetic-auth {
    display: grid;
    gap: var(--space-21, 21px);
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
    color: var(--ink);
  }

  .aesthetic-auth__header {
    display: flex;
    gap: var(--space-21, 21px);
    align-items: end;
    justify-content: space-between;
    padding: var(--space-21, 21px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-8, 8px);
    background: var(--surface);
    min-width: 0;
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
    font-size: clamp(var(--type-1, 1.618rem), 4vw, var(--type-3, 4.236rem));
    line-height: var(--line-title, 1.05);
  }

  p {
    margin: var(--space-8, 8px) 0 0;
    color: var(--muted);
  }

  label {
    display: grid;
    gap: var(--space-8, 8px);
    min-width: var(--space-233, 233px);
    color: var(--muted);
    font-weight: 900;
  }

  select {
    min-height: var(--space-34, 34px);
    padding: var(--space-8, 8px) var(--space-13, 13px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-5, 5px);
    background: var(--paper);
    color: var(--ink);
    font: inherit;
  }

  .region-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(144px, 1fr));
    gap: var(--space-8, 8px);
    min-width: 0;
  }

  .region-strip button {
    min-height: var(--space-55, 55px);
    padding: var(--space-8, 8px) var(--space-13, 13px);
    border: var(--space-2, 2px) solid var(--chip-accent);
    border-radius: var(--radius-8, 8px);
    background: var(--chip-bg);
    color: var(--chip-ink);
    font: inherit;
    font-weight: 900;
  }

  .region-strip button.active {
    box-shadow: inset 0 calc(-1 * var(--space-5, 5px)) 0 var(--chip-accent);
  }

  .ritual-stage {
    padding: var(--space-13, 13px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-8, 8px);
    background: var(--paper);
    min-width: 0;
    overflow: hidden;
  }

  @media (max-width: 47.5rem) {
    .aesthetic-auth__header {
      align-items: stretch;
      flex-direction: column;
      padding: var(--space-13, 13px);
    }

    label {
      min-width: 0;
    }

    .region-strip {
      grid-template-columns: 1fr;
    }
  }
</style>
