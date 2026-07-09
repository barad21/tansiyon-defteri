import { useState } from 'react';
import { appStrings } from '../i18n/appStrings';
import { useMeasurements } from '../hooks/useMeasurements';
import type { Measurement, MeasurementInput } from '../types/measurement';
import { AppHeader } from './AppHeader';
import { VitalBarChart } from './VitalBarChart';
import { MeasurementLogTable } from './MeasurementLogTable';
import { MeasurementEntryWizard } from './MeasurementEntryWizard';
import { ExcelExportWizard } from './ExcelExportWizard';
import { LargeButton } from './LargeButton';
import styles from '../styles/mainScreen.module.css';

type WizardMode = 'none' | 'add' | 'edit' | 'export';

export function MainScreen() {
  const { measurements, loading, error, add, update, remove } =
    useMeasurements();
  const [wizardMode, setWizardMode] = useState<WizardMode>('none');
  const [editing, setEditing] = useState<Measurement | null>(null);

  const handleSave = async (input: MeasurementInput, id?: number) => {
    if (id) {
      await update(id, input);
    } else {
      await add(input);
    }
  };

  const handleEdit = (measurement: Measurement) => {
    setEditing(measurement);
    setWizardMode('edit');
  };

  const handleDelete = async (measurement: Measurement) => {
    if (window.confirm(appStrings.deleteConfirm)) {
      await remove(measurement.id);
    }
  };

  const closeWizard = () => {
    setWizardMode('none');
    setEditing(null);
  };

  return (
    <div className={styles.appLayout}>
      <AppHeader />

      {loading && <p className={styles.status}>{appStrings.loading}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.chartArea}>
        <VitalBarChart
          measurements={measurements}
          metric="pulseBpm"
          title={appStrings.pulseLabel}
        />
        <VitalBarChart
          measurements={measurements}
          metric="systolic"
          title={appStrings.systolicLabel}
        />
        <VitalBarChart
          measurements={measurements}
          metric="diastolic"
          title={appStrings.diastolicLabel}
        />
      </section>

      <section className={styles.actionBar}>
        <LargeButton onClick={() => setWizardMode('add')}>
          {appStrings.addMeasurement}
        </LargeButton>
        <LargeButton variant="secondary" onClick={() => setWizardMode('export')}>
          {appStrings.exportExcel}
        </LargeButton>
      </section>

      <section className={styles.logArea}>
        <MeasurementLogTable
          measurements={measurements}
          onEdit={handleEdit}
          onDelete={(m) => void handleDelete(m)}
        />
      </section>

      {(wizardMode === 'add' || wizardMode === 'edit') && (
        <MeasurementEntryWizard
          existingMeasurement={wizardMode === 'edit' ? editing : null}
          onSave={handleSave}
          onClose={closeWizard}
        />
      )}

      {wizardMode === 'export' && (
        <ExcelExportWizard
          allMeasurements={measurements}
          onClose={() => setWizardMode('none')}
        />
      )}
    </div>
  );
}
