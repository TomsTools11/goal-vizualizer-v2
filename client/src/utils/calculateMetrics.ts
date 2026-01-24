/**
 * Metric calculation engine
 * Calculates all derived metrics from base fields
 */

import type { NormalizedRow, EntityMetrics } from '@/types';
import { safeDivide, calculatePercentage } from './formatters';

/**
 * Calculate all metrics for a single entity (aggregated rows)
 */
export function calculateEntityMetrics(
  entity: string,
  rows: NormalizedRow[]
): EntityMetrics {
  // Aggregate base totals and pre-calculated CPA values
  const totals = rows.reduce(
    (acc, row) => ({
      spend: acc.spend + row.spend,
      leads: acc.leads + row.leads,
      quotes: acc.quotes + row.quotes,
      sales: acc.sales + row.sales,
      clicks: acc.clicks + (row.clicks ?? 0),
      impressions: acc.impressions + (row.impressions ?? 0),
      contacted: acc.contacted + (row.contacted ?? 0),
      calls: acc.calls + (row.calls ?? 0),
      policyItems: acc.policyItems + (row.policyItems ?? 0),
      premium: acc.premium + (row.premium ?? 0),
      // Sum of pre-calculated CPAs (will be averaged later)
      quoteCpaSum: acc.quoteCpaSum + (row.quoteCpa ?? 0),
      quoteCpaCount: acc.quoteCpaCount + (row.quoteCpa !== undefined ? 1 : 0),
      policyCpaSum: acc.policyCpaSum + (row.policyCpa ?? 0),
      policyCpaCount: acc.policyCpaCount + (row.policyCpa !== undefined ? 1 : 0),
    }),
    {
      spend: 0,
      leads: 0,
      quotes: 0,
      sales: 0,
      clicks: 0,
      impressions: 0,
      contacted: 0,
      calls: 0,
      policyItems: 0,
      premium: 0,
      quoteCpaSum: 0,
      quoteCpaCount: 0,
      policyCpaSum: 0,
      policyCpaCount: 0,
    }
  );

  // Calculate derived cost metrics
  // Use pre-calculated CPA values if available, otherwise calculate from totals
  const cpl = safeDivide(totals.spend, totals.leads);
  
  // For CPQ: use pre-calculated average if available, else calculate
  const cpq = totals.quoteCpaCount > 0 
    ? safeDivide(totals.quoteCpaSum, totals.quoteCpaCount)
    : safeDivide(totals.spend, totals.quotes);
  
  // For CPA: use pre-calculated average if available, else calculate
  const cpa = totals.policyCpaCount > 0 
    ? safeDivide(totals.policyCpaSum, totals.policyCpaCount)
    : safeDivide(totals.spend, totals.sales);
  
  const cpi = totals.policyItems > 0 ? safeDivide(totals.spend, totals.policyItems) : undefined;
  const cpc = totals.clicks > 0 ? safeDivide(totals.spend, totals.clicks) : undefined;

  // Calculate derived conversion/rate metrics (as percentages, not decimals)
  const quoteRate = calculatePercentage(totals.quotes, totals.leads);
  const quoteToClose = calculatePercentage(totals.sales, totals.quotes);
  const closeRate = calculatePercentage(totals.sales, totals.leads);
  const clickToLead = totals.clicks > 0 ? calculatePercentage(totals.leads, totals.clicks) : undefined;
  const clickToClose = totals.clicks > 0 ? calculatePercentage(totals.sales, totals.clicks) : undefined;
  const contactRate = totals.contacted > 0 ? calculatePercentage(totals.contacted, totals.leads) : undefined;
  const inboundCallRate = totals.calls > 0 ? calculatePercentage(totals.calls, totals.leads) : undefined;
  const ctr = totals.impressions > 0 ? calculatePercentage(totals.clicks, totals.impressions) : undefined;

  // Calculate ROAS (Return on Ad Spend)
  const roas = totals.premium > 0 ? safeDivide(totals.premium, totals.spend) : undefined;

  return {
    entity,
    
    // Base totals
    spend: totals.spend,
    leads: totals.leads,
    quotes: totals.quotes,
    sales: totals.sales,
    clicks: totals.clicks > 0 ? totals.clicks : undefined,
    impressions: totals.impressions > 0 ? totals.impressions : undefined,
    contacted: totals.contacted > 0 ? totals.contacted : undefined,
    calls: totals.calls > 0 ? totals.calls : undefined,
    policyItems: totals.policyItems > 0 ? totals.policyItems : undefined,
    premium: totals.premium > 0 ? totals.premium : undefined,
    
    // Derived cost metrics
    cpl,
    cpq,
    cpa,
    cpi,
    cpc,
    
    // Derived conversion/rate metrics
    quoteRate,
    quoteToClose,
    closeRate,
    clickToLead,
    clickToClose,
    contactRate,
    inboundCallRate,
    ctr,
    
    // Business metrics
    roas,
  };
}

/**
 * Calculate global metrics (totals across all entities)
 */
export function calculateGlobalMetrics(allRows: NormalizedRow[]): EntityMetrics {
  return {
    ...calculateEntityMetrics('Total', allRows),
    entity: 'Total',
  };
}

/**
 * Calculate metrics for each entity and global totals
 */
export function calculateAllMetrics(
  rows: NormalizedRow[]
): { global: EntityMetrics; entities: EntityMetrics[] } {
  // Group rows by entity
  const rowsByEntity = new Map<string, NormalizedRow[]>();
  
  rows.forEach(row => {
    const existing = rowsByEntity.get(row.entity) || [];
    existing.push(row);
    rowsByEntity.set(row.entity, existing);
  });
  
  // Calculate metrics for each entity
  const entities = Array.from(rowsByEntity.entries()).map(([entity, entityRows]) =>
    calculateEntityMetrics(entity, entityRows)
  );
  
  // Calculate global totals
  const global = calculateGlobalMetrics(rows);
  
  return { global, entities };
}
