/**
 * MEDIAPIPE FACEMESH INTEGRATION
 * ==============================
 *
 * Integrates MediaPipe FaceMesh for 468 facial landmark detection.
 * Enables precise ROI extraction for PPG and micro-expression analysis.
 *
 * Capabilities:
 *   - 468 facial landmarks in 3D
 *   - Precise forehead/cheek ROI for PPG
 *   - Blink detection
 *   - Micro-expression coherence
 *   - Gesture detection (nod, shake, smile)
 *
 * @author Asymmetrica Research Laboratory
 * @founded December 8th, 2025
 */

import { logger } from '$lib/utils/logger';

/**
 * FaceMesh landmark indices for key regions
 */
export const LANDMARK_REGIONS = {
    // Forehead region (best for PPG)
    FOREHEAD: [10, 67, 69, 104, 108, 109, 151, 299, 297, 333, 337, 338],
    
    // Left cheek
    LEFT_CHEEK: [50, 101, 116, 117, 118, 119, 123, 147, 187, 205, 206, 207],
    
    // Right cheek
    RIGHT_CHEEK: [280, 330, 345, 346, 347, 348, 352, 376, 411, 425, 426, 427],
    
    // Left eye
    LEFT_EYE: [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246],
    
    // Right eye
    RIGHT_EYE: [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398],
    
    // Left eyebrow
    LEFT_EYEBROW: [70, 63, 105, 66, 107, 55, 65, 52, 53, 46],
    
    // Right eyebrow
    RIGHT_EYEBROW: [300, 293, 334, 296, 336, 285, 295, 282, 283, 276],
    
    // Lips outer
    LIPS_OUTER: [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185],
    
    // Lips inner
    LIPS_INNER: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191],
    
    // Nose
    NOSE: [1, 2, 98, 327, 168, 6, 197, 195, 5, 4, 19, 94, 370],
    
    // Face oval
    FACE_OVAL: [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
};

/**
 * Eye aspect ratio threshold for blink detection
 */
const EAR_THRESHOLD = 0.21;
const BLINK_CONSEC_FRAMES = 2;

/**
 * FaceMesh Integration Class
 */
export class FaceMeshIntegration {
    constructor(config = {}) {
        this.config = {
            maxFaces: config.maxFaces || 1,
            refineLandmarks: config.refineLandmarks !== false,
            minDetectionConfidence: config.minDetectionConfidence || 0.5,
            minTrackingConfidence: config.minTrackingConfidence || 0.5,
            ...config
        };

        // MediaPipe instances
        this.faceMesh = null;
        this.camera = null;

        // State
        this.initialized = false;
        this.landmarks = null;
        this.faceDetected = false;

        // Blink detection
        this.blinkCounter = 0;
        this.totalBlinks = 0;
        this.blinkFrameCounter = 0;
        this.lastBlinkTime = 0;
        this.blinkRate = 0;  // Blinks per minute

        // Expression tracking
        this.expressionHistory = [];
        this.microExpressionCoherence = 0;

        // Gesture detection
        this.headPoseHistory = [];
        this.lastGesture = null;
        this.gestureConfidence = 0;

        // Callbacks
        this.onResults = null;
        this.onBlink = null;
        this.onGesture = null;
    }

