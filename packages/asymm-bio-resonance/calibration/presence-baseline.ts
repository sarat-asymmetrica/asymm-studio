import type { PPGReading } from '../signals/index.js';

export interface PresenceBaseline {
  readonly restingHeartRate: number | null;
  readonly blinkRate: number;
  readonly ppgConfidence: number;
  readonly sampleCount: number;
}

export class PresenceBaselineCollector {
  private readonly ppgReadings: PPGReading[] = [];
  private readonly blinkRates: number[] = [];

  public addPPG(reading: PPGReading): void {
    this.ppgReadings.push(reading);
  }

  public addBlinkRate(blinkRate: number): void {
    if (Number.isFinite(blinkRate) && blinkRate >= 0) this.blinkRates.push(blinkRate);
  }

  public getBaseline(): PresenceBaseline {
    const confident = this.ppgReadings.filter((reading: PPGReading) => reading.bpm !== null && reading.confidence > 0.7);
    const restingHeartRate = confident.length > 0 ? confident.reduce((sum: number, reading: PPGReading) => sum + (reading.bpm ?? 0), 0) / confident.length : null;
    const blinkRate = this.blinkRates.length > 0 ? this.blinkRates.reduce((sum: number, value: number) => sum + value, 0) / this.blinkRates.length : 0;
    const ppgConfidence = this.ppgReadings.length > 0 ? this.ppgReadings.reduce((sum: number, reading: PPGReading) => sum + reading.confidence, 0) / this.ppgReadings.length : 0;
    return { restingHeartRate, blinkRate, ppgConfidence, sampleCount: this.ppgReadings.length };
  }
}
