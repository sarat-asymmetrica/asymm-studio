export type AestheticRegionName =
  | 'wabi-sabi'
  | 'neumorphic-soft'
  | 'brutal-raw'
  | 'glass-ethereal'
  | 'modernist-strict'
  | 'indie-craft'
  | 'research-paper'
  | 'ananta-warm';

export interface QuaternionBounds {
  readonly w: readonly [number, number];
  readonly x: readonly [number, number];
  readonly y: readonly [number, number];
  readonly z: readonly [number, number];
}

export interface RegionDesignParameters {
  readonly paletteType: string;
  readonly primaryHueRange: readonly [number, number];
  readonly contrastStrategy: 'soft' | 'strong' | 'translucent' | 'editorial';
  readonly headingWeight: number;
  readonly bodyWeight: number;
  readonly letterSpacing: string;
  readonly lineHeight: number;
  readonly spacingDensity: 'dense' | 'balanced' | 'spacious' | 'airy' | 'reading';
  readonly baseSpacingMultiplier: number;
  readonly radius: readonly [number, number, number];
  readonly motionEasing: string;
  readonly breathingHz: number;
  readonly durationScale: number;
}

export interface AestheticRegion {
  readonly name: AestheticRegionName;
  readonly label: string;
  readonly bounds: QuaternionBounds;
  readonly mood: readonly string[];
  readonly shape: string;
  readonly motion: string;
  readonly color: string;
  readonly spacing: string;
  readonly parameters: RegionDesignParameters;
}

