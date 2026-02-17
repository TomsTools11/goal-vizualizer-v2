/**
 * Data transformation utilities for CSV parsing
 * Handles date and number parsing with various format support
 */

import type {
  DateFormat,
  NumberFormat,
  FieldType,
  FieldTransformation,
  DateFormatDetection,
  NumberFormatDetection,
  FieldTypeDetection,
} from '@/types/transformations';

// ============================================================================
// Date Parsing
// ============================================================================

/**
 * Date format patterns for parsing
 */
const DATE_PATTERNS: Record<DateFormat, RegExp> = {
  auto: /.*/, // Handled separately
  'MM/DD/YYYY': /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12]\d|3[01])\/(\d{4})$/,
  'DD/MM/YYYY': /^(0?[1-9]|[12]\d|3[01])\/(0?[1-9]|1[0-2])\/(\d{4})$/,
  'YYYY-MM-DD': /^(\d{4})-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/,
  'M/D/YYYY': /^([1-9]|1[0-2])\/([1-9]|[12]\d|3[01])\/(\d{4})$/,
  'M/D/YY': /^([1-9]|1[0-2])\/([1-9]|[12]\d|3[01])\/(\d{2})$/,
  'MM-DD-YYYY': /^(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])-(\d{4})$/,
  'DD-MM-YYYY': /^(0?[1-9]|[12]\d|3[01])-(0?[1-9]|1[0-2])-(\d{4})$/,
};

/**
 * Parse a date string with a specific format
 */
export function parseDateWithFormat(value: string, format: DateFormat): Date | null {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === 'n/a' || trimmed === '-') return null;

  // Auto-detect format
  if (format === 'auto') {
    return parseAutoDate(trimmed);
  }

  const pattern = DATE_PATTERNS[format];
  const match = trimmed.match(pattern);
  if (!match) return null;

  let year: number, month: number, day: number;

  switch (format) {
    case 'MM/DD/YYYY':
    case 'M/D/YYYY':
      month = parseInt(match[1], 10);
      day = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
      break;
    case 'M/D/YY':
      month = parseInt(match[1], 10);
      day = parseInt(match[2], 10);
      year = parseInt(match[3], 10) + 2000;
      break;
    case 'MM-DD-YYYY':
      month = parseInt(match[1], 10);
      day = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
      break;
    case 'DD/MM/YYYY':
    case 'DD-MM-YYYY':
      day = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      year = parseInt(match[3], 10);
      break;
    case 'YYYY-MM-DD':
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
      break;
    default:
      return null;
  }

  // Validate the date
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null; // Invalid date (e.g., Feb 30)
  }

  return date;
}

/**
 * Auto-detect and parse a date string
 */
function parseAutoDate(value: string): Date | null {
  // Try common formats in order of likelihood
  const formats: DateFormat[] = [
    'YYYY-MM-DD',
    'MM/DD/YYYY',
    'M/D/YYYY',
    'M/D/YY',
    'DD/MM/YYYY',
    'MM-DD-YYYY',
    'DD-MM-YYYY',
  ];

  for (const format of formats) {
    const result = parseDateWithFormat(value, format);
    if (result) return result;
  }

  // Fall back to native Date parsing, but only for strings that look like
  // plausible date strings (contain separators like /, -, or spaces).
  // Plain numbers like "185" or "2" should NOT be parsed as dates.
  if (/[\/\-\s]/.test(value) || /[a-zA-Z]/.test(value)) {
    const native = new Date(value);
    return isNaN(native.getTime()) ? null : native;
  }

  return null;
}

/**
 * Detect the most likely date format from sample values
 */
export function detectDateFormat(samples: unknown[]): DateFormatDetection {
  const formats: DateFormat[] = [
    'MM/DD/YYYY',
    'DD/MM/YYYY',
    'YYYY-MM-DD',
    'M/D/YYYY',
    'M/D/YY',
    'MM-DD-YYYY',
    'DD-MM-YYYY',
  ];

  const validSamples = samples
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .slice(0, 20);

  if (validSamples.length === 0) {
    return { format: 'auto', confidence: 0, sampleMatches: 0 };
  }

  let bestFormat: DateFormat = 'auto';
  let bestMatches = 0;

  for (const format of formats) {
    let matches = 0;
    for (const sample of validSamples) {
      const result = parseDateWithFormat(sample, format);
      if (result) matches++;
    }

    if (matches > bestMatches) {
      bestMatches = matches;
      bestFormat = format;
    }
  }

  const confidence = validSamples.length > 0 ? bestMatches / validSamples.length : 0;

  return {
    format: bestFormat,
    confidence,
    sampleMatches: bestMatches,
  };
}

// ============================================================================
// Number Parsing
// ============================================================================

/**
 * Parse a number with a specific format
 */
