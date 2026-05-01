<script>
    /**
     * BIO-RESONANCE QUICK AUTH
     * ========================
     * 
     * Sub-5 second authentication with full observability.
     * Steve Jobs approved: Simple, fast, delightful.
     * 
     * Design Principles:
     *   - 3 clear phases: READY → SENSING → UNLOCKED
     *   - User knows exactly what's happening
     *   - Guidance on what they CAN do (not just what they can't)
     *   - Graceful degradation (works without GPU, MediaPipe)
     *   - Audio feedback for accessibility
     *   - Wabi-sabi aesthetics
     * 
     * @author Asymmetrica Research Laboratory
     * @founded December 8th, 2025
     */

    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { fade, scale, fly } from 'svelte/transition';
    import { cubicOut, elasticOut, backOut } from 'svelte/easing';
    import { tweened } from 'svelte/motion';
    import { UVMEngine } from '../engine/uvm-engine.js';

    // Props
    export let width = 400;
    export let height = 300;
    export let unlockThreshold = 0.55;  // Lower threshold = faster unlock
    export let unlockTime = 1.5;        // 1.5 seconds, not 3!
    export let showParticles = true;
    export let enableAudio = true;
    export let darkMode = true;

    // Event dispatcher
    const dispatch = createEventDispatcher();

    // Engine
    let engine = null;
    let videoElement;
    let canvasElement;

    // Phases: 'initializing' | 'ready' | 'sensing' | 'unlocking' | 'unlocked' | 'error'
    let phase = 'initializing';
    let phaseMessage = 'Starting camera...';
    let phaseGuidance = '';

    // Metrics (smoothed for display)
    const coherenceDisplay = tweened(0, { duration: 300 });
    const progressDisplay = tweened(0, { duration: 200 });
    let heartRate = 0;
    let isUnlocked = false;
    let identity = null;

    // Timing
    let startTime = 0;
    let unlockDuration = 0;

    // Simple particle system (lightweight, not 100K!)
    let particles = [];
    const PARTICLE_COUNT = 50;  // Just 50, not 50000!

    // Audio context for feedback
    let audioCtx = null;

    // Phase messages and guidance
    const PHASE_CONFIG = {
        initializing: {
            message: 'Starting camera...',
            guidance: 'One moment please',
            icon: '⏳'
        },
        ready: {
            message: 'Look at the camera',
            guidance: 'You can blink, breathe normally, relax',
            icon: '👁️'
        },
        sensing: {
            message: 'Sensing your presence...',
            guidance: 'Stay relaxed • Phone can ring • You can move slightly',
            icon: '🌊'
        },
        unlocking: {
            message: 'Almost there...',
            guidance: 'Just a moment more',
            icon: '✨'
        },
        unlocked: {
            message: 'Welcome back',
            guidance: '',
            icon: '🔓'
        },
        error: {
            message: 'Camera access needed',
            guidance: 'Please allow camera access and refresh',
            icon: '📷'
        }
    };

    // Initialize lightweight particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
            const radius = 0.3 + Math.random() * 0.2;
            particles.push({
                x: 0.5 + Math.cos(angle) * radius,
                y: 0.5 + Math.sin(angle) * radius,
                baseAngle: angle,
                radius: radius,
                speed: 0.5 + Math.random() * 0.5,
                size: 2 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.4
            });
        }
    }

    // Update particles (simple orbital motion)
    function updateParticles(coherence) {
        const time = Date.now() / 1000;
        for (const p of particles) {
            // Orbital motion that tightens with coherence
            const radiusFactor = 1 - coherence * 0.5;
            const currentRadius = p.radius * radiusFactor;
            const angle = p.baseAngle + time * p.speed * (0.5 + coherence);
            
            p.x = 0.5 + Math.cos(angle) * currentRadius;
            p.y = 0.5 + Math.sin(angle) * currentRadius;
            p.opacity = 0.3 + coherence * 0.5;
        }
    }

    // Play audio feedback
    function playTone(frequency, duration, type = 'sine') {
        if (!enableAudio || !audioCtx) return;
        
        try {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Audio failed, continue silently
        }
    }

    // Phase transition
    function setPhase(newPhase) {
        if (phase === newPhase) return;
        
        phase = newPhase;
        const config = PHASE_CONFIG[newPhase];
        phaseMessage = config.message;
        phaseGuidance = config.guidance;

        // Audio feedback for phase transitions
        if (newPhase === 'sensing') {
            playTone(440, 0.1);  // A4 - start sensing
        } else if (newPhase === 'unlocking') {
            playTone(523, 0.1);  // C5 - almost there
        } else if (newPhase === 'unlocked') {
            playTone(659, 0.15); // E5
            setTimeout(() => playTone(784, 0.2), 100);  // G5 - success chord
        }
    }

    // Frame callback
    function onFrame(frameData) {
        const coherence = frameData.uiState.coherence || 0;
        const progress = frameData.uiState.unlockProgress || 0;
        
        coherenceDisplay.set(coherence);
        progressDisplay.set(progress);
        heartRate = frameData.uiState.heartRate || 0;

        // Update particles
        if (showParticles) {
            updateParticles(coherence);
            particles = particles;  // Trigger reactivity
        }

        // Phase logic
        if (phase === 'ready' && coherence > 0.2) {
            setPhase('sensing');
        } else if (phase === 'sensing' && coherence >= unlockThreshold) {
            setPhase('unlocking');
        } else if (phase === 'unlocking' && coherence < unlockThreshold * 0.8) {
            setPhase('sensing');  // Dropped back
        }

        dispatch('frame', { coherence, progress, heartRate, phase });
    }

    // Unlock callback
    function onUnlock(id) {
        unlockDuration = (Date.now() - startTime) / 1000;
        identity = id;
        isUnlocked = true;
        setPhase('unlocked');
        dispatch('unlock', { identity: id, duration: unlockDuration });
    }

    // Error callback
    function onError(err) {
        setPhase('error');
        phaseMessage = err.message || 'Camera access needed';
        dispatch('error', { error: err });
    }

    // Initialize
    onMount(async () => {
        startTime = Date.now();

        // Initialize audio context (requires user interaction on some browsers)
        if (enableAudio) {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                // Audio not available
            }
        }

        // Initialize particles
        if (showParticles) {
            initParticles();
        }

        // Create engine with optimized settings
        engine = new UVMEngine({
            width: 32,   // Smaller field = faster
            height: 32,
            coherenceThreshold: unlockThreshold,
            unlockTime: unlockTime
        });

        engine.onFrame = onFrame;
        engine.onUnlock = onUnlock;
        engine.onError = onError;

        try {
            await engine.initialize(videoElement, canvasElement);
            setPhase('ready');
            engine.start();
        } catch (err) {
            onError(err);
        }
    });

    // Cleanup
    onDestroy(() => {
        if (engine) engine.stop();
        if (audioCtx) audioCtx.close();
    });

    // Issue capability
    async function issueCapability(resource, action) {
        if (!engine || !isUnlocked) return null;
        return await engine.issueCapability(resource, action);
    }

    // Retry after error
    function retry() {
        setPhase('initializing');
        engine?.start();
    }

    export { issueCapability, retry };

    // Computed styles
    $: containerClass = darkMode ? 'dark' : 'light';
    $: phaseIcon = PHASE_CONFIG[phase]?.icon || '⏳';
    $: progressPercent = Math.round($progressDisplay * 100);
    $: coherencePercent = Math.round($coherenceDisplay * 100);
