import React from 'react';
import { Layers, GitCompare, ArrowRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { MultiFileMode } from '@/types';

interface ModeSelectorProps {
  onContinue: () => void;
}

export function ModeSelector({ onContinue }: ModeSelectorProps) {
  const { uploadedFiles, multiFileMode, setMultiFileMode } = useData();

  // Only show when 2+ files are uploaded
  if (uploadedFiles.length < 2) return null;

  const modes: Array<{
    id: MultiFileMode;
    title: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      id: 'merge',
      title: 'Merge Files',
      description: 'Combine all rows into a single dataset. Use when files contain different time periods or campaigns.',
      icon: Layers,
    },
    {
      id: 'compare',
      title: 'Compare Files',
      description: 'Analyze files side-by-side. Use when comparing vendors, channels, or periods.',
      icon: GitCompare,
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold">How would you like to analyze these files?</h3>
        <p className="text-sm text-muted-foreground">
          Select how to process your {uploadedFiles.length} uploaded files
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = multiFileMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => setMultiFileMode(mode.id)}
              className={cn(
                "relative p-5 rounded-xl border-2 text-left transition-all duration-200",
                "hover:border-primary/50 hover:bg-accent/50",
                isSelected 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2.5 rounded-lg shrink-0 transition-colors",
                  isSelected 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold">{mode.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {mode.description}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          onClick={onContinue}
          disabled={!multiFileMode}
          className="gap-2 shadow-lg shadow-primary/20"
        >
          Continue to Map Columns
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
