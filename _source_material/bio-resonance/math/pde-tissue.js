/**
 * PDE TISSUE SYSTEM - Φ-Organism Evolution Engine
 * ================================================
 * 
 * Partial Differential Equation tissues that evolve the vision manifold.
 * Each tissue is a reaction-diffusion system on the quaternion field.
 * 
 * ∂Φ/∂t = DΔΦ + Σ wᵢ Uᵢ(Φ) + B(x,t)
 * 
 * Where:
 *   D = Diffusion tensor
 *   Δ = Laplacian (from hyperbolic metric)
 *   Uᵢ = Nonlinear reaction operators (biomimetic)
 *   B = External forcing (gestures, hum, coherence)
 * 
 * @author Asymmetrica Research Laboratory
 */

import { Quaternion, QuaternionField, PHI, SCHUMANN_RESONANCE } from './quaternion.js';

/**
 * Base PDE Tissue class
 * All tissues inherit from this
 */
export class PDETissue {
    constructor(name, width, height) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.field = new Float32Array(width * height);
        this.fieldPrev = new Float32Array(width * height);
        this.diffusionCoeff = 0.1;
        this.reactionStrength = 1.0;
        this.enabled = true;
    }

    /**
     * Get field value at position
     */
    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        return this.field[y * this.width + x];
    }

    /**
     * Set field value at position
     */
    set(x, y, value) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.field[y * this.width + x] = value;
        }
    }

    /**
     * Compute Laplacian at position (5-point stencil)
     */
    laplacian(x, y) {
        const center = this.get(x, y);
        const left = this.get(x - 1, y);
        const right = this.get(x + 1, y);
        const up = this.get(x, y - 1);
        const down = this.get(x, y + 1);
        return (left + right + up + down - 4 * center);
    }

    /**
     * Reaction term - override in subclasses
     */
    reaction(x, y, value) {
        return 0;
    }

    /**
     * External forcing term - override in subclasses
     */
    forcing(x, y, signals, gestures) {
        return 0;
    }

    /**
     * Evolution step
     * ∂Φ/∂t = DΔΦ + U(Φ) + B
     */
    step(dt, signals = {}, gestures = {}) {
        if (!this.enabled) return;

        // Swap buffers
        [this.field, this.fieldPrev] = [this.fieldPrev, this.field];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = y * this.width + x;
                const value = this.fieldPrev[idx];

                // Diffusion term: DΔΦ
                const diffusion = this.diffusionCoeff * this.laplacianPrev(x, y);

                // Reaction term: U(Φ)
                const reaction = this.reactionStrength * this.reaction(x, y, value);

                // Forcing term: B(x,t)
                const force = this.forcing(x, y, signals, gestures);

                // Euler integration
                this.field[idx] = value + dt * (diffusion + reaction + force);
            }
        }
    }

    /**
     * Laplacian on previous buffer
     */
    laplacianPrev(x, y) {
        const get = (px, py) => {
            if (px < 0 || px >= this.width || py < 0 || py >= this.height) return 0;
            return this.fieldPrev[py * this.width + px];
        };
        const center = get(x, y);
        return get(x - 1, y) + get(x + 1, y) + get(x, y - 1) + get(x, y + 1) - 4 * center;
    }

    /**
     * Get field energy
     */
    getEnergy() {
        let energy = 0;
        for (let i = 0; i < this.field.length; i++) {
            energy += this.field[i] * this.field[i];
        }
        return Math.sqrt(energy / this.field.length);
    }
}

/**
 * Vision Surface Tissue
 * Primary visual processing - edge detection, motion, salience
 */
export class VisionSurfaceTissue extends PDETissue {
    constructor(width, height) {
        super('VisionSurface', width, height);
        this.diffusionCoeff = 0.05;
        this.reactionStrength = 0.8;
        this.edgeThreshold = 0.1;
    }

    reaction(x, y, value) {
        // Bistable reaction: pushes toward 0 or 1
        // Creates sharp edges in the field
        return value * (1 - value) * (value - this.edgeThreshold);
    }

    forcing(x, y, signals, gestures) {
        let force = 0;

        // Luminance gradient drives the field
        if (signals.luminanceGradient) {
            const nx = x / this.width;
            const ny = y / this.height;
            const gradIdx = Math.floor(ny * signals.luminanceGradient.length);
            if (gradIdx < signals.luminanceGradient.length) {
                force += signals.luminanceGradient[gradIdx] * 0.1;
            }
        }

        // Motion detection
        if (signals.opticalFlow) {
            force += signals.opticalFlow * 0.2;
        }

        return force;
    }

    /**
     * Initialize from image luminance
     */
    initFromLuminance(luminanceArray, imgWidth, imgHeight) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const srcX = Math.floor(x * imgWidth / this.width);
                const srcY = Math.floor(y * imgHeight / this.height);
                const srcIdx = srcY * imgWidth + srcX;
                if (srcIdx < luminanceArray.length) {
                    this.set(x, y, luminanceArray[srcIdx]);
                }
            }
        }
    }
}

/**
 * Phi Organism Tissue
 * The core consciousness field - evolves via Φ ⊗ Φ dynamics
 */
export class PhiOrganismTissue extends PDETissue {
    constructor(width, height) {
        super('PhiOrganism', width, height);
        this.diffusionCoeff = 0.02;
        this.reactionStrength = 1.0;
        this.phi = PHI;
        this.coherenceTarget = 0.65;
    }

