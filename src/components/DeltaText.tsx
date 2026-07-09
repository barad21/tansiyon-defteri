import type { ReactNode } from 'react';
import { COLORS } from '../constants/chartThresholds';
import { appStrings } from '../i18n/appStrings';
import styles from '../styles/charts.module.css';

export type DeltaTone = 'positive' | 'negative' | 'zero' | 'missing';

export interface DeltaDisplayParts {
  tone: DeltaTone;
  valueText: string;
}

export function getDeltaTone(delta: number | null): DeltaTone {
  if (delta === null) return 'missing';
  if (delta > 0) return 'positive';
  if (delta < 0) return 'negative';
  return 'zero';
}

export function getDeltaColorByTone(tone: DeltaTone): string {
  switch (tone) {
    case 'positive':
      return COLORS.deltaPositive;
    case 'negative':
      return COLORS.deltaNegative;
    case 'zero':
      return COLORS.deltaZero;
    default:
      return COLORS.deltaNeutral;
  }
}

export function getDeltaDisplayParts(delta: number | null): DeltaDisplayParts {
  const tone = getDeltaTone(delta);

  if (tone === 'missing') {
    return { tone, valueText: appStrings.deltaMissing };
  }
  if (tone === 'zero') {
    return { tone, valueText: '0' };
  }

  const sign = delta! > 0 ? '+' : '';
  return { tone, valueText: `${sign}${delta}` };
}

interface DeltaTextProps {
  delta: number | null;
  className?: string;
}

export function DeltaText({ delta, className = '' }: DeltaTextProps) {
  const { tone, valueText } = getDeltaDisplayParts(delta);
  const color = getDeltaColorByTone(tone);

  if (tone === 'missing') {
    return (
      <span className={`${styles.deltaLabel} ${className}`} style={{ color }}>
        {valueText}
      </span>
    );
  }

  return (
    <span className={`${styles.deltaLabel} ${className}`} style={{ color }}>
      <span className={styles.deltaSymbol} aria-hidden="true">
        Δ
      </span>
      <span className={styles.deltaValue}>{valueText}</span>
    </span>
  );
}

interface DeltaInlineProps {
  delta: number | null;
  suffix?: ReactNode;
}

export function DeltaInline({ delta, suffix }: DeltaInlineProps) {
  const { tone, valueText } = getDeltaDisplayParts(delta);
  const color = getDeltaColorByTone(tone);

  return (
    <span className={styles.deltaInline} style={{ color }}>
      <span className={styles.deltaSymbol} aria-hidden="true">
        Δ
      </span>
      <span className={styles.deltaValue}>{tone === 'missing' ? valueText : valueText}</span>
      {suffix}
    </span>
  );
}
