/**
 * Preview table showing transformed data
 * Shows first N rows with mapped columns and validation status
 */

import React, { useState, useMemo } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import type { RawRow, ColumnMapping } from '@/types';
import type { TransformationConfig } from '@/types/transformations';
import { getPreviewData } from '@/utils/csvValidation';
import { getFieldLabel, getMappingFieldsInOrder } from '@/utils/columnMapping';
import { formatDatePreview, formatNumberPreview } from '@/utils/transformations';

interface DataPreviewTableProps {
  data: RawRow[];
  mapping: Partial<ColumnMapping>;
  transforms?: TransformationConfig;
  maxRows?: number;
}

export function DataPreviewTable({
  data,
  mapping,
  transforms,
  maxRows = 5,
}: DataPreviewTableProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get mapped fields in order
  const mappedFields = useMemo(() => {
    const allFields = getMappingFieldsInOrder();
    return allFields.filter((f) => mapping[f] && mapping[f]!.trim() !== '');
  }, [mapping]);

  // Get preview data with transformations
  const previewData = useMemo(() => {
    if (!isOpen) return []; // Only compute when opened
    return getPreviewData(data, mapping, transforms, maxRows);
  }, [data, mapping, transforms, maxRows, isOpen]);

  // Format a value for display based on the field
  const formatValue = (field: keyof ColumnMapping, value: unknown): string => {
    if (value === null || value === undefined) return '—';

    const column = mapping[field];
    if (!column) return String(value);

    const transform = transforms?.[column];

    if (transform?.type === 'date') {
      return formatDatePreview(value as string | Date | null);
    }

    if (transform?.type === 'number') {
      const numVal = typeof value === 'number' ? value : parseFloat(String(value));
      if (isNaN(numVal)) return '—';

      // Format based on field type
      if (field === 'spend' || field === 'premium' || field === 'quoteCpa' || field === 'policyCpa') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(numVal);
      }

      return new Intl.NumberFormat('en-US').format(numVal);
    }

    return String(value);
  };

  if (mappedFields.length === 0) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between px-4 py-3 h-auto"
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">Preview Data</span>
            <Badge variant="secondary" className="ml-2">
              {Math.min(data.length, maxRows)} of {data.length} rows
            </Badge>
          </div>

          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10 text-center">#</TableHead>
                  <TableHead className="w-16 text-center">Status</TableHead>
                  {mappedFields.map((field) => (
                    <TableHead key={field} className="min-w-[120px]">
                      <div className="flex flex-col">
                        <span className="font-medium">{getFieldLabel(field)}</span>
                        <span className="text-xs text-muted-foreground font-normal truncate">
                          {mapping[field]}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={index} className={!row.validation.valid ? 'bg-red-50/50' : ''}>
                    <TableCell className="text-center text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-center">
                      {row.validation.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mx-auto" />
                      )}
                    </TableCell>
                    {mappedFields.map((field) => (
                      <TableCell key={field} className="max-w-[200px] truncate">
                        {formatValue(field, row.transformed[field])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {data.length > maxRows && (
            <div className="px-4 py-2 bg-muted/30 border-t text-center">
              <span className="text-xs text-muted-foreground">
                Showing {maxRows} of {data.length} rows
              </span>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