    /**
     * Initialize MediaPipe FaceMesh
     * Loads the model dynamically
     */
    async initialize() {
        try {
            // Dynamic import of MediaPipe
            const { FaceMesh } = await import('@mediapipe/face_mesh');
            
            this.faceMesh = new FaceMesh({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
                }
            });

            this.faceMesh.setOptions({
                maxNumFaces: this.config.maxFaces,
                refineLandmarks: this.config.refineLandmarks,
                minDetectionConfidence: this.config.minDetectionConfidence,
                minTrackingConfidence: this.config.minTrackingConfidence
            });

            this.faceMesh.onResults((results) => this.processResults(results));

            this.initialized = true;
            return true;
        } catch (error) {
            logger.warn('FaceMesh: Could not load MediaPipe, using fallback', { error: error.message });
            this.initialized = false;
            return false;
        }
    }

    /**
     * Process video frame
     * @param {HTMLVideoElement} video - Video element
     */
    async processFrame(video) {
        if (!this.initialized || !this.faceMesh) {
            return null;
        }

        try {
            await this.faceMesh.send({ image: video });
            return this.getState();
        } catch (error) {
            logger.warn('FaceMesh: Frame processing error', { error: error.message });
            return null;
        }
    }

    /**
     * Process FaceMesh results
     */
    processResults(results) {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            this.landmarks = results.multiFaceLandmarks[0];
            this.faceDetected = true;

            // Process blink detection
            this.detectBlink();

            // Process micro-expressions
            this.analyzeExpressions();

            // Process head pose for gestures
            this.detectGestures();

            // Callback
            if (this.onResults) {
                this.onResults(this.getState());
            }
        } else {
            this.faceDetected = false;
            this.landmarks = null;
        }
    }

    /**
     * Get ROI for PPG extraction
     * Returns bounding box for forehead region
     */
    getPPGRegion() {
        if (!this.landmarks) {
            return null;
        }

        // Get forehead landmarks
        const foreheadPoints = LANDMARK_REGIONS.FOREHEAD.map(i => this.landmarks[i]);
        
        // Calculate bounding box
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        for (const point of foreheadPoints) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            landmarks: foreheadPoints
        };
    }

    /**
     * Get cheek regions for additional PPG
     */
    getCheekRegions() {
        if (!this.landmarks) {
            return null;
        }

        const getRegion = (indices) => {
            const points = indices.map(i => this.landmarks[i]);
            let minX = 1, maxX = 0, minY = 1, maxY = 0;
            for (const point of points) {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            }
            return { x: minX, y: minY, width: maxX - minX, height: maxY - minY, landmarks: points };
        };

        return {
            left: getRegion(LANDMARK_REGIONS.LEFT_CHEEK),
            right: getRegion(LANDMARK_REGIONS.RIGHT_CHEEK)
        };
    }

    /**
     * Detect blinks using Eye Aspect Ratio (EAR)
     */
    detectBlink() {
        if (!this.landmarks) return;

        // Calculate EAR for both eyes
        const leftEAR = this.calculateEAR(LANDMARK_REGIONS.LEFT_EYE);
        const rightEAR = this.calculateEAR(LANDMARK_REGIONS.RIGHT_EYE);
        const avgEAR = (leftEAR + rightEAR) / 2;

        // Blink detection
        if (avgEAR < EAR_THRESHOLD) {
            this.blinkFrameCounter++;
        } else {
            if (this.blinkFrameCounter >= BLINK_CONSEC_FRAMES) {
                this.totalBlinks++;
                const now = Date.now();
                
                // Calculate blink rate
                if (this.lastBlinkTime > 0) {
                    const interval = (now - this.lastBlinkTime) / 1000;  // seconds
                    this.blinkRate = 60 / interval;  // blinks per minute
                }
                this.lastBlinkTime = now;

                if (this.onBlink) {
                    this.onBlink({
                        totalBlinks: this.totalBlinks,
                        blinkRate: this.blinkRate,
                        timestamp: now
                    });
                }
            }
            this.blinkFrameCounter = 0;
        }
    }

    /**
     * Calculate Eye Aspect Ratio
     */
    calculateEAR(eyeIndices) {
        if (!this.landmarks || eyeIndices.length < 6) return 1;

        const points = eyeIndices.map(i => this.landmarks[i]);
        
        // Vertical distances
        const v1 = this.distance(points[1], points[5]);
        const v2 = this.distance(points[2], points[4]);
        
        // Horizontal distance
        const h = this.distance(points[0], points[3]);

        // EAR formula
        return (v1 + v2) / (2.0 * h);
    }

    /**
     * Euclidean distance between two landmarks
     */
    distance(p1, p2) {
        return Math.sqrt(
            (p1.x - p2.x) ** 2 +
            (p1.y - p2.y) ** 2 +
            (p1.z - p2.z) ** 2
        );
    }

    /**
     * Analyze micro-expressions for coherence
     */
    analyzeExpressions() {
        if (!this.landmarks) return;

        // Calculate expression features
        const features = {
            // Mouth openness
            mouthOpen: this.calculateMouthOpenness(),
            // Eyebrow raise
            eyebrowRaise: this.calculateEyebrowRaise(),
            // Smile (lip corner distance)
            smile: this.calculateSmile(),
            // Eye openness
            eyeOpen: this.calculateEyeOpenness()
        };

        // Store in history
        this.expressionHistory.push({
            features,
            timestamp: Date.now()
        });

        // Keep last 90 frames (~3 seconds at 30fps)
        if (this.expressionHistory.length > 90) {
            this.expressionHistory.shift();
        }

        // Calculate coherence (stability of expressions)
        this.microExpressionCoherence = this.calculateExpressionCoherence();
    }

    /**
     * Calculate mouth openness
     */
    calculateMouthOpenness() {
        if (!this.landmarks) return 0;
        
        const top = this.landmarks[13];    // Upper lip center
        const bottom = this.landmarks[14]; // Lower lip center
        
        return this.distance(top, bottom);
    }

    /**
     * Calculate eyebrow raise
     */
    calculateEyebrowRaise() {
        if (!this.landmarks) return 0;
        
        // Distance from eyebrow to eye
        const leftBrow = this.landmarks[70];
        const leftEye = this.landmarks[159];
        const rightBrow = this.landmarks[300];
        const rightEye = this.landmarks[386];
        
        return (this.distance(leftBrow, leftEye) + this.distance(rightBrow, rightEye)) / 2;
    }

    /**
     * Calculate smile intensity
     */
    calculateSmile() {
        if (!this.landmarks) return 0;
        
        // Lip corner distance
        const leftCorner = this.landmarks[61];
        const rightCorner = this.landmarks[291];
        
        return this.distance(leftCorner, rightCorner);
    }

    /**
     * Calculate eye openness
     */
    calculateEyeOpenness() {
        const leftEAR = this.calculateEAR(LANDMARK_REGIONS.LEFT_EYE);
        const rightEAR = this.calculateEAR(LANDMARK_REGIONS.RIGHT_EYE);
        return (leftEAR + rightEAR) / 2;
    }

    /**
     * Calculate expression coherence from history
     */
    calculateExpressionCoherence() {
        if (this.expressionHistory.length < 10) return 0;

        // Calculate variance of each feature
        const features = ['mouthOpen', 'eyebrowRaise', 'smile', 'eyeOpen'];
        let totalVariance = 0;

        for (const feature of features) {
            const values = this.expressionHistory.map(e => e.features[feature]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
            totalVariance += variance;
        }

        // Lower variance = higher coherence
        const avgVariance = totalVariance / features.length;
        return Math.max(0, 1 - avgVariance * 100);
    }

    /**
     * Detect head gestures (nod, shake)
     */
    detectGestures() {
        if (!this.landmarks) return;

        // Get head pose from key landmarks
        const nose = this.landmarks[1];
        const leftEar = this.landmarks[234];
        const rightEar = this.landmarks[454];
        const forehead = this.landmarks[10];
        const chin = this.landmarks[152];

        // Calculate head angles
        const yaw = Math.atan2(rightEar.z - leftEar.z, rightEar.x - leftEar.x);
        const pitch = Math.atan2(chin.y - forehead.y, chin.z - forehead.z);
        const roll = Math.atan2(rightEar.y - leftEar.y, rightEar.x - leftEar.x);

        // Store in history
        this.headPoseHistory.push({
            yaw, pitch, roll,
            timestamp: Date.now()
        });

        // Keep last 30 frames (~1 second)
        if (this.headPoseHistory.length > 30) {
            this.headPoseHistory.shift();
        }

        // Detect gestures from pose changes
        if (this.headPoseHistory.length >= 15) {
            const gesture = this.analyzeHeadGesture();
            if (gesture && gesture !== this.lastGesture) {
                this.lastGesture = gesture;
                if (this.onGesture) {
                    this.onGesture({
                        type: gesture,
                        confidence: this.gestureConfidence,
                        timestamp: Date.now()
                    });
                }
            }
        }
    }

    /**
     * Analyze head pose history for gestures
     */
    analyzeHeadGesture() {
        if (this.headPoseHistory.length < 15) return null;

        const recent = this.headPoseHistory.slice(-15);
        
        // Calculate pitch and yaw changes
        let pitchChanges = 0;
        let yawChanges = 0;
        let pitchDirection = 0;
        let yawDirection = 0;

        for (let i = 1; i < recent.length; i++) {
            const pitchDiff = recent[i].pitch - recent[i - 1].pitch;
            const yawDiff = recent[i].yaw - recent[i - 1].yaw;

            if (Math.abs(pitchDiff) > 0.02) {
                pitchChanges++;
                pitchDirection += Math.sign(pitchDiff);
            }
            if (Math.abs(yawDiff) > 0.02) {
                yawChanges++;
                yawDirection += Math.sign(yawDiff);
            }
        }

        // Nod detection (vertical oscillation)
        if (pitchChanges > 4 && Math.abs(pitchDirection) < 3) {
            this.gestureConfidence = pitchChanges / 14;
            return 'nod';
        }

        // Shake detection (horizontal oscillation)
        if (yawChanges > 4 && Math.abs(yawDirection) < 3) {
            this.gestureConfidence = yawChanges / 14;
            return 'shake';
        }

        return null;
    }

    /**
     * Get current state
     */
    getState() {
        return {
            faceDetected: this.faceDetected,
            landmarks: this.landmarks,
            ppgRegion: this.getPPGRegion(),
            cheekRegions: this.getCheekRegions(),
            blink: {
                totalBlinks: this.totalBlinks,
                blinkRate: this.blinkRate,
                isBlinking: this.blinkFrameCounter >= BLINK_CONSEC_FRAMES
            },
            expression: {
                mouthOpen: this.calculateMouthOpenness(),
                eyebrowRaise: this.calculateEyebrowRaise(),
                smile: this.calculateSmile(),
                eyeOpen: this.calculateEyeOpenness(),
                coherence: this.microExpressionCoherence
            },
            gesture: {
                type: this.lastGesture,
                confidence: this.gestureConfidence
            }
        };
    }

    /**
     * Get presence signals for identity
     */
    getPresenceSignals() {
        if (!this.faceDetected) {
            return null;
        }

        return {
            blinkRate: this.blinkRate,
            expressionCoherence: this.microExpressionCoherence,
            smile: this.calculateSmile(),
            eyeOpenness: this.calculateEyeOpenness(),
            facePresent: this.faceDetected
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        if (this.faceMesh) {
            this.faceMesh.close();
            this.faceMesh = null;
        }
        this.initialized = false;
    }
}

/**
 * Create FaceMesh integration with fallback
 */
export async function createFaceMeshIntegration(config = {}) {
    const integration = new FaceMeshIntegration(config);
    const success = await integration.initialize();

    if (!success) {
        logger.warn('FaceMesh not available, bio-resonance will use basic face detection');
    }

    return integration;
}

export default {
    FaceMeshIntegration,
    createFaceMeshIntegration,
    LANDMARK_REGIONS
};
