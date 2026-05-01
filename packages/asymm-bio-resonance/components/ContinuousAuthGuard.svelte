<script lang="ts">
  import { onMount } from 'svelte';
  import { PRIVACY_FOOTER } from '../calibration/index.js';
  import { LiveSignalPipeline, MockSignalPipeline, type SignalPipelineReading } from '../signals/index.js';

  let videoElement: HTMLVideoElement | undefined = $state();
  let stream: MediaStream | null = $state(null);
  let pipeline: LiveSignalPipeline | MockSignalPipeline | null = null;
  let pipelineMode: 'live' | 'mock' = $state('mock');
  let running = $state(false);
  let unlocked = $state(false);
  let cameraError = $state('');
  let coherence = $state(0);
  let stableTime = $state(0);
  let lostSeconds = $state(0);
  let detectorLabel = $state('Simulated demo');
  let statusMessage = $state('Start continuous auth to unlock the workspace.');
  let animationFrame = 0;
  let lastTime = 0;
  let processingFrame = false;

  const unlockThreshold = 0.62;
  const lockThreshold = 0.45;
  const graceSeconds = 5;
  const progress = $derived(Math.min(1, stableTime / 2));

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
    } catch (error: unknown) {
      cameraError = 'Camera access is needed for live presence. Running simulated presence instead.';
      pipeline = new MockSignalPipeline({ bpm: 72, coherenceRampSeconds: 8 });
      pipelineMode = 'mock';
      detectorLabel = 'Simulated demo';
    }
    running = true;
    lastTime = performance.now();
    animationFrame = requestAnimationFrame(update);
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
      cameraError = 'Presence tracking paused briefly. Restart when ready.';
    } finally {
      processingFrame = false;
    }
  }

  function applyReading(reading: SignalPipelineReading, now: number): void {
    const dt = Math.max(0, (now - lastTime) / 1000);
    lastTime = now;
    const simulatedCoherence = 0.5 + Math.sin((now / 12000) * Math.PI * 2) * 0.42;
    const facePresent = reading.mode === 'mock' ? simulatedCoherence > 0.18 : reading.signals.faceDetected;
    coherence = reading.mode === 'live' ? Math.max(0, Math.min(1, reading.signals.coherence?.coherence ?? 0)) : Math.max(0.03, Math.min(0.96, simulatedCoherence));
    stableTime = coherence >= unlockThreshold && facePresent ? stableTime + dt : Math.max(0, stableTime - dt * 1.5);
    lostSeconds = coherence < lockThreshold || !facePresent ? lostSeconds + dt : 0;
    if (!unlocked && stableTime >= 2) unlocked = true;
    if (unlocked && lostSeconds >= graceSeconds) unlocked = false;
    detectorLabel = reading.mode === 'live' ? 'Using your camera' : 'Simulated demo';
    statusMessage = unlocked ? 'Workspace unlocked while presence remains stable.' : 'Presence lost - look at screen to continue.';
  }

  function stop(): void {
    running = false;
    unlocked = false;
    stableTime = 0;
    lostSeconds = 0;
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

<section class="auth-guard" aria-labelledby="auth-guard-title">
  <div class="preview-shell">
    <video bind:this={videoElement} muted playsinline aria-label="Local camera preview for continuous authentication"></video>
    <span class:live={pipelineMode === 'live'} class="mode-pill">{detectorLabel}</span>
  </div>

  <div class="workspace-shell">
    <div class:locked={!unlocked} class="workspace">
      <slot>
        <p>Protected workspace content</p>
      </slot>
    </div>
    {#if !unlocked}
      <div class="lock-overlay" aria-live="polite">
        <h2 id="auth-guard-title">Presence lost - look at screen to continue</h2>
        <p>{statusMessage}</p>
      </div>
    {/if}
  </div>

  <aside class="guard-panel" aria-label="Continuous authentication status">
    <p class="eyebrow">Continuous Auth</p>
    <strong>{unlocked ? 'Unlocked' : 'Locked'}</strong>
    <div class="meter" role="meter" aria-label="Presence coherence" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(coherence * 100)}>
      <span style={`width: ${coherence * 100}%`}></span>
    </div>
    <p>{Math.round(progress * 100)}% unlock stability. Lost timer: {lostSeconds.toFixed(1)}s / {graceSeconds}s.</p>
    <p class="limitation">CSS blur hides the view for this demo, but content remains in the DOM.</p>
    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}
    <div class="actions">
      <button type="button" on:click={start} aria-label="Start continuous authentication" disabled={running}>Start</button>
      <button type="button" on:click={stop} aria-label="Stop continuous authentication" disabled={!running}>Stop</button>
    </div>
  </aside>

  <footer>{PRIVACY_FOOTER} {detectorLabel}.</footer>
