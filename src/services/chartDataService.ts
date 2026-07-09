import { COLORS } from '../constants/chartThresholds';
import { appStrings } from '../i18n/appStrings';
import type { Measurement, VitalMetric } from '../types/measurement';
import { getReadingValue } from '../utils/formatReadings';
import { formatShortDate } from '../utils/validation';

export interface DayChartData {
  date: string;
  label: string;
  sabahInitial: number | null;
  sabahFollowup: number | null;
  aksamInitial: number | null;
  aksamFollowup: number | null;
  delta: number | null;
}

export function buildChartData(
  measurements: Measurement[],
  metric: VitalMetric,
  visibleDays: number,
  offset = 0,
): DayChartData[] {
  const byDate = new Map<
    string,
    {
      sabahInitial: number | null;
      sabahFollowup: number | null;
      aksamInitial: number | null;
      aksamFollowup: number | null;
    }
  >();

  for (const m of measurements) {
    const entry = byDate.get(m.date) ?? {
      sabahInitial: null,
      sabahFollowup: null,
      aksamInitial: null,
      aksamFollowup: null,
    };

    if (m.period === 'sabah') {
      entry.sabahInitial = getReadingValue(m.initial, metric);
      entry.sabahFollowup = getReadingValue(m.followup, metric);
    } else {
      entry.aksamInitial = getReadingValue(m.initial, metric);
      entry.aksamFollowup = getReadingValue(m.followup, metric);
    }

    byDate.set(m.date, entry);
  }

  const sortedDates = [...byDate.keys()].sort((a, b) => a.localeCompare(b));
  const sliced = sortedDates.slice(
    Math.max(0, sortedDates.length - visibleDays - offset),
    sortedDates.length - offset,
  );

  return sliced.map((date) => {
    const entry = byDate.get(date)!;
    const delta =
      entry.sabahInitial !== null && entry.aksamInitial !== null
        ? entry.aksamInitial - entry.sabahInitial
        : null;

    return {
      date,
      label: formatShortDate(date),
      ...entry,
      delta,
    };
  });
}

export function getDeltaColor(_metric: VitalMetric, delta: number | null): string {
  if (delta === null) {
    return COLORS.deltaNeutral;
  }
  if (delta > 0) {
    return COLORS.deltaPositive;
  }
  if (delta < 0) {
    return COLORS.deltaNegative;
  }
  return COLORS.deltaZero;
}

export function formatDelta(delta: number | null): string {
  if (delta === null) {
    return appStrings.deltaMissing;
  }
  if (delta === 0) {
    return 'Δ 0';
  }
  const sign = delta > 0 ? '+' : '';
  return `Δ ${sign}${delta}`;
}

export function getLatestCompleteDayDelta(
  measurements: Measurement[],
  metric: VitalMetric,
): { delta: number; date: string } | null {
  const byDate = new Map<
    string,
    { sabahInitial: number | null; aksamInitial: number | null }
  >();

  for (const m of measurements) {
    const entry = byDate.get(m.date) ?? {
      sabahInitial: null,
      aksamInitial: null,
    };
    const value = getReadingValue(m.initial, metric);
    if (m.period === 'sabah') {
      entry.sabahInitial = value;
    } else {
      entry.aksamInitial = value;
    }
    byDate.set(m.date, entry);
  }

  const completeDates = [...byDate.entries()]
    .filter(([, v]) => v.sabahInitial !== null && v.aksamInitial !== null)
    .map(([date]) => date)
    .sort((a, b) => b.localeCompare(a));

  if (completeDates.length === 0) {
    return null;
  }

  const date = completeDates[0];
  const entry = byDate.get(date)!;
  return { date, delta: entry.aksamInitial! - entry.sabahInitial! };
}

export function computeVisibleDays(
  containerWidth: number,
  preferredDays: number,
): number {
  const cellWidth = containerWidth / preferredDays;
  if (cellWidth >= 40) {
    return preferredDays;
  }
  if (containerWidth / 10 >= 40) {
    return 10;
  }
  return 7;
}

export function computeBarSize(cellWidth: number): number {
  return Math.max(3, Math.min(14, cellWidth / 4));
}

export function shouldRotateLabels(cellWidth: number): boolean {
  return cellWidth < 60;
}
