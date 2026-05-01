<script lang="ts">
  import {
    AESTHETIC_REGIONS,
    type AestheticRegion,
    type AestheticRegionName
  } from '../../../../packages/asymm-aesthetic-engine/index.js';

  interface RegionPalette {
    readonly background: string;
    readonly surface: string;
    readonly text: string;
    readonly muted: string;
    readonly accent: string;
  }

  const palettes: Record<AestheticRegionName, RegionPalette> = {
    'wabi-sabi': { background: '#f8f3e7', surface: '#fffdf8', text: '#221b16', muted: '#5e5143', accent: '#7a4312' },
    'neumorphic-soft': { background: '#e9f0ed', surface: '#f8fbfa', text: '#1c2926', muted: '#53665e', accent: '#496f62' },
    'brutal-raw': { background: '#f4f0e8', surface: '#ffffff', text: '#111111', muted: '#333333', accent: '#e43d25' },
    'glass-ethereal': { background: '#eaf7fb', surface: '#ffffffcc', text: '#15252d', muted: '#455e68', accent: '#236f93' },
    'modernist-strict': { background: '#ffffff', surface: '#f4f4f4', text: '#101010', muted: '#4d4d4d', accent: '#295f9a' },
    'indie-craft': { background: '#fff3df', surface: '#fffaf0', text: '#2b201b', muted: '#614737', accent: '#98411f' },
    'research-paper': { background: '#fbfbf7', surface: '#ffffff', text: '#1d1d1d', muted: '#4c5662', accent: '#43546d' },
    'ananta-warm': { background: '#fff1d8', surface: '#fff9ee', text: '#10201b', muted: '#526052', accent: '#7b4d05' }
  };

  let leftRegionName: AestheticRegionName = $state('wabi-sabi');
  let rightRegionName: AestheticRegionName = $state('brutal-raw');

  const leftRegion: AestheticRegion = $derived(getRegion(leftRegionName));
  const rightRegion: AestheticRegion = $derived(getRegion(rightRegionName));
  const leftStyle: string = $derived(styleFor(leftRegion));
  const rightStyle: string = $derived(styleFor(rightRegion));

  function getRegion(name: AestheticRegionName): AestheticRegion {
    return AESTHETIC_REGIONS.find((region: AestheticRegion) => region.name === name) ?? AESTHETIC_REGIONS[0];
  }

  function styleFor(region: AestheticRegion): string {
    const palette = palettes[region.name];
    return [
      `--region-bg:${palette.background}`,
      `--region-surface:${palette.surface}`,
      `--region-text:${palette.text}`,
      `--region-muted:${palette.muted}`,
      `--region-accent:${palette.accent}`,
      `--region-radius:${region.parameters.radius[1]}px`,
      `--region-space:${Math.round(16 * region.parameters.baseSpacingMultiplier)}px`,
      `--region-heading:${region.parameters.headingWeight}`,
      `--region-body:${region.parameters.bodyWeight}`,
      `--region-line:${region.parameters.lineHeight}`
    ].join(';');
  }

  function onLeftChange(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) leftRegionName = select.value as AestheticRegionName;
  }

  function onRightChange(event: Event): void {
    const select = event.currentTarget;
    if (select instanceof HTMLSelectElement) rightRegionName = select.value as AestheticRegionName;
  }
</script>

