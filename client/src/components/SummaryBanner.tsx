import React from 'react';
import { cn } from '@/lib/utils';
import { formatMultiplier } from '@/utils/formatters';
import { METRIC_DEFINITIONS } from '@/constants/metricDefinitions';
import type { MetricId } from '@/types';

interface SummaryItem {
  metricId: MetricId;
  multiplier: number; // e.g., 2.1 means "2.1x better"
  label?: string; // Optional override label
}

interface SummaryBannerProps {
  items: SummaryItem[];
  highlightEntity?: string;
  className?: string;
}

export function SummaryBanner({ items, highlightEntity, className }: SummaryBannerProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('grid gap-4', className)} style={{ 
      gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` 
    }}>
      {items.map((item, index) => {
        const def = METRIC_DEFINITIONS[item.metricId];
        const label = item.label || def?.shortLabel || def?.label || item.metricId;
        const isGood = item.multiplier >= 1;
        
        return (
          <div
            key={`${item.metricId}-${index}`}
            className={cn(
              'flex flex-col items-center justify-center p-6 rounded-xl text-center transition-all',
              isGood
                ? 'bg-gradient-to-br from-teal-50 to-white border border-teal-100'
                : 'bg-gradient-to-br from-slate-50 to-white border border-slate-200'
            )}
          >
            <div className={cn(
              'text-3xl md:text-4xl font-bold mb-1',
              isGood ? 'text-teal-600' : 'text-slate-600'
            )}>
              {formatMultiplier(item.multiplier)}
            </div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              {label}
            </div>
            {isGood && (
              <div className="text-xs text-teal-600 font-medium mt-1">
                better
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Helper to calculate multiplier comparisons for an entity vs average of others
 */
export function calculateMultipliers(
  highlightMetrics: { metricId: MetricId; value: number }[],
  comparisonAverage: { metricId: MetricId; value: number }[],
  lowerIsBetterOverrides?: Record<MetricId, boolean>
): SummaryItem[] {
  return highlightMetrics.map(highlight => {
    const comparison = comparisonAverage.find(c => c.metricId === highlight.metricId);
    if (!comparison || comparison.value === 0) {
      return { metricId: highlight.metricId, multiplier: 0 };
    }
    
    const def = METRIC_DEFINITIONS[highlight.metricId];
    const lowerIsBetter = lowerIsBetterOverrides?.[highlight.metricId] ?? def?.lowerIsBetter ?? false;
    
    let multiplier: number;
    if (lowerIsBetter) {
      // For cost metrics, lower is better, so we invert
      multiplier = comparison.value / highlight.value;
    } else {
      // For conversion/rate metrics, higher is better
      multiplier = highlight.value / comparison.value;
    }
    
    return {
      metricId: highlight.metricId,
      multiplier: isFinite(multiplier) ? multiplier : 0,
    };
  }).filter(item => item.multiplier > 0);
}
