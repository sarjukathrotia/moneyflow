'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Account,
  Category,
  PeriodSummary,
  Profile,
  Transaction,
  Transfer,
  BalanceTrendPoint,
  CategorySpending,
  DebugLogEntry,
  LogLevel,
  LogCategory,
} from '../types/moneyflow';
import {
  calculateAccountBalances,
  calculateBalanceHistory,
  calculateCategoryExpenses,
  calculatePeriodSummary,
  calculateTotalBalance,
} from './calculations';
import {
  getActiveSupabaseClient,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  createCustomSupabaseClient,
} from './supabase';

interface MoneyFlowContextType {
  profile: Profile;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  transfers: Transfer[];
  syncStatus: 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'LOCAL';
  isLive: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  connectSupabase: (url: string, key: string) => Promise<{ success: boolean; message: string }>;
  disconnectSupabase: () => void;
  selectedMonth: string; // e.g., '2026-10'
  setSelectedMonth: (month: string) => void;
  currency: string;
  totalBalance: number;
  periodSummary: PeriodSummary;
  categoryExpenses: CategorySpending[];
  balanceTrend: BalanceTrendPoint[];
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sync_version'>) => Promise<string>;
  updateTransaction: (id: string, tx: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  addTransfer: (tr: Omit<Transfer, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sync_version'>) => Promise<string>;
  deleteTransfer: (id: string) => Promise<void>;
  
  addAccount: (acc: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateAccount: (id: string, acc: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  
  addCategory: (cat: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<string>;
  
  // Modal states
  isTransactionModalOpen: boolean;
  transactionModalInitialType: 'CREDIT' | 'DEBIT' | 'TRANSFER';
  editingTransaction: Transaction | null;
  openTransactionModal: (type?: 'CREDIT' | 'DEBIT' | 'TRANSFER', tx?: Transaction | null) => void;
  closeTransactionModal: () => void;
  
  isQuickSpendOpen: boolean;
  openQuickSpend: () => void;
  closeQuickSpend: () => void;

  deleteItem: { id: string; type: 'transaction' | 'transfer' | 'account'; title: string } | null;
  requestDelete: (item: { id: string; type: 'transaction' | 'transfer' | 'account'; title: string }) => void;
  confirmDelete: () => Promise<void>;
  cancelDelete: () => void;

  // Export / Backup
  exportData: (format: 'json' | 'csv') => void;
  importBackup: (jsonContent: string) => boolean;
  resetToDefaults: () => void;

  // Debug & Diagnostics
  debugLogs: DebugLogEntry[];
  addLog: (level: LogLevel, category: LogCategory, message: string, data?: any) => void;
  clearLogs: () => void;
  runDiagnosticTest: () => Promise<void>;
}

const STORAGE_KEY = 'moneyflow_state_clean_v1';
const LOGS_STORAGE_KEY = 'moneyflow_debug_logs_v1';

const getInitialLogs = (): DebugLogEntry[] => {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(LOGS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }
  return [
    {
      id: 'init-1',
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category: 'SYSTEM',
      message: 'MoneyFlow core runtime initialized',
    },
  ];
};

const defaultProfile: Profile = {
  id: '00000000-0000-4000-8000-000000000001',
  full_name: 'Personal Account',
  email: '',
  currency: 'INR',
};

const defaultCategories: Category[] = [
  // Income
  { id: 'cat-salary', user_id: defaultProfile.id, name: 'Salary', type: 'INCOME', icon: 'Briefcase', color: '#16A34A', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-freelance', user_id: defaultProfile.id, name: 'Freelance', type: 'INCOME', icon: 'Laptop', color: '#10B981', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-gift', user_id: defaultProfile.id, name: 'Gift', type: 'INCOME', icon: 'Gift', color: '#0D9488', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-cashback', user_id: defaultProfile.id, name: 'Cashback', type: 'INCOME', icon: 'Sparkles', color: '#2563EB', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-refund', user_id: defaultProfile.id, name: 'Refund', type: 'INCOME', icon: 'RotateCcw', color: '#0284C7', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-other-income', user_id: defaultProfile.id, name: 'Other Income', type: 'INCOME', icon: 'PlusCircle', color: '#6366F1', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  // Expense
  { id: 'cat-food', user_id: defaultProfile.id, name: 'Food', type: 'EXPENSE', icon: 'Utensils', color: '#EA580C', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-shopping', user_id: defaultProfile.id, name: 'Shopping', type: 'EXPENSE', icon: 'ShoppingBag', color: '#DB2777', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-travel', user_id: defaultProfile.id, name: 'Travel', type: 'EXPENSE', icon: 'Navigation', color: '#0284C7', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-fuel', user_id: defaultProfile.id, name: 'Fuel', type: 'EXPENSE', icon: 'Fuel', color: '#D97706', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-bills', user_id: defaultProfile.id, name: 'Bills', type: 'EXPENSE', icon: 'Receipt', color: '#DC2626', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-entertainment', user_id: defaultProfile.id, name: 'Entertainment', type: 'EXPENSE', icon: 'Film', color: '#9333EA', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-health', user_id: defaultProfile.id, name: 'Health', type: 'EXPENSE', icon: 'HeartPulse', color: '#E11D48', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-subscriptions', user_id: defaultProfile.id, name: 'Subscriptions', type: 'EXPENSE', icon: 'CalendarClock', color: '#7C3AED', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'cat-other-expense', user_id: defaultProfile.id, name: 'Other', type: 'EXPENSE', icon: 'HelpCircle', color: '#6B7280', is_default: true, created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
];

const defaultAccounts: Account[] = [
  { id: 'acc-cash', user_id: defaultProfile.id, name: 'Cash', type: 'CASH', currency: 'INR', opening_balance: 0, icon: 'Banknote', color: '#16A34A', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'acc-bank', user_id: defaultProfile.id, name: 'Bank Account', type: 'BANK', currency: 'INR', opening_balance: 0, icon: 'Building2', color: '#2563EB', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
  { id: 'acc-upi', user_id: defaultProfile.id, name: 'UPI', type: 'UPI', currency: 'INR', opening_balance: 0, icon: 'Smartphone', color: '#7C3AED', created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-01T00:00:00Z' },
];

const defaultTransactions: Transaction[] = [];

const defaultTransfers: Transfer[] = [];

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          profile: parsed.profile || defaultProfile,
          accounts: parsed.accounts && parsed.accounts.length > 0 ? parsed.accounts : defaultAccounts,
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaultCategories,
          transactions: parsed.transactions || defaultTransactions,
          transfers: parsed.transfers || defaultTransfers,
        };
      }
    } catch {}
  }
  return {
    profile: defaultProfile,
    accounts: defaultAccounts,
    categories: defaultCategories,
    transactions: defaultTransactions,
    transfers: defaultTransfers,
  };
};

const MoneyFlowContext = createContext<MoneyFlowContextType | null>(null);

export const MoneyFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>(() => getInitialState().profile);
  const [accounts, setAccounts] = useState<Account[]>(() => getInitialState().accounts);
  const [categories, setCategories] = useState<Category[]>(() => getInitialState().categories);
  const [transactions, setTransactions] = useState<Transaction[]>(() => getInitialState().transactions);
  const [transfers, setTransfers] = useState<Transfer[]>(() => getInitialState().transfers);
  const [syncStatus, setSyncStatus] = useState<'SYNCED' | 'SYNCING' | 'OFFLINE' | 'LOCAL'>('LOCAL');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');

  const isHydratedRef = React.useRef(false);

  useEffect(() => {
    isHydratedRef.current = true;
  }, []);

  // Supabase Dynamic Client & Config State
  const [supabaseClient, setSupabaseClient] = useState(() => getActiveSupabaseClient().client);
  const [supabaseUrl, setSupabaseUrl] = useState(() => getActiveSupabaseClient().url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => getActiveSupabaseClient().anonKey);
  const isLive = Boolean(supabaseClient);

  // Debug Logs State
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>(getInitialLogs);

  const addLog = useCallback(
    (level: LogLevel, category: LogCategory, message: string, data?: any) => {
      const entry: DebugLogEntry = {
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        timestamp: new Date().toISOString(),
        level,
        category,
        message,
        data: data ? (typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data) : undefined,
      };
      setDebugLogs(prev => {
        const next = [entry, ...prev].slice(0, 300);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(next));
          } catch {}
        }
        return next;
      });
      const prefix = `[MoneyFlow ${level}] [${category}]`;
      if (level === 'ERROR') console.error(prefix, message, data || '');
      else if (level === 'WARN') console.warn(prefix, message, data || '');
      else console.log(prefix, message, data || '');
    },
    []
  );

