<script>
    /**
     * BIO-RESONANCE AUTHENTICATION COMPONENT
     * ======================================
     * 
     * The flagship feature: Mathematical identity through presence.
     * 
     * Features:
     *   - Webcam-based biological signal extraction
     *   - Biomimetic vision (eagle, owl, frog, shrimp, viper, dragonfly)
     *   - PDE tissue evolution (Φ-organism)
     *   - Quaternion field visualization
     *   - Coherence-based unlock
     *   - Sovereign Ed25519 identity
     *   - Capability token issuance
     * 
     * @author Asymmetrica Research Laboratory
     */

    import { logger } from '$lib/utils/logger';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { fade, scale, fly } from 'svelte/transition';
    import { cubicOut, elasticOut } from 'svelte/easing';
    import { UVMEngine } from '../engine/uvm-engine.js';

    // Props
    export let width = 640;
    export let height = 480;
    export let coherenceThreshold = 0.65;
    export let unlockTime = 3.0;
    export let showDebug = false;
    export let particleCount = 2000;

    // Event dispatcher
    const dispatch = createEventDispatcher();

    // Engine instance
    let engine = null;
    let videoElement;
    let canvasElement;
    let particleCanvas;
    let particleCtx;

    // State
    let isInitialized = false;
    let isRunning = false;
    let error = null;

    // UI State (reactive)
    let coherence = 0;
    let heartRate = 0;
    let unlockProgress = 0;
    let isUnlocked = false;
    let identity = null;
    let status = 'initializing';
    let fps = 0;

    // Regime state
    let regimes = { r1: 0.30, r2: 0.20, r3: 0.50 };
    let singularityRisk = 'OK';

    // Particle system
    let particles = [];
    let animationId = null;

    // Initialize particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random(),
                y: Math.random(),
                vx: 0,
                vy: 0,
                size: 2 + Math.random() * 3,
                hue: Math.random() * 360,
                alpha: 0.3 + Math.random() * 0.7,
                life: 1
            });
        }
    }

    // Update particles based on quaternion field
    function updateParticles(frameData) {
        if (!particleCtx || !engine) return;

        const { signals } = frameData;
        const coherenceFactor = signals?.coherence?.coherence || 0;

        for (const p of particles) {
            // Get quaternion at particle position (with null check)
            const q = engine.getQuaternionAt(p.x, p.y);
            const grad = engine.getGradientAt(p.x, p.y);

            // Only use quaternion if valid
            if (q && typeof q.x === 'number' && isFinite(q.x)) {
                p.vx += q.x * 0.01;
                p.vy += q.y * 0.01;
            }
            
            if (grad && typeof grad.x === 'number' && isFinite(grad.x)) {
                p.vx += grad.x * 0.1;
                p.vy += grad.y * 0.1;
            }

            // Coherence affects particle behavior
            if (coherenceFactor > 0.5) {
                // Spiral toward center
                const cx = 0.5, cy = 0.5;
                const dx = cx - p.x;
                const dy = cy - p.y;
                p.vx += dx * coherenceFactor * 0.01;
                p.vy += dy * coherenceFactor * 0.01;
            } else {
                // Random perturbation
                p.vx += (Math.random() - 0.5) * 0.02;
                p.vy += (Math.random() - 0.5) * 0.02;
            }

            // Damping
            p.vx *= 0.95;
            p.vy *= 0.95;

            // Clamp velocities to prevent runaway
            p.vx = Math.max(-0.1, Math.min(0.1, p.vx));
            p.vy = Math.max(-0.1, Math.min(0.1, p.vy));

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around
            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;
            if (p.y < 0) p.y = 1;
            if (p.y > 1) p.y = 0;

            // Color from quaternion (with fallback)
            if (q && typeof q.toRGB === 'function') {
                const rgb = q.toRGB();
                p.hue = (rgb.r * 120 + rgb.g * 120 + rgb.b * 120) % 360;
            }
            
            // Size pulses with heart rate
            const hrFactor = signals?.ppg?.bpm > 0 ? 
                Math.sin(Date.now() / 1000 * (signals.ppg.bpm / 60) * Math.PI * 2) * 0.5 + 0.5 : 0.5;
            p.size = 2 + hrFactor * 3;

            // Alpha from coherence
            p.alpha = 0.3 + coherenceFactor * 0.7;

            // Ensure all values are finite
            if (!isFinite(p.x)) p.x = Math.random();
            if (!isFinite(p.y)) p.y = Math.random();
            if (!isFinite(p.hue)) p.hue = Math.random() * 360;
            if (!isFinite(p.size)) p.size = 3;
            if (!isFinite(p.alpha)) p.alpha = 0.5;
        }
    }

    // Render particles
    function renderParticles() {
        if (!particleCtx || !particleCanvas) return;

        const w = particleCanvas.width;
        const h = particleCanvas.height;
        
        if (!w || !h) return;

        // Clear with fade effect (Wabi-Sabi Paper)
        // Use computed style to get the actual variable value if needed, 
        // but for canvas clear we can use a semi-transparent clear or just fill
        particleCtx.fillStyle = isUnlocked ? 
            'rgba(197, 160, 89, 0.1)' :  // Gold mist when unlocked
            'rgba(253, 251, 247, 0.2)';   // Paper mist when locked (assuming light mode default)
        
        // We need to handle dark mode manually for canvas since it doesn't auto-switch with CSS vars in JS
        // A robust solution checks the computed style, but for now we optimize for the "Kinari" (Light) theme
        // as per the Wabi-Sabi spec, with a dark fallback if the CSS sets a dark bg.
        
        // Simpler clear for performance
        particleCtx.clearRect(0, 0, w, h);

        // Draw particles
        particleCtx.fillStyle = isUnlocked ? '#c5a059' : '#1c1c1c'; // Gold or Ink
        
        for (const p of particles) {
            const x = p.x * w;
            const y = p.y * h;
            // Optimization: integer coordinates match pixels better
            // const ix = (x + 0.5) | 0;
            // const iy = (y + 0.5) | 0;

            // Skip if coordinates are invalid
            if (!isFinite(x) || !isFinite(y)) continue;

            // Simple Circle (Much faster than gradient)
            const size = p.size || 2;
            particleCtx.globalAlpha = p.alpha;
            particleCtx.beginPath();
            particleCtx.arc(x, y, size, 0, Math.PI * 2);
            particleCtx.fill();
        }
        particleCtx.globalAlpha = 1.0;

        // Draw coherence ring (Zen Enso style)
        if (coherence > 0 && isFinite(coherence) && isFinite(unlockProgress)) {
            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.max(1, Math.min(w, h) * 0.35 * Math.max(0.1, unlockProgress));

            if (isFinite(radius) && radius > 0) {
                // Background ring (faint ink)
                particleCtx.beginPath();
                particleCtx.arc(cx, cy, radius, 0, Math.PI * 2);
                particleCtx.strokeStyle = 'rgba(28, 28, 28, 0.1)';
                particleCtx.lineWidth = 1;
                particleCtx.stroke();

                // Active coherence arc
                particleCtx.beginPath();
                // Wabi-sabi wobble could go here, but keep it smooth for now
                particleCtx.arc(cx, cy, radius, -Math.PI/2, -Math.PI/2 + (Math.PI * 2 * coherence));
                particleCtx.strokeStyle = isUnlocked ? '#c5a059' : '#1c1c1c'; // Gold or Ink
                particleCtx.lineWidth = 3;
                particleCtx.stroke();
            }
        }
    }

    // Frame callback
    function onFrame(frameData) {
        // Update reactive state
        coherence = frameData.uiState.coherence;
        heartRate = frameData.uiState.heartRate;
        unlockProgress = frameData.uiState.unlockProgress;
        isUnlocked = frameData.uiState.isUnlocked;
        status = frameData.uiState.status;
        fps = frameData.fps;
        regimes = frameData.regimes;

        // Update and render particles
        updateParticles(frameData);
        renderParticles();

        // Dispatch frame event
        dispatch('frame', frameData);
    }

    // Unlock callback
    function onUnlock(id) {
        identity = id;
        dispatch('unlock', { 
            identity: id,
            heartRate: heartRate,
            coherence: coherence
        });
    }

    // Lock callback
    function onLock() {
        identity = null;
        dispatch('lock');
    }

    // Error callback
    function onError(err) {
        error = err.message;
        dispatch('error', { error: err });
    }

    // Initialize
    onMount(async () => {
        // Create engine
        engine = new UVMEngine({
            width: 64,
            height: 64,
            coherenceThreshold,
            unlockTime
        });

        // Set callbacks
        engine.onFrame = onFrame;
        engine.onUnlock = onUnlock;
        engine.onLock = onLock;
        engine.onError = onError;

        // Initialize particles
        initParticles();

        // Setup particle canvas
        particleCanvas.width = width;
        particleCanvas.height = height;
        particleCtx = particleCanvas.getContext('2d');

        try {
            await engine.initialize(videoElement, canvasElement);
            isInitialized = true;
            engine.start();
            isRunning = true;
        } catch (err) {
            error = err.message;
        }
    });

    // Cleanup
    onDestroy(() => {
        if (engine) {
            engine.stop();
        }
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });

    // Issue capability token
    async function issueCapability(resource, action) {
        if (!engine || !isUnlocked) return null;
        try {
            const token = await engine.issueCapability(resource, action);
            dispatch('capability', { token: token.export() });
            return token;
        } catch (err) {
            logger.exception(err, { context: 'BioResonanceAuth.issueCapability' });
            return null;
        }
    }

    // Expose methods
    export { issueCapability };
