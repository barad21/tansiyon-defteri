import { useCallback, useEffect, useState } from 'react';
import { appStrings } from '../i18n/appStrings';
import type { Measurement, MeasurementInput } from '../types/measurement';
import {
  deleteMeasurement,
  getMeasurements,
  insertMeasurement,
  updateMeasurement,
} from '../services/measurementService';

export function useMeasurements() {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeasurements();
      setMeasurements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : appStrings.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const add = async (input: MeasurementInput) => {
    const created = await insertMeasurement(input);
    await refresh();
    return created;
  };

  const update = async (id: number, input: MeasurementInput) => {
    const updated = await updateMeasurement(id, input);
    await refresh();
    return updated;
  };

  const remove = async (id: number) => {
    await deleteMeasurement(id);
    await refresh();
  };

  return {
    measurements,
    loading,
    error,
    refresh,
    add,
    update,
    remove,
  };
}
