# MoneyFlow Desktop Web Application Documentation

## 1. Overview

The MoneyFlow Desktop application is a responsive, desktop-first personal finance platform built with:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom tokens and typography
- **Data Visualizations**: Recharts
- **Icons**: Lucide React
- **Unit Testing**: Vitest
- **Backend / Sync**: Supabase client (`@supabase/supabase-js`) with offline fallback

---

## 2. Directory Structure

```text
desktop/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # App shell, provider, modals
│   │   ├── page.tsx                  # Dashboard (Hero balance, trends, categories, activity)
│   │   ├── transactions/page.tsx     # Full transaction table, search, multi-filter, sort
│   │   ├── accounts/page.tsx         # Money Locations manager (Cash, Bank, UPI)
│   │   ├── categories/page.tsx       # Income and Expense categories manager
│   │   ├── reports/page.tsx          # Monthly summary, cash flow, category spend
│   │   ├── settings/page.tsx         # Security, currency, JSON backups, CSV export
│   │   └── globals.css               # Minimalist tokens & custom scrollbars
│   ├── components/
│   │   ├── Sidebar.tsx               # Desktop persistent sidebar & mobile drawer
│   │   ├── TopNav.tsx                # Month navigation, search, quick action buttons
│   │   ├── TransactionModal.tsx      # Add/Edit modal (Money In, Money Out, Move Money)
│   │   ├── QuickSpendModal.tsx       # 3-Second rapid expense modal
│   │   └── DeleteConfirmModal.tsx    # Soft deletion confirmation modal
│   ├── lib/
│   │   ├── calculations.ts           # Pure accounting & aggregation business logic
│   │   ├── calculations.test.ts      # Unit tests (Section 70 & 71 test cases)
│   │   ├── store.tsx                 # Central React context & state store
│   │   └── supabase.ts               # Supabase client & environment detector
│   └── types/
│       └── moneyflow.ts              # TypeScript interfaces and entity types
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 3. Responsive Breakpoints

1. **Desktop (1440px+)**: Two-column layout with a fixed sidebar, multi-column analytics grid, and expansive transaction data tables.
2. **Tablet (768px - 1439px)**: Adaptive grid collapsing into dual-column cards, sidebar toggleable via header menu.
3. **Mobile Browser (320px - 767px)**: Full-width cards, touch-optimized button targets, bottom modal sheets, and collapsed drawer navigation.

---

## 4. Key Workflows

### 4.1 Dashboard
- **Current Balance**: Rendered in 48px bold typography.
- **Monthly Delta**: Positive received amount vs. negative spent amount.
- **Balance Trend Chart**: 30-day continuous timeline showing cumulative personal balance over time.
- **Spending by Category**: Donut chart with percentages and sorted dollar/rupee rankings.

### 4.2 Fast Transaction Entry
- **Modal Shortcuts**: Keyboard accessible (Esc to dismiss, numeric inputs with autofocus).
- **Tabs**: Smooth switching between Money In (`CREDIT`), Money Out (`DEBIT`), and Move Money (`TRANSFER`).
- **Quick Spend (3s)**: Two-step quick expense modal for ultra-rapid logging on desktop and mobile.

### 4.3 Data Export & Backup
- **CSV Export**: Instant download of all transactions formatted for Microsoft Excel or Google Sheets.
- **JSON Backup**: Complete snapshot of all profiles, accounts, categories, and transactions.
- **JSON Restore**: Upload backup file to reconstruct financial history with zero data loss.

---

## 5. Development & Testing Commands

```bash
cd desktop

# Install dependencies
npm install

# Run unit tests (Accounting & Balance rules)
npm test

# Run development dev server
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```
