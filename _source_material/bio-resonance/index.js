/**
 * BIO-RESONANCE AUTHENTICATION SYSTEM
 * ====================================
 * 
 * Mathematical identity through presence, not passwords.
 * 
 * The Asymmetrica Way:
 *   - Privacy-as-dharma
 *   - Math-as-law
 *   - Coherence-as-truth
 * 
 * @author Asymmetrica Research Laboratory
 * @founded December 8th, 2025
 */

// Math Layer
export { 
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
} from './math/quaternion.js';

export {
    PDETissue,
    VisionSurfaceTissue,
    PhiOrganismTissue,
    ResonanceTissue,
    PDETissueRegistry
} from './math/pde-tissue.js';

export {
    SamplingKernel,
    EagleKernel,
    OwlKernel,
    MantisKernel,
    FrogKernel,
    ViperKernel,
    DragonflyKernel,
    UnifiedSamplingSystem
} from './math/biomimetic-kernels.js';

// Signal Layer
export {
    PPGExtractor,
    OpticalFlowExtractor,
    HumDetector,
    CoherenceCalculator,
    UnifiedSignalExtractor
} from './signals/signal-extractor.js';

// Identity Layer
export {
    SovereignIdentity,
    CapabilityToken,
    PresenceHashGenerator,
    CoherenceGate,
    VedicCrypto,
    base32Encode,
    base32Decode,
    IDENTITY_PREFIX,
    NODE_ID_LENGTH,
    CHECKSUM_LENGTH
} from './identity/sovereign.js';

// Engine Layer
export {
    UVMEngine,
    createUVMEngine
} from './engine/uvm-engine.js';

// Storage Layer
export {
    IdentityVault,
    LocalTelemetry,
    getVault,
    getTelemetry
} from './storage/identity-vault.js';

// Components
export { default as BioResonanceAuth } from './components/BioResonanceAuth.svelte';
export { default as BioResonanceAuthEnhanced } from './components/BioResonanceAuthEnhanced.svelte';
export { default as BioResonanceQuick } from './components/BioResonanceQuick.svelte';

// GPU Layer
export {
    WebGLParticleRenderer,
    createParticleRenderer
} from './gpu/webgl-particle-renderer.js';

export {
    GPUBridge,
    getGPUBridge,
    initializeGPUBridge
} from './gpu/gpu-bridge.js';

// MediaPipe Layer
export {
    FaceMeshIntegration,
    createFaceMeshIntegration,
    LANDMARK_REGIONS
} from './mediapipe/facemesh-integration.js';

/**
 * Quick start:
 * 
 * ```svelte
 * <script>
 *   import { BioResonanceAuth } from '$lib/bio-resonance';
 *
 *   function handleUnlock(event) {
 *     // event.detail.identity contains sovereign identity
 *   }
 * </script>
 * 
 * <BioResonanceAuth 
 *   width={640} 
 *   height={480}
 *   on:unlock={handleUnlock}
 * />
 * ```
 */
