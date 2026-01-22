import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DataPoint {
  label: string;
  value: number;
  isPrimary?: boolean;
  subLabel?: string;
  formattedValue?: string;
}

interface HorizontalBarChartProps {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  valuePrefix?: string;
  valueSuffix?: string;
  className?: string;
  highlightColor?: string; // Default is GOAL blue
}

export function HorizontalBarChart({ 
  title, 
  subtitle, 
  data, 
  valuePrefix = '', 
  valueSuffix = '', 
  className,
  highlightColor = 'bg-primary'
}: HorizontalBarChartProps) {
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));

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
                <span className={cn(
                  "font-bold tabular-nums", 
                  isPrimary ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.formattedValue || `${valuePrefix}${item.value.toLocaleString()}${valueSuffix}`}
                </span>
              </div>
              
              {/* Bar Row */}
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-1000 ease-out",
                    isPrimary ? highlightColor : "bg-slate-300"
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
