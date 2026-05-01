/**
 * FREQUENCY SWITCHER
 * Interactive UI for switching animation frequencies
 *
 * Persona: Bret Victor (Immediate visual feedback)
 * Frequency: ALL (3, 6, 9, 27, 48 Hz)
 */

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { SPACING, MUSEUM_THEME, FREQUENCIES, FREQUENCY_COLORS, type FrequencyKey } from '@asymm/sacred-geometry';

export interface FrequencySwitcherProps {
  /** Initial frequency */
  defaultFrequency?: FrequencyKey;

  /** Callback when frequency changes */
  onChange?: (frequency: FrequencyKey) => void;

  /** Position on screen */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

  /** Custom className */
  className?: string;
}

/**
 * Frequency Switcher
 *
 * Visual control for selecting animation frequencies:
 * - 3 Hz: Slow contemplation (987ms)
 * - 6 Hz: Relaxed flow (610ms)
 * - 9 Hz: Perfect completion (377ms)
 * - 27 Hz: Quick response (144ms)
 * - 48 Hz: Instantaneous (89ms)
 *
 * @example
 * ```tsx
 * <FrequencySwitcher
 *   defaultFrequency={9}
 *   onChange={(freq) => console.log('Frequency:', freq)}
 *   position="bottom-right"
 * />
 * ```
 */
export function FrequencySwitcher({
  defaultFrequency = 9,
  onChange,
  position = 'bottom-right',
  className,
}: FrequencySwitcherProps) {
  const [currentFreq, setCurrentFreq] = useState<FrequencyKey>(defaultFrequency);

  const frequencies: FrequencyKey[] = [3, 6, 9, 27, 48];

  const handleFrequencyChange = (freq: FrequencyKey) => {
    setCurrentFreq(freq);
    onChange?.(freq);
  };

  const positionMap = {
    'bottom-right': { bottom: SPACING[3], right: SPACING[3] },
    'bottom-left': { bottom: SPACING[3], left: SPACING[3] },
    'top-right': { top: SPACING[3], right: SPACING[3] },
    'top-left': { top: SPACING[3], left: SPACING[3] },
  };

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    ...positionMap[position],
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[2]}px`,
    padding: `${SPACING[2]}px`,
    backgroundColor: MUSEUM_THEME.BG.TERTIARY,
    borderRadius: `${SPACING[2]}px`,
    border: `1px solid ${MUSEUM_THEME.BORDER.DEFAULT}`,
    zIndex: 999,
  };

  const labelStyles: React.CSSProperties = {
    fontSize: `${SPACING[2]}px`,
    color: MUSEUM_THEME.TEXT.SECONDARY,
    fontWeight: 500,
    marginBottom: `${SPACING[1]}px`,
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const frequenciesContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: `${SPACING[1]}px`,
  };

  return (
    <div
      className={clsx('asymm-frequency-switcher', className)}
      style={containerStyles}
    >
      <div style={labelStyles}>Frequency</div>

      <div style={frequenciesContainerStyles}>
        {frequencies.map((freq) => {
          const isActive = currentFreq === freq;
          const freqData = FREQUENCIES[freq];

          const buttonStyles: React.CSSProperties = {
            width: `${SPACING[5]}px`, // 55px (Fibonacci)
            height: `${SPACING[5]}px`,
            borderRadius: '50%',
            backgroundColor: FREQUENCY_COLORS[freq],
            border: isActive ? `3px solid ${MUSEUM_THEME.ACCENT.PRIMARY}` : 'none',
            cursor: 'pointer',
            transition: `all ${freqData.duration}ms cubic-bezier(0.618, 0, 0.382, 1)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${SPACING[2]}px`,
            fontWeight: 'bold',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
          };

          return (
            <button
              key={freq}
              onClick={() => handleFrequencyChange(freq)}
              style={buttonStyles}
              title={`${freq} Hz - ${freqData.use} (${freqData.duration}ms)`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = `0 ${SPACING[1]}px ${SPACING[2]}px rgba(0, 0, 0, 0.3)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              aria-label={`Select ${freq} Hz frequency`}
            >
              {freq}
            </button>
          );
        })}
      </div>

      <div
        style={{
          fontSize: `${SPACING[1]}px`,
          color: MUSEUM_THEME.TEXT.TERTIARY,
          marginTop: `${SPACING[1]}px`,
        }}
      >
        {FREQUENCIES[currentFreq].duration}ms
      </div>
    </div>
  );
}

FrequencySwitcher.displayName = 'FrequencySwitcher';
