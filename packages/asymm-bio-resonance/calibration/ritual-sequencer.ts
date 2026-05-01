export type RitualStepId =
  | 'look-upper-left'
  | 'look-upper-right'
  | 'look-lower-right'
  | 'look-lower-left'
  | 'open-palm'
  | 'fist'
  | 'point'
  | 'welcome';

export interface RitualStep {
  readonly id: RitualStepId;
  readonly instruction: string;
  readonly durationMs: number;
  readonly target?: { readonly x: number; readonly y: number };
}

export interface RitualState {
  readonly step: RitualStep;
  readonly stepIndex: number;
  readonly progress: number;
  readonly complete: boolean;
  readonly privacyFooter: string;
}

export const PRIVACY_FOOTER = 'Your camera frames never left this browser tab.';

export function createDefaultRitualSteps(durationMs: number = 3000): readonly RitualStep[] {
  return [
    { id: 'look-upper-left', instruction: 'Look at this dot', durationMs, target: { x: 0.1, y: 0.1 } },
    { id: 'look-upper-right', instruction: 'Look at this dot', durationMs, target: { x: 0.9, y: 0.1 } },
    { id: 'look-lower-right', instruction: 'Look at this dot', durationMs, target: { x: 0.9, y: 0.9 } },
    { id: 'look-lower-left', instruction: 'Look at this dot', durationMs, target: { x: 0.1, y: 0.9 } },
    { id: 'open-palm', instruction: 'Show your open palm', durationMs },
    { id: 'fist', instruction: 'Make a fist', durationMs },
    { id: 'point', instruction: 'Point at the screen', durationMs },
    { id: 'welcome', instruction: 'Welcome', durationMs: 0 }
  ];
}

export class RitualSequencer {
  private stepIndex = 0;
  private stepStartedAt = 0;

  public constructor(private readonly steps: readonly RitualStep[] = createDefaultRitualSteps()) {
    if (steps.length === 0) throw new Error('RitualSequencer requires at least one step.');
  }

  public start(now: number): RitualState {
    this.stepIndex = 0;
    this.stepStartedAt = now;
    return this.getState(now);
  }

  public update(now: number): RitualState {
    const current = this.steps[this.stepIndex] ?? this.steps[this.steps.length - 1];
    if (current.durationMs > 0 && now - this.stepStartedAt >= current.durationMs && this.stepIndex < this.steps.length - 1) {
      this.stepIndex += 1;
      this.stepStartedAt = now;
    }
    return this.getState(now);
  }

  public getState(now: number): RitualState {
    const step = this.steps[this.stepIndex] ?? this.steps[this.steps.length - 1];
    const progress = step.durationMs > 0 ? Math.min(1, Math.max(0, (now - this.stepStartedAt) / step.durationMs)) : 1;
    return { step, stepIndex: this.stepIndex, progress, complete: this.stepIndex === this.steps.length - 1, privacyFooter: PRIVACY_FOOTER };
  }
}
