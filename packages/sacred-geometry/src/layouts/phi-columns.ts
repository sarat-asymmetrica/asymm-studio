/**
 * PHI COLUMNS LAYOUT
 * Golden ratio column divisions
 *
 * Foundation: φ = 1.618... (golden ratio)
 * Proportions: Each column is φ⁻¹ of remaining space
 * Use: Content layouts, sidebars, split views
 */

import { PHI, PHI_INVERSE, goldenDivide } from "../constants.js";

// ═══════════════════════════════════════════════════════════════════════════
// PHI COLUMNS TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface PhiColumn {
  index: number; // Column index (0-based)
  width: number; // Column width (pixels or %)
  x: number; // X position (pixels or %)
  proportion: number; // Proportion of total width (0-1)
}

export interface PhiColumnsLayout {
  columns: PhiColumn[];
  count: number;
  totalWidth: number;
  gap: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PHI COLUMNS GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate phi columns layout
 *
 * Each column is φ⁻¹ (0.618) of remaining space
 *
 * @param totalWidth - Total width
 * @param count - Number of columns
 * @param gap - Gap between columns (pixels)
 * @returns Phi columns layout
 *
 * @example
 * const layout = generatePhiColumns(1000, 2, 21);
 * // Creates two columns: [618px, 361px] with 21px gap
 */
export function generatePhiColumns(
  totalWidth: number,
  count: number,
  gap: number = 0
): PhiColumnsLayout {
  if (count <= 0) {
    return { columns: [], count: 0, totalWidth, gap };
  }

  const columns: PhiColumn[] = [];
  const totalGapWidth = gap * (count - 1);
  let availableWidth = totalWidth - totalGapWidth;

  let currentX = 0;

  for (let i = 0; i < count; i++) {
    let width: number;

    if (i === count - 1) {
      // Last column gets all remaining width
      width = availableWidth;
    } else {
      // Each column is φ⁻¹ of remaining
      width = availableWidth * PHI_INVERSE;
      availableWidth -= width;
    }

    columns.push({
      index: i,
      width,
      x: currentX,
      proportion: width / totalWidth,
    });

    currentX += width + gap;
  }

  return {
    columns,
    count,
    totalWidth,
    gap,
  };
}

/**
 * Generate two-column layout (classic golden ratio division)
 *
 * @param totalWidth - Total width
 * @param gap - Gap between columns
 * @param largerFirst - If true, larger column is first
 * @returns Two-column layout
 *
 * @example
 * const layout = generateTwoColumns(1000, 21, false);
 * // Creates [382px, 597px] (smaller first, larger second)
 */
export function generateTwoColumns(
  totalWidth: number,
  gap: number = 0,
  largerFirst: boolean = true
): PhiColumnsLayout {
  const availableWidth = totalWidth - gap;
  const [larger, smaller] = goldenDivide(availableWidth);

  const columns: PhiColumn[] = largerFirst
    ? [
        { index: 0, width: larger, x: 0, proportion: larger / totalWidth },
        {
          index: 1,
          width: smaller,
          x: larger + gap,
          proportion: smaller / totalWidth,
        },
      ]
    : [
        { index: 0, width: smaller, x: 0, proportion: smaller / totalWidth },
        {
          index: 1,
          width: larger,
          x: smaller + gap,
          proportion: larger / totalWidth,
        },
      ];

  return {
    columns,
    count: 2,
    totalWidth,
    gap,
  };
}

/**
 * Generate three-column layout (golden + golden subdivision)
 *
 * Divides space as: [φ⁻¹, φ⁻², φ⁻³ (remaining)]
 *
 * @param totalWidth - Total width
 * @param gap - Gap between columns
 * @returns Three-column layout
 */
export function generateThreeColumns(
  totalWidth: number,
  gap: number = 0
): PhiColumnsLayout {
  return generatePhiColumns(totalWidth, 3, gap);
}

// ═══════════════════════════════════════════════════════════════════════════
// NESTED GOLDEN RECTANGLES
// Spiral subdivision (classic golden rectangle spiral)
// ═══════════════════════════════════════════════════════════════════════════

export interface GoldenRectangle {
  level: number; // Nesting level (0 = outermost)
  x: number; // X position
  y: number; // Y position
  width: number; // Rectangle width
  height: number; // Rectangle height
  orientation: "horizontal" | "vertical"; // Division orientation
}

/**
 * Generate nested golden rectangles (spiral subdivision)
 *
 * Each level divides the previous rectangle in golden ratio
 *
 * @param width - Initial width
 * @param height - Initial height
 * @param levels - Number of nesting levels
 * @returns Array of nested rectangles
 *
 * @example
 * const rectangles = generateNestedGoldenRectangles(1000, 618, 5);
 * // Creates 5 nested rectangles forming golden spiral
 */
export function generateNestedGoldenRectangles(
  width: number,
  height: number,
  levels: number
): GoldenRectangle[] {
  const rectangles: GoldenRectangle[] = [];

  let currentX = 0;
  let currentY = 0;
  let currentWidth = width;
  let currentHeight = height;
  let orientation: "horizontal" | "vertical" = width > height ? "horizontal" : "vertical";

  for (let level = 0; level < levels; level++) {
    rectangles.push({
      level,
      x: currentX,
      y: currentY,
      width: currentWidth,
      height: currentHeight,
      orientation,
    });

    // Divide current rectangle
    if (orientation === "horizontal") {
      // Divide horizontally (left = φ⁻¹, right = remaining)
      const leftWidth = currentWidth * PHI_INVERSE;
      const rightWidth = currentWidth - leftWidth;

      // Next rectangle is the right part
      currentX += leftWidth;
      currentWidth = rightWidth;
      currentHeight = currentHeight; // Same height
      orientation = "vertical"; // Next division is vertical
    } else {
      // Divide vertically (top = φ⁻¹, bottom = remaining)
      const topHeight = currentHeight * PHI_INVERSE;
      const bottomHeight = currentHeight - topHeight;

      // Next rectangle is the bottom part
      currentY += topHeight;
      currentWidth = currentWidth; // Same width
      currentHeight = bottomHeight;
      orientation = "horizontal"; // Next division is horizontal
    }
  }

  return rectangles;
}

// ═══════════════════════════════════════════════════════════════════════════
// CSS GRID HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert phi columns to CSS grid template
 * @param layout - Phi columns layout
 * @returns CSS grid-template-columns string
 *
 * @example
 * toGridTemplate(layout) → "618fr 382fr"
 */
export function toGridTemplate(layout: PhiColumnsLayout): string {
  return layout.columns.map((col) => `${col.width}fr`).join(" ");
}

/**
 * Convert phi columns to CSS flex basis
 * @param layout - Phi columns layout
 * @returns Array of flex-basis values (percentages)
 */
export function toFlexBasis(layout: PhiColumnsLayout): string[] {
  return layout.columns.map((col) => `${(col.proportion * 100).toFixed(2)}%`);
}

/**
 * Convert phi columns to CSS styles object
 * @param layout - Phi columns layout
 * @returns CSS styles for grid container
 */
export function phiColumnsToCSS(layout: PhiColumnsLayout): Record<string, string | number> {
  return {
    display: "grid",
    gridTemplateColumns: toGridTemplate(layout),
    gap: `${layout.gap}px`,
    width: `${layout.totalWidth}px`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIVE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get responsive column layout
 * Adapts number of columns based on viewport width
 *
 * @param viewportWidth - Current viewport width
 * @param breakpoints - Breakpoint configuration
 * @returns Column layout for current viewport
 */
export function getResponsiveColumns(
  viewportWidth: number,
  breakpoints: {
    mobile: number; // Max width for 1 column
    tablet: number; // Max width for 2 columns
    desktop: number; // 3+ columns
  } = { mobile: 640, tablet: 1024, desktop: 1440 },
  gap: number = 21
): PhiColumnsLayout {
  if (viewportWidth <= breakpoints.mobile) {
    // Mobile: 1 column (full width)
    return generatePhiColumns(viewportWidth, 1, gap);
  } else if (viewportWidth <= breakpoints.tablet) {
    // Tablet: 2 columns (golden ratio split)
    return generateTwoColumns(viewportWidth, gap);
  } else {
    // Desktop: 3 columns (golden subdivisions)
    return generateThreeColumns(viewportWidth, gap);
  }
}

/**
 * Get column for content type
 * Recommends column layout based on content type
 *
 * @param contentType - Type of content
 * @param totalWidth - Total available width
 * @returns Recommended column layout
 */
export function getColumnForContent(
  contentType: "reading" | "dashboard" | "sidebar" | "gallery",
  totalWidth: number,
  gap: number = 21
): PhiColumnsLayout {
  switch (contentType) {
    case "reading":
      // Reading: Single centered column with golden ratio width
      const readingWidth = Math.min(totalWidth * PHI_INVERSE, 680);
      return generatePhiColumns(readingWidth, 1, gap);

    case "sidebar":
      // Sidebar: Asymmetric split (sidebar smaller)
      return generateTwoColumns(totalWidth, gap, false); // Smaller first

    case "dashboard":
      // Dashboard: 3 columns (primary, secondary, tertiary)
      return generateThreeColumns(totalWidth, gap);

    case "gallery":
      // Gallery: Equal columns (override phi for visual balance)
      const columnCount = Math.floor(totalWidth / 300); // ~300px per column
      return generatePhiColumns(totalWidth, columnCount, gap);

    default:
      return generateTwoColumns(totalWidth, gap);
  }
}
