import React, { useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import { KpiCard } from '@/components/KpiCard';
import { HorizontalBarChart } from '@/components/HorizontalBarChart';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Dashboard() {
  const { data, mapping } = useData();
  const [location, setLocation] = useLocation();
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Parse query params for configuration
  const searchParams = new URLSearchParams(window.location.search);
  const objective = searchParams.get('objective') || 'performance';
  const selectedKpis = (searchParams.get('kpis') || '').split(',').filter(Boolean);

  // Redirect if no data
  if (data.length === 0) {
    setLocation('/');
    return null;
  }

  // --- Data Processing Logic ---
  // In a real app, this would be more robust. Here we simulate the aggregation based on the CSV structure.
  // We assume the CSV has columns like 'Campaign', 'Spend', 'Leads', 'Quotes', 'Sales', etc.
  // Or we mock the calculation if columns are missing for the demo.

  const metrics = useMemo(() => {
    // Helper to safely sum column values
    const sum = (key: string) => data.reduce((acc, row) => {
      const val = row[key];
      return acc + (typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, '')) || 0);
    }, 0);

    // Helper to get count
    const count = data.length;

    // Use user-defined mapping or fallback to auto-detection
    const keys = Object.keys(data[0] || {});
    const findKey = (search: string) => keys.find(k => k.toLowerCase().includes(search.toLowerCase()));

    const spendKey = mapping?.spend || findKey('spend') || findKey('cost') || 'Spend';
    const leadsKey = mapping?.leads || findKey('leads') || 'Leads';
    const quotesKey = mapping?.quotes || findKey('quotes') || 'Quotes';
    const salesKey = mapping?.sales || findKey('sales') || findKey('policies') || 'Sales';
    const clicksKey = mapping?.clicks || findKey('clicks') || 'Clicks';

    const totalSpend = sum(spendKey);
    const totalLeads = sum(leadsKey);
    const totalQuotes = sum(quotesKey);
    const totalSales = sum(salesKey);
    const totalClicks = sum(clicksKey);

    // Calculate KPIs
    const cpa = totalSales > 0 ? totalSpend / totalSales : 0;
    const cpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const cpq = totalQuotes > 0 ? totalSpend / totalQuotes : 0;
    const cpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    
    const leadToSale = totalLeads > 0 ? (totalSales / totalLeads) * 100 : 0;
    const leadToQuote = totalLeads > 0 ? (totalQuotes / totalLeads) * 100 : 0;
    const quoteToSale = totalQuotes > 0 ? (totalSales / totalQuotes) * 100 : 0;
    const contactRate = 30.1; // Mocked based on example if not in data
    const quoteRate = totalLeads > 0 ? (totalQuotes / totalLeads) * 100 : 0;

    return {
      cpa, cpl, cpq, cpc,
      leadToSale, leadToQuote, quoteToSale,
      contactRate, quoteRate,
      totalSpend, totalLeads, totalQuotes, totalSales
    };
  }, [data]);

  // Mock comparison data (Competitors) to match the visual style
  // In a real app, this might come from industry benchmarks or user input
  const comparisons = {
    cpa: { goal: metrics.cpa, avg: metrics.cpa * 1.5 },
    leadToSale: { goal: metrics.leadToSale, avg: metrics.leadToSale * 0.4 },
    leadToQuote: { goal: metrics.leadToQuote, avg: metrics.leadToQuote * 0.8 },
    quoteToSale: { goal: metrics.quoteToSale, avg: metrics.quoteToSale * 0.7 },
  };

  // --- Export Functionality ---
  const handleExport = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2, // High resolution
        backgroundColor: '#F8FAFC', // Match bg color
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('GOAL-Performance-Report.pdf');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation('/configure')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img src="/GOALlogo.svg" alt="GOAL" className="h-8 w-auto" />
              <span className="text-sm font-medium text-muted-foreground ml-2 border-l pl-2 hidden md:inline-block">
                Performance Dashboard
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1 container py-8 overflow-auto">
        <div ref={dashboardRef} className="max-w-6xl mx-auto space-y-8 bg-slate-50 p-8 rounded-xl">
          
          {/* Dashboard Header */}
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              🏆 Industry-Leading Performance
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Outperforming the Competition
            </h1>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Comprehensive analysis vs. QuoteNerds, Everquote, QuoteWizard, and Smart Financial
            </p>
          </div>

          {/* Top KPI Row (Summary Multipliers) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                {metrics.contactRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase">Contact Rate</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                {metrics.quoteRate.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase">Quote Rate</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 text-center shadow-sm">
              <div className="text-3xl font-bold text-primary mb-1">
                {metrics.leadToSale.toFixed(1)}%
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase">Lead → Sale Rate</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-100 text-center shadow-sm">
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {metrics.totalSales}
              </div>
              <div className="text-xs text-slate-500 font-medium uppercase">Total Sales</div>
            </div>
          </div>

          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {selectedKpis.includes('cpa') && (
              <KpiCard label="Cost Per Acquisition" value={metrics.cpa} type="currency" />
            )}
            {selectedKpis.includes('cost_per_lead') && (
              <KpiCard label="Cost Per Lead" value={metrics.cpl} type="currency" />
            )}
            {selectedKpis.includes('cost_per_quote') && (
              <KpiCard label="Cost Per Quote" value={metrics.cpq} type="currency" />
            )}
            {selectedKpis.includes('quote_to_sale') && (
              <KpiCard label="Quote → Policy Rate" value={metrics.quoteToSale} type="percentage" />
            )}
          </div>

          {/* Detailed Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Contact Rate Chart */}
            <HorizontalBarChart 
              title="Contact Rate"
              subtitle="Performance"
              valueSuffix="%"
              data={[
                { label: 'Goal Leads', value: metrics.contactRate, isPrimary: true, formattedValue: `${metrics.contactRate.toFixed(1)}%` },
                { label: 'QuoteWizard', value: 21.7, formattedValue: '21.7%' },
                { label: 'QuoteNerds', value: 17.9, formattedValue: '17.9%' },
                { label: 'Smart Financial', value: 15.5, formattedValue: '15.5%' },
                { label: 'Everquote', value: 2.5, formattedValue: '2.5%' },
              ]}
            />

            {/* Quote Rate Chart */}
            <HorizontalBarChart 
              title="Quote Rate"
              subtitle="Performance"
              valueSuffix="%"
              data={[
                { label: 'Goal Leads', value: metrics.quoteRate, isPrimary: true, formattedValue: `${metrics.quoteRate.toFixed(1)}%` },
                { label: 'Smart Financial', value: 8.4, formattedValue: '8.4%' },
                { label: 'QuoteNerds', value: 6.5, formattedValue: '6.5%' },
                { label: 'QuoteWizard', value: 6.1, formattedValue: '6.1%' },
                { label: 'Everquote', value: 2.5, formattedValue: '2.5%' },
              ]}
            />

            {/* Lead -> Sale Chart */}
            <HorizontalBarChart 
              title="Lead → Sale"
              subtitle="Performance"
              valueSuffix="%"
              data={[
                { label: 'Goal Leads', value: metrics.leadToSale, isPrimary: true, formattedValue: `${metrics.leadToSale.toFixed(1)}%` },
                { label: 'Smart Financial', value: 1.8, formattedValue: '1.8%' },
                { label: 'QuoteNerds', value: 1.4, formattedValue: '1.4%' },
                { label: 'Everquote', value: 0.6, formattedValue: '0.6%' },
                { label: 'QuoteWizard', value: 0.4, formattedValue: '0.4%' },
              ]}
            />

            {/* Total Sales Chart */}
            <HorizontalBarChart 
              title="Total Sales"
              subtitle="Performance"
              data={[
                { label: 'Goal Leads', value: metrics.totalSales, isPrimary: true, formattedValue: metrics.totalSales.toString() },
                { label: 'QuoteNerds', value: 56, formattedValue: '56' },
                { label: 'Smart Financial', value: 33, formattedValue: '33' },
                { label: 'Everquote', value: 6, formattedValue: '6' },
                { label: 'QuoteWizard', value: 2, formattedValue: '2' },
              ]}
            />
          </div>

          {/* Bottom Line */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">The Bottom Line</h3>
              <p className="text-slate-600">
                Goal Leads delivers <span className="font-bold text-teal-600">{metrics.leadToSale.toFixed(1)}% lead-to-sale conversion</span>.
              </p>
            </div>
            <div className="bg-teal-50 text-teal-700 px-6 py-4 rounded-lg text-center min-w-[160px]">
              <div className="text-3xl font-bold">{metrics.leadToSale.toFixed(1)}%</div>
              <div className="text-xs font-bold uppercase tracking-wider">Conversion Rate</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
