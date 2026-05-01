/**
 * SOVEREIGN IDENTITY VAULT
 * ========================
 *
 * Local-first identity storage.
 * Your identity stays on YOUR machine.
 *
 * Storage:
 *   - localStorage for persistence
 *   - IndexedDB for capability tokens
 *   - No server transmission (sovereign principle)
 *
 * @author Asymmetrica Research Laboratory
 */

import { logger } from '$lib/utils/logger';

const VAULT_KEY = 'asymmetrica:sovereign:vault';
const TOKENS_KEY = 'asymmetrica:sovereign:tokens';
const SESSIONS_KEY = 'asymmetrica:sovereign:sessions';

// Browser check for SSR compatibility
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Identity Vault - Local storage for sovereign identity
 */
export class IdentityVault {
    constructor() {
        this.identity = null;
        this.sessions = [];
        this.tokens = [];
        this.listeners = new Set();
    }

    /**
     * Initialize vault from localStorage
     */
    async initialize() {
        if (!isBrowser) return null;
        
        try {
            // Load identity
            const vaultData = localStorage.getItem(VAULT_KEY);
            if (vaultData) {
                this.identity = JSON.parse(vaultData);
            }

            // Load sessions
            const sessionsData = localStorage.getItem(SESSIONS_KEY);
            if (sessionsData) {
                this.sessions = JSON.parse(sessionsData);
            }

            // Load tokens
            const tokensData = localStorage.getItem(TOKENS_KEY);
            if (tokensData) {
                this.tokens = JSON.parse(tokensData);
                // Clean expired tokens
                this.tokens = this.tokens.filter(t => t.payload.expiry > Date.now());
                this._saveTokens();
            }

            return this.identity;
        } catch (error) {
            logger.exception(error, { context: 'IdentityVault.initialize' });
            return null;
        }
    }

    /**
     * Store identity (called on unlock)
     */
    storeIdentity(identity) {
        if (!isBrowser) return null;
        
        this.identity = {
            ...identity,
            storedAt: Date.now(),
            lastSeen: Date.now()
        };
        
        // Add session
        const session = {
            id: crypto.randomUUID(),
            identityString: identity.identityString,
            startedAt: Date.now(),
            coherenceHistory: []
        };
        this.sessions.push(session);
        
        // Keep only last 100 sessions
        if (this.sessions.length > 100) {
            this.sessions = this.sessions.slice(-100);
        }

        this._save();
        this._notify('identity:stored', this.identity);
        
        return session;
    }

    /**
     * Update last seen timestamp
     */
    updateLastSeen() {
        if (this.identity) {
            this.identity.lastSeen = Date.now();
            this._save();
        }
    }

    /**
     * Store capability token
     */
    storeToken(token) {
        this.tokens.push({
            ...token,
            storedAt: Date.now()
        });
        
        // Keep only last 1000 tokens
        if (this.tokens.length > 1000) {
            this.tokens = this.tokens.slice(-1000);
        }

        this._saveTokens();
        this._notify('token:stored', token);
    }

    /**
     * Get valid tokens for a resource
     */
    getTokensForResource(resource) {
        const now = Date.now();
        return this.tokens.filter(t => 
            t.payload.resource === resource && 
            t.payload.expiry > now
        );
    }

    /**
     * Get all active (non-expired) tokens
     */
    getActiveTokens() {
        const now = Date.now();
        return this.tokens.filter(t => t.payload?.expiry > now);
    }

    /**
     * Revoke a token by ID
     */
    revokeToken(tokenId) {
        this.tokens = this.tokens.filter(t => t.id !== tokenId);
        this._saveTokens();
        this._notify('token:revoked', tokenId);
    }

    /**
     * Check if we have a recent identity (for fast re-auth)
     * @param {number} maxAgeMs - Maximum age in milliseconds (default: 24 hours)
     * @returns {boolean} True if identity exists and was seen within maxAge
     */
    hasRecentIdentity(maxAgeMs = 24 * 60 * 60 * 1000) {
        if (!this.identity || !this.identity.lastSeen) {
            return false;
        }
        const age = Date.now() - this.identity.lastSeen;
        return age < maxAgeMs;
    }

