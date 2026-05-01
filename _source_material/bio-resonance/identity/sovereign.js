/**
 * SOVEREIGN IDENTITY MODULE
 * =========================
 * 
 * Mathematical identity through presence, not passwords.
 * Privacy-as-dharma, Math-as-law, Coherence-as-truth.
 * 
 * Flow:
 *   1. Presence Vector → Presence Hash (never stored, never transmitted)
 *   2. Coherence Threshold → Unlock Gate
 *   3. Ed25519 Keypair → Sovereign Identity
 *   4. Capability Token → Authorization
 * 
 * Compatible with Go backend: sovereign_auth package
 * 
 * @author Asymmetrica Research Laboratory
 */

import { sha256, sha512 } from '@noble/hashes/sha2.js';
import * as ed from '@noble/ed25519';
import { encode as cborEncode } from 'cbor-x';

// Configure ed25519 to use sha512
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

// Identity Constants (matching Go backend)
export const NODE_ID_LENGTH = 20;      // 160 bits
export const CHECKSUM_LENGTH = 4;      // 32 bits
export const IDENTITY_PREFIX = 'asym1:';

// Base32 alphabet (RFC 4648, lowercase)
const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

/**
 * Encode bytes to base32 (RFC 4648, lowercase, no padding)
 */
export function base32Encode(bytes) {
    let result = '';
    let bits = 0;
    let value = 0;
    
    for (const byte of bytes) {
        value = (value << 8) | byte;
        bits += 8;
        
        while (bits >= 5) {
            bits -= 5;
            result += BASE32_ALPHABET[(value >> bits) & 0x1f];
        }
    }
    
    if (bits > 0) {
        result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
    }
    
    return result;
}

/**
 * Decode base32 to bytes
 */
export function base32Decode(str) {
    const bytes = [];
    let bits = 0;
    let value = 0;
    
    for (const char of str.toLowerCase()) {
        const idx = BASE32_ALPHABET.indexOf(char);
        if (idx === -1) continue;
        
        value = (value << 5) | idx;
        bits += 5;
        
        while (bits >= 8) {
            bits -= 8;
            bytes.push((value >> bits) & 0xff);
        }
    }
    
    return new Uint8Array(bytes);
}

/**
 * Sovereign Identity Class
 * Manages Ed25519 keypair and identity string
 */
export class SovereignIdentity {
    constructor() {
        this.privateKey = null;
        this.publicKey = null;
        this.identityString = null;
        this.nodeId = null;
        this.createdAt = null;
    }

    /**
     * Generate new identity from seed
     * @param {Uint8Array} seed - 32-byte seed (from presence hash)
     */
    async generate(seed) {
        // Ensure seed is 32 bytes
        if (seed.length !== 32) {
            seed = sha256(seed);
        }

        // Generate Ed25519 keypair
        this.privateKey = seed;
        this.publicKey = await ed.getPublicKeyAsync(this.privateKey);

        // Derive Node ID (first 20 bytes of SHA256(publicKey))
        const pubKeyHash = sha256(this.publicKey);
        this.nodeId = pubKeyHash.slice(0, NODE_ID_LENGTH);

        // Compute checksum (first 4 bytes of SHA256(nodeId))
        const checksum = sha256(this.nodeId).slice(0, CHECKSUM_LENGTH);

        // Combine nodeId + checksum
        const identityBytes = new Uint8Array(NODE_ID_LENGTH + CHECKSUM_LENGTH);
        identityBytes.set(this.nodeId, 0);
        identityBytes.set(checksum, NODE_ID_LENGTH);

        // Encode to base32
        this.identityString = IDENTITY_PREFIX + base32Encode(identityBytes);
        this.createdAt = Date.now();

        return this;
    }

    /**
     * Sign data with private key
     * @param {Uint8Array} data - Data to sign
     * @returns {Uint8Array} - Signature
     */
    async sign(data) {
        if (!this.privateKey) {
            throw new Error('Identity not initialized');
        }
        return await ed.signAsync(data, this.privateKey);
    }

    /**
     * Verify signature
     * @param {Uint8Array} data - Original data
     * @param {Uint8Array} signature - Signature to verify
     * @returns {boolean}
     */
    async verify(data, signature) {
        if (!this.publicKey) {
            throw new Error('Identity not initialized');
        }
        return await ed.verifyAsync(signature, data, this.publicKey);
    }

