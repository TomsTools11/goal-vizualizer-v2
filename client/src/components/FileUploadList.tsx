import React from 'react';
import { FileSpreadsheet, X } from 'lucide-react';
import { useData, MAX_FILES } from '@/contexts/DataContext';
import { cn } from '@/lib/utils';

export function FileUploadList() {
  const { uploadedFiles, removeFile } = useData();

  if (uploadedFiles.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Uploaded Files
        </h3>
        <span className="text-xs text-muted-foreground">
          {uploadedFiles.length}/{MAX_FILES} files
        </span>
      </div>
      
      <div className="space-y-2">
        {uploadedFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "flex items-center justify-between gap-3 p-3 rounded-lg border bg-card",
              "animate-in fade-in slide-in-from-bottom-2 duration-300"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate" title={file.fileName}>
                  {file.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {file.rowCount.toLocaleString()} rows · {file.headers.length} columns
                </p>
              </div>
            </div>
            
            <button
              onClick={() => removeFile(file.id)}
              className={cn(
                "p-1.5 rounded-md text-muted-foreground shrink-0",
                "hover:bg-destructive/10 hover:text-destructive",
                "transition-colors duration-200"
              )}
              aria-label={`Remove ${file.fileName}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
