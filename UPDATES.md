# GOAL Visuals Builder - Updates Log

This file tracks updates and changes made to the project across development sessions.

---

## Session: January 24, 2026

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

### Enhanced Column Detection
- **Sales column**: Added patterns for `policy` (singular), `bound`, `bounds`, `bound hh`, `bound households`
- **Premium column**: Added patterns for `policy rev`, `policy revenue`
- Updated exclusion logic so CPA patterns are properly detected for CPA fields but excluded from raw count fields

### Files Modified
- `vercel.json` (created)
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
