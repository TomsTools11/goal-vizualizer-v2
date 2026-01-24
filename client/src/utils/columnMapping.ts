/**
 * Column mapping utilities with auto-detection heuristics
 */

import type { ColumnMapping } from '@/types';

/**
 * Column detection patterns (case-insensitive)
 * Each field has multiple possible column name patterns
 * Order matters - more specific patterns should come first to avoid false matches
 */
const COLUMN_PATTERNS: Record<keyof ColumnMapping, string[]> = {
  entity: ['campaign', 'source', 'vendor', 'channel', 'entity', 'name', 'provider', 'competitor'],
  spend: ['total spend', 'ad spend', 'advertising spend', 'spend', 'total cost', 'cost', 'budget'],
  leads: ['total leads', 'lead count', 'number of leads', 'leads'],
  quotes: ['total quotes', 'quote count', 'number of quotes', 'quotes', 'quote', 'quoted'],
  sales: ['total sales', 'policy count', 'bound hh', 'bound households', 'sales', 'policies', 'policy', 'binds', 'closed', 'bound', 'bounds', 'households', 'hh'],
  clicks: ['total clicks', 'click count', 'number of clicks', 'clicks'],
  impressions: ['total impressions', 'impression count', 'impressions', 'impr', 'views'],
  contacted: ['leads contacted', 'contact count', 'contacts made', 'contacted'],
  calls: ['inbound calls', 'phone calls', 'call count', 'total calls', 'calls'],
  policyItems: ['policy items sold', 'policy items', 'items sold', 'policies sold', 'item count'],
  premium: ['total premium', 'premium generated', 'premium', 'policy rev', 'policy revenue', 'total revenue', 'revenue'],
  date: ['date', 'day', 'week', 'month', 'period', 'time', 'timestamp'],
  // Pre-calculated CPA columns - detected separately (not excluded)
  quoteCpa: ['quote cpa', 'cpq', 'cost per quote'],
  policyCpa: ['policy cpa', 'cpa', 'cost per acquisition', 'cost per sale', 'cost per policy'],
};

/**
 * Patterns to EXCLUDE from matching raw count fields (these are derived metrics)
 * Case-insensitive check
 * Note: CPA columns are handled separately via quoteCpa and policyCpa fields
 */
const EXCLUDE_PATTERNS = [
  'cvr', 'cpl', 'cpc', 'cpi', 'rate', 'ratio', '%', 'percent', 'conversion',
];

/**
 * CPA patterns - these should be detected for quoteCpa/policyCpa but excluded from other fields
 */
const CPA_PATTERNS = ['cpa', 'cpq', 'cost per'];

/**
 * Check if a header should be excluded from raw count fields
 * (it's a derived metric, not raw data)
 */
function shouldExcludeHeader(header: string, field: keyof ColumnMapping): boolean {
  const lower = header.toLowerCase();
  
  // CPA fields should match CPA patterns, not be excluded
  if (field === 'quoteCpa' || field === 'policyCpa') {
    return false;
  }
  
  // For non-CPA fields, exclude headers that contain CPA patterns
  if (CPA_PATTERNS.some(pattern => lower.includes(pattern))) {
    return true;
  }
  
  return EXCLUDE_PATTERNS.some(pattern => lower.includes(pattern));
}

/**
 * Auto-detect column mappings from CSV headers
 * Returns a partial mapping with best-guess matches
 */
