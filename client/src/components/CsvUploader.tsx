import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

interface CsvUploaderProps {
  onUploadComplete?: () => void;
}

export function CsvUploader({ onUploadComplete }: CsvUploaderProps) {
  const { setData, setFileName, setHeaders } = useData();
  const [, setLocation] = useLocation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = useCallback((file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.error('CSV Parsing Errors:', results.errors);
          setError('Error parsing CSV file. Please check the format.');
        } else {
          setData(results.data as any[]);
          setFileName(file.name);
          if (results.meta.fields) {
            setHeaders(results.meta.fields);
          }
          if (onUploadComplete) {
            onUploadComplete();
          }
          // Redirect to map columns page
          setLocation('/map-columns');
        }
        setIsProcessing(false);
      },
      error: (err) => {
        console.error('CSV Parsing Error:', err);
        setError('Failed to read the file.');
        setIsProcessing(false);
      }
    });
  }, [setData, setFileName, setHeaders, onUploadComplete, setLocation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative group cursor-pointer flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out",
          isDragging 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/50",
          error ? "border-destructive/50 bg-destructive/5" : ""
        )}
      >
        <input
          type="file"
          accept=".csv"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 text-center p-6 pointer-events-none">
          <div className={cn(
            "p-4 rounded-full transition-colors duration-300",
            isDragging ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            {isProcessing ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">
              {isProcessing ? 'Processing Data...' : 'Upload Client Data'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Drag and drop your CSV file here, or click to browse.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive mt-4 animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">CSV Format</p>
            <p className="text-muted-foreground text-xs">Standard comma-separated</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Auto-Detection</p>
            <p className="text-muted-foreground text-xs">Smart column mapping</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border bg-card/50 backdrop-blur-sm">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <Upload className="w-4 h-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Secure Processing</p>
            <p className="text-muted-foreground text-xs">Client-side only</p>
          </div>
        </div>
      </div>
    </div>
  );
}
