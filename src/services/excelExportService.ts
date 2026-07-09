import ExcelJS from 'exceljs';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { appStrings } from '../i18n/appStrings';
import { COLORS } from '../constants/chartThresholds';
import type { Measurement } from '../types/measurement';
import { formatDisplayDate, periodShort } from '../utils/validation';
import { formatMeasurementMetric } from '../utils/formatReadings';

function groupByDate(measurements: Measurement[]): Map<string, Measurement[]> {
  const groups = new Map<string, Measurement[]>();
  for (const m of measurements) {
    const list = groups.get(m.date) ?? [];
    list.push(m);
    groups.set(m.date, list);
  }
  return groups;
}

export async function buildExcelWorkbook(
  measurements: Measurement[],
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Tansiyon');

  sheet.mergeCells('A1:E1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = appStrings.excelTitle;
  titleCell.font = { bold: true, size: 18, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8B7355' },
  };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 32;

  const headers = [
    appStrings.excelHeaderDate,
    appStrings.excelHeaderTime,
    appStrings.excelHeaderPulse,
    appStrings.excelHeaderSystolic,
    appStrings.excelHeaderDiastolic,
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B7355' },
    };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  headerRow.height = 24;

  const groups = groupByDate(measurements);
  const sortedDates = [...groups.keys()].sort((a, b) => a.localeCompare(b));

  for (const date of sortedDates) {
    const dayMeasurements = groups
      .get(date)!
      .sort((a, b) => a.period.localeCompare(b.period));

    dayMeasurements.forEach((m, index) => {
      const row = sheet.addRow([
        index === 0 ? formatDisplayDate(m.date) : '',
        periodShort(m.period),
        formatMeasurementMetric(m, 'pulseBpm'),
        formatMeasurementMetric(m, 'systolic'),
        formatMeasurementMetric(m, 'diastolic'),
      ]);

      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };
      });
    });
  }

  sheet.columns = [
    { width: 18 },
    { width: 8 },
    { width: 10 },
    { width: 28 },
    { width: 28 },
  ];

  sheet.pageSetup = {
    orientation: 'portrait',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.5,
      right: 0.5,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  };

  return workbook;
}

export function defaultExportFilename(startDate: string, endDate: string): string {
  return `TansiyonDefteri_${startDate}_${endDate}.xlsx`;
}

export async function exportMeasurementsToExcel(
  measurements: Measurement[],
  startDate: string,
  endDate: string,
): Promise<string | null> {
  const workbook = await buildExcelWorkbook(measurements);
  const buffer = await workbook.xlsx.writeBuffer();

  const filePath = await save({
    defaultPath: defaultExportFilename(startDate, endDate),
    filters: [{ name: 'Excel', extensions: ['xlsx'] }],
  });

  if (!filePath) {
    return null;
  }

  await writeFile(filePath, new Uint8Array(buffer));
  return filePath;
}

export async function workbookToBuffer(
  measurements: Measurement[],
): Promise<Uint8Array> {
  const workbook = await buildExcelWorkbook(measurements);
  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

export { COLORS };
