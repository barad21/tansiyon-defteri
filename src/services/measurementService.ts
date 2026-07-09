import Database from '@tauri-apps/plugin-sql';
import { isTauri } from '@tauri-apps/api/core';
import { appStrings } from '../i18n/appStrings';
import type {
  Measurement,
  MeasurementInput,
  MeasurementPeriod,
  VitalReading,
} from '../types/measurement';

const DB_URL = 'sqlite:tansiyon.db';

let dbInstance: Database | null = null;

async function getDb(): Promise<Database> {
  if (!isTauri()) {
    throw new Error(appStrings.desktopOnlyMessage);
  }
  if (!dbInstance) {
    try {
      dbInstance = await Database.load(DB_URL);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${appStrings.errorGeneric} (${message})`);
    }
  }
  return dbInstance;
}

interface DbRow {
  id: number;
  date: string;
  period: MeasurementPeriod;
  pulse_bpm_initial: number;
  systolic_initial: number;
  diastolic_initial: number;
  pulse_bpm_followup: number;
  systolic_followup: number;
  diastolic_followup: number;
  recorded_at: string;
}

function mapReading(
  pulse: number,
  systolic: number,
  diastolic: number,
): VitalReading {
  return { pulseBpm: pulse, systolic, diastolic };
}

function mapRow(row: DbRow): Measurement {
  return {
    id: row.id,
    date: row.date,
    period: row.period,
    initial: mapReading(
      row.pulse_bpm_initial,
      row.systolic_initial,
      row.diastolic_initial,
    ),
    followup: mapReading(
      row.pulse_bpm_followup,
      row.systolic_followup,
      row.diastolic_followup,
    ),
    recordedAt: row.recorded_at,
  };
}

const SELECT_FIELDS = `
  id, date, period,
  pulse_bpm_initial, systolic_initial, diastolic_initial,
  pulse_bpm_followup, systolic_followup, diastolic_followup,
  recorded_at
`;

export async function getMeasurements(): Promise<Measurement[]> {
  const db = await getDb();
  const rows = await db.select<DbRow[]>(
    `SELECT ${SELECT_FIELDS} FROM measurements ORDER BY date DESC, period ASC`,
  );
  return rows.map(mapRow);
}

export async function getMeasurementsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Measurement[]> {
  const db = await getDb();
  const rows = await db.select<DbRow[]>(
    `SELECT ${SELECT_FIELDS} FROM measurements WHERE date >= $1 AND date <= $2 ORDER BY date ASC, period ASC`,
    [startDate, endDate],
  );
  return rows.map(mapRow);
}

export async function getMeasurementByDateAndPeriod(
  date: string,
  period: MeasurementPeriod,
): Promise<Measurement | null> {
  const db = await getDb();
  const rows = await db.select<DbRow[]>(
    `SELECT ${SELECT_FIELDS} FROM measurements WHERE date = $1 AND period = $2 LIMIT 1`,
    [date, period],
  );
  return rows.length > 0 ? mapRow(rows[0]) : null;
}

export async function insertMeasurement(
  input: MeasurementInput,
): Promise<Measurement> {
  const existing = await getMeasurementByDateAndPeriod(input.date, input.period);
  if (existing) {
    throw new Error(appStrings.duplicatePeriodError);
  }

  const db = await getDb();
  const recordedAt = new Date().toISOString();

  try {
    await db.execute(
      `INSERT INTO measurements (
        date, period,
        pulse_bpm_initial, systolic_initial, diastolic_initial,
        pulse_bpm_followup, systolic_followup, diastolic_followup,
        recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        input.date,
        input.period,
        input.initial.pulseBpm,
        input.initial.systolic,
        input.initial.diastolic,
        input.followup.pulseBpm,
        input.followup.systolic,
        input.followup.diastolic,
        recordedAt,
      ],
    );
  } catch (error) {
    const message = String(error);
    if (message.includes('UNIQUE')) {
      throw new Error(appStrings.duplicatePeriodError);
    }
    throw error;
  }

  const created = await getMeasurementByDateAndPeriod(input.date, input.period);
  if (!created) {
    throw new Error(appStrings.errorGeneric);
  }
  return created;
}

export async function updateMeasurement(
  id: number,
  input: MeasurementInput,
): Promise<Measurement> {
  const db = await getDb();
  const recordedAt = new Date().toISOString();

  try {
    await db.execute(
      `UPDATE measurements SET
        date = $1, period = $2,
        pulse_bpm_initial = $3, systolic_initial = $4, diastolic_initial = $5,
        pulse_bpm_followup = $6, systolic_followup = $7, diastolic_followup = $8,
        recorded_at = $9
      WHERE id = $10`,
      [
        input.date,
        input.period,
        input.initial.pulseBpm,
        input.initial.systolic,
        input.initial.diastolic,
        input.followup.pulseBpm,
        input.followup.systolic,
        input.followup.diastolic,
        recordedAt,
        id,
      ],
    );
  } catch (error) {
    const message = String(error);
    if (message.includes('UNIQUE')) {
      throw new Error(appStrings.duplicatePeriodError);
    }
    throw error;
  }

  const rows = await db.select<DbRow[]>(
    `SELECT ${SELECT_FIELDS} FROM measurements WHERE id = $1`,
    [id],
  );

  if (rows.length === 0) {
    throw new Error(appStrings.errorGeneric);
  }

  return mapRow(rows[0]);
}

export async function deleteMeasurement(id: number): Promise<void> {
  const db = await getDb();
  await db.execute('DELETE FROM measurements WHERE id = $1', [id]);
}