</script>

<div class="bio-resonance-auth" style="--width: {width}px; --height: {height}px;">
    <!-- Hidden video and processing canvas -->
    <video
        bind:this={videoElement}
        class="hidden-video"
        muted
        playsinline
        aria-hidden="true"
    ></video>
    <canvas
        bind:this={canvasElement}
        class="hidden-canvas"
        aria-hidden="true"
    ></canvas>

    <!-- Main visualization -->
    <div class="visualization-container">
        <canvas
            bind:this={particleCanvas}
            class="particle-canvas"
            width={width}
            height={height}
            aria-label="Bio-resonance particle visualization"
            role="img"
        ></canvas>

        <!-- Coherence overlay -->
        <div class="coherence-overlay" class:unlocked={isUnlocked} role="status" aria-live="polite">
            <!-- Status indicator -->
            <div class="status-indicator" class:error={error} role="status" aria-live="assertive">
                {#if error}
                    <span class="status-icon" aria-hidden="true">⚠️</span>
                    <span class="status-text">{error}</span>
                {:else if isUnlocked}
                    <span class="status-icon" aria-hidden="true" in:scale={{ duration: 500, easing: elasticOut }}>🔓</span>
                    <span class="status-text">Sovereign Identity Unlocked</span>
                {:else if status === 'running'}
                    <span class="status-icon" aria-hidden="true">🔒</span>
                    <span class="status-text">Calibrating Resonance...</span>
                {:else}
                    <span class="status-icon" aria-hidden="true">⏳</span>
                    <span class="status-text">{status}</span>
                {/if}
            </div>

            <!-- Heart rate display -->
            {#if heartRate > 0}
                <div class="heart-rate" in:fly={{ y: 20, duration: 300 }} role="status" aria-label="Heart rate: {heartRate.toFixed(0)} beats per minute">
                    <span class="heart-icon" style="animation-duration: {60 / heartRate}s" aria-hidden="true">❤️</span>
                    <span class="heart-value">{heartRate.toFixed(0)}</span>
                    <span class="heart-unit">BPM</span>
                </div>
            {/if}

            <!-- Coherence meter -->
            <div class="coherence-meter" role="progressbar" aria-label="Coherence level" aria-valuenow={Math.round(coherence * 100)} aria-valuemin="0" aria-valuemax="100">
                <div class="coherence-label">Coherence</div>
                <div class="coherence-bar">
                    <div
                        class="coherence-fill"
                        class:high={coherence > 0.65}
                        style="width: {coherence * 100}%"
                    ></div>
                    <div class="coherence-threshold" style="left: {coherenceThreshold * 100}%" aria-hidden="true"></div>
                </div>
                <div class="coherence-value">{(coherence * 100).toFixed(0)}%</div>
            </div>

            <!-- Unlock progress -->
            {#if !isUnlocked && unlockProgress > 0}
                <div class="unlock-progress" in:fade={{ duration: 200 }} role="progressbar" aria-label="Unlock progress" aria-valuenow={Math.round(unlockProgress * 100)} aria-valuemin="0" aria-valuemax="100">
                    <div class="progress-ring">
                        <svg viewBox="0 0 100 100" aria-hidden="true">
                            <circle
                                class="progress-bg"
                                cx="50" cy="50" r="45"
                            />
                            <circle
                                class="progress-fill"
                                cx="50" cy="50" r="45"
                                style="stroke-dashoffset: {283 * (1 - unlockProgress)}"
                            />
                        </svg>
                        <div class="progress-text">{(unlockProgress * 100).toFixed(0)}%</div>
                    </div>
                    <div class="progress-label">Hold steady to unlock...</div>
                </div>
            {/if}

            <!-- Identity display -->
            {#if isUnlocked && identity}
                <div class="identity-display" in:scale={{ duration: 500, easing: elasticOut }}>
                    <div class="identity-label">Your Sovereign Identity</div>
                    <div class="identity-string">{identity.identityString}</div>
                    <button
                        class="capability-btn"
                        on:click={() => issueCapability('bio-resonance:field', 'write')}
                        aria-label="Issue capability token to grant access to bio-resonance field"
                    >
                        Issue Capability Token
                    </button>
                </div>
            {/if}
        </div>

        <!-- Debug panel -->
        {#if showDebug}
            <div class="debug-panel" in:fly={{ x: 20, duration: 300 }}>
                <div class="debug-title">Debug Info</div>
                <div class="debug-row">
                    <span>FPS:</span>
                    <span>{fps.toFixed(1)}</span>
                </div>
                <div class="debug-row">
                    <span>Status:</span>
                    <span>{status}</span>
                </div>
                <div class="debug-row">
                    <span>Regimes:</span>
                    <span>R1:{(regimes.r1 * 100).toFixed(0)}% R2:{(regimes.r2 * 100).toFixed(0)}% R3:{(regimes.r3 * 100).toFixed(0)}%</span>
                </div>
                <div class="debug-row">
                    <span>Singularity:</span>
                    <span class:warning={singularityRisk !== 'OK'}>{singularityRisk}</span>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    .bio-resonance-auth {
        position: relative;
        width: var(--width);
        height: var(--height);
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-2);
        overflow: hidden;
        transition: box-shadow 0.3s ease;
    }

    .bio-resonance-auth:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .hidden-video,
    .hidden-canvas {
        display: none;
    }

    .visualization-container {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .particle-canvas {
        width: 100%;
        height: 100%;
        display: block;
    }

    .coherence-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: var(--space-3);
        pointer-events: none;
        transition: all 0.5s ease;
    }

    .coherence-overlay.unlocked {
        background: radial-gradient(circle at center, rgba(197, 160, 89, 0.05) 0%, transparent 70%);
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-1) var(--space-2);
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-full);
        backdrop-filter: blur(4px);
    }

    .status-indicator.error {
        background: rgba(220, 38, 38, 0.1);
        border-color: var(--color-danger);
    }

    .status-icon {
        font-size: var(--text-lead);
    }

    .status-text {
        font-family: var(--font-data);
        font-size: var(--text-small);
        color: var(--color-ink);
        letter-spacing: 0.5px;
    }

    .heart-rate {
        display: flex;
        align-items: center;
        gap: var(--space-1);
        padding: var(--space-1) var(--space-2);
        background: rgba(220, 38, 38, 0.05);
        border-radius: var(--radius-full);
        backdrop-filter: blur(4px);
        margin-top: var(--space-2);
    }

    .heart-icon {
        font-size: var(--text-base);
        color: var(--color-danger);
        animation: heartbeat 1s ease-in-out infinite;
    }

    @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.15); }
    }

    .heart-value {
        font-family: var(--font-data);
        font-size: var(--text-lead);
        font-weight: bold;
        color: var(--color-danger);
    }

    .heart-unit {
        font-family: var(--font-ui);
        font-size: var(--text-caption);
        color: var(--color-ink-light);
    }

    .coherence-meter {
        width: 80%;
        max-width: 300px;
        margin-bottom: var(--space-2);
    }

    .coherence-label {
        font-family: var(--font-ui);
        font-size: var(--text-caption);
        color: var(--color-ink-light);
        margin-bottom: var(--space-0);
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .coherence-bar {
        position: relative;
        height: 4px;
        background: var(--color-border);
        border-radius: 2px;
        overflow: hidden;
    }

    .coherence-fill {
        height: 100%;
        background: var(--color-ink);
        border-radius: 2px;
        transition: width 0.3s ease;
    }

    .coherence-fill.high {
        background: var(--color-gold);
    }

    .coherence-threshold {
        position: absolute;
        top: -1px;
        bottom: -1px;
        width: 2px;
        background: var(--color-ink-light);
        opacity: 0.5;
    }

    .coherence-value {
        font-family: var(--font-data);
        font-size: var(--text-small);
        color: var(--color-ink);
        text-align: center;
        margin-top: var(--space-1);
    }

    .unlock-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-1);
    }

    .progress-ring {
        position: relative;
        width: 80px;
        height: 80px;
    }

    .progress-ring svg {
        transform: rotate(-90deg);
    }

    .progress-bg {
        fill: none;
        stroke: var(--color-border);
        stroke-width: 4;
    }

    .progress-fill {
        fill: none;
        stroke: var(--color-gold);
        stroke-width: 4;
        stroke-linecap: round;
        stroke-dasharray: 283;
        transition: stroke-dashoffset 0.3s ease;
    }

    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--font-data);
        font-size: var(--text-base);
        color: var(--color-ink);
    }

    .progress-label {
        font-family: var(--font-ui);
        font-size: var(--text-caption);
        color: var(--color-ink-light);
    }

    .identity-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3);
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-gold);
        border-radius: var(--radius-2);
        backdrop-filter: blur(8px);
        pointer-events: auto;
        box-shadow: 0 4px 20px rgba(197, 160, 89, 0.15);
    }

    .identity-label {
        font-family: var(--font-ui);
        font-size: var(--text-caption);
        color: var(--color-gold);
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .identity-string {
        font-family: var(--font-data);
        font-size: var(--text-small);
        color: var(--color-ink);
        word-break: break-all;
        text-align: center;
        max-width: 280px;
        padding: var(--space-1);
        background: var(--color-paper);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-1);
    }

    .capability-btn {
        padding: var(--space-1) var(--space-3);
        background: var(--color-gold);
        border: none;
        border-radius: var(--radius-full);
        color: white;
        font-family: var(--font-ui);
        font-size: var(--text-small);
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .capability-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(197, 160, 89, 0.4);
    }

    .debug-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 10px;
        background: var(--color-surface-elevated);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-1);
        font-family: var(--font-data);
        font-size: 10px;
        color: var(--color-ink-light);
        pointer-events: auto;
    }

    .debug-title {
        font-weight: bold;
        color: var(--color-ink);
        margin-bottom: 4px;
    }

    .debug-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 2px;
    }

    .debug-row .warning {
        color: var(--color-danger);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .bio-resonance-auth {
            border-radius: 0;
        }

        .status-text {
            font-size: var(--text-caption);
        }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .heart-icon {
            animation: none;
        }

        .coherence-fill,
        .progress-fill {
            transition: none;
        }
    }
</style>