<section class="region-compare" aria-labelledby="region-compare-title">
  <div class="region-compare__header">
    <div>
      <p class="eyebrow">A/B Region Comparison</p>
      <h2 id="region-compare-title">Same content, different design DNA.</h2>
    </div>
    <div class="region-compare__controls">
      <label>
        <span>Left region</span>
        <select value={leftRegionName} on:change={onLeftChange} aria-label="Left region">
          {#each AESTHETIC_REGIONS as region}
            <option value={region.name}>{region.label}</option>
          {/each}
        </select>
      </label>
      <label>
        <span>Right region</span>
        <select value={rightRegionName} on:change={onRightChange} aria-label="Right region">
          {#each AESTHETIC_REGIONS as region}
            <option value={region.name}>{region.label}</option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  <div class="region-compare__panels">
    <article class="region-panel" style={leftStyle} aria-label={`${leftRegion.label} preview`}>
      <p class="region-panel__eyebrow">{leftRegion.label}</p>
      <h3>Presence as interface</h3>
      <p>The same calibration copy is rendered through another aesthetic region, proving the engine separates semantic content from presentation.</p>
      <button type="button" aria-label={`${leftRegion.label} sample action`}>Begin ritual</button>
      <div class="region-panel__card">
        <strong>Coherence</strong>
        <span>72% stable</span>
      </div>
      <div class="region-panel__alert" role="status">Camera frames stay in this browser tab.</div>
    </article>

    <article class="region-panel" style={rightStyle} aria-label={`${rightRegion.label} preview`}>
      <p class="region-panel__eyebrow">{rightRegion.label}</p>
      <h3>Presence as interface</h3>
      <p>The same calibration copy is rendered through another aesthetic region, proving the engine separates semantic content from presentation.</p>
      <button type="button" aria-label={`${rightRegion.label} sample action`}>Begin ritual</button>
      <div class="region-panel__card">
        <strong>Coherence</strong>
        <span>72% stable</span>
      </div>
      <div class="region-panel__alert" role="status">Camera frames stay in this browser tab.</div>
    </article>
  </div>
</section>

<style>
  .region-compare {
    display: grid;
    gap: 21px;
  }

  .region-compare__header {
    display: flex;
    justify-content: space-between;
    gap: 21px;
  }

  .eyebrow {
    margin: 0 0 8px;
    color: var(--green);
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    max-width: 13ch;
    margin: 0;
    font-size: clamp(2rem, 4vw, 3.2rem);
    line-height: 1;
  }

  .region-compare__controls {
    display: flex;
    flex-wrap: wrap;
    gap: 13px;
    align-items: end;
  }

  label {
    display: grid;
    gap: 8px;
    color: var(--muted);
    font-weight: 800;
  }

  select {
    min-width: 210px;
    min-height: 42px;
    padding: 9px 11px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
  }

  .region-compare__panels {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .region-panel {
    display: grid;
    gap: var(--region-space);
    min-height: 520px;
    padding: calc(var(--region-space) * 1.25);
    border: 1px solid var(--region-accent);
    border-radius: var(--region-radius);
    background: var(--region-bg);
    color: var(--region-text);
    font-weight: var(--region-body);
  }

  .region-panel__eyebrow {
    margin: 0;
    color: var(--region-accent);
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  .region-panel h3 {
    max-width: 9ch;
    margin: 0;
    color: var(--region-text);
    font-size: clamp(2rem, 5vw, 4.2rem);
    font-weight: var(--region-heading);
    line-height: 0.95;
  }

  .region-panel p {
    margin: 0;
    color: var(--region-muted);
    line-height: var(--region-line);
  }

  .region-panel button {
    width: fit-content;
    min-height: 44px;
    padding: 11px 16px;
    border: 1px solid var(--region-text);
    border-radius: var(--region-radius);
    background: var(--region-text);
    color: #ffffff;
    cursor: pointer;
    font: inherit;
    font-weight: 900;
  }

  .region-panel__card,
  .region-panel__alert {
    padding: var(--region-space);
    border-radius: var(--region-radius);
    background: var(--region-surface);
  }

  .region-panel__card {
    display: flex;
    justify-content: space-between;
    gap: 13px;
  }

  .region-panel__alert {
    border-left: 6px solid var(--region-accent);
    color: var(--region-text);
    font-weight: 800;
  }

  @media (max-width: 820px) {
    .region-compare__header,
    .region-compare__panels {
      grid-template-columns: 1fr;
      flex-direction: column;
    }

    .region-compare__panels {
      display: grid;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none;
    }
  }
</style>
