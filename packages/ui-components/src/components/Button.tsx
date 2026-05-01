/**
 * BUTTON COMPONENT
 * Sacred geometry-based button with Fibonacci sizing and φ proportions
 *
 * Persona: Dieter Rams + Bret Victor
 * Frequency: 9 (Completion)
 */

import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { SPACING, MUSEUM_THEME, FREQUENCIES } from '@asymm/sacred-geometry';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  /** Size based on Fibonacci sequence */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Animation frequency (Hz) */
  frequency?: 3 | 6 | 9 | 27 | 48;

  /** Full width button */
  fullWidth?: boolean;

  /** Loading state */
  loading?: boolean;
}

/**
 * Button component with sacred geometry principles
 *
 * Features:
 * - Fibonacci spacing (8, 13, 21, 34, 55 px)
 * - Golden ratio proportions
 * - Frequency-based animations
 * - Museum atelier aesthetic
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" frequency={9}>
 *   Complete Action
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      frequency = 9,
      fullWidth = false,
      loading = false,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    // Fibonacci sizing (padding)
    const paddingMap = {
      sm: `${SPACING[1]}px ${SPACING[2]}px`, // 8px 13px
      md: `${SPACING[2]}px ${SPACING[4]}px`, // 13px 34px
      lg: `${SPACING[3]}px ${SPACING[5]}px`, // 21px 55px
      xl: `${SPACING[4]}px ${SPACING[6]}px`, // 34px 89px
    };

    // Fibonacci font sizes
    const fontSizeMap = {
      sm: SPACING[2], // 13px
      md: SPACING[3], // 21px
      lg: SPACING[4], // 34px
      xl: SPACING[5], // 55px
    };

    // Border radius (Fibonacci)
    const borderRadiusMap = {
      sm: SPACING[1], // 8px
      md: SPACING[2], // 13px
      lg: SPACING[2], // 13px
      xl: SPACING[3], // 21px
    };

    // Variant colors (Museum theme)
    const variantStyles = {
      primary: {
        backgroundColor: MUSEUM_THEME.ACCENT.PRIMARY,
        color: MUSEUM_THEME.TEXT.PRIMARY,
        border: 'none',
      },
      secondary: {
        backgroundColor: MUSEUM_THEME.BG.TERTIARY,
        color: MUSEUM_THEME.TEXT.PRIMARY,
        border: `1px solid ${MUSEUM_THEME.BORDER.DEFAULT}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: MUSEUM_THEME.TEXT.SECONDARY,
        border: `1px solid ${MUSEUM_THEME.BORDER.SUBTLE}`,
      },
      danger: {
        backgroundColor: MUSEUM_THEME.ACCENT.ERROR,
        color: MUSEUM_THEME.TEXT.PRIMARY,
        border: 'none',
      },
    };

    // Get frequency-based duration
    const duration = FREQUENCIES[frequency]?.duration || 233;
    const easingFunc = 'cubic-bezier(0.618, 0, 0.382, 1)'; // Golden ratio easing

    const buttonStyles: React.CSSProperties = {
      // Layout
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: fullWidth ? '100%' : 'auto',

      // Spacing (Fibonacci)
      padding: paddingMap[size],

      // Typography
      fontSize: `${fontSizeMap[size]}px`,
      fontWeight: 500,
      lineHeight: 1.618, // φ ratio for readability
      fontFamily: 'Inter, system-ui, sans-serif',

      // Appearance
      borderRadius: `${borderRadiusMap[size]}px`,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,

      // Transition (Frequency-based)
      transition: `all ${duration}ms ${easingFunc}`,

      // Variant-specific
      ...variantStyles[variant],

      // User styles override
      ...style,
    };

    return (
      <button
        ref={ref}
        className={clsx('asymm-button', className)}
        style={buttonStyles}
        disabled={disabled || loading}
        onMouseEnter={(e) => {
          if (!disabled && !loading) {
            const target = e.currentTarget;
            target.style.transform = 'translateY(-2px)';
            target.style.boxShadow = '0 8px 21px rgba(0, 0, 0, 0.3)';
          }
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget;
          target.style.transform = 'translateY(0)';
          target.style.boxShadow = 'none';
        }}
        onFocus={(e) => {
          const target = e.currentTarget;
          target.style.outline = `2px solid ${MUSEUM_THEME.ACCENT.PRIMARY}`;
          target.style.outlineOffset = '2px';
        }}
        onBlur={(e) => {
          const target = e.currentTarget;
          target.style.outline = 'none';
        }}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
