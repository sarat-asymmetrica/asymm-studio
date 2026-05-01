/**
 * PHYLLOTAXIS SPIRAL LAYOUT
 * Sunflower seed arrangement (golden angle spiral)
 *
 * Foundation: Golden angle (137.5°) - optimal divergence for packing
 * Found in: Sunflowers, pinecones, artichokes, galaxies
 * Use: Particle spawning, menu arrangements, data visualization
 */

import { GOLDEN_ANGLE, PHI, digitalRoot } from "../constants.js";
import { getDigitalRootColor } from "../colors.js";

// ═══════════════════════════════════════════════════════════════════════════
// PHYLLOTAXIS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PhyllotaxisPoint {
  index: number; // Point index (0-based)
  angle: number; // Angle in degrees
  angleRad: number; // Angle in radians
  radius: number; // Distance from center
  x: number; // X coordinate
  y: number; // Y coordinate
  size: number; // Point size (radius)
  color: string; // Point color (digital root)
  digitalRoot: number; // Digital root (1-9)
}

export interface PhyllotaxisLayout {
  points: PhyllotaxisPoint[];
  centerX: number;
  centerY: number;
  count: number;
  maxRadius: number;
  scale: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PHYLLOTAXIS GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate phyllotaxis spiral layout
 *
 * @param count - Number of points
 * @param centerX - Center X coordinate
 * @param centerY - Center Y coordinate
 * @param scale - Spacing scale (affects density)
 * @param sizeRange - Point size range [min, max]
 * @returns Phyllotaxis layout
 *
 * @example
 * const layout = generatePhyllotaxis(144, 400, 400, 10, [2, 8]);
 * // Creates sunflower spiral with 144 points centered at (400, 400)
 */
export function generatePhyllotaxis(
  count: number,
  centerX: number,
  centerY: number,
  scale: number = 10,
  sizeRange: [number, number] = [3, 8]
): PhyllotaxisLayout {
  const points: PhyllotaxisPoint[] = [];
  const goldenAngleRad = (GOLDEN_ANGLE * Math.PI) / 180;

  let maxRadius = 0;

  for (let i = 0; i < count; i++) {
    const angle = i * GOLDEN_ANGLE;
    const angleRad = i * goldenAngleRad;

    // Radius grows with square root (Vogel model)
    const radius = scale * Math.sqrt(i);

    // Position
    const x = centerX + radius * Math.cos(angleRad);
    const y = centerY + radius * Math.sin(angleRad);

    // Size varies with φ-based progression
    const sizeFactor = Math.pow(PHI, (i % 13) / 13); // Cycle through φ scale
    const size = sizeRange[0] + (sizeRange[1] - sizeRange[0]) * (sizeFactor - 1) / (PHI - 1);

    // Color based on digital root
    const dr = digitalRoot(i + 1);
    const color = getDigitalRootColor(dr);

    points.push({
      index: i,
      angle,
      angleRad,
      radius,
      x,
      y,
      size,
      color,
      digitalRoot: dr,
    });

    maxRadius = Math.max(maxRadius, radius);
  }

  return {
    points,
    centerX,
    centerY,
    count,
    maxRadius,
    scale,
  };
}

/**
 * Generate phyllotaxis with custom color mapping
 * @param count - Number of points
 * @param centerX - Center X
 * @param centerY - Center Y
 * @param scale - Spacing scale
 * @param colorFn - Custom color function (index → color)
 * @returns Phyllotaxis layout
 */
export function generatePhyllotaxisCustom(
  count: number,
  centerX: number,
  centerY: number,
  scale: number,
  colorFn: (index: number) => string
): PhyllotaxisLayout {
  const layout = generatePhyllotaxis(count, centerX, centerY, scale);

  // Override colors with custom function
  layout.points.forEach((point, index) => {
    point.color = colorFn(index);
  });

  return layout;
}

/**
 * Get points within radius
 * @param layout - Phyllotaxis layout
 * @param radius - Radius from center
 * @returns Points within radius
 */
export function getPointsWithinRadius(
  layout: PhyllotaxisLayout,
  radius: number
): PhyllotaxisPoint[] {
  return layout.points.filter((p) => p.radius <= radius);
}

/**
 * Get points in angle range
 * @param layout - Phyllotaxis layout
 * @param startAngle - Start angle (degrees)
 * @param endAngle - End angle (degrees)
 * @returns Points in angle range
 */
export function getPointsInAngleRange(
  layout: PhyllotaxisLayout,
  startAngle: number,
  endAngle: number
): PhyllotaxisPoint[] {
  return layout.points.filter((p) => {
    const angle = p.angle % 360;
    return angle >= startAngle && angle <= endAngle;
  });
}

/**
 * Get nearest points to coordinate
 * @param layout - Phyllotaxis layout
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param count - Number of nearest points
 * @returns Nearest points (sorted by distance)
 */
export function getNearestPoints(
  layout: PhyllotaxisLayout,
  x: number,
  y: number,
  count: number = 5
): PhyllotaxisPoint[] {
  const distances = layout.points.map((point) => ({
    point,
    distance: Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2),
  }));

