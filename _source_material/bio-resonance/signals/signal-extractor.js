/**
 * SIGNAL EXTRACTION LAYER
 * =======================
 * 
 * The sensory nervous system of the Bio-Resonance organism.
 * Extracts biological signals from webcam feed.
 * 
 * Signals:
 *   - PPG (Photoplethysmography) → Heart rate, HRV
 *   - Noise floor → Emotional baseline jitter
 *   - Luminance variance → Micro-expression signature
 *   - Optical flow → Motion/breath detection
 *   - Hum detection → Resonance frequency
 *   - Coherence → Stability score
 * 
 * @author Asymmetrica Research Laboratory
 */

import { ThreeRegimeTracker, SCHUMANN_RESONANCE } from '../math/quaternion.js';

/**
 * PPG (Photoplethysmography) Extractor
 * Detects heart rate from green channel variations
 */
export class PPGExtractor {
    constructor(sampleRate = 30, bufferSeconds = 4) {
        this.sampleRate = sampleRate;
        this.bufferSize = sampleRate * bufferSeconds;
        this.buffer = [];
        this.bpm = 0;
        this.variance = 0;
        this.confidence = 0;
        
        // Bandpass filter coefficients (0.7-4 Hz for heart rate)
        this.lowCutoff = 0.7;  // 42 BPM min
        this.highCutoff = 4.0; // 240 BPM max
    }

    /**
     * Update extractor with new frame data
     * @param {ImageData} imageData 
     * @param {Object} landmarks - Optional: FaceMesh landmarks
     */
    update(imageData, landmarks) {
        const { width, height, data } = imageData;
        let roiX, roiY, roiW, roiH;

        if (landmarks) {
            // Dynamic ROI: Forehead
            // Points: 103 (L), 332 (R), 10 (Top), 151 (Bot/Glabella)
            // Safety check for indices
            const pL = landmarks[103];
            const pR = landmarks[332];
            const pT = landmarks[10];
            const pB = landmarks[151];

            if (pL && pR && pT && pB) {
                const minX = Math.min(pL.x, pR.x, pT.x, pB.x) * width;
                const maxX = Math.max(pL.x, pR.x, pT.x, pB.x) * width;
                const minY = Math.min(pL.y, pR.y, pT.y, pB.y) * height;
                const maxY = Math.max(pL.y, pR.y, pT.y, pB.y) * height;

                roiX = Math.floor(Math.max(0, minX));
                roiY = Math.floor(Math.max(0, minY));
                roiW = Math.floor(Math.min(width - roiX, maxX - minX));
                roiH = Math.floor(Math.min(height - roiY, maxY - minY));
            }
        }

        // Fallback or invalid landmarks
        if (!roiW || !roiH) {
            roiX = Math.floor(width * 0.4);
            roiY = Math.floor(height * 0.1);
            roiW = Math.floor(width * 0.2);
            roiH = Math.floor(height * 0.15);
        }

        // Extract average green
        let greenSum = 0, count = 0;
        for (let y = roiY; y < roiY + roiH; y++) {
            for (let x = roiX; x < roiX + roiW; x++) {
                const idx = (y * width + x) * 4;
                greenSum += data[idx + 1];
                count++;
            }
        }

        if (count > 0) {
            this.addSample(greenSum / count);
        }

        return this.process();
    }

    /**
     * Add sample from ROI (Region of Interest)
     * @param {number} greenAvg - Average green channel value in ROI
     */
    addSample(greenAvg) {
        this.buffer.push(greenAvg);
        if (this.buffer.length > this.bufferSize) {
            this.buffer.shift();
        }
    }