    reaction(x, y, value) {
        // Φ-organism dynamics: Φ ⊗ Φ (self-interaction)
        // Creates golden-ratio-based patterns
        const phi_term = value * value * this.phi;
        const damping = -value * 0.1;  // Prevent blowup
        return phi_term + damping;
    }

    forcing(x, y, signals, gestures) {
        let force = 0;

        // Coherence drives toward stability
        if (signals.coherence !== undefined) {
            const coherenceError = this.coherenceTarget - signals.coherence;
            force += coherenceError * 0.05;
        }

        // Heart rate creates rhythmic forcing
        if (signals.heartRate && signals.heartRate > 0) {
            const heartFreq = signals.heartRate / 60;  // Hz
            const phase = (Date.now() / 1000) * heartFreq * 2 * Math.PI;
            force += Math.sin(phase) * 0.02;
        }

        // Gesture intention field
        if (gestures.force) {
            const nx = x / this.width - 0.5;
            const ny = y / this.height - 0.5;
            const dist = Math.sqrt(nx * nx + ny * ny);
            force += gestures.force * Math.exp(-dist * 5) * 0.1;
        }

        return force;
    }

    /**
     * Get coherence from field state
     */
    getCoherence() {
        // Coherence = how uniform the field is
        let sum = 0, sumSq = 0;
        for (let i = 0; i < this.field.length; i++) {
            sum += this.field[i];
            sumSq += this.field[i] * this.field[i];
        }
        const mean = sum / this.field.length;
        const variance = sumSq / this.field.length - mean * mean;
        
        // Lower variance = higher coherence
        return Math.max(0, 1 - Math.sqrt(variance) * 2);
    }
}

/**
 * Resonance Tissue
 * Responds to audio/hum input - Schumann resonance coupling
 */
export class ResonanceTissue extends PDETissue {
    constructor(width, height) {
        super('Resonance', width, height);
        this.diffusionCoeff = 0.08;
        this.reactionStrength = 0.5;
        this.baseFrequency = SCHUMANN_RESONANCE;
        this.harmonics = [1, 2, 3, 5, 8];  // Fibonacci harmonics
    }

    reaction(x, y, value) {
        // Wave equation behavior
        return -value * 0.05;  // Damped oscillator
    }

    forcing(x, y, signals, gestures) {
        let force = 0;

        // Hum frequency coupling
        if (signals.humFrequency && signals.humAmplitude) {
            const t = Date.now() / 1000;
            
            // Sum of harmonics
            for (const h of this.harmonics) {
                const freq = signals.humFrequency * h;
                const phase = t * freq * 2 * Math.PI;
                force += Math.sin(phase) * signals.humAmplitude / h;
            }
            force *= 0.1;
        }

        // Spatial pattern from position
        const nx = x / this.width;
        const ny = y / this.height;
        const spatialPhase = (nx + ny) * Math.PI * 2;
        force *= (1 + 0.5 * Math.sin(spatialPhase));

        return force;
    }
}

/**
 * PDE Tissue Registry
 * Manages all tissues and coordinates evolution
 */
export class PDETissueRegistry {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.tissues = new Map();
        
        // Create default tissues
        this.register('vision', new VisionSurfaceTissue(width, height));
        this.register('phi', new PhiOrganismTissue(width, height));
        this.register('resonance', new ResonanceTissue(width, height));
    }

    /**
     * Register a tissue
     */
    register(name, tissue) {
        this.tissues.set(name, tissue);
    }

    /**
     * Get a tissue by name
     */
    get(name) {
        return this.tissues.get(name);
    }

    /**
     * Step all tissues
     */
    stepAll(dt, signals = {}, gestures = {}) {
        for (const tissue of this.tissues.values()) {
            tissue.step(dt, signals, gestures);
        }
    }

    /**
     * Get combined field (weighted sum of all tissues)
     */
    getCombinedField(weights = {}) {
        const combined = new Float32Array(this.width * this.height);
        let totalWeight = 0;

        for (const [name, tissue] of this.tissues) {
            const weight = weights[name] || 1.0;
            totalWeight += weight;
            
            for (let i = 0; i < combined.length; i++) {
                combined[i] += tissue.field[i] * weight;
            }
        }

        if (totalWeight > 0) {
            for (let i = 0; i < combined.length; i++) {
                combined[i] /= totalWeight;
            }
        }

        return combined;
    }

    /**
     * Get total energy across all tissues
     */
    getTotalEnergy() {
        let energy = 0;
        for (const tissue of this.tissues.values()) {
            energy += tissue.getEnergy();
        }
        return energy;
    }

    /**
     * Convert combined field to quaternion field
     * Maps scalar PDE field to S³ orientations
     */
    toQuaternionField() {
        const qField = new QuaternionField(this.width, this.height);
        const combined = this.getCombinedField();
        const phi = this.get('phi');
        const resonance = this.get('resonance');

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = y * this.width + x;
                
                // Map PDE values to quaternion components
                const v = combined[idx];
                const p = phi ? phi.field[idx] : 0;
                const r = resonance ? resonance.field[idx] : 0;

                // Create quaternion from field values
                // Using exponential map for smooth S³ embedding
                const angle = v * Math.PI;
                const axis = [
                    Math.cos(p * Math.PI),
                    Math.sin(p * Math.PI),
                    r
                ];
                
                qField.set(x, y, Quaternion.fromAxisAngle(axis, angle));
            }
        }

        return qField;
    }
}

export default {
    PDETissue,
    VisionSurfaceTissue,
    PhiOrganismTissue,
    ResonanceTissue,
    PDETissueRegistry
};
