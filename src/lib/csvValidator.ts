import type { CSVRow, CSVValidationResult } from '../types/dataIngestion';

// Required columns for CSV import
const REQUIRED_COLUMNS = [
  'asset_id',
  'serial_number',
  'product_family',
  'battery_type',
  'capacity_kwh',
  'chemistry',
  'manufacturing_date',
  'manufacturing_site',
];

// Optional columns
const OPTIONAL_COLUMNS = ['location', 'lifecycle_status'];

// Allowed chemistry values
const ALLOWED_CHEMISTRIES = ['LFP', 'NMC', 'NCA', 'LTO'];

// Capacity must be between 1 and 10000 kWh
const CAPACITY_RANGE: [number, number] = [1, 10000];

// Date format: YYYY-MM-DD
const DATE_FORMAT_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parse raw CSV string into headers and row objects.
 */
export function parseCSV(
  rawCSV: string
): { headers: string[]; rows: Record<string, string>[] } | { error: string } {
  const lines = rawCSV
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { error: 'CSV file is empty' };
  }

  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

  if (headers.length === 0) {
    return { error: 'No headers found in CSV' };
  }

  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Validate a single CSV row against required field, format, and value constraints.
 */
export function validateCSVRow(
  row: Record<string, string>,
  rowNumber: number,
  existingAssetIds: string[]
): CSVRow {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required fields are present and non-empty
  for (const col of REQUIRED_COLUMNS) {
    if (!row[col] || row[col].trim() === '') {
      errors.push(`Missing required field: ${col}`);
    }
  }

  // Check for duplicate asset_id
  const assetId = row['asset_id']?.trim() ?? '';
  if (assetId && existingAssetIds.includes(assetId)) {
    return {
      rowNumber,
      data: row,
      status: 'duplicate',
      errors: [`Duplicate asset_id: ${assetId}`],
      warnings,
    };
  }

  // Validate capacity range
  const capacityStr = row['capacity_kwh']?.trim() ?? '';
  if (capacityStr) {
    const capacity = Number(capacityStr);
    if (isNaN(capacity)) {
      errors.push(`capacity_kwh is not a valid number: ${capacityStr}`);
    } else if (capacity < CAPACITY_RANGE[0] || capacity > CAPACITY_RANGE[1]) {
      errors.push(
        `capacity_kwh must be between ${CAPACITY_RANGE[0]} and ${CAPACITY_RANGE[1]}, got: ${capacity}`
      );
    }
  }

  // Validate chemistry
  const chemistry = row['chemistry']?.trim().toUpperCase() ?? '';
  if (chemistry && !ALLOWED_CHEMISTRIES.includes(chemistry)) {
    errors.push(
      `Invalid chemistry: ${row['chemistry']}. Allowed values: ${ALLOWED_CHEMISTRIES.join(', ')}`
    );
  }

  // Validate manufacturing_date format
  const mfgDate = row['manufacturing_date']?.trim() ?? '';
  if (mfgDate && !DATE_FORMAT_REGEX.test(mfgDate)) {
    errors.push(`Invalid manufacturing_date format: ${mfgDate}. Expected YYYY-MM-DD`);
  }

  // Warn about optional fields being empty
  for (const col of OPTIONAL_COLUMNS) {
    if (row[col] !== undefined && row[col].trim() === '') {
      warnings.push(`Optional field '${col}' is empty`);
    }
  }

  let status: CSVRow['status'];
  if (errors.length > 0) {
    status = 'error';
  } else if (warnings.length > 0) {
    status = 'warning';
  } else {
    status = 'valid';
  }

  return {
    rowNumber,
    data: row,
    status,
    errors,
    warnings,
  };
}

/**
 * Validate an entire CSV import: parse, then validate each row.
 */
export function validateCSVImport(
  rawCSV: string,
  existingAssetIds: string[]
): CSVValidationResult {
  const parsed = parseCSV(rawCSV);

  if ('error' in parsed) {
    return {
      isValid: false,
      totalRows: 0,
      validRows: [],
      warningRows: [],
      errorRows: [],
      duplicateRows: [],
      headerErrors: [parsed.error],
    };
  }

  const { headers, rows } = parsed;

  // Check for missing required headers
  const headerErrors: string[] = [];
  for (const col of REQUIRED_COLUMNS) {
    if (!headers.includes(col)) {
      headerErrors.push(`Missing required column: ${col}`);
    }
  }

  if (headerErrors.length > 0) {
    return {
      isValid: false,
      totalRows: rows.length,
      validRows: [],
      warningRows: [],
      errorRows: [],
      duplicateRows: [],
      headerErrors,
    };
  }

  const validRows: CSVRow[] = [];
  const warningRows: CSVRow[] = [];
  const errorRows: CSVRow[] = [];
  const duplicateRows: CSVRow[] = [];

  // Track asset IDs within the current import to detect intra-file duplicates
  const seenAssetIds: string[] = [...existingAssetIds];

  for (let i = 0; i < rows.length; i++) {
    const validated = validateCSVRow(rows[i], i + 1, seenAssetIds);

    switch (validated.status) {
      case 'valid':
        validRows.push(validated);
        break;
      case 'warning':
        warningRows.push(validated);
        break;
      case 'error':
        errorRows.push(validated);
        break;
      case 'duplicate':
        duplicateRows.push(validated);
        break;
    }

    // Add asset_id to seen list for intra-file duplicate detection
    const rowAssetId = rows[i]['asset_id']?.trim();
    if (rowAssetId && validated.status !== 'duplicate') {
      seenAssetIds.push(rowAssetId);
    }
  }

  const isValid = errorRows.length === 0 && duplicateRows.length === 0 && headerErrors.length === 0;

  return {
    isValid,
    totalRows: rows.length,
    validRows,
    warningRows,
    errorRows,
    duplicateRows,
    headerErrors,
  };
}

export { REQUIRED_COLUMNS, OPTIONAL_COLUMNS, ALLOWED_CHEMISTRIES, CAPACITY_RANGE, DATE_FORMAT_REGEX };
