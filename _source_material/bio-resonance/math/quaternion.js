/**
 * QUATERNION MATHEMATICS - S³ Unit 3-Sphere Operations
 * =====================================================
 * 
 * The foundation of Bio-Resonance Authentication.
 * All state lives on S³ - the unit 3-sphere in 4D space.
 * 
 * ∂Φ/∂t = Φ ⊗ Φ + C(domain)
 * 
 * @author Asymmetrica Research Laboratory
 * @founded December 8th, 2025
 */

// Golden Ratio - Universe's favorite number
export const PHI = 1.618033988749895;
export const PHI_SQUARED = 2.618033988749895;
export const PHI_RECIPROCAL = 0.618033988749895;

// Sacred Constants
export const SCHUMANN_RESONANCE = 7.93;  // Earth's frequency
export const TESLA_432 = 432.0;
export const VEDIC_108 = 108.0;
export const GOLDEN_ANGLE = 137.5077640500378;  // 360° / φ²

/**
 * Quaternion class - Point on S³ unit 3-sphere
 * q = w + xi + yj + zk
 */
export class Quaternion {
    constructor(w = 1, x = 0, y = 0, z = 0) {
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Compute quaternion norm ||q||
     */
    norm() {
        return Math.sqrt(this.w * this.w + this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Normalize to unit quaternion (project to S³)
     */
    normalize() {
        const n = this.norm();
        if (n < 1e-10) {
            return new Quaternion(1, 0, 0, 0);  // Identity
        }
        return new Quaternion(this.w / n, this.x / n, this.y / n, this.z / n);
    }

    /**
     * Quaternion conjugate q* = w - xi - yj - zk
     */
    conjugate() {
        return new Quaternion(this.w, -this.x, -this.y, -this.z);
    }

    /**
     * Quaternion multiplication (Hamilton product)
     * NON-COMMUTATIVE: q1 ⊗ q2 ≠ q2 ⊗ q1
     */
    multiply(other) {
        return new Quaternion(
            this.w * other.w - this.x * other.x - this.y * other.y - this.z * other.z,
            this.w * other.x + this.x * other.w + this.y * other.z - this.z * other.y,
            this.w * other.y - this.x * other.z + this.y * other.w + this.z * other.x,
            this.w * other.z + this.x * other.y - this.y * other.x + this.z * other.w
        );
    }

    /**
     * Dot product (for SLERP angle computation)
     */
    dot(other) {
        return this.w * other.w + this.x * other.x + this.y * other.y + this.z * other.z;
    }

    /**
     * Add two quaternions
     */
    add(other) {
        return new Quaternion(
            this.w + other.w,
            this.x + other.x,
            this.y + other.y,
            this.z + other.z
        );
    }

    /**
     * Scale quaternion by scalar
     */
    scale(s) {
        return new Quaternion(this.w * s, this.x * s, this.y * s, this.z * s);
    }

    /**
     * SLERP - Spherical Linear Interpolation
     * THE key operation for smooth evolution on S³!
     * Geodesic path = shortest path on the 3-sphere
     * 
     * @param {Quaternion} other - Target quaternion
     * @param {number} t - Interpolation parameter [0, 1]
     * @returns {Quaternion} - Interpolated quaternion
     */
    slerp(other, t) {
        // Ensure shortest path (flip if negative dot product)
        let dot = this.dot(other);
        let target = other;
        
        if (dot < 0) {
            target = new Quaternion(-other.w, -other.x, -other.y, -other.z);
            dot = -dot;
        }

        // If very close, use linear interpolation (avoid division by zero)
        if (dot > 0.9995) {
            return new Quaternion(
                this.w + t * (target.w - this.w),
                this.x + t * (target.x - this.x),
                this.y + t * (target.y - this.y),
                this.z + t * (target.z - this.z)
            ).normalize();
        }

        // Standard SLERP
        const theta = Math.acos(dot);
        const sinTheta = Math.sin(theta);
        const scale0 = Math.sin((1 - t) * theta) / sinTheta;
        const scale1 = Math.sin(t * theta) / sinTheta;

        return new Quaternion(
            scale0 * this.w + scale1 * target.w,
            scale0 * this.x + scale1 * target.x,
            scale0 * this.y + scale1 * target.y,
            scale0 * this.z + scale1 * target.z
        );
    }

    /**
     * Create quaternion from axis-angle representation
     * @param {Array} axis - [x, y, z] rotation axis (will be normalized)
     * @param {number} angle - Rotation angle in radians
     */
    static fromAxisAngle(axis, angle) {
        const len = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]);
        if (len < 1e-10) {
            return new Quaternion(1, 0, 0, 0);
        }
        
        const halfAngle = angle / 2;
        const s = Math.sin(halfAngle) / len;
        
        return new Quaternion(
            Math.cos(halfAngle),
            axis[0] * s,
            axis[1] * s,
            axis[2] * s
        );
    }

    /**
     * Convert to axis-angle representation
     * @returns {{axis: Array, angle: number}}
     */
    toAxisAngle() {
        const q = this.normalize();
        const angle = 2 * Math.acos(Math.min(1, Math.max(-1, q.w)));
        const s = Math.sqrt(1 - q.w * q.w);
        
        if (s < 1e-10) {
            return { axis: [1, 0, 0], angle: 0 };
        }
        
        return {
            axis: [q.x / s, q.y / s, q.z / s],
            angle: angle
        };
    }

    /**
     * Rotate a 3D vector using this quaternion
     * v' = q * v * q*
     * @param {Array} v - [x, y, z] vector
     * @returns {Array} - Rotated vector
     */
    rotateVector(v) {
        const vQuat = new Quaternion(0, v[0], v[1], v[2]);
        const rotated = this.multiply(vQuat).multiply(this.conjugate());
        return [rotated.x, rotated.y, rotated.z];
    }

    /**
     * Convert to RGB for visualization
     * Maps quaternion orientation to color space
     */
    toRGB() {
        const brightness = (this.w + 1) / 2;  // Map [-1, 1] → [0, 1]
        return {
            r: Math.abs(this.x) * brightness,
            g: Math.abs(this.y) * brightness,
            b: Math.abs(this.z) * brightness
        };
    }

    /**
     * Convert to array [w, x, y, z]
     */
    toArray() {
        return [this.w, this.x, this.y, this.z];
    }

    /**
     * Create from array [w, x, y, z]
     */
    static fromArray(arr) {
        return new Quaternion(arr[0], arr[1], arr[2], arr[3]);
    }

    /**
     * Identity quaternion (no rotation)
     */
    static identity() {
        return new Quaternion(1, 0, 0, 0);
    }

    /**
     * Random unit quaternion (uniform distribution on S³)
     */
    static random() {
        // Marsaglia's method for uniform distribution on S³
        let u1, u2, s1, s2;
        
        do {
            u1 = Math.random() * 2 - 1;
            u2 = Math.random() * 2 - 1;
            s1 = u1 * u1 + u2 * u2;
        } while (s1 >= 1);
        
        do {
            const v1 = Math.random() * 2 - 1;
            const v2 = Math.random() * 2 - 1;
            s2 = v1 * v1 + v2 * v2;
            if (s2 < 1) {
                const sqrt1 = Math.sqrt((1 - s1) / s2);
                return new Quaternion(u1, u2, v1 * sqrt1, v2 * sqrt1);
            }
        } while (true);
    }

    /**
     * Exponential map (Lie algebra → Lie group)
     * exp(v) where v is pure quaternion (w=0)
     */
    static exp(v) {
        const theta = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        if (theta < 1e-10) {
            return new Quaternion(1, v.x, v.y, v.z).normalize();
        }
        const s = Math.sin(theta) / theta;
        return new Quaternion(Math.cos(theta), v.x * s, v.y * s, v.z * s);
    }

    /**
     * Logarithmic map (Lie group → Lie algebra)
     * log(q) returns pure quaternion
     */
    log() {
        const q = this.normalize();
        const theta = Math.acos(Math.min(1, Math.max(-1, q.w)));
        if (theta < 1e-10) {
            return new Quaternion(0, q.x, q.y, q.z);
        }
        const s = theta / Math.sin(theta);
        return new Quaternion(0, q.x * s, q.y * s, q.z * s);
    }

    /**
     * Geodesic distance on S³
     */
    distanceTo(other) {
        const dot = Math.abs(this.dot(other));
        return 2 * Math.acos(Math.min(1, dot));
    }

    toString() {
        return `Q(${this.w.toFixed(4)}, ${this.x.toFixed(4)}, ${this.y.toFixed(4)}, ${this.z.toFixed(4)})`;
    }
}

/**
 * Quaternion Field - 2D grid of quaternions
 * Represents the visual manifold state
 */
export class QuaternionField {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Array(width * height);
        
