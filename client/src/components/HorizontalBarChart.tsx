import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  isPrimary?: boolean;
  subLabel?: string;
  formattedValue?: string;
  color?: string; // Optional custom color
}

interface HorizontalBarChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  colorScheme?: 'alternating' | 'highlight-only'; // 'alternating' cycles colors, 'highlight-only' uses gray for non-primary
}

// GOAL brand colors for bars
const BAR_COLORS = [
  'bg-[#1E88E5]', // GOAL Blue
  'bg-[#0D9488]', // Teal/Green accent
];

export function HorizontalBarChart({ 
  title, 
  subtitle, 
  data, 
  valuePrefix = '', 
  valueSuffix = '', 
  className,
  colorScheme = 'alternating'
}: HorizontalBarChartProps) {
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));

  // Get bar color based on index and whether it's primary
  const getBarColor = (index: number, isPrimary?: boolean) => {
    if (colorScheme === 'highlight-only') {
      return isPrimary ? BAR_COLORS[0] : 'bg-slate-300';
    }
    // Alternating: use color palette, primary always gets first color
    if (isPrimary) return BAR_COLORS[0];
    return BAR_COLORS[index % BAR_COLORS.length];
  };

  // Get text color for value based on bar color
  const getValueColor = (index: number, isPrimary?: boolean) => {
    if (isPrimary) return 'text-[#1E88E5]';
    if (colorScheme === 'alternating') {
      const colorIndex = index % BAR_COLORS.length;
      return colorIndex === 0 ? 'text-[#1E88E5]' : 'text-[#0D9488]';
    }
    return 'text-muted-foreground';
  };

  return (
    <Card className={cn("border-none shadow-sm bg-white", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-foreground">{title}</CardTitle>
          {subtitle && (
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary text-primary-foreground">
              {subtitle}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-2">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const isPrimary = item.isPrimary;
          const barColor = item.color || getBarColor(index, isPrimary);
          const valueColor = getValueColor(index, isPrimary);
          
          return (
            <div key={index} className="space-y-1.5">
              {/* Label Row */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  {isPrimary && <span className="text-xs text-foreground">★</span>}
                  <span className={cn(
                    "font-medium", 
                    isPrimary ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                  {item.subLabel && (
                    <span className="text-muted-foreground text-xs">({item.subLabel})</span>
                  )}
                </div>
                <span className={cn("font-bold tabular-nums", valueColor)}>
                  {item.formattedValue || `${valuePrefix}${item.value.toLocaleString()}${valueSuffix}`}
                </span>
              </div>
              
              {/* Bar Row */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    barColor
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
