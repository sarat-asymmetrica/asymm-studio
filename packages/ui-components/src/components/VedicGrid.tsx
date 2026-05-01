/**
 * VEDIC GRID (9×9)
 * Sacred geometry layout based on Vedic squares
 *
 * Persona: Bret Victor (Show, don't tell)
 * Frequency: 9 (Perfect completion - 9×9 grid)
 */

import React, { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { SPACING, DIGITAL_ROOT_COLORS, digitalRoot } from '@asymm/sacred-geometry';

export interface VedicGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Child elements to display in grid */
  children: ReactNode[];

  /** Gap between cells (Fibonacci index) */
  gap?: 0 | 1 | 2 | 3 | 4;

  /** Apply digital root colors to cells */
  colorize?: boolean;

  /** Number of columns (default 9 for Vedic) */
  columns?: 3 | 6 | 9;
}

/**
 * Vedic 9×9 Grid Layout
 *
 * Based on Vedic squares - each position has mathematical significance
 * Digital root coloring shows mathematical patterns
 *
 * @example
 * ```tsx
 * <VedicGrid gap={2} colorize>
 *   {items.map((item, i) => <Card key={i}>{item}</Card>)}
 * </VedicGrid>
 * ```
 */
export function VedicGrid({
  children,
  gap = 3,
  colorize = false,
  columns = 9,
  className,
  style,
  ...props
}: VedicGridProps) {
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${SPACING[gap]}px`,
    width: '100%',
    ...style,
  };

  return (
    <div
      className={clsx('asymm-vedic-grid', className)}
      style={gridStyles}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!child) return null;

        const root = digitalRoot(index + 1);
        const cellStyle: React.CSSProperties = colorize
          ? {
              backgroundColor: DIGITAL_ROOT_COLORS[root - 1],
              padding: `${SPACING[2]}px`,
              borderRadius: `${SPACING[1]}px`,
              color: '#fff',
            }
          : {};

        return (
          <div key={index} style={cellStyle}>
            {child}
          </div>
        );
      })}
    </div>
  );
}

VedicGrid.displayName = 'VedicGrid';
