/**
 * GPU BRIDGE - Backend Quaternion Acceleration
 * =============================================
 *
 * Connects the frontend Bio-Resonance system to the backend
 * Unified Consciousness Platform for GPU-accelerated operations.
 *
 * The backend runs on port 9999 and provides:
 *   - Spectral geometric retrieval
 *   - Quaternion field evolution (Level Zero GPU)
 *   - Sparse matrix operations (57× speedup)
 *   - Vedic inference bridge
 *
 * @author Asymmetrica Research Laboratory
 * @founded December 8th, 2025
 */

import { logger } from '$lib/utils/logger';
import { Quaternion, QuaternionField, PHI } from '../math/quaternion.js';

// Backend endpoints
const DEFAULT_BACKEND_URL = 'http://localhost:9999';

/**
 * GPU Bridge - Connects to Unified Consciousness Platform
 */
export class GPUBridge {
    constructor(config = {}) {
        this.config = {
            backendUrl: config.backendUrl || DEFAULT_BACKEND_URL,
            timeout: config.timeout || 5000,
            retryCount: config.retryCount || 3,
            retryDelay: config.retryDelay || 1000,
            ...config
        };

        // Connection state
        this.isConnected = false;
        this.lastHealthCheck = 0;
        this.healthCheckInterval = 5000;

        // Backend capabilities
        this.capabilities = {
            levelZeroGPU: false,
            vedic: false,
            spectral: false,
            inference: false
        };

        // Stats
        this.requestCount = 0;
        this.totalLatency = 0;
        this.avgLatency = 0;
    }

    /**
     * Initialize connection to backend
     */
    async initialize() {
        try {
            const health = await this.healthCheck();
            this.isConnected = health.status === 'healthy';
            
            if (this.isConnected) {
                // Query capabilities
                await this.queryCapabilities();
            }

            return this.isConnected;
        } catch (error) {
            logger.warn('GPU Bridge: Backend not available', { error: error.message });
            this.isConnected = false;
            return false;
        }
    }

    /**
     * Health check endpoint
     */
    async healthCheck() {
        const response = await this.fetch('/health');
        this.lastHealthCheck = Date.now();
        return response;
    }

    /**
     * Query backend capabilities
     */
    async queryCapabilities() {
        try {
            const status = await this.fetch('/status');
            
            this.capabilities = {
                levelZeroGPU: status.gpu?.available || false,
                vedic: status.vedic?.connected || false,
                spectral: status.spectral?.enabled || true,
                inference: status.inference?.available || false
            };

            return this.capabilities;
        } catch (error) {
            logger.warn('GPU Bridge: Could not query capabilities', { error: error.message });
            return this.capabilities;
        }
    }

