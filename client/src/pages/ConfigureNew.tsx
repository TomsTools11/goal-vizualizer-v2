import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import type { MetricId, ReportConfig, ColumnMapping } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, ArrowRight, Lightbulb, Check, FileSpreadsheet, Copy, Home } from 'lucide-react';
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
  const { 
    data, 
    headers, 
    mapping, 
    setMapping,
    uploadedFiles,
    multiFileMode,
    updateFileMapping 
  } = useData();
  const [, setLocation] = useLocation();
  const [activeFileTab, setActiveFileTab] = useState<string>(uploadedFiles[0]?.id ?? '');

  // Auto-detect and set mapping on load (for merge mode or single file)
  useEffect(() => {
    if (multiFileMode === 'merge' || uploadedFiles.length === 1) {
      if (headers.length > 0 && Object.keys(mapping).length === 0) {
        const detected = autoDetectColumns(headers);
        setMapping(detected);
      }
    }
  }, [headers, mapping, setMapping, multiFileMode, uploadedFiles.length]);

  // Redirect if no data
  useEffect(() => {
    if (uploadedFiles.length === 0) {
      setLocation('/');
    }
  }, [uploadedFiles.length, setLocation]);
  
  // Set initial active tab
  useEffect(() => {
    if (uploadedFiles.length > 0 && !activeFileTab) {
      setActiveFileTab(uploadedFiles[0].id);
    }
  }, [uploadedFiles, activeFileTab]);

  const isCompareMode = multiFileMode === 'compare' && uploadedFiles.length > 1;

  // State
  const [comparisonContext, setComparisonContext] = useState<ComparisonContext>('single');
  const [selectedBaseMetrics, setSelectedBaseMetrics] = useState<string[]>([]);
  const [selectedDerivedMetrics, setSelectedDerivedMetrics] = useState<MetricId[]>([]);

  // Get the effective mapping for calculations (uses first file's mapping in compare mode)
  const effectiveMapping = useMemo(() => {
    if (isCompareMode && uploadedFiles.length > 0) {
      return uploadedFiles[0].mapping;
    }
    return mapping;
  }, [isCompareMode, uploadedFiles, mapping]);

  // Normalize data and check what's available
  const normalizedData = useMemo(() => normalizeData(data, effectiveMapping), [data, effectiveMapping]);
  const { global, entities } = useMemo(() => calculateAllMetrics(normalizedData), [normalizedData]);
  
  const entityCount = entities.length;
  const hasMultipleEntities = entityCount > 1;
  
  // Apply mapping from one file to all files (compare mode)
  const applyMappingToAll = (sourceFileId: string) => {
    const sourceFile = uploadedFiles.find(f => f.id === sourceFileId);
    if (!sourceFile) return;
    
    uploadedFiles.forEach(file => {
      if (file.id !== sourceFileId) {
        updateFileMapping(file.id, sourceFile.mapping);
      }
    });
  };

  // Determine which base metrics have data
  const availableBaseMetrics = useMemo(() => {
    return BASE_METRICS.filter(m => {
      const value = global[m.id as keyof typeof global];
      return typeof value === 'number' && value > 0;
    });
  }, [global]);

  // Determine which derived metrics can be calculated
  const availableDerivedMetrics = useMemo(() => {
    return DERIVED_METRICS.filter(m => canCalculateMetric(m.id, effectiveMapping));
  }, [effectiveMapping]);

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
    const checkMapping = effectiveMapping;
    
    if (!checkMapping.entity) {
      result.push('No entity/campaign column detected. Data will be shown as totals only.');
    }
    if (!checkMapping.spend) {
      result.push('No spend column detected. Cost metrics won\'t be available.');
    }
    if (!checkMapping.leads) {
      result.push('No leads column detected. Lead-based metrics won\'t be available.');
    }
    if (!checkMapping.quotes) {
      result.push('No quotes column detected. Quote rate metrics won\'t be available.');
    }
    if (!checkMapping.sales) {
      result.push('No sales/policies column detected. Close rate and CPA won\'t be available.');
    }
    
    return result;
  }, [effectiveMapping]);

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
      multiFileMode: multiFileMode || 'merge',
    });

    setLocation(`/dashboard?${params.toString()}`);
  };

  const canGenerate = selectedDerivedMetrics.length > 0 || selectedBaseMetrics.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/')} title="Home">
              <Home className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="/goal-logo-dark.png" alt="GOAL" className="h-8 w-auto" />
              <span className="text-sm font-medium text-muted-foreground ml-2 border-l pl-2">
                Configure Report
              </span>
            </div>
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
            {uploadedFiles.length > 1 ? (
              <>
                <span className="font-medium text-foreground">{uploadedFiles.length} files</span> 
                {' '}({multiFileMode === 'merge' ? 'merged' : 'comparing'}) with{' '}
                <span className="font-medium text-foreground">{data.length.toLocaleString()}</span> total rows
              </>
            ) : (
              <>Detected <span className="font-medium text-foreground">{data.length.toLocaleString()}</span> rows</>
            )}
            {entityCount > 0 && (
              <> with <span className="font-medium text-foreground">{entityCount}</span> {entityCount === 1 ? 'entity' : 'entities'}</>
            )}
          </div>
          
          {/* Compare Mode: File Tabs for Mapping */}
          {isCompareMode && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground">Column Mapping by File</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => applyMappingToAll(activeFileTab)}
                  className="gap-2 text-xs"
                >
                  <Copy className="w-3 h-3" />
                  Apply to All Files
                </Button>
              </div>
              
              <Tabs value={activeFileTab} onValueChange={setActiveFileTab}>
                <TabsList className="w-full justify-start">
                  {uploadedFiles.map((file, index) => (
                    <TabsTrigger key={file.id} value={file.id} className="gap-2">
                      <FileSpreadsheet className="w-3 h-3" />
                      File {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {uploadedFiles.map((file) => (
                  <TabsContent key={file.id} value={file.id} className="mt-4">
                    <div className="p-4 rounded-lg border bg-white space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm truncate" title={file.fileName}>
                          {file.fileName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {file.rowCount.toLocaleString()} rows
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {(['entity', 'spend', 'leads', 'quotes', 'sales'] as const).map((field) => (
                          <div key={field} className="flex items-center gap-2">
                            <span className="text-muted-foreground capitalize">{field}:</span>
                            <span className={cn(
                              "font-mono truncate",
                              file.mapping[field] ? "text-foreground" : "text-slate-400 italic"
                            )}>
                              {file.mapping[field] || 'not detected'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          )}

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
