export type AccountType = 'CASH' | 'BANK' | 'UPI' | 'WALLET' | 'CREDIT_CARD' | 'OTHER';

export type TransactionType = 'CREDIT' | 'DEBIT';

export type CategoryType = 'INCOME' | 'EXPENSE' | 'BOTH';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  currency: string;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: string;
  opening_balance: number;
  icon?: string | null;
  color?: string | null;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  current_balance?: number; // Calculated derived field
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  icon?: string | null;
  color?: string | null;
  is_default?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  type: TransactionType;
  amount: number;
  category_id?: string | null;
  description?: string | null;
  source_or_merchant?: string | null;
  note?: string | null;
  transaction_date: string; // YYYY-MM-DD
  transaction_time?: string | null; // HH:mm:ss
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  client_created_at?: string;
  sync_version?: number;
}

export interface Transfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  note?: string | null;
  transaction_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  sync_version?: number;
}

export interface FilterOptions {
  searchQuery: string;
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  categoryId?: string;
  type?: 'ALL' | 'CREDIT' | 'DEBIT' | 'TRANSFER';
  minAmount?: number;
  maxAmount?: number;
}

export interface PeriodSummary {
  startingBalance: number;
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  endingBalance: number;
  transferCount: number;
}

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface BalanceTrendPoint {
  date: string;
  balance: number;
  income: number;
  expense: number;
}

export type LogLevel = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
export type LogCategory = 'DATABASE' | 'SYNC' | 'TRANSACTION' | 'ACCOUNT' | 'SYSTEM';

export interface DebugLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
}