    /**
     * Export public identity (safe to share)
     */
    exportPublic() {
        return {
            identityString: this.identityString,
            publicKey: Array.from(this.publicKey),
            createdAt: this.createdAt
        };
    }

    /**
     * Check if identity matches a public key
     */
    static verifyPublicKey(publicKey, identityString) {
        if (!identityString.startsWith(IDENTITY_PREFIX)) {
            return false;
        }

        const encoded = identityString.slice(IDENTITY_PREFIX.length);
        const identityBytes = base32Decode(encoded);

        if (identityBytes.length !== NODE_ID_LENGTH + CHECKSUM_LENGTH) {
            return false;
        }

        const nodeId = identityBytes.slice(0, NODE_ID_LENGTH);
        const checksum = identityBytes.slice(NODE_ID_LENGTH);

        // Verify checksum
        const expectedChecksum = sha256(nodeId).slice(0, CHECKSUM_LENGTH);
        for (let i = 0; i < CHECKSUM_LENGTH; i++) {
            if (checksum[i] !== expectedChecksum[i]) {
                return false;
            }
        }

        // Verify public key matches node ID
        const pubKeyBytes = publicKey instanceof Uint8Array ? publicKey : new Uint8Array(publicKey);
        const derivedNodeId = sha256(pubKeyBytes).slice(0, NODE_ID_LENGTH);

        for (let i = 0; i < NODE_ID_LENGTH; i++) {
            if (nodeId[i] !== derivedNodeId[i]) {
                return false;
            }
        }

        return true;
    }
}

/**
 * Capability Token
 * Signed authorization statement
 */
export class CapabilityToken {
    constructor(issuer, subject, resource, action, expiryMs = 3600000) {
        this.payload = {
            issuer: issuer,      // Identity string of issuer
            subject: subject,    // Identity string of subject (can be same as issuer)
            resource: resource,  // Resource being authorized
            action: action,      // Action being authorized
            expiry: Date.now() + expiryMs,
            metadata: {}
        };
        this.signature = null;
    }

    /**
     * Add metadata to token
     */
    addMetadata(key, value) {
        this.payload.metadata[key] = value;
        return this;
    }

    /**
     * Sign the token
     * @param {SovereignIdentity} identity - Issuer's identity
     */
    async sign(identity) {
        // CBOR encode payload (canonical encoding for cross-platform compatibility)
        const encoded = cborEncode(this.payload);
        this.signature = await identity.sign(encoded);
        return this;
    }

    /**
     * Verify token signature
     * @param {Uint8Array} publicKey - Issuer's public key
     */
    async verify(publicKey) {
        if (!this.signature) {
            return false;
        }

        // Check expiry
        if (this.payload.expiry && Date.now() > this.payload.expiry) {
            return false;
        }

        // Verify signature
        const encoded = cborEncode(this.payload);
        const pubKeyBytes = publicKey instanceof Uint8Array ? publicKey : new Uint8Array(publicKey);
        
        return await ed.verifyAsync(this.signature, encoded, pubKeyBytes);
    }

    /**
     * Export token for transmission
     */
    export() {
        return {
            payload: this.payload,
            signature: this.signature ? Array.from(this.signature) : null
        };
    }

    /**
     * Import token from transmission
     */
    static import(data) {
        const token = new CapabilityToken(
            data.payload.issuer,
            data.payload.subject,
            data.payload.resource,
            data.payload.action,
            0
        );
        token.payload = data.payload;
        token.signature = data.signature ? new Uint8Array(data.signature) : null;
        return token;
    }
}

/**
 * Presence Hash Generator
 * Creates unique hash from biological signals
 * NEVER stored, NEVER transmitted - computed fresh each time
 */
export class PresenceHashGenerator {
    /**
     * Generate presence hash from signal vector
     * @param {Array<number>} presenceVector - [bpm, hrv, luminance, color, motion, hum, coherence]
     * @returns {Uint8Array} - 32-byte hash
     */
    static generate(presenceVector) {
        // Normalize vector
        const normalized = presenceVector.map(v => {
            const absV = Math.abs(v || 0);
            return absV / (Math.max(...presenceVector.map(Math.abs)) || 1);
        });

        // Convert to bytes
        const buffer = new ArrayBuffer(normalized.length * 4);
        const view = new Float32Array(buffer);
        for (let i = 0; i < normalized.length; i++) {
            view[i] = normalized[i];
        }

        // Hash
        return sha256(new Uint8Array(buffer));
    }