  distances.sort((a, b) => a.distance - b.distance);

  return distances.slice(0, count).map((d) => d.point);
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Animate phyllotaxis growth
 * Returns point visibility based on growth progress
 *
 * @param layout - Phyllotaxis layout
 * @param progress - Growth progress (0-1)
 * @returns Visible points
 */
export function animateGrowth(
  layout: PhyllotaxisLayout,
  progress: number
): PhyllotaxisPoint[] {
  progress = Math.max(0, Math.min(1, progress));
  const visibleCount = Math.floor(layout.count * progress);
  return layout.points.slice(0, visibleCount);
}

/**
 * Animate phyllotaxis spiral out
 * Points fade in based on their radius
 *
 * @param layout - Phyllotaxis layout
 * @param progress - Spiral progress (0-1)
 * @returns Points with opacity
 */
export function animateSpiralOut(
  layout: PhyllotaxisLayout,
  progress: number
): Array<PhyllotaxisPoint & { opacity: number }> {
  progress = Math.max(0, Math.min(1, progress));
  const maxVisibleRadius = layout.maxRadius * progress;

  return layout.points.map((point) => {
    let opacity = 0;

    if (point.radius <= maxVisibleRadius) {
      // Fade in near edge
      const fadeRange = layout.maxRadius * 0.1; // 10% fade range
      const fadeStart = maxVisibleRadius - fadeRange;

      if (point.radius >= fadeStart) {
        opacity = (point.radius - fadeStart) / fadeRange;
      } else {
        opacity = 1;
      }
    }

    return { ...point, opacity };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// CANVAS RENDERING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Render phyllotaxis to canvas
 * @param canvas - Canvas element
 * @param layout - Phyllotaxis layout
 * @param options - Rendering options
 */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  layout: PhyllotaxisLayout,
  options: {
    backgroundColor?: string;
    stroke?: boolean;
    strokeColor?: string;
    strokeWidth?: number;
  } = {}
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Clear with background
  if (options.backgroundColor) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Draw points
  layout.points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size, 0, 2 * Math.PI);

    // Fill
    ctx.fillStyle = point.color;
    ctx.fill();

    // Stroke (optional)
    if (options.stroke) {
      ctx.strokeStyle = options.strokeColor || "#000000";
      ctx.lineWidth = options.strokeWidth || 1;
      ctx.stroke();
    }
  });
}

/**
 * Export phyllotaxis as SVG
 * @param layout - Phyllotaxis layout
 * @param width - SVG width
 * @param height - SVG height
 * @returns SVG string
 */
export function toSVG(layout: PhyllotaxisLayout, width: number, height: number): string {
  const circles = layout.points
    .map(
      (point) =>
        `<circle cx="${point.x}" cy="${point.y}" r="${point.size}" fill="${point.color}" />`
    )
    .join("\n");

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${circles}
</svg>`;
}