</script>

<div 
    class="bio-quick {containerClass}" 
    class:unlocked={isUnlocked}
    style="--width: {width}px; --height: {height}px;"
>
    <!-- Hidden video/canvas -->
    <video bind:this={videoElement} class="hidden" muted playsinline aria-hidden="true"></video>
    <canvas bind:this={canvasElement} class="hidden" aria-hidden="true"></canvas>

    <!-- Particle layer -->
    {#if showParticles && phase !== 'error'}
        <svg class="particle-layer" viewBox="0 0 1 1" preserveAspectRatio="xMidYMid slice" aria-hidden="true" role="presentation">
            {#each particles as p, i}
                <circle
                    cx={p.x}
                    cy={p.y}
                    r={p.size / 400}
                    fill={isUnlocked ? 'var(--gold)' : 'var(--accent)'}
                    opacity={p.opacity}
                />
            {/each}
            
            <!-- Center ring -->
            <circle
                cx="0.5"
                cy="0.5"
                r={0.15 + $coherenceDisplay * 0.1}
                fill="none"
                stroke={isUnlocked ? 'var(--gold)' : 'var(--accent)'}
                stroke-width="0.005"
                opacity={0.3 + $coherenceDisplay * 0.5}
            />
        </svg>
    {/if}

    <!-- Main content -->
    <div class="content" role="status" aria-live="polite">
        <!-- Phase icon -->
        <div class="phase-icon" class:pulse={phase === 'sensing' || phase === 'unlocking'} aria-hidden="true">
            {#key phase}
                <span in:scale={{ duration: 300, easing: backOut }}>{phaseIcon}</span>
            {/key}
        </div>

        <!-- Phase message -->
        <div class="phase-message" role="alert" aria-live="assertive">
            {#key phaseMessage}
                <span in:fade={{ duration: 200 }}>{phaseMessage}</span>
            {/key}
        </div>

        <!-- Progress bar (only during sensing/unlocking) -->
        {#if phase === 'sensing' || phase === 'unlocking'}
            <div class="progress-container" in:fade={{ duration: 200 }} role="progressbar" aria-label="Coherence progress" aria-valuenow={coherencePercent} aria-valuemin="0" aria-valuemax="100">
                <div class="progress-bar">
                    <div
                        class="progress-fill"
                        class:high={$coherenceDisplay >= unlockThreshold}
                        style="width: {coherencePercent}%"
                    ></div>
                    <div class="threshold-marker" style="left: {unlockThreshold * 100}%" aria-hidden="true"></div>
                </div>
                <div class="progress-label">{coherencePercent}%</div>
            </div>
        {/if}

        <!-- Unlock progress ring -->
        {#if phase === 'unlocking' && $progressDisplay > 0}
            <div class="unlock-ring" in:scale={{ duration: 200 }} role="progressbar" aria-label="Unlock progress" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                    <circle class="ring-bg" cx="50" cy="50" r="40" />
                    <circle
                        class="ring-fill"
                        cx="50" cy="50" r="40"
                        style="stroke-dashoffset: {251 * (1 - $progressDisplay)}"
                    />
                </svg>
                <span class="ring-text">{progressPercent}%</span>
            </div>
        {/if}

        <!-- Success state -->
        {#if isUnlocked && identity}
            <div class="success-state" in:scale={{ duration: 400, easing: elasticOut }} role="status" aria-label="Sovereign identity unlocked in {unlockDuration.toFixed(1)} seconds">
                <div class="identity-badge">
                    <span class="identity-prefix">asym1:</span>
                    <span class="identity-short">{identity.identityString?.slice(6, 14)}...</span>
                </div>
                <div class="unlock-time">Unlocked in {unlockDuration.toFixed(1)}s</div>
            </div>
        {/if}

        <!-- Guidance -->
        {#if phaseGuidance && !isUnlocked}
            <div class="guidance" in:fly={{ y: 10, duration: 300, delay: 200 }} role="note" aria-label="Guidance: {phaseGuidance}">
                {phaseGuidance}
            </div>
        {/if}

        <!-- Error retry -->
        {#if phase === 'error'}
            <button class="retry-btn" on:click={retry} aria-label="Retry authentication after camera access error">
                Try Again
            </button>
        {/if}

        <!-- Heart rate indicator (subtle) -->
        {#if heartRate > 0 && !isUnlocked}
            <div class="heart-indicator" in:fade={{ duration: 300 }} role="status" aria-label="Heart rate: {heartRate.toFixed(0)} beats per minute">
                <span class="heart" style="animation-duration: {60 / heartRate}s" aria-hidden="true">♥</span>
                <span class="bpm">{heartRate.toFixed(0)}</span>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Wabi-Sabi CSS Variables */
    .bio-quick {
        --accent: #6699CC;
        --gold: #c5a059;           /* Kin'iro - Kintsugi gold */
        --success: #4EBC8E;        /* Nourished green */
        --bg: #0a0a0f;             /* Sumi - deep void */
        --bg-subtle: #1a1a2e;
        --text: #f4f1ea;           /* Kinari - silk cream */
        --text-muted: #888;
        --border: rgba(255, 255, 255, 0.08);
        
        /* Fibonacci spacing */
        --space-xs: 8px;
        --space-sm: 13px;
        --space-md: 21px;
        --space-lg: 34px;
    }

    .bio-quick.light {
        --bg: #f4f1ea;
        --bg-subtle: #e8e5de;
        --text: #1c1c1c;
        --text-muted: #666;
        --border: rgba(0, 0, 0, 0.08);
    }

    .bio-quick {
        position: relative;
        width: var(--width);
        height: var(--height);
        background: var(--bg);
        border-radius: var(--space-md);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', system-ui, sans-serif;
        transition: all 0.5s cubic-bezier(0.42, 0, 0.58, 1);
        
        /* Subtle inner shadow for depth */
        box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.03),
            0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .bio-quick.unlocked {
        background: linear-gradient(135deg, var(--bg) 0%, rgba(197, 160, 89, 0.08) 100%);
        box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 0 60px rgba(197, 160, 89, 0.15),
            0 20px 60px rgba(0, 0, 0, 0.4);
    }

    .hidden {
        display: none;
    }

    /* Particle layer */
    .particle-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
    }

    /* Content */
    .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px;
        text-align: center;
    }

    /* Phase icon - Shibui: subtle, not flashy */
    .phase-icon {
        font-size: 48px;
        line-height: 1;
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
    }

    .phase-icon.pulse {
        animation: gentle-breathe 4s ease-in-out infinite;
    }

    /* Prana breathing - slow, meditative (0.5-0.8 Hz) */
    @keyframes gentle-breathe {
        0%, 100% { 
            transform: scale(1); 
            opacity: 1;
            filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
        }
        50% { 
            transform: scale(1.05); 
            opacity: 0.85;
            filter: drop-shadow(0 4px 16px rgba(197, 160, 89, 0.2));
        }
    }

    /* Phase message - Haragei: say less, imply more */
    .phase-message {
        font-size: 18px;
        font-weight: 400;  /* Lighter weight = more elegant */
        color: var(--text);
        min-height: 28px;
        letter-spacing: 0.02em;
        opacity: 0.95;
    }

    /* Progress bar */
    .progress-container {
        width: 80%;
        max-width: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
    }

    .progress-bar {
        position: relative;
        width: 100%;
        height: 6px;
        background: var(--border);
        border-radius: 3px;
        overflow: visible;
    }

    .progress-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 3px;
        transition: width 0.3s ease, background 0.3s ease;
    }

    .progress-fill.high {
        background: var(--success);
    }

    .threshold-marker {
        position: absolute;
        top: -4px;
        bottom: -4px;
        width: 2px;
        background: var(--text);
        opacity: 0.5;
        border-radius: 1px;
    }

    .progress-label {
        font-size: 12px;
        color: var(--text-muted);
        font-family: 'Courier Prime', monospace;
    }

    /* Unlock ring */
    .unlock-ring {
        position: relative;
        width: 80px;
        height: 80px;
    }

    .unlock-ring svg {
        transform: rotate(-90deg);
    }

    .ring-bg {
        fill: none;
        stroke: var(--border);
        stroke-width: 6;
    }

    .ring-fill {
        fill: none;
        stroke: var(--gold);
        stroke-width: 6;
        stroke-linecap: round;
        stroke-dasharray: 251;
        transition: stroke-dashoffset 0.2s ease;
    }

    .ring-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 16px;
        font-weight: 600;
        color: var(--gold);
        font-family: 'Courier Prime', monospace;
    }

    /* Success state - Kintsugi: the gold repair */
    .success-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-sm);
    }

    .identity-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: var(--space-xs) var(--space-md);
        background: linear-gradient(
            135deg,
            rgba(197, 160, 89, 0.12) 0%,
            rgba(197, 160, 89, 0.08) 100%
        );
        border: 1px solid rgba(197, 160, 89, 0.25);
        border-radius: 20px;
        backdrop-filter: blur(4px);
        
        /* Kintsugi glow */
        box-shadow: 
            0 0 20px rgba(197, 160, 89, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
    }

    .identity-prefix {
        font-size: 12px;
        color: var(--gold);
        font-family: 'Courier Prime', monospace;
    }

    .identity-short {
        font-size: 14px;
        font-weight: 600;
        color: var(--text);
        font-family: 'Courier Prime', monospace;
    }

    .unlock-time {
        font-size: 12px;
        color: var(--text-muted);
    }

    /* Guidance - Yohaku no bi: beauty of margins */
    .guidance {
        font-size: 13px;
        color: var(--text-muted);
        max-width: 280px;
        line-height: 1.6;
        letter-spacing: 0.01em;
        opacity: 0.8;
        
        /* Subtle separator dots */
        text-align: center;
    }

    /* Retry button - Shibui: understated elegance */
    .retry-btn {
        padding: var(--space-sm) var(--space-lg);
        background: transparent;
        border: 1px solid var(--accent);
        border-radius: 20px;
        color: var(--accent);
        font-size: 14px;
        font-weight: 400;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.42, 0, 0.58, 1);
        letter-spacing: 0.02em;
    }

    .retry-btn:hover {
        background: var(--accent);
        color: var(--bg);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(102, 153, 204, 0.25);
    }

    /* Heart indicator - subtle life sign */
    .heart-indicator {
        position: absolute;
        bottom: var(--space-md);
        right: var(--space-md);
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: var(--text-muted);
        opacity: 0.6;
    }

    .heart {
        color: #e57373;  /* Softer red - Akane */
        animation: gentle-heartbeat 1.2s ease-in-out infinite;
    }

    /* Slower, gentler heartbeat */
    @keyframes gentle-heartbeat {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.15); opacity: 1; }
    }

    .bpm {
        font-family: 'Courier Prime', monospace;
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
        .phase-icon.pulse,
        .heart {
            animation: none;
        }
        .progress-fill,
        .ring-fill {
            transition: none;
        }
    }

    /* Mobile */
    @media (max-width: 480px) {
        .phase-icon {
            font-size: 36px;
        }
        .phase-message {
            font-size: 16px;
        }
        .guidance {
            font-size: 12px;
        }
    }
</style>
