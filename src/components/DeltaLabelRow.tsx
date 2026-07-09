import type { DayChartData } from '../services/chartDataService';
import { DeltaText } from './DeltaText';
import styles from '../styles/charts.module.css';

interface DeltaLabelRowProps {
  data: DayChartData[];
}

export function DeltaLabelRow({ data }: DeltaLabelRowProps) {
  return (
    <div className={styles.deltaRow}>
      {data.map((day) => (
        <DeltaText key={day.date} delta={day.delta} />
      ))}
    </div>
  );
}
