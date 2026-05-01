<script lang="ts">
  import { onMount } from 'svelte';
  import { GazeCalibration, PRIVACY_FOOTER } from '../calibration/index.js';

  const calibration = new GazeCalibration();
  let videoElement: HTMLVideoElement | undefined = $state();
  let stream: MediaStream | null = $state(null);
  let cursorX = $state(0.5);
  let cursorY = $state(0.5);
  let running = $state(false);
  let cameraError = $state('');
  let animationFrame = 0;

  async function start(): Promise<void> {
    cameraError = '';
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser.');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoElement) {
        videoElement.srcObject = stream;
        await videoElement.play();
      }
      calibration.addSample({ point: 'upper-left', x: 0.15, y: 0.15, timestamp: performance.now() });
      calibration.addSample({ point: 'upper-right', x: 0.85, y: 0.15, timestamp: performance.now() });
      calibration.addSample({ point: 'lower-right', x: 0.85, y: 0.85, timestamp: performance.now() });
      calibration.addSample({ point: 'lower-left', x: 0.15, y: 0.85, timestamp: performance.now() });
      running = true;
      animationFrame = requestAnimationFrame(update);
    } catch (error: unknown) {
      cameraError = error instanceof Error ? error.message : 'Camera access could not be started.';
    }
  }

  function update(now: number): void {
    const rawX = 0.5 + Math.cos(now / 1900) * 0.34;
    const rawY = 0.5 + Math.sin(now / 2400) * 0.28;
    const mapped = calibration.mapToScreen(rawX, rawY);
    cursorX = mapped.x;
    cursorY = mapped.y;
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

<section class="gaze-demo" aria-labelledby="gaze-title">
  <video bind:this={videoElement} muted playsinline aria-label="Local camera preview for gaze cursor"></video>
  <article class="reader">
    <span class="cursor" style={`left: ${cursorX * 100}%; top: ${cursorY * 100}%`} aria-hidden="true"></span>
    <p class="eyebrow">Gaze Cursor</p>
    <h2 id="gaze-title">Read with attention as the pointer follows your gaze.</h2>
    <p>The cursor is a local interaction signal. It can steer hover states, reading focus, or spatial navigation without sending camera frames anywhere.</p>
    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}
    <div class="actions">
      <button type="button" on:click={start} aria-label="Start gaze cursor demo" disabled={running}>Start</button>
      <button type="button" on:click={stop} aria-label="Stop gaze cursor demo" disabled={!running}>Stop</button>
    </div>
  </article>
  <footer>{PRIVACY_FOOTER}</footer>
</section>

<style>
  .gaze-demo {
    position: relative;
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 22px;
    padding: 24px;
    padding-bottom: 58px;
    border: 1px solid #ccd6dc;
    border-radius: 8px;
    background: #eef5f2;
    color: #14201e;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  video {
    width: 100%;
    min-height: 300px;
    object-fit: cover;
    border-radius: 8px;
    background: #24312f;
  }

  .reader {
    position: relative;
    overflow: hidden;
    padding: 28px;
    border-radius: 8px;
    background: #fffdf8;
  }

  .cursor {
    position: absolute;
    width: 18px;
    height: 18px;
    border: 3px solid #b04734;
    border-radius: 999px;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 8px rgba(176, 71, 52, 0.12);
    transition: left 100ms linear, top 100ms linear;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: #49645f;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  h2 {
    max-width: 12ch;
    margin: 0 0 18px;
    font-size: clamp(2rem, 4vw, 3.2rem);
    line-height: 1;
  }

  p {
    max-width: 56ch;
    line-height: 1.65;
  }

  .actions {
    display: flex;
    gap: 10px;
    margin-top: 18px;
  }

  button {
    padding: 11px 16px;
    border: 1px solid #14201e;
    border-radius: 6px;
    background: #14201e;
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
    color: #49645f;
    font-size: 0.82rem;
  }

  @media (max-width: 720px) {
    .gaze-demo { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cursor { transition: none; }
  }
</style>
