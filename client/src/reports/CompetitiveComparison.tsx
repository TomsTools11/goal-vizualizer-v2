/**
 * Competitive Comparison Report Layout
 * Header + multiplier banner + per-metric competitor bars + bottom line
 */

import React, { useMemo } from 'react';
import type { EntityMetrics, MetricId, ReportConfig } from '@/types';
import { SummaryBanner, calculateMultipliers } from '@/components/SummaryBanner';
import { HorizontalBarChart } from '@/components/HorizontalBarChart';
import { BottomLineCallout } from '@/components/BottomLineCallout';
import { METRIC_DEFINITIONS } from '@/constants/metricDefinitions';
import { formatMetricValue, formatMultiplier } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface CompetitiveComparisonProps {
  config: ReportConfig;
  global: EntityMetrics;
  entities: EntityMetrics[];
}

export function CompetitiveComparison({ config, global, entities }: CompetitiveComparisonProps) {
  const { focusMetrics, highlightEntity } = config;
  
  // Find highlighted entity
  const highlighted = highlightEntity 
    ? entities.find(e => e.entity === highlightEntity)
    : entities[0]; // Default to first entity if none specified
    
  const highlightName = highlighted?.entity || 'Your Performance';
  
  // Calculate average of other entities (competitors)
  const competitors = entities.filter(e => e.entity !== highlightName);
  
  const competitorAverage = useMemo(() => {
    if (competitors.length === 0) return null;
    
    const avgMetrics: Partial<Record<MetricId, number>> = {};
    focusMetrics.forEach(metricId => {
      const values = competitors
        .map(c => (c as Record<string, unknown>)[metricId] as number)
        .filter(v => v !== undefined && v !== null && !isNaN(v));
      
      if (values.length > 0) {
        avgMetrics[metricId] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });
    
    return avgMetrics;
  }, [competitors, focusMetrics]);

  // Calculate multipliers for summary banner
  const multiplierItems = useMemo(() => {
    if (!highlighted || !competitorAverage) return [];
    
    const highlightMetrics = focusMetrics.map(metricId => ({
      metricId,
      value: (highlighted as Record<string, unknown>)[metricId] as number,
    })).filter(m => m.value !== undefined);
    
    const avgMetrics = focusMetrics.map(metricId => ({
      metricId,
      value: competitorAverage[metricId] || 0,
    }));
    
    return calculateMultipliers(highlightMetrics, avgMetrics);
  }, [highlighted, competitorAverage, focusMetrics]);

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
      isPrimary: entity.entity === highlightName,
      formattedValue: formatMetricValue(
        (entity as Record<string, unknown>)[metricId] as number,
        def?.format || 'number'
      ),
    }));
  };

  // Filter metrics that have values
  const displayMetrics = focusMetrics.filter(metricId => {
    return entities.some(e => {
      const val = (e as Record<string, unknown>)[metricId];
      return val !== undefined && val !== null;
    });
  });

  // Calculate best "bottom line" stat - prioritize CPA if available
  const cpaMultiplier = multiplierItems.find(item => item.metricId === 'cpa');
  const bestMultiplier = cpaMultiplier 
    || (multiplierItems.length > 0 
        ? multiplierItems.reduce((best, item) => item.multiplier > best.multiplier ? item : best)
        : null);
    
  const bottomLineDef = bestMultiplier ? METRIC_DEFINITIONS[bestMultiplier.metricId] : null;

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
          🏆 Competitive Comparison
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Outperforming the Competition
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Comparing <span className="font-semibold text-primary">★ {highlightName}</span> vs.{' '}
          {competitors.length > 0 
            ? competitors.map(c => c.entity).join(', ')
            : 'industry average'
          }
        </p>
      </div>

      {/* Multiplier Summary Banner */}
      {multiplierItems.length > 0 && (
        <SummaryBanner 
          items={multiplierItems.slice(0, 4)} 
          highlightEntity={highlightName}
        />
      )}

      {/* Per-Metric Comparison Charts */}
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

      {/* Bottom Line Summary */}
      {bestMultiplier && bottomLineDef && highlighted && (
        <BottomLineCallout
          message={`<span class="font-semibold">${highlightName}</span> delivers <span class="font-bold text-teal-600">${formatMultiplier(bestMultiplier.multiplier)} better ${bottomLineDef.label.toLowerCase()}</span> than the competition.`}
          highlightValue={(highlighted as Record<string, unknown>)[bestMultiplier.metricId] as number}
          highlightLabel={bottomLineDef.shortLabel || bottomLineDef.label}
          format={bottomLineDef.format}
        />
      )}
    </div>
  );
}
