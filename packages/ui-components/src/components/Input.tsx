/**
 * INPUT COMPONENT
 * Form input with Fibonacci spacing and sacred geometry
 *
 * Persona: Sophie Alpert (Mental model simplicity)
 * Frequency: 6 (Flow)
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { SPACING, MUSEUM_THEME, FREQUENCIES } from '@asymm/sacred-geometry';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label */
  label?: string;

  /** Error message */
  error?: string;

  /** Helper text */
  helperText?: string;

  /** Full width */
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className,
      style,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const duration = FREQUENCIES[6].duration; // 377ms (Flow)

    const inputStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      padding: `${SPACING[2]}px ${SPACING[3]}px`, // 13px 21px
      backgroundColor: MUSEUM_THEME.BG.TERTIARY,
      border: `1px solid ${error ? MUSEUM_THEME.ACCENT.ERROR : MUSEUM_THEME.BORDER.DEFAULT}`,
      borderRadius: `${SPACING[1]}px`, // 8px
      color: MUSEUM_THEME.TEXT.PRIMARY,
      fontSize: `${SPACING[3]}px`, // 21px
      fontFamily: 'Inter, system-ui, sans-serif',
      lineHeight: 1.618, // φ
      transition: `all ${duration}ms cubic-bezier(0.618, 0, 0.382, 1)`,
      outline: 'none',
      ...style,
    };

    const labelStyles: React.CSSProperties = {
      display: 'block',
      marginBottom: `${SPACING[1]}px`, // 8px
      fontSize: `${SPACING[2]}px`, // 13px
      color: MUSEUM_THEME.TEXT.SECONDARY,
      fontWeight: 500,
    };

    const helperStyles: React.CSSProperties = {
      marginTop: `${SPACING[1]}px`, // 8px
      fontSize: `${SPACING[1]}px`, // 8px (tiny but readable)
      color: error ? MUSEUM_THEME.ACCENT.ERROR : MUSEUM_THEME.TEXT.TERTIARY,
    };

    return (
      <div style={{ marginBottom: fullWidth ? `${SPACING[3]}px` : 0 }}>
        {label && (
          <label htmlFor={inputId} style={labelStyles}>
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={clsx('asymm-input', className)}
          style={inputStyles}
          onFocus={(e) => {
            e.target.style.borderColor = error
              ? MUSEUM_THEME.ACCENT.ERROR
              : MUSEUM_THEME.ACCENT.PRIMARY;
            e.target.style.boxShadow = `0 0 0 3px ${error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(14, 165, 233, 0.1)'}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error
              ? MUSEUM_THEME.ACCENT.ERROR
              : MUSEUM_THEME.BORDER.DEFAULT;
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />

        {(error || helperText) && (
          <p style={helperStyles}>{error || helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
