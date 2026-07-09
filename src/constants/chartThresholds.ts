export const COLORS = {
  background: '#141820',
  card: '#1e2430',
  cardElevated: '#252d3b',
  accent: '#6b9fd4',
  accentLight: '#8bb8e8',
  accentMuted: '#5a8ac4',
  accentDeep: '#4a7ab0',
  headerBrown: '#a68b6a',
  text: '#e8ecf4',
  textMuted: '#9aa8bc',
  deltaNeutral: '#9aa8bc',
  deltaPositive: '#22c55e',
  deltaNegative: '#ef4444',
  deltaZero: '#9aa8bc',
  success: '#22c55e',
  error: '#ef4444',
  border: '#3a4558',
  inputBg: '#2a3344',
  overlay: 'rgba(8, 10, 14, 0.72)',
} as const;

export const CHART_VISIBLE_DAYS = 14;

export const chartThresholds: Record<
  string,
  { amber: number; red: number; unit: string }
> = {
  pulseBpm: { amber: 15, red: 25, unit: 'bpm' },
  systolic: { amber: 20, red: 30, unit: 'mmHg' },
  diastolic: { amber: 15, red: 25, unit: 'mmHg' },
};
