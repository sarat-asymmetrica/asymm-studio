/**
 * VEDIC 9×9 GRID LAYOUT
 * Sacred square layout with digital root color harmony
 *
 * Foundation: Vedic square (9×9 multiplication table)
 * Colors: Digital root mapping (1-9 → distinct hues)
 * Spacing: Fibonacci progression
 */

import { digitalRoot, FIBONACCI } from "../constants.js";
import { getDigitalRootColor } from "../colors.js";
import { SPACING } from "../spacing.js";

// ═══════════════════════════════════════════════════════════════════════════
// VEDIC GRID TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VedicCell {
  row: number; // 0-8
  col: number; // 0-8
  value: number; // Cell value (row+1) × (col+1)
  digitalRoot: number; // Digital root (1-9)
  color: string; // Hex color
  x: number; // X position (pixels)
  y: number; // Y position (pixels)
  width: number; // Cell width (pixels)
  height: number; // Cell height (pixels)
}

export interface VedicGrid {
  rows: number; // 9
  columns: number; // 9
  cells: VedicCell[][]; // 9×9 array
  totalWidth: number; // Total width (pixels)
  totalHeight: number; // Total height (pixels)
  spacing: number; // Gap between cells (Fibonacci)
}

// ═══════════════════════════════════════════════════════════════════════════
// VEDIC GRID GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Vedic 9×9 grid
 *
 * @param width - Total width in pixels
 * @param height - Total height in pixels (defaults to width for square)
 * @param gapScale - Gap size (0-8, Fibonacci spacing scale)
 * @returns Vedic grid configuration
 *
 * @example
 * const grid = generateVedicGrid(900, 900, 3);
 * // Creates 9×9 grid, 900px × 900px, 21px gaps (Fibonacci[8])
 */
export function generateVedicGrid(
  width: number,
  height?: number,
  gapScale: number = 3
): VedicGrid {
  height = height ?? width; // Default to square

  const gap = SPACING[gapScale as keyof typeof SPACING] || SPACING[3]; // Default 21px

  // Calculate cell dimensions
  const totalGapWidth = gap * 8; // 8 gaps between 9 columns
  const totalGapHeight = gap * 8; // 8 gaps between 9 rows

  const cellWidth = (width - totalGapWidth) / 9;
  const cellHeight = (height - totalGapHeight) / 9;

  // Generate cells
  const cells: VedicCell[][] = [];

  for (let row = 0; row < 9; row++) {
    cells[row] = [];
    for (let col = 0; col < 9; col++) {
      const value = (row + 1) * (col + 1); // Vedic square value
      const dr = digitalRoot(value);
      const color = getDigitalRootColor(dr);

      const x = col * (cellWidth + gap);
      const y = row * (cellHeight + gap);

      cells[row][col] = {
        row,
        col,
        value,
        digitalRoot: dr,
        color,
        x,
        y,
        width: cellWidth,
        height: cellHeight,
      };
    }
  }

  return {
    rows: 9,
    columns: 9,
    cells,
    totalWidth: width,
    totalHeight: height,
    spacing: gap,
  };
}

/**
 * Get cell at (row, col)
 * @param grid - Vedic grid
 * @param row - Row index (0-8)
 * @param col - Column index (0-8)
 * @returns Cell or undefined if out of bounds
 */
export function getCell(grid: VedicGrid, row: number, col: number): VedicCell | undefined {
  if (row < 0 || row >= 9 || col < 0 || col >= 9) return undefined;
  return grid.cells[row][col];
}

/**
 * Get all cells with specific digital root
 * @param grid - Vedic grid
 * @param dr - Digital root (1-9)
 * @returns Array of cells with matching digital root
 */
export function getCellsByDigitalRoot(grid: VedicGrid, dr: number): VedicCell[] {
  const result: VedicCell[] = [];

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cell = grid.cells[row][col];
      if (cell.digitalRoot === dr) {
        result.push(cell);
      }
    }
  }

  return result;
}

/**
 * Get cells forming a pattern (horizontal, vertical, diagonal)
 */
export function getPattern(grid: VedicGrid, pattern: "horizontal" | "vertical" | "diagonal-main" | "diagonal-anti"): VedicCell[] {
  const result: VedicCell[] = [];

  switch (pattern) {
    case "horizontal":
      // Middle horizontal (row 4)
      for (let col = 0; col < 9; col++) {
        result.push(grid.cells[4][col]);
      }
      break;

    case "vertical":
      // Middle vertical (col 4)
      for (let row = 0; row < 9; row++) {
        result.push(grid.cells[row][4]);
      }
      break;

    case "diagonal-main":
      // Main diagonal (top-left to bottom-right)
      for (let i = 0; i < 9; i++) {
        result.push(grid.cells[i][i]);
      }
      break;

    case "diagonal-anti":
      // Anti-diagonal (top-right to bottom-left)
      for (let i = 0; i < 9; i++) {
        result.push(grid.cells[i][8 - i]);
      }
      break;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// REACT COMPONENT HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert Vedic grid to CSS grid styles
 * @param grid - Vedic grid
 * @returns CSS styles object
 */
export function vedicGridToCSS(grid: VedicGrid): Record<string, string | number> {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(9, ${grid.cells[0][0].width}px)`,
    gridTemplateRows: `repeat(9, ${grid.cells[0][0].height}px)`,
    gap: `${grid.spacing}px`,
    width: `${grid.totalWidth}px`,
    height: `${grid.totalHeight}px`,
  };
}

/**
 * Get cell CSS styles
 * @param cell - Vedic cell
 * @returns CSS styles object
 */
export function cellToCSS(cell: VedicCell): Record<string, string | number> {
  return {
    backgroundColor: cell.color,
    gridRow: cell.row + 1,
    gridColumn: cell.col + 1,
  };
}
