<script lang="ts">
  import {
    AESTHETIC_REGIONS,
    SeedToQuaternion,
    deriveAll,
    type AestheticRegion,
    type DesignTokens,
    type Quaternion
  } from '../../../../packages/asymm-aesthetic-engine/index.js';

  const previewNames = [
    'ShojiModal',
    'KintsugiAlert',
    'AgingButton',
    'InkBrushInput',
    'TextBloom',
    'HoloCard',
    'GravityGrid',
    'VitruvianLoader',
    'StoneSwitch',
    'ChronosDial'
  ] as const;

  let seed = $state(618033);

  const quaternion: Quaternion = $derived(SeedToQuaternion(seed));
  const tokens: DesignTokens = $derived(deriveAll(quaternion));
  const activeRegion: AestheticRegion = $derived(detectRegion(quaternion));
  const cssVariables: readonly [string, string][] = $derived([
    ['--asymm-bg', tokens.color.background],
    ['--asymm-surface', tokens.color.surface],
    ['--asymm-text', tokens.color.text],
    ['--asymm-muted', tokens.color.mutedText],
    ['--asymm-primary', tokens.color.primary],
    ['--asymm-secondary', tokens.color.secondary],
    ['--asymm-accent', tokens.color.accent],
    ['--asymm-radius', tokens.geometry.radius.medium],
    ['--asymm-space', tokens.geometry.spacing.md],
    ['--asymm-duration', tokens.motion.duration]
  ]);
  const explorerStyle: string = $derived(cssVariables.map(([name, value]: readonly [string, string]) => `${name}:${value}`).join(';'));

  function inBounds(value: number, bounds: readonly [number, number]): boolean {
    return value >= bounds[0] && value <= bounds[1];
  }

  function detectRegion(value: Quaternion): AestheticRegion {
    const direct = AESTHETIC_REGIONS.find((region: AestheticRegion) =>
      inBounds(value.w, region.bounds.w) &&
      inBounds(value.x, region.bounds.x) &&
      inBounds(value.y, region.bounds.y) &&
      inBounds(value.z, region.bounds.z)
    );
    if (direct) return direct;

    return AESTHETIC_REGIONS.reduce((best: AestheticRegion, candidate: AestheticRegion) => {
      const candidateDistance = distanceToCenter(value, candidate);
      const bestDistance = distanceToCenter(value, best);
      return candidateDistance < bestDistance ? candidate : best;
    }, AESTHETIC_REGIONS[0]);
  }

  function distanceToCenter(value: Quaternion, region: AestheticRegion): number {
    const centerW = (region.bounds.w[0] + region.bounds.w[1]) / 2;
    const centerX = (region.bounds.x[0] + region.bounds.x[1]) / 2;
    const centerY = (region.bounds.y[0] + region.bounds.y[1]) / 2;
    const centerZ = (region.bounds.z[0] + region.bounds.z[1]) / 2;
    return Math.hypot(value.w - centerW, value.x - centerX, value.y - centerY, value.z - centerZ);
  }

  function setSeedFromInput(event: Event): void {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;
    seed = Math.max(0, Math.min(999999, Number(input.value)));
  }

  function tokenSwatch(value: string): string {
    return value.startsWith('#')
      ? `background:${value}`
      : `background:linear-gradient(135deg, var(--asymm-primary), var(--asymm-accent))`;
  }
</script>

