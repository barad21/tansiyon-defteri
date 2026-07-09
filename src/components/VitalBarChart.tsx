import { useMemo, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_VISIBLE_DAYS, chartThresholds, COLORS } from '../constants/chartThresholds';
import { appStrings } from '../i18n/appStrings';
import { useElementSize } from '../hooks/useElementSize';
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

const Y_AXIS_WIDTH = 36;
const CHART_MARGIN = {
  top: 8,
  right: 8,
  bottom: 4,
  left: 4,
} as const;

export function VitalBarChart({
  measurements,
  metric,
  title,
}: VitalBarChartProps) {
  const chartBodyRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth, height: containerHeight } =
    useElementSize(chartBodyRef);
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

  const cellWidth =
    containerWidth > 0
      ? (containerWidth - Y_AXIS_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right) /
        Math.max(chartData.length, 1)
      : 0;
  const barSize = computeBarSize(cellWidth);
  const rotate = shouldRotateLabels(cellWidth);
  const unit = chartThresholds[metric].unit;
  const xAxisHeight = rotate ? 44 : 28;
  const legendHeight = 28;
  const deltaRowHeight = 24;
  const plotHeight = Math.max(
    120,
    containerHeight - xAxisHeight - legendHeight - deltaRowHeight,
  );

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
    <div className={styles.chartCard}>
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

      <div className={styles.chartBody} ref={chartBodyRef}>
        {containerWidth > 0 && containerHeight > 0 && (
          <BarChart
            width={containerWidth}
            height={plotHeight}
            data={rechartsData}
            margin={CHART_MARGIN}
            barGap={1}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: COLORS.textMuted }}
              angle={rotate ? -40 : 0}
              textAnchor={rotate ? 'end' : 'middle'}
              height={xAxisHeight}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: COLORS.textMuted }}
              width={Y_AXIS_WIDTH}
            />
            <Legend
              layout="horizontal"
              align="center"
              verticalAlign="top"
              iconSize={8}
              wrapperStyle={{
                fontSize: '10px',
                color: COLORS.textMuted,
                width: '100%',
                left: 0,
                paddingBottom: 4,
              }}
            />
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
        )}
      </div>

      <DeltaLabelRow
        data={chartData}
        marginLeft={Y_AXIS_WIDTH + CHART_MARGIN.left}
        marginRight={CHART_MARGIN.right}
      />

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