    /**
     * Process buffer and extract heart rate
     */
    process() {
        if (this.buffer.length < this.bufferSize * 0.5) {
            return { bpm: 0, variance: 0, confidence: 0 };
        }

        // Detrend signal (remove DC component)
        const detrended = this.detrend(this.buffer);
        
        // Apply bandpass filter
        const filtered = this.bandpassFilter(detrended);
        
        // Find peaks using zero-crossing detection
        const peaks = this.findPeaks(filtered);
        
        // Calculate BPM from peak intervals
        if (peaks.length >= 2) {
            const intervals = [];
            for (let i = 1; i < peaks.length; i++) {
                intervals.push(peaks[i] - peaks[i - 1]);
            }
            
            // Average interval in samples
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            
            // Convert to BPM
            this.bpm = (this.sampleRate / avgInterval) * 60;
            
            // Clamp to reasonable range
            if (this.bpm < 40 || this.bpm > 200) {
                this.bpm = 0;
                this.confidence = 0;
            } else {
                // Calculate HRV (variance of intervals)
                const avgMs = avgInterval * (1000 / this.sampleRate);
                let varianceSum = 0;
                for (const interval of intervals) {
                    const ms = interval * (1000 / this.sampleRate);
                    varianceSum += (ms - avgMs) * (ms - avgMs);
                }
                this.variance = Math.sqrt(varianceSum / intervals.length);
                
                // Confidence based on consistency
                const cv = this.variance / avgMs;  // Coefficient of variation
                this.confidence = Math.max(0, 1 - cv * 2);
            }
        }

        return {
            bpm: this.bpm,
            variance: this.variance,
            confidence: this.confidence
        };
    }

    /**
     * Remove linear trend from signal
     */
    detrend(signal) {
        const n = signal.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += signal[i];
            sumXY += i * signal[i];
            sumXX += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return signal.map((v, i) => v - (slope * i + intercept));
    }

    /**
     * Simple bandpass filter using moving average
     */
    bandpassFilter(signal) {
        // High-pass (remove slow drift)
        const highPassWindow = Math.floor(this.sampleRate / this.lowCutoff);
        const highPassed = this.movingAverageSubtract(signal, highPassWindow);
        
        // Low-pass (remove high frequency noise)
        const lowPassWindow = Math.floor(this.sampleRate / this.highCutoff);
        return this.movingAverage(highPassed, Math.max(2, lowPassWindow));
    }

    movingAverage(signal, window) {
        const result = [];
        for (let i = 0; i < signal.length; i++) {
            let sum = 0, count = 0;
            for (let j = Math.max(0, i - window); j <= Math.min(signal.length - 1, i + window); j++) {
                sum += signal[j];
                count++;
            }
            result.push(sum / count);
        }
        return result;
    }

    movingAverageSubtract(signal, window) {
        const ma = this.movingAverage(signal, window);
        return signal.map((v, i) => v - ma[i]);
    }

    /**
     * Find peaks in signal
     */
    findPeaks(signal) {
        const peaks = [];
        const threshold = this.getAdaptiveThreshold(signal);
        
        for (let i = 2; i < signal.length - 2; i++) {
            if (signal[i] > threshold &&
                signal[i] > signal[i - 1] &&
                signal[i] > signal[i + 1] &&
                signal[i] > signal[i - 2] &&
                signal[i] > signal[i + 2]) {
                peaks.push(i);
            }
        }
        
        return peaks;
    }

    getAdaptiveThreshold(signal) {
        const sorted = [...signal].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length * 0.7)];  // 70th percentile
    }
}

/**
 * Optical Flow Extractor
 * Detects motion patterns for breath and movement
 */
export class OpticalFlowExtractor {
    constructor(gridSize = 8) {
        this.gridSize = gridSize;
        this.prevFrame = null;
        this.flowMagnitude = 0;
        this.flowDirection = 0;
        this.breathPattern = [];
    }

