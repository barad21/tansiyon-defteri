import { appStrings } from '../i18n/appStrings';
import type {
  MeasurementInput,
  ValidationResult,
  VitalReading,
} from '../types/measurement';

function validateReading(reading: VitalReading): ValidationResult {
  const { pulseBpm, systolic, diastolic } = reading;

  if (
    Number.isNaN(pulseBpm) ||
    Number.isNaN(systolic) ||
    Number.isNaN(diastolic)
  ) {
    return { valid: false, error: appStrings.requiredFieldError };
  }

  if (pulseBpm < 30 || pulseBpm > 220) {
    return { valid: false, error: appStrings.pulseRangeError };
  }

  if (systolic < 70 || systolic > 250) {
    return { valid: false, error: appStrings.systolicRangeError };
  }

  if (diastolic < 40 || diastolic > 150) {
    return { valid: false, error: appStrings.diastolicRangeError };
  }

  if (diastolic >= systolic) {
    return { valid: false, error: appStrings.diastolicLessThanSystolicError };
  }

  return { valid: true };
}

export function validateMeasurement(input: MeasurementInput): ValidationResult {
  const initialCheck = validateReading(input.initial);
  if (!initialCheck.valid) {
    return initialCheck;
  }

  const followupCheck = validateReading(input.followup);
  if (!followupCheck.valid) {
    return followupCheck;
  }

  return { valid: true };
}

export function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDisplayDate(value: string): string {
  const date = parseIsoDate(value);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
  });
}

export function formatShortDate(value: string): string {
  const date = parseIsoDate(value);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
  });
}

export function periodLabel(period: 'sabah' | 'aksam'): string {
  return period === 'sabah' ? appStrings.sabah : appStrings.aksam;
}

export function periodShort(period: 'sabah' | 'aksam'): string {
  return period === 'sabah' ? appStrings.sabahShort : appStrings.aksamShort;
}
