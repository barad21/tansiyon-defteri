import { useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { tr } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { appStrings } from '../i18n/appStrings';
import type { Measurement, MeasurementInput, VitalReading } from '../types/measurement';
import { formatIsoDate, validateMeasurement } from '../utils/validation';
import { getMeasurementByDateAndPeriod } from '../services/measurementService';
import { LargeButton } from './LargeButton';
import { StepIndicator } from './StepIndicator';
import { WizardCloseButton } from './WizardCloseButton';
import styles from '../styles/wizard.module.css';

interface MeasurementEntryWizardProps {
  existingMeasurement?: Measurement | null;
  onSave: (input: MeasurementInput, id?: number) => Promise<void>;
  onClose: () => void;
}

function emptyReadingFields() {
  return { pulse: '', systolic: '', diastolic: '' };
}

function readingFromMeasurement(reading: VitalReading) {
  return {
    pulse: reading.pulseBpm.toString(),
    systolic: reading.systolic.toString(),
    diastolic: reading.diastolic.toString(),
  };
}

function parseReading(
  pulse: string,
  systolic: string,
  diastolic: string,
): VitalReading {
  return {
    pulseBpm: Number(pulse),
    systolic: Number(systolic),
    diastolic: Number(diastolic),
  };
}

export function MeasurementEntryWizard({
  existingMeasurement,
  onSave,
  onClose,
}: MeasurementEntryWizardProps) {
  const isEdit = Boolean(existingMeasurement);
  const [step, setStep] = useState(isEdit ? 3 : 1);
  const [selectedDate, setSelectedDate] = useState<Date>(
    existingMeasurement
      ? new Date(existingMeasurement.date + 'T12:00:00')
      : new Date(),
  );
  const [period, setPeriod] = useState<'sabah' | 'aksam' | null>(
    existingMeasurement?.period ?? null,
  );
  const [initialFields, setInitialFields] = useState(
    existingMeasurement
      ? readingFromMeasurement(existingMeasurement.initial)
      : emptyReadingFields(),
  );
  const [followupFields, setFollowupFields] = useState(
    existingMeasurement
      ? readingFromMeasurement(existingMeasurement.followup)
      : emptyReadingFields(),
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [slotStatus, setSlotStatus] = useState({
    sabah: false,
    aksam: false,
  });

  const isoDate = formatIsoDate(selectedDate);

  const checkSlots = async (date: string) => {
    const [sabah, aksam] = await Promise.all([
      getMeasurementByDateAndPeriod(date, 'sabah'),
      getMeasurementByDateAndPeriod(date, 'aksam'),
    ]);
    setSlotStatus({
      sabah: Boolean(sabah && sabah.id !== existingMeasurement?.id),
      aksam: Boolean(aksam && aksam.id !== existingMeasurement?.id),
    });
  };

  const handleDateNext = async () => {
    setError(null);
    try {
      await checkSlots(isoDate);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : appStrings.errorGeneric);
    }
  };

  const handlePeriodNext = () => {
    if (!period) return;
    setError(null);
    setStep(3);
  };

  const handleSave = async () => {
    if (!period) return;

    const input: MeasurementInput = {
      date: isoDate,
      period,
      initial: parseReading(
        initialFields.pulse,
        initialFields.systolic,
        initialFields.diastolic,
      ),
      followup: parseReading(
        followupFields.pulse,
        followupFields.systolic,
        followupFields.diastolic,
      ),
    };

    const validation = validateMeasurement(input);
    if (!validation.valid) {
      setError(validation.error ?? appStrings.errorGeneric);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(input, existingMeasurement?.id);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : appStrings.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const stepTitle = useMemo(() => {
    if (done) return appStrings.saved;
    if (step === 1) return appStrings.selectDate;
    if (step === 2) return appStrings.selectPeriod;
    return appStrings.enterValues;
  }, [step, done]);

  const renderReadingSection = (
    title: string,
    fields: { pulse: string; systolic: string; diastolic: string },
    onChange: (next: typeof fields) => void,
  ) => (
    <div className={styles.readingSection}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      <div className={styles.readingGrid}>
        <label>
          {appStrings.pulseLabel}
          <input
            type="number"
            inputMode="numeric"
            value={fields.pulse}
            onChange={(e) => onChange({ ...fields, pulse: e.target.value })}
          />
        </label>
        <label>
          {appStrings.systolicLabel}
          <input
            type="number"
            inputMode="numeric"
            value={fields.systolic}
            onChange={(e) => onChange({ ...fields, systolic: e.target.value })}
          />
        </label>
        <label>
          {appStrings.diastolicLabel}
          <input
            type="number"
            inputMode="numeric"
            value={fields.diastolic}
            onChange={(e) => onChange({ ...fields, diastolic: e.target.value })}
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className={styles.overlay}>
      <div
        className={`${styles.wizard} ${step === 3 ? styles.wizardValuesStep : ''} ${isEdit ? styles.wizardEdit : ''}`}
      >
        <WizardCloseButton onClose={onClose} />
        {!done && !isEdit && <StepIndicator current={step} total={3} />}
        <h2 className={styles.title}>{stepTitle}</h2>

        {done ? (
          <div className={styles.doneBox}>
            <p className={styles.success}>{appStrings.saved}</p>
            <LargeButton onClick={onClose}>{appStrings.done}</LargeButton>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className={styles.calendarWrap}>
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                  locale={tr}
                  className={styles.calendar}
                />
                <div className={styles.navRow}>
                  <LargeButton onClick={() => void handleDateNext()}>
                    {appStrings.next}
                  </LargeButton>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className={styles.periodGrid}>
                <button
                  type="button"
                  className={`${styles.periodCard} ${period === 'sabah' ? styles.selected : ''}`}
                  disabled={slotStatus.sabah}
                  onClick={() => setPeriod('sabah')}
                >
                  <span className={styles.periodIcon}>☀️</span>
                  <span>{appStrings.sabah}</span>
                  {slotStatus.sabah && (
                    <small>{appStrings.slotFilledSabah}</small>
                  )}
                </button>
                <button
                  type="button"
                  className={`${styles.periodCard} ${period === 'aksam' ? styles.selected : ''}`}
                  disabled={slotStatus.aksam}
                  onClick={() => setPeriod('aksam')}
                >
                  <span className={styles.periodIcon}>🌙</span>
                  <span>{appStrings.aksam}</span>
                  {slotStatus.aksam && (
                    <small>{appStrings.slotFilledAksam}</small>
                  )}
                </button>
                <div className={styles.navRow}>
                  <LargeButton variant="secondary" onClick={() => setStep(1)}>
                    {appStrings.back}
                  </LargeButton>
                  <LargeButton onClick={handlePeriodNext} disabled={!period}>
                    {appStrings.next}
                  </LargeButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className={`${styles.formGrid} ${styles.valuesForm}`}>
                {renderReadingSection(
                  appStrings.initialReading,
                  initialFields,
                  setInitialFields,
                )}
                <div className={styles.sectionDivider} />
                {renderReadingSection(
                  appStrings.followupReading,
                  followupFields,
                  setFollowupFields,
                )}
                <div className={styles.navRow}>
                  {!isEdit && (
                    <LargeButton
                      variant="secondary"
                      className={styles.compactButton}
                      onClick={() => setStep(2)}
                    >
                      {appStrings.back}
                    </LargeButton>
                  )}
                  <LargeButton
                    className={styles.compactButton}
                    onClick={() => void handleSave()}
                    disabled={saving}
                  >
                    {appStrings.save}
                  </LargeButton>
                </div>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
