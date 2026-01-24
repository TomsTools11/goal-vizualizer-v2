# Plan: Support Multiple CSV File Uploads (Up to 3 Files)

## Difficulty Assessment: **MODERATE**

Achievable in a focused session. The architecture is clean and extensible, but requires changes across multiple files.

---

## User Requirements
- Upload up to 3 CSV files
- User chooses at upload: **Merge** (combine rows) or **Compare** (analyze separately)
- Columns are mostly the same (existing auto-detection handles naming variations)

---

## Implementation Plan

### Phase 1: Types & DataContext (Foundation)

**1. Add new types** - `/client/src/types/index.ts`
```typescript
export type MultiFileMode = 'merge' | 'compare';

export interface UploadedFile {
  id: string;
  fileName: string;
  headers: string[];
  data: RawRow[];
  mapping: Partial<ColumnMapping>;
  rowCount: number;
}
```

**2. Refactor DataContext** - `/client/src/contexts/DataContext.tsx`
- Add: `uploadedFiles: UploadedFile[]`, `multiFileMode: MultiFileMode | null`
- Add: `addFile()`, `removeFile()`, `updateFileMapping()`
- Keep existing `data`, `headers`, `mapping` as computed/derived for backward compatibility
- In merge mode: `data` = concatenated rows from all files
- In compare mode: keep files separate

---

### Phase 2: Upload UI

**3. Create FileUploadList component** - `/client/src/components/FileUploadList.tsx`
- Display uploaded files as chips/cards
- Show filename, row count, remove button
- Counter: "2/3 files uploaded"

**4. Create ModeSelector component** - `/client/src/components/ModeSelector.tsx`
- Two cards: "Merge Files" vs "Compare Files"
- Only shown when 2+ files uploaded
- Icons and descriptions for each mode

**5. Modify CsvUploader** - `/client/src/components/CsvUploader.tsx`
- Accept multiple files (drag-drop or picker)
- Limit to 3 files
- Parse each file independently
- Call `addFile()` for each parsed file

**6. Update Home page** - `/client/src/pages/Home.tsx`
- Show FileUploadList below uploader
- Show ModeSelector after files uploaded
- Navigate to /configure after mode selected

---

### Phase 3: Configuration Page

**7. Update ConfigureNew** - `/client/src/pages/ConfigureNew.tsx`

**Merge Mode:**
- Union all headers from all files
- Single unified mapping interface
- Auto-detect on combined headers

**Compare Mode:**
- Tabbed interface (one tab per file)
- Each file has its own mapping
- Option: "Apply mapping to all files"

---

### Phase 4: Data Processing & Dashboard

**8. Add multi-file metrics utility** - `/client/src/utils/calculateMetrics.ts`
```typescript
export function calculateMultiFileMetrics(files: UploadedFile[]): {
  files: Array<{ fileName: string; global: EntityMetrics; entities: EntityMetrics[] }>
}
```

**9. Update Dashboard** - `/client/src/pages/Dashboard.tsx`
- Merge mode: concatenate data, process as single dataset
- Compare mode: process each file, render side-by-side comparison
- Add comparison visualizations (grouped bar charts)

**10. Update report components** - `/client/src/reports/*.tsx`
- Accept optional `compareData` prop
- Render comparison layout when present

---

## Files to Modify/Create

| File | Action | Description |
|------|--------|-------------|
| `/client/src/types/index.ts` | MODIFY | Add MultiFileMode, UploadedFile types |
| `/client/src/contexts/DataContext.tsx` | MODIFY | Multi-file state, add/remove/update functions |
| `/client/src/components/FileUploadList.tsx` | CREATE | Display uploaded files with remove |
| `/client/src/components/ModeSelector.tsx` | CREATE | Merge vs Compare selection UI |
| `/client/src/components/CsvUploader.tsx` | MODIFY | Multi-file upload support |
| `/client/src/pages/Home.tsx` | MODIFY | Integrate new components, mode selection flow |
| `/client/src/pages/ConfigureNew.tsx` | MODIFY | Tabbed mapping for compare, unified for merge |
| `/client/src/pages/Dashboard.tsx` | MODIFY | Handle both modes, comparison rendering |
| `/client/src/utils/calculateMetrics.ts` | MODIFY | Add calculateMultiFileMetrics() |
| `/client/src/reports/KPIDashboard.tsx` | MODIFY | Support compareData prop |

---

## Verification Plan

1. **Single file upload** - Confirm existing flow still works unchanged
2. **Multi-file merge mode**:
   - Upload 3 CSV files
   - Select "Merge" mode
   - Verify combined row count in configuration
   - Confirm dashboard shows aggregated metrics
3. **Multi-file compare mode**:
   - Upload 2-3 CSV files
   - Select "Compare" mode
   - Verify tabbed mapping in configuration
   - Confirm dashboard shows side-by-side comparison
4. **Edge cases**:
   - Remove a file mid-upload
   - Files with different column names (auto-detection)
   - PDF export with comparison layout

---

## Estimated Effort by Phase

| Phase | Components | Effort |
|-------|------------|--------|
| 1. Foundation (Types + DataContext) | 2 files | Medium |
| 2. Upload UI | 4 files | Medium |
| 3. Configuration | 1 file | Medium |
| 4. Dashboard & Reports | 3+ files | Medium-High |
| **Total** | ~10 files | **Moderate** |
