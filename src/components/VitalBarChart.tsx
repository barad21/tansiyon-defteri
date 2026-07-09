import { useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_VISIBLE_DAYS, chartThresholds, COLORS } from '../constants/chartThresholds';
import { appStrings } from '../i18n/appStrings';
import {
  buildChartData,
  computeBarSize,
  computeVisibleDays,
  getLatestCompleteDayDelta,
  shouldRotateLabels,
} from '../services/chartDataService';
import type { Measurement, VitalMetric } from '../types/measurement';
import { formatDualValue } from '../utils/formatReadings';
import { DeltaLabelRow } from './DeltaLabelRow';
import { DeltaInline } from './DeltaText';
import styles from '../styles/charts.module.css';

interface VitalBarChartProps {
  measurements: Measurement[];
  metric: VitalMetric;
  title: string;
  containerWidth: number;
}

interface TooltipPayload {
  payload: {
    date: string;
    sabahInitial: number | null;
    sabahFollowup: number | null;
    aksamInitial: number | null;
    aksamFollowup: number | null;
    delta: number | null;
  };
}

export function VitalBarChart({
  measurements,
  metric,
  title,
  containerWidth,
}: VitalBarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [dayOffset, setDayOffset] = useState(0);

  const visibleDays = useMemo(
    () => computeVisibleDays(containerWidth, CHART_VISIBLE_DAYS),
    [containerWidth],
  );

  const chartData = useMemo(
    () => buildChartData(measurements, metric, visibleDays, dayOffset),
    [measurements, metric, visibleDays, dayOffset],
  );

  const latestDelta = useMemo(
    () => getLatestCompleteDayDelta(measurements, metric),
    [measurements, metric],
  );

  const cellWidth = containerWidth / Math.max(chartData.length, 1);
  const barSize = computeBarSize(cellWidth);
  const rotate = shouldRotateLabels(cellWidth);
  const unit = chartThresholds[metric].unit;

  const rechartsData = chartData.map((d) => ({
    ...d,
    sabahInitialValue: d.sabahInitial,
    sabahFollowupValue: d.sabahFollowup,
    aksamInitialValue: d.aksamInitial,
    aksamFollowupValue: d.aksamFollowup,
  }));

  const canShowMore =
    dayOffset + visibleDays <
    new Set(measurements.map((m) => m.date)).size;

  return (
    <div className={styles.chartCard} ref={chartRef}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>{title}</h3>
        {latestDelta && (
          <p className={styles.chartSummary}>
            {appStrings.lastDayDeltaPrefix}{' '}
            <DeltaInline
              delta={latestDelta.delta}
              suffix={<span className={styles.deltaUnit}> {unit}</span>}
            />
          </p>
        )}
      </div>

      <div className={styles.chartBody}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rechartsData}
            margin={{ top: 24, right: 16, bottom: 8, left: 48 }}
            barGap={1}
            barCategoryGap="18%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: COLORS.textMuted }}
              angle={rotate ? -45 : 0}
              textAnchor={rotate ? 'end' : 'middle'}
              height={rotate ? 50 : 30}
              interval={0}
            />
            <YAxis tick={{ fontSize: 12, fill: COLORS.textMuted }} width={42} />
            <Legend wrapperStyle={{ fontSize: '11px', color: COLORS.textMuted }} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = (payload[0] as TooltipPayload).payload;
                return (
                  <div className={styles.tooltip}>
                    <strong>{item.date}</strong>
                    {item.sabahInitial !== null && item.sabahFollowup !== null && (
                      <div>
                        {appStrings.sabah}:{' '}
                        {formatDualValue(item.sabahInitial, item.sabahFollowup)}
                      </div>
                    )}
                    {item.aksamInitial !== null && item.aksamFollowup !== null && (
                      <div>
                        {appStrings.aksam}:{' '}
                        {formatDualValue(item.aksamInitial, item.aksamFollowup)}
                      </div>
                    )}
                    {item.delta !== null && (
                      <div>{appStrings.tooltipDelta(item.delta)}</div>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="sabahInitialValue"
              name={appStrings.sabahInitialShort}
              fill={COLORS.accentLight}
              barSize={barSize}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="sabahFollowupValue"
              name={appStrings.sabahFollowupShort}
              fill={COLORS.accentMuted}
              barSize={barSize}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="aksamInitialValue"
              name={appStrings.aksamInitialShort}
              fill={COLORS.accent}
              barSize={barSize}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="aksamFollowupValue"
              name={appStrings.aksamFollowupShort}
              fill={COLORS.accentDeep}
              barSize={barSize}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DeltaLabelRow data={chartData} />

      {canShowMore && (
        <button
          type="button"
          className={styles.showMoreChip}
          onClick={() => setDayOffset((o) => o + visibleDays)}
        >
          {appStrings.showMore}
        </button>
      )}
    </div>
  );
}
