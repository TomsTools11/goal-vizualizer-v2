import React from 'react';
import { cn } from '@/lib/utils';
import { formatMetricValue } from '@/utils/formatters';
import type { MetricDefinition } from '@/types';

interface BottomLineCalloutProps {
  title?: string;
  message: string;
  highlightValue: number;
  highlightLabel: string;
  format: MetricDefinition['format'];
  className?: string;
}

export function BottomLineCallout({
  title = 'The Bottom Line',
  message,
  highlightValue,
  highlightLabel,
  format,
  className,
}: BottomLineCalloutProps) {
  const formattedValue = formatMetricValue(highlightValue, format);

  return (
    <div className={cn(
      'bg-white rounded-xl p-8 shadow-sm border border-slate-100',
      'flex flex-col md:flex-row items-center justify-between gap-6',
      className
    )}>
      <div className="space-y-2 text-center md:text-left">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-slate-600" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
      <div className="bg-teal-50 text-teal-700 px-6 py-4 rounded-lg text-center min-w-[160px] shrink-0">
        <div className="text-3xl font-bold">{formattedValue}</div>
        <div className="text-xs font-bold uppercase tracking-wider mt-1">{highlightLabel}</div>
      </div>
    </div>
  );
}

/**
 * Variant for cost metrics (where lower is better)
 */
export function BottomLineCostCallout({
  title = 'The Bottom Line',
  message,
  highlightValue,
  highlightLabel,
  className,
}: Omit<BottomLineCalloutProps, 'format'>) {
  const formattedValue = formatMetricValue(highlightValue, 'currency');

  return (
    <div className={cn(
      'bg-white rounded-xl p-8 shadow-sm border border-slate-100',
      'flex flex-col md:flex-row items-center justify-between gap-6',
      className
    )}>
      <div className="space-y-2 text-center md:text-left">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-slate-600" dangerouslySetInnerHTML={{ __html: message }} />
      </div>
      <div className="bg-primary/10 text-primary px-6 py-4 rounded-lg text-center min-w-[160px] shrink-0">
        <div className="text-3xl font-bold">{formattedValue}</div>
        <div className="text-xs font-bold uppercase tracking-wider mt-1">{highlightLabel}</div>
      </div>
    </div>
  );
}
