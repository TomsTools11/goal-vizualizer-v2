/**
 * Data normalization utilities
 * Converts raw CSV rows to typed NormalizedRow format using column mapping
 */

import type { RawRow, ColumnMapping, NormalizedRow } from '@/types';
import { parseNumeric } from './formatters';

/**
 * Normalize a single raw CSV row using the column mapping
 */
export function normalizeRow(
  row: RawRow,
  mapping: Partial<ColumnMapping>
): NormalizedRow | null {
  // Entity is required
  if (!mapping.entity) return null;
  
  const entityValue = row[mapping.entity];
  if (!entityValue) return null;
  
  const entity = String(entityValue).trim();
  if (!entity) return null;
  
  // Parse required numeric fields
  const spend = mapping.spend ? parseNumeric(row[mapping.spend]) : 0;
  const leads = mapping.leads ? parseNumeric(row[mapping.leads]) : 0;
  const quotes = mapping.quotes ? parseNumeric(row[mapping.quotes]) : 0;
  const sales = mapping.sales ? parseNumeric(row[mapping.sales]) : 0;
  
  // Parse optional numeric fields
  const clicks = mapping.clicks ? parseNumeric(row[mapping.clicks]) : undefined;
  const impressions = mapping.impressions ? parseNumeric(row[mapping.impressions]) : undefined;
  const contacted = mapping.contacted ? parseNumeric(row[mapping.contacted]) : undefined;
  const calls = mapping.calls ? parseNumeric(row[mapping.calls]) : undefined;
  const policyItems = mapping.policyItems ? parseNumeric(row[mapping.policyItems]) : undefined;
  const premium = mapping.premium ? parseNumeric(row[mapping.premium]) : undefined;
  
  // Parse pre-calculated CPA fields
  const quoteCpa = mapping.quoteCpa ? parseNumeric(row[mapping.quoteCpa]) : undefined;
  const policyCpa = mapping.policyCpa ? parseNumeric(row[mapping.policyCpa]) : undefined;
  
  // Parse date if present
  let date: Date | undefined;
  if (mapping.date) {
    const dateValue = row[mapping.date];
    if (dateValue && typeof dateValue !== 'boolean') {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        date = parsed;
      }
    }
  }
  
  return {
    entity,
    spend,
    leads,
    quotes,
    sales,
    ...(clicks !== undefined && { clicks }),
    ...(impressions !== undefined && { impressions }),
    ...(contacted !== undefined && { contacted }),
    ...(calls !== undefined && { calls }),
    ...(policyItems !== undefined && { policyItems }),
    ...(premium !== undefined && { premium }),
    ...(date && { date }),
    ...(quoteCpa !== undefined && { quoteCpa }),
    ...(policyCpa !== undefined && { policyCpa }),
  };
}

/**
 * Normalize all raw CSV rows
 * Filters out rows that can't be normalized (missing required fields)
 */
export function normalizeData(
  rawData: RawRow[],
  mapping: Partial<ColumnMapping>
): NormalizedRow[] {
  const normalized: NormalizedRow[] = [];
  
  for (const row of rawData) {
    const normalizedRow = normalizeRow(row, mapping);
    if (normalizedRow) {
      normalized.push(normalizedRow);
    }
  }
  
  return normalized;
}

/**
 * Validate that the normalized data is sufficient for reporting
 */
export function validateNormalizedData(data: NormalizedRow[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if we have any data
  if (data.length === 0) {
    errors.push('No valid data rows found after normalization');
    return { valid: false, errors, warnings };
  }
  
  // Check for duplicate entities
  const entities = data.map(row => row.entity);
  const uniqueEntities = new Set(entities);
  if (entities.length !== uniqueEntities.size) {
    warnings.push('Duplicate entity names detected. Data will be aggregated by entity.');
  }
  
  // Check if all rows have zero values (likely data quality issue)
  const allZeros = data.every(row => 
    row.spend === 0 && row.leads === 0 && row.quotes === 0 && row.sales === 0
  );
  if (allZeros) {
    errors.push('All data rows have zero values. Please check your data.');
    return { valid: false, errors, warnings };
  }
  
  return { valid: true, errors, warnings };
}
