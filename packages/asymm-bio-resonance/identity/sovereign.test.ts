import { describe, expect, it } from 'vitest';

import {
  CapabilityToken,
  CoherenceGate,
  PresenceHashGenerator,
  SovereignIdentity,
  VedicObfuscation,
  base32Decode,
  base32Encode
} from './sovereign.js';

const presenceVector: readonly number[] = [72, 18, 0.5, 0.2, 0.03, 108, 0.8];

describe('sovereign identity', () => {
  it('round-trips base32 bytes', () => {
    const bytes = new Uint8Array([1, 2, 3, 4, 5]);
    expect(Array.from(base32Decode(base32Encode(bytes)))).toEqual(Array.from(bytes));
  });

  it('rejects all-zero presence vectors', () => {
    expect(() => PresenceHashGenerator.generate([0, 0, 0])).toThrow(/all-zero/);
  });

  it('generates deterministic one-way presence hashes', () => {
    const first = PresenceHashGenerator.generate(presenceVector);
    const second = PresenceHashGenerator.generate(presenceVector);
    expect(Array.from(first)).toEqual(Array.from(second));
    expect(first).toHaveLength(32);
    expect(Array.from(first).join(',')).not.toContain(presenceVector.join(','));
  });

  it('uses Ed25519 identity signing and public-key verification', async () => {
    const identity = await new SovereignIdentity().generate(PresenceHashGenerator.generateSeed(presenceVector, 'phrase'));
    const message = new TextEncoder().encode('authorize');
    const signature = await identity.sign(message);
    expect(await identity.verify(message, signature)).toBe(true);
    expect(SovereignIdentity.verifyPublicKey(identity.publicKey!, identity.identityString!)).toBe(true);
  });

  it('rate-limits repeated identity generation by returning cached identity material', async () => {
    const seed = PresenceHashGenerator.generateSeed(presenceVector, 'rate-limit');
    const first = await new SovereignIdentity().generate(seed);
    const second = await new SovereignIdentity().generate(seed);
    expect(second.identityString).toBe(first.identityString);
    expect(second.createdAt).toBe(first.createdAt);
  });

  it('expires capability tokens', async () => {
    const identity = await new SovereignIdentity().generate(PresenceHashGenerator.generateSeed(presenceVector, 'token'));
    const token = await new CapabilityToken(identity.identityString!, identity.identityString!, 'lab', 'read', -1).sign(identity);
    expect(await token.verify(identity.publicKey!)).toBe(false);
  });

  it('unlocks through coherence gate and issues capability tokens', async () => {
    const gate = new CoherenceGate(0.65, 1);
    const state = await gate.update({ coherence: 0.8, stableTime: 1.2 }, presenceVector);
    expect(state.isUnlocked).toBe(true);
    const token = await gate.issueCapability('demo', 'view');
    expect(token.signature).not.toBeNull();
  });

  it('labels Vedic methods as obfuscation rather than encryption', () => {
    expect(VedicObfuscation.obfuscatePresence([1, 2, 3], 108)).toHaveLength(3);
    expect('encryptPresence' in VedicObfuscation).toBe(false);
  });
});
