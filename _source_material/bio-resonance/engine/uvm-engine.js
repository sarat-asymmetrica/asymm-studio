/**
 * UNIFIED VISION MANIFOLD ENGINE
 * ===============================
 *
 * The complete 8-layer pipeline that transforms a webcam
 * into a biomimetic hyperdimensional organism.
 *
 * Pipeline:
 *   Layer 1: Camera Input
 *   Layer 2: Mediapipe (hands, face, gestures)
 *   Layer 3: Signal Extraction (PPG, flow, hum, coherence)
 *   Layer 4: PDE Tissue Registry
 *   Layer 5: Quaternion Evolution
 *   Layer 6: Particle Universe (GPU)
 *   Layer 7: UI Panel
 *   Layer 8: Sovereign Identity
 *
 * M = (X, g, S, Φ, Q, Λ, W)
 *
 * @author Asymmetrica Research Laboratory
 */

import { logger } from '$lib/utils/logger';
import { Quaternion, QuaternionField, ThreeRegimeTracker, PHI } from '../math/quaternion.js';
import { PDETissueRegistry } from '../math/pde-tissue.js';
import { UnifiedSamplingSystem } from '../math/biomimetic-kernels.js';
import { UnifiedSignalExtractor } from '../signals/signal-extractor.js';
import { CoherenceGate, PresenceHashGenerator } from '../identity/sovereign.js';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

/**
 * Gesture Processor
 * Extracts intention fields from hand landmarks
 */
class GestureProcessor {
    constructor() {
        this.prevLandmarks = null;
        this.openness = 0;
        this.tension = 0;
        this.force = 0;
        this.focalPoint = { x: 0.5, y: 0.5 };
        this.velocity = { x: 0, y: 0 };
    }

    /**
     * Process hand landmarks
     * @param {Array} landmarks - 21 hand landmarks from Mediapipe
     */
    process(landmarks) {
        if (!landmarks || landmarks.length < 21) {
            return this.getState();
        }

        // Palm center (landmark 0)
        const palm = landmarks[0];
        
        // Fingertips (landmarks 4, 8, 12, 16, 20)
        const fingertips = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
        
        // Calculate openness (average distance from palm to fingertips)
        let totalDist = 0;
        for (const tip of fingertips) {
            const dx = tip.x - palm.x;
            const dy = tip.y - palm.y;
            const dz = (tip.z || 0) - (palm.z || 0);
            totalDist += Math.sqrt(dx * dx + dy * dy + dz * dz);
        }
        this.openness = totalDist / fingertips.length;

        // Calculate tension (variance in finger positions)
        const avgX = fingertips.reduce((a, b) => a + b.x, 0) / fingertips.length;
        const avgY = fingertips.reduce((a, b) => a + b.y, 0) / fingertips.length;
        let variance = 0;
        for (const tip of fingertips) {
            variance += (tip.x - avgX) ** 2 + (tip.y - avgY) ** 2;
        }
        this.tension = Math.sqrt(variance / fingertips.length);

        // Focal point (index finger tip)
        this.focalPoint = { x: landmarks[8].x, y: landmarks[8].y };

        // Velocity (if we have previous landmarks)
        if (this.prevLandmarks) {
            const prevPalm = this.prevLandmarks[0];
            this.velocity = {
                x: palm.x - prevPalm.x,
                y: palm.y - prevPalm.y
            };
            this.force = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
        }

        this.prevLandmarks = landmarks;
        return this.getState();
    }

    getState() {
        return {
            openness: this.openness,
            tension: this.tension,
            force: this.force,
            focalPoint: this.focalPoint,
            velocity: this.velocity
        };
    }
}

/**
 * Unified Vision Manifold Engine
 * The complete organism
 */
