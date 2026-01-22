import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DataRow {
  [key: string]: string | number | boolean | null;
}

export interface DataContextType {
  data: DataRow[];
  setData: (data: DataRow[]) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const resetData = () => {
    setData([]);
    setFileName(null);
  };

  return (
    <DataContext.Provider value={{ data, setData, fileName, setFileName, resetData }}>
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
