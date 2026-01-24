/**
 * File Comparison Report Layout
 * Side-by-side comparison of metrics across multiple uploaded files
 */

import React from 'react';
import type { ReportConfig, MetricId } from '@/types';
import type { MultiFileMetricsResult } from '@/utils/calculateMetrics';
import { KpiCardCompact } from '@/components/KpiCard';
import { METRIC_DEFINITIONS } from '@/constants/metricDefinitions';
import { formatMetricValue } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import { FileSpreadsheet, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FileComparisonReportProps {
  config: ReportConfig;
  fileMetrics: MultiFileMetricsResult[];
}

// Color palette for files (consistent with brand)
const FILE_COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-600' },
  { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', accent: 'bg-teal-600' },
  { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-600' },
];

export function FileComparisonReport({ config, fileMetrics }: FileComparisonReportProps) {
  const { focusMetrics } = config;

  // Get available metrics that exist in all files
  const availableMetrics = focusMetrics.filter(metricId => {
    return fileMetrics.every(file => {
      const value = file.global[metricId as keyof typeof file.global];
      return value !== undefined && value !== null && typeof value === 'number';
    });
  });

  // Calculate comparison insights
  const getComparisonData = (metricId: MetricId) => {
    const def = METRIC_DEFINITIONS[metricId];
    const values = fileMetrics.map(file => ({
      fileName: file.fileName,
      fileId: file.fileId,
      value: file.global[metricId as keyof typeof file.global] as number,
    }));

    // Find best performer
    const sorted = [...values].sort((a, b) => {
      return def?.lowerIsBetter ? a.value - b.value : b.value - a.value;
    });
    
    const bestIndex = values.findIndex(v => v.fileId === sorted[0].fileId);
    const worstIndex = values.findIndex(v => v.fileId === sorted[sorted.length - 1].fileId);

    return { values, bestIndex, worstIndex, def };
  };

  // Get trend indicator between files (first vs second)
  const getTrendIndicator = (metricId: MetricId, fileIndex: number) => {
    if (fileIndex === 0 || fileMetrics.length < 2) return null;
    
    const def = METRIC_DEFINITIONS[metricId];
    const currentGlobal = fileMetrics[fileIndex].global;
    const previousGlobal = fileMetrics[0].global;
    const currentValue = currentGlobal[metricId as keyof typeof currentGlobal] as number;
    const previousValue = previousGlobal[metricId as keyof typeof previousGlobal] as number;
    
    if (!currentValue || !previousValue) return null;
    
    const percentChange = ((currentValue - previousValue) / previousValue) * 100;
    const isImproved = def?.lowerIsBetter ? percentChange < 0 : percentChange > 0;
    
    if (Math.abs(percentChange) < 1) {
      return { icon: Minus, label: 'Similar', color: 'text-slate-400' };
    }
    
    return {
      icon: isImproved ? TrendingUp : TrendingDown,
      label: `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`,
      color: isImproved ? 'text-green-600' : 'text-red-600',
    };
  };

  return (
    <div className="space-y-8">
      {/* Report Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider">
          📊 File Comparison
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Multi-File Analysis
        </h1>
        <p className="text-slate-500">
          Comparing {fileMetrics.length} datasets side-by-side
        </p>
      </div>

      {/* File Summary Cards */}
      <div className={cn(
        'grid gap-4',
        fileMetrics.length === 2 ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-3'
      )}>
        {fileMetrics.map((file, index) => {
          const colors = FILE_COLORS[index % FILE_COLORS.length];
          return (
            <div
              key={file.fileId}
              className={cn(
                'p-4 rounded-xl border-2 space-y-2',
                colors.bg,
                colors.border
              )}
            >
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded', colors.accent)}>
                  <FileSpreadsheet className="w-4 h-4 text-white" />
                </div>
                <span className={cn('font-semibold text-sm truncate', colors.text)} title={file.fileName}>
                  {file.fileName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Rows:</span>{' '}
                  <span className="font-medium">{file.rowCount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Entities:</span>{' '}
                  <span className="font-medium">{file.entities.length}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Metric Comparison Tables */}
      {availableMetrics.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Key Metrics Comparison</h2>
          
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-4 text-sm font-semibold text-slate-600">Metric</th>
                  {fileMetrics.map((file, index) => {
                    const colors = FILE_COLORS[index % FILE_COLORS.length];
                    return (
                      <th key={file.fileId} className="text-right p-4">
                        <div className="flex items-center justify-end gap-2">
                          <div className={cn('w-2 h-2 rounded-full', colors.accent)} />
                          <span className="text-sm font-semibold text-slate-600 truncate max-w-[120px]" title={file.fileName}>
                            {file.fileName.replace(/\.csv$/i, '')}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {availableMetrics.map((metricId, rowIndex) => {
                  const { values, bestIndex, def } = getComparisonData(metricId);
                  
                  return (
                    <tr key={metricId} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4">
                        <span className="font-medium text-slate-800">{def?.label || metricId}</span>
                      </td>
                      {values.map((v, fileIndex) => {
                        const isBest = fileIndex === bestIndex && fileMetrics.length > 1;
                        const trend = getTrendIndicator(metricId, fileIndex);
                        
                        return (
                          <td key={v.fileId} className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {trend && (
                                <span className={cn('text-xs flex items-center gap-0.5', trend.color)}>
                                  <trend.icon className="w-3 h-3" />
                                  {trend.label}
                                </span>
                              )}
                              <span className={cn(
                                'font-semibold',
                                isBest ? 'text-green-600' : 'text-slate-700'
                              )}>
                                {formatMetricValue(v.value, def?.format || 'number')}
                              </span>
                              {isBest && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                  Best
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <p>No comparable metrics found across all files.</p>
          <p className="text-sm mt-1">Ensure all files have the same column mappings.</p>
        </div>
      )}

      {/* Per-File KPI Cards */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">Detailed Breakdown by File</h2>
        
        {fileMetrics.map((file, index) => {
          const colors = FILE_COLORS[index % FILE_COLORS.length];
          const kpiMetrics = availableMetrics.slice(0, 4);
          
          return (
            <div key={file.fileId} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn('w-3 h-3 rounded-full', colors.accent)} />
                <h3 className="font-medium text-slate-700">{file.fileName}</h3>
              </div>
              
              <div className={cn(
                'grid gap-3',
                kpiMetrics.length <= 2 ? 'grid-cols-2' :
                kpiMetrics.length === 3 ? 'grid-cols-3' :
                'grid-cols-2 md:grid-cols-4'
              )}>
                {kpiMetrics.map(metricId => {
                  const def = METRIC_DEFINITIONS[metricId];
                  const value = file.global[metricId as keyof typeof file.global] as number;
                  
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