</section>

<style>
  .auth-guard {
    position: relative;
    display: grid;
    grid-template-columns: 210px minmax(320px, 1fr) minmax(220px, 0.45fr);
    gap: 18px;
    padding: 22px;
    padding-bottom: 58px;
    border-radius: 8px;
    background: #101318;
    color: #f7f2e8;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .preview-shell {
    position: relative;
    overflow: hidden;
    min-height: 360px;
    border-radius: 8px;
    background: #252b33;
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
    border: 1px solid rgba(247, 242, 232, 0.45);
    border-radius: 999px;
    background: rgba(16, 19, 24, 0.76);
    color: #f7f2e8;
    font-size: 0.78rem;
    font-weight: 800;
  }

  .mode-pill.live {
    background: #006b5f;
  }

  .workspace-shell {
    position: relative;
    overflow: hidden;
    min-height: 360px;
    border-radius: 8px;
    background: #f8f5ee;
    color: #171514;
  }

  .workspace {
    height: 100%;
    transition: filter 1000ms cubic-bezier(0, 0, 0.2, 1), opacity 1000ms cubic-bezier(0, 0, 0.2, 1);
  }

  .workspace.locked {
    filter: blur(18px);
    opacity: 0.34;
    pointer-events: none;
    user-select: none;
  }

  .lock-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    padding: 28px;
    background: rgba(16, 19, 24, 0.56);
    color: #fffdf8;
    text-align: center;
  }

  .lock-overlay h2 {
    max-width: 14ch;
    margin: 0 auto 10px;
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 0.98;
  }

  .lock-overlay h2,
  .lock-overlay p {
    padding: 0.35em 0.5em;
    border-radius: var(--radius-8, 8px);
    background: #101318;
    color: #fffdf8;
  }

  .guard-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 12px;
  }

  .eyebrow {
    margin: 0;
    color: #9fc7c1;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .guard-panel strong {
    font-size: 2.4rem;
    line-height: 1;
  }

  .meter {
    height: 10px;
    overflow: hidden;
    border-radius: 999px;
    background: #303740;
  }

  .meter span {
    display: block;
    height: 100%;
    background: #50b8a8;
    transition: width 220ms ease;
  }

  .guard-panel p {
    margin: 0;
    color: #f7f2e8;
    line-height: 1.45;
  }

  .limitation {
    padding: 10px;
    border: 1px solid rgba(247, 242, 232, 0.28);
    border-radius: 8px;
    background: #101318;
    color: #fffdf8;
  }

  .error {
    color: #ffb0a5;
    font-weight: 700;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  button {
    padding: 11px 16px;
    border: 1px solid #f7f2e8;
    border-radius: 6px;
    background: #f7f2e8;
    color: #101318;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  footer {
    position: absolute;
    right: 24px;
    bottom: 18px;
    left: 24px;
    color: #c8c1b3;
    font-size: 0.82rem;
  }

  .auth-guard {
    gap: var(--space-21, 21px);
    padding: var(--space-21, 21px);
    padding-bottom: var(--space-55, 55px);
    border-radius: var(--radius-8, 8px);
    font-family: var(--font-sans, "Asymm Sans", system-ui, sans-serif);
  }

  .preview-shell,
  .workspace-shell,
  .limitation {
    border-radius: var(--radius-8, 8px);
  }

  .preview-shell {
    background:
      linear-gradient(90deg, transparent, rgb(255 255 255 / 0.1), transparent),
      #252b33;
    background-size: 233% 100%;
    animation: skeleton-sheen 1600ms ease-in-out infinite;
  }

  .guard-panel {
    gap: var(--space-13, 13px);
  }

  .actions {
    gap: var(--space-8, 8px);
  }

  button {
    padding: var(--space-8, 8px) var(--space-13, 13px);
    border-radius: var(--radius-5, 5px);
  }

  @keyframes skeleton-sheen {
    0% { background-position: 144% 0; }
    100% { background-position: -144% 0; }
  }

  @media (max-width: 960px) {
    .auth-guard {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .workspace,
    .meter span {
      transition: none;
    }

    .preview-shell {
      animation: none;
    }
  }
</style>
