import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import type { ReportType, MetricId, ReportConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, BarChart3, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { METRIC_DEFINITIONS, canCalculateMetric } from '@/constants/metricDefinitions';
import { normalizeData } from '@/utils/normalizeData';

// Report type configurations
const REPORT_TYPES: Array<{
  id: ReportType;
  title: string;
  description: string;
  icon: typeof BarChart3;
  recommendedMetrics: MetricId[];
}> = [
  {
    id: 'kpi-dashboard',
    title: 'KPI Dashboard',
    description: 'Comprehensive overview of all key performance indicators with visual comparisons',
    icon: BarChart3,
    recommendedMetrics: ['cpa', 'cpl', 'closeRate', 'quoteRate', 'quoteToClose'],
  },
  {
    id: 'competitive-comparison',
    title: 'Competitive Comparison',
    description: 'Side-by-side comparison across multiple campaigns or competitors with performance multipliers',
    icon: Users,
    recommendedMetrics: ['cpa', 'closeRate', 'quoteRate', 'quoteToClose', 'contactRate'],
  },
  {
    id: 'campaign-deep-dive',
    title: 'Campaign Deep Dive',
    description: 'Detailed analysis of individual campaign performance with time-series trends',
    icon: TrendingUp,
    recommendedMetrics: ['cpl', 'cpq', 'cpa', 'clickToLead', 'closeRate', 'roas'],
  },
];

export default function Configure_v2() {
  const { data, mapping } = useData();
  const [, setLocation] = useLocation();
  
  // Redirect if no data
  useEffect(() => {
    if (data.length === 0) {
      setLocation('/');
    }
  }, [data, setLocation]);

  // Normalize data to check available metrics
  const normalizedData = normalizeData(data, mapping);
  const entityCount = new Set(normalizedData.map(r => r.entity)).size;
  const hasMultipleEntities = entityCount > 1;
  const hasDateColumn = !!mapping.date;

  // State
  const [reportType, setReportType] = useState<ReportType>('kpi-dashboard');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricId[]>([]);
  const [highlightEntity, setHighlightEntity] = useState<string>('');
  const [comparisonMode, setComparisonMode] = useState<'single' | 'multi'>(
    hasMultipleEntities ? 'multi' : 'single'
  );

  // Get unique entities for highlight selection
  const entities = Array.from(new Set(normalizedData.map(r => r.entity))).sort();

  // Auto-select recommended metrics when report type changes
  useEffect(() => {
    const reportConfig = REPORT_TYPES.find(r => r.id === reportType);
    if (reportConfig) {
      // Filter to only metrics that can be calculated with available data
      const availableRecommended = reportConfig.recommendedMetrics.filter(m =>
        canCalculateMetric(m, mapping)
      );
      setSelectedMetrics(availableRecommended);
    }
  }, [reportType, mapping]);

  // Get available metrics (can be calculated with current mapping)
  const availableMetrics = Object.keys(METRIC_DEFINITIONS).filter(id =>
    canCalculateMetric(id as MetricId, mapping)
  ) as MetricId[];

  const toggleMetric = (metricId: MetricId) => {
    setSelectedMetrics(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleContinue = () => {
    // Build config object
    const config: ReportConfig = {
      reportType,
      focusMetrics: selectedMetrics,
      highlightEntity: highlightEntity || undefined,
      comparisonMode,
      timeGrouping: hasDateColumn ? 'none' : undefined,
    };

    // Pass config via URL params (we'll improve this with proper state management later)
    const params = new URLSearchParams({
      reportType: config.reportType,
      metrics: config.focusMetrics.join(','),
      ...(config.highlightEntity && { highlight: config.highlightEntity }),
      comparisonMode: config.comparisonMode,
    });

    setLocation(`/dashboard?${params.toString()}`);
  };

  const canContinue = selectedMetrics.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation('/')}>
            <img src="/GOALlogo.svg" alt="GOAL" className="h-8 w-auto" />
            <span className="text-sm font-medium text-muted-foreground ml-2 border-l pl-2">
              Configuration
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Configure Your Report</h1>
            <p className="text-muted-foreground">
              Select a report type and choose which metrics to highlight in your visualization
            </p>
          </div>

          {/* Report Type Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <BarChart3 className="w-5 h-5" />
              <h2>1. Select Report Type</h2>
            </div>

            <RadioGroup value={reportType} onValueChange={(val) => setReportType(val as ReportType)}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REPORT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = reportType === type.id;

                  return (
                    <div key={type.id}>
                      <RadioGroupItem value={type.id} id={type.id} className="peer sr-only" />
                      <Label
                        htmlFor={type.id}
                        className={cn(
                          'flex flex-col h-full p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent/50',
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                            : 'border-border bg-card'
                        )}
                      >
                        <Icon className={cn('w-8 h-8 mb-3', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                        <span className="font-semibold text-lg mb-2 block">{type.title}</span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{type.description}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </section>

          {/* Metric Selection */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <TrendingUp className="w-5 h-5" />
              <h2>2. Select Metrics to Display</h2>
            </div>

            {availableMetrics.length === 0 && (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Limited metrics available</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Map additional optional columns to enable more metrics (clicks, impressions, etc.)
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {availableMetrics.map((metricId) => {
                const def = METRIC_DEFINITIONS[metricId];
                const isSelected = selectedMetrics.includes(metricId);

                return (
                  <div
                    key={metricId}
                    onClick={() => toggleMetric(metricId)}
                    className={cn(
                      'relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all duration-200 select-none',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/30 hover:bg-accent/30'
                    )}
                  >
                    <Checkbox checked={isSelected} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium text-sm mb-1', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                        {def.label}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{def.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {def.category}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Additional Options */}
          {hasMultipleEntities && (
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Additional Options</h3>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Highlight Entity (★)</CardTitle>
                  <CardDescription>Feature a specific campaign or source in your report</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={highlightEntity || '__none__'} 
                    onValueChange={(val) => setHighlightEntity(val === '__none__' ? '' : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No highlight (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No highlight</SelectItem>
                      {entities.map((entity) => (
                        <SelectItem key={entity} value={entity}>
                          {entity}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Button variant="ghost" onClick={() => setLocation('/map-columns')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Column Mapping
            </Button>
            <Button
              size="lg"
              onClick={handleContinue}
              className="gap-2 shadow-lg shadow-primary/20"
              disabled={!canContinue}
            >
              Generate Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
