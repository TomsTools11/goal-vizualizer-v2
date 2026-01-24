import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMetricValue } from '@/utils/formatters';
import type { MetricDefinition, MetricId } from '@/types';
import { METRIC_DEFINITIONS } from '@/constants/metricDefinitions';

interface KpiCardProps {
  label: string;
  value: string | number;
  format?: MetricDefinition['format'];
  /** @deprecated Use `format` instead */
  type?: 'currency' | 'percentage' | 'number';
  metricId?: MetricId; // If provided, auto-derives format and label
  trend?: number; // Optional trend percentage
  lowerIsBetter?: boolean; // For cost metrics
  className?: string;
}

export function KpiCard({ 
  label, 
  value, 
  format,
  type, // deprecated fallback
  metricId,
  trend, 
  lowerIsBetter,
  className 
}: KpiCardProps) {
  // Derive format from metricId if provided
  const metricDef = metricId ? METRIC_DEFINITIONS[metricId] : undefined;
  const resolvedFormat = format ?? metricDef?.format ?? (type as MetricDefinition['format']) ?? 'number';
  const resolvedLabel = label || metricDef?.shortLabel || metricDef?.label || '';
  const isLowerBetter = lowerIsBetter ?? metricDef?.lowerIsBetter ?? false;
  
  // Format value based on resolved format
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;
    return formatMetricValue(value, resolvedFormat);
  }, [value, resolvedFormat]);

  // Determine color based on format (matching brand specs)
  // Cost metrics (currency, lower is better) -> Blue (#1E88E5)
  // Conversion rates (percentage) -> Teal (#0D9488)
  // Multipliers -> Teal
  // Numbers -> Slate
  const valueColor = React.useMemo(() => {
    if (resolvedFormat === 'currency') return 'text-primary';
    if (resolvedFormat === 'percentage') return 'text-teal-600';
    if (resolvedFormat === 'multiplier') return 'text-teal-600';
    return 'text-slate-900';
  }, [resolvedFormat]);

  return (
    <Card className={cn("border-none shadow-sm bg-white overflow-hidden", className)}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full space-y-2">
        <div className={cn("text-3xl md:text-4xl font-bold tracking-tight", valueColor)}>
          {formattedValue}
        </div>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {resolvedLabel}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full mt-1",
            // For lower-is-better metrics, negative trend is good
            (isLowerBetter ? trend < 0 : trend > 0) 
              ? "bg-green-100 text-green-700" 
              : "bg-red-100 text-red-700"
          )}>
            {trend > 0 ? '+' : ''}{trend}% vs avg
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact KPI card variant for dashboard summary rows
 */
export function KpiCardCompact({ 
  label, 
  value, 
  format = 'number',
  metricId,
  className 
}: Pick<KpiCardProps, 'label' | 'value' | 'format' | 'metricId' | 'className'>) {
  const metricDef = metricId ? METRIC_DEFINITIONS[metricId] : undefined;
  const resolvedFormat = format ?? metricDef?.format ?? 'number';
  const resolvedLabel = label || metricDef?.shortLabel || metricDef?.label || '';
  
  const formattedValue = typeof value === 'string' 
    ? value 
    : formatMetricValue(value, resolvedFormat);

  const valueColor = resolvedFormat === 'currency' 
    ? 'text-primary' 
    : resolvedFormat === 'percentage' || resolvedFormat === 'multiplier'
      ? 'text-teal-600'
      : 'text-slate-900';

  return (
    <div className={cn(
      'bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 text-center shadow-sm',
      className
    )}>
      <div className={cn('text-3xl font-bold mb-1', valueColor)}>
        {formattedValue}
      </div>
      <div className="text-xs text-slate-500 font-medium uppercase">
        {resolvedLabel}
      </div>
    </div>
  );
}
