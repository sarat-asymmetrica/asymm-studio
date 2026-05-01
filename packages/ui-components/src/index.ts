/**
 * @asymm/ui-components
 * Sacred Geometry React Components
 *
 * Mathematical UI components with φ proportions, Fibonacci spacing,
 * and frequency-based animations.
 *
 * @packageDocumentation
 */

// Core Atoms
export { Button, type ButtonProps } from './components/Button';
export { Input, type InputProps } from './components/Input';
export { Card, type CardProps } from './components/Card';

// Layout Molecules
export { VedicGrid, type VedicGridProps } from './components/VedicGrid';
export { PhiColumns, type PhiColumnsProps } from './components/PhiColumns';

// Interactive Organisms
export { Modal, type ModalProps } from './components/Modal';

// Artistic Innovations
export { FrequencySwitcher, type FrequencySwitcherProps } from './components/FrequencySwitcher';

// Re-export design tokens from sacred-geometry
export type { FrequencyKey } from '@asymm/sacred-geometry';
export {
  PHI,
  PHI_INVERSE,
  FIBONACCI,
  SPACING,
  MUSEUM_THEME,
  FREQUENCIES,
  FREQUENCY_COLORS,
  DIGITAL_ROOT_COLORS,
  digitalRoot,
  phi,
  prana,
  apana,
} from '@asymm/sacred-geometry';
