import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useData, ColumnMapping } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function MapColumns() {
  const { data, headers, mapping, setMapping } = useData();
  const [, setLocation] = useLocation();
  const [localMapping, setLocalMapping] = useState<ColumnMapping>(mapping);

  // Redirect if no data
  useEffect(() => {
    if (data.length === 0) {
      setLocation('/');
    }
  }, [data, setLocation]);

  // Auto-detect columns on load
  useEffect(() => {
    const newMapping = { ...mapping };
    const findKey = (search: string) => headers.find(h => h.toLowerCase().includes(search.toLowerCase())) || '';

    if (!newMapping.spend) newMapping.spend = findKey('spend') || findKey('cost');
    if (!newMapping.leads) newMapping.leads = findKey('leads');
    if (!newMapping.quotes) newMapping.quotes = findKey('quotes');
    if (!newMapping.sales) newMapping.sales = findKey('sales') || findKey('policies');
    if (!newMapping.clicks) newMapping.clicks = findKey('clicks');

    setLocalMapping(newMapping);
  }, [headers]);

  const handleSave = () => {
    setMapping(localMapping);
    setLocation('/configure');
  };

  const fields = [
    { key: 'spend', label: 'Total Spend / Cost', required: true },
    { key: 'leads', label: 'Total Leads', required: true },
    { key: 'quotes', label: 'Total Quotes', required: true },
    { key: 'sales', label: 'Total Sales / Policies', required: true },
    { key: 'clicks', label: 'Total Clicks', required: false },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/GOALlogo.svg" alt="GOAL" className="h-8 w-auto" />
            <span className="text-sm font-medium text-muted-foreground ml-2 border-l pl-2">
              Data Visualizer
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Map Your Data</h1>
            <p className="text-slate-500">
              Match your CSV columns to the required fields below to ensure accurate reporting.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Column Mapping</CardTitle>
              <CardDescription>
                Select the corresponding column from your file for each metric.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field) => (
                <div key={field.key} className="grid gap-2">
                  <Label htmlFor={field.key} className="flex items-center gap-1">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <Select
                    value={localMapping[field.key as keyof ColumnMapping]}
                    onValueChange={(val) => setLocalMapping(prev => ({ ...prev, [field.key]: val }))}
                  >
                    <SelectTrigger id={field.key}>
                      <SelectValue placeholder="Select a column..." />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setLocation('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Button 
              onClick={handleSave} 
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!localMapping.spend || !localMapping.leads || !localMapping.quotes || !localMapping.sales}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
