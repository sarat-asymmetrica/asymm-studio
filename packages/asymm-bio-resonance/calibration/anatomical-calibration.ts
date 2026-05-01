import type { Landmark } from '../signals/index.js';

export interface AnatomicalMeasurements {
  readonly interpupillaryDistancePx: number;
  readonly estimatedInterpupillaryDistanceMm: number;
  readonly headWidthPx: number;
  readonly estimatedViewingDistanceCm: number;
}

function distance(left: Landmark, right: Landmark): number {
  return Math.hypot(left.x - right.x, left.y - right.y, (left.z ?? 0) - (right.z ?? 0));
}

export function estimateAnatomy(landmarks: readonly Landmark[], frameWidth: number): AnatomicalMeasurements {
  const leftEye = landmarks[33] ?? landmarks[0];
  const rightEye = landmarks[263] ?? landmarks[1] ?? leftEye;
  const leftFace = landmarks[234] ?? leftEye;
  const rightFace = landmarks[454] ?? rightEye;
  const interpupillaryDistancePx = distance(leftEye, rightEye) * frameWidth;
  const headWidthPx = distance(leftFace, rightFace) * frameWidth;
  const estimatedInterpupillaryDistanceMm = 63;
  const focalLengthPx = frameWidth;
  const estimatedViewingDistanceCm = interpupillaryDistancePx > 0 ? (estimatedInterpupillaryDistanceMm * focalLengthPx) / interpupillaryDistancePx / 10 : 0;
  return { interpupillaryDistancePx, estimatedInterpupillaryDistanceMm, headWidthPx, estimatedViewingDistanceCm };
}
