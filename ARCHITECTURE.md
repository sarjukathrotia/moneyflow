# MoneyFlow Architecture Documentation

## 1. System Overview

MoneyFlow connects three high-performance tiers into a unified, offline-first personal financial ecosystem:

```text
                           MONEYFLOW
                               │
               ┌───────────────┼────────────────┐
               │               │                │
               ↓               ↓                ↓
           ANDROID          DESKTOP            CLOUD
               │               │                │
          Kotlin +        Next.js +          Supabase
          Compose           React           PostgreSQL
               │               │                │
            Room DB        Web State           Auth
               │               │                │
               └───────────────┼────────────────┘
                               │
                           Sync Engine
```

---

## 2. Core Architectural Principles

1. **Immediate Local Persistence**: When the user records an expense or income, the UI updates synchronously against local memory and local database. The user never waits for a cloud round-trip.
2. **Deterministic Accounting Rules**:
   - `Current Balance = Opening Balance + Total Money In - Total Money Out`
   - Transfers between accounts update individual account balances (`fromAccount -= amount`, `toAccount += amount`), but **never alter the total overall balance**.
   - Soft-deleted items (`deleted_at != null`) are strictly excluded from all balance aggregations.
3. **Client-Side UUID Authority**: IDs are generated client-side using standard RFC 4122 UUIDs. This prevents ID collisions during offline record creation.
4. **Idempotent Synchronization**: Re-running sync or retrying network requests never duplicates transactions.

---

## 3. Android Clean Architecture

The Android application follows standard Google Clean Architecture + MVVM + Repository pattern:

```text
UI Layer (Jetpack Compose)
       │
       ▼
State & ViewModel Layer (Kotlin Flow / StateFlow)
       │
       ▼
Domain Layer (Use Cases: CalculateBalance, AddTransaction, QuickSpend)
       │
       ▼
Data Layer (MoneyFlowRepository)
       │
       ├─────────────────────────┐
       ▼                         ▼
Local Storage (Room DB)    Sync Engine (WorkManager + Supabase)
```

### Module Breakdown
- **`com.example.moneyflow.domain.model`**: Independent Kotlin data classes (`MoneyAccount`, `MoneyTransaction`, `MoneyTransfer`, `MoneyCategory`, `PeriodSummary`).
- **`com.example.moneyflow.domain.usecase`**: Pure domain functions (`BalanceUseCases`) calculating overall balance, account balances, monthly summaries, and currency formatting.
- **`com.example.moneyflow.data.repository`**: `MoneyFlowRepository` orchestrating in-memory flows, Room local persistence, and background sync.
- **`com.example.moneyflow.feature.*`**: Declarative Compose screens (`HomeScreen`, `MoneyInScreen`, `MoneyOutScreen`, `MoveMoneyScreen`, `QuickSpendScreen`, `TransactionTimelineScreen`, `AccountsScreen`, `ReportsScreen`, `SettingsScreen`).
- **`com.example.moneyflow.widget`**: Glance / RemoteViews AppWidgetProvider for home-screen widgets.

---

## 4. Desktop Web Architecture

Built on **Next.js 14+ (App Router)** and **TypeScript**:

- **App Router**: File-system based routing with high performance and static pre-rendering.
- **State Store (`src/lib/store.tsx`)**: React Context provider managing accounts, categories, transactions, transfers, active periods, and search states with automatic fallback to high-fidelity local storage.
- **Pure Calculation Engine (`src/lib/calculations.ts`)**: Framework-independent mathematical calculation functions covered by Vitest unit tests.
- **Design Tokens & Tailwind (`tailwind.config.js`)**: Curated minimal color palette (#F7F8FA background, #2563EB accent, #16A34A positive, #DC2626 negative).
- **Responsive Layout**: Fluid desktop sidebar collapsing into accessible mobile navigation on smaller viewports.

---

## 5. Security & Isolation

- **Supabase Row Level Security (RLS)**: PostgreSQL enforces `user_id = auth.uid()` at the database engine level. No user can read, query, update, or delete another user's financial records.
- **Biometric Security on Android**: Native `BiometricPrompt` authentication protecting access to financial records.
- **No Sensitive Credential Storage**: Neither bank passwords, UPI PINs, nor service-role API keys are ever stored or processed.