    /**
     * Generate deterministic seed from presence
     * Combines presence hash with optional user phrase
     */
    static generateSeed(presenceVector, userPhrase = '') {
        const presenceHash = this.generate(presenceVector);
        
        if (userPhrase) {
            // Combine presence with phrase
            const phraseBytes = new TextEncoder().encode(userPhrase);
            const combined = new Uint8Array(presenceHash.length + phraseBytes.length);
            combined.set(presenceHash, 0);
            combined.set(phraseBytes, presenceHash.length);
            return sha256(combined);
        }

        return presenceHash;
    }
}

/**
 * Coherence Gate
 * Controls identity unlock based on coherence threshold
 */
export class CoherenceGate {
    constructor(threshold = 0.65, requiredStableTime = 3.0) {
        this.threshold = threshold;
        this.requiredStableTime = requiredStableTime;
        this.isUnlocked = false;
        this.unlockTime = null;
        this.identity = null;
        this.onUnlock = null;
        this.onLock = null;
    }

    /**
     * Update gate state
     * @param {Object} coherenceData - From CoherenceCalculator
     * @param {Array<number>} presenceVector - Current presence vector
     */
    async update(coherenceData, presenceVector) {
        const wasUnlocked = this.isUnlocked;

        // Check unlock conditions
        if (coherenceData.coherence >= this.threshold && 
            coherenceData.stableTime >= this.requiredStableTime) {
            
            if (!this.isUnlocked) {
                // UNLOCK!
                this.isUnlocked = true;
                this.unlockTime = Date.now();

                // Generate identity from presence
                const seed = PresenceHashGenerator.generateSeed(presenceVector);
                this.identity = new SovereignIdentity();
                await this.identity.generate(seed);

                if (this.onUnlock) {
                    this.onUnlock(this.identity);
                }
            }
        } else if (coherenceData.coherence < this.threshold * 0.8) {
            // Lock if coherence drops significantly
            if (this.isUnlocked) {
                this.isUnlocked = false;
                this.unlockTime = null;
                
                if (this.onLock) {
                    this.onLock();
                }
            }
        }

        return {
            isUnlocked: this.isUnlocked,
            identity: this.identity?.exportPublic() || null,
            unlockTime: this.unlockTime,
            coherence: coherenceData.coherence,
            stableTime: coherenceData.stableTime,
            progress: Math.min(1, coherenceData.stableTime / this.requiredStableTime)
        };
    }

    /**
     * Issue capability token
     */
    async issueCapability(resource, action, expiryMs = 3600000) {
        if (!this.isUnlocked || !this.identity) {
            throw new Error('Identity not unlocked');
        }

        const token = new CapabilityToken(
            this.identity.identityString,
            this.identity.identityString,  // Self-issued
            resource,
            action,
            expiryMs
        );

        await token.sign(this.identity);
        return token;
    }
}

/**
 * Vedic Crypto Integration
 * Base-97 quaternionic encryption for enhanced security
 */
export class VedicCrypto {
    static BASE_97 = 97;

    /**
     * Urdhva Tiryagbhyam encryption (one-way function)
     */
    static urdhvaTiryagbhyam(value, key) {
        value = Math.abs(value) % (this.BASE_97 ** 4);
        key = Math.abs(key) % (this.BASE_97 ** 4);

        let result = 1;
        for (let i = 0; i < 3; i++) {
            result = (result * value + key) % (this.BASE_97 ** 6);
            value = (value * key) % (this.BASE_97 ** 6);
        }

        return result;
    }

    /**
     * Ekadhikena Purvena transform (recursive depth)
     */
    static ekadhikenaPurvena(value, depth) {
        let result = value;
        for (let i = 0; i < depth; i++) {
            result = (result * (result + 1)) % (this.BASE_97 ** 4);
        }
        return result;
    }

    /**
     * Encrypt presence vector with Vedic methods
     */
    static encryptPresence(presenceVector, masterKey) {
        const encrypted = [];
        for (let i = 0; i < presenceVector.length; i++) {
            const value = Math.floor(Math.abs(presenceVector[i]) * 1000);
            const key = this.ekadhikenaPurvena(masterKey + i, i + 1);
            encrypted.push(this.urdhvaTiryagbhyam(value, key));
        }
        return encrypted;
    }
}

export default {
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
};
