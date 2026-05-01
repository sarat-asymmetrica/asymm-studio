<script lang="ts">
  import { onMount } from 'svelte';
  import { GazeCalibration, PRIVACY_FOOTER } from '../calibration/index.js';
  import { Quaternion } from '../math/index.js';
  import { LiveSignalPipeline, MockSignalPipeline, type SignalPipelineReading } from '../signals/index.js';
  import type { Landmark } from '../signals/index.js';

  const calibration = new GazeCalibration();
  const paragraphs = [
    'Bio-resonance starts with a geometric wager: a living signal is not a scalar, but an orientation moving through a curved state space.',
    'A webcam pulse estimate, a blink rhythm, a breath-like optical-flow pattern, and a face stability score become a small field of constraints.',
    'Quaternions are useful here because they interpolate rotations without the awkward snapping that ordinary linear blends create.',
    'The interface can then react to attention as a continuous vector: focus moves, paragraphs bloom, and scrolling becomes a quiet spatial gesture.',
    'The important boundary is privacy. The camera is only a local sensor, and the application keeps derived interaction state inside the browser tab.'
  ] as const;

  let videoElement: HTMLVideoElement | undefined = $state();
  let readerElement: HTMLElement | undefined = $state();
  let stream: MediaStream | null = $state(null);
  let pipeline: LiveSignalPipeline | MockSignalPipeline | null = null;
  let pipelineMode: 'live' | 'mock' = $state('mock');
  let cursorX = $state(0.5);
  let cursorY = $state(0.5);
  let cursorQ = Quaternion.identity();
  let activeParagraph = $state(0);
  let detectorLabel = $state('Simulated demo');
  let running = $state(false);
  let cameraError = $state('');
  let statusMessage = $state('Start the demo to map gaze into the reader.');
  let animationFrame = 0;
  let processingFrame = false;

  async function start(): Promise<void> {
    cameraError = '';
    statusMessage = 'Starting gaze cursor.';
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
      pipeline = new LiveSignalPipeline({ faceMesh: { mode: 'auto' }, maxFps: 24 });
      pipelineMode = 'live';
      detectorLabel = 'Using your camera';
      running = true;
      statusMessage = 'Local gaze tracking is active.';
      animationFrame = requestAnimationFrame(update);
    } catch (error: unknown) {
      cameraError = 'Camera access is needed for live gaze. Running scripted gaze simulation instead.';
      pipeline = new MockSignalPipeline({ bpm: 72, coherenceRampSeconds: 10 });
      pipelineMode = 'mock';
      detectorLabel = 'Simulated demo';
      running = true;
      statusMessage = 'Scripted gaze path is active.';
      animationFrame = requestAnimationFrame(update);
    }
  }

  function update(now: number): void {
    void processFrame(now);
    if (running) animationFrame = requestAnimationFrame(update);
  }

  async function processFrame(now: number): Promise<void> {
    if (!pipeline || processingFrame) return;
    processingFrame = true;
    try {
      const reading = pipeline instanceof LiveSignalPipeline ? await pipeline.processFrame(videoElement ?? null, now) : await pipeline.processFrame(now);
      applyReading(reading, now);
    } catch (error: unknown) {
      cameraError = 'Gaze tracking paused for a moment. Restart the demo when ready.';
    } finally {
      processingFrame = false;
    }
  }

  function applyReading(reading: SignalPipelineReading, now: number): void {
    const target = reading.face?.landmarks ? estimateGaze(reading.face.landmarks) : scriptedGaze(now);
    const targetQ = pointToQuaternion(target.x, target.y);
    cursorQ = cursorQ.slerp(targetQ, 0.18);
    const point = quaternionToPoint(cursorQ);
    cursorX = point.x;
    cursorY = point.y;
    activeParagraph = Math.min(paragraphs.length - 1, Math.max(0, Math.floor(cursorY * paragraphs.length)));
    detectorLabel = reading.mode === 'live' ? 'Using your camera' : 'Simulated demo';
    if (readerElement && running) {
      if (cursorY < 0.16) readerElement.scrollBy({ top: -4, behavior: 'smooth' });
      if (cursorY > 0.84) readerElement.scrollBy({ top: 4, behavior: 'smooth' });
    }
  }

  function estimateGaze(landmarks: readonly Landmark[]): { readonly x: number; readonly y: number } {
    const left = landmarks[33] ?? landmarks[0];
    const right = landmarks[263] ?? landmarks[1] ?? left;
    if (!left || !right) return scriptedGaze(performance.now());
    return calibration.mapToScreen((left.x + right.x) / 2, (left.y + right.y) / 2);
  }

  function scriptedGaze(now: number): { readonly x: number; readonly y: number } {
    const rawX = 0.5 + Math.cos(now / 1900) * 0.34;
    const rawY = 0.5 + Math.sin(now / 2400) * 0.42;
    return calibration.mapToScreen(rawX, rawY);
  }

  function pointToQuaternion(x: number, y: number): Quaternion {
    return new Quaternion(0.72, x - 0.5, y - 0.5, 0.24).normalize();
  }

  function quaternionToPoint(quaternion: Quaternion): { readonly x: number; readonly y: number } {
    return {
      x: Math.max(0, Math.min(1, quaternion.x / 0.7 + 0.5)),
      y: Math.max(0, Math.min(1, quaternion.y / 0.7 + 0.5))
    };
  }

  function stop(): void {
    running = false;
    if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (pipeline instanceof LiveSignalPipeline) pipeline.close();
    pipeline = null;
    processingFrame = false;
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
  <div class="preview-shell">
    <video bind:this={videoElement} muted playsinline aria-label="Local camera preview for gaze cursor"></video>
    <span class:live={pipelineMode === 'live'} class="mode-pill">{detectorLabel}</span>
  </div>
  <article bind:this={readerElement} class="reader">
    <span class="cursor" style={`left: ${cursorX * 100}%; top: ${cursorY * 100}%`} aria-hidden="true"></span>
    <p class="eyebrow">Gaze Cursor</p>
    <h2 id="gaze-title">Read with attention as the pointer follows your gaze.</h2>
    <p class="status" aria-live="polite">{statusMessage}</p>
    {#each paragraphs as paragraph, index}
      <p class:active={index === activeParagraph}>{paragraph}</p>
    {/each}
    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}
    <div class="actions">
      <button type="button" on:click={start} aria-label="Start gaze cursor demo" disabled={running}>Start</button>
      <button type="button" on:click={stop} aria-label="Stop gaze cursor demo" disabled={!running}>Stop</button>
    </div>
  </article>
  <footer>{PRIVACY_FOOTER} {detectorLabel}.</footer>
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

  .preview-shell {
    position: relative;
    overflow: hidden;
    min-height: 300px;
    border-radius: 8px;
    background: #24312f;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: transparent;
  }

  .mode-pill {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 7px 10px;
    border: 1px solid rgba(255, 253, 248, 0.48);
    border-radius: 999px;
    background: rgba(20, 32, 30, 0.76);
    color: #fffdf8;
    font-size: 0.78rem;
    font-weight: 800;
  }

  .mode-pill.live {
    background: #006b5f;
  }

  .reader {
    position: relative;
    max-height: 430px;
    overflow: auto;
    padding: 28px;
    border-radius: 8px;
    background: #fffdf8;
    scroll-behavior: smooth;
  }

  .cursor {
    position: absolute;
    width: 18px;
    height: 18px;
    border: 3px solid #b04734;
    border-radius: 999px;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 8px rgba(176, 71, 52, 0.12);
    transition: left 120ms linear, top 120ms linear;
    z-index: 2;
    pointer-events: none;
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
    padding: 8px 10px;
    border-radius: 8px;
    line-height: 1.65;
    transition: background 180ms ease, color 180ms ease, transform 180ms ease;
  }

  p.active {
    background: #e0efe9;
    color: #0f332e;
    transform: translateX(4px);
  }

  .status {
    color: #49645f;
    font-weight: 700;
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

  .gaze-demo {
    gap: var(--space-21, 21px);
    padding: var(--space-21, 21px);
    padding-bottom: var(--space-55, 55px);
    border: var(--space-1, 1px) solid var(--line, #d8d4ca);
    border-radius: var(--radius-8, 8px);
    background: var(--surface-soft, #f7fbfa);
    color: var(--ink, #171514);
    font-family: var(--font-sans, "Asymm Sans", system-ui, sans-serif);
  }

  .preview-shell,
  .reader,
  p {
    border-radius: var(--radius-8, 8px);
  }

  .preview-shell {
    background:
      linear-gradient(90deg, transparent, rgb(255 255 255 / 0.1), transparent),
      #24312f;
    background-size: 233% 100%;
    animation: skeleton-sheen 1600ms ease-in-out infinite;
  }

  .reader {
    background: var(--surface, #ffffff);
  }

  .eyebrow,
  .status,
  footer {
    color: var(--muted, #5f665f);
  }

  p.active {
    background: color-mix(in srgb, var(--green, #006b5f) 14%, var(--surface, #ffffff));
    color: var(--ink, #171514);
  }

  button {
    padding: var(--space-8, 8px) var(--space-13, 13px);
    border-radius: var(--radius-5, 5px);
  }

  .error {
    color: var(--red, #b83f31);
  }

  @keyframes skeleton-sheen {
    0% { background-position: 144% 0; }
    100% { background-position: -144% 0; }
  }

  @media (max-width: 720px) {
    .gaze-demo { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .cursor { transition: none; }
    .preview-shell { animation: none; }
    .reader { scroll-behavior: auto; }
    p { transition: none; }
    p.active { transform: none; }
  }
</style>
