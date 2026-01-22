import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DataRow {
  [key: string]: string | number | boolean | null;
}

export interface ColumnMapping {
  spend: string;
  leads: string;
  quotes: string;
  sales: string;
  clicks: string;
}

export interface DataContextType {
  data: DataRow[];
  setData: (data: DataRow[]) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  headers: string[];
  setHeaders: (headers: string[]) => void;
  mapping: ColumnMapping;
  setMapping: (mapping: ColumnMapping) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    spend: '',
    leads: '',
    quotes: '',
    sales: '',
    clicks: ''
  });

  const resetData = () => {
    setData([]);
    setFileName(null);
    setHeaders([]);
    setMapping({
      spend: '',
      leads: '',
      quotes: '',
      sales: '',
      clicks: ''
    });
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
