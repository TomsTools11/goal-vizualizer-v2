/**
 * Metric Definitions Registry
 * Based on Key Metrics and Calculations.csv
 */

import type { MetricDefinition, MetricId } from '@/types';

export const METRIC_DEFINITIONS: Record<MetricId, MetricDefinition> = {
  // ============================================================================
  // Cost Metrics
  // ============================================================================
  
  cpl: {
    id: 'cpl',
    label: 'Cost Per Lead',
    shortLabel: 'CPL',
    description: 'The average cost to generate one lead. Frequently referred to as a "vanity metric" because a low CPL does not guarantee profitability if the leads do not convert to sales.',
    category: 'cost',
    format: 'currency',
    lowerIsBetter: true,
    requiredFields: ['spend', 'leads'],
    calculation: 'Total Spend / Total Leads',
  },
  
  cpq: {
    id: 'cpq',
    label: 'Cost Per Quote',
    shortLabel: 'CPQ',
    description: 'The average cost to generate one quote.',
    category: 'cost',
    format: 'currency',
    lowerIsBetter: true,
    requiredFields: ['spend', 'quotes'],
    calculation: 'Total Spend / Total Quotes',
  },
  
  cpa: {
    id: 'cpa',
    label: 'Cost Per Acquisition',
    shortLabel: 'CPA',
    description: 'The specific cost incurred to generate a single sale or write a household. This is described as the "number one metric" and "end-all-be-all" for measuring success, as opposed to vanity metrics like CPL.',
    category: 'cost',
    format: 'currency',
    lowerIsBetter: true,
    requiredFields: ['spend', 'sales'],
    calculation: 'Total Spend / Total Sales',
  },
  
  cpi: {
    id: 'cpi',
    label: 'Cost Per Item',
    shortLabel: 'CPI',
    description: 'The cost to acquire a specific policy "item" (e.g., an auto policy vs. a home policy) within a household.',
    category: 'cost',
    format: 'currency',
    lowerIsBetter: true,
    requiredFields: ['spend', 'policyItems'],
    calculation: 'Total Spend / Total Number of Policy Items Sold',
  },
  
  cpc: {
    id: 'cpc',
    label: 'Cost Per Click',
    shortLabel: 'CPC',
    description: 'The amount paid for each individual click on an ad unit. This serves as the "entry point" cost before a lead is generated.',
    category: 'cost',
    format: 'currency',
    lowerIsBetter: true,
    requiredFields: ['spend', 'clicks'],
    calculation: 'Total Spend / Total Clicks',
  },
  
  // ============================================================================
  // Conversion/Rate Metrics
  // ============================================================================
  
  quoteRate: {
    id: 'quoteRate',
    label: 'Quote Rate (Lead → Quote)',
    shortLabel: 'Quote Rate',
    description: 'The percentage of leads that result in the agent providing a price quote.',
    category: 'conversion',
    format: 'percentage',
    requiredFields: ['leads', 'quotes'],
    calculation: '(Total Quotes / Total Leads) × 100',
  },
  
  quoteToClose: {
    id: 'quoteToClose',
    label: 'Quote-to-Close (Quote → Bind)',
    shortLabel: 'Quote → Close',
    description: 'The percentage of quoted prospects that ultimately purchase a policy.',
    category: 'conversion',
    format: 'percentage',
    requiredFields: ['quotes', 'sales'],
    calculation: '(Total Sales / Total Quotes) × 100',
  },
  
  closeRate: {
    id: 'closeRate',
    label: 'Close Rate (Lead → Sale)',
    shortLabel: 'Close Rate',
    description: 'The percentage of generated leads that result in a sold policy or bound household.',
    category: 'conversion',
    format: 'percentage',
    requiredFields: ['leads', 'sales'],
    calculation: '(Total Sales / Total Leads) × 100',
  },
  
  clickToLead: {
    id: 'clickToLead',
    label: 'Click-to-Lead Conversion Rate',
    shortLabel: 'Click → Lead',
    description: 'The percentage of consumers who clicked on an ad and successfully completed the form to become a lead. The "floor" for this metric is typically expected to be around 50%.',
    category: 'conversion',
    format: 'percentage',
    requiredFields: ['clicks', 'leads'],
    calculation: '(Leads / Clicks) × 100',
  },
  
  clickToClose: {
    id: 'clickToClose',
    label: 'Sales Rate (Click-to-Close)',
    shortLabel: 'Click → Close',
    description: 'The percentage of clicks that result in a sale. This is sometimes used in high-level dashboard analysis to measure funnel efficiency from the very top.',
    category: 'conversion',
    format: 'percentage',
    requiredFields: ['clicks', 'sales'],
    calculation: '(Sales / Clicks) × 100',
  },
  
  // ============================================================================
  // Engagement Metrics
  // ============================================================================
  
  contactRate: {
    id: 'contactRate',
    label: 'Contact Rate',
    shortLabel: 'Contact Rate',
    description: 'The percentage of leads with whom the agent or sales team successfully makes contact.',
    category: 'engagement',
    format: 'percentage',
    requiredFields: ['leads', 'contacted'],
    calculation: '(Leads Contacted / Total Leads) × 100',
  },
  
  inboundCallRate: {
    id: 'inboundCallRate',
    label: 'Inbound Call Rate',
    shortLabel: 'Call Rate',
    description: 'The percentage of leads that result in the consumer clicking to call the agency directly. The average is typically around 10%.',
    category: 'engagement',
    format: 'percentage',
    requiredFields: ['leads', 'calls'],
    calculation: '(Calls / Leads) × 100',
  },
  
  ctr: {
    id: 'ctr',
    label: 'Click-Through Rate',
    shortLabel: 'CTR',
    description: 'The percentage of times an ad was clicked relative to how many times it was shown (impressions).',
    category: 'engagement',
    format: 'percentage',
    requiredFields: ['impressions', 'clicks'],
    calculation: '(Total Clicks / Total Impressions) × 100',
  },
  
  // ============================================================================
  // Business Metrics
  // ============================================================================
  
  roas: {
    id: 'roas',
    label: 'Return on Ad Spend',
    shortLabel: 'ROAS',
    description: 'A metric used to measure the gross revenue generated for every dollar spent on advertising. GOAL ideal is 5:1.',
    category: 'business',
    format: 'multiplier',
    requiredFields: ['spend', 'premium'],
    calculation: 'Total Premium Generated / Total Ad Spend',
  },
};