  const clearLogs = useCallback(() => {
    setDebugLogs([]);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(LOGS_STORAGE_KEY);
      } catch {}
    }
  }, []);

  // Modal controls
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalInitialType, setTransactionModalInitialType] = useState<'CREDIT' | 'DEBIT' | 'TRANSFER'>('DEBIT');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isQuickSpendOpen, setIsQuickSpendOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string; type: 'transaction' | 'transfer' | 'account'; title: string } | null>(null);

  // Connect to Supabase
  const connectSupabase = useCallback(async (url: string, key: string) => {
    try {
      addLog('INFO', 'DATABASE', `Attempting connection to Supabase endpoint: ${url}`);
      const client = createCustomSupabaseClient(url, key);
      if (!client) {
        addLog('ERROR', 'DATABASE', 'Invalid Supabase URL or Key format');
        return {
          success: false,
          message: 'Invalid URL or Key format. URL must start with https:// and Key must be a valid Supabase anon key.',
        };
      }
      setSyncStatus('SYNCING');
      const { error } = await client.from('accounts').select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message?.toLowerCase().includes('relation "accounts" does not exist')) {
          addLog('WARN', 'DATABASE', 'Database reached, but SQL schema tables are missing. Please run migrations.');
          return {
            success: false,
            message: 'Database connected, but tables are missing! Please run the SQL schema migration in Supabase SQL editor first.',
          };
        }
        addLog('ERROR', 'DATABASE', `Supabase authentication/query error: ${error.message}`);
        return { success: false, message: error.message || 'Authentication error with Supabase.' };
      }

      saveStoredSupabaseConfig(url, key);
      setSupabaseClient(client);
      setSupabaseUrl(url);
      setSupabaseAnonKey(key);

      const [accRes, catRes, txRes, trRes] = await Promise.all([
        client.from('accounts').select('*').is('deleted_at', null),
        client.from('categories').select('*').is('deleted_at', null),
        client.from('transactions').select('*').is('deleted_at', null).order('transaction_date', { ascending: false }),
        client.from('transfers').select('*').is('deleted_at', null).order('transaction_date', { ascending: false }),
      ]);

      if (!accRes.error && accRes.data && accRes.data.length > 0) setAccounts(accRes.data as Account[]);
      if (!catRes.error && catRes.data && catRes.data.length > 0) setCategories(catRes.data as Category[]);
      if (!txRes.error && txRes.data) setTransactions(txRes.data as Transaction[]);
      if (!trRes.error && trRes.data) setTransfers(trRes.data as Transfer[]);

      setSyncStatus('SYNCED');
      addLog('SUCCESS', 'DATABASE', 'Successfully connected and synchronized with Supabase database', {
        accounts: accRes.data?.length ?? 0,
        categories: catRes.data?.length ?? 0,
        transactions: txRes.data?.length ?? 0,
        transfers: trRes.data?.length ?? 0,
      });
      return { success: true, message: 'Successfully connected and synchronized with Supabase database!' };
    } catch (err: any) {
      setSyncStatus('OFFLINE');
      addLog('ERROR', 'DATABASE', `Connection exception: ${err.message || 'Unknown error'}`);
      return { success: false, message: err.message || 'Connection failed.' };
    }
  }, [addLog]);

  const disconnectSupabase = useCallback(() => {
    clearStoredSupabaseConfig();
    setSupabaseClient(null);
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setSyncStatus('LOCAL');
    addLog('INFO', 'DATABASE', 'Disconnected from cloud database. Running in Offline Local Storage mode.');
  }, [addLog]);

  // Run System Diagnostic Test
  const runDiagnosticTest = useCallback(async () => {
    addLog('INFO', 'SYSTEM', 'Starting system diagnostic health check...');

    // 1. Client Environment Details
    if (typeof window !== 'undefined') {
      addLog('INFO', 'SYSTEM', 'Client Environment Specifications', {
        userAgent: navigator.userAgent,
        online: navigator.onLine,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      });
    }

    // 2. LocalStorage Read/Write Verification
    try {
      const testKey = '__moneyflow_rw_test__';
      const testVal = 'diag_' + Date.now();
      localStorage.setItem(testKey, testVal);
      const readVal = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      if (readVal === testVal) {
        addLog('SUCCESS', 'SYSTEM', 'LocalStorage read/write check passed');
      } else {
        addLog('ERROR', 'SYSTEM', 'LocalStorage verification mismatch');
      }
    } catch (e: any) {
      addLog('ERROR', 'SYSTEM', `LocalStorage read/write failure: ${e.message}`);
    }

    // 3. Database Ping & Counts Check
    if (supabaseClient) {
      addLog('INFO', 'DATABASE', `Pinging Supabase cloud endpoint: ${supabaseUrl}`);
      const startTime = performance.now();
      try {
        const { error, status } = await supabaseClient
          .from('accounts')
          .select('id')
          .limit(1);
        const latency = Math.round(performance.now() - startTime);

        if (error) {
          addLog('ERROR', 'DATABASE', `Supabase ping failed (Status: ${status}): ${error.message}`, error);
        } else {
          addLog('SUCCESS', 'DATABASE', `Supabase database ping passed in ${latency}ms (Status: ${status})`);
        }

        const [accCount, catCount, txCount, trCount] = await Promise.all([
          supabaseClient.from('accounts').select('*', { count: 'exact', head: true }).is('deleted_at', null),
          supabaseClient.from('categories').select('*', { count: 'exact', head: true }).is('deleted_at', null),
          supabaseClient.from('transactions').select('*', { count: 'exact', head: true }).is('deleted_at', null),
          supabaseClient.from('transfers').select('*', { count: 'exact', head: true }).is('deleted_at', null),
        ]);

        addLog('INFO', 'DATABASE', 'Supabase Cloud Table Counts', {
          accounts: accCount.count ?? 'N/A',
          categories: catCount.count ?? 'N/A',
          transactions: txCount.count ?? 'N/A',
          transfers: trCount.count ?? 'N/A',
        });
      } catch (err: any) {
        addLog('ERROR', 'DATABASE', `Supabase health check exception: ${err.message}`);
      }
    } else {
      addLog('WARN', 'DATABASE', 'Supabase Cloud client is not configured. Running in Local Storage Mode.');
    }

    // 4. Memory State Snapshot
    addLog('INFO', 'SYSTEM', 'Current Local State Snapshot', {
      accountsCount: accounts.length,
      categoriesCount: categories.length,
      transactionsCount: transactions.length,
      transfersCount: transfers.length,
      syncStatus,
    });

    addLog('SUCCESS', 'SYSTEM', 'Diagnostic health check completed.');
  }, [supabaseClient, supabaseUrl, accounts, categories, transactions, transfers, syncStatus, addLog]);

  // Sync and Realtime listeners when supabaseClient is active
  useEffect(() => {
    if (!supabaseClient) {
      setSyncStatus('LOCAL');
      return;
    }

    setSyncStatus('SYNCING');
    Promise.all([
      supabaseClient.from('accounts').select('*').is('deleted_at', null),
      supabaseClient.from('categories').select('*').is('deleted_at', null),
      supabaseClient.from('transactions').select('*').is('deleted_at', null).order('transaction_date', { ascending: false }),
      supabaseClient.from('transfers').select('*').is('deleted_at', null).order('transaction_date', { ascending: false }),
    ]).then(([accRes, catRes, txRes, trRes]) => {
      if (!accRes.error && accRes.data && accRes.data.length > 0) setAccounts(accRes.data as Account[]);
      if (!catRes.error && catRes.data && catRes.data.length > 0) setCategories(catRes.data as Category[]);
      if (!txRes.error && txRes.data) {
        if (txRes.data.length > 0) {
          setTransactions(txRes.data as Transaction[]);
          addLog('INFO', 'SYNC', `Loaded ${txRes.data.length} transactions from Supabase database`);
        } else {
          // Supabase is empty, sync local transactions up if any exist
          setTransactions(localTxs => {
            if (localTxs.length > 0) {
              addLog('INFO', 'SYNC', `Syncing ${localTxs.length} local transactions to cloud...`);
              supabaseClient.from('transactions').insert(localTxs).then(({ error }) => {
                if (error) {
                  addLog('WARN', 'DATABASE', `Cloud sync pending: ${error.message} (Code: ${error.code})`);
                } else {
                  addLog('SUCCESS', 'DATABASE', `Synchronized ${localTxs.length} transactions to Supabase!`);
                }
              });
            }
            return localTxs;
          });
        }
      }
      if (!trRes.error && trRes.data && trRes.data.length > 0) setTransfers(trRes.data as Transfer[]);
      setSyncStatus('SYNCED');
    }).catch((err: any) => {
      setSyncStatus('LOCAL');
      addLog('WARN', 'SYNC', `Supabase query notice: ${err?.message || 'Offline mode'}`);
    });

    const channel = supabaseClient
      .channel('moneyflow-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newTx = payload.new as Transaction;
          setTransactions(prev => [newTx, ...prev.filter(t => t.id !== newTx.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedTx = payload.new as Transaction;
          setTransactions(prev => prev.map(t => (t.id === updatedTx.id ? updatedTx : t)));
        } else if (payload.eventType === 'DELETE') {
          const oldTx = payload.old as { id: string };
          setTransactions(prev => prev.filter(t => t.id !== oldTx.id));
        }
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [supabaseClient, addLog]);

  // Save to localStorage when state changes (guarded against unhydrated initial renders)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile,
          accounts,
          categories,
          transactions,
          transfers,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [profile, accounts, categories, transactions, transfers]);

  // Derived Account Balances
  const accountsWithBalances = useMemo(() => {
    const balMap = calculateAccountBalances(accounts, transactions, transfers);
    return accounts.map(a => ({
      ...a,
      current_balance: balMap.get(a.id) ?? a.opening_balance,
    }));
  }, [accounts, transactions, transfers]);

  // Total Balance
  const totalBalance = useMemo(() => {
    return calculateTotalBalance(accounts, transactions, transfers);
  }, [accounts, transactions, transfers]);

  // Period Summary (based on selectedMonth 'YYYY-MM')
  const periodSummary = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const startDate = `${year}-${month}-01`;
    // Find last day of month
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    return calculatePeriodSummary(accounts, transactions, transfers, startDate, endDate);
  }, [accounts, transactions, transfers, selectedMonth]);

  // Category Expenses for current month
  const categoryExpenses = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const startDate = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    return calculateCategoryExpenses(transactions, categories, startDate, endDate);
  }, [transactions, categories, selectedMonth]);

  // Balance Trend for last 30 days
  const balanceTrend = useMemo(() => {
    return calculateBalanceHistory(accounts, transactions, 30);
  }, [accounts, transactions]);

  // Add Transaction
  const addTransaction = useCallback(
    async (txData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sync_version'>) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tx-${Date.now()}`;
      const now = new Date().toISOString();
      const newTx: Transaction = {
        ...txData,
        id,
        user_id: profile.id,
        created_at: now,
        updated_at: now,
        sync_version: 1,
      };

      setTransactions(prev => [newTx, ...prev]);

      if (supabaseClient) {
        setSyncStatus('SYNCING');
        try {
          const { error } = await supabaseClient.from('transactions').insert([newTx]);
          if (error) {
            console.error('Supabase insert error:', error);
            addLog('ERROR', 'DATABASE', `Supabase insert rejected: ${error.message} (Code: ${error.code})`, error);
            setSyncStatus('LOCAL');
          } else {
            setSyncStatus('SYNCED');
            addLog('SUCCESS', 'TRANSACTION', `Recorded ${newTx.type}: ₹${newTx.amount} synced to cloud`);
          }
        } catch (err: any) {
          setSyncStatus('LOCAL');
          addLog('ERROR', 'DATABASE', `Network exception while saving: ${err.message}`);
        }
      } else {
        addLog('SUCCESS', 'TRANSACTION', `Recorded ${newTx.type}: ₹${newTx.amount} saved locally`);
      }

      return id;
    },
    [profile.id, supabaseClient, addLog]
  );

  // Update Transaction
  const updateTransaction = useCallback(
    async (id: string, updates: Partial<Transaction>) => {
      const now = new Date().toISOString();
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates, updated_at: now } : t))
      );

      if (supabaseClient) {
        setSyncStatus('SYNCING');
        try {
          const { error } = await supabaseClient
            .from('transactions')
            .update({ ...updates, updated_at: now })
            .eq('id', id);
          if (error) {
            addLog('ERROR', 'DATABASE', `Supabase update rejected: ${error.message}`);
            setSyncStatus('LOCAL');
          } else {
            setSyncStatus('SYNCED');
          }
        } catch {
          setSyncStatus('LOCAL');
        }
      }
    },
    [supabaseClient, addLog]
  );

  // Soft Delete Transaction
  const deleteTransaction = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, deleted_at: now, updated_at: now } : t))
      );

      if (supabaseClient) {
        setSyncStatus('SYNCING');
        try {
          const { error } = await supabaseClient
            .from('transactions')
            .update({ deleted_at: now, updated_at: now })
            .eq('id', id);
          if (error) {
            addLog('ERROR', 'DATABASE', `Supabase delete rejected: ${error.message}`);
            setSyncStatus('LOCAL');
          } else {
            setSyncStatus('SYNCED');
          }
        } catch {
          setSyncStatus('LOCAL');
        }
      }
    },
    [supabaseClient, addLog]
  );

  // Add Transfer
  const addTransfer = useCallback(
    async (trData: Omit<Transfer, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'sync_version'>) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tr-${Date.now()}`;
      const now = new Date().toISOString();
      const newTr: Transfer = {
        ...trData,
        id,
        user_id: profile.id,
        created_at: now,
        updated_at: now,
        sync_version: 1,
      };

      setTransfers(prev => [newTr, ...prev]);

      if (supabaseClient) {
        setSyncStatus('SYNCING');
        try {
          const { error } = await supabaseClient.from('transfers').insert([newTr]);
          if (error) {
            addLog('ERROR', 'DATABASE', `Supabase transfer insert rejected: ${error.message}`);
            setSyncStatus('LOCAL');
          } else {
            setSyncStatus('SYNCED');
            addLog('SUCCESS', 'TRANSACTION', `Transferred ₹${newTr.amount} synced to cloud`);
          }
        } catch {
          setSyncStatus('LOCAL');
        }
      } else {
        addLog('SUCCESS', 'TRANSACTION', `Transferred ₹${newTr.amount} saved locally`);
      }

      return id;
    },
    [profile.id, supabaseClient, addLog]
  );

  // Soft Delete Transfer
  const deleteTransfer = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      setTransfers(prev =>
        prev.map(t => (t.id === id ? { ...t, deleted_at: now, updated_at: now } : t))
      );

      if (supabaseClient) {
        setSyncStatus('SYNCING');
        try {
          await supabaseClient
            .from('transfers')
            .update({ deleted_at: now, updated_at: now })
            .eq('id', id);
          setSyncStatus('SYNCED');
        } catch {
          setSyncStatus('OFFLINE');
        }
      }
    },
    []
  );

  // Add Account (Money Location)
  const addAccount = useCallback(
    async (accData: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `acc-${Date.now()}`;
      const now = new Date().toISOString();
      const newAcc: Account = {
        ...accData,
        id,
        user_id: profile.id,
        created_at: now,
        updated_at: now,
      };

      setAccounts(prev => [...prev, newAcc]);

      if (supabaseClient) {
        setSyncStatus('SYNCING');
        try {
          await supabaseClient.from('accounts').insert([newAcc]);
          setSyncStatus('SYNCED');
        } catch {
          setSyncStatus('OFFLINE');
        }
      }

      return id;
    },
    [profile.id]
  );

  // Update Account
  const updateAccount = useCallback(
    async (id: string, updates: Partial<Account>) => {
      const now = new Date().toISOString();
      setAccounts(prev =>
        prev.map(a => (a.id === id ? { ...a, ...updates, updated_at: now } : a))
      );

      if (supabaseClient) {
        try {
          await supabaseClient
            .from('accounts')
            .update({ ...updates, updated_at: now })
            .eq('id', id);
        } catch {
          // ignore
        }
      }
    },
    []
  );

  // Soft Delete Account
  const deleteAccount = useCallback(
    async (id: string) => {
      const now = new Date().toISOString();
      setAccounts(prev =>
        prev.map(a => (a.id === id ? { ...a, deleted_at: now, updated_at: now } : a))
      );

      if (supabaseClient) {
        try {
          await supabaseClient
            .from('accounts')
            .update({ deleted_at: now, updated_at: now })
            .eq('id', id);
        } catch {
          // ignore
        }
      }
    },
    []
  );

  // Add Category
  const addCategory = useCallback(
    async (catData: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`;
      const now = new Date().toISOString();
      const newCat: Category = {
        ...catData,
        id,
        user_id: profile.id,
        created_at: now,
        updated_at: now,
      };

      setCategories(prev => [...prev, newCat]);

      if (supabaseClient) {
        try {
          await supabaseClient.from('categories').insert([newCat]);
        } catch {
          // ignore
        }
      }

      return id;
    },
    [profile.id]
  );

  // Update Profile
  const updateProfile = useCallback(
    async (updates: Partial<Profile>) => {
      const now = new Date().toISOString();
      const updated = { ...profile, ...updates, updated_at: now };
      setProfile(updated);

      if (supabaseClient) {
        try {
          await supabaseClient.from('profiles').update(updates).eq('id', profile.id);
        } catch {
          // ignore
        }
      }
    },
    [profile]
  );

  // Open transaction modal
  const openTransactionModal = useCallback(
    (type: 'CREDIT' | 'DEBIT' | 'TRANSFER' = 'DEBIT', tx: Transaction | null = null) => {
      setTransactionModalInitialType(type);
      setEditingTransaction(tx);
      setIsTransactionModalOpen(true);
    },
    []
  );

  const closeTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  }, []);

  // Quick spend modal
  const openQuickSpend = useCallback(() => setIsQuickSpendOpen(true), []);
  const closeQuickSpend = useCallback(() => setIsQuickSpendOpen(false), []);

  // Delete modal
  const requestDelete = useCallback((item: { id: string; type: 'transaction' | 'transfer' | 'account'; title: string }) => {
    setDeleteItem(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteItem) return;
    if (deleteItem.type === 'transaction') {
      await deleteTransaction(deleteItem.id);
    } else if (deleteItem.type === 'transfer') {
      await deleteTransfer(deleteItem.id);
    } else if (deleteItem.type === 'account') {
      await deleteAccount(deleteItem.id);
    }
    setDeleteItem(null);
  }, [deleteItem, deleteTransaction, deleteTransfer, deleteAccount]);

  const cancelDelete = useCallback(() => {
    setDeleteItem(null);
  }, []);

  // Export Data
  const exportData = useCallback(
    (format: 'json' | 'csv') => {
      const nowStr = new Date().toISOString().slice(0, 10);
      if (format === 'json') {
        const payload = {
          exportType: 'MoneyFlow Backup',
          version: 1,
          createdAt: new Date().toISOString(),
          currency: profile.currency,
          profile,
          accounts: accounts.filter(a => !a.deleted_at),
          categories: categories.filter(c => !c.deleted_at),
          transactions: transactions.filter(t => !t.deleted_at),
          transfers: transfers.filter(tr => !tr.deleted_at),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneyflow-backup-${nowStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // CSV Export of transactions
        const headers = ['Date', 'Type', 'Amount', 'Description', 'Merchant_Source', 'Account', 'Category', 'Note'];
        const accMap = new Map(accounts.map(a => [a.id, a.name]));
        const catMap = new Map(categories.map(c => [c.id, c.name]));
        
        const rows = transactions
          .filter(t => !t.deleted_at)
          .map(t => [
            t.transaction_date,
            t.type === 'CREDIT' ? 'Money In' : 'Money Out',
            t.amount,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            `"${(t.source_or_merchant || '').replace(/"/g, '""')}"`,
            `"${accMap.get(t.account_id) || 'Unknown'}"`,
            `"${catMap.get(t.category_id || '') || 'Uncategorized'}"`,
            `"${(t.note || '').replace(/"/g, '""')}"`,
          ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneyflow-transactions-${nowStr}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [profile, accounts, categories, transactions, transfers]
  );

  // Import Backup
  const importBackup = useCallback((jsonContent: string) => {
    try {
      const data = JSON.parse(jsonContent);
      if (data.accounts && Array.isArray(data.accounts)) setAccounts(data.accounts);
      if (data.categories && Array.isArray(data.categories)) setCategories(data.categories);
      if (data.transactions && Array.isArray(data.transactions)) setTransactions(data.transactions);
      if (data.transfers && Array.isArray(data.transfers)) setTransfers(data.transfers);
      if (data.profile) setProfile(data.profile);
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetToDefaults = useCallback(() => {
    setProfile(defaultProfile);
    setAccounts(defaultAccounts);
    setCategories(defaultCategories);
    setTransactions(defaultTransactions);
    setTransfers(defaultTransfers);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('moneyflow_state_v1');
  }, []);

  return (
    <MoneyFlowContext.Provider
      value={{
        profile,
        updateProfile,
        accounts: accountsWithBalances,
        categories: categories.filter(c => !c.deleted_at),
        transactions: transactions.filter(t => !t.deleted_at),
        transfers: transfers.filter(tr => !tr.deleted_at),
        syncStatus,
        isLive,
        supabaseUrl,
        supabaseAnonKey,
        connectSupabase,
        disconnectSupabase,
        selectedMonth,
        setSelectedMonth,
        currency: profile.currency,
        totalBalance,
        periodSummary,
        categoryExpenses,
        balanceTrend,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addTransfer,
        deleteTransfer,
        addAccount,
        updateAccount,
        deleteAccount,
        addCategory,
        isTransactionModalOpen,
        transactionModalInitialType,
        editingTransaction,
        openTransactionModal,
        closeTransactionModal,
        isQuickSpendOpen,
        openQuickSpend,
        closeQuickSpend,
        deleteItem,
        requestDelete,
        confirmDelete,
        cancelDelete,
        exportData,
        importBackup,
        resetToDefaults,
        debugLogs,
        addLog,
        clearLogs,
        runDiagnosticTest,
      }}
    >
      {children}
    </MoneyFlowContext.Provider>
  );
};

export const useMoneyFlow = () => {
  const context = useContext(MoneyFlowContext);
  if (!context) {
    throw new Error('useMoneyFlow must be used within a MoneyFlowProvider');
  }
  return context;
};
