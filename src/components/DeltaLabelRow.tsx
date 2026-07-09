import type { DayChartData } from '../services/chartDataService';
import { DeltaText } from './DeltaText';
import styles from '../styles/charts.module.css';

interface DeltaLabelRowProps {
  data: DayChartData[];
  marginLeft: number;
  marginRight: number;
}

export function DeltaLabelRow({
  data,
  marginLeft,
  marginRight,
}: DeltaLabelRowProps) {
  return (
    <div
      className={styles.deltaRow}
      style={{
        paddingLeft: marginLeft,
        paddingRight: marginRight,
      }}
    >
      {data.map((day) => (
        <DeltaText key={day.date} delta={day.delta} />
      ))}
    </div>
  );
}
