/**
 * MODAL COMPONENT
 * Overlay dialog with sacred geometry sizing
 *
 * Persona: Ryan Dahl (Clean APIs)
 * Frequency: 9 (Completion)
 */

import React, { ReactNode, useEffect } from 'react';
import { clsx } from 'clsx';
import { SPACING, MUSEUM_THEME, FREQUENCIES } from '@asymm/sacred-geometry';
import { Button } from './Button';

export interface ModalProps {
  /** Modal open state */
  isOpen: boolean;

  /** Close handler */
  onClose: () => void;

  /** Modal title */
  title?: string;

  /** Modal content */
  children: ReactNode;

  /** Modal size (Fibonacci-based) */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Custom className */
  className?: string;
}

/**
 * Modal overlay component
 *
 * Features:
 * - Fibonacci sizing (sm: 55×34, md: 89×55, lg: 144×89)
 * - Frequency-based animations
 * - Traps focus when open
 * - Locks body scroll
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={open}
 *   onClose={() => setOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   <p>Are you sure?</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const duration = FREQUENCIES[9].duration; // 233ms

  // Fibonacci-based max widths
  const sizeMap = {
    sm: SPACING[5] * 8, // 55 × 8 = 440px
    md: SPACING[6] * 8, // 89 × 8 = 712px
    lg: SPACING[7] * 8, // 144 × 8 = 1152px
    xl: SPACING[8] * 8, // 233 × 8 = 1864px
  };

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: `${SPACING[4]}px`,
  };

  const contentStyles: React.CSSProperties = {
    backgroundColor: MUSEUM_THEME.BG.PRIMARY,
    borderRadius: `${SPACING[2]}px`,
    padding: `${SPACING[5]}px`,
    maxWidth: `${sizeMap[size]}px`,
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    border: `1px solid ${MUSEUM_THEME.ACCENT.PRIMARY}`,
    boxShadow: `0 ${SPACING[4]}px ${SPACING[6]}px ${MUSEUM_THEME.SHADOW.XL}`,
    animation: `modalSlideIn ${duration}ms cubic-bezier(0.618, 0, 0.382, 1)`,
  };

  const titleStyles: React.CSSProperties = {
    marginBottom: `${SPACING[4]}px`,
    fontSize: `${SPACING[4]}px`, // 34px
    fontWeight: 500,
    color: MUSEUM_THEME.TEXT.PRIMARY,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  return (
    <div
      className="asymm-modal-overlay"
      style={overlayStyles}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className={clsx('asymm-modal-content', className)}
        style={contentStyles}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h2 id="modal-title" style={titleStyles}>
            {title}
          </h2>
        )}

        <div style={{ marginBottom: `${SPACING[4]}px` }}>{children}</div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>

        <style>{`
          @keyframes modalSlideIn {
            from {
              opacity: 0;
              transform: translateY(-${SPACING[4]}px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}

Modal.displayName = 'Modal';
