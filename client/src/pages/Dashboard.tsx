import React, { useMemo, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Share2, FileText, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { ReportConfig, ReportType, MetricId } from '@/types';
import { normalizeData } from '@/utils/normalizeData';
import { calculateAllMetrics } from '@/utils/calculateMetrics';
import { KPIDashboard, CompetitiveComparison, CampaignDeepDive } from '@/reports';

export default function Dashboard() {
  const { data, mapping } = useData();
  const [, setLocation] = useLocation();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Parse query params for configuration
  const config = useMemo<ReportConfig>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    
    return {
      reportType: (searchParams.get('reportType') as ReportType) || 'kpi-dashboard',
      focusMetrics: (searchParams.get('metrics') || 'closeRate,quoteRate,cpa').split(',').filter(Boolean) as MetricId[],
      highlightEntity: searchParams.get('highlight') || undefined,
      comparisonMode: (searchParams.get('comparisonMode') as 'single' | 'multi') || 'multi',
      timeGrouping: undefined,
    };
  }, []);

  // Redirect if no data
  if (data.length === 0) {
    setLocation('/');
    return null;
  }

  // --- Data Processing Pipeline ---
  // 1. Normalize raw CSV data using column mapping
  // 2. Calculate all metrics (global + per-entity)
  const { global, entities } = useMemo(() => {
    const normalizedRows = normalizeData(data, mapping);
    return calculateAllMetrics(normalizedRows);
  }, [data, mapping]);

  // --- Export Functionality ---
  const handleExportPDF = async () => {
    if (!dashboardRef.current || isExporting) return;
    
    setIsExporting(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#F8FAFC',
        useCORS: true,
        logging: false,
      });
      
      // PDF page dimensions (Letter size in pixels at 96 DPI, scaled by 2 for high-res)
      const pageWidth = 816 * 2;  // 8.5 inches * 96 DPI * 2
      const pageHeight = 1056 * 2; // 11 inches * 96 DPI * 2
      const margin = 40 * 2; // 40px margin scaled
      
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Scale canvas to fit page width
      const scale = contentWidth / canvas.width;
      const scaledHeight = canvas.height * scale;
      
      // Calculate number of pages needed
      const totalPages = Math.ceil(scaledHeight / contentHeight);
      
      // Create PDF (Letter size)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [pageWidth / 2, pageHeight / 2], // Divide by 2 for actual size
      });
      
      // For each page, slice the canvas and add to PDF
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate the portion of canvas to capture for this page
        const sourceY = (page * contentHeight) / scale;
        const sourceHeight = Math.min(contentHeight / scale, canvas.height - sourceY);
        
        // Create a temporary canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            canvas,
            0, sourceY,           // Source x, y
            canvas.width, sourceHeight,  // Source width, height
            0, 0,                 // Dest x, y
            canvas.width, sourceHeight   // Dest width, height
          );
        }
        
        const pageImgData = pageCanvas.toDataURL('image/png');
        const destHeight = sourceHeight * scale / 2; // Divide by 2 for actual PDF size
        
        pdf.addImage(
          pageImgData, 
          'PNG', 
          margin / 2,  // x position (divide by 2 for actual size)
          margin / 2,  // y position
          contentWidth / 2,  // width
          destHeight   // height
        );
      }
      
      // Generate filename based on report type
      const reportTypeName = {
        'kpi-dashboard': 'KPI-Dashboard',
        'competitive-comparison': 'Competitive-Comparison',
        'campaign-deep-dive': 'Campaign-Deep-Dive',
      }[config.reportType] || 'Report';
      
      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`GOAL-${reportTypeName}-${timestamp}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Get report title based on type
  const reportTitle = {
    'kpi-dashboard': 'KPI Dashboard',
    'competitive-comparison': 'Competitive Comparison',
    'campaign-deep-dive': 'Campaign Deep Dive',
  }[config.reportType] || 'Performance Report';

  // Render the appropriate report layout
  const renderReport = () => {
    const props = { config, global, entities };
    
    switch (config.reportType) {
      case 'competitive-comparison':
        return <CompetitiveComparison {...props} />;
      case 'campaign-deep-dive':
        return <CampaignDeepDive {...props} />;
      case 'kpi-dashboard':
      default:
        return <KPIDashboard {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm print:hidden">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/configure')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="/GOALlogo.svg" alt="GOAL" className="h-8 w-auto" />
              <span className="text-sm font-medium text-muted-foreground ml-2 border-l pl-2 hidden md:inline-block">
                {reportTitle}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button 
              size="sm" 
              onClick={handleExportPDF} 
              className="gap-2"
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 container py-8 overflow-auto">
        <div ref={dashboardRef} className="max-w-6xl mx-auto space-y-8 bg-slate-50 p-8 rounded-xl">
          {renderReport()}
        </div>
      </main>

      {/* Debug/Info Footer (only in development) */}
      {import.meta.env.DEV && (
        <footer className="bg-slate-100 border-t py-2 px-4 text-xs text-slate-500 print:hidden">
          <div className="container flex items-center justify-between">
            <span>
              Report: {config.reportType} | Entities: {entities.length} | Metrics: {config.focusMetrics.join(', ')}
            </span>
            {config.highlightEntity && (
              <span>Highlighting: ★ {config.highlightEntity}</span>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