    /**
     * Get the stored identity if recent enough
     * @param {number} maxAgeMs - Maximum age in milliseconds
     * @returns {object|null} Identity if recent, null otherwise
     */
    getRecentIdentity(maxAgeMs = 24 * 60 * 60 * 1000) {
        if (this.hasRecentIdentity(maxAgeMs)) {
            return this.identity;
        }
        return null;
    }

    /**
     * Get identity statistics
     */
    getStats() {
        if (!this.identity) {
            return null;
        }

        const now = Date.now();
        const sessionCount = this.sessions.filter(
            s => s.identityString === this.identity.identityString
        ).length;

        const validTokens = this.tokens.filter(t => t.payload.expiry > now);

        return {
            identityString: this.identity.identityString,
            publicKey: this.identity.publicKey,
            createdAt: this.identity.createdAt,
            storedAt: this.identity.storedAt,
            lastSeen: this.identity.lastSeen,
            sessionCount: sessionCount,
            totalTokensIssued: this.tokens.length,
            validTokens: validTokens.length,
            daysSinceCreation: Math.floor((now - this.identity.createdAt) / (1000 * 60 * 60 * 24))
        };
    }

    /**
     * Clear vault (logout)
     */
    clear() {
        this.identity = null;
        this.sessions = [];
        this.tokens = [];
        if (isBrowser) {
            localStorage.removeItem(VAULT_KEY);
            localStorage.removeItem(SESSIONS_KEY);
            localStorage.removeItem(TOKENS_KEY);
        }
        this._notify('vault:cleared', null);
    }

    /**
     * Export identity (for backup)
     */
    exportIdentity() {
        if (!this.identity) return null;
        
        return {
            version: 1,
            exportedAt: Date.now(),
            identity: this.identity,
            sessions: this.sessions.slice(-10),  // Last 10 sessions
            tokenCount: this.tokens.length
        };
    }

    /**
     * Subscribe to vault events
     */
    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    // Private methods
    _save() {
        if (!isBrowser) return;
        
        try {
            localStorage.setItem(VAULT_KEY, JSON.stringify(this.identity));
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(this.sessions));
        } catch (error) {
            logger.exception(error, { context: 'IdentityVault._save' });
        }
    }

    _saveTokens() {
        if (!isBrowser) return;

        try {
            localStorage.setItem(TOKENS_KEY, JSON.stringify(this.tokens));
        } catch (error) {
            logger.exception(error, { context: 'IdentityVault._saveTokens' });
        }
    }

    _notify(event, data) {
        for (const listener of this.listeners) {
            try {
                listener(event, data);
            } catch (error) {
                logger.exception(error, { context: 'IdentityVault._emit', event });
            }
        }
    }
}

/**
 * Telemetry (local-only, no transmission)
 */
export class LocalTelemetry {
    constructor() {
        this.events = [];
        this.maxEvents = 1000;
    }

    log(category, action, data = {}) {
        const event = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            category,
            action,
            data
        };

        this.events.push(event);
        
        if (this.events.length > this.maxEvents) {
            this.events = this.events.slice(-this.maxEvents);
        }

        // Log telemetry event
        logger.info(`Telemetry: ${category}:${action}`, { category, action, ...data });

        return event;
    }

    getEvents(category = null, limit = 100) {
        let filtered = this.events;
        if (category) {
            filtered = filtered.filter(e => e.category === category);
        }
        return filtered.slice(-limit);
    }

    clear() {
        this.events = [];
    }
}

// Singleton instances
let vaultInstance = null;
let telemetryInstance = null;

export function getVault() {
    if (!vaultInstance) {
        vaultInstance = new IdentityVault();
    }
    return vaultInstance;
}

export function getTelemetry() {
    if (!telemetryInstance) {
        telemetryInstance = new LocalTelemetry();
    }
    return telemetryInstance;
}

export default {
    IdentityVault,
    LocalTelemetry,
    getVault,
    getTelemetry
};
