import { sha256 } from '@noble/hashes/sha256';
import { sha512 } from '@noble/hashes/sha512';
import { etc, getPublicKeyAsync, signAsync, verifyAsync } from '@noble/ed25519';

etc.sha512Sync = (...messages: Uint8Array[]): Uint8Array => sha512(etc.concatBytes(...messages));

export const NODE_ID_LENGTH = 20;
export const CHECKSUM_LENGTH = 4;
export const IDENTITY_PREFIX = 'asym1:';
const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';
const IDENTITY_RATE_LIMIT_MS = 2000;

export interface PublicIdentity {
  readonly identityString: string;
  readonly publicKey: readonly number[];
  readonly createdAt: number;
}

interface IdentitySnapshot {
  readonly privateKey: Uint8Array;
  readonly publicKey: Uint8Array;
  readonly identityString: string;
  readonly nodeId: Uint8Array;
  readonly createdAt: number;
  readonly generatedAt: number;
}

const identityCache: Map<string, IdentitySnapshot> = new Map();

function bytesToKey(bytes: Uint8Array): string {
  return Array.from(bytes).map((byte: number) => byte.toString(16).padStart(2, '0')).join('');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry: unknown) => stableStringify(entry)).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key: string) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`;
}

function stableBytes(value: unknown): Uint8Array {
  return new TextEncoder().encode(stableStringify(value));
}

function sameBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) diff |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return diff === 0;
}

export function base32Encode(bytes: Uint8Array): string {
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
  if (bits > 0) result += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  return result;
}

export function base32Decode(value: string): Uint8Array {
  const bytes: number[] = [];
  let bits = 0;
  let buffer = 0;
  for (const char of value.toLowerCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) continue;
    buffer = (buffer << 5) | index;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

export class SovereignIdentity {
  public privateKey: Uint8Array | null = null;
  public publicKey: Uint8Array | null = null;
  public identityString: string | null = null;
  public nodeId: Uint8Array | null = null;
  public createdAt: number | null = null;

  public async generate(seedInput: Uint8Array): Promise<this> {
    const seed = seedInput.length === 32 ? seedInput : sha256(seedInput);
    const cacheKey = bytesToKey(seed);
    const cached = identityCache.get(cacheKey);
    const now = Date.now();
    if (cached && now - cached.generatedAt < IDENTITY_RATE_LIMIT_MS) {
      this.privateKey = cached.privateKey;
      this.publicKey = cached.publicKey;
      this.identityString = cached.identityString;
      this.nodeId = cached.nodeId;
      this.createdAt = cached.createdAt;
      return this;
    }

    const publicKey = await getPublicKeyAsync(seed);
    const nodeId = sha256(publicKey).slice(0, NODE_ID_LENGTH);
    const checksum = sha256(nodeId).slice(0, CHECKSUM_LENGTH);
    const identityBytes = new Uint8Array(NODE_ID_LENGTH + CHECKSUM_LENGTH);
    identityBytes.set(nodeId, 0);
    identityBytes.set(checksum, NODE_ID_LENGTH);
    this.privateKey = seed;
    this.publicKey = publicKey;
    this.nodeId = nodeId;
    this.identityString = `${IDENTITY_PREFIX}${base32Encode(identityBytes)}`;
    this.createdAt = now;
    identityCache.set(cacheKey, { privateKey: seed, publicKey, identityString: this.identityString, nodeId, createdAt: now, generatedAt: now });
    return this;
  }

  public async sign(data: Uint8Array): Promise<Uint8Array> {
    if (!this.privateKey) throw new Error('Identity not initialized');
    return signAsync(data, this.privateKey);
  }

  public async verify(data: Uint8Array, signature: Uint8Array): Promise<boolean> {
    if (!this.publicKey) throw new Error('Identity not initialized');
    return verifyAsync(signature, data, this.publicKey);
  }

  public exportPublic(): PublicIdentity {
    if (!this.identityString || !this.publicKey || !this.createdAt) throw new Error('Identity not initialized');
    return { identityString: this.identityString, publicKey: Array.from(this.publicKey), createdAt: this.createdAt };
  }

  public static verifyPublicKey(publicKey: Uint8Array | readonly number[], identityString: string): boolean {
    if (!identityString.startsWith(IDENTITY_PREFIX)) return false;
    const identityBytes = base32Decode(identityString.slice(IDENTITY_PREFIX.length));
    if (identityBytes.length !== NODE_ID_LENGTH + CHECKSUM_LENGTH) return false;
    const nodeId = identityBytes.slice(0, NODE_ID_LENGTH);
    const checksum = identityBytes.slice(NODE_ID_LENGTH);
    if (!sameBytes(checksum, sha256(nodeId).slice(0, CHECKSUM_LENGTH))) return false;
    return sameBytes(nodeId, sha256(publicKey instanceof Uint8Array ? publicKey : new Uint8Array(publicKey)).slice(0, NODE_ID_LENGTH));
  }
}

export interface CapabilityPayload {
  issuer: string;
  subject: string;
  resource: string;
  action: string;
  expiry: number;
  metadata: Record<string, string | number | boolean>;
}

export class CapabilityToken {
  public payload: CapabilityPayload;
  public signature: Uint8Array | null = null;

  public constructor(issuer: string, subject: string, resource: string, action: string, expiryMs: number = 3600000) {
    this.payload = { issuer, subject, resource, action, expiry: Date.now() + expiryMs, metadata: {} };
  }

  public addMetadata(key: string, value: string | number | boolean): this {
    this.payload.metadata[key] = value;
    return this;
  }

  public async sign(identity: SovereignIdentity): Promise<this> {
    this.signature = await identity.sign(stableBytes(this.payload));
    return this;
  }

  public async verify(publicKey: Uint8Array | readonly number[]): Promise<boolean> {
    if (!this.signature || Date.now() > this.payload.expiry) return false;
    return verifyAsync(this.signature, stableBytes(this.payload), publicKey instanceof Uint8Array ? publicKey : new Uint8Array(publicKey));
  }

  public export(): { readonly payload: CapabilityPayload; readonly signature: readonly number[] | null } {
    return { payload: this.payload, signature: this.signature ? Array.from(this.signature) : null };
  }

  public static import(data: { readonly payload: CapabilityPayload; readonly signature: readonly number[] | null }): CapabilityToken {
    const token = new CapabilityToken(data.payload.issuer, data.payload.subject, data.payload.resource, data.payload.action, 0);
    token.payload = data.payload;
    token.signature = data.signature ? new Uint8Array(data.signature) : null;
    return token;
  }
}

export class PresenceHashGenerator {
  public static generate(presenceVector: readonly number[]): Uint8Array {
    if (presenceVector.length === 0 || presenceVector.every((value: number) => Math.abs(value) < 1e-12)) {
      throw new Error('Cannot generate presence hash from an empty or all-zero presence vector.');
    }
    const max = Math.max(...presenceVector.map((value: number) => Math.abs(value)), 1);
    const view = new Float32Array(presenceVector.length);
    for (let index = 0; index < presenceVector.length; index += 1) view[index] = Math.abs(presenceVector[index] ?? 0) / max;
    return sha256(new Uint8Array(view.buffer));
  }

  public static generateSeed(presenceVector: readonly number[], userPhrase: string = ''): Uint8Array {
    const presenceHash = this.generate(presenceVector);
    if (!userPhrase) return presenceHash;
    const phraseBytes = new TextEncoder().encode(userPhrase);
    const combined = new Uint8Array(presenceHash.length + phraseBytes.length);
    combined.set(presenceHash, 0);
    combined.set(phraseBytes, presenceHash.length);
    return sha256(combined);
  }
}

export interface GateUpdate {
  readonly isUnlocked: boolean;
  readonly identity: PublicIdentity | null;
  readonly unlockTime: number | null;
  readonly coherence: number;
  readonly stableTime: number;
  readonly progress: number;
}

export class CoherenceGate {
  public isUnlocked = false;
  public unlockTime: number | null = null;
  public identity: SovereignIdentity | null = null;

  public constructor(private readonly threshold: number = 0.65, private readonly requiredStableTime: number = 3) {}

  public async update(coherenceData: { readonly coherence: number; readonly stableTime: number }, presenceVector: readonly number[]): Promise<GateUpdate> {
    if (coherenceData.coherence >= this.threshold && coherenceData.stableTime >= this.requiredStableTime && !this.isUnlocked) {
      this.isUnlocked = true;
      this.unlockTime = Date.now();
      this.identity = await new SovereignIdentity().generate(PresenceHashGenerator.generateSeed(presenceVector));
    } else if (coherenceData.coherence < this.threshold * 0.8 && this.isUnlocked) {
      this.isUnlocked = false;
      this.unlockTime = null;
    }
    return { isUnlocked: this.isUnlocked, identity: this.identity?.exportPublic() ?? null, unlockTime: this.unlockTime, coherence: coherenceData.coherence, stableTime: coherenceData.stableTime, progress: Math.min(1, coherenceData.stableTime / this.requiredStableTime) };
  }

  public async issueCapability(resource: string, action: string, expiryMs: number = 3600000): Promise<CapabilityToken> {
    if (!this.isUnlocked || !this.identity || !this.identity.identityString) throw new Error('Identity not unlocked');
    return new CapabilityToken(this.identity.identityString, this.identity.identityString, resource, action, expiryMs).sign(this.identity);
  }
}

/** Vedic obfuscation is not encryption. It is a reversible-label-free numerical scrambling helper for non-secret display artifacts only. */
export class VedicObfuscation {
  public static readonly BASE_97 = 97;

  public static urdhvaTiryagbhyam(value: number, key: number): number {
    let safeValue = Math.abs(value) % this.BASE_97 ** 4;
    const safeKey = Math.abs(key) % this.BASE_97 ** 4;
    let result = 1;
    for (let index = 0; index < 3; index += 1) {
      result = (result * safeValue + safeKey) % this.BASE_97 ** 6;
      safeValue = (safeValue * safeKey) % this.BASE_97 ** 6;
    }
    return result;
  }

  public static ekadhikenaPurvena(value: number, depth: number): number {
    let result = value;
    for (let index = 0; index < depth; index += 1) result = (result * (result + 1)) % this.BASE_97 ** 4;
    return result;
  }

  public static obfuscatePresence(presenceVector: readonly number[], masterKey: number): readonly number[] {
    return presenceVector.map((value: number, index: number) => this.urdhvaTiryagbhyam(Math.floor(Math.abs(value) * 1000), this.ekadhikenaPurvena(masterKey + index, index + 1)));
  }
}
