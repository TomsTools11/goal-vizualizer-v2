import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Target, BarChart2, DollarSign, Percent, MousePointerClick, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define available KPIs based on the requirements
const AVAILABLE_KPIS = [
  { id: 'cpa', label: 'Cost Per Acquisition (CPA)', category: 'cost', icon: DollarSign, default: true },
  { id: 'lead_to_sale', label: 'Lead → Sale Conversion', category: 'conversion', icon: Percent, default: true },
  { id: 'lead_to_quote', label: 'Lead → Quote Conversion', category: 'conversion', icon: Percent, default: true },
  { id: 'quote_to_sale', label: 'Quote → Sale Conversion', category: 'conversion', icon: Percent, default: true },
  { id: 'cost_per_lead', label: 'Cost Per Lead', category: 'cost', icon: DollarSign, default: false },
  { id: 'cost_per_quote', label: 'Cost Per Quote', category: 'cost', icon: DollarSign, default: false },
  { id: 'cost_per_click', label: 'Cost Per Click', category: 'cost', icon: MousePointerClick, default: false },
  { id: 'contact_rate', label: 'Contact Rate', category: 'engagement', icon: Users, default: false },
  { id: 'quote_rate', label: 'Quote Rate', category: 'engagement', icon: FileText, default: false },
];

const OBJECTIVES = [
  { 
    id: 'performance', 
    title: 'Performance Overview', 
    description: 'Highlight efficiency and ROI metrics to demonstrate value.',
    recommended: ['cpa', 'lead_to_sale', 'cost_per_lead']
  },
  { 
    id: 'conversion', 
    title: 'Funnel Analysis', 
    description: 'Focus on conversion rates at each stage of the sales funnel.',
    recommended: ['lead_to_quote', 'quote_to_sale', 'lead_to_sale', 'contact_rate']
  },
  { 
    id: 'cost', 
    title: 'Cost Efficiency', 
    description: 'Deep dive into spending efficiency across different stages.',
    recommended: ['cpa', 'cost_per_lead', 'cost_per_quote', 'cost_per_click']
  }
];

export default function Configure() {
  const { data } = useData();
  const [, setLocation] = useLocation();
  const [objective, setObjective] = useState<string>('performance');
  const [selectedKpis, setSelectedKpis] = useState<string[]>(
    AVAILABLE_KPIS.filter(k => k.default).map(k => k.id)
  );

  // Redirect if no data
  useEffect(() => {
    if (data.length === 0) {
      setLocation('/');
    }
  }, [data, setLocation]);

  const handleObjectiveChange = (value: string) => {
    setObjective(value);
    // Auto-select recommended KPIs for this objective
    const obj = OBJECTIVES.find(o => o.id === value);
    if (obj) {
      // Keep existing selections but ensure recommended ones are added
      // Or we could replace entirely? Let's replace to be "smart"
      setSelectedKpis(obj.recommended);
    }
  };

  const toggleKpi = (kpiId: string) => {
    setSelectedKpis(prev => 
      prev.includes(kpiId) 
        ? prev.filter(id => id !== kpiId)
        : [...prev, kpiId]
    );
  };

  const handleContinue = () => {
    // Save configuration to context (we'll need to add this to context later)
    // For now, pass via URL or just assume defaults in the dashboard
    // Ideally, we update the context to store these preferences
    // Let's navigate to dashboard with query params or just use local state if we were in a single page
    // Since we have a context, let's update it. But wait, I didn't add config to context yet.
    // I'll update the context in the next step. For now, let's just navigate.
    // Actually, passing state via navigation state is tricky in wouter.
    // I should update the context first.
    
    // For this step, I'll just navigate to dashboard. 
    // I will need to update the DataContext to hold these settings.
    setLocation(`/dashboard?objective=${objective}&kpis=${selectedKpis.join(',')}`);
  };

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
        <div className="max-w-4xl mx-auto space-y-10">
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Define Your Report</h1>
            <p className="text-muted-foreground">
              Select your reporting objective and customize the key metrics you want to highlight.
            </p>
          </div>

          {/* Objective Selection */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Target className="w-5 h-5" />
              <h2>1. Select Objective</h2>
            </div>
            
            <RadioGroup value={objective} onValueChange={handleObjectiveChange} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {OBJECTIVES.map((obj) => (
                <div key={obj.id}>
                  <RadioGroupItem value={obj.id} id={obj.id} className="peer sr-only" />
                  <Label
                    htmlFor={obj.id}
                    className={cn(
                      "flex flex-col h-full p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-accent/50",
                      objective === obj.id 
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10" 
                        : "border-border bg-card"
                    )}
                  >
                    <span className="font-semibold text-lg mb-2 block">{obj.title}</span>
                    <span className="text-sm text-muted-foreground leading-relaxed">{obj.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </section>

          {/* KPI Selection */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <BarChart2 className="w-5 h-5" />
              <h2>2. Select Key Metrics (KPIs)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {AVAILABLE_KPIS.map((kpi) => {
                const Icon = kpi.icon;
                const isSelected = selectedKpis.includes(kpi.id);
                
                return (
                  <div
                    key={kpi.id}
                    onClick={() => toggleKpi(kpi.id)}
                    className={cn(
                      "relative flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-200 select-none",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border bg-card hover:border-primary/30 hover:bg-accent/30"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-full transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", isSelected ? "text-foreground" : "text-muted-foreground")}>
                        {kpi.label}
                      </p>
                    </div>
                    <Checkbox 
                      checked={isSelected} 
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between pt-8 border-t">
            <Button variant="ghost" onClick={() => setLocation('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </Button>
            <Button size="lg" onClick={handleContinue} className="gap-2 shadow-lg shadow-primary/20">
              Generate Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
