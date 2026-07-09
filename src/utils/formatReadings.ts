import type { Measurement, VitalMetric, VitalReading } from '../types/measurement';

export function getReadingValue(
  reading: VitalReading,
  metric: VitalMetric,
): number {
  return reading[metric];
}

export function formatDualValue(
  initial: number,
  followup: number,
): string {
  return `${initial} - ${followup}`;
}

export function formatReadingPair(
  initial: VitalReading,
  followup: VitalReading,
  metric: VitalMetric,
): string {
  return formatDualValue(initial[metric], followup[metric]);
}

export function formatMeasurementMetric(
  measurement: Measurement,
  metric: VitalMetric,
): string {
  return formatReadingPair(
    measurement.initial,
    measurement.followup,
    metric,
  );
}
