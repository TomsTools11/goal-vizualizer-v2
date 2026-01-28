/**
 * CSV validation utilities for enhanced column mapping
 */

import type { RawRow, ColumnMapping } from '@/types';
import type {
  TransformationConfig,
  FieldValidationResult,
  ValidationSummary,
  FieldTransformation,
} from '@/types/transformations';
import { applyTransformation, detectFieldType } from './transformations';

// ============================================================================
// Sample Value Extraction
// ============================================================================

/**
 * Get N sample values from a column
 */
export function getSampleValues(
  data: RawRow[],
  column: string,
  count: number = 5
): unknown[] {
  const samples: unknown[] = [];
  const seen = new Set<string>();

  for (const row of data) {
    if (samples.length >= count) break;

    const value = row[column];
    if (value === null || value === undefined) continue;

    const strValue = String(value).trim();
    if (!strValue || strValue.toLowerCase() === 'n/a' || seen.has(strValue)) continue;

    seen.add(strValue);
    samples.push(value);
  }

  return samples;
}

/**
 * Get sample values for all columns in the dataset
 */
export function getAllSampleValues(
  data: RawRow[],
  headers: string[],
  count: number = 5
): Record<string, unknown[]> {
  const result: Record<string, unknown[]> = {};

  for (const header of headers) {
    result[header] = getSampleValues(data, header, count);
  }

  return result;
}

// ============================================================================
// Field Validation
// ============================================================================

/**
 * Validate a single field with the given transformation
 */
export function validateField(
  data: RawRow[],
  column: string,
  transform: FieldTransformation
): FieldValidationResult {
  const samples = getSampleValues(data, column, 10);
  const transformedSamples: unknown[] = [];
  let errorCount = 0;
  let warningMessage: string | undefined;

  // Apply transformation to all rows and count errors
  for (const row of data) {
    const value = row[column];
    if (value === null || value === undefined || String(value).trim() === '') {
      continue; // Skip empty values
    }

    const transformed = applyTransformation(value, transform);
    if (transformed === null && transform.type !== 'text') {
      errorCount++;
    }
  }

  // Apply transformation to samples for preview
  for (const sample of samples) {
    const transformed = applyTransformation(sample, transform);
    transformedSamples.push(transformed);
  }

  // Check for warnings
  const totalNonEmpty = data.filter((row) => {
    const val = row[column];
    return val !== null && val !== undefined && String(val).trim() !== '';
  }).length;

  const errorRate = totalNonEmpty > 0 ? errorCount / totalNonEmpty : 0;

  if (errorRate > 0.5 && errorRate < 1) {
    warningMessage = `${Math.round(errorRate * 100)}% of values may not parse correctly with this format`;
  } else if (errorRate === 1 && totalNonEmpty > 0) {
    warningMessage = 'No values match this format - consider changing the transformation';
  }

  // Detect the type for display
  const detection = detectFieldType(samples);

  return {
    field: column,
    valid: errorCount === 0,
    sampleValues: samples,
    transformedSamples,
    errorCount,
    warningMessage,
    detectedType: detection.type,
  };
}

// ============================================================================
// Validation Summary
// ============================================================================

/**
 * Generate a full validation summary for the mapping
 */
export function generateValidationSummary(
  data: RawRow[],
  mapping: Partial<ColumnMapping>,
  transforms?: TransformationConfig
): ValidationSummary {
  const fieldResults: Record<string, FieldValidationResult> = {};
  let totalInvalidRows = 0;
  const rowErrors: boolean[] = new Array(data.length).fill(false);

  // Validate each mapped field
  for (const [field, column] of Object.entries(mapping)) {
    if (!column) continue;

    // Get transformation config or use auto-detect
    const transform = transforms?.[column] ?? { type: 'text' as const };
    const result = validateField(data, column, transform);
    fieldResults[field] = result;

    // Track which rows have errors
    if (result.errorCount > 0) {
      data.forEach((row, index) => {
        const value = row[column];
        if (value === null || value === undefined || String(value).trim() === '') {
          return;
        }

        const transformed = applyTransformation(value, transform);
        if (transformed === null && transform.type !== 'text') {
          rowErrors[index] = true;
        }
      });
    }
  }

  // Count invalid rows
  totalInvalidRows = rowErrors.filter(Boolean).length;

  return {
    totalRows: data.length,
    validRows: data.length - totalInvalidRows,
    invalidRows: totalInvalidRows,
    fieldResults,
  };
}

