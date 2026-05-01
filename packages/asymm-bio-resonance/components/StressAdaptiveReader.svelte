<script lang="ts">
  import { onMount } from 'svelte';
  import { PRIVACY_FOOTER } from '../calibration/index.js';

  let videoElement: HTMLVideoElement | undefined = $state();
  let stream: MediaStream | null = $state(null);
  let running = $state(false);
  let cameraError = $state('');
  let stress = $state(0.28);
  let animationFrame = 0;

  const lineHeight = $derived(1.45 + stress * 0.45);
  const measure = $derived(74 - stress * 18);
  const fontSize = $derived(18 + stress * 2);

  async function start(): Promise<void> {
    cameraError = '';
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser.');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoElement) {
        videoElement.srcObject = stream;
        await videoElement.play();
      }
      running = true;
      animationFrame = requestAnimationFrame(update);
    } catch (error: unknown) {
      cameraError = error instanceof Error ? error.message : 'Camera access could not be started.';
    }
  }

  function update(now: number): void {
    stress = Math.min(0.92, Math.max(0.08, 0.42 + Math.sin(now / 2300) * 0.24));
    if (running) animationFrame = requestAnimationFrame(update);
  }

  function stop(): void {
    running = false;
    if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    for (const track of stream?.getTracks() ?? []) track.stop();
    stream = null;
  }

  onMount(() => {
    return (): void => {
      stop();
    };
  });
</script>

<section class="adaptive-reader" aria-labelledby="reader-title">
  <video bind:this={videoElement} muted playsinline aria-label="Local camera preview for stress-adaptive reader"></video>
  <article style={`--line-height: ${lineHeight}; --measure: ${measure}ch; --font-size: ${fontSize}px`}>
    <p class="eyebrow">Adaptive Reader</p>
    <h2 id="reader-title">The page slows down when the body asks for room.</h2>
    <p>When coherence drops, the reader opens line height, shortens measure, and softens motion. The text remains the same; the presentation becomes easier to inhabit.</p>
    <div class="meter" role="meter" aria-label="Estimated stress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(stress * 100)}>
      <span style={`width: ${stress * 100}%`}></span>
    </div>
    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}
    <div class="actions">
      <button type="button" on:click={start} aria-label="Start stress adaptive reader" disabled={running}>Start</button>
      <button type="button" on:click={stop} aria-label="Stop stress adaptive reader" disabled={!running}>Stop</button>
    </div>
  </article>
  <footer>{PRIVACY_FOOTER}</footer>
</section>

<style>
  .adaptive-reader {
    position: relative;
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 22px;
    padding: 24px;
    padding-bottom: 58px;
    border: 1px solid #d5d1c7;
    border-radius: 8px;
    background: #f6f1e8;
    color: #1f1b17;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  video {
    width: 100%;
    min-height: 320px;
    object-fit: cover;
    border-radius: 8px;
    background: #312d28;
  }

  article {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: #6d5f4c;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  h2 {
    max-width: 13ch;
    margin: 0 0 20px;
    font-size: clamp(2rem, 4vw, 3.1rem);
    line-height: 1.02;
  }

  p {
    max-width: var(--measure);
    font-size: var(--font-size);
    line-height: var(--line-height);
    transition: max-width 260ms ease, font-size 260ms ease, line-height 260ms ease;
  }

  .meter {
    width: min(360px, 100%);
    height: 9px;
    overflow: hidden;
    border-radius: 9px;
    background: #d7d0c2;
  }

  .meter span {
    display: block;
    height: 100%;
    background: #a84c3d;
    transition: width 180ms ease;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }

  button {
    padding: 11px 16px;
    border: 1px solid #1f1b17;
    border-radius: 6px;
    background: #1f1b17;
    color: #fffdf8;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .error {
    color: #8f2218;
    font-weight: 700;
  }

  footer {
    position: absolute;
    right: 24px;
    bottom: 18px;
    left: 24px;
    color: #6d5f4c;
    font-size: 0.82rem;
  }

  @media (max-width: 720px) {
    .adaptive-reader { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    p,
    .meter span {
      transition: none;
    }
  }
</style>
