import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { tr } from 'react-day-picker/locale';
import { openPath } from '@tauri-apps/plugin-opener';
import { appStrings } from '../i18n/appStrings';
import type { Measurement } from '../types/measurement';
import { formatDisplayDate, formatIsoDate, periodLabel } from '../utils/validation';
import { formatMeasurementMetric } from '../utils/formatReadings';
import { getMeasurementsByDateRange } from '../services/measurementService';
import { exportMeasurementsToExcel } from '../services/excelExportService';
import { LargeButton } from './LargeButton';
import { StepIndicator } from './StepIndicator';
import { WizardCloseButton } from './WizardCloseButton';
import styles from '../styles/wizard.module.css';

interface ExcelExportWizardProps {
  allMeasurements: Measurement[];
  onClose: () => void;
}

function subtractDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function ExcelExportWizard({
  allMeasurements,
  onClose,
}: ExcelExportWizardProps) {
  const today = useMemo(() => new Date(), []);
  const [step, setStep] = useState(1);
  const [startDate, setStartDate] = useState<Date>(subtractDays(today, 30));
  const [endDate, setEndDate] = useState<Date>(today);
  const [previewData, setPreviewData] = useState<Measurement[]>([]);
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const startIso = formatIsoDate(startDate);
  const endIso = formatIsoDate(endDate);

  const applyPreset = (days: number | null) => {
    if (days === null) {
      if (allMeasurements.length > 0) {
        const dates = allMeasurements.map((m) => m.date).sort();
        setStartDate(new Date(dates[0] + 'T12:00:00'));
        setEndDate(new Date(dates[dates.length - 1] + 'T12:00:00'));
      }
      return;
    }
    setStartDate(subtractDays(today, days));
    setEndDate(today);
  };

  const loadPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeasurementsByDateRange(startIso, endIso);
      if (data.length === 0) {
        setError(appStrings.noDataInRange);
        setPreviewData([]);
        return;
      }
      setPreviewData(data);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : appStrings.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const path = await exportMeasurementsToExcel(previewData, startIso, endIso);
      if (!path) {
        setError(appStrings.exportCancelled);
        return;
      }
      setSavedPath(path);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : appStrings.errorGeneric);
    } finally {
      setLoading(false);
    }
  };

  const stepTitle = useMemo(() => {
    if (step === 1) return appStrings.exportSelectDates;
    if (step === 2) return appStrings.exportPreview;
    if (step === 3) return appStrings.exportSaveFile;
    return appStrings.exportComplete;
  }, [step]);

  return (
    <div className={styles.overlay}>
      <div className={styles.wizard}>
        <WizardCloseButton onClose={onClose} />
        <StepIndicator current={step} total={4} />
        <h2 className={styles.title}>{stepTitle}</h2>

        {step === 1 && (
          <div className={styles.exportStep}>
            <div className={styles.presetChips}>
              <button type="button" onClick={() => applyPreset(7)}>
                {appStrings.last7Days}
              </button>
              <button type="button" onClick={() => applyPreset(30)}>
                {appStrings.last30Days}
              </button>
              <button type="button" onClick={() => applyPreset(null)}>
                {appStrings.allRecords}
              </button>
            </div>
            <div className={styles.dateRangeGrid}>
              <div>
                <h3>{appStrings.exportStartDate}</h3>
                <DayPicker
                  mode="single"
                  selected={startDate}
                  onSelect={(d) => d && setStartDate(d)}
                  locale={tr}
                  disabled={{ after: endDate }}
                />
              </div>
              <div>
                <h3>{appStrings.exportEndDate}</h3>
                <DayPicker
                  mode="single"
                  selected={endDate}
                  onSelect={(d) => d && setEndDate(d)}
                  locale={tr}
                  disabled={{ before: startDate }}
                />
              </div>
            </div>
            <div className={styles.navRow}>
              <LargeButton variant="secondary" onClick={onClose}>
                {appStrings.close}
              </LargeButton>
              <LargeButton onClick={() => void loadPreview()} disabled={loading}>
                {appStrings.next}
              </LargeButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.exportStep}>
            <div className={styles.previewTable}>
              <table>
                <thead>
                  <tr>
                    <th>{appStrings.dateLabel}</th>
                    <th>{appStrings.timeLabel}</th>
                    <th>{appStrings.pulseLabel}</th>
                    <th>{appStrings.systolicLabel}</th>
                    <th>{appStrings.diastolicLabel}</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((m) => (
                    <tr key={m.id}>
                      <td>{formatDisplayDate(m.date)}</td>
                      <td>{periodLabel(m.period)}</td>
                      <td>{formatMeasurementMetric(m, 'pulseBpm')}</td>
                      <td>{formatMeasurementMetric(m, 'systolic')}</td>
                      <td>{formatMeasurementMetric(m, 'diastolic')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.navRow}>
              <LargeButton variant="secondary" onClick={onClose}>
                {appStrings.close}
              </LargeButton>
              <LargeButton variant="secondary" onClick={() => setStep(1)}>
                {appStrings.back}
              </LargeButton>
              <LargeButton onClick={() => setStep(3)}>{appStrings.next}</LargeButton>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.exportStep}>
            <p>{appStrings.exportSaveFile}</p>
            <div className={styles.navRow}>
              <LargeButton variant="secondary" onClick={onClose}>
                {appStrings.close}
              </LargeButton>
              <LargeButton variant="secondary" onClick={() => setStep(2)}>
                {appStrings.back}
              </LargeButton>
              <LargeButton onClick={() => void handleSave()} disabled={loading}>
                {appStrings.save}
              </LargeButton>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.doneBox}>
            <p className={styles.success}>{appStrings.exportSuccess}</p>
            <div className={styles.navRow}>
              {savedPath && (
                <LargeButton onClick={() => void openPath(savedPath)}>
                  {appStrings.openFile}
                </LargeButton>
              )}
              <LargeButton onClick={onClose}>{appStrings.done}</LargeButton>
            </div>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