// ============================================================================
// Row-level Validation
// ============================================================================

/**
 * Validate a single row against the mapping and transforms
 */
export function validateRow(
  row: RawRow,
  mapping: Partial<ColumnMapping>,
  transforms?: TransformationConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, column] of Object.entries(mapping)) {
    if (!column) continue;

    const value = row[column];
    if (value === null || value === undefined || String(value).trim() === '') {
      continue; // Empty values are OK
    }

    const transform = transforms?.[column] ?? { type: 'text' as const };
    const transformed = applyTransformation(value, transform);

    if (transformed === null && transform.type !== 'text') {
      errors.push(`${field}: "${value}" could not be parsed as ${transform.type}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get preview data with transformations applied
 */
export function getPreviewData(
  data: RawRow[],
  mapping: Partial<ColumnMapping>,
  transforms?: TransformationConfig,
  maxRows: number = 5
): Array<{
  original: RawRow;
  transformed: Record<string, unknown>;
  validation: { valid: boolean; errors: string[] };
}> {
  const preview: Array<{
    original: RawRow;
    transformed: Record<string, unknown>;
    validation: { valid: boolean; errors: string[] };
  }> = [];

  for (let i = 0; i < Math.min(data.length, maxRows); i++) {
    const row = data[i];
    const transformed: Record<string, unknown> = {};

    for (const [field, column] of Object.entries(mapping)) {
      if (!column) continue;

      const value = row[column];
      const transform = transforms?.[column] ?? { type: 'text' as const };
      transformed[field] = applyTransformation(value, transform);
    }

    preview.push({
      original: row,
      transformed,
      validation: validateRow(row, mapping, transforms),
    });
  }

  return preview;
}

// ============================================================================
// Progress Tracking for Large Files
// ============================================================================

/**
 * Validate data in chunks with progress callback
 */
export async function validateWithProgress(
  data: RawRow[],
  mapping: Partial<ColumnMapping>,
  transforms: TransformationConfig | undefined,
  onProgress: (progress: number) => void,
  chunkSize: number = 1000
): Promise<ValidationSummary> {
  const totalRows = data.length;
  let processedRows = 0;
  const rowErrors: boolean[] = new Array(totalRows).fill(false);

  // Process in chunks
  for (let i = 0; i < totalRows; i += chunkSize) {
    const chunk = data.slice(i, Math.min(i + chunkSize, totalRows));

    for (let j = 0; j < chunk.length; j++) {
      const row = chunk[j];
      const rowIndex = i + j;

      for (const [field, column] of Object.entries(mapping)) {
        if (!column) continue;

        const value = row[column];
        if (value === null || value === undefined || String(value).trim() === '') {
          continue;
        }

        const transform = transforms?.[column] ?? { type: 'text' as const };
        const transformed = applyTransformation(value, transform);

        if (transformed === null && transform.type !== 'text') {
          rowErrors[rowIndex] = true;
          break;
        }
      }
    }

    processedRows += chunk.length;
    onProgress(Math.round((processedRows / totalRows) * 100));

    // Yield to the event loop
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  // Generate field results after processing
  const fieldResults: Record<string, FieldValidationResult> = {};
  for (const [field, column] of Object.entries(mapping)) {
    if (!column) continue;

    const transform = transforms?.[column] ?? { type: 'text' as const };
    fieldResults[field] = validateField(data, column, transform);
  }

  const invalidRows = rowErrors.filter(Boolean).length;

  return {
    totalRows,
    validRows: totalRows - invalidRows,
    invalidRows,
    fieldResults,
  };
}
