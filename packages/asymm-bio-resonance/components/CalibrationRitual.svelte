<script lang="ts">
  import { onMount } from 'svelte';
  import { GazeCalibration, PRIVACY_FOOTER, RitualSequencer, type RitualState } from '../calibration/index.js';

  interface CameraStream {
    readonly stream: MediaStream;
    stop(): void;
  }

  const sequencer = new RitualSequencer();
  const gaze = new GazeCalibration();

  let videoElement: HTMLVideoElement | undefined = $state();
  let camera: CameraStream | null = $state(null);
  let ritualState: RitualState = $state(sequencer.getState(0));
  let running = $state(false);
  let complete = $state(false);
  let cameraError = $state('');
  let animationFrame = 0;

  async function requestCamera(): Promise<CameraStream> {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access is unavailable in this browser.');
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
    return {
      stream,
      stop: (): void => {
        for (const track of stream.getTracks()) track.stop();
      }
    };
  }

  async function beginRitual(): Promise<void> {
    cameraError = '';
    try {
      camera = await requestCamera();
      if (videoElement) {
        videoElement.srcObject = camera.stream;
        await videoElement.play();
      }
      ritualState = sequencer.start(performance.now());
      running = true;
      complete = false;
      animationFrame = requestAnimationFrame(tick);
    } catch (error: unknown) {
      cameraError = error instanceof Error ? error.message : 'Camera access could not be started.';
      running = false;
    }
  }

  function tick(now: number): void {
    ritualState = sequencer.update(now);
    if (ritualState.step.target) {
      const target = ritualState.step.target;
      gaze.addSample({ point: target.x < 0.5 && target.y < 0.5 ? 'upper-left' : target.x > 0.5 && target.y < 0.5 ? 'upper-right' : target.x > 0.5 ? 'lower-right' : 'lower-left', x: target.x, y: target.y, timestamp: now });
    }
    complete = ritualState.complete;
    if (!complete) animationFrame = requestAnimationFrame(tick);
  }

  function stopRitual(): void {
    running = false;
    if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    camera?.stop();
    camera = null;
  }

  onMount(() => {
    return (): void => {
      stopRitual();
    };
  });
</script>

<section class="calibration-ritual" aria-labelledby="calibration-title">
  <video bind:this={videoElement} class="camera-preview" muted playsinline aria-label="Local camera preview"></video>

  <div class="ritual-panel">
    <p class="eyebrow">Calibration</p>
    <h2 id="calibration-title">{complete ? 'Ready' : ritualState.step.instruction}</h2>
    <div class="progress" role="progressbar" aria-label="Calibration progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round((ritualState.stepIndex + ritualState.progress) / 8 * 100)}>
      <span style={`width: ${Math.min(100, ((ritualState.stepIndex + ritualState.progress) / 8) * 100)}%`}></span>
    </div>

    {#if ritualState.step.target}
      <div class="target-field" aria-hidden="true">
        <span class="gaze-dot" style={`left: ${ritualState.step.target.x * 100}%; top: ${ritualState.step.target.y * 100}%`}></span>
      </div>
    {:else}
      <div class="gesture-card" aria-live="polite">{ritualState.step.instruction}</div>
    {/if}

    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}

    <div class="actions">
      <button type="button" on:click={beginRitual} aria-label="Start calibration ritual" disabled={running}>Start</button>
      <button type="button" on:click={stopRitual} aria-label="Stop calibration ritual" disabled={!running}>Stop</button>
    </div>
  </div>

  <footer class="privacy-footer">{PRIVACY_FOOTER}</footer>
</section>

<style>
  .calibration-ritual {
    position: relative;
    display: grid;
    grid-template-columns: minmax(220px, 0.85fr) minmax(260px, 1fr);
    gap: 24px;
    padding: 24px;
    min-height: 420px;
    border: 1px solid #d8d2c5;
    border-radius: 8px;
    background: #f8f5ee;
    color: #181613;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  .camera-preview,
  .ritual-panel {
    min-height: 320px;
    border-radius: 8px;
  }

  .camera-preview {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: linear-gradient(135deg, #24211d, #585044);
  }

  .ritual-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
  }

  .eyebrow {
    margin: 0;
    color: #756a59;
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.6rem, 3vw, 2.6rem);
    line-height: 1.05;
  }

  .progress {
    height: 8px;
    overflow: hidden;
    border-radius: 8px;
    background: #ded7ca;
  }

  .progress span {
    display: block;
    height: 100%;
    background: #006b5f;
    transition: width 240ms ease;
  }

  .target-field {
    position: relative;
    min-height: 150px;
    border: 1px solid #d8d2c5;
    border-radius: 8px;
    background: #fffdf8;
  }

  .gaze-dot {
    position: absolute;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: #b83f31;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 10px rgba(184, 63, 49, 0.14);
    animation: breathe 1600ms ease-in-out infinite;
  }

  .gesture-card {
    display: grid;
    min-height: 150px;
    place-items: center;
    border: 1px solid #d8d2c5;
    border-radius: 8px;
    background: #fffdf8;
    font-size: 1.15rem;
    font-weight: 700;
  }

  .actions {
    display: flex;
    gap: 10px;
  }

  button {
    min-width: 96px;
    padding: 11px 16px;
    border: 1px solid #181613;
    border-radius: 6px;
    background: #181613;
    color: #fffdf8;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    border-color: #aaa195;
    background: #d8d2c5;
    color: #62594b;
    cursor: not-allowed;
  }

  .error {
    margin: 0;
    color: #8f2218;
    font-weight: 700;
  }

  .privacy-footer {
    position: absolute;
    right: 24px;
    bottom: 16px;
    left: 24px;
    color: #514a3f;
    font-size: 0.82rem;
  }

  @keyframes breathe {
    50% { transform: translate(-50%, -50%) scale(1.16); }
  }

  @media (max-width: 720px) {
    .calibration-ritual {
      grid-template-columns: 1fr;
      padding-bottom: 56px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gaze-dot { animation: none; }
    .progress span { transition: none; }
  }
</style>
