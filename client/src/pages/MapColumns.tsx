import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import type { ColumnMapping } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { 
  autoDetectColumns, 
  validateRequiredFields, 
  getFieldLabel, 
  getFieldDescription, 
  isRequiredField,
  getMappingFieldsInOrder 
} from '@/utils/columnMapping';

export default function MapColumns() {
  const { data, headers, mapping, setMapping } = useData();
  const [, setLocation] = useLocation();
  const [localMapping, setLocalMapping] = useState<Partial<ColumnMapping>>(mapping);

  // Redirect if no data
  useEffect(() => {
    if (data.length === 0) {
      setLocation('/');
    }
  }, [data, setLocation]);

  // Auto-detect columns on load
  useEffect(() => {
    if (headers.length > 0 && Object.keys(localMapping).length === 0) {
      const detected = autoDetectColumns(headers);
      setLocalMapping(detected);
    }
  }, [headers]);

  const handleSave = () => {
    const validation = validateRequiredFields(localMapping);
    if (!validation.valid) {
      // Validation will be shown in UI
      return;
    }
    setMapping(localMapping);
    setLocation('/configure');
  };

  const fields = getMappingFieldsInOrder();
  const validation = validateRequiredFields(localMapping);
  const canContinue = validation.valid;

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
                Map your CSV columns to the required fields. Required fields are marked with *
              </CardDescription>
              {!canContinue && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-900">Missing required fields</p>
                    <p className="text-sm text-red-700 mt-1">
                      Please map: {validation.missingFields.map(f => getFieldLabel(f)).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Required fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Required Fields
                  <Badge variant="outline" className="text-xs">Must be mapped</Badge>
                </h3>
                {fields.filter(f => isRequiredField(f)).map((field) => (
                  <div key={field} className="grid gap-2">
                    <Label htmlFor={field} className="flex items-center gap-1">
                      {getFieldLabel(field)}
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">{getFieldDescription(field)}</p>
                    <Select
                      value={localMapping[field] || '__none__'}
                      onValueChange={(val) => setLocalMapping(prev => ({ ...prev, [field]: val === '__none__' ? '' : val }))}
                    >
                      <SelectTrigger id={field}>
                        <SelectValue placeholder="Select a column..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">-- None --</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              
              {/* Optional fields */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Optional Fields
                  <Badge variant="outline" className="text-xs bg-slate-50">Enable additional metrics</Badge>
                </h3>
                {fields.filter(f => !isRequiredField(f)).map((field) => (
                  <div key={field} className="grid gap-2">
                    <Label htmlFor={field}>{getFieldLabel(field)}</Label>
                    <p className="text-xs text-muted-foreground">{getFieldDescription(field)}</p>
                    <Select
                      value={localMapping[field] || '__none__'}
                      onValueChange={(val) => setLocalMapping(prev => ({ ...prev, [field]: val === '__none__' ? '' : val }))}
                    >
                      <SelectTrigger id={field}>
                        <SelectValue placeholder="Select a column (optional)..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">-- None --</SelectItem>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
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
              disabled={!canContinue}
            >
              Continue to Configuration
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
