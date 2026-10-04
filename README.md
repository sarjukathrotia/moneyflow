# MoneyFlow — Personal Money Tracker
### Native Android + Android Widget + Desktop Web + Cloud Backend

> **Track my personal money: how much money came in, how much money went out, and how much money I have now.**

MoneyFlow is a production-grade personal financial tracking system. It is designed to be simple enough to record an expense in seconds, but powerful enough to manage and analyze personal finances seamlessly across Android and Desktop.

---

## 🚫 What MoneyFlow Is NOT
- **NOT Splitwise**: No friends, groups, settlements, or shared balances.
- **NOT an accounting ERP**: No double-entry jargon, debits/credits confusion, or ledger complexity.
- **NOT a budgeting drill**: Focuses primarily on cash flow reality — where money came from, where it went, and real-time balances.

---

## ⚡ The 3 Fundamental Money Movements

| User Movement | DB Type | Definition | Balance Impact |
| :--- | :--- | :--- | :--- |
| **Money In** | `CREDIT` | Money enters your personal pool (Salary, Gift, Refund, Freelance) | Overall Balance Increases |
| **Money Out** | `DEBIT` | Money leaves your personal pool (Food, Shopping, Travel, Bills) | Overall Balance Decreases |
| **Move Money** | `TRANSFER` | Money moves between your own accounts (Cash → Bank) | **Zero overall balance change** |

### Accounting Invariance (Tested & Verified)
```text
Current Balance = Opening Balance + Total Money In - Total Money Out
```
When moving **₹2,000 from Cash (₹5,000) to Bank (₹20,000)**:
- Cash becomes **₹3,000**
- Bank becomes **₹22,000**
- Overall total remains **₹28,000** (never duplicate or inflate).

---

## 🚀 Key Features

### 1. Native Android Application
- **Modern Jetpack Compose UI**: Clean typography, calm aesthetic, Material 3 design tokens.
- **Offline-First Room Local Engine**: Instant UI updates with zero network latency.
- **Background Synchronization**: WorkManager for reliable offline-to-online sync.
- **Express Quick Spend (3s)**: Enter amount → Enter merchant → Save!
- **Biometric Security**: Fingerprint & Face Unlock support with automatic app lock timer.

### 2. Android Home-Screen Widget
- **Small 2x1 Widget**: Displays live balance with instant `+` (Money In) and `-` (Money Out) quick-launch triggers.
- **Medium 4x2 Widget**: Real-time balance breakdown, total Money In, total Money Out, and direct quick-entry buttons.
- **Zero-Latency Cache**: Displays current local balance even when offline.

### 3. Desktop / Web Application
- **Next.js 14+ App Router & TypeScript**: Fast, reactive, responsive desktop-first dashboard (1440px+ desktop down to 320px mobile).
- **Interactive Visualizations**: 30-day personal balance trend area chart and category spending donut charts powered by Recharts.
- **Full Transactions Management**: Sortable, filterable table by date, account, type, and category with search and soft deletion.
- **Backup & Export**: Full database JSON snapshot download/restore and CSV export for Excel / Google Sheets.

### 4. Cloud Backend & Supabase
- **PostgreSQL Database**: Tables for `profiles`, `accounts`, `categories`, `transactions`, `transfers`.
- **Row-Level Security (RLS)**: Cryptographically strict isolation ensuring users only access their own records (`auth.uid() = user_id`).
- **Sync Architecture**: Conflict resolution using client-side UUIDs, `updated_at`, and soft deletion (`deleted_at`).

---

## 📂 Repository Structure

```text
moneyflow/
├── android/                   # Native Android Jetpack Compose App
│   ├── app/src/main/java/     # Clean Architecture: core, data, domain, feature, widget
│   ├── app/src/main/res/      # Layouts, widget metadata, drawables
│   ├── app/src/test/          # JUnit & Coroutines balance test suite
│   └── build.gradle.kts       # AGP 9.0, Kotlin 2.3, Compose, Room, Glance
│
├── desktop/                   # Next.js 14 Web Application
│   ├── src/app/               # Dashboard, Transactions, Accounts, Categories, Reports, Settings
│   ├── src/components/        # Sidebar, TopNav, TransactionModal, QuickSpendModal
│   ├── src/lib/               # Pure calculation engine, Vitest tests, Supabase store
│   └── src/types/             # TypeScript domain definitions
│
├── supabase/                  # Backend & Cloud Migrations
│   └── migrations/            # Initial schema, RLS policies, indexes, user trigger
│
├── docs/                      # Technical Documentation
│   ├── ARCHITECTURE.md        # Clean architecture & data flow
│   ├── DATABASE.md            # Schema, RLS, indexes, triggers
│   ├── SYNC.md                # Offline-first sync engine & conflict resolution
│   ├── ANDROID.md             # Android build & widget documentation
│   ├── DESKTOP.md             # Next.js web application details
│   └── SETUP.md               # Quickstart and deployment instructions
```

---

## 🧪 Verification & Test Suite

All accounting, transfer conservation, and balance calculation algorithms are verified by automated tests across both Desktop and Android:

- **Desktop (Vitest)**: `5/5 tests passed` (`npm test` in `desktop/`)
- **Android (JUnit)**: `BUILD SUCCESSFUL` (`gradlew test` in `android/`)
- **Desktop Production Build**: `9/9 static routes generated` (`npm run build`)
- **Android Debug APK**: `app-debug.apk` compiled successfully (`gradlew assembleDebug`)
