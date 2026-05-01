/**
 * PHI COLUMNS
 * Two-column layout with golden ratio proportions
 *
 * Persona: Euclid + Dieter Rams
 * Frequency: φ (1.618...)
 */

import React, { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { SPACING, PHI } from '@asymm/sacred-geometry';

export interface PhiColumnsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Left column content */
  left: ReactNode;

  /** Right column content */
  right: ReactNode;

  /** Gap between columns (Fibonacci index) */
  gap?: 0 | 1 | 2 | 3 | 4 | 5;

  /** Reverse proportions (left becomes larger) */
  reverse?: boolean;
}

/**
 * Golden ratio two-column layout
 *
 * Default: Left = 61.8%, Right = 38.2%
 * Reverse: Left = 38.2%, Right = 61.8%
 *
 * @example
 * ```tsx
 * <PhiColumns
 *   left={<Sidebar />}
 *   right={<MainContent />}
 *   gap={3}
 *   reverse
 * />
 * ```
 */
export function PhiColumns({
  left,
  right,
  gap = 3,
  reverse = false,
  className,
  style,
  ...props
}: PhiColumnsProps) {
  const PHI_INVERSE = 1 / PHI; // 0.618...

  const leftWidth = reverse ? PHI_INVERSE * 100 : (1 - PHI_INVERSE) * 100;
  const rightWidth = reverse ? (1 - PHI_INVERSE) * 100 : PHI_INVERSE * 100;

  const containerStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `${leftWidth}% ${rightWidth}%`,
    gap: `${SPACING[gap]}px`,
    width: '100%',
    ...style,
  };

  return (
    <div
      className={clsx('asymm-phi-columns', className)}
      style={containerStyles}
      {...props}
    >
      <div className="phi-left">{left}</div>
      <div className="phi-right">{right}</div>
    </div>
  );
}

PhiColumns.displayName = 'PhiColumns';
