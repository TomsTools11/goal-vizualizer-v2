/**
 * Transformation and validation types for CSV column mapping
 */

// ============================================================================
// Format Types
// ============================================================================

/**
 * Supported date format options
 */
export type DateFormat =
  | 'auto'
  | 'MM/DD/YYYY'
  | 'DD/MM/YYYY'
  | 'YYYY-MM-DD'
  | 'M/D/YYYY'
  | 'M/D/YY'
  | 'MM-DD-YYYY'
  | 'DD-MM-YYYY';

/**
 * Supported number format options
 */
export type NumberFormat =
  | 'auto'
  | 'plain'
  | 'currency'
  | 'percentage'
  | 'european';

/**
 * Data type for a field
 */
export type FieldType = 'date' | 'number' | 'text';

// ============================================================================
// Transformation Types
// ============================================================================

/**
 * Transformation configuration for a single field
 */
export interface FieldTransformation {
  type: FieldType;
  format?: DateFormat | NumberFormat;
}

/**
 * Map of field names to their transformation configs
 */
export interface TransformationConfig {
  [fieldName: string]: FieldTransformation;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result for a single field
 */
export interface FieldValidationResult {
  field: string;
  valid: boolean;
  sampleValues: unknown[];
  transformedSamples: unknown[];
  errorCount: number;
  warningMessage?: string;
  detectedType?: FieldType;
}

/**
 * Summary of validation results across all fields
 */
export interface ValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  fieldResults: Record<string, FieldValidationResult>;
}

// ============================================================================
// Detection Result Types
// ============================================================================

/**
 * Result of auto-detecting a date format
 */
export interface DateFormatDetection {
  format: DateFormat;
  confidence: number; // 0-1
  sampleMatches: number;
}

/**
 * Result of auto-detecting a number format
 */
export interface NumberFormatDetection {
  format: NumberFormat;
  confidence: number; // 0-1
  sampleMatches: number;
}

/**
 * Result of auto-detecting field type
 */
export interface FieldTypeDetection {
  type: FieldType;
  confidence: number; // 0-1
  dateFormat?: DateFormat;
  numberFormat?: NumberFormat;
}
