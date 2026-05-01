import type { Landmark } from '../signals/index.js';

export type HandPose = 'open-palm' | 'fist' | 'point' | 'unknown';

export interface HandCalibrationResult {
  readonly pose: HandPose;
  readonly confidence: number;
  readonly openness: number;
}

function dist(left: Landmark, right: Landmark): number {
  return Math.hypot(left.x - right.x, left.y - right.y, (left.z ?? 0) - (right.z ?? 0));
}

export function classifyHandPose(landmarks: readonly Landmark[]): HandCalibrationResult {
  if (landmarks.length < 21 || !landmarks[0]) return { pose: 'unknown', confidence: 0, openness: 0 };
  const palm = landmarks[0];
  const tips = [4, 8, 12, 16, 20].map((index: number) => landmarks[index]).filter((point: Landmark | undefined): point is Landmark => point !== undefined);
  const openness = tips.reduce((sum: number, tip: Landmark) => sum + dist(palm, tip), 0) / Math.max(1, tips.length);
  const indexTip = landmarks[8];
  const otherTips = [landmarks[12], landmarks[16], landmarks[20]].filter((point: Landmark | undefined): point is Landmark => point !== undefined);
  const otherAverage = otherTips.reduce((sum: number, tip: Landmark) => sum + dist(palm, tip), 0) / Math.max(1, otherTips.length);
  if (openness > 0.28) return { pose: 'open-palm', confidence: Math.min(1, openness / 0.5), openness };
  if (indexTip && dist(palm, indexTip) > otherAverage * 1.8) return { pose: 'point', confidence: 0.85, openness };
  if (openness < 0.16) return { pose: 'fist', confidence: Math.min(1, (0.16 - openness) / 0.16 + 0.5), openness };
  return { pose: 'unknown', confidence: 0.3, openness };
}
