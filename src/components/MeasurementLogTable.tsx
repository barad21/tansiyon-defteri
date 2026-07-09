import { appStrings } from '../i18n/appStrings';
import type { Measurement } from '../types/measurement';
import { formatMeasurementMetric } from '../utils/formatReadings';
import { formatDisplayDate, periodLabel } from '../utils/validation';
import styles from '../styles/measurementLogTable.module.css';

interface MeasurementLogTableProps {
  measurements: Measurement[];
  onEdit: (measurement: Measurement) => void;
  onDelete: (measurement: Measurement) => void;
}

export function MeasurementLogTable({
  measurements,
  onEdit,
  onDelete,
}: MeasurementLogTableProps) {
  if (measurements.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{appStrings.noDataInRange}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{appStrings.dateLabel}</th>
            <th>{appStrings.timeLabel}</th>
            <th>{appStrings.pulseLabel}</th>
            <th>{appStrings.systolicLabel}</th>
            <th>{appStrings.diastolicLabel}</th>
            <th>{appStrings.actionsLabel}</th>
          </tr>
        </thead>
        <tbody>
          {measurements.map((m) => (
            <tr key={m.id}>
              <td>{formatDisplayDate(m.date)}</td>
              <td>{periodLabel(m.period)}</td>
              <td className={styles.dualValue}>
                {formatMeasurementMetric(m, 'pulseBpm')}
              </td>
              <td className={styles.dualValue}>
                {formatMeasurementMetric(m, 'systolic')}
              </td>
              <td className={styles.dualValue}>
                {formatMeasurementMetric(m, 'diastolic')}
              </td>
              <td className={styles.actions}>
                <button type="button" onClick={() => onEdit(m)}>
                  {appStrings.edit}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => onDelete(m)}
                >
                  {appStrings.delete}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
