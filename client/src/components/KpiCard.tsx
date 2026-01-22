import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  type?: 'currency' | 'percentage' | 'number';
  trend?: number; // Optional trend percentage
  className?: string;
}

export function KpiCard({ label, value, type = 'number', trend, className }: KpiCardProps) {
  // Format value based on type
  const formattedValue = React.useMemo(() => {
    if (typeof value === 'string') return value;
    
    if (type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(value);
    }
    
    if (type === 'percentage') {
      return `${value.toFixed(2)}%`;
    }
    
    return new Intl.NumberFormat('en-US').format(value);
  }, [value, type]);

  // Determine color based on type (matching brand specs)
  // Currency/Number -> Blue (#1E88E5)
  // Percentage -> Teal (#0D9488) or Blue depending on context, but specs say Teal for positive metrics
  // Let's stick to the visual example: 
  // Cost metrics are Blue
  // Conversion rates are Teal (Greenish)
  
  const valueColor = type === 'percentage' ? 'text-teal-600' : 'text-primary';

  return (
    <Card className={cn("border-none shadow-sm bg-white overflow-hidden", className)}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full space-y-2">
        <div className={cn("text-3xl md:text-4xl font-bold tracking-tight", valueColor)}>
          {formattedValue}
        </div>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </div>
        {trend !== undefined && (
          <div className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full mt-1",
            trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend > 0 ? '+' : ''}{trend}% vs avg
          </div>
        )}
      </CardContent>
    </Card>
  );
}
