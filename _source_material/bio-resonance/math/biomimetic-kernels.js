/**
 * BIOMIMETIC SAMPLING KERNELS
 * ===========================
 * 
 * Animal vision systems unified into mathematical operators.
 * Each animal contributes a sampling kernel that extracts
 * different aspects of the visual field.
 * 
 * S_total = Σ wᵢ Sᵢ(I)
 * 
 * Animals:
 *   🦅 Eagle - Multi-fovea telephoto (high acuity)
 *   🦉 Owl - Low-light temporal accumulation
 *   🦐 Mantis Shrimp - Polarization inference
 *   🐸 Frog - Motion-only detection
 *   🐍 Viper - Thermal gradient (IR approximation)
 *   🪰 Dragonfly - Multi-tile optical flow
 * 
 * @author Asymmetrica Research Laboratory
 */

/**
 * Base Sampling Kernel
 */
export class SamplingKernel {
    constructor(name) {
        this.name = name;
        this.weight = 1.0;
        this.enabled = true;
    }

    /**
     * Apply kernel to image data
     * @param {ImageData} imageData - Canvas ImageData
     * @param {Object} context - Additional context (prev frame, etc.)
     * @returns {Float32Array} - Processed signal
     */
    apply(imageData, context = {}) {
        throw new Error('Subclass must implement apply()');
    }

    /**
     * Get curvature parameter for hyperbolic embedding
     */
    getCurvature() {
        return 0;  // Euclidean by default
    }
}

/**
 * 🦅 Eagle Vision Kernel
 * Multi-fovea Laplacian sampling for high acuity
 * Strong negative curvature (telephoto compression)
 */
export class EagleKernel extends SamplingKernel {
    constructor() {
        super('eagle');
        this.foveaCount = 2;  // Dual fovea
        this.acuityMultiplier = 8;  // 8x human acuity
    }

    apply(imageData, context = {}) {
        const { width, height, data } = imageData;
        const result = new Float32Array(width * height);

        // Multi-scale Laplacian (edge enhancement)
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Get luminance
                const center = this.getLuminance(data, idx);
                const left = this.getLuminance(data, idx - 4);
                const right = this.getLuminance(data, idx + 4);
                const up = this.getLuminance(data, idx - width * 4);
                const down = this.getLuminance(data, idx + width * 4);

                // Laplacian (edge detection)
                const laplacian = (left + right + up + down - 4 * center) * this.acuityMultiplier;
                
                // Dual fovea: enhanced center + peripheral
                const nx = x / width - 0.5;
                const ny = y / height - 0.5;
                const dist = Math.sqrt(nx * nx + ny * ny);
                const foveaWeight = Math.exp(-dist * 4) + 0.3 * Math.exp(-Math.abs(dist - 0.3) * 8);

                result[y * width + x] = Math.abs(laplacian) * foveaWeight;
            }
        }

        return result;
    }

    getLuminance(data, idx) {
        return (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
    }

    getCurvature() {
        return -2.0;  // Strong negative curvature (telephoto)
    }
}

/**
 * 🦉 Owl Vision Kernel
 * Low-light temporal accumulation
 * Weak negative curvature (soft focus)
 */
export class OwlKernel extends SamplingKernel {
    constructor() {
        super('owl');
        this.accumulationFrames = 8;
        this.frameBuffer = [];
    }

    apply(imageData, context = {}) {
        const { width, height, data } = imageData;
        const result = new Float32Array(width * height);

        // Current frame luminance
        const currentFrame = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            currentFrame[i] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
        }

        // Add to buffer
        this.frameBuffer.push(currentFrame);
        if (this.frameBuffer.length > this.accumulationFrames) {
            this.frameBuffer.shift();
        }

        // Temporal accumulation (photon collection)
        for (let i = 0; i < result.length; i++) {
            let sum = 0;
            for (const frame of this.frameBuffer) {
                sum += frame[i];
            }
            // Boost low values (rod cell behavior)
            const avg = sum / this.frameBuffer.length;
            result[i] = Math.pow(avg, 0.5);  // Gamma correction for low light
        }

        return result;
    }

    getCurvature() {
        return -0.5;  // Weak negative curvature
    }
}

/**
 * 🦐 Mantis Shrimp Kernel
 * Polarization inference from RGB gradients
 * Variable curvature (multiple channels)
 */
export class MantisKernel extends SamplingKernel {
    constructor() {
        super('mantis');
        this.colorChannels = 16;  // Mantis shrimp has 16 color receptors!
    }

