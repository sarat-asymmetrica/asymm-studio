<script lang="ts">
  import { onMount } from 'svelte';
  import { CoherenceGate, PresenceHashGenerator, type PublicIdentity } from '../identity/index.js';
  import { PRIVACY_FOOTER } from '../calibration/index.js';

  let videoElement: HTMLVideoElement | undefined = $state();
  let stream: MediaStream | null = $state(null);
  let coherence = $state(0);
  let stableTime = $state(0);
  let identity: PublicIdentity | null = $state(null);
  let cameraError = $state('');
  let running = $state(false);
  let animationFrame = 0;
  let lastTime = 0;

  const gate = new CoherenceGate(0.62, 1.8);

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
      lastTime = performance.now();
      animationFrame = requestAnimationFrame(update);
    } catch (error: unknown) {
      cameraError = 'Camera access is needed to run this live identity demo.';
    }
  }

  async function update(now: number): Promise<void> {
    const dt = Math.max(0, (now - lastTime) / 1000);
    lastTime = now;
    coherence = Math.min(0.99, coherence + 0.012 + Math.sin(now / 1200) * 0.004);
    stableTime = coherence > 0.62 ? stableTime + dt : 0;
    const presenceVector = [coherence, stableTime / 2, Math.sin(now / 1000) * 0.5 + 0.5, 0.73];
    PresenceHashGenerator.generate(presenceVector);
    const gateState = await gate.update({ coherence, stableTime }, presenceVector);
    identity = gateState.identity;
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

<section class="presence-auth" aria-labelledby="presence-title">
  <video bind:this={videoElement} muted playsinline aria-label="Local camera preview for presence authentication"></video>
  <div class="auth-surface">
    <p class="eyebrow">Presence</p>
    <h2 id="presence-title">{identity ? 'Unlocked' : 'Hold Steady'}</h2>
    <div class="ring" style={`--coherence: ${coherence}`} role="progressbar" aria-label="Coherence" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(coherence * 100)}>
      <span>{Math.round(coherence * 100)}%</span>
    </div>
    {#if identity}
      <p class="identity" aria-label="Public identity">{identity.identityString}</p>
    {:else}
      <p class="hint">One calm breath is enough.</p>
    {/if}
    {#if cameraError}
      <p class="error" role="alert">{cameraError}</p>
    {/if}
    <div class="actions">
      <button type="button" on:click={start} aria-label="Start presence authentication" disabled={running}>Start</button>
      <button type="button" on:click={stop} aria-label="Stop presence authentication" disabled={!running}>Stop</button>
    </div>
  </div>
  <footer>{PRIVACY_FOOTER}</footer>
</section>

<style>
  .presence-auth {
    position: relative;
    display: grid;
    grid-template-columns: minmax(220px, 0.9fr) minmax(280px, 1fr);
    gap: 22px;
    padding: 24px;
    padding-bottom: 58px;
    border-radius: 8px;
    background: #111418;
    color: #f4f0e7;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  video {
    width: 100%;
    min-height: 320px;
    object-fit: cover;
    border-radius: 8px;
    background: #272b31;
  }

  .auth-surface {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
  }

  .eyebrow {
    margin: 0;
    color: #9fc7c1;
    font-size: 0.78rem;
    font-weight: 800;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-size: clamp(2rem, 4vw, 3.4rem);
    line-height: 1;
  }

  .ring {
    display: grid;
    width: 132px;
    height: 132px;
    place-items: center;
    border: 10px solid color-mix(in srgb, #50b8a8 calc(var(--coherence, 0) * 100%), #30363d);
    border-radius: 999px;
    background: #171b20;
  }

  .ring span {
    font-size: 1.5rem;
    font-weight: 800;
  }

  .hint,
  .identity,
  .error {
    margin: 0;
  }

  .identity {
    max-width: 34ch;
    overflow-wrap: anywhere;
    color: #9fc7c1;
    font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
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
    border: 1px solid #f4f0e7;
    border-radius: 6px;
    background: #f4f0e7;
    color: #111418;
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

  .presence-auth {
    gap: var(--space-21, 21px);
    padding: var(--space-21, 21px);
    padding-bottom: var(--space-55, 55px);
    border-radius: var(--radius-8, 8px);
    font-family: var(--font-sans, "Asymm Sans", system-ui, sans-serif);
  }

  video {
    border-radius: var(--radius-8, 8px);
    background:
      linear-gradient(90deg, transparent, rgb(255 255 255 / 0.1), transparent),
      #272b31;
    background-size: 233% 100%;
    animation: skeleton-sheen 1600ms ease-in-out infinite;
  }

  .auth-surface {
    gap: var(--space-13, 13px);
  }

  .ring {
    width: 8.9rem;
    height: 8.9rem;
    border-width: var(--space-8, 8px);
    border-radius: var(--radius-pill, 55rem);
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

  @media (max-width: 720px) {
    .presence-auth { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { scroll-behavior: auto; }
    video { animation: none; }
  }
</style>
