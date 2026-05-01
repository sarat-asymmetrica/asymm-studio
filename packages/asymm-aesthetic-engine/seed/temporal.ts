import { contentHash } from './content-hash.js';

function utcDateKey(date: Date): string {
  const year: string = date.getUTCFullYear().toString().padStart(4, '0');
  const month: string = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day: string = date.getUTCDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function temporalSeed(date: Date = new Date()): number {
  return contentHash(`asymm:temporal:${utcDateKey(date)}`);
}