export function parseNumberWithFormat(value: string, format: NumberFormat): number | null {
  if (value === null || value === undefined) return null;

  const strValue = String(value).trim();
  if (!strValue || strValue.toLowerCase() === 'n/a' || strValue === '-') return null;

  // Auto-detect format
  if (format === 'auto') {
    return parseAutoNumber(strValue);
  }

  let cleaned: string;

  switch (format) {
    case 'plain':
      cleaned = strValue.replace(/[^\d.-]/g, '');
      break;

    case 'currency':
      // Remove currency symbols and commas: $1,234.56 -> 1234.56
      cleaned = strValue.replace(/[\$\€\£,\s]/g, '');
      break;

    case 'percentage':
      // Remove % and convert: 12.5% -> 12.5
      cleaned = strValue.replace(/[%\s]/g, '');
      break;

    case 'european':
      // European format: 1.234,56 -> 1234.56
      cleaned = strValue
        .replace(/\s/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
      break;

    default:
      cleaned = strValue.replace(/[^\d.-]/g, '');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Auto-detect and parse a number string
 */
function parseAutoNumber(value: string): number | null {
  // Detect European format (comma as decimal separator)
  // Pattern: digits with dots as thousands sep, comma as decimal: 1.234,56
  const europeanPattern = /^\d{1,3}(\.\d{3})*,\d+$/;
  if (europeanPattern.test(value)) {
    return parseNumberWithFormat(value, 'european');
  }

  // Detect currency
  if (/^[\$\€\£]/.test(value) || /[\$\€\£]$/.test(value)) {
    return parseNumberWithFormat(value, 'currency');
  }

  // Detect percentage
  if (value.endsWith('%')) {
    return parseNumberWithFormat(value, 'percentage');
  }

  // Default: remove non-numeric except . and -
  return parseNumberWithFormat(value, 'currency'); // Handles commas as thousands separators
}

/**
 * Detect the most likely number format from sample values
 */
export function detectNumberFormat(samples: unknown[]): NumberFormatDetection {
  const validSamples = samples
    .map((s) => String(s ?? '').trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== 'n/a')
    .slice(0, 20);

  if (validSamples.length === 0) {
    return { format: 'auto', confidence: 0, sampleMatches: 0 };
  }

  let currencyCount = 0;
  let percentageCount = 0;
  let europeanCount = 0;
  let plainCount = 0;

  const europeanPattern = /^\d{1,3}(\.\d{3})*,\d+$/;

  for (const sample of validSamples) {
    if (/^[\$\€\£]/.test(sample) || /[\$\€\£]$/.test(sample)) {
      currencyCount++;
    } else if (sample.endsWith('%')) {
      percentageCount++;
    } else if (europeanPattern.test(sample)) {
      europeanCount++;
    } else if (/^-?\d+\.?\d*$/.test(sample.replace(/,/g, ''))) {
      plainCount++;
    }
  }

  const total = validSamples.length;
  const counts = [
    { format: 'currency' as NumberFormat, count: currencyCount },
    { format: 'percentage' as NumberFormat, count: percentageCount },
    { format: 'european' as NumberFormat, count: europeanCount },
    { format: 'plain' as NumberFormat, count: plainCount },
  ];

  counts.sort((a, b) => b.count - a.count);

  const best = counts[0];
  if (best.count === 0) {
    return { format: 'auto', confidence: 0, sampleMatches: 0 };
  }

  return {
    format: best.format,
    confidence: best.count / total,
    sampleMatches: best.count,
  };
}

// ============================================================================
// Field Type Detection
// ============================================================================

/**
 * Detect the field type (date, number, text) from sample values
 */
export function detectFieldType(samples: unknown[]): FieldTypeDetection {
  const validSamples = samples
    .map((s) => String(s ?? '').trim())
    .filter((s) => s.length > 0 && s.toLowerCase() !== 'n/a' && s !== '-')
    .slice(0, 20);

  if (validSamples.length === 0) {
    return { type: 'text', confidence: 0 };
  }

  // Check for dates
  let dateMatches = 0;
  for (const sample of validSamples) {
    const date = parseAutoDate(sample);
    if (date) dateMatches++;
  }

  if (dateMatches / validSamples.length >= 0.7) {
    const dateDetection = detectDateFormat(samples);
    return {
      type: 'date',
      confidence: dateMatches / validSamples.length,
      dateFormat: dateDetection.format,
    };
  }

  // Check for numbers
  let numberMatches = 0;
  for (const sample of validSamples) {
    const num = parseAutoNumber(sample);
    if (num !== null) numberMatches++;
  }

  if (numberMatches / validSamples.length >= 0.7) {
    const numberDetection = detectNumberFormat(samples);
    return {
      type: 'number',
      confidence: numberMatches / validSamples.length,
      numberFormat: numberDetection.format,
    };
  }

  // Default to text
  return { type: 'text', confidence: 1 };
}

// ============================================================================
// Transformation Application
// ============================================================================

/**
 * Apply a transformation to a single value
 */
export function applyTransformation(
  value: unknown,
  config: FieldTransformation
): unknown {
  if (value === null || value === undefined) return null;

  const strValue = String(value).trim();
  if (!strValue || strValue.toLowerCase() === 'n/a' || strValue === '-') {
    return null;
  }

  switch (config.type) {
    case 'date': {
      const format = (config.format as DateFormat) || 'auto';
      const date = parseDateWithFormat(strValue, format);
      return date ? date.toISOString() : null;
    }

    case 'number': {
      const format = (config.format as NumberFormat) || 'auto';
      return parseNumberWithFormat(strValue, format);
    }

    case 'text':
    default:
      return strValue;
  }
}

/**
 * Format a date for display in the preview
 */
export function formatDatePreview(value: Date | string | null): string {
  if (!value) return '—';

  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a number for display in the preview
 */
export function formatNumberPreview(
  value: number | null,
  format: NumberFormat = 'auto'
): string {
  if (value === null) return '—';

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);

    case 'percentage':
      return `${value}%`;

    case 'european':
      return new Intl.NumberFormat('de-DE').format(value);

    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

/**
 * Auto-detect transformations for all columns based on sample data
 */
export function autoDetectTransformations(
  headers: string[],
  sampleRows: Record<string, unknown>[]
): Record<string, FieldTransformation> {
  const transforms: Record<string, FieldTransformation> = {};

  for (const header of headers) {
    const samples = sampleRows.map((row) => row[header]);
    const detection = detectFieldType(samples);

    transforms[header] = {
      type: detection.type,
      format:
        detection.type === 'date'
          ? detection.dateFormat
          : detection.type === 'number'
            ? detection.numberFormat
            : undefined,
    };
  }

  return transforms;
}
