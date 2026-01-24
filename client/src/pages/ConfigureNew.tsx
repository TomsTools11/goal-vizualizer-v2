import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import type { MetricId, ReportConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, ArrowRight, Lightbulb, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { METRIC_DEFINITIONS, canCalculateMetric } from '@/constants/metricDefinitions';
import { autoDetectColumns } from '@/utils/columnMapping';
import { normalizeData } from '@/utils/normalizeData';
import { calculateAllMetrics } from '@/utils/calculateMetrics';

// Comparison context options
type ComparisonContext = 'single' | 'multi' | 'competitive';

const COMPARISON_CONTEXTS: Array<{
  id: ComparisonContext;
  title: string;
  description: string;
}> = [
  {
    id: 'single',
    title: 'Single Campaign',
    description: 'Deep dive into one source. Good for monthly reports.',
  },
  {
    id: 'multi',
    title: 'Multi-Campaign Comparison',
    description: 'Compare multiple lead sources or campaigns side-by-side.',
  },
  {
    id: 'competitive',
    title: 'Competitive Analysis',
    description: 'Benchmark GOAL performance against other vendors.',
  },
];

// Base metrics (totals from the data)
const BASE_METRICS = [
  { id: 'spend', label: 'Total Spend' },
  { id: 'leads', label: 'Total Leads' },
  { id: 'quotes', label: 'Total Quotes' },
  { id: 'sales', label: 'Total Sales' },
] as const;

// Derived metrics (calculated from base)
const DERIVED_METRICS: Array<{ id: MetricId; label: string }> = [
  { id: 'cpl', label: 'Cost Per Lead' },
  { id: 'cpq', label: 'Cost Per Quote' },
  { id: 'cpa', label: 'Cost Per Policy' },
  { id: 'quoteRate', label: 'Lead → Quote Rate' },
  { id: 'quoteToClose', label: 'Quote → Sale Rate' },
  { id: 'closeRate', label: 'Lead → Sale Rate' },
];

export default function ConfigureNew() {
  const { data, headers, mapping, setMapping } = useData();
  const [, setLocation] = useLocation();

  // Auto-detect and set mapping on load
  useEffect(() => {
    if (headers.length > 0) {
      const detected = autoDetectColumns(headers);
      setMapping(detected);
    }
  }, [headers, setMapping]);

  // Redirect if no data
  useEffect(() => {
    if (data.length === 0) {
      setLocation('/');
    }
  }, [data, setLocation]);

  // State
  const [comparisonContext, setComparisonContext] = useState<ComparisonContext>('single');
  const [selectedBaseMetrics, setSelectedBaseMetrics] = useState<string[]>([]);
  const [selectedDerivedMetrics, setSelectedDerivedMetrics] = useState<MetricId[]>([]);

  // Normalize data and check what's available
  const normalizedData = useMemo(() => normalizeData(data, mapping), [data, mapping]);
  const { global, entities } = useMemo(() => calculateAllMetrics(normalizedData), [normalizedData]);
  
  const entityCount = entities.length;
  const hasMultipleEntities = entityCount > 1;

  // Determine which base metrics have data
  const availableBaseMetrics = useMemo(() => {
    return BASE_METRICS.filter(m => {
      const value = global[m.id as keyof typeof global];
      return typeof value === 'number' && value > 0;
    });
  }, [global]);

  // Determine which derived metrics can be calculated
  const availableDerivedMetrics = useMemo(() => {
    return DERIVED_METRICS.filter(m => canCalculateMetric(m.id, mapping));
  }, [mapping]);

  // Auto-select metrics based on what's available
  useEffect(() => {
    // Select all available base metrics by default
    setSelectedBaseMetrics(availableBaseMetrics.map(m => m.id));
    
    // Select common derived metrics by default
    const defaultDerived: MetricId[] = ['cpl', 'quoteRate', 'closeRate'];
    setSelectedDerivedMetrics(
      defaultDerived.filter(id => availableDerivedMetrics.some(m => m.id === id))
    );
  }, [availableBaseMetrics, availableDerivedMetrics]);

  // Toggle base metric
  const toggleBaseMetric = (id: string) => {
    setSelectedBaseMetrics(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Toggle derived metric
  const toggleDerivedMetric = (id: MetricId) => {
    setSelectedDerivedMetrics(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  // Generate tips based on missing data
  const tips = useMemo(() => {
    const result: string[] = [];
    
    if (!mapping.entity) {
      result.push('No entity/campaign column detected. Data will be shown as totals only.');
    }
    if (!mapping.spend) {
      result.push('No spend column detected. Cost metrics won\'t be available.');
    }
    if (!mapping.leads) {
      result.push('No leads column detected. Lead-based metrics won\'t be available.');
    }
    if (!mapping.quotes) {
      result.push('No quotes column detected. Quote rate metrics won\'t be available.');
    }
    if (!mapping.sales) {
      result.push('No sales/policies column detected. Close rate and CPA won\'t be available.');
    }
    
    return result;
  }, [mapping]);

  const handleGenerate = () => {
    // Map comparison context to report type
    const reportType = comparisonContext === 'single' 
      ? 'campaign-deep-dive' 
      : comparisonContext === 'competitive' 
        ? 'competitive-comparison' 
        : 'kpi-dashboard';

    const config: ReportConfig = {
      reportType,
      focusMetrics: selectedDerivedMetrics,
      comparisonMode: comparisonContext === 'single' ? 'single' : 'multi',
    };

    const params = new URLSearchParams({
      reportType: config.reportType,
      metrics: config.focusMetrics.join(','),
      comparisonMode: config.comparisonMode,
    });

    setLocation(`/dashboard?${params.toString()}`);
  };

  const canGenerate = selectedDerivedMetrics.length > 0 || selectedBaseMetrics.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
            <img src="/GOALlogo.svg" alt="GOAL" className="h-8 w-auto" />
            <span className="text-sm font-medium text-muted-foreground ml-2 border-l pl-2">
              Configure Report
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Tips Banner */}
          {tips.length > 0 && (
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Tips for better reports</p>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  {tips.map((tip, i) => (
                    <li key={i}>• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Data Summary */}
          <div className="text-sm text-muted-foreground">
            Detected <span className="font-medium text-foreground">{data.length}</span> rows 
            {entityCount > 0 && (
              <> with <span className="font-medium text-foreground">{entityCount}</span> {entityCount === 1 ? 'entity' : 'entities'}</>
            )}
          </div>

          {/* Comparison Context */}
          <section className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground">Comparison Context</h2>
            
            <RadioGroup 
              value={comparisonContext} 
              onValueChange={(val) => setComparisonContext(val as ComparisonContext)}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {COMPARISON_CONTEXTS.map((ctx) => {
                  const isSelected = comparisonContext === ctx.id;
                  const isDisabled = ctx.id !== 'single' && !hasMultipleEntities;
                  
                  return (
                    <div key={ctx.id}>
                      <RadioGroupItem 
                        value={ctx.id} 
                        id={ctx.id} 
                        className="peer sr-only" 
                        disabled={isDisabled}
                      />
                      <Label
                        htmlFor={ctx.id}
                        className={cn(
                          'flex flex-col h-full p-4 rounded-xl border-2 cursor-pointer transition-all',
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-white hover:border-slate-300',
                          isDisabled && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn(
                            'font-semibold',
                            isSelected ? 'text-primary' : 'text-foreground'
                          )}>
                            {ctx.title}
                          </span>
                          {isSelected && <Check className="w-5 h-5 text-primary" />}
                        </div>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {ctx.description}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </section>

          {/* Metrics Selection */}
          <section className="space-y-6 pt-6 border-t">
            {/* Base Metrics */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {BASE_METRICS.map((metric) => {
                  const isAvailable = availableBaseMetrics.some(m => m.id === metric.id);
                  const isSelected = selectedBaseMetrics.includes(metric.id);
                  
                  return (
                    <button
                      key={metric.id}
                      onClick={() => isAvailable && toggleBaseMetric(metric.id)}
                      disabled={!isAvailable}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        isSelected && isAvailable
                          ? 'bg-primary text-white border-primary'
                          : isAvailable
                            ? 'bg-white text-foreground border-border hover:border-slate-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      )}
                    >
                      {metric.label}
                      {isSelected && isAvailable && <Check className="w-4 h-4 ml-2 inline" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Derived Metrics */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {DERIVED_METRICS.map((metric) => {
                  const isAvailable = availableDerivedMetrics.some(m => m.id === metric.id);
                  const isSelected = selectedDerivedMetrics.includes(metric.id);
                  
                  return (
                    <button
                      key={metric.id}
                      onClick={() => isAvailable && toggleDerivedMetric(metric.id)}
                      disabled={!isAvailable}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                        isSelected && isAvailable
                          ? 'bg-primary text-white border-primary'
                          : isAvailable
                            ? 'bg-white text-foreground border-border hover:border-slate-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      )}
                    >
                      {metric.label}
                      {isSelected && isAvailable && <Check className="w-4 h-4 ml-2 inline" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')} 
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              size="lg"
              onClick={handleGenerate}
              className="gap-2 bg-primary hover:bg-primary/90"
              disabled={!canGenerate}
            >
              Generate Report
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
