import { createLiveFaceMeshDetector } from './live-facemesh.js';
import type { LiveFaceMeshConfig } from './live-facemesh.js';
import { MockFaceMeshDetector } from './mock-facemesh.js';
import type { FaceMeshDetector, MockFaceMeshConfig } from './mock-facemesh.js';

export type FaceMeshFactoryMode = 'auto' | 'live' | 'mock';

export interface FaceMeshEnvironment {
  readonly hasNavigator: boolean;
  readonly hasCameraApi: boolean;
  readonly hasWindow: boolean;
}

export interface FaceMeshFactoryResult {
  readonly detector: FaceMeshDetector;
  readonly mode: 'live' | 'mock';
  readonly reason: string;
}

export interface FaceMeshFactoryConfig extends Partial<LiveFaceMeshConfig> {
  readonly mode?: FaceMeshFactoryMode;
  readonly mock?: Partial<MockFaceMeshConfig>;
  readonly environment?: FaceMeshEnvironment;
  readonly liveDetectorFactory?: (config: Partial<LiveFaceMeshConfig>) => Promise<FaceMeshDetector>;
}

export async function createFaceMeshDetector(config: FaceMeshFactoryConfig = {}): Promise<FaceMeshFactoryResult> {
  const mode = config.mode ?? 'auto';
  if (mode === 'mock') return mockResult(config.mock, 'Mock face tracking requested.');

  const environment = config.environment ?? detectFaceMeshEnvironment();
  if (mode === 'auto' && !canUseLiveFaceMesh(environment)) {
    return mockResult(config.mock, 'Camera or browser vision APIs are unavailable; using simulated landmarks.');
  }

  try {
    const detectorFactory = config.liveDetectorFactory ?? createLiveFaceMeshDetector;
    const detector = await detectorFactory(config);
    return { detector, mode: 'live', reason: 'Live MediaPipe face tracking is active.' };
  } catch (_error: unknown) {
    if (mode === 'live') return mockResult(config.mock, 'Live MediaPipe could not start; using simulated landmarks.');
    return mockResult(config.mock, 'MediaPipe is unavailable in this environment; using simulated landmarks.');
  }
}

export function detectFaceMeshEnvironment(): FaceMeshEnvironment {
  const nav = typeof navigator !== 'undefined' ? navigator : null;
  return {
    hasNavigator: nav !== null,
    hasCameraApi: typeof nav?.mediaDevices?.getUserMedia === 'function',
    hasWindow: typeof window !== 'undefined'
  };
}

export function canUseLiveFaceMesh(environment: FaceMeshEnvironment): boolean {
  return environment.hasNavigator && environment.hasCameraApi && environment.hasWindow;
}

function mockResult(config: Partial<MockFaceMeshConfig> | undefined, reason: string): FaceMeshFactoryResult {
  return { detector: new MockFaceMeshDetector(config), mode: 'mock', reason };
}
