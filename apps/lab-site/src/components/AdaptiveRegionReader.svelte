<script lang="ts">
  import { onMount } from 'svelte';
  import StressAdaptiveReader from '../../../../packages/asymm-bio-resonance/components/StressAdaptiveReader.svelte';
  import type { AestheticRegionName } from '../../../../packages/asymm-aesthetic-engine/index.js';

  interface RegionState {
    readonly name: AestheticRegionName;
    readonly label: string;
    readonly paper: string;
    readonly surface: string;
    readonly ink: string;
    readonly muted: string;
    readonly line: string;
    readonly accent: string;
  }

  const calming: RegionState = {
    name: 'wabi-sabi',
    label: 'Wabi-Sabi',
    paper: '#f8f3e7',
    surface: '#fffdf8',
    ink: '#221b16',
    muted: '#5e5143',
    line: '#d8cfc0',
    accent: '#7a4312'
  };

  const balanced: RegionState = {
    name: 'research-paper',
    label: 'Research Paper',
    paper: '#fbfbf7',
    surface: '#ffffff',
    ink: '#1d1d1d',
    muted: '#4c5662',
    line: '#d9d9d2',
    accent: '#43546d'
  };

  const open: RegionState = {
    name: 'ananta-warm',
    label: 'Ananta Warm',
    paper: '#fff1d8',
    surface: '#fff9ee',
    ink: '#10201b',
    muted: '#526052',
    line: '#e5c894',
    accent: '#7b4d05'
  };

  let hrv = $state(0.72);
  let frame = 0;
  const region: RegionState = $derived(hrv < 0.42 ? calming : hrv > 0.68 ? open : balanced);
  const stageStyle: string = $derived([
    `--paper:${region.paper}`,
    `--surface:${region.surface}`,
    `--surface-soft:${region.paper}`,
    `--ink:${region.ink}`,
    `--muted:${region.muted}`,
    `--line:${region.line}`,
    `--green:${region.accent}`
  ].join(';'));

  function tick(now: number): void {
    hrv = Math.max(0.08, Math.min(0.94, 0.5 + Math.sin((now / 15000) * Math.PI * 2) * 0.38));
    frame = requestAnimationFrame(tick);
  }

  onMount(() => {
    frame = requestAnimationFrame(tick);
    return (): void => {
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  });
</script>

<section class="adaptive-region" style={stageStyle} aria-labelledby="adaptive-region-title">
  <div class="adaptive-region__header">
    <div>
      <p class="eyebrow">Stress -> Region</p>
      <h2 id="adaptive-region-title">HRV shifts density and aesthetic region together.</h2>
      <p>When stress rises, the wrapper moves toward Wabi-Sabi. When calm rises, it opens toward Ananta Warm. The reader remains the same component.</p>
    </div>
    <div class="state-card" aria-live="polite">
      <span>Simulated HRV</span>
      <strong>{Math.round(hrv * 100)}%</strong>
      <small>{region.label}</small>
    </div>
  </div>
  <StressAdaptiveReader />
</section>

<style>
  .adaptive-region {
    display: grid;
    gap: var(--space-21, 21px);
    color: var(--ink);
  }

  .adaptive-region__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: var(--space-21, 21px);
    align-items: end;
    padding: var(--space-21, 21px);
    border: var(--space-1, 1px) solid var(--line);
    border-radius: var(--radius-8, 8px);
    background: var(--surface);
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

  .state-card {
    display: grid;
    gap: var(--space-3, 3px);
    min-width: var(--space-233, 233px);
    padding: var(--space-13, 13px);
    border-radius: var(--radius-8, 8px);
    background: var(--paper);
  }

  .state-card span,
  .state-card small {
    color: var(--muted);
    font-weight: 800;
  }

  .state-card strong {
    font-size: var(--type-1, 1.618rem);
  }

  @media (max-width: 47.5rem) {
    .adaptive-region__header {
      grid-template-columns: 1fr;
      padding: var(--space-13, 13px);
    }

    .state-card {
      min-width: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .adaptive-region {
      transition: none;
    }
  }
</style>
