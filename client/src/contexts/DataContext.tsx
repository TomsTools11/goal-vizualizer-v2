import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { RawRow, ColumnMapping } from '@/types';

// Re-export for backwards compatibility
export type DataRow = RawRow;

export interface DataContextType {
  data: RawRow[];
  setData: (data: RawRow[]) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  headers: string[];
  setHeaders: (headers: string[]) => void;
  mapping: Partial<ColumnMapping>;
  setMapping: (mapping: Partial<ColumnMapping>) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<RawRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Partial<ColumnMapping>>({});

  const resetData = () => {
    setData([]);
    setFileName(null);
    setHeaders([]);
    setMapping({});
  };

  return (
    <DataContext.Provider value={{ 
      data, 
      setData, 
      fileName, 
      setFileName, 
      headers, 
      setHeaders, 
      mapping, 
      setMapping, 
      resetData 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
