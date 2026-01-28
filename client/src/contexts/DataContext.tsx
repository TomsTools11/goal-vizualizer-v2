import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import type { RawRow, ColumnMapping, UploadedFile, MultiFileMode } from '@/types';
import type { TransformationConfig, ValidationSummary } from '@/types/transformations';

// Re-export for backwards compatibility
export type DataRow = RawRow;

// Maximum number of files allowed
export const MAX_FILES = 3;

export interface DataContextType {
  // Multi-file state (new)
  uploadedFiles: UploadedFile[];
  multiFileMode: MultiFileMode | null;
  setMultiFileMode: (mode: MultiFileMode | null) => void;
  addFile: (file: Omit<UploadedFile, 'id'>) => void;
  removeFile: (fileId: string) => void;
  updateFileMapping: (fileId: string, mapping: Partial<ColumnMapping>) => void;

  // Transformation management
  updateFileTransformConfig: (fileId: string, config: TransformationConfig) => void;
  updateFileValidation: (fileId: string, summary: ValidationSummary) => void;

  // Legacy single-file interface (computed for backward compatibility)
  data: RawRow[];
  setData: (data: RawRow[]) => void;
  fileName: string | null;
  setFileName: (name: string | null) => void;
  headers: string[];
  setHeaders: (headers: string[]) => void;
  mapping: Partial<ColumnMapping>;
  setMapping: (mapping: Partial<ColumnMapping>) => void;
  transformConfig: TransformationConfig | undefined;
  setTransformConfig: (config: TransformationConfig) => void;
  validationSummary: ValidationSummary | undefined;
  setValidationSummary: (summary: ValidationSummary) => void;

  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate unique file ID
function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function DataProvider({ children }: { children: ReactNode }) {
  // Multi-file state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [multiFileMode, setMultiFileMode] = useState<MultiFileMode | null>(null);

  // Add a new file to the upload list
  const addFile = useCallback((file: Omit<UploadedFile, 'id'>) => {
    setUploadedFiles(prev => {
      if (prev.length >= MAX_FILES) {
        console.warn(`Maximum of ${MAX_FILES} files allowed`);
        return prev;
      }
      return [...prev, { ...file, id: generateFileId() }];
    });
  }, []);

  // Remove a file by ID
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  // Update mapping for a specific file
  const updateFileMapping = useCallback((fileId: string, mapping: Partial<ColumnMapping>) => {
    setUploadedFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, mapping } : f
    ));
  }, []);

  // Update transformation config for a specific file
  const updateFileTransformConfig = useCallback((fileId: string, config: TransformationConfig) => {
    setUploadedFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, transformConfig: config } : f
    ));
  }, []);

  // Update validation summary for a specific file
  const updateFileValidation = useCallback((fileId: string, summary: ValidationSummary) => {
    setUploadedFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, validationSummary: summary } : f
    ));
  }, []);

  // Computed values for backward compatibility
  // In merge mode: concatenate all data; in compare mode or single file: use first file
  const data = useMemo(() => {
    if (uploadedFiles.length === 0) return [];
    if (multiFileMode === 'merge') {
      return uploadedFiles.flatMap(f => f.data);
    }
    return uploadedFiles[0]?.data ?? [];
  }, [uploadedFiles, multiFileMode]);

  const fileName = useMemo(() => {
    if (uploadedFiles.length === 0) return null;
    if (uploadedFiles.length === 1) return uploadedFiles[0].fileName;
    return `${uploadedFiles.length} files`;
  }, [uploadedFiles]);

  const headers = useMemo(() => {
    if (uploadedFiles.length === 0) return [];
    if (multiFileMode === 'merge') {
      // Union of all headers
      const allHeaders = new Set<string>();
      uploadedFiles.forEach(f => f.headers.forEach(h => allHeaders.add(h)));
      return Array.from(allHeaders);
    }
    return uploadedFiles[0]?.headers ?? [];
  }, [uploadedFiles, multiFileMode]);

  const mapping = useMemo(() => {
    if (uploadedFiles.length === 0) return {};
    return uploadedFiles[0]?.mapping ?? {};
  }, [uploadedFiles]);

  const transformConfig = useMemo(() => {
    if (uploadedFiles.length === 0) return undefined;
    return uploadedFiles[0]?.transformConfig;
  }, [uploadedFiles]);

  const validationSummary = useMemo(() => {
    if (uploadedFiles.length === 0) return undefined;
    return uploadedFiles[0]?.validationSummary;
  }, [uploadedFiles]);

  // Legacy setters that work with single-file mental model
  const setData = useCallback((newData: RawRow[]) => {
    if (uploadedFiles.length === 0) {
      // No files yet - this shouldn't happen in normal flow
      console.warn('setData called with no uploaded files');
      return;
    }
    // Update first file's data
    setUploadedFiles(prev => {
      if (prev.length === 0) return prev;
      return [{ ...prev[0], data: newData, rowCount: newData.length }, ...prev.slice(1)];
    });
  }, [uploadedFiles.length]);

  const setFileName = useCallback((name: string | null) => {
    if (uploadedFiles.length > 0 && name) {
      setUploadedFiles(prev => {
        if (prev.length === 0) return prev;
        return [{ ...prev[0], fileName: name }, ...prev.slice(1)];
      });
    }
  }, [uploadedFiles.length]);

  const setHeaders = useCallback((newHeaders: string[]) => {
    if (uploadedFiles.length > 0) {
      setUploadedFiles(prev => {
        if (prev.length === 0) return prev;
        return [{ ...prev[0], headers: newHeaders }, ...prev.slice(1)];
      });
    }
  }, [uploadedFiles.length]);

  const setMapping = useCallback((newMapping: Partial<ColumnMapping>) => {
    if (uploadedFiles.length > 0) {
      updateFileMapping(uploadedFiles[0].id, newMapping);
    }
  }, [uploadedFiles, updateFileMapping]);

  const setTransformConfig = useCallback((config: TransformationConfig) => {
    if (uploadedFiles.length > 0) {
      updateFileTransformConfig(uploadedFiles[0].id, config);
    }
  }, [uploadedFiles, updateFileTransformConfig]);

  const setValidationSummary = useCallback((summary: ValidationSummary) => {
    if (uploadedFiles.length > 0) {
      updateFileValidation(uploadedFiles[0].id, summary);
    }
  }, [uploadedFiles, updateFileValidation]);

  const resetData = useCallback(() => {
    setUploadedFiles([]);
    setMultiFileMode(null);
  }, []);

  const value = useMemo(() => ({
    // Multi-file API
    uploadedFiles,
    multiFileMode,
    setMultiFileMode,
    addFile,
    removeFile,
    updateFileMapping,
    updateFileTransformConfig,
    updateFileValidation,
    // Legacy API
    data,
    setData,
    fileName,
    setFileName,
    headers,
    setHeaders,
    mapping,
    setMapping,
    transformConfig,
    setTransformConfig,
    validationSummary,
    setValidationSummary,
    resetData,
  }), [
    uploadedFiles, multiFileMode, addFile, removeFile, updateFileMapping,
    updateFileTransformConfig, updateFileValidation,
    data, setData, fileName, setFileName, headers, setHeaders, mapping, setMapping,
    transformConfig, setTransformConfig, validationSummary, setValidationSummary, resetData
  ]);

  return (
    <DataContext.Provider value={value}>
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
