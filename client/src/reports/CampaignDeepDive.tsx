/**
 * Campaign Deep Dive Report Layout
 * Per-campaign breakdown with detailed metrics
 */

import React from 'react';
import type { EntityMetrics, MetricId, ReportConfig } from '@/types';
import { KpiCard } from '@/components/KpiCard';
import { HorizontalBarChart } from '@/components/HorizontalBarChart';
import { BottomLineCallout } from '@/components/BottomLineCallout';
import { METRIC_DEFINITIONS } from '@/constants/metricDefinitions';
import { formatMetricValue, formatCurrency, formatNumber } from '@/utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CampaignDeepDiveProps {
  config: ReportConfig;
  global: EntityMetrics;
  entities: EntityMetrics[];
}

export function CampaignDeepDive({ config, global, entities }: CampaignDeepDiveProps) {
  const { focusMetrics, highlightEntity } = config;
  
  // Sort entities by spend (largest first)
  const sortedEntities = [...entities].sort((a, b) => b.spend - a.spend);
  
  // Get highlighted entity or first one
  const highlighted = highlightEntity 
    ? entities.find(e => e.entity === highlightEntity)
    : sortedEntities[0];

  // Filter metrics that have values
  const displayMetrics = focusMetrics.filter(metricId => {
    return entities.some(e => {
      const val = (e as Record<string, unknown>)[metricId];
      return val !== undefined && val !== null;
    });
  });

  // Get chart data for a specific metric
  const getChartData = (metricId: MetricId) => {
    const def = METRIC_DEFINITIONS[metricId];
    const sorted = [...entities].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[metricId] as number;
      const bVal = (b as Record<string, unknown>)[metricId] as number;
      return def?.lowerIsBetter ? aVal - bVal : bVal - aVal;
    });

    return sorted.map(entity => ({
      label: entity.entity,
      value: (entity as Record<string, unknown>)[metricId] as number,
      isPrimary: entity.entity === highlightEntity,
      formattedValue: formatMetricValue(
        (entity as Record<string, unknown>)[metricId] as number,
        def?.format || 'number'
      ),
    }));
  };

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
          🔍 Campaign Deep Dive
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Detailed Campaign Analysis
        </h1>
        <p className="text-slate-500">
          Analyzing {entities.length} campaign{entities.length !== 1 ? 's' : ''} with total spend of {formatCurrency(global.spend)}
        </p>
      </div>

      {/* Global Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-primary">{formatCurrency(global.spend)}</div>
              <div className="text-xs text-slate-500 uppercase">Total Spend</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{formatNumber(global.leads)}</div>
              <div className="text-xs text-slate-500 uppercase">Total Leads</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-slate-900">{formatNumber(global.quotes)}</div>
              <div className="text-xs text-slate-500 uppercase">Total Quotes</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{formatNumber(global.sales)}</div>
              <div className="text-xs text-slate-500 uppercase">Total Sales</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{global.closeRate.toFixed(1)}%</div>
              <div className="text-xs text-slate-500 uppercase">Close Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Campaign Cards */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Campaign Breakdown</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {sortedEntities.map((entity, index) => {
            const isHighlighted = entity.entity === highlightEntity;
            const spendPercent = global.spend > 0 ? (entity.spend / global.spend) * 100 : 0;
            
            return (
              <Card 
                key={entity.entity}
                className={cn(
                  isHighlighted && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {isHighlighted && <span className="text-primary">★</span>}
                      {entity.entity}
                    </CardTitle>
                    <div className="text-sm text-slate-500">
                      {spendPercent.toFixed(1)}% of total spend
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Base Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-bold text-primary">{formatCurrency(entity.spend)}</div>
                      <div className="text-xs text-slate-500">Spend</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-bold text-slate-900">{formatNumber(entity.leads)}</div>
                      <div className="text-xs text-slate-500">Leads</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-bold text-slate-900">{formatNumber(entity.quotes)}</div>
                      <div className="text-xs text-slate-500">Quotes</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-xl font-bold text-teal-600">{formatNumber(entity.sales)}</div>
                      <div className="text-xs text-slate-500">Sales</div>
                    </div>
                  </div>
                  
                  {/* Derived Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {displayMetrics.slice(0, 5).map(metricId => {
                      const def = METRIC_DEFINITIONS[metricId];
                      const value = (entity as Record<string, unknown>)[metricId] as number;
                      
                      if (value === undefined || value === null) return null;
                      
                      return (
                        <div key={metricId} className="text-center p-3 border rounded-lg">
                          <div className={cn(
                            'text-lg font-bold',
                            def?.format === 'currency' ? 'text-primary' : 'text-teal-600'
                          )}>
                            {formatMetricValue(value, def?.format || 'number')}
                          </div>
                          <div className="text-xs text-slate-500">
                            {def?.shortLabel || def?.label || metricId}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Comparison Charts */}
      {displayMetrics.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Metric Comparisons</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayMetrics.slice(0, 4).map(metricId => {
              const def = METRIC_DEFINITIONS[metricId];
              const chartData = getChartData(metricId);
              
              if (chartData.length === 0) return null;
              
              return (
                <HorizontalBarChart
                  key={metricId}
                  title={def?.label || metricId}
                  subtitle="By Campaign"
                  data={chartData}
                  valueSuffix={def?.format === 'percentage' ? '%' : ''}
                  valuePrefix={def?.format === 'currency' ? '$' : ''}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Line - prioritize CPA if available, fall back to close rate */}
      {highlighted && (
        <BottomLineCallout
          message={
            highlighted.cpa > 0
              ? `<span class="font-semibold">${highlighted.entity}</span> achieved a <span class="font-bold text-primary">${formatCurrency(highlighted.cpa)} cost per acquisition</span> with ${formatNumber(highlighted.sales)} total sales.`
              : `<span class="font-semibold">${highlighted.entity}</span> generated <span class="font-bold text-teal-600">${formatNumber(highlighted.sales)} sales</span> with a ${highlighted.closeRate.toFixed(1)}% close rate.`
          }
          highlightValue={highlighted.cpa > 0 ? highlighted.cpa : highlighted.closeRate}
          highlightLabel={highlighted.cpa > 0 ? 'CPA' : 'Close Rate'}
          format={highlighted.cpa > 0 ? 'currency' : 'percentage'}
        />
      )}
    </div>
  );
}
