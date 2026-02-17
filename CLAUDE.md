# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install          # Install dependencies (requires pnpm)
pnpm dev              # Start Vite dev server on port 3000
pnpm check            # TypeScript type checking (tsc --noEmit)
pnpm format           # Format code with Prettier
pnpm build            # Build client (Vite) + server (esbuild)
pnpm start            # Run production server
pnpm vitest           # Run tests (no tests exist yet)
```

## Architecture

### Monorepo Structure
- **`client/`** - React 19 frontend (Vite 7, TailwindCSS 4, shadcn/ui new-york style)
- **`server/`** - Minimal Express server that serves static files in production
- **`shared/`** - Shared TypeScript constants between client/server

### Path Aliases
```typescript
"@/*"       → "./client/src/*"
"@shared/*" → "./shared/*"
"@assets"   → "./attached_assets"
```

### Data Flow
1. **Home (`/`)**: User uploads CSV files (up to 3) via drag-drop or file picker
2. **Configure (`/configure`)**: User maps CSV columns to metrics and selects report options
3. **Dashboard (`/dashboard`)**: Renders KPI cards and charts; supports PDF export

All CSV parsing is client-side using PapaParse. The `DataContext` manages:
- Multiple file uploads with merge/compare modes
- Column-to-metric mapping
- Backward-compatible single-file API

### Report System (`client/src/reports/`)
Three report layouts: `KPIDashboard`, `CompetitiveComparison`, `CampaignDeepDive`

Reports consume:
- **NormalizedRow**: Raw CSV data transformed via column mapping
- **EntityMetrics**: Aggregated metrics per campaign/source with derived calculations

### Metric Calculation Pipeline
1. Raw CSV → `normalizeData()` → NormalizedRow[]
2. NormalizedRow[] → `calculateAllMetrics()` → EntityMetrics[] + GlobalMetrics
3. Metrics rendered via KpiCard (single value) or HorizontalBarChart (comparison)

### Key Types (`client/src/types/index.ts`)
- `ColumnMapping`: Maps canonical fields (spend, leads, quotes, sales) to CSV columns
- `EntityMetrics`: Contains base totals + derived metrics (cpl, cpq, cpa, quoteRate, etc.)
- `MetricId`: Union of all calculable metrics (cost, conversion, engagement, business)

### Multi-File Support
- `UploadedFile[]` stored in DataContext
- `merge` mode: concatenates all data
- `compare` mode: calculates metrics per file separately via `calculateMultiFileMetrics()`

## Brand Guidelines

Colors from `brand-specs.md`:
- **GOAL Blue**: #1E88E5 (cost metrics)
- **Teal**: #0D9488 (percentage metrics)
- **Dark Blue**: #1A365D (text)
- **Gray**: #9CA3AF (comparison bars)

KPI cards use blue for currency values, teal for percentages per brand spec.

## Tech Notes

- Uses `wouter` for lightweight routing (not react-router)
- PDF export via html2canvas + jsPDF in Dashboard component
- shadcn/ui components are in `client/src/components/ui/` (don't modify these)
- Custom components use brand tokens from `client/src/constants/brandTokens.ts`