    apply(imageData, context = {}) {
        const { width, height, data } = imageData;
        const result = new Float32Array(width * height);

        // Polarization inference via RGB gradients
        // ∂RGB/∂x and ∂RGB/∂y approximate polarization angle
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // RGB gradients
                const dRdx = data[idx + 4] - data[idx - 4];
                const dGdx = data[idx + 4 + 1] - data[idx - 4 + 1];
                const dBdx = data[idx + 4 + 2] - data[idx - 4 + 2];

                const dRdy = data[idx + width * 4] - data[idx - width * 4];
                const dGdy = data[idx + width * 4 + 1] - data[idx - width * 4 + 1];
                const dBdy = data[idx + width * 4 + 2] - data[idx - width * 4 + 2];

                // Polarization angle approximation
                const gradMag = Math.sqrt(
                    dRdx * dRdx + dGdx * dGdx + dBdx * dBdx +
                    dRdy * dRdy + dGdy * dGdy + dBdy * dBdy
                ) / 255;

                // Color complexity (how many distinct channels)
                const r = data[idx] / 255;
                const g = data[idx + 1] / 255;
                const b = data[idx + 2] / 255;
                const colorVar = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

                result[y * width + x] = gradMag * (1 + colorVar);
            }
        }

        return result;
    }

    getCurvature() {
        return -1.0;  // Variable curvature
    }
}

/**
 * 🐸 Frog Vision Kernel
 * Motion-only detection (high-pass temporal filter)
 * Euclidean (flat) curvature
 */
export class FrogKernel extends SamplingKernel {
    constructor() {
        super('frog');
        this.prevFrame = null;
        this.motionThreshold = 0.05;
    }

    apply(imageData, context = {}) {
        const { width, height, data } = imageData;
        const result = new Float32Array(width * height);

        // Current frame luminance
        const currentFrame = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            currentFrame[i] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
        }

        // Motion detection (frame difference)
        if (this.prevFrame) {
            for (let i = 0; i < result.length; i++) {
                const diff = Math.abs(currentFrame[i] - this.prevFrame[i]);
                // Frog only sees motion above threshold
                result[i] = diff > this.motionThreshold ? diff : 0;
            }
        }

        this.prevFrame = currentFrame;
        return result;
    }

    getCurvature() {
        return 0;  // Euclidean (flat)
    }
}

/**
 * 🐍 Viper Vision Kernel
 * Thermal gradient approximation from red channel
 * Medium negative curvature (radial focus)
 */
export class ViperKernel extends SamplingKernel {
    constructor() {
        super('viper');
        this.prevRedChannel = null;
    }

    apply(imageData, context = {}) {
        const { width, height, data } = imageData;
        const result = new Float32Array(width * height);

        // Extract red channel (closest to IR)
        const redChannel = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
            redChannel[i] = data[i * 4] / 255;
        }

        // Temporal red gradient (heat signature)
        if (this.prevRedChannel) {
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = y * width + x;

                    // Spatial gradient
                    const dRdx = redChannel[idx + 1] - redChannel[idx - 1];
                    const dRdy = redChannel[idx + width] - redChannel[idx - width];
                    const spatialGrad = Math.sqrt(dRdx * dRdx + dRdy * dRdy);

                    // Temporal gradient
                    const temporalGrad = Math.abs(redChannel[idx] - this.prevRedChannel[idx]);

                    // Combined thermal signature
                    result[idx] = spatialGrad + temporalGrad * 2;
                }
            }
        }

        this.prevRedChannel = redChannel;
        return result;
    }

    getCurvature() {
        return -1.5;  // Medium negative curvature
    }
}

/**
 * 🪰 Dragonfly Vision Kernel
 * Multi-tile optical flow for interception
 * Local variable curvature
 */
export class DragonflyKernel extends SamplingKernel {
    constructor() {
        super('dragonfly');
        this.tileSize = 16;
        this.prevFrame = null;
    }

    apply(imageData, context = {}) {
        const { width, height, data } = imageData;
        const result = new Float32Array(width * height);

        // Current frame luminance
        const currentFrame = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
            const idx = i * 4;
            currentFrame[i] = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
        }

