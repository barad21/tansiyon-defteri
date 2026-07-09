import { appStrings } from '../i18n/appStrings';
import styles from '../styles/stepIndicator.module.css';

interface StepIndicatorProps {
  current: number;
  total: number;
}

export function StepIndicator({ current, total }: StepIndicatorProps) {
  return (
    <div className={styles.indicator}>
      <span>{appStrings.stepIndicator(current, total)}</span>
      <div className={styles.dots}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`${styles.dot} ${i + 1 <= current ? styles.active : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