    /**
     * Fetch with retry and timeout
     */
    async fetch(endpoint, options = {}) {
        const url = `${this.config.backendUrl}${endpoint}`;
        const startTime = performance.now();

        for (let attempt = 0; attempt < this.config.retryCount; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                // Update stats
                const latency = performance.now() - startTime;
                this.requestCount++;
                this.totalLatency += latency;
                this.avgLatency = this.totalLatency / this.requestCount;

                return data;
            } catch (error) {
                if (attempt === this.config.retryCount - 1) {
                    throw error;
                }
                await new Promise(r => setTimeout(r, this.config.retryDelay));
            }
        }
    }

    /**
     * Evolve quaternion field on GPU
     * Uses Level Zero GPU for 57× speedup
     * 
     * @param {QuaternionField} field - Input quaternion field
     * @param {number} dt - Delta time
     * @param {Object} signals - Biological signals
     * @returns {QuaternionField} - Evolved field
     */
    async evolveQuaternionField(field, dt, signals = {}) {
        if (!this.isConnected) {
            return null; // Fallback to CPU
        }

        try {
            // Serialize field to flat array
            const fieldData = [];
            for (let y = 0; y < field.height; y++) {
                for (let x = 0; x < field.width; x++) {
                    const q = field.get(x, y);
                    fieldData.push(q.w, q.x, q.y, q.z);
                }
            }

            const response = await this.fetch('/quaternion/evolve', {
                method: 'POST',
                body: JSON.stringify({
                    field: fieldData,
                    width: field.width,
                    height: field.height,
                    dt: dt,
                    signals: {
                        coherence: signals.coherence?.coherence || 0,
                        heartRate: signals.ppg?.bpm || 0,
                        motion: signals.flow?.magnitude || 0
                    }
                })
            });

            // Deserialize response
            const evolvedField = new QuaternionField(field.width, field.height);
            for (let i = 0; i < response.field.length; i += 4) {
                const idx = i / 4;
                const x = idx % field.width;
                const y = Math.floor(idx / field.width);
                evolvedField.set(x, y, new Quaternion(
                    response.field[i],
                    response.field[i + 1],
                    response.field[i + 2],
                    response.field[i + 3]
                ));
            }

            return evolvedField;
        } catch (error) {
            logger.warn('GPU Bridge: Quaternion evolution failed', { error: error.message });
            return null;
        }
    }

    /**
     * Spectral geometric retrieval
     * Uses Vedic quaternion embeddings for semantic search
     * 
     * @param {string} query - Search query
     * @param {number} k - Number of results
     * @returns {Object} - Retrieval results with trajectory
     */
    async spectralRetrieve(query, k = 5) {
        if (!this.isConnected) {
            return null;
        }

        try {
            const response = await this.fetch('/retrieve', {
                method: 'POST',
                body: JSON.stringify({ query, k })
            });

            return response;
        } catch (error) {
            logger.warn('GPU Bridge: Spectral retrieval failed', { error: error.message });
            return null;
        }
    }

    /**
     * Consciousness refraction
     * Applies spectral agent processing
     * 
     * @param {string} input - Input text
     * @param {string} agent - Agent name (rita, mira, soren, prime, vedic)
     * @returns {Object} - Refracted output
     */
    async refract(input, agent = 'prime') {
        if (!this.isConnected) {
            return null;
        }

        try {
            const response = await this.fetch('/refract', {
                method: 'POST',
                body: JSON.stringify({ input, agent })
            });

            return response;
        } catch (error) {
            logger.warn('GPU Bridge: Refraction failed', { error: error.message });
            return null;
        }
    }

    /**
     * Verify capability token on backend
     * 
     * @param {Object} token - Capability token to verify
     * @returns {Object} - Verification result
     */
    async verifyCapability(token) {
        if (!this.isConnected) {
            return { valid: false, reason: 'Backend not connected' };
        }

        try {
            const response = await this.fetch('/auth/verify-capability', {
                method: 'POST',
                body: JSON.stringify(token)
            });

            return response;
        } catch (error) {
            logger.warn('GPU Bridge: Capability verification failed', { error: error.message });
            return { valid: false, reason: error.message };
        }
    }

    /**
     * Register identity with backend
     * 
     * @param {Object} identity - Public identity info
     * @returns {Object} - Registration result
     */
    async registerIdentity(identity) {
        if (!this.isConnected) {
            return { success: false, reason: 'Backend not connected' };
        }

        try {
            const response = await this.fetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    identity_string: identity.identityString,
                    public_key: identity.publicKey
                })
            });

            return response;
        } catch (error) {
            logger.warn('GPU Bridge: Identity registration failed', { error: error.message });
            return { success: false, reason: error.message };
        }
    }

    /**
     * Get GPU inference status
     */
    async getInferenceStatus() {
        if (!this.isConnected) {
            return null;
        }

        try {
            return await this.fetch('/inference/status');
        } catch (error) {
            return null;
        }
    }

    /**
     * Run inference on GPU
     * Uses Level Zero for sparse matrix operations
     * 
     * @param {string} prompt - Input prompt
     * @param {Object} options - Inference options
     * @returns {Object} - Inference result
     */
    async runInference(prompt, options = {}) {
        if (!this.isConnected || !this.capabilities.inference) {
            return null;
        }

        try {
            const response = await this.fetch('/inference/generate', {
                method: 'POST',
                body: JSON.stringify({
                    prompt,
                    max_tokens: options.maxTokens || 256,
                    temperature: options.temperature || 0.7
                })
            });

            return response;
        } catch (error) {
            logger.warn('GPU Bridge: Inference failed', { error: error.message });
            return null;
        }
    }

    /**
     * Get bridge statistics
     */
    getStats() {
        return {
            isConnected: this.isConnected,
            capabilities: this.capabilities,
            requestCount: this.requestCount,
            avgLatency: this.avgLatency,
            lastHealthCheck: this.lastHealthCheck
        };
    }
}

/**
 * Singleton GPU bridge instance
 */
let bridgeInstance = null;

/**
 * Get or create GPU bridge instance
 */
export function getGPUBridge(config = {}) {
    if (!bridgeInstance) {
        bridgeInstance = new GPUBridge(config);
    }
    return bridgeInstance;
}

/**
 * Initialize GPU bridge (call once at app startup)
 */
export async function initializeGPUBridge(config = {}) {
    const bridge = getGPUBridge(config);
    await bridge.initialize();
    return bridge;
}

export default {
    GPUBridge,
    getGPUBridge,
    initializeGPUBridge
};
