const FNV_OFFSET_BASIS: number = 0x811c9dc5;
const FNV_PRIME: number = 0x01000193;

export function contentHash(content: string): number {
  let hash: number = FNV_OFFSET_BASIS;

  for (let index: number = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }

  return hash;
}