    /**
     * Compute optical flow from frame
     * @param {Float32Array} luminance - Current frame luminance
     * @param {number} width - Frame width
     * @param {number} height - Frame height
     */
    compute(luminance, width, height) {
        if (!this.prevFrame) {
            this.prevFrame = luminance.slice();
            return { magnitude: 0, direction: 0, breathSignal: 0 };
        }

        let totalFlowX = 0, totalFlowY = 0, count = 0;
        const cellW = Math.floor(width / this.gridSize);
        const cellH = Math.floor(height / this.gridSize);

        // Compute flow for each grid cell
        for (let gy = 0; gy < this.gridSize; gy++) {
            for (let gx = 0; gx < this.gridSize; gx++) {
                let flowX = 0, flowY = 0, cellCount = 0;

                for (let y = gy * cellH + 1; y < (gy + 1) * cellH - 1 && y < height - 1; y++) {
                    for (let x = gx * cellW + 1; x < (gx + 1) * cellW - 1 && x < width - 1; x++) {
                        const idx = y * width + x;

                        // Spatial gradients
                        const Ix = (luminance[idx + 1] - luminance[idx - 1]) / 2;
                        const Iy = (luminance[idx + width] - luminance[idx - width]) / 2;
                        
                        // Temporal gradient
                        const It = luminance[idx] - this.prevFrame[idx];

                        // Lucas-Kanade style flow estimation
                        const denom = Ix * Ix + Iy * Iy + 0.001;
                        flowX -= (Ix * It) / denom;
                        flowY -= (Iy * It) / denom;
                        cellCount++;
                    }
                }

                if (cellCount > 0) {
                    totalFlowX += flowX / cellCount;
                    totalFlowY += flowY / cellCount;
                    count++;
                }
            }
        }

        if (count > 0) {
            totalFlowX /= count;
            totalFlowY /= count;
        }

        this.flowMagnitude = Math.sqrt(totalFlowX * totalFlowX + totalFlowY * totalFlowY);
        this.flowDirection = Math.atan2(totalFlowY, totalFlowX);

        // Track vertical flow for breath detection
        this.breathPattern.push(totalFlowY);
        if (this.breathPattern.length > 90) {  // ~3 seconds at 30fps
            this.breathPattern.shift();
        }

        // Breath signal from vertical oscillation
        const breathSignal = this.detectBreathCycle();

        this.prevFrame = luminance.slice();

        return {
            magnitude: this.flowMagnitude,
            direction: this.flowDirection,
            breathSignal: breathSignal
        };
    }

    detectBreathCycle() {
        if (this.breathPattern.length < 30) return 0;

        // Simple breath detection: look for periodic vertical motion
        let zeroCrossings = 0;
        for (let i = 1; i < this.breathPattern.length; i++) {
            if ((this.breathPattern[i] > 0) !== (this.breathPattern[i - 1] > 0)) {
                zeroCrossings++;
            }
        }

        // Breath rate ~12-20 per minute = 0.2-0.33 Hz
        // At 30fps, 3 seconds = 90 samples
        // Expected zero crossings for breath: 1-2 per 3 seconds
        const breathRate = zeroCrossings / 2;  // Full cycles
        return breathRate > 0.5 && breathRate < 3 ? 1 : 0;
    }
}

/**
 * Hum/Audio Frequency Detector
 * Detects humming for resonance coupling
 */
export class HumDetector {
    constructor(sampleRate = 44100, fftSize = 2048) {
        this.sampleRate = sampleRate;
        this.fftSize = fftSize;
        this.frequency = 0;
        this.amplitude = 0;
        this.isHumming = false;
        
        // Target frequencies (Schumann resonances + harmonics)
        this.targetFrequencies = [
            SCHUMANN_RESONANCE,      // 7.93 Hz (fundamental)
            14.3,                     // Second harmonic
            20.8,                     // Third harmonic
            27.3,                     // Fourth harmonic
            33.8                      // Fifth harmonic
        ];
    }

    /**
     * Analyze audio buffer for hum
     * @param {Float32Array} audioData - Audio samples
     */
    analyze(audioData) {
        if (!audioData || audioData.length < this.fftSize) {
            return { frequency: 0, amplitude: 0, isHumming: false };
        }

        // Simple DFT for dominant frequency
        const magnitudes = new Float32Array(this.fftSize / 2);
        
        for (let k = 0; k < this.fftSize / 2; k++) {
            let real = 0, imag = 0;
            for (let n = 0; n < this.fftSize; n++) {
                const angle = -2 * Math.PI * k * n / this.fftSize;
                real += audioData[n] * Math.cos(angle);
                imag += audioData[n] * Math.sin(angle);
            }
            magnitudes[k] = Math.sqrt(real * real + imag * imag);
        }

        // Find peak frequency
        let maxMag = 0, maxIdx = 0;
        for (let k = 1; k < magnitudes.length; k++) {
            if (magnitudes[k] > maxMag) {
                maxMag = magnitudes[k];
                maxIdx = k;
            }
        }

        this.frequency = maxIdx * this.sampleRate / this.fftSize;
        this.amplitude = maxMag / this.fftSize;
        
        // Check if humming (sustained tone above threshold)
        this.isHumming = this.amplitude > 0.01 && this.frequency > 50 && this.frequency < 500;

        return {
            frequency: this.frequency,
            amplitude: this.amplitude,
            isHumming: this.isHumming,
            resonanceMatch: this.getResonanceMatch()
        };
    }

