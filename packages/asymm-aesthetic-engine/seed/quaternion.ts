import { contentHash } from './content-hash.js';

const UINT64_MASK_BITS: number = 64;
const XORSHIFT_MODULUS: bigint = 100000n;

export class Quaternion {
  public readonly w: number;
  public readonly x: number;
  public readonly y: number;
  public readonly z: number;

  public constructor(w: number, x: number, y: number, z: number) {
    this.w = w;
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public magnitude(): number {
    return Math.hypot(this.w, this.x, this.y, this.z);
  }

  public norm(): number {
    return this.magnitude();
  }

  public normalize(): Quaternion {
    const magnitude: number = this.magnitude();

    if (magnitude === 0) {
      return new Quaternion(1, 0, 0, 0);
    }

    return new Quaternion(
      this.w / magnitude,
      this.x / magnitude,
      this.y / magnitude,
      this.z / magnitude
    );
  }

  public toArray(): readonly [number, number, number, number] {
    return [this.w, this.x, this.y, this.z];
  }
}

function seedToUint64(seed: number | string): bigint {
  if (typeof seed === 'string') {
    return BigInt(contentHash(seed));
  }

  if (!Number.isFinite(seed)) {
    return 1n;
  }

  return BigInt.asUintN(UINT64_MASK_BITS, BigInt(Math.trunc(seed)));
}

function nextUnitInterval(state: bigint): readonly [bigint, number] {
  let nextState: bigint = state;
  nextState ^= nextState << 13n;
  nextState ^= nextState >> 7n;
  nextState ^= nextState << 17n;
  nextState = BigInt.asUintN(UINT64_MASK_BITS, nextState);

  return [nextState, Number(nextState % XORSHIFT_MODULUS) / Number(XORSHIFT_MODULUS)];
}

export function SeedToQuaternion(seed: number | string): Quaternion {
  let state: bigint = seedToUint64(seed);

  if (state === 0n) {
    state = 1n;
  }

  const first: readonly [bigint, number] = nextUnitInterval(state);
  const second: readonly [bigint, number] = nextUnitInterval(first[0]);
  const third: readonly [bigint, number] = nextUnitInterval(second[0]);
  const fourth: readonly [bigint, number] = nextUnitInterval(third[0]);

  return new Quaternion(
    first[1] * 2 - 1,
    second[1] * 2 - 1,
    third[1] * 2 - 1,
    fourth[1] * 2 - 1
  ).normalize();
}

export const seedToQuaternion: (seed: number | string) => Quaternion = SeedToQuaternion;
