# MoneyFlow Setup & Deployment Guide

This guide details how to set up, configure, run, and deploy MoneyFlow across Backend, Android, and Desktop.

---

## 1. Prerequisites

Ensure your system has the following installed:
- **Node.js**: v18.0+ or v20.0+ (Tested on v20+)
- **Java Development Kit (JDK)**: JDK 17+ (Tested on Microsoft JDK 17)
- **Android SDK**: Build-Tools 36+ & Platform 36 (or Android Studio Ladybug+)

---

## 2. Supabase Backend Setup

### Step 2.1: Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Create a new project called `moneyflow`.
3. Note your **Project URL** and **Anon Public Key** from `Project Settings > API`.

### Step 2.2: Apply Database Migrations
In your Supabase project dashboard, navigate to **SQL Editor** and run the contents of:
`supabase/migrations/20261004000000_initial_schema.sql`

This script will:
- Create tables: `profiles`, `accounts`, `categories`, `transactions`, `transfers`.
- Enable **Row Level Security (RLS)** with user-isolation policies (`auth.uid() = user_id`).
- Build performance indexes on `transaction_date`, `account_id`, `category_id`, and `type`.
- Create the `handle_new_user()` trigger that seeds default categories and accounts upon user registration.
- Add tables to the `supabase_realtime` publication.

---

## 3. Desktop Application Setup

### Step 3.1: Configure Environment Variables
In `desktop/`, copy `.env.example` to `.env.local`:
```bash
cd desktop
copy .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
*(Note: If left blank, MoneyFlow automatically boots into high-fidelity offline local-storage mode with pre-seeded test data).*

### Step 3.2: Install and Run
```bash
cd desktop
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Step 3.3: Run Unit Tests
```bash
npm test
```

### Step 3.4: Build for Production
```bash
npm run build
npm start
```

---

## 4. Android Application Setup

### Step 4.1: Run Unit Tests
In the `android/` directory:
```bash
cd android
./gradlew test
```

### Step 4.2: Build the Debug APK
```bash
./gradlew assembleDebug
```
The compiled APK is located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4.3: Deploy to Device or Emulator
If an Android device or emulator is running:
```bash
./gradlew installDebug
```
Or launch using the Android CLI:
```bash
android run --apks=app/build/outputs/apk/debug/app-debug.apk
```

### Step 4.4: Adding the Home-Screen Widget
1. Long-press on the Android home screen.
2. Select **Widgets**.
3. Scroll down to **MoneyFlow**.
4. Drag either the **Small Widget** or **Medium Widget** onto your home screen.
5. Tap `+` or `-` to immediately open Money In or Money Out.

---

## 5. End-to-End Verification Checklist

Verify the complete core user journey (Prompt Section 87):
- [x] Launch desktop app or Android app.
- [x] Verify initial accounts: Cash, HDFC Bank, UPI.
- [x] Record **Money In**: ₹1,000 from Rahul.
- [x] Record **Money Out**: ₹300 at XYZ Store.
- [x] Verify balance accurately reflects: `₹1,000 - ₹300 = ₹700`.
- [x] Test **Move Money**: Move ₹500 from Cash to Bank.
- [x] Verify individual account balances change while the overall total balance remains exactly unchanged.
- [x] Test **3-Second Quick Spend**: Tap Quick Spend → Enter 150 → Merchant: Swiggy → Save.
- [x] Open **Reports**: View monthly breakdown, category distribution, and balance changes.
- [x] Test **Export**: Download full JSON database backup and CSV spreadsheet.