    /**
     * Check how close hum is to target resonance frequencies
     */
    getResonanceMatch() {
        if (!this.isHumming) return 0;

        let bestMatch = 0;
        for (const target of this.targetFrequencies) {
            // Check fundamental and harmonics
            for (let harmonic = 1; harmonic <= 8; harmonic++) {
                const targetFreq = target * harmonic;
                const diff = Math.abs(this.frequency - targetFreq);
                const match = Math.exp(-diff * diff / 100);  // Gaussian match
                bestMatch = Math.max(bestMatch, match);
            }
        }

        return bestMatch;
    }
}

/**
 * Coherence Calculator
 * Computes overall system coherence from all signals
 */
export class CoherenceCalculator {
    constructor() {
        this.regimeTracker = new ThreeRegimeTracker();
        this.history = [];
        this.coherence = 0;
        this.stableTime = 0;
        this.lastUpdate = Date.now();
    }

    /**
     * Update coherence from all signals
     * @param {Object} signals - All extracted signals
     */
    update(signals) {
        const now = Date.now();
        const dt = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        // Collect signal values for regime tracking
        const values = [];
        
        if (signals.ppg?.confidence > 0.3) {
            values.push(signals.ppg.bpm / 100);  // Normalized BPM
            values.push(signals.ppg.variance / 50);  // Normalized HRV
        }
        
        if (signals.flow) {
            values.push(signals.flow.magnitude);
            values.push(signals.flow.breathSignal);
        }
        
        if (signals.hum?.isHumming) {
            values.push(signals.hum.resonanceMatch);
        }

        // Update regime tracker
        if (values.length > 0) {
            this.regimeTracker.update(values);
        }

        // Compute coherence from multiple factors
        let coherenceSum = 0;
        let weightSum = 0;

        // PPG confidence contributes to coherence (if available)
        if (signals.ppg && signals.ppg.confidence > 0) {
            coherenceSum += signals.ppg.confidence * 0.25;
            weightSum += 0.25;
        }

        // Regime convergence
        const regimeCoherence = this.regimeTracker.getCoherence();
        coherenceSum += regimeCoherence * 0.25;
        weightSum += 0.25;

        // Low motion = higher coherence (stillness)
        // This is the primary signal when PPG isn't ready yet
        if (signals.flow) {
            const stillness = Math.max(0, 1 - signals.flow.magnitude * 3);
            coherenceSum += stillness * 0.3;
            weightSum += 0.3;
        } else {
            // Default stillness if no flow data
            coherenceSum += 0.6 * 0.3;
            weightSum += 0.3;
        }

        // Face detection bonus (if we have landmarks, face is detected)
        // This helps bootstrap coherence before PPG kicks in
        if (signals.faceDetected) {
            coherenceSum += 0.7 * 0.2;
            weightSum += 0.2;
        } else {
            // Even without face detection, give some base coherence
            coherenceSum += 0.5 * 0.2;
            weightSum += 0.2;
        }

        // Resonance match from humming (bonus, not required)
        if (signals.hum?.isHumming) {
            coherenceSum += signals.hum.resonanceMatch * 0.1;
            weightSum += 0.1;
        }

        // Calculate final coherence
        this.coherence = weightSum > 0 ? coherenceSum / weightSum : 0.5;

        // Track stable time above threshold (use 0.5 as base - actual threshold checked in CoherenceGate)
        if (this.coherence > 0.5) {
            this.stableTime += dt;
        } else {
            this.stableTime = Math.max(0, this.stableTime - dt * 2);  // Decay faster
        }

        // Store history
        this.history.push({ coherence: this.coherence, timestamp: now });
        if (this.history.length > 300) {  // 10 seconds at 30fps
            this.history.shift();
        }

        return {
            coherence: this.coherence,
            stableTime: this.stableTime,
            regimes: {
                r1: this.regimeTracker.r1,
                r2: this.regimeTracker.r2,
                r3: this.regimeTracker.r3
            },
            singularityRisk: this.regimeTracker.getSingularityRisk(),
            isUnlockReady: this.stableTime >= 1.5 && this.coherence > 0.5
        };
    }

