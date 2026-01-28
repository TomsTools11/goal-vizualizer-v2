import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useData } from '@/contexts/DataContext';
import type { ColumnMapping } from '@/types';
import type { TransformationConfig, FieldTransformation, ValidationSummary } from '@/types/transformations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, AlertCircle, Home, Settings2 } from 'lucide-react';
import {
  autoDetectColumns,
  validateRequiredFields,
  getFieldLabel,
  getFieldDescription,
  isRequiredField,
  getMappingFieldsInOrder
} from '@/utils/columnMapping';
import { getAllSampleValues } from '@/utils/csvValidation';
import { detectFieldType, autoDetectTransformations } from '@/utils/transformations';
import { generateValidationSummary } from '@/utils/csvValidation';

import { EnhancedColumnSelect } from '@/components/EnhancedColumnSelect';
import { TransformationPopover } from '@/components/TransformationPopover';
import { ValidationSummaryCard } from '@/components/ValidationSummaryCard';
import { DataPreviewTable } from '@/components/DataPreviewTable';

export default function MapColumns() {
  const {
    data,
    headers,
    mapping,
    setMapping,
    transformConfig,
    setTransformConfig,
    validationSummary,
    setValidationSummary,
  } = useData();
  const [, setLocation] = useLocation();
  const [localMapping, setLocalMapping] = useState<Partial<ColumnMapping>>(mapping);
  const [localTransforms, setLocalTransforms] = useState<TransformationConfig>(transformConfig ?? {});

  // Redirect if no data
  useEffect(() => {
    if (data.length === 0) {
      setLocation('/');
    }
  }, [data, setLocation]);

  // Compute sample values for all columns
  const sampleValues = useMemo(() => {
    if (headers.length === 0 || data.length === 0) return {};
    return getAllSampleValues(data, headers, 5);
  }, [data, headers]);

  // Detect field types for all columns
  const detectedTypes = useMemo(() => {
    const types: Record<string, 'date' | 'number' | 'text'> = {};
    for (const header of headers) {
      const samples = sampleValues[header] || [];
      const detection = detectFieldType(samples);
      types[header] = detection.type;
    }
    return types;
  }, [headers, sampleValues]);

  // Auto-detect columns and transformations on load
  useEffect(() => {
    if (headers.length > 0 && Object.keys(localMapping).length === 0) {
      const detected = autoDetectColumns(headers);
      setLocalMapping(detected);
    }
  }, [headers]);

  // Auto-detect transformations when headers change
  useEffect(() => {
    if (headers.length > 0 && data.length > 0 && Object.keys(localTransforms).length === 0) {
      const sampleRows = data.slice(0, 10) as Record<string, unknown>[];
      const detected = autoDetectTransformations(headers, sampleRows);
      setLocalTransforms(detected);
    }
  }, [headers, data]);

  // Generate validation summary when mapping or transforms change
  const currentValidation = useMemo<ValidationSummary>(() => {
    if (data.length === 0 || Object.keys(localMapping).length === 0) {
      return {
        totalRows: data.length,
        validRows: data.length,
        invalidRows: 0,
        fieldResults: {},
      };
    }
    return generateValidationSummary(data, localMapping, localTransforms);
  }, [data, localMapping, localTransforms]);

  // Handle mapping change for a specific field
  const handleMappingChange = (field: keyof ColumnMapping, column: string) => {
    setLocalMapping((prev) => ({ ...prev, [field]: column }));
  };

  // Handle transformation change for a column
  const handleTransformChange = (column: string, config: FieldTransformation) => {
    setLocalTransforms((prev) => ({ ...prev, [column]: config }));
  };

  // Get transformation config for a mapped field
  const getTransformForField = (field: keyof ColumnMapping): FieldTransformation => {
    const column = localMapping[field];
    if (!column) return { type: 'text' };
    return localTransforms[column] ?? { type: detectedTypes[column] || 'text' };
  };

  const handleSave = () => {
    const validation = validateRequiredFields(localMapping);
    if (!validation.valid) {
      return;
    }
    setMapping(localMapping);
    setTransformConfig(localTransforms);
    setValidationSummary(currentValidation);
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
          <Button variant="ghost" size="sm" onClick={() => setLocation('/')} className="gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
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
                {fields.filter(f => isRequiredField(f)).map((field) => {
                  const column = localMapping[field];
                  const transform = getTransformForField(field);
                  const samples = column ? sampleValues[column] || [] : [];

                  return (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field} className="flex items-center gap-1">
                        {getFieldLabel(field)}
                        <span className="text-red-500">*</span>
                      </Label>
                      <p className="text-xs text-muted-foreground">{getFieldDescription(field)}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <EnhancedColumnSelect
                            id={field}
                            headers={headers}
                            value={column}
                            onChange={(val) => handleMappingChange(field, val)}
                            sampleValues={sampleValues}
                            detectedTypes={detectedTypes}
                            placeholder="Select a column..."
                          />
                        </div>
                        {column && transform.type !== 'text' && (
                          <TransformationPopover
                            fieldType={transform.type}
                            config={transform}
                            sampleValues={samples}
                            onChange={(config) => handleTransformChange(column, config)}
                          />
                        )}
                      </div>
                      {/* Field validation feedback */}
                      {column && currentValidation.fieldResults[field] && (
                        <FieldValidationFeedback
                          result={currentValidation.fieldResults[field]}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Optional fields */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  Optional Fields
                  <Badge variant="outline" className="text-xs bg-slate-50">Enable additional metrics</Badge>
                </h3>
                {fields.filter(f => !isRequiredField(f)).map((field) => {
                  const column = localMapping[field];
                  const transform = getTransformForField(field);
                  const samples = column ? sampleValues[column] || [] : [];

                  return (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={field}>{getFieldLabel(field)}</Label>
                      <p className="text-xs text-muted-foreground">{getFieldDescription(field)}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <EnhancedColumnSelect
                            id={field}
                            headers={headers}
                            value={column}
                            onChange={(val) => handleMappingChange(field, val)}
                            sampleValues={sampleValues}
                            detectedTypes={detectedTypes}
                            placeholder="Select a column (optional)..."
                          />
                        </div>
                        {column && transform.type !== 'text' && (
                          <TransformationPopover
                            fieldType={transform.type}
                            config={transform}
                            sampleValues={samples}
                            onChange={(config) => handleTransformChange(column, config)}
                          />
                        )}
                      </div>
                      {/* Field validation feedback */}
                      {column && currentValidation.fieldResults[field] && (
                        <FieldValidationFeedback
                          result={currentValidation.fieldResults[field]}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Data Preview */}
          <DataPreviewTable
            data={data}
            mapping={localMapping}
            transforms={localTransforms}
            maxRows={5}
          />

          {/* Validation Summary */}
          {Object.keys(localMapping).some(k => localMapping[k as keyof ColumnMapping]) && (
            <ValidationSummaryCard
              summary={currentValidation}
              mapping={localMapping}
            />
          )}

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

/**
 * Inline validation feedback for a field
 */
function FieldValidationFeedback({
  result,
}: {
  result: { valid: boolean; errorCount: number; warningMessage?: string };
}) {
  if (result.valid && !result.warningMessage) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-600">
        <span>Valid</span>
      </div>
    );
  }

  if (result.warningMessage) {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-600">
        <AlertCircle className="w-3 h-3" />
        <span>{result.warningMessage}</span>
      </div>
    );
  }

  return null;
}
