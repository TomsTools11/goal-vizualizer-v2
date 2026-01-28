/**
 * Popover for configuring field transformation
 * Shows format options with live preview of before/after
 */

import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings2, ArrowRight } from 'lucide-react';
import type {
  FieldType,
  FieldTransformation,
  DateFormat,
  NumberFormat,
} from '@/types/transformations';
import {
  applyTransformation,
  formatDatePreview,
  formatNumberPreview,
} from '@/utils/transformations';

interface TransformationPopoverProps {
  fieldType: FieldType;
  config: FieldTransformation;
  sampleValues: unknown[];
  onChange: (config: FieldTransformation) => void;
}

const DATE_FORMAT_OPTIONS: { value: DateFormat; label: string; example: string }[] = [
  { value: 'auto', label: 'Auto-detect', example: 'Automatically detect format' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2024' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2024-12-31' },
  { value: 'M/D/YYYY', label: 'M/D/YYYY', example: '1/5/2024' },
  { value: 'M/D/YY', label: 'M/D/YY', example: '1/5/24' },
];

const NUMBER_FORMAT_OPTIONS: { value: NumberFormat; label: string; example: string }[] = [
  { value: 'auto', label: 'Auto-detect', example: 'Automatically detect format' },
  { value: 'plain', label: 'Plain number', example: '1234.56' },
  { value: 'currency', label: 'Currency', example: '$1,234.56' },
  { value: 'percentage', label: 'Percentage', example: '12.5%' },
  { value: 'european', label: 'European', example: '1.234,56' },
];

export function TransformationPopover({
  fieldType,
  config,
  sampleValues,
  onChange,
}: TransformationPopoverProps) {
  const formatOptions = fieldType === 'date' ? DATE_FORMAT_OPTIONS : NUMBER_FORMAT_OPTIONS;
  const currentFormat = config.format || 'auto';

  // Get sample for preview
  const sampleValue = sampleValues[0] ?? '';
  const transformedValue = applyTransformation(sampleValue, config);

  const formatPreview = () => {
    if (fieldType === 'date') {
      return formatDatePreview(transformedValue as string | null);
    } else if (fieldType === 'number') {
      return formatNumberPreview(
        transformedValue as number | null,
        config.format as NumberFormat
      );
    }
    return String(transformedValue ?? '');
  };

  // Only show for date and number types
  if (fieldType === 'text') {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
        >
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Configure transformation</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">
              {fieldType === 'date' ? 'Date Format' : 'Number Format'}
            </h4>
            <p className="text-xs text-muted-foreground">
              Select how this column's values should be parsed
            </p>
          </div>

          <RadioGroup
            value={currentFormat}
            onValueChange={(value) => {
              onChange({
                ...config,
                format: value as DateFormat | NumberFormat,
              });
            }}
            className="space-y-2"
          >
            {formatOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`format-${option.value}`} />
                <Label
                  htmlFor={`format-${option.value}`}
                  className="flex flex-col cursor-pointer"
                >
                  <span className="text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.example}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Live preview */}
          {sampleValue && (
            <div className="border-t pt-3">
              <div className="text-xs text-muted-foreground mb-2">Preview</div>
              <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-md p-2">
                <span className="text-muted-foreground truncate max-w-[100px]">
                  {String(sampleValue)}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                <span className="font-medium truncate">{formatPreview()}</span>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