export const AESTHETIC_REGIONS: readonly AestheticRegion[] = [
  {
    name: 'wabi-sabi',
    label: 'Wabi-Sabi',
    bounds: { w: [0.82, 1], x: [-0.22, 0.22], y: [-0.22, 0.22], z: [-0.22, 0.22] },
    mood: ['contemplative', 'warm', 'imperfect'],
    shape: 'low radius, organic asymmetry',
    motion: 'slow Apana settling',
    color: 'earth tones with soft gold',
    spacing: 'generous whitespace',
    parameters: {
      paletteType: 'earth-tones',
      primaryHueRange: [20, 45],
      contrastStrategy: 'soft',
      headingWeight: 300,
      bodyWeight: 400,
      letterSpacing: '0.02em',
      lineHeight: 1.8,
      spacingDensity: 'spacious',
      baseSpacingMultiplier: 1.618,
      radius: [2, 4, 8],
      motionEasing: 'apana',
      breathingHz: 0.3,
      durationScale: 1.4
    }
  },
  {
    name: 'neumorphic-soft',
    label: 'Neumorphic Soft',
    bounds: { w: [0.55, 0.8], x: [0.35, 0.75], y: [-0.25, 0.25], z: [-0.25, 0.25] },
    mood: ['clean', 'tactile', 'quiet'],
    shape: 'high radius, soft extruded surfaces',
    motion: 'medium Phi easing',
    color: 'pastel monochrome with shallow contrast',
    spacing: 'balanced modules',
    parameters: {
      paletteType: 'pastel-mono',
      primaryHueRange: [190, 225],
      contrastStrategy: 'soft',
      headingWeight: 500,
      bodyWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.6,
      spacingDensity: 'balanced',
      baseSpacingMultiplier: 1.25,
      radius: [12, 18, 24],
      motionEasing: 'phi',
      breathingHz: 0.618,
      durationScale: 1
    }
  },
  {
    name: 'brutal-raw',
    label: 'Brutal Raw',
    bounds: { w: [-0.85, -0.45], x: [0.35, 0.85], y: [-0.2, 0.2], z: [-0.45, 0.05] },
    mood: ['bold', 'direct', 'confrontational'],
    shape: 'zero radius, hard edges',
    motion: 'fast linear impact',
    color: 'black and white with saturated accent',
    spacing: 'dense and tight',
    parameters: {
      paletteType: 'high-contrast',
      primaryHueRange: [0, 12],
      contrastStrategy: 'strong',
      headingWeight: 800,
      bodyWeight: 500,
      letterSpacing: '0',
      lineHeight: 1.35,
      spacingDensity: 'dense',
      baseSpacingMultiplier: 0.75,
      radius: [0, 0, 0],
      motionEasing: 'linear',
      breathingHz: 2,
      durationScale: 0.72
    }
  },
  {
    name: 'glass-ethereal',
    label: 'Glass Ethereal',
    bounds: { w: [0.1, 0.45], x: [-0.75, -0.35], y: [0.35, 0.75], z: [-0.25, 0.25] },
    mood: ['ethereal', 'floating', 'cool'],
    shape: 'high radius, translucent blur',
    motion: 'slow Spanda shimmer',
    color: 'cool translucent blues and violets',
    spacing: 'airy separation',
    parameters: {
      paletteType: 'translucent-cool',
      primaryHueRange: [205, 265],
      contrastStrategy: 'translucent',
      headingWeight: 400,
      bodyWeight: 400,
      letterSpacing: '0.01em',
      lineHeight: 1.7,
      spacingDensity: 'airy',
      baseSpacingMultiplier: 1.618,
      radius: [16, 24, 34],
      motionEasing: 'spanda',
      breathingHz: 0.5,
      durationScale: 1.3
    }
  },
  {
    name: 'modernist-strict',
    label: 'Modernist Strict',
    bounds: { w: [-0.2, 0.2], x: [0.7, 1], y: [0.25, 0.6], z: [-0.15, 0.15] },
    mood: ['precise', 'systematic', 'restrained'],
    shape: 'geometric consistency',
    motion: 'measured ease-in-out',
    color: 'limited Swiss palette',
    spacing: 'strict grid',
    parameters: {
      paletteType: 'swiss-limited',
      primaryHueRange: [210, 235],
      contrastStrategy: 'strong',
      headingWeight: 600,
      bodyWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.5,
      spacingDensity: 'balanced',
      baseSpacingMultiplier: 1,
      radius: [2, 2, 4],
      motionEasing: 'easeInOut',
      breathingHz: 0.783,
      durationScale: 0.92
    }
  },
  {
    name: 'indie-craft',
    label: 'Indie Craft',
    bounds: { w: [0.1, 0.45], x: [-0.2, 0.25], y: [-0.85, -0.45], z: [0.25, 0.65] },
    mood: ['warm', 'handmade', 'playful'],
    shape: 'irregular but friendly',
    motion: 'Prana bounce',
    color: 'varied warm palette',
    spacing: 'relaxed rhythm',
    parameters: {
      paletteType: 'warm-varied',
      primaryHueRange: [10, 65],
      contrastStrategy: 'soft',
      headingWeight: 700,
      bodyWeight: 400,
      letterSpacing: '0.01em',
      lineHeight: 1.65,
      spacingDensity: 'spacious',
      baseSpacingMultiplier: 1.35,
      radius: [6, 10, 16],
      motionEasing: 'prana',
      breathingHz: 0.8,
      durationScale: 1.08
    }
  },
  {
    name: 'research-paper',
    label: 'Research Paper',
    bounds: { w: [-0.45, -0.1], x: [-0.25, 0.15], y: [0.15, 0.45], z: [0.65, 1] },
    mood: ['academic', 'serious', 'legible'],
    shape: 'minimal decoration',
    motion: 'nearly still',
    color: 'black on white with sparse accent',
    spacing: 'reading optimized',
    parameters: {
      paletteType: 'paper-mono',
      primaryHueRange: [210, 225],
      contrastStrategy: 'editorial',
      headingWeight: 600,
      bodyWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.72,
      spacingDensity: 'reading',
      baseSpacingMultiplier: 1.2,
      radius: [0, 2, 2],
      motionEasing: 'none',
      breathingHz: 0.3,
      durationScale: 0.5
    }
  },
  {
    name: 'ananta-warm',
    label: 'Ananta Warm',
    bounds: { w: [0.35, 0.75], x: [-0.45, -0.05], y: [0.05, 0.45], z: [0.55, 0.95] },
    mood: ['inviting', 'luminous', 'rooted'],
    shape: 'Fibonacci radius, golden composition',
    motion: 'Prana-Apana breathing',
    color: 'warm neutrals with saffron accent',
    spacing: 'golden ratio cadence',
    parameters: {
      paletteType: 'saffron-warm',
      primaryHueRange: [10, 45],
      contrastStrategy: 'strong',
      headingWeight: 650,
      bodyWeight: 400,
      letterSpacing: '0',
      lineHeight: 1.62,
      spacingDensity: 'spacious',
      baseSpacingMultiplier: 1.618,
      radius: [5, 13, 21],
      motionEasing: 'pranaApana',
      breathingHz: 0.5,
      durationScale: 1.12
    }
  }
];

export function getAestheticRegion(name: AestheticRegionName): AestheticRegion {
  const region: AestheticRegion | undefined = AESTHETIC_REGIONS.find(
    (candidate: AestheticRegion) => candidate.name === name
  );

  if (!region) {
    throw new Error(`Unknown aesthetic region: ${name}`);
  }

  return region;
}