/**
 * Get all metric IDs
 */
export const ALL_METRIC_IDS = Object.keys(METRIC_DEFINITIONS) as MetricId[];

/**
 * Get metrics by category
 */
export function getMetricsByCategory(category: MetricDefinition['category']): MetricDefinition[] {
  return ALL_METRIC_IDS
    .map(id => METRIC_DEFINITIONS[id])
    .filter(def => def.category === category);
}

/**
 * Get required fields for a set of metrics
 */
export function getRequiredFieldsForMetrics(metricIds: MetricId[]): Set<keyof import('@/types').ColumnMapping> {
  const fields = new Set<keyof import('@/types').ColumnMapping>();
  
  metricIds.forEach(id => {
    const def = METRIC_DEFINITIONS[id];
    if (def) {
      def.requiredFields.forEach(field => fields.add(field));
    }
  });
  
  return fields;
}

/**
 * Check if a metric can be calculated given available mapped columns
 */
export function canCalculateMetric(
  metricId: MetricId,
  mapping: Partial<import('@/types').ColumnMapping>
): boolean {
  const def = METRIC_DEFINITIONS[metricId];
  if (!def) return false;
  
  return def.requiredFields.every(field => {
    const mappedColumn = mapping[field];
    return mappedColumn && mappedColumn.length > 0;
  });
}