export class UVMEngine {
    constructor(config = {}) {
        // Configuration
        this.config = {
            width: config.width || 64,
            height: config.height || 64,
            targetFPS: config.targetFPS || 30,
            coherenceThreshold: config.coherenceThreshold || 0.65,
            unlockTime: config.unlockTime || 3.0,
            ...config
        };

        // State
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fps = 0;

        // Layer 1: Camera
        this.videoElement = null;
        this.canvasElement = null;
        this.ctx = null;
        this.stream = null;

        // Layer 2: Mediapipe (optional, loaded dynamically)
        this.handsDetector = null;
        this.faceLandmarker = null; // MediaPipe FaceLandmarker
        this.gestureProcessor = new GestureProcessor();
        this.gestures = {};

        // Layer 3: Signal Extraction
        this.signalExtractor = new UnifiedSignalExtractor();
        this.signals = {};

        // Layer 4: PDE Tissues
        this.tissueRegistry = new PDETissueRegistry(this.config.width, this.config.height);

        // Layer 5: Quaternion Field
        this.quaternionField = new QuaternionField(this.config.width, this.config.height);
        this.regimeTracker = new ThreeRegimeTracker();

        // Layer 6: Biomimetic Sampling
        this.samplingSystem = new UnifiedSamplingSystem();

        // Layer 7: UI State
        this.uiState = {
            coherence: 0,
            heartRate: 0,
            isUnlocked: false,
            unlockProgress: 0,
            status: 'initializing'
        };

        // Layer 8: Sovereign Identity
        this.coherenceGate = new CoherenceGate(
            this.config.coherenceThreshold,
            this.config.unlockTime
        );

        // Callbacks
        this.onFrame = null;
        this.onSignals = null;
        this.onUnlock = null;
        this.onLock = null;
        this.onError = null;

        // Bind coherence gate callbacks
        this.coherenceGate.onUnlock = (identity) => {
            this.uiState.isUnlocked = true;
            this.uiState.status = 'unlocked';
            if (this.onUnlock) this.onUnlock(identity);
        };

        this.coherenceGate.onLock = () => {
            this.uiState.isUnlocked = false;
            this.uiState.status = 'locked';
            if (this.onLock) this.onLock();
        };
    }

    /**
     * Initialize the engine
     */
    async initialize(videoElement, canvasElement) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.ctx = canvasElement.getContext('2d', { willReadFrequently: true });