    /**
     * Get coherence trend (rising, falling, stable)
     */
    getTrend() {
        if (this.history.length < 30) return 'unknown';
        
        const recent = this.history.slice(-30);
        const older = this.history.slice(-60, -30);
        
        if (older.length === 0) return 'unknown';
        
        const recentAvg = recent.reduce((a, b) => a + b.coherence, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b.coherence, 0) / older.length;
        
        const diff = recentAvg - olderAvg;
        if (diff > 0.05) return 'rising';
        if (diff < -0.05) return 'falling';
        return 'stable';
    }
}

/**
 * Unified Signal Extractor
 * Coordinates all signal extraction
 */
export class UnifiedSignalExtractor {
    constructor() {
        this.ppg = new PPGExtractor();
        this.flow = new OpticalFlowExtractor();
        this.hum = new HumDetector();
        this.coherence = new CoherenceCalculator();
        
        this.signals = {
            ppg: null,
            flow: null,
            hum: null,
            coherence: null,
            luminance: 0,
            colorComplexity: 0,
            motionMagnitude: 0,
            faceDetected: false
        };
    }

    /**
     * Extract all signals from frame
     * @param {ImageData} imageData - Canvas ImageData
     * @param {Object} landmarks - Optional: FaceMesh landmarks (principal face)
     * @param {Float32Array} audioData - Optional: Audio samples
     */
    extract(imageData, landmarks = null, audioData = null) {
        const { width, height, data } = imageData;

        // Extract luminance and color info
        let lumSum = 0;
        let rSum = 0, gSum = 0, bSum = 0;
        const luminance = new Float32Array(width * height);

        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            const r = data[idx] / 255;
            const g = data[idx + 1] / 255;
            const b = data[idx + 2] / 255;
            
            const lum = r * 0.299 + g * 0.587 + b * 0.114;
            luminance[i] = lum;
            lumSum += lum;
            rSum += r;
            gSum += g;
            bSum += b;
        }

        const pixelCount = width * height;
        this.signals.luminance = lumSum / pixelCount;

        // Color complexity (variance between channels)
        const rAvg = rSum / pixelCount;
        const gAvg = gSum / pixelCount;
        const bAvg = bSum / pixelCount;
        this.signals.colorComplexity = Math.abs(rAvg - gAvg) + Math.abs(gAvg - bAvg) + Math.abs(bAvg - rAvg);

        // Track face detection status
        this.signals.faceDetected = landmarks !== null && landmarks.length > 0;

        // PPG extraction with dynamic ROI
        this.signals.ppg = this.ppg.update(imageData, landmarks);

        // Optical flow
        this.signals.flow = this.flow.compute(luminance, width, height);
        this.signals.motionMagnitude = this.signals.flow.magnitude;

        // Audio analysis
        if (audioData) {
            this.signals.hum = this.hum.analyze(audioData);
        }

        // Coherence calculation
        this.signals.coherence = this.coherence.update(this.signals);

        return this.signals;
    }

    /**
     * Get presence vector for identity hashing
     * This is the mathematical signature of the user's presence
     */
    getPresenceVector() {
        return [
            this.signals.ppg?.bpm || 0,
            this.signals.ppg?.variance || 0,
            this.signals.luminance,
            this.signals.colorComplexity,
            this.signals.flow?.magnitude || 0,
            this.signals.hum?.frequency || 0,
            this.signals.coherence?.coherence || 0
        ];
    }
}

export default {
    PPGExtractor,
    OpticalFlowExtractor,
    HumDetector,
    CoherenceCalculator,
    UnifiedSignalExtractor
};
