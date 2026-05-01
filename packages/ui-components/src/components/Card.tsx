/**
 * CARD COMPONENT
 * Container with golden ratio proportions and hover animations
 *
 * Persona: Dieter Rams (Less but better)
 * Frequency: 9 (Completion)
 */

import React, { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { SPACING, MUSEUM_THEME, FREQUENCIES } from '@asymm/sacred-geometry';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable hover animation */
  hover?: boolean;

  /** Animation frequency */
  frequency?: 3 | 6 | 9 | 27 | 48;

  /** Padding size (Fibonacci) */
  padding?: 1 | 2 | 3 | 4 | 5;

  /** Elevated appearance */
  elevated?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      hover = true,
      frequency = 6,
      padding = 4,
      elevated = false,
      className,
      style,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const duration = FREQUENCIES[frequency]?.duration || 377;

    const cardStyles: React.CSSProperties = {
      padding: `${SPACING[padding]}px`, // Fibonacci padding
      backgroundColor: elevated ? MUSEUM_THEME.BG.ELEVATED : MUSEUM_THEME.BG.TERTIARY,
      borderRadius: `${SPACING[2]}px`, // 13px
      border: `1px solid ${MUSEUM_THEME.BORDER.SUBTLE}`,
      transition: `all ${duration}ms cubic-bezier(0.618, 0, 0.382, 1)`,
      cursor: hover ? 'pointer' : 'default',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={clsx('asymm-card', className)}
        style={cardStyles}
        onMouseEnter={(e) => {
          if (hover) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 ${SPACING[2]}px ${SPACING[3]}px ${MUSEUM_THEME.SHADOW.LG}`;
            e.currentTarget.style.borderColor = MUSEUM_THEME.BORDER.STRONG;
          }
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (hover) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = MUSEUM_THEME.BORDER.SUBTLE;
          }
          onMouseLeave?.(e);
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
