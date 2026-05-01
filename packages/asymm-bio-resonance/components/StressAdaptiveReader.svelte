<script lang="ts">
  import { onMount } from 'svelte';
  import { PRIVACY_FOOTER } from '../calibration/index.js';
  import { LiveSignalPipeline, MockSignalPipeline, type SignalPipelineReading } from '../signals/index.js';

  const PRANA_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const APANA_EASE = 'cubic-bezier(0, 0, 0.2, 1)';
  const graphPoints = 32;

  let videoElement: HTMLVideoElement | undefined = $state();
  let readerElement: HTMLElement | undefined = $state();
  let stream: MediaStream | null = $state(null);
  let pipeline: LiveSignalPipeline | MockSignalPipeline | null = null;
  let pipelineMode: 'live' | 'mock' = $state('mock');
  let running = $state(false);
  let cameraError = $state('');
  let stress = $state(0.28);
  let hrv = $state(0.72);
  let hrvHistory: number[] = $state(Array.from({ length: graphPoints }, () => 0.72));
  let detectorLabel = $state('Simulated demo');
  let annotation = $state('Calm pattern: denser layout and cooler tone.');
  let animationFrame = 0;
  let processingFrame = false;

  const lineHeight = $derived(1.42 + stress * 0.5);
  const measure = $derived(76 - stress * 20);
  const fontSize = $derived(18 + stress * 1.8);
  const scrollSpeed = $derived(1.7 - stress * 1.1);
  const warmth = $derived(Math.round(42 + stress * 24));
  const graphPolyline = $derived(hrvHistory.map((value: number, index: number) => `${(index / (graphPoints - 1)) * 100},${100 - value * 100}`).join(' '));

  async function start(): Promise<void> {
    cameraError = '';
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser.');
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoElement) {
        videoElement.srcObject = stream;
        await videoElement.play();
      }
      pipeline = new LiveSignalPipeline({ faceMesh: { mode: 'auto' }, maxFps: 18 });
      pipelineMode = 'live';
      detectorLabel = 'Using your camera';
      running = true;
      animationFrame = requestAnimationFrame(update);
    } catch (error: unknown) {
      cameraError = 'Camera access is needed for live HRV. Running simulated HRV instead.';
      pipeline = new MockSignalPipeline({ bpm: 72, coherenceRampSeconds: 10 });
      pipelineMode = 'mock';
      detectorLabel = 'Simulated demo';
      running = true;
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
      cameraError = 'The stress signal paused briefly. Simulated adaptation remains available.';
    } finally {
      processingFrame = false;
    }
  }

  function applyReading(reading: SignalPipelineReading, now: number): void {
    const simulatedHrv = 0.5 + Math.sin((now / 15000) * Math.PI * 2) * 0.38;
    hrv = reading.mode === 'live' ? Math.max(0.08, Math.min(0.94, reading.signals.coherence?.coherence ?? simulatedHrv)) : Math.max(0.08, Math.min(0.94, simulatedHrv));
    stress = 1 - hrv;
    hrvHistory = [...hrvHistory.slice(1), hrv];
    detectorLabel = reading.mode === 'live' ? 'Using your camera' : 'Simulated demo';
    annotation = hrv < 0.42 ? 'Stress rising: line height opens, warmth increases, margin motion pauses.' : hrv > 0.68 ? 'Calm rising: tighter measure, cooler tone, normal reading speed.' : 'Transition band: the reader is easing between states.';
    if (readerElement && running) readerElement.scrollBy({ top: scrollSpeed, behavior: 'smooth' });
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

<section class="adaptive-reader" aria-labelledby="reader-title">
  <div class="preview-shell">
    <video bind:this={videoElement} muted playsinline aria-label="Local camera preview for stress-adaptive reader"></video>
    <span class:live={pipelineMode === 'live'} class="mode-pill">{detectorLabel}</span>
  </div>
  <article bind:this={readerElement} class:stressed={stress > 0.58} style={`--line-height: ${lineHeight}; --measure: ${measure}ch; --font-size: ${fontSize}px; --warmth: ${warmth}; --reader-ease: ${stress > 0.5 ? APANA_EASE : PRANA_EASE}`}>
    <aside class="hrv-card" aria-label="Live HRV graph">
      <svg viewBox="0 0 100 100" role="img" aria-label={`HRV ${(hrv * 100).toFixed(0)} percent`}>
        <polyline points={graphPolyline}></polyline>
      </svg>
      <strong>{Math.round(hrv * 100)}%</strong>
      <span>{annotation}</span>
    </aside>
    <p class="eyebrow">Adaptive Reader</p>
    <h2 id="reader-title">The page slows down when the body asks for room.</h2>
    <p>When coherence drops, the reader opens line height, shortens measure, warms the page, and slows the automatic drift. The text remains the same; the presentation becomes easier to inhabit.</p>
    <p>When the signal steadies, the layout cools down and tightens back into a denser reading rhythm. The goal is not to diagnose stress, but to let the interface become less demanding when the body is sending noisier signals.</p>
    <p>The adaptation is intentionally visible in simulated mode: the HRV trace rises and falls every fifteen seconds so the reader can be inspected without granting camera permission.</p>
    <div class="meter" role="meter" aria-label="Estimated stress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(stress * 100)}>
      <span style={`width: ${stress * 100}%`}></span>
    </div>
    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}
    <div class="actions">
      <button type="button" onclick={start} aria-label="Start stress adaptive reader" disabled={running}>Start</button>
      <button type="button" onclick={stop} aria-label="Stop stress adaptive reader" disabled={!running}>Stop</button>
    </div>
  </article>
  <footer>{PRIVACY_FOOTER} {detectorLabel}.</footer>
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

  .preview-shell {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    min-height: 320px;
    border-radius: 8px;
    background: #312d28;
  }

  .preview-shell::before,
  .preview-shell::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .preview-shell::before {
    z-index: 0;
    background:
      radial-gradient(circle at 48% 46%, rgb(255 253 248 / 0.14), transparent 0 18%, transparent 34%),
      radial-gradient(circle at 28% 70%, rgb(0 107 95 / 0.2), transparent 0 5%, transparent 9%),
      radial-gradient(circle at 76% 34%, rgb(168 76 61 / 0.18), transparent 0 4%, transparent 8%);
    animation: signal-breathe 2600ms ease-in-out infinite;
  }

  .preview-shell::after {
    z-index: 0;
    background:
      radial-gradient(circle at 20% 28%, rgb(255 253 248 / 0.28), transparent 0 2px, transparent 5px),
      radial-gradient(circle at 58% 66%, rgb(255 253 248 / 0.22), transparent 0 2px, transparent 5px),
      radial-gradient(circle at 82% 42%, rgb(255 253 248 / 0.2), transparent 0 2px, transparent 5px);
    animation: signal-drift 5200ms ease-in-out infinite;
  }

  video {
    position: relative;
    z-index: 1;
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
    background: rgba(31, 27, 23, 0.76);
    color: #fffdf8;
    font-size: 0.78rem;
    font-weight: 800;
    z-index: 2;
  }

  .mode-pill.live {
    background: #006b5f;
  }

  article {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 480px;
    overflow: auto;
    padding: 24px;
    border-radius: 8px;
    background: hsl(var(--warmth), 48%, 96%);
    scroll-behavior: smooth;
    transition: background 420ms var(--reader-ease);
  }

  article::before {
    content: "";
    position: absolute;
    inset: 16px auto 16px 12px;
    width: 3px;
    border-radius: 999px;
    background: #c8a35e;
    animation: margin-breathe 2400ms var(--reader-ease) infinite;
  }

  article.stressed::before {
    animation-play-state: paused;
  }

  .adaptive-reader .eyebrow {
    margin: 0 0 10px;
    width: fit-content;
    padding: 2px 0;
    background-color: #fff7ec;
    color: #2f261b;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  h2 {
    max-width: 13ch;
    margin: 0 0 20px;
    color: #1f1b17;
    font-size: clamp(2rem, 4vw, 3.1rem);
    line-height: 1.02;
  }

  p {
    max-width: var(--measure);
    color: #3f3529;
    font-size: var(--font-size);
    line-height: var(--line-height);
    transition: max-width 360ms var(--reader-ease), font-size 360ms var(--reader-ease), line-height 360ms var(--reader-ease);
  }

  .hrv-card {
    position: absolute;
    top: 18px;
    right: 18px;
    display: grid;
    grid-template-columns: 58px minmax(88px, 150px);
    gap: 8px 10px;
    align-items: center;
    max-width: min(240px, 46%);
    padding: 10px;
    border: 1px solid #d5d1c7;
    border-radius: 8px;
    background: rgba(255, 253, 248, 0.9);
    color: #1f1b17;
  }

  .hrv-card svg {
    grid-row: span 2;
    width: 58px;
    height: 44px;
  }

  .hrv-card polyline {
    fill: none;
    stroke: #006b5f;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 4;
  }

  .hrv-card strong {
    font-size: 1.05rem;
  }

  .hrv-card span {
    font-size: 0.72rem;
    line-height: 1.25;
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
    transition: width 180ms var(--reader-ease);
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

  .adaptive-reader {
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
  article,
  .hrv-card {
    border-radius: var(--radius-8, 8px);
  }

  .preview-shell {
    background:
      linear-gradient(90deg, transparent, rgb(255 255 255 / 0.1), transparent),
      #312d28;
    background-size: 233% 100%;
    animation: skeleton-sheen 1600ms ease-in-out infinite;
  }

  .eyebrow,
  footer {
    color: var(--muted, #5f665f);
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

  @keyframes signal-breathe {
    50% { transform: scale(1.08); opacity: 0.68; }
  }

  @keyframes signal-drift {
    50% { transform: translate3d(8px, -10px, 0); opacity: 0.72; }
  }

  @keyframes margin-breathe {
    50% { transform: translateX(8px); opacity: 0.52; }
  }

  @media (max-width: 720px) {
    .adaptive-reader { grid-template-columns: 1fr; }
    .hrv-card {
      position: static;
      max-width: none;
      margin-bottom: 14px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    article {
      scroll-behavior: auto;
      transition: none;
    }

    article::before {
      animation: none;
    }

    .preview-shell {
      animation: none;
    }

    .preview-shell::before,
    .preview-shell::after {
      animation: none;
    }

    p,
    .meter span {
      transition: none;
    }
  }
</style>
