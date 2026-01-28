import React from 'react';
import { CsvUploader } from '@/components/CsvUploader';
import { FileUploadList } from '@/components/FileUploadList';
import { ModeSelector } from '@/components/ModeSelector';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Home() {
  const { uploadedFiles, multiFileMode, setMultiFileMode } = useData();
  const [, setLocation] = useLocation();

  const handleContinue = () => {
    // Single file: auto-set mode to merge (behaves like single dataset)
    if (uploadedFiles.length === 1 && !multiFileMode) {
      setMultiFileMode('merge');
    }
    setLocation('/map-columns');
  };

  // Calculate total rows across all files
  const totalRows = uploadedFiles.reduce((sum, f) => sum + f.rowCount, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/GOALlogo.svg" alt="GOAL" className="h-8 w-auto" />
            <span className="text-sm font-medium text-muted-foreground ml-2 border-l pl-2">
              Data Visualizer
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              <span className="text-primary">GOAL</span> Data Visualizer
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your client CSV data to generate professional, on-brand visualizations instantly.
            </p>
          </div>

          {/* Upload Section */}
          <div className="space-y-6">
            <CsvUploader />
            <FileUploadList />
            
            {/* Mode selector for multiple files */}
            {uploadedFiles.length >= 2 && (
              <ModeSelector onContinue={handleContinue} />
            )}

            {/* Single file: show continue button */}
            {uploadedFiles.length === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-card border rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm max-w-2xl mx-auto">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Data Ready</h3>
                      <p className="text-muted-foreground">
                        {totalRows.toLocaleString()} rows loaded
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="lg"
                    onClick={handleContinue}
                    className="w-full md:w-auto gap-2 shadow-lg shadow-primary/20"
                  >
                    Map Columns
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GOAL. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