        // Initialize to identity
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = Quaternion.identity();
        }
    }

    get(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return Quaternion.identity();
        }
        return this.data[y * this.width + x];
    }

    set(x, y, q) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.data[y * this.width + x] = q;
        }
    }

    /**
     * Apply global rotation to entire field
     */
    rotateAll(rotation) {
        for (let i = 0; i < this.data.length; i++) {
            this.data[i] = rotation.multiply(this.data[i]);
        }
    }

    /**
     * SLERP blend with another field
     */
    slerpBlend(other, t) {
        const result = new QuaternionField(this.width, this.height);
        for (let i = 0; i < this.data.length; i++) {
            result.data[i] = this.data[i].slerp(other.data[i], t);
        }
        return result;
    }

    /**
     * Compute field energy (sum of angular velocities)
     */
    computeEnergy() {
        let energy = 0;
        const identity = Quaternion.identity();
        for (let i = 0; i < this.data.length; i++) {
            energy += this.data[i].distanceTo(identity);
        }
        return energy / this.data.length;
    }

    /**
     * Convert to RGB image array for visualization
     */
    toRGBArray() {
        const rgb = new Float32Array(this.width * this.height * 3);
        for (let i = 0; i < this.data.length; i++) {
            const color = this.data[i].toRGB();
            rgb[i * 3] = color.r;
            rgb[i * 3 + 1] = color.g;
            rgb[i * 3 + 2] = color.b;
        }
        return rgb;
    }
}

