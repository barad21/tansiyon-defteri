export type MeasurementPeriod = 'sabah' | 'aksam';

export interface VitalReading {
  pulseBpm: number;
  systolic: number;
  diastolic: number;
}

export interface Measurement {
  id: number;
  date: string;
  period: MeasurementPeriod;
  initial: VitalReading;
  followup: VitalReading;
  recordedAt: string;
}

export interface MeasurementInput {
  date: string;
  period: MeasurementPeriod;
  initial: VitalReading;
  followup: VitalReading;
}

export type VitalMetric = 'pulseBpm' | 'systolic' | 'diastolic';
export type ReadingPhase = 'initial' | 'followup';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}
