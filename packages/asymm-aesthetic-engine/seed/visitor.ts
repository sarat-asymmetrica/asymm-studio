import { contentHash } from './content-hash.js';

export function visitorSeed(fingerprint: string): number {
  return contentHash(`asymm:visitor:opt-in:${fingerprint}`);
}
