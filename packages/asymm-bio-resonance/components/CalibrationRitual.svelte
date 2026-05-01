<script lang="ts">
  import { onMount } from 'svelte';
  import { estimateAnatomy, GazeCalibration, PresenceBaselineCollector, PRIVACY_FOOTER, RitualSequencer, type AnatomicalMeasurements, type GazePointName, type HandPose, type RitualState } from '../calibration/index.js';
  import { PresenceHashGenerator } from '../identity/index.js';
  import { LiveSignalPipeline, MockSignalPipeline, type SignalPipelineReading } from '../signals/index.js';
  import type { Landmark } from '../signals/index.js';

  interface CameraStream {
    readonly stream: MediaStream;
    stop(): void;
  }

  type PipelineMode = 'live' | 'mock';

  const sequencer = new RitualSequencer();
  const gaze = new GazeCalibration();
  const baseline = new PresenceBaselineCollector();

  let videoElement: HTMLVideoElement | undefined = $state();
  let camera: CameraStream | null = $state(null);
  let pipeline: LiveSignalPipeline | MockSignalPipeline | null = null;
  let pipelineMode: PipelineMode = $state('mock');
  let ritualState: RitualState = $state(sequencer.getState(0));
  let running = $state(false);
  let complete = $state(false);
  let cameraError = $state('');
  let statusMessage = $state('Ready for a browser-local calibration.');
  let gazeDot = $state({ x: 0.5, y: 0.5 });
  let handPose: HandPose = $state('unknown');
  let anatomy: AnatomicalMeasurements | null = $state(null);
  let restingHeartRate: number | null = $state(null);
  let presenceHash = $state('');
  let detectorLabel = $state('Simulated demo');
  let animationFrame = 0;
  let processingFrame = false;

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
    statusMessage = 'Starting local calibration.';
    presenceHash = '';
    complete = false;
    try {
      camera = await requestCamera();
      if (videoElement) {
        videoElement.srcObject = camera.stream;
        await videoElement.play();
      }
      pipeline = new LiveSignalPipeline({ faceMesh: { mode: 'auto' }, maxFps: 24 });
      pipelineMode = 'live';
      detectorLabel = 'Using your camera';
    } catch (error: unknown) {
      cameraError = 'Camera access is needed for live calibration. Running simulated calibration instead.';
      camera?.stop();
      camera = null;
      pipeline = new MockSignalPipeline({ bpm: 72, coherenceRampSeconds: 10 });
      pipelineMode = 'mock';
      detectorLabel = 'Simulated demo';
    }

    try {
      ritualState = sequencer.start(performance.now());
      running = true;
      statusMessage = pipelineMode === 'live' ? 'Camera frames are being processed locally.' : 'Simulated face and PPG signals are active.';
      animationFrame = requestAnimationFrame(tick);
    } catch (error: unknown) {
      cameraError = 'Calibration could not be started. Please try again.';
      running = false;
    }
  }

  function tick(now: number): void {
    void processFrame(now);
    ritualState = sequencer.update(now);
    complete = ritualState.complete;
    if (complete) finalizePresence();
    if (!complete) animationFrame = requestAnimationFrame(tick);
  }

  async function processFrame(now: number): Promise<void> {
    if (!pipeline || processingFrame) return;
    processingFrame = true;
    try {
      const reading = pipeline instanceof LiveSignalPipeline ? await pipeline.processFrame(videoElement ?? null, now) : await pipeline.processFrame(now);
      applyReading(reading, now);
    } catch (error: unknown) {
      cameraError = 'The signal briefly dropped. The ritual is still safe to restart.';
    } finally {
      processingFrame = false;
    }
  }

  function applyReading(reading: SignalPipelineReading, now: number): void {
    const landmarks = reading.face?.landmarks ?? null;
    if (landmarks && landmarks.length > 0) {
      const eyePoint = estimateGazePoint(landmarks);
      gazeDot = eyePoint;
      anatomy = estimateAnatomy(landmarks, videoElement?.videoWidth || 640);
      if (ritualState.step.target) gaze.addSample({ point: targetName(ritualState.step.target.x, ritualState.step.target.y), x: eyePoint.x, y: eyePoint.y, timestamp: now });
    } else if (ritualState.step.target) {
      gazeDot = ritualState.step.target;
    }

    if (reading.signals.ppg) baseline.addPPG(reading.signals.ppg);
    if (reading.face?.blink.blinkRate !== undefined) baseline.addBlinkRate(reading.face.blink.blinkRate);
    restingHeartRate = baseline.getBaseline().restingHeartRate ?? reading.signals.ppg?.bpm ?? null;
    handPose = expectedHandPose(ritualState.step.id);
    statusMessage = reading.message ?? statusMessage;
    detectorLabel = reading.mode === 'live' ? 'Using your camera' : 'Simulated demo';
    updatePresenceHash(reading.signals.coherence?.coherence ?? 0);
  }

  function estimateGazePoint(landmarks: readonly Landmark[]): { readonly x: number; readonly y: number } {
    const left = landmarks[33] ?? landmarks[0];
    const right = landmarks[263] ?? landmarks[1] ?? left;
    if (!left || !right) return gazeDot;
    return gaze.mapToScreen((left.x + right.x) / 2, (left.y + right.y) / 2);
  }

  function targetName(x: number, y: number): GazePointName {
    if (x < 0.5 && y < 0.5) return 'upper-left';
    if (x > 0.5 && y < 0.5) return 'upper-right';
    return x > 0.5 ? 'lower-right' : 'lower-left';
  }

  function expectedHandPose(stepId: RitualState['step']['id']): HandPose {
    if (stepId === 'open-palm' || stepId === 'fist' || stepId === 'point') return stepId;
    return 'unknown';
  }

  function updatePresenceHash(coherence: number): void {
    const vector = [restingHeartRate ?? 0, anatomy?.interpupillaryDistancePx ?? 0, gaze.getResult().horizontalSpan, gaze.getResult().verticalSpan, coherence];
    try {
      presenceHash = Array.from(PresenceHashGenerator.generate(vector)).slice(0, 12).map((byte: number) => byte.toString(16).padStart(2, '0')).join('');
    } catch (_error: unknown) {
      presenceHash = '';
    }
  }

  function finalizePresence(): void {
    updatePresenceHash(1);
    statusMessage = 'Calibration complete. Presence hash is ready.';
  }

  function stopRitual(): void {
    running = false;
    if (animationFrame !== 0) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    pipeline?.close?.();
    pipeline = null;
    camera?.stop();
    camera = null;
    processingFrame = false;
  }

  onMount(() => {
    return (): void => {
      stopRitual();
    };
  });