<section class="seed-explorer" style={explorerStyle} aria-labelledby="seed-explorer-title">
  <div class="seed-explorer__control">
    <p class="eyebrow">Live Seed Explorer</p>
    <h2 id="seed-explorer-title">Seed {seed}</h2>
    <label>
      <span>Seed value</span>
      <input type="range" min="0" max="999999" value={seed} oninput={setSeedFromInput} aria-label="Seed value slider" />
    </label>
    <label>
      <span>Exact seed</span>
      <input type="number" min="0" max="999999" value={seed} oninput={setSeedFromInput} aria-label="Exact seed number" />
    </label>
    <div class="seed-explorer__region" aria-live="polite">
      <strong>{activeRegion.label}</strong>
      <span>{activeRegion.mood.join(' / ')}</span>
    </div>
  </div>

  <div class="seed-explorer__tokens" aria-label="Derived token values">
    <div class="seed-explorer__swatches" aria-label="Derived color swatches">
      {#each tokens.color.scale as swatch}
        <span style={`background:${swatch}`} title={swatch}></span>
      {/each}
    </div>
    <dl>
      {#each cssVariables as [name, value]}
        <div>
          <span class="token-swatch" style={tokenSwatch(value)} aria-hidden="true"></span>
          <dt>{name}</dt>
          <dd>{value}</dd>
        </div>
      {/each}
    </dl>
  </div>

  <div class="seed-explorer__previews" aria-label="Live primitive previews">
    {#each previewNames as name}
      <article class={`seed-preview seed-preview--${name.toLowerCase()}`}>
        <p>{name}</p>
        {#if name === 'AgingButton'}
          <button type="button" aria-label="AgingButton preview">Action</button>
        {:else if name === 'InkBrushInput'}
          <label><span>Input</span><input aria-label="InkBrushInput preview" placeholder="Signal" /></label>
        {:else if name === 'StoneSwitch'}
          <label class="switch"><input type="checkbox" aria-label="StoneSwitch preview" checked /><span></span></label>
        {:else if name === 'VitruvianLoader'}
          <div class="loader" role="img" aria-label="VitruvianLoader preview"></div>
        {:else if name === 'ChronosDial'}
          <div class="dial" role="img" aria-label="ChronosDial preview"><span>62%</span></div>
        {:else}
          <div class="surface">Seed-derived surface</div>
        {/if}
      </article>
    {/each}
  </div>
</section>

<style>
  .seed-explorer {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr);
    gap: 21px;
    max-width: 100%;
    overflow: hidden;
    padding: 1px;
    background-color: var(--asymm-bg);
    color: var(--asymm-text);
  }

  .seed-explorer__control,
  .seed-explorer__tokens,
  .seed-preview {
    min-width: 0;
    border: 1px solid color-mix(in srgb, var(--asymm-primary), transparent 62%);
    border-radius: var(--asymm-radius);
    background: var(--asymm-surface);
  }

  .seed-explorer__control,
  .seed-explorer__tokens {
    padding: var(--asymm-space);
  }

  .seed-explorer__control {
    display: flex;
    flex-direction: column;
    gap: 13px;
  }

  .eyebrow {
    margin: 0;
    color: var(--asymm-text);
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    border-radius: var(--asymm-radius);
    background-color: var(--asymm-surface);
    color: var(--asymm-text);
    font-size: clamp(2rem, 5vw, 4rem);
    line-height: 0.95;
  }

  label {
    display: grid;
    gap: 8px;
    font-weight: 800;
  }

  input {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    min-height: 42px;
    accent-color: var(--asymm-accent);
  }

  input[type="range"] {
    display: block;
  }

  input[type="number"] {
    padding: 9px 11px;
    border: 1px solid color-mix(in srgb, var(--asymm-primary), transparent 58%);
    border-radius: 8px;
    background: var(--asymm-bg);
    color: var(--asymm-text);
    font: inherit;
  }

  .seed-explorer__region {
    display: grid;
    gap: 4px;
    padding: 13px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--asymm-accent), transparent 86%);
  }

  .seed-explorer__region span,
  dd {
    color: var(--asymm-muted);
  }

  .seed-explorer__tokens {
    display: grid;
    gap: 16px;
  }

  .seed-explorer__swatches {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 5px;
    min-width: 0;
  }

  .seed-explorer__swatches span {
    min-height: 34px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--asymm-text), transparent 84%);
  }

  dl {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 8px;
    margin: 0;
  }

  dl div {
    display: grid;
    gap: 4px;
    padding: 10px;
    border-radius: 8px;
    background: var(--asymm-bg);
  }

  .token-swatch {
    width: 28px;
    height: 28px;
    border: 1px solid color-mix(in srgb, var(--asymm-text), transparent 70%);
    border-radius: 999px;
  }

  dt {
    font-weight: 900;
  }

  dd {
    margin: 4px 0 0;
    overflow-wrap: anywhere;
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    font-size: 0.86rem;
  }

  .seed-explorer__previews {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(144px, 1fr));
    gap: 13px;
  }

  .seed-preview {
    min-height: 160px;
    padding: 16px;
    overflow: hidden;
    transition: transform var(--asymm-duration) ease;
  }

  .seed-preview:hover {
    transform: translateY(-3px);
  }

  .seed-preview p {
    margin: 0 0 13px;
    color: var(--asymm-text);
    font-weight: 900;
  }

  .surface,
  button,
  .loader,
  .dial {
    display: grid;
    min-height: 82px;
    place-items: center;
    border-radius: var(--asymm-radius);
    border: 1px solid color-mix(in srgb, var(--asymm-text), transparent 70%);
    background: var(--asymm-surface);
    color: var(--asymm-text);
    font-weight: 900;
  }

  button {
    width: 100%;
    border: 0;
    cursor: pointer;
  }

  .switch {
    display: inline-flex;
    align-items: center;
    width: 76px;
    height: 42px;
    padding: 5px;
    border-radius: 999px;
    background: var(--asymm-primary);
  }

  .switch input {
    position: absolute;
    width: 1px;
    min-width: 0;
    height: 1px;
    opacity: 0;
  }

  .switch span {
    width: 32px;
    height: 32px;
    margin-left: auto;
    border-radius: 999px;
    background: var(--asymm-bg);
  }

  .loader {
    width: 82px;
    min-height: 82px;
    border-radius: 999px;
    animation: seed-spin var(--asymm-duration) linear infinite;
  }

  .dial {
    width: 96px;
    min-height: 96px;
    border-radius: 999px;
    background:
      radial-gradient(circle at center, var(--asymm-surface) 55%, transparent 56%),
      conic-gradient(var(--asymm-text) 62%, color-mix(in srgb, var(--asymm-text), transparent 82%) 0);
  }

  @keyframes seed-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 760px) {
    .seed-explorer {
      grid-template-columns: 1fr;
    }

    .seed-explorer__swatches {
      grid-template-columns: repeat(6, 1fr);
    }

    dl {
      grid-template-columns: 1fr;
    }

    dl div {
      grid-template-columns: auto minmax(0, 0.9fr) minmax(0, 1.1fr);
      align-items: center;
    }

    dt,
    dd {
      overflow-wrap: anywhere;
    }

    dd {
      margin: 0;
      text-align: right;
    }
  }

  @media (max-width: 420px) {
    dl div {
      grid-template-columns: auto 1fr;
    }

    dd {
      grid-column: 2;
      text-align: left;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .seed-preview,
    .loader {
      animation: none;
      transition: none;
    }

    .seed-preview:hover {
      transform: none;
    }
  }
</style>