export function autoDetectColumns(headers: string[]): Partial<ColumnMapping> {
  const mapping: Partial<ColumnMapping> = {};
  const usedHeaders = new Set<string>(); // Track which headers have been mapped
  
  // For each canonical field, try to find a matching header
  (Object.keys(COLUMN_PATTERNS) as (keyof ColumnMapping)[]).forEach(field => {
    const patterns = COLUMN_PATTERNS[field];
    
    // Try exact match first (excluding derived metrics unless it's a CPA field)
    for (const pattern of patterns) {
      const index = headers.findIndex((h, i) => {
        const lower = h.toLowerCase().trim();
        return lower === pattern && 
               !usedHeaders.has(h) && 
               !shouldExcludeHeader(h, field);
      });
      if (index !== -1) {
        mapping[field] = headers[index];
        usedHeaders.add(headers[index]);
        return;
      }
    }
    
    // Try contains match (but only if it's primarily that term, not a derived metric)
    for (const pattern of patterns) {
      const index = headers.findIndex((h, i) => {
        const lower = h.toLowerCase().trim();
        // Check that the header contains the pattern but isn't a derived metric
        return lower.includes(pattern) && 
               !usedHeaders.has(h) && 
               !shouldExcludeHeader(h, field);
      });
      if (index !== -1) {
        mapping[field] = headers[index];
        usedHeaders.add(headers[index]);
        return;
      }
    }
  });
  
  return mapping;
}

/**
 * Validate that required fields are mapped
 */
export function validateRequiredFields(mapping: Partial<ColumnMapping>): {
  valid: boolean;
  missingFields: (keyof ColumnMapping)[];
} {
  const requiredFields: (keyof ColumnMapping)[] = ['entity', 'spend', 'leads', 'quotes', 'sales'];
  const missingFields: (keyof ColumnMapping)[] = [];
  
  for (const field of requiredFields) {
    if (!mapping[field] || mapping[field]!.trim() === '') {
      missingFields.push(field);
    }
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Get friendly label for a mapping field
 */
export function getFieldLabel(field: keyof ColumnMapping): string {
  const labels: Record<keyof ColumnMapping, string> = {
    entity: 'Entity / Campaign',
    spend: 'Total Spend',
    leads: 'Total Leads',
    quotes: 'Total Quotes',
    sales: 'Total Sales / Policies',
    clicks: 'Total Clicks',
    impressions: 'Total Impressions',
    contacted: 'Leads Contacted',
    calls: 'Calls / Inbound Calls',
    policyItems: 'Policy Items Sold',
    premium: 'Total Premium Generated',
    date: 'Date',
    quoteCpa: 'Quote CPA (Pre-calculated)',
    policyCpa: 'Policy CPA (Pre-calculated)',
  };
  
  return labels[field];
}

/**
 * Check if a field is required
 */
export function isRequiredField(field: keyof ColumnMapping): boolean {
  return ['entity', 'spend', 'leads', 'quotes', 'sales'].includes(field);
}

/**
 * Get description for a mapping field
 */
export function getFieldDescription(field: keyof ColumnMapping): string {
  const descriptions: Record<keyof ColumnMapping, string> = {
    entity: 'The campaign, source, vendor, or competitor name for grouping data',
    spend: 'Total advertising spend or cost',
    leads: 'Total number of leads generated',
    quotes: 'Total number of quotes provided',
    sales: 'Total number of sales, policies, bound households, or binds',
    clicks: 'Total number of ad clicks (optional, enables CPC and Click→Lead metrics)',
    impressions: 'Total number of ad impressions (optional, enables CTR metric)',
    contacted: 'Number of leads contacted (optional, enables Contact Rate metric)',
    calls: 'Number of inbound calls (optional, enables Inbound Call Rate metric)',
    policyItems: 'Number of individual policy items sold (optional, enables CPI metric)',
    premium: 'Total premium generated (optional, enables ROAS metric)',
    date: 'Date column for time-series grouping (optional)',
    quoteCpa: 'Pre-calculated cost per quote from CSV (optional, overrides calculated CPQ)',
    policyCpa: 'Pre-calculated cost per acquisition from CSV (optional, overrides calculated CPA)',
  };
  
  return descriptions[field];
}

/**
 * Get all mapping fields in display order (required first, then optional)
 */
export function getMappingFieldsInOrder(): (keyof ColumnMapping)[] {
  const required: (keyof ColumnMapping)[] = ['entity', 'spend', 'leads', 'quotes', 'sales'];
  const optional: (keyof ColumnMapping)[] = [
    'clicks',
    'impressions',
    'contacted',
    'calls',
    'policyItems',
    'premium',
    'date',
  ];
  
  return [...required, ...optional];
}
