# @asymm/bio-resonance

Alpha-depth bio-resonance interaction substrate for Asymm Studio. The package provides local-only camera pipelines, PPG/coherence extraction, S3 quaternion math, privacy-preserving presence identity, calibration helpers, and Svelte demo components.

## Install

This package is workspace-local in `asymm_studio`.

```ts
import { MockSignalPipeline, PresenceHashGenerator } from '@asymm/bio-resonance';
```

`@mediapipe/tasks-vision` and `svelte` are peer dependencies. MediaPipe is used for live browser landmark detection; tests and no-camera demos use deterministic mock pipelines.

## Quick Start

```ts
import { MockSignalPipeline, PresenceHashGenerator } from '@asymm/bio-resonance';

const pipeline = new MockSignalPipeline({ bpm: 72 });
const reading = await pipeline.processFrame(10_000);
const presenceVector = [
  reading.signals.ppg?.bpm ?? 0,
  reading.signals.ppg?.variance ?? 0,
  reading.signals.coherence?.coherence ?? 0
];
const presenceHash = PresenceHashGenerator.generate(presenceVector);

console.info(Array.from(presenceHash).slice(0, 8));
```

## Privacy Model

Camera frames never leave the browser tab. Live processing draws frames into local browser memory, passes local pixels and landmarks into signal extraction, and exposes only derived interaction readings to UI components.

The identity layer stores and transmits only one-way presence hashes. `VedicObfuscation` is numerical obfuscation for non-secret display artifacts; it is not encryption.

See `docs/PRIVACY_THESIS.md` for the full model and `docs/CALIBRATION_RITUAL_SPEC.md` for the calibration ritual contract.

## API Surface

### Math

- `Quaternion`, `QuaternionField`, `ThreeRegimeTracker`
- Biomimetic kernels: `EagleKernel`, `OwlKernel`, `MantisKernel`, `FrogKernel`, `ViperKernel`, `DragonflyKernel`
- PDE tissues and bounded field evolution

### MediaPipe

- `createFaceMeshDetector(config)` selects live or mock mode.
- `FaceMeshIntegration` converts detector output into face state, blink state, gestures, and PPG regions.
- `MockFaceMeshDetector` and `createMockFaceLandmarks` provide deterministic tests and demos.

### Signals

- `UnifiedSignalExtractor` consumes `ImageFrame`, landmarks, and optional audio.
- `LiveSignalPipeline` adapts browser frames plus MediaPipe into extraction.
- `MockSignalPipeline` produces deterministic PPG and coherence for no-camera environments.

### Calibration

- `GazeCalibration`
- `estimateAnatomy`
- `classifyHandPose`
- `PresenceBaselineCollector`
- `RitualSequencer`
- `PRIVACY_FOOTER`

### Identity

- `PresenceHashGenerator`
- `SovereignIdentity`
- `CoherenceGate`
- `CapabilityToken`
- `VedicObfuscation`

## Component Gallery

Svelte components are exported from `components/index.ts` and the package root:

- `CalibrationRitual` - live/mock camera calibration with gaze, measurements, and presence hash.
- `GazeCursor` - attention cursor with paragraph focus and edge scrolling.
- `StressAdaptiveReader` - HRV/coherence-driven reading density, tone, and motion.
- `ContinuousAuthGuard` - slotted workspace guard that blurs content while presence is unstable.
- `PresenceAuth` - compact coherence-gated presence identity demo.

Every camera-facing component owns startup, teardown, error recovery, accessible controls, reduced-motion behavior, and visible privacy copy.