        if (this.prevFrame) {
            // Tile-based optical flow
            const tilesX = Math.ceil(width / this.tileSize);
            const tilesY = Math.ceil(height / this.tileSize);

            for (let ty = 0; ty < tilesY; ty++) {
                for (let tx = 0; tx < tilesX; tx++) {
                    // Compute flow for this tile
                    let flowX = 0, flowY = 0, count = 0;

                    for (let dy = 0; dy < this.tileSize && ty * this.tileSize + dy < height; dy++) {
                        for (let dx = 0; dx < this.tileSize && tx * this.tileSize + dx < width; dx++) {
                            const x = tx * this.tileSize + dx;
                            const y = ty * this.tileSize + dy;
                            const idx = y * width + x;

                            if (x > 0 && x < width - 1 && y > 0 && y < height - 1) {
                                // Gradient-based flow estimation
                                const Ix = (currentFrame[idx + 1] - currentFrame[idx - 1]) / 2;
                                const Iy = (currentFrame[idx + width] - currentFrame[idx - width]) / 2;
                                const It = currentFrame[idx] - this.prevFrame[idx];

                                if (Math.abs(Ix) > 0.01) flowX -= It / Ix;
                                if (Math.abs(Iy) > 0.01) flowY -= It / Iy;
                                count++;
                            }
                        }
                    }

                    // Apply flow magnitude to tile
                    const flowMag = count > 0 ? Math.sqrt(flowX * flowX + flowY * flowY) / count : 0;

                    for (let dy = 0; dy < this.tileSize && ty * this.tileSize + dy < height; dy++) {
                        for (let dx = 0; dx < this.tileSize && tx * this.tileSize + dx < width; dx++) {
                            const x = tx * this.tileSize + dx;
                            const y = ty * this.tileSize + dy;
                            result[y * width + x] = Math.min(1, flowMag * 10);
                        }
                    }
                }
            }
        }

        this.prevFrame = currentFrame;
        return result;
    }

    getCurvature() {
        return -0.8;  // Local variable curvature
    }
}

/**
 * Unified Sampling System
 * Combines all animal kernels with dynamic weighting
 */
export class UnifiedSamplingSystem {
    constructor() {
        this.kernels = new Map();
        
        // Register all animal kernels
        this.register(new EagleKernel());
        this.register(new OwlKernel());
        this.register(new MantisKernel());
        this.register(new FrogKernel());
        this.register(new ViperKernel());
        this.register(new DragonflyKernel());

        // Dynamic weights
        this.weights = {
            eagle: 0.3,
            owl: 0.15,
            mantis: 0.15,
            frog: 0.2,
            viper: 0.1,
            dragonfly: 0.1
        };
    }

    register(kernel) {
        this.kernels.set(kernel.name, kernel);
    }

    /**
     * Apply all kernels and combine
     * S_total = Σ wᵢ Sᵢ(I)
     */
    apply(imageData, context = {}) {
        const { width, height } = imageData;
        const combined = new Float32Array(width * height);
        let totalWeight = 0;

        for (const [name, kernel] of this.kernels) {
            if (!kernel.enabled) continue;
            
            const weight = this.weights[name] || 1.0;
            totalWeight += weight;

            const result = kernel.apply(imageData, context);
            for (let i = 0; i < combined.length; i++) {
                combined[i] += result[i] * weight;
            }
        }

        // Normalize
        if (totalWeight > 0) {
            for (let i = 0; i < combined.length; i++) {
                combined[i] /= totalWeight;
            }
        }

        return combined;
    }

    /**
     * Update weights based on signals
     * Adaptive biomimetic switching
     */
    updateWeights(signals) {
        // Low light → boost owl
        if (signals.luminance !== undefined && signals.luminance < 0.3) {
            this.weights.owl = 0.4;
            this.weights.eagle = 0.1;
        } else {
            this.weights.owl = 0.15;
            this.weights.eagle = 0.3;
        }

        // High motion → boost frog and dragonfly
        if (signals.motionMagnitude !== undefined && signals.motionMagnitude > 0.2) {
            this.weights.frog = 0.35;
            this.weights.dragonfly = 0.2;
        } else {
            this.weights.frog = 0.2;
            this.weights.dragonfly = 0.1;
        }

        // High color complexity → boost mantis
        if (signals.colorComplexity !== undefined && signals.colorComplexity > 0.5) {
            this.weights.mantis = 0.3;
        } else {
            this.weights.mantis = 0.15;
        }
    }

    /**
     * Get combined curvature (weighted average)
     */
    getCombinedCurvature() {
        let curvature = 0;
        let totalWeight = 0;

        for (const [name, kernel] of this.kernels) {
            if (!kernel.enabled) continue;
            const weight = this.weights[name] || 1.0;
            curvature += kernel.getCurvature() * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? curvature / totalWeight : 0;
    }
}

export default {
    SamplingKernel,
    EagleKernel,
    OwlKernel,
    MantisKernel,
    FrogKernel,
    ViperKernel,
    DragonflyKernel,
    UnifiedSamplingSystem
};
