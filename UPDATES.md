# GOAL Visuals Builder - Updates Log

This file tracks updates and changes made to the project across development sessions.

---

## Session: January 24, 2026 (Evening)

### Multiple CSV Upload Support (Up to 3 Files)
Implemented multi-file upload feature with two analysis modes:

**Phase 1: Foundation**
- Added `MultiFileMode` and `UploadedFile` types to `types/index.ts`
- Refactored `DataContext` with multi-file state management:
  - `uploadedFiles[]`, `multiFileMode`, `addFile()`, `removeFile()`, `updateFileMapping()`
  - Backward-compatible computed values for `data`, `headers`, `mapping`

**Phase 2: Upload UI**
- Created `FileUploadList.tsx` - displays uploaded files with row count and remove button
- Created `ModeSelector.tsx` - merge vs compare mode selection (shown with 2+ files)
- Updated `CsvUploader.tsx` - multi-file drag-drop, duplicate detection, compact mode
- Updated `Home.tsx` - integrated new components with flow control

**Phase 3: Configuration Page**
- Updated `ConfigureNew.tsx` with:
  - Tabbed interface for per-file mapping in compare mode
  - "Apply to All Files" button for compare mode
  - Multi-file data summary display
  - Passes `multiFileMode` to dashboard via query params

**Phase 4: Dashboard & Reports**
- Added `calculateMultiFileMetrics()` utility for per-file metric calculation
- Updated `Dashboard.tsx` to handle both merge and compare modes
- Created `FileComparisonReport.tsx` - side-by-side file comparison with:
  - File summary cards with color coding
  - Metric comparison table with "Best" indicators
  - Trend indicators showing % change between files
  - Per-file KPI breakdowns

### Files Created
- `client/src/components/FileUploadList.tsx`
- `client/src/components/ModeSelector.tsx`
- `client/src/reports/FileComparisonReport.tsx`

### Files Modified
- `client/src/types/index.ts`
- `client/src/contexts/DataContext.tsx`
- `client/src/components/CsvUploader.tsx`
- `client/src/pages/Home.tsx`
- `client/src/pages/ConfigureNew.tsx`
- `client/src/pages/Dashboard.tsx`
- `client/src/utils/calculateMetrics.ts`

---

## Session: January 24, 2026 (Morning)

### Vercel Deployment Setup
- Added `vercel.json` with build configuration and SPA rewrites
- Cleaned up `vite.config.ts` by removing dev-only plugins (`vitePluginManusDebugCollector`, `vitePluginManusRuntime`, `jsxLocPlugin`)
- Removed unused dev dependencies from `package.json`
- Regenerated `pnpm-lock.yaml` for Vercel compatibility

### Pre-calculated CPA Column Support
- Added `quoteCpa` and `policyCpa` fields to `ColumnMapping` and `NormalizedRow` types
- Updated column auto-detection to recognize CPA columns:
  - Quote CPA patterns: `quote cpa`, `cpq`, `cost per quote`
  - Policy CPA patterns: `policy cpa`, `cpa`, `cost per acquisition`, `cost per sale`, `cost per policy`
- Modified `normalizeData.ts` to extract pre-calculated CPA values from CSV
- Modified `calculateMetrics.ts` to use pre-calculated CPA values when available (falls back to calculated values otherwise)

### Favicon Addition
- Added favicon link to `client/index.html`
- Using `goal-new-favicon.png` from `client/public/`

### Enhanced Column Detection
- **Sales column**: Added patterns for `policy` (singular), `bound`, `bounds`, `bound hh`, `bound households`
- **Premium column**: Added patterns for `policy rev`, `policy revenue`
- Updated exclusion logic so CPA patterns are properly detected for CPA fields but excluded from raw count fields

### Files Modified
- `vercel.json` (created)
- `client/index.html`
- `vite.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `client/src/types/index.ts`
- `client/src/utils/columnMapping.ts`
- `client/src/utils/normalizeData.ts`
- `client/src/utils/calculateMetrics.ts`

---

## Previous Sessions

### Phase 5: Export Functionality (Complete)
- Multi-page PDF export with Letter size (8.5" × 11") and 40px margins
- High-resolution rendering (scale 2)
- Automatic page splitting for long reports

### Phase 4: Report Layouts (Complete)
- Created three report layouts: KPIDashboard, CompetitiveComparison, CampaignDeepDive
- Built visualization components: SummaryBanner, BottomLineCallout
- Updated KpiCard and HorizontalBarChart with GOAL brand colors
- Bar chart colors: GOAL Blue (#1E88E5) and Teal (#0D9488)

### Phase 3: Configure Page Redesign (Complete)
- Created `ConfigureNew.tsx` with simplified UI
- Comparison context cards (single, multiple, competitive)
- Toggleable metric pills for base and derived metrics
- Auto-mapping with helpful tips instead of blocking validation
- Updated routing to skip MapColumns page (upload → configure directly)

### Phase 2: Bottom Line Callout Updates
- Prioritizes CPA over close rate in Bottom Line display
- Falls back to close rate if no CPA metrics available

### Phase 1: Foundation
- React 19 + Vite 7 setup
- TailwindCSS 4 with GOAL brand colors
- PapaParse for CSV parsing
- Radix UI components (shadcn/ui new-york style)
- DataContext for state management
- Column auto-detection system
