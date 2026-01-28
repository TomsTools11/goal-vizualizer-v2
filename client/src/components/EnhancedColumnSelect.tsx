/**
 * Enhanced column selector with sample value preview
 * Shows column name + sample values in each option with detected data type badge
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { FieldType } from '@/types/transformations';

interface EnhancedColumnSelectProps {
  headers: string[];
  value: string | undefined;
  onChange: (value: string) => void;
  sampleValues: Record<string, unknown[]>;
  detectedTypes?: Record<string, FieldType>;
  placeholder?: string;
  id?: string;
}

/**
 * Get a badge variant for the detected type
 */
function getTypeBadgeVariant(type: FieldType): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'number':
      return 'default';
    case 'date':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Get a label for the detected type
 */
function getTypeLabel(type: FieldType): string {
  switch (type) {
    case 'number':
      return '#';
    case 'date':
      return 'Date';
    default:
      return 'Abc';
  }
}

/**
 * Format sample values for display
 */
function formatSamples(samples: unknown[], maxLength: number = 40): string {
  if (!samples || samples.length === 0) return '';

  const formatted = samples
    .slice(0, 3)
    .map((s) => {
      const str = String(s ?? '');
      if (str.length > 12) {
        return str.substring(0, 10) + '...';
      }
      return str;
    })
    .join(', ');

  if (formatted.length > maxLength) {
    return formatted.substring(0, maxLength - 3) + '...';
  }

  return formatted;
}

export function EnhancedColumnSelect({
  headers,
  value,
  onChange,
  sampleValues,
  detectedTypes = {},
  placeholder = 'Select a column...',
  id,
}: EnhancedColumnSelectProps) {
  return (
    <Select
      value={value || '__none__'}
      onValueChange={(val) => onChange(val === '__none__' ? '' : val)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectItem value="__none__">-- None --</SelectItem>
        {headers.map((header) => {
          const samples = sampleValues[header] || [];
          const type = detectedTypes[header] || 'text';
          const sampleText = formatSamples(samples);

          return (
            <SelectItem key={header} value={header} className="py-2">
              <div className="flex items-center gap-2 w-full">
                <Badge
                  variant={getTypeBadgeVariant(type)}
                  className="text-[10px] px-1.5 py-0 h-4 font-normal shrink-0"
                >
                  {getTypeLabel(type)}
                </Badge>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">{header}</span>
                  {sampleText && (
                    <span className="text-xs text-muted-foreground truncate">
                      {sampleText}
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