</script>

<section class="calibration-ritual" aria-labelledby="calibration-title">
  <div class="preview-shell">
    <video bind:this={videoElement} class="camera-preview" muted playsinline aria-label="Local camera preview"></video>
    <span class:live={pipelineMode === 'live'} class="mode-pill">{detectorLabel}</span>
  </div>

  <div class="ritual-panel">
    <p class="eyebrow">Calibration</p>
    <h2 id="calibration-title">{complete ? 'Ready' : ritualState.step.instruction}</h2>
    <p class="status" aria-live="polite">{statusMessage}</p>
    <div class="progress" role="progressbar" aria-label="Calibration progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round((ritualState.stepIndex + ritualState.progress) / 8 * 100)}>
      <span style={`width: ${Math.min(100, ((ritualState.stepIndex + ritualState.progress) / 8) * 100)}%`}></span>
    </div>

    {#if ritualState.step.target}
      <div class="target-field" aria-hidden="true">
        <span class="gaze-dot" style={`left: ${ritualState.step.target.x * 100}%; top: ${ritualState.step.target.y * 100}%`}></span>
        <span class="tracked-dot" style={`left: ${gazeDot.x * 100}%; top: ${gazeDot.y * 100}%`}></span>
      </div>
    {:else}
      <div class="gesture-card" aria-live="polite">
        <span>{ritualState.step.instruction}</span>
        <strong>{handPose === 'unknown' ? 'Preparing recognition' : `${handPose} recognized`}</strong>
      </div>
    {/if}

    <dl class="measurements" aria-label="Calibration measurements">
      <div><dt>IPD</dt><dd>{anatomy ? `${anatomy.interpupillaryDistancePx.toFixed(1)} px / ${anatomy.estimatedInterpupillaryDistanceMm} mm est.` : 'collecting'}</dd></div>
      <div><dt>Gaze span</dt><dd>{`${(gaze.getResult().horizontalSpan * 100).toFixed(0)}% × ${(gaze.getResult().verticalSpan * 100).toFixed(0)}%`}</dd></div>
      <div><dt>Resting HR</dt><dd>{restingHeartRate ? `${Math.round(restingHeartRate)} BPM` : 'collecting'}</dd></div>
      <div><dt>Presence hash</dt><dd>{presenceHash || 'collecting'}</dd></div>
    </dl>

    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}

    <div class="actions">
      <button type="button" onclick={beginRitual} aria-label="Start calibration ritual" disabled={running}>Start</button>
      <button type="button" onclick={stopRitual} aria-label="Stop calibration ritual" disabled={!running}>Stop</button>
    </div>
  </div>

  <footer class="privacy-footer">{PRIVACY_FOOTER} {detectorLabel}.</footer>
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

  .preview-shell,
  .ritual-panel {
    min-height: 320px;
    border-radius: 8px;
  }

  .preview-shell {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    background: linear-gradient(135deg, #24211d, #585044);
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
      radial-gradient(circle at 45% 48%, rgb(255 253 248 / 0.18), transparent 0 18%, transparent 34%),
      radial-gradient(circle at 22% 68%, rgb(0 107 95 / 0.24), transparent 0 5%, transparent 9%),
      radial-gradient(circle at 72% 32%, rgb(184 63 49 / 0.18), transparent 0 4%, transparent 8%);
    animation: signal-breathe 2600ms ease-in-out infinite;
  }

  .preview-shell::after {
    z-index: 0;
    background:
      radial-gradient(circle at 18% 22%, rgb(255 253 248 / 0.32), transparent 0 2px, transparent 5px),
      radial-gradient(circle at 62% 64%, rgb(255 253 248 / 0.24), transparent 0 2px, transparent 5px),
      radial-gradient(circle at 82% 40%, rgb(255 253 248 / 0.2), transparent 0 2px, transparent 5px);
    animation: signal-drift 5200ms ease-in-out infinite;
  }

  .camera-preview {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: transparent;
  }

  .mode-pill {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 7px 10px;
    border: 1px solid rgba(255, 253, 248, 0.48);
    border-radius: 999px;
    background: rgba(24, 22, 19, 0.74);
    color: #fffdf8;
    font-size: 0.78rem;
    font-weight: 800;
    z-index: 2;
  }

  .mode-pill.live {
    background: #006b5f;
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

  .status {
    margin: 0;
    color: #514a3f;
    font-weight: 650;
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

  .tracked-dot {
    position: absolute;
    width: 14px;
    height: 14px;
    border: 2px solid #006b5f;
    border-radius: 999px;
    background: #fffdf8;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 8px rgba(0, 107, 95, 0.12);
    transition: left 180ms ease, top 180ms ease;
  }

  .gesture-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 150px;
    align-items: center;
    justify-content: center;
    border: 1px solid #d8d2c5;
    border-radius: 8px;
    background: #fffdf8;
    font-size: 1.15rem;
    font-weight: 700;
  }

  .gesture-card strong {
    color: #006b5f;
    font-size: 0.9rem;
    text-transform: capitalize;
  }

  .measurements {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin: 0;
  }

  .measurements div {
    padding: 10px;
    border: 1px solid #d8d2c5;
    border-radius: 8px;
    background: #fffdf8;
  }

  .measurements dt {
    color: #756a59;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  .measurements dd {
    margin: 3px 0 0;
    overflow-wrap: anywhere;
    font-size: 0.92rem;
    font-weight: 750;
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

  .calibration-ritual {
    gap: var(--space-21, 21px);
    padding: var(--space-21, 21px);
    padding-bottom: var(--space-55, 55px);
    border: var(--space-1, 1px) solid var(--line, #d8d4ca);
    background: var(--surface-soft, #f7fbfa);
    color: var(--ink, #171514);
    font-family: var(--font-sans, "Asymm Sans", system-ui, sans-serif);
  }

  .preview-shell,
  .target-field,
  .gesture-card,
  .measurements div {
    border-radius: var(--radius-8, 8px);
  }

  .preview-shell {
    background:
      linear-gradient(90deg, transparent, rgb(255 255 255 / 0.12), transparent),
      linear-gradient(135deg, #24211d, #585044);
    background-size: 233% 100%, 100% 100%;
    animation: skeleton-sheen 1600ms ease-in-out infinite;
  }

  .ritual-panel,
  .gesture-card,
  .target-field,
  .measurements div {
    background-color: var(--surface, #ffffff);
  }

  .ritual-panel {
    padding: var(--space-21, 21px);
  }

  .eyebrow,
  .status,
  .measurements dt,
  .privacy-footer {
    color: var(--muted, #5f665f);
  }

  .progress,
  .target-field,
  .gesture-card,
  .measurements div {
    border: var(--space-1, 1px) solid var(--line, #d8d4ca);
  }

  .progress span,
  .tracked-dot,
  .gesture-card strong,
  .mode-pill.live {
    color: var(--green, #006b5f);
  }

  .progress span,
  .mode-pill.live {
    background: var(--green, #006b5f);
  }

  button {
    padding: var(--space-8, 8px) var(--space-13, 13px);
    border-radius: var(--radius-5, 5px);
  }

  .error {
    color: var(--red, #b83f31);
  }

  @keyframes skeleton-sheen {
    0% { background-position: 144% 0, 0 0; }
    100% { background-position: -144% 0, 0 0; }
  }

  @keyframes signal-breathe {
    50% { transform: scale(1.08); opacity: 0.68; }
  }

  @keyframes signal-drift {
    50% { transform: translate3d(8px, -10px, 0); opacity: 0.72; }
  }

  @media (max-width: 720px) {
    .calibration-ritual {
      grid-template-columns: 1fr;
      padding-bottom: 56px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gaze-dot { animation: none; }
    .preview-shell { animation: none; }
    .preview-shell::before,
    .preview-shell::after { animation: none; }
    .tracked-dot { transition: none; }
    .progress span { transition: none; }
  }
</style>
