/**
 * Summary of validation results
 * Shows valid/warning/error counts as badges with expandable details
 */

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { ValidationSummary, FieldValidationResult } from '@/types/transformations';
import { getFieldLabel } from '@/utils/columnMapping';
import type { ColumnMapping } from '@/types';

interface ValidationSummaryCardProps {
  summary: ValidationSummary;
  mapping: Partial<ColumnMapping>;
}

export function ValidationSummaryCard({ summary, mapping }: ValidationSummaryCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { totalRows, validRows, invalidRows, fieldResults } = summary;

  // Calculate warnings (fields with partial errors)
  const fieldsWithWarnings = Object.values(fieldResults).filter(
    (r) => r.warningMessage && r.errorCount > 0 && r.errorCount < totalRows
  );
  const warningCount = fieldsWithWarnings.length;

  // Fields with all errors
  const fieldsWithErrors = Object.values(fieldResults).filter(
    (r) => r.errorCount === totalRows && totalRows > 0
  );
  const errorFieldCount = fieldsWithErrors.length;

  // Determine overall status
  const hasErrors = invalidRows > 0 || errorFieldCount > 0;
  const hasWarnings = warningCount > 0;

  return (
    <div className="rounded-lg border bg-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50"
          >
            <div className="flex items-center gap-4">
              {/* Valid rows */}
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">{validRows.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">valid</span>
              </div>

              {/* Warnings */}
              {warningCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">{warningCount}</span>
                  <span className="text-sm text-muted-foreground">
                    {warningCount === 1 ? 'warning' : 'warnings'}
                  </span>
                </div>
              )}

              {/* Errors */}
              {invalidRows > 0 && (
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{invalidRows.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">
                    {invalidRows === 1 ? 'error' : 'errors'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs">Details</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 border-t pt-3 space-y-3">
            {Object.entries(fieldResults).map(([fieldKey, result]) => {
              const fieldLabel = getFieldLabel(fieldKey as keyof ColumnMapping);
              return (
                <FieldResultRow
                  key={fieldKey}
                  fieldLabel={fieldLabel}
                  result={result}
                  totalRows={totalRows}
                />
              );
            })}

            {Object.keys(fieldResults).length === 0 && (
              <p className="text-sm text-muted-foreground">No fields mapped yet</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface FieldResultRowProps {
  fieldLabel: string;
  result: FieldValidationResult;
  totalRows: number;
}

function FieldResultRow({ fieldLabel, result, totalRows }: FieldResultRowProps) {
  const { valid, errorCount, warningMessage, sampleValues, transformedSamples } = result;

  const hasError = errorCount > 0;
  const isFullError = errorCount === totalRows && totalRows > 0;
  const isPartialError = hasError && !isFullError;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-2 min-w-0">
        {isFullError ? (
          <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        ) : isPartialError ? (
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
        )}

        <div className="min-w-0">
          <div className="text-sm font-medium">{fieldLabel}</div>
          {warningMessage && (
            <div className="text-xs text-muted-foreground mt-0.5">{warningMessage}</div>
          )}
          {/* Sample preview */}
          {sampleValues.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1 truncate">
              Sample: {sampleValues.slice(0, 2).map(String).join(', ')}
            </div>
          )}
        </div>
      </div>

      <Badge
        variant={isFullError ? 'destructive' : isPartialError ? 'secondary' : 'outline'}
        className="shrink-0"
      >
        {isFullError
          ? 'Error'
          : isPartialError
            ? `${errorCount} issues`
            : 'OK'}
      </Badge>
    </div>
  );
}
