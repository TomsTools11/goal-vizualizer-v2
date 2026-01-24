/**
 * KPI Dashboard Report Layout
 * Top KPI row + 2-column grid of metric comparison charts
 */

import React from 'react';
import type { EntityMetrics, MetricId, ReportConfig } from '@/types';
import { KpiCardCompact } from '@/components/KpiCard';
import { HorizontalBarChart } from '@/components/HorizontalBarChart';
import { BottomLineCallout } from '@/components/BottomLineCallout';
import { METRIC_DEFINITIONS } from '@/constants/metricDefinitions';
import { formatMetricValue } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface KPIDashboardProps {
  config: ReportConfig;
  global: EntityMetrics;
  entities: EntityMetrics[];
}

export function KPIDashboard({ config, global, entities }: KPIDashboardProps) {
  const { focusMetrics, highlightEntity } = config;
  
  // Get the highlighted entity if specified, otherwise use global
  const highlightedMetrics = highlightEntity 
    ? entities.find(e => e.entity === highlightEntity) || global
    : global;

  // Prepare top summary KPIs (up to 4)
  const allSummaryMetrics: { metricId: MetricId; value: number }[] = [
    { metricId: 'closeRate', value: highlightedMetrics.closeRate as number },
    { metricId: 'quoteRate', value: highlightedMetrics.quoteRate as number },
    { metricId: 'quoteToClose', value: highlightedMetrics.quoteToClose as number },
    { metricId: 'cpa', value: highlightedMetrics.cpa as number },
  ];
  const summaryMetrics = allSummaryMetrics.filter(
    (m): m is { metricId: MetricId; value: number } => 
      focusMetrics.includes(m.metricId) || focusMetrics.length === 0
  );

  // Get chart data for a specific metric
  const getChartData = (metricId: MetricId) => {
    const def = METRIC_DEFINITIONS[metricId];
    const sortedEntities = [...entities].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[metricId] as number;
      const bVal = (b as Record<string, unknown>)[metricId] as number;
      // For lower-is-better, sort ascending; otherwise descending
      return def?.lowerIsBetter ? aVal - bVal : bVal - aVal;
    });

    return sortedEntities.map(entity => ({
      label: entity.entity,
      value: (entity as Record<string, unknown>)[metricId] as number,
      isPrimary: entity.entity === highlightEntity,
      formattedValue: formatMetricValue(
        (entity as Record<string, unknown>)[metricId] as number,
        def?.format || 'number'
      ),
    }));
  };

  // Filter to metrics that exist in the data
  const displayMetrics = focusMetrics.filter(metricId => {
    const value = (highlightedMetrics as Record<string, unknown>)[metricId];
    return value !== undefined && value !== null;
  });

  // Find the best "bottom line" metric (prioritize CPA, then close rate, then ROAS)
  const bottomLineMetric = displayMetrics.find(m => m === 'cpa') 
    || displayMetrics.find(m => m === 'closeRate')
    || displayMetrics.find(m => m === 'roas')
    || displayMetrics[0];
  
  const bottomLineDef = bottomLineMetric ? METRIC_DEFINITIONS[bottomLineMetric] : null;
  const bottomLineValue = bottomLineMetric 
    ? (highlightedMetrics as Record<string, unknown>)[bottomLineMetric] as number 
    : 0;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
          📊 KPI Dashboard
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Performance Overview
        </h1>
        {highlightEntity && (
          <p className="text-slate-500">
            Highlighting: <span className="font-semibold text-primary">★ {highlightEntity}</span>
          </p>
        )}
      </div>

      {/* Top KPI Summary Row */}
      <div className={cn(
        'grid gap-4',
        summaryMetrics.length <= 2 ? 'grid-cols-2' :
        summaryMetrics.length === 3 ? 'grid-cols-3' :
        'grid-cols-2 md:grid-cols-4'
      )}>
        {summaryMetrics.slice(0, 4).map(({ metricId, value }) => {
          const def = METRIC_DEFINITIONS[metricId];
          return (
            <KpiCardCompact
              key={metricId}
              label={def?.shortLabel || def?.label || metricId}
              value={value}
              format={def?.format}
            />
          );
        })}
      </div>

      {/* Metric Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayMetrics.map(metricId => {
          const def = METRIC_DEFINITIONS[metricId];
          const chartData = getChartData(metricId);
          
          if (chartData.length === 0) return null;
          
          return (
            <HorizontalBarChart
              key={metricId}
              title={def?.label || metricId}
              subtitle="Performance"
              data={chartData}
              valueSuffix={def?.format === 'percentage' ? '%' : ''}
              valuePrefix={def?.format === 'currency' ? '$' : ''}
            />
          );
        })}
      </div>

      {/* Bottom Line */}
      {bottomLineDef && bottomLineValue > 0 && (
        <BottomLineCallout
          message={`Overall ${bottomLineDef.label.toLowerCase()} across all campaigns.`}
          highlightValue={bottomLineValue}
          highlightLabel={bottomLineDef.shortLabel || bottomLineDef.label}
          format={bottomLineDef.format}
        />
      )}
    </div>
  );
}