        // Initialize MediaPipe FaceLandmarker with timeout
        // This can hang on slow networks, so we use a 10-second timeout
        try {
            const mediaPipePromise = (async () => {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
                );
                return await FaceLandmarker.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1  // Only need 1 face for auth
                });
            })();

            // Race against timeout
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('MediaPipe load timeout')), 10000)
            );

            this.faceLandmarker = await Promise.race([mediaPipePromise, timeoutPromise]);
        } catch (error) {
            logger.warn('MediaPipe not available, using fallback mode', { error: error.message });
            // Continue without face tracking (fallback mode works fine!)
            this.faceLandmarker = null;
        }

        // Request camera
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: false  // Can enable for hum detection
            });

            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();

            // Set canvas size
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;

            this.uiState.status = 'ready';
            return true;
        } catch (error) {
            this.uiState.status = 'error';
            if (this.onError) this.onError(error);
            throw error;
        }
    }

    /**
     * Start the engine loop
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.uiState.status = 'running';
        this.lastFrameTime = performance.now();
        this.loop();
    }

    /**
     * Stop the engine
     */
    stop() {
        this.isRunning = false;
        this.uiState.status = 'stopped';
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }

    /**
     * Main loop
     */
    loop() {
        if (!this.isRunning) return;

        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        // FPS calculation
        this.frameCount++;
        if (this.frameCount % 30 === 0) {
            this.fps = 1 / dt;
        }

        // Process frame (don't await - let it run async but catch errors)
        this.processFrame(dt, now).catch(err => {
            logger.exception(err, { context: 'UVMEngine.animate' });
        });

        // Schedule next frame
        requestAnimationFrame(() => this.loop());
    }

    /**
     * Process a single frame through all layers
     */
    async processFrame(dt, timestamp) {
        if (!this.videoElement || this.videoElement.paused || this.videoElement.ended) {
            return;
        }

        // Layer 1: Capture frame
        this.ctx.drawImage(this.videoElement, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);

        // Layer 2: Face & Gesture processing
        let principalFaceLandmarks = null;
        
        if (this.faceLandmarker) {
            const results = this.faceLandmarker.detectForVideo(this.videoElement, timestamp);
            
            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                // Find principal face (largest bounding box)
                // Simplified: Just use the one with the widest spread in X (cheek to cheek)
                let maxWidth = -1;
                
                for (const landmarks of results.faceLandmarks) {
                    // Approximate width using landmarks 454 (left) and 234 (right)
                    const width = Math.abs(landmarks[454].x - landmarks[234].x);
                    
                    if (width > maxWidth) {
                        maxWidth = width;
                        principalFaceLandmarks = landmarks;
                    }
                }
            }
        }
        
        // Note: Hand gesture integration would go here
        this.gestures = this.gestureProcessor.getState();

        // Layer 3: Signal extraction (with ROI Locking)
        this.signals = this.signalExtractor.extract(imageData, principalFaceLandmarks);

        // Update UI state
        this.uiState.coherence = this.signals.coherence?.coherence || 0;
        this.uiState.heartRate = this.signals.ppg?.bpm || 0;
        this.uiState.unlockProgress = this.signals.coherence?.stableTime / this.config.unlockTime || 0;

        // Layer 4: Update biomimetic weights based on signals
        this.samplingSystem.updateWeights({
            luminance: this.signals.luminance,
            motionMagnitude: this.signals.motionMagnitude,
            colorComplexity: this.signals.colorComplexity
        });

        // Apply biomimetic sampling
        const sampledField = this.samplingSystem.apply(imageData);

        // Initialize vision tissue from sampled field
        const visionTissue = this.tissueRegistry.get('vision');
        if (visionTissue) {
            for (let i = 0; i < sampledField.length; i++) {
                visionTissue.field[i] = sampledField[i];
            }
        }

        // Layer 5: PDE tissue evolution
        this.tissueRegistry.stepAll(dt, this.signals, this.gestures);

        // Layer 6: Convert to quaternion field
        this.quaternionField = this.tissueRegistry.toQuaternionField();

        // Update regime tracker
        const fieldValues = Array.from(this.tissueRegistry.getCombinedField());
        this.regimeTracker.update(fieldValues);

        // Layer 8: Coherence gate update
        const presenceVector = this.signalExtractor.getPresenceVector();
        const gateState = await this.coherenceGate.update(this.signals.coherence, presenceVector);
        
        this.uiState.isUnlocked = gateState.isUnlocked;
        this.uiState.unlockProgress = gateState.progress;

        // Callbacks
        if (this.onSignals) {
            this.onSignals(this.signals);
        }

        if (this.onFrame) {
            this.onFrame({
                quaternionField: this.quaternionField,
                signals: this.signals,
                gestures: this.gestures,
                uiState: this.uiState,
                regimes: {
                    r1: this.regimeTracker.r1,
                    r2: this.regimeTracker.r2,
                    r3: this.regimeTracker.r3
                },
                fps: this.fps,
                dt: dt
            });
        }
    }

    /**
     * Get current identity (if unlocked)
     */
    getIdentity() {
        if (!this.coherenceGate.isUnlocked) {
            return null;
        }
        return this.coherenceGate.identity?.exportPublic() || null;
    }

    /**
     * Issue capability token (if unlocked)
     */
    async issueCapability(resource, action, expiryMs = 3600000) {
        return await this.coherenceGate.issueCapability(resource, action, expiryMs);
    }

    /**
     * Get engine state for debugging
     */
    getState() {
        return {
            isRunning: this.isRunning,
            fps: this.fps,
            frameCount: this.frameCount,
            signals: this.signals,
            gestures: this.gestures,
            uiState: this.uiState,
            regimes: {
                r1: this.regimeTracker.r1,
                r2: this.regimeTracker.r2,
                r3: this.regimeTracker.r3,
                singularityRisk: this.regimeTracker.getSingularityRisk()
            },
            tissueEnergy: this.tissueRegistry.getTotalEnergy(),
            fieldEnergy: this.quaternionField.computeEnergy(),
            curvature: this.samplingSystem.getCombinedCurvature()
        };
    }

    /**
     * Get quaternion at position (for particle rendering)
     */
    getQuaternionAt(x, y) {
        const qx = Math.floor(x * this.config.width);
        const qy = Math.floor(y * this.config.height);
        return this.quaternionField.get(qx, qy);
    }

    /**
     * Get field gradient at position (for particle velocity)
     */
    getGradientAt(x, y) {
        const combined = this.tissueRegistry.getCombinedField();
        const w = this.config.width;
        const h = this.config.height;
        const px = Math.floor(x * w);
        const py = Math.floor(y * h);
        const idx = py * w + px;

        // Central difference gradient
        const left = px > 0 ? combined[idx - 1] : combined[idx];
        const right = px < w - 1 ? combined[idx + 1] : combined[idx];
        const up = py > 0 ? combined[idx - w] : combined[idx];
        const down = py < h - 1 ? combined[idx + w] : combined[idx];

        return {
            x: (right - left) / 2,
            y: (down - up) / 2
        };
    }
}

/**
 * Create and configure UVM Engine instance
 */
export function createUVMEngine(config = {}) {
    return new UVMEngine(config);
}

export default {
    UVMEngine,
    createUVMEngine,
    GestureProcessor
};
