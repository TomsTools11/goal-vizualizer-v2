# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

```bash
# Development
pnpm install          # Install dependencies (uses pnpm)
pnpm dev              # Start Vite dev server on port 3000
pnpm check            # TypeScript type checking (tsc --noEmit)
pnpm format           # Format code with Prettier

# Production
pnpm build            # Build client (Vite) + server (esbuild)
pnpm start            # Run production server (NODE_ENV=production)

# Testing
# Vitest is installed but no tests exist yet. Run tests with:
pnpm vitest           # or add a "test" script
```

## Architecture

### Monorepo Structure
- **`client/`** - React 19 frontend (Vite, TailwindCSS 4, shadcn/ui new-york style)
- **`server/`** - Minimal Express server that serves static files in production
- **`shared/`** - Shared TypeScript constants between client/server

### Path Aliases
```typescript
"@/*"       → "./client/src/*"
"@shared/*" → "./shared/*"
"@assets"   → "./attached_assets"
```

### Frontend Organization (`client/src/`)
- **`pages/`** - Route components: Home → MapColumns → Configure → Dashboard
- **`components/`** - Custom components (CsvUploader, KpiCard, HorizontalBarChart)
- **`components/ui/`** - shadcn/ui primitives
- **`contexts/`** - DataContext (holds uploaded CSV data + column mapping), ThemeContext
- **`hooks/`** - useComposition, useMobile, usePersistFn
- **`lib/utils.ts`** - `cn()` helper for className merging

### Data Flow
1. **Home**: User uploads CSV via drag-drop or file picker
2. **MapColumns**: User maps CSV columns to required metrics (spend, leads, quotes, sales, clicks)
3. **Configure**: User selects reporting objective and KPIs to display
4. **Dashboard**: Renders KPI cards and horizontal bar charts; supports PDF export

All CSV parsing happens client-side using PapaParse. The `DataContext` stores:
- `data: DataRow[]` - parsed CSV rows
- `headers: string[]` - column names
- `mapping: ColumnMapping` - user-defined column→metric mapping

### Key Components
- **`CsvUploader`** - Handles CSV upload, parsing, and auto-redirects to /map-columns
- **`KpiCard`** - Displays a single metric with formatting (currency/percentage/number)
- **`HorizontalBarChart`** - Comparison bar chart with primary item highlighting
- **`Dashboard`** - Uses html2canvas + jsPDF for PDF export

### Routing
Uses `wouter` (lightweight React router). Routes defined in `App.tsx`:
- `/` → Home
- `/map-columns` → MapColumns
- `/configure` → Configure  
- `/dashboard` → Dashboard (receives config via query params)

## Brand Guidelines

Color palette defined in `brand-specs.md`:
- **GOAL Blue**: #1E88E5 (primary, used for cost metrics)
- **Teal**: #0D9488 (used for positive percentage metrics)
- **Dark Blue**: #1A365D (text)
- **Gray**: #9CA3AF (secondary/comparison bars)

KPI cards use blue for currency values and teal for percentages per brand spec.

## Tech Stack Notes

- **React 19** with functional components and hooks
- **TailwindCSS 4** via `@tailwindcss/vite` plugin
- **shadcn/ui** (new-york style) - components in `client/src/components/ui/`
- **Vite 7** with React plugin, includes custom debug collector plugin for dev
- **Express** server is minimal; only serves built static files in production
- **pnpm** is required (specified via `packageManager` field with hash)
