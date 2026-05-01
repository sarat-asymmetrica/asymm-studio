<script>
    /**
     * BIO-RESONANCE AUTHENTICATION COMPONENT - ENHANCED
     * ==================================================
     * 
     * The flagship feature with GPU acceleration and MediaPipe integration.
     * 
     * Enhancements over base component:
     *   - WebGL particle renderer (100K+ particles)
     *   - MediaPipe FaceMesh (468 landmarks)
     *   - GPU bridge for backend acceleration
     *   - Precise PPG from forehead/cheek ROI
     *   - Blink detection and micro-expression coherence
     *   - Gesture detection (nod, shake)
     * 
     * @author Asymmetrica Research Laboratory
     * @founded December 8th, 2025
     */

    import { logger } from '$lib/utils/logger';
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { fade, scale, fly } from 'svelte/transition';
    import { cubicOut, elasticOut } from 'svelte/easing';
    import { UVMEngine } from '../engine/uvm-engine.js';
    import { createParticleRenderer } from '../gpu/webgl-particle-renderer.js';
    import { initializeGPUBridge, getGPUBridge } from '../gpu/gpu-bridge.js';
    import { createFaceMeshIntegration } from '../mediapipe/facemesh-integration.js';

    // Props
    export let width = 640;
    export let height = 480;
    export let coherenceThreshold = 0.65;
    export let unlockTime = 3.0;
    export let showDebug = false;
    export let particleCount = 50000;  // WebGL can handle 50K+
    export let useWebGL = true;
    export let useMediaPipe = true;
    export let useGPUBridge = true;
    export let backendUrl = 'http://localhost:9999';

    // Event dispatcher
    const dispatch = createEventDispatcher();

    // Engine instances
    let engine = null;
    let webglRenderer = null;
    let faceMesh = null;
    let gpuBridge = null;

    // DOM elements
    let videoElement;
    let canvasElement;
    let particleCanvas;
    let particleCtx;

    // State
    let isInitialized = false;
    let isRunning = false;
    let error = null;
    let initProgress = 0;
    let initStatus = 'Starting...';

    // UI State (reactive)
    let coherence = 0;
    let heartRate = 0;
    let unlockProgress = 0;
    let isUnlocked = false;
    let identity = null;
    let status = 'initializing';
    let fps = 0;

    // Enhanced state
    let faceDetected = false;
    let blinkRate = 0;
    let expressionCoherence = 0;
    let lastGesture = null;
    let gpuConnected = false;
    let webglActive = false;

    // Regime state
    let regimes = { r1: 0.30, r2: 0.20, r3: 0.50 };
    let singularityRisk = 'OK';

    // Fallback particles (if WebGL fails)
    let particles = [];

    // Initialize fallback particles
    function initFallbackParticles() {
        particles = [];
        for (let i = 0; i < 2000; i++) {
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

    // Update fallback particles
    function updateFallbackParticles(frameData) {
        if (!particleCtx || !engine) return;

        const { signals } = frameData;
        const coherenceFactor = signals?.coherence?.coherence || 0;

        for (const p of particles) {
            const q = engine.getQuaternionAt(p.x, p.y);
            const grad = engine.getGradientAt(p.x, p.y);

            if (q && typeof q.x === 'number' && isFinite(q.x)) {
                p.vx += q.x * 0.01;
                p.vy += q.y * 0.01;
            }
            
            if (grad && typeof grad.x === 'number' && isFinite(grad.x)) {
                p.vx += grad.x * 0.1;
                p.vy += grad.y * 0.1;
            }

            if (coherenceFactor > 0.5) {
                const cx = 0.5, cy = 0.5;
                const dx = cx - p.x;
                const dy = cy - p.y;
                p.vx += dx * coherenceFactor * 0.01;
                p.vy += dy * coherenceFactor * 0.01;
            } else {
                p.vx += (Math.random() - 0.5) * 0.02;
                p.vy += (Math.random() - 0.5) * 0.02;
            }

            p.vx *= 0.95;
            p.vy *= 0.95;
            p.vx = Math.max(-0.1, Math.min(0.1, p.vx));
            p.vy = Math.max(-0.1, Math.min(0.1, p.vy));

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = 1;
            if (p.x > 1) p.x = 0;
            if (p.y < 0) p.y = 1;
            if (p.y > 1) p.y = 0;

            if (q && typeof q.toRGB === 'function') {
                const rgb = q.toRGB();
                p.hue = (rgb.r * 120 + rgb.g * 120 + rgb.b * 120) % 360;
            }
            
            const hrFactor = signals?.ppg?.bpm > 0 ? 
                Math.sin(Date.now() / 1000 * (signals.ppg.bpm / 60) * Math.PI * 2) * 0.5 + 0.5 : 0.5;
            p.size = 2 + hrFactor * 3;
            p.alpha = 0.3 + coherenceFactor * 0.7;

            if (!isFinite(p.x)) p.x = Math.random();
            if (!isFinite(p.y)) p.y = Math.random();
            if (!isFinite(p.hue)) p.hue = Math.random() * 360;
            if (!isFinite(p.size)) p.size = 3;
            if (!isFinite(p.alpha)) p.alpha = 0.5;
        }
    }

    // Render fallback particles
    function renderFallbackParticles() {
        if (!particleCtx || !particleCanvas) return;

        const w = particleCanvas.width;
        const h = particleCanvas.height;
        
        if (!w || !h) return;

        particleCtx.fillStyle = isUnlocked ? 
            'rgba(26, 26, 46, 0.15)' :
            'rgba(10, 10, 15, 0.15)';
        particleCtx.fillRect(0, 0, w, h);

        for (const p of particles) {
            const x = p.x * w;
            const y = p.y * h;
            const size = Math.max(1, p.size || 3);
            const hue = isFinite(p.hue) ? p.hue : 200;
            const alpha = isFinite(p.alpha) ? p.alpha : 0.5;

            if (!isFinite(x) || !isFinite(y)) continue;

            try {
                const glowSize = Math.max(1, size * 3);
                const gradient = particleCtx.createRadialGradient(x, y, 0, x, y, glowSize);
                const adjustedHue = isUnlocked ? (hue + 30) % 360 : hue;
                gradient.addColorStop(0, `hsla(${adjustedHue}, 70%, 55%, ${alpha})`);
                gradient.addColorStop(0.5, `hsla(${adjustedHue}, 60%, 35%, ${alpha * 0.4})`);
                gradient.addColorStop(1, `hsla(${adjustedHue}, 50%, 20%, 0)`);

                particleCtx.beginPath();
                particleCtx.arc(x, y, glowSize, 0, Math.PI * 2);
                particleCtx.fillStyle = gradient;
                particleCtx.fill();
            } catch (e) {
                continue;
            }

            particleCtx.beginPath();
            particleCtx.arc(x, y, size, 0, Math.PI * 2);
            particleCtx.fillStyle = isUnlocked ? 
                `hsla(45, 80%, 65%, ${alpha})` :
                `hsla(${hue}, 80%, 65%, ${alpha})`;
            particleCtx.fill();
        }

        // Draw coherence ring
        if (coherence > 0 && isFinite(coherence) && isFinite(unlockProgress)) {
            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.max(1, Math.min(w, h) * 0.35 * Math.max(0.1, unlockProgress));

            if (isFinite(radius) && radius > 0) {
                particleCtx.beginPath();
                particleCtx.arc(cx, cy, radius, 0, Math.PI * 2);
                particleCtx.strokeStyle = isUnlocked ? 
                    `hsla(45, 80%, 60%, ${coherence})` :
                    `hsla(200, 70%, 50%, ${coherence})`;
                particleCtx.lineWidth = 2;
                particleCtx.stroke();

                if (!isUnlocked && unlockProgress > 0.01) {
                    particleCtx.beginPath();
                    particleCtx.arc(cx, cy, radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * unlockProgress);
                    particleCtx.strokeStyle = `hsla(45, 70%, 55%, ${coherence})`;
                    particleCtx.lineWidth = 4;
                    particleCtx.stroke();
                }
            }
        }
    }

    // Frame callback
    async function onFrame(frameData) {
        // Update reactive state
        coherence = frameData.uiState.coherence;
        heartRate = frameData.uiState.heartRate;
        unlockProgress = frameData.uiState.unlockProgress;
        isUnlocked = frameData.uiState.isUnlocked;
        status = frameData.uiState.status;
        fps = frameData.fps;
        regimes = frameData.regimes;

        // Process MediaPipe if available
        if (faceMesh && videoElement) {
            const faceState = await faceMesh.processFrame(videoElement);
            if (faceState) {
                faceDetected = faceState.faceDetected;
                blinkRate = faceState.blink?.blinkRate || 0;
                expressionCoherence = faceState.expression?.coherence || 0;
                lastGesture = faceState.gesture?.type;
            }
        }

        // Update WebGL renderer or fallback
        if (webglRenderer && webglActive) {
            webglRenderer.update(
                engine?.quaternionField,
                frameData.dt,
                frameData.signals
            );
            webglRenderer.render();
        } else {
            updateFallbackParticles(frameData);
            renderFallbackParticles();
        }

        // Dispatch frame event
        dispatch('frame', {
            ...frameData,
            faceDetected,
            blinkRate,
            expressionCoherence,
            lastGesture,
            gpuConnected,
            webglActive
        });
    }

    // Unlock callback
    async function onUnlock(id) {
        identity = id;
        
        // Register with backend if GPU bridge connected
        if (gpuBridge && gpuBridge.isConnected) {
            try {
                await gpuBridge.registerIdentity(id);
            } catch (e) {
                logger.warn('Failed to register identity with backend', { error: e.message });
            }
        }
        
        dispatch('unlock', { identity: id });
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
        try {
            // Step 1: Initialize GPU Bridge
            initStatus = 'Connecting to GPU backend...';
            initProgress = 10;
            if (useGPUBridge) {
                try {
                    gpuBridge = await initializeGPUBridge({ backendUrl });
                    gpuConnected = gpuBridge.isConnected;
                } catch (e) {
                    logger.warn('GPU Bridge not available', { error: e.message });
                }
            }
            initProgress = 25;

            // Step 2: Initialize MediaPipe
            initStatus = 'Loading face detection...';
            if (useMediaPipe) {
                try {
                    faceMesh = await createFaceMeshIntegration();
                } catch (e) {
                    logger.warn('MediaPipe not available', { error: e.message });
                }
            }
            initProgress = 40;

            // Step 3: Create UVM Engine
            initStatus = 'Initializing vision manifold...';
            engine = new UVMEngine({
                width: 64,
                height: 64,
                coherenceThreshold,
                unlockTime
            });

            engine.onFrame = onFrame;
            engine.onUnlock = onUnlock;
            engine.onLock = onLock;
            engine.onError = onError;
            initProgress = 55;

            // Step 4: Initialize WebGL Renderer
            initStatus = 'Initializing GPU particles...';
            if (useWebGL && particleCanvas) {
                try {
                    webglRenderer = await createParticleRenderer(particleCanvas, {
                        particleCount,
                        bloomEnabled: true,
                        bloomIntensity: 0.5
                    });
                    webglActive = webglRenderer !== null;
                } catch (e) {
                    logger.warn('WebGL not available, using Canvas2D fallback', { error: e.message });
                    webglActive = false;
                }
            }
            initProgress = 70;

            // Step 5: Setup fallback if needed
            if (!webglActive) {
                particleCanvas.width = width;
                particleCanvas.height = height;
                particleCtx = particleCanvas.getContext('2d');
                initFallbackParticles();
            }
            initProgress = 85;

            // Step 6: Initialize camera and start
            initStatus = 'Requesting camera access...';
            await engine.initialize(videoElement, canvasElement);
            isInitialized = true;
            engine.start();
            isRunning = true;
            initProgress = 100;
            initStatus = 'Ready';

        } catch (err) {
            error = err.message;
            initStatus = 'Error: ' + err.message;
        }
    });

    // Cleanup
    onDestroy(() => {
        if (engine) {
            engine.stop();
        }
        if (webglRenderer) {
            webglRenderer.destroy();
        }
        if (faceMesh) {
            faceMesh.destroy();
        }
    });

    // Issue capability token
    async function issueCapability(resource, action) {
        if (!engine || !isUnlocked) return null;
        try {
            const token = await engine.issueCapability(resource, action);
            
            // Verify with backend if connected
            if (gpuBridge && gpuBridge.isConnected) {
                const verification = await gpuBridge.verifyCapability(token.export());
                if (!verification.valid) {
                    logger.warn('Backend verification failed', { reason: verification.reason });
                }
            }
            
            dispatch('capability', { token: token.export() });
            return token;
        } catch (err) {
            logger.exception(err, { context: 'BioResonanceAuthEnhanced.issueCapability' });
            return null;
        }
    }

    // Get renderer stats
    function getStats() {
        return {
            fps,
            coherence,
            heartRate,
            faceDetected,
            blinkRate,
            expressionCoherence,
            gpuConnected,
            webglActive,
            webglStats: webglRenderer?.getStats() || null,
            gpuBridgeStats: gpuBridge?.getStats() || null
        };
    }

    // Expose methods
    export { issueCapability, getStats };
</script>

<div class="bio-resonance-auth enhanced" style="--width: {width}px; --height: {height}px;">
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

    <!-- Loading overlay -->
    {#if !isInitialized && !error}
        <div class="loading-overlay" transition:fade={{ duration: 300 }}>
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-status">{initStatus}</div>
                <div class="loading-progress">
                    <div class="loading-bar" style="width: {initProgress}%"></div>
                </div>
            </div>
        </div>
    {/if}

    <!-- Main visualization -->
    <div class="visualization-container">
        <canvas
            bind:this={particleCanvas}
            class="particle-canvas"
            width={width}
            height={height}
            aria-label="Enhanced bio-resonance particle visualization with GPU acceleration"
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

            <!-- Connection indicators -->
            <div class="connection-indicators" role="status" aria-label="System status indicators">
                {#if webglActive}
                    <span class="indicator gpu" title="WebGL Active" aria-label="WebGL acceleration active">🎮</span>
                {/if}
                {#if gpuConnected}
                    <span class="indicator backend" title="GPU Backend Connected" aria-label="GPU backend connected">🔗</span>
                {/if}
                {#if faceDetected}
                    <span class="indicator face" title="Face Detected" aria-label="Face detected in video">👤</span>
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

            <!-- Enhanced metrics -->
            {#if faceDetected && blinkRate > 0}
                <div class="enhanced-metrics" in:fly={{ y: 20, duration: 300, delay: 100 }} role="status" aria-label="Facial metrics">
                    <div class="metric" aria-label="Blink rate: {blinkRate.toFixed(0)} blinks per minute">
                        <span class="metric-icon" aria-hidden="true">👁️</span>
                        <span class="metric-value">{blinkRate.toFixed(0)}</span>
                        <span class="metric-unit">blinks/min</span>
                    </div>
                    <div class="metric" aria-label="Expression coherence: {(expressionCoherence * 100).toFixed(0)} percent">
                        <span class="metric-icon" aria-hidden="true">😊</span>
                        <span class="metric-value">{(expressionCoherence * 100).toFixed(0)}%</span>
                        <span class="metric-unit">expression</span>
                    </div>
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
                    <span>Renderer:</span>
                    <span>{webglActive ? 'WebGL' : 'Canvas2D'}</span>
                </div>
                <div class="debug-row">
                    <span>Particles:</span>
                    <span>{webglActive ? particleCount : particles.length}</span>
                </div>
                <div class="debug-row">
                    <span>GPU Backend:</span>
                    <span class:connected={gpuConnected}>{gpuConnected ? 'Connected' : 'Offline'}</span>
                </div>
                <div class="debug-row">
                    <span>Face:</span>
                    <span>{faceDetected ? 'Detected' : 'Not found'}</span>
                </div>
                <div class="debug-row">
                    <span>Regimes:</span>
                    <span>R1:{(regimes.r1 * 100).toFixed(0)}% R2:{(regimes.r2 * 100).toFixed(0)}% R3:{(regimes.r3 * 100).toFixed(0)}%</span>
                </div>
                {#if lastGesture}
                    <div class="debug-row">
                        <span>Gesture:</span>
                        <span>{lastGesture}</span>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .bio-resonance-auth.enhanced {
        position: relative;
        width: var(--width);
        height: var(--height);
        background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5),
            0 0 40px rgba(100, 150, 255, 0.1);
    }

    .hidden-video,
    .hidden-canvas {
        display: none;
    }

    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(10, 10, 15, 0.95);
        z-index: 100;
    }

    .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }

    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid rgba(100, 150, 255, 0.2);
        border-top-color: var(--color-optimize);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .loading-status {
        font-family: var(--font-code);
        font-size: 14px;
        color: var(--color-ink-light);
    }

    .loading-progress {
        width: 200px;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
    }

    .loading-bar {
        height: 100%;
        background: linear-gradient(90deg, #4a90d9, #67b26f);
        transition: width 0.3s ease;
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
        padding: 20px;
        pointer-events: none;
        transition: all 0.5s ease;
    }

    .coherence-overlay.unlocked {
        background: radial-gradient(circle at center, rgba(197, 160, 89, 0.1) 0%, transparent 70%);
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 20px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 30px;
        backdrop-filter: blur(10px);
    }

    .status-indicator.error {
        background: rgba(255, 50, 50, 0.3);
    }

    .status-icon {
        font-size: 24px;
    }

    .status-text {
        font-family: var(--font-code);
        font-size: 14px;
        color: var(--color-surface-elevated);
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    .connection-indicators {
        display: flex;
        gap: 8px;
        position: absolute;
        top: 20px;
        right: 20px;
    }

    .indicator {
        font-size: 16px;
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 12px;
        cursor: help;
    }

    .heart-rate {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 100, 100, 0.2);
        border-radius: 20px;
        backdrop-filter: blur(5px);
    }

    .heart-icon {
        font-size: 20px;
        animation: heartbeat 1s ease-in-out infinite;
    }

    @keyframes heartbeat {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
    }

    .heart-value {
        font-family: var(--font-code);
        font-size: 24px;
        font-weight: bold;
        color: var(--color-explore);
    }

    .heart-unit {
        font-size: 12px;
        color: var(--color-explore);
    }

    .enhanced-metrics {
        display: flex;
        gap: 16px;
    }

    .metric {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: rgba(100, 150, 255, 0.2);
        border-radius: 16px;
        backdrop-filter: blur(5px);
    }

    .metric-icon {
        font-size: 14px;
    }

    .metric-value {
        font-family: var(--font-code);
        font-size: 14px;
        font-weight: bold;
        color: var(--color-optimize);
    }

    .metric-unit {
        font-size: 10px;
        color: var(--color-optimize);
    }

    .coherence-meter {
        width: 80%;
        max-width: 300px;
    }

    .coherence-label {
        font-size: 12px;
        color: var(--color-ink-light);
        margin-bottom: 5px;
        text-align: center;
    }

    .coherence-bar {
        position: relative;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }

    .coherence-fill {
        height: 100%;
        background: linear-gradient(90deg, #4a90d9, #67b26f);
        border-radius: 4px;
        transition: width 0.3s ease, background 0.3s ease;
    }

    .coherence-fill.high {
        background: linear-gradient(90deg, var(--color-stabilize), var(--color-gold));
        box-shadow: 0 0 10px rgba(197, 160, 89, 0.5);
    }

    .coherence-threshold {
        position: absolute;
        top: -2px;
        bottom: -2px;
        width: 2px;
        background: var(--color-surface-elevated);
        opacity: 0.5;
    }

    .coherence-value {
        font-family: var(--font-code);
        font-size: 14px;
        color: var(--color-surface-elevated);
        text-align: center;
        margin-top: 5px;
    }

    .unlock-progress {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
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
        stroke: rgba(255, 255, 255, 0.1);
        stroke-width: 8;
    }

    .progress-fill {
        fill: none;
        stroke: var(--color-stabilize);
        stroke-width: 8;
        stroke-linecap: round;
        stroke-dasharray: 283;
        transition: stroke-dashoffset 0.3s ease;
    }

    .progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: var(--font-code);
        font-size: 16px;
        color: var(--color-surface-elevated);
    }

    .progress-label {
        font-size: 12px;
        color: var(--color-ink-light);
    }

    .identity-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px;
        background: rgba(197, 160, 89, 0.1);
        border: 1px solid rgba(197, 160, 89, 0.3);
        border-radius: var(--radius-2);
        backdrop-filter: blur(10px);
        pointer-events: auto;
    }

    .identity-label {
        font-size: 12px;
        color: var(--color-gold);
        text-transform: uppercase;
        letter-spacing: 2px;
    }

    .identity-string {
        font-family: var(--font-code);
        font-size: 11px;
        color: var(--color-surface-elevated);
        word-break: break-all;
        text-align: center;
        max-width: 280px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: var(--radius-1);
    }

    .capability-btn {
        padding: 10px 20px;
        background: linear-gradient(135deg, var(--color-gold), #d4af37);
        border: none;
        border-radius: 20px;
        color: var(--color-ink);
        font-family: var(--font-code);
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .capability-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 5px 20px rgba(197, 160, 89, 0.4);
    }

    .debug-panel {
        position: absolute;
        top: 10px;
        right: 10px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.7);
        border-radius: var(--radius-1);
        font-family: var(--font-code);
        font-size: 11px;
        color: var(--color-ink-light);
        pointer-events: auto;
        max-width: 200px;
    }

    .debug-title {
        font-weight: bold;
        color: var(--color-surface-elevated);
        margin-bottom: 8px;
    }

    .debug-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 4px;
    }

    .debug-row .connected {
        color: var(--color-stabilize);
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .bio-resonance-auth.enhanced {
            border-radius: 0;
        }

        .status-text {
            font-size: 12px;
        }

        .identity-string {
            font-size: 9px;
            max-width: 200px;
        }

        .enhanced-metrics {
            flex-direction: column;
            gap: 8px;
        }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .heart-icon,
        .loading-spinner {
            animation: none;
        }

        .coherence-fill,
        .progress-fill,
        .loading-bar {
            transition: none;
        }
    }
</style>
