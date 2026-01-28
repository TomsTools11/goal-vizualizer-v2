/**
 * Core type definitions for GOAL Visuals Builder
 */

import type { TransformationConfig, ValidationSummary } from './transformations';

// ============================================================================
// Multi-File Upload Types
// ============================================================================

/**
 * Mode for handling multiple uploaded CSV files
 */
export type MultiFileMode = 'merge' | 'compare';

/**
 * Represents a single uploaded CSV file with its parsed data and mapping
 */
export interface UploadedFile {
  id: string;
  fileName: string;
  headers: string[];
  data: RawRow[];
  mapping: Partial<ColumnMapping>;
  rowCount: number;
  transformConfig?: TransformationConfig;
  validationSummary?: ValidationSummary;
}

// ============================================================================
// Raw CSV Data Types
// ============================================================================

/**
 * A single row from the parsed CSV file (before normalization)
 */
export interface RawRow {
  [key: string]: string | number | boolean | null;
}

// ============================================================================
// Column Mapping Types
// ============================================================================

/**
 * Maps canonical field names to actual CSV column headers
 */
export interface ColumnMapping {
  // Required fields
  entity: string;        // Campaign, Source, Vendor, Channel, etc.
  spend: string;         // Total Spend, Cost, Ad Spend
  leads: string;         // Total Leads, Leads
  
  // Usually required (for most reports)
  quotes: string;        // Total Quotes, Quotes
  sales: string;         // Sales, Policies, Binds, Closed, Households
  
  // Optional fields (enable additional metrics when present)
  clicks?: string;         // Clicks
  impressions?: string;    // Impressions
  contacted?: string;      // Leads Contacted, Contacted
  calls?: string;          // Calls, Inbound Calls
  policyItems?: string;    // Policy Items Sold, Policies Sold, Items Sold
  premium?: string;        // Premium, Total Premium, Premium Generated
  date?: string;           // Date, Day, Week, Month
  
  // Pre-calculated CPA columns (use these values instead of calculating)
  quoteCpa?: string;       // Quote CPA, CPQ - pre-calculated cost per quote
  policyCpa?: string;      // Policy CPA, CPA - pre-calculated cost per acquisition
}

// ============================================================================
// Normalized Data Types
// ============================================================================

/**
 * A normalized row with parsed numeric values and entity key
 */
export interface NormalizedRow {
  entity: string;
  
  // Required numerics
  spend: number;
  leads: number;
  quotes: number;
  sales: number;
  
  // Optional numerics
  clicks?: number;
  impressions?: number;
  contacted?: number;
  calls?: number;
  policyItems?: number;
  premium?: number;
  date?: Date;
  
  // Pre-calculated CPA values
  quoteCpa?: number;
  policyCpa?: number;
}

// ============================================================================
// Aggregated Metrics Types
// ============================================================================

/**
 * Aggregated metrics for a single entity (campaign/source/competitor)
 */
export interface EntityMetrics {
  entity: string;
  
  // Base totals
  spend: number;
  leads: number;
  quotes: number;
  sales: number;
  clicks?: number;
  impressions?: number;
  contacted?: number;
  calls?: number;
  policyItems?: number;
  premium?: number;
  
  // Derived cost metrics
  cpl: number;           // Cost Per Lead
  cpq: number;           // Cost Per Quote
  cpa: number;           // Cost Per Acquisition (Sale)
  cpi?: number;          // Cost Per Item (Policy Item)
  cpc?: number;          // Cost Per Click
  
  // Derived conversion/rate metrics
  quoteRate: number;            // Lead → Quote (%)
  quoteToClose: number;         // Quote → Close (%)
  closeRate: number;            // Lead → Sale (%)
  clickToLead?: number;         // Click → Lead CVR (%)
  clickToClose?: number;        // Click → Close (%)
  contactRate?: number;         // Contact Rate (%)
  inboundCallRate?: number;     // Inbound Call Rate (%)
  ctr?: number;                 // Click-Through Rate (%)
  roas?: number;                // Return on Ad Spend
  
  // Index signature for dynamic metric access
  [key: string]: string | number | undefined;
}

/**
 * Aggregated metrics across all entities (global totals)
 */
export type GlobalMetrics = EntityMetrics & {
  entity: 'Total' | 'Overall';
};

// ============================================================================
// Report Configuration Types
// ============================================================================

/**
 * Available report types
 */
export type ReportType = 'kpi-dashboard' | 'competitive-comparison' | 'campaign-deep-dive';

/**
 * Available metrics that can be displayed
 */
export type MetricId = 
  // Cost metrics
  | 'cpl' | 'cpq' | 'cpa' | 'cpi' | 'cpc'
  // Conversion metrics
  | 'quoteRate' | 'quoteToClose' | 'closeRate' | 'clickToLead' | 'clickToClose'
  // Engagement metrics
  | 'contactRate' | 'inboundCallRate' | 'ctr'
  // Business metrics
  | 'roas';

/**
 * Configuration for generating a report
 */
export interface ReportConfig {
  reportType: ReportType;
  
  // Selected metrics to highlight
  focusMetrics: MetricId[];
  
  // Entity to highlight with ★
  highlightEntity?: string;
  
  // Comparison mode
  comparisonMode: 'single' | 'multi';
  
  // Time grouping (only when date column exists)
  timeGrouping?: 'daily' | 'weekly' | 'monthly' | 'none';
}

// ============================================================================
// Report Model Types
// ============================================================================

/**
 * The complete computed report model ready for rendering
 */
export interface ReportModel {
  // Configuration
  config: ReportConfig;
  
  // Aggregated data
  global: GlobalMetrics;
  entities: EntityMetrics[];
  
  // Metadata
  dataRowCount: number;
  entityCount: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// Metric Definition Types
// ============================================================================

/**
 * Metadata about a metric
 */
export interface MetricDefinition {
  id: MetricId;
  label: string;
  shortLabel?: string;
  description: string;
  category: 'cost' | 'conversion' | 'engagement' | 'business';
  format: 'currency' | 'percentage' | 'number' | 'multiplier';
  lowerIsBetter?: boolean; // For cost metrics
  requiredFields: (keyof ColumnMapping)[];
  calculation: string; // Formula description
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Result of CSV parsing validation
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'missing-headers' | 'empty-file' | 'parse-error' | 'invalid-format' | 'file-too-large';
  message: string;
  line?: number;
  column?: string;
}

export interface ValidationWarning {
  type: 'missing-optional-field' | 'low-data-quality' | 'duplicate-entities';
  message: string;
  field?: string;
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportOptions {
  format: 'pdf' | 'html';
  fileName?: string;
  includeDataTable?: boolean;
  highResolution?: boolean; // For PDF
}

export interface ExportResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}
