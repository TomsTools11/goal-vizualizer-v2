# GOAL Data Visualizer

A professional data visualization tool that transforms CSV campaign data into presentation-ready dashboards and PDF reports. Built for insurance and sales professionals to analyze marketing performance, conversion metrics, and cost efficiency.

![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Vite](https://img.shields.io/badge/Vite-7.1-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-teal)

## Features

- **Smart CSV Parsing** - Drag-and-drop upload with automatic column detection that recognizes common naming variations (Quote/Quotes, Policy/Policies, Bound/Households)
- **14 Built-in Metrics** - Cost metrics (CPL, CPQ, CPA), conversion rates (Quote Rate, Close Rate), engagement metrics (Contact Rate, CTR), and business metrics (ROAS)
- **Three Report Types**
  - **KPI Dashboard** - Top KPI cards with 2-column metric comparison grid
  - **Competitive Comparison** - Benchmarking with multiplier highlights (2.1x, 3.0x)
  - **Campaign Deep Dive** - Per-campaign breakdown with summary
- **PDF Export** - Multi-page documents at Letter size with professional formatting
- **Brand Compliance** - GOAL-branded color palette and typography throughout

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10.4+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/goal-visualizer-V2.git
cd goal-visualizer-V2

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm run dev

# Type checking
pnpm run check

# Format code
pnpm run format
```

### Production

```bash
# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Start production server
pnpm run start
```

## Usage

1. **Upload CSV** - Drag and drop your campaign data file or use the file picker
2. **Review Mapping** - The app auto-detects columns; adjust if needed
3. **Select Metrics** - Toggle which metrics to include in your report
4. **Choose Report Type** - KPI Dashboard, Competitive Comparison, or Campaign Deep Dive
5. **Export PDF** - Download a timestamped, print-ready document

### Expected CSV Format

Your CSV should include columns for:

| Column | Examples | Required |
|--------|----------|----------|
| Entity/Campaign | "Campaign", "Channel", "Source" | Yes |
| Spend | "Spend", "Cost", "Budget" | Yes |
| Leads | "Leads", "Lead Count" | Yes |
| Quotes | "Quotes", "Quote", "Quoted" | Yes |
| Sales | "Sales", "Policies", "Bound", "Households" | Yes |
| Clicks | "Clicks", "Click Count" | Optional |
| Calls | "Calls", "Inbound Calls" | Optional |
| Contacted | "Contacted", "Contact Count" | Optional |
| Premium | "Premium", "Policy Rev", "Revenue" | Optional |

## Project Structure

```
goal-visualizer-V2/
├── client/
│   ├── src/
│   │   ├── components/      # UI components (CsvUploader, KpiCard, Charts)
│   │   ├── pages/           # Route pages (Home, Configure, Dashboard)
│   │   ├── reports/         # Report layouts (KPI, Competitive, DeepDive)
│   │   ├── contexts/        # React contexts (Data, Theme)
│   │   ├── constants/       # Brand tokens, metric definitions
│   │   ├── utils/           # Column mapping, calculations, formatters
│   │   ├── hooks/           # Custom React hooks
│   │   └── types/           # TypeScript definitions
│   └── public/              # Static assets and brand materials
├── server/
│   └── index.ts             # Express server for production
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json              # Deployment configuration
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: TailwindCSS, Radix UI components
- **Charts**: Recharts
- **PDF Export**: jsPDF, html2canvas
- **CSV Parsing**: PapaParse
- **Server**: Express (production only)

## Metrics Reference

### Cost Metrics
- **CPL** - Cost Per Lead (Spend / Leads)
- **CPQ** - Cost Per Quote (Spend / Quotes)
- **CPA** - Cost Per Acquisition (Spend / Sales)
- **CPI** - Cost Per Impression
- **CPC** - Cost Per Click

### Conversion Metrics
- **Quote Rate** - Leads to Quote conversion
- **Quote→Close** - Quote to Sale conversion
- **Close Rate** - Overall lead to sale conversion
- **Click→Lead** - Click to Lead conversion
- **Click→Close** - Click to Sale conversion

### Engagement Metrics
- **Contact Rate** - Leads contacted percentage
- **Inbound Call Rate** - Calls per lead
- **CTR** - Click-through rate

### Business Metrics
- **ROAS** - Return on Ad Spend (Premium / Spend)

## Deployment

The app is configured for Vercel deployment:

```bash
# Deploy to Vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Documentation

- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Feature completion tracking
- [Brand Specs](./brand-specs.md) - Design specifications and color palette
- [Updates Log](./UPDATES.md) - Recent changes and enhancements

## License

MIT