/**
 * Three-Regime Tracker
 * Universal [30%, 20%, 50%] pattern detector
 */
export class ThreeRegimeTracker {
    constructor() {
        this.r1 = 0.30;  // Exploration
        this.r2 = 0.20;  // Optimization
        this.r3 = 0.50;  // Stabilization
        this.history = [];
    }

    /**
     * Update regimes from state array
     */
    update(states) {
        if (!states || states.length === 0) return;

        // Compute statistics
        let sum = 0;
        for (const s of states) {
            sum += Math.abs(s);
        }
        const mean = sum / states.length;

        let variance = 0;
        for (const s of states) {
            const diff = Math.abs(s) - mean;
            variance += diff * diff;
        }
        variance /= states.length;
        const stddev = Math.sqrt(variance);

        // Regime boundaries
        const thresholdHigh = mean + 0.5 * stddev;
        const thresholdLow = mean - 0.5 * stddev;

        // Count regime membership
        let r1Count = 0, r2Count = 0, r3Count = 0;
        for (const s of states) {
            const absS = Math.abs(s);
            if (absS > thresholdHigh) r1Count++;
            else if (absS > thresholdLow) r2Count++;
            else r3Count++;
        }

        const total = states.length;
        this.r1 = r1Count / total;
        this.r2 = r2Count / total;
        this.r3 = r3Count / total;

        this.history.push({ r1: this.r1, r2: this.r2, r3: this.r3, timestamp: Date.now() });
        if (this.history.length > 100) this.history.shift();
    }

    /**
     * Check if converged to universal center [30%, 20%, 50%]
     */
    isConverged(tolerance = 0.10) {
        return Math.abs(this.r1 - 0.30) < tolerance &&
               Math.abs(this.r2 - 0.20) < tolerance &&
               Math.abs(this.r3 - 0.50) < tolerance;
    }

    /**
     * Singularity risk detection
     * R3 < 50% = DANGER (hallucination/blowup imminent)
     */
    getSingularityRisk() {
        if (this.r3 < 0.50) return 'EMERGENCY';
        if (this.r3 < 0.55) return 'WARNING';
        return 'OK';
    }

    /**
     * Get coherence score [0, 1]
     * Based on how close we are to universal center
     */
    getCoherence() {
        const deviation = Math.abs(this.r1 - 0.30) + Math.abs(this.r2 - 0.20) + Math.abs(this.r3 - 0.50);
        return Math.max(0, 1 - deviation);
    }
}

export default {
    Quaternion,
    QuaternionField,
    ThreeRegimeTracker,
    PHI,
    PHI_SQUARED,
    PHI_RECIPROCAL,
    SCHUMANN_RESONANCE,
    TESLA_432,
    VEDIC_108,
    GOLDEN_ANGLE
};
