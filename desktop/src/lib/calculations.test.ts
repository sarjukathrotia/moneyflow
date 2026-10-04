import { describe, it, expect } from 'vitest';
import {
  calculateTotalBalance,
  calculateAccountBalances,
  calculatePeriodSummary,
  calculateCategoryExpenses,
  formatCurrency,
} from './calculations';
import { Account, Category, Transaction, Transfer } from '../types/moneyflow';

describe('MoneyFlow Accounting and Calculations', () => {
  const dummyUserId = 'user-123';

  it('Section 70: Balance Test Case', () => {
    // Given:
    // Opening balance = ₹1,000
    // Credit = ₹500
    // Debit = ₹200
    // Transfer = ₹300
    // Expected Overall balance = ₹1,300

    const accounts: Account[] = [
      {
        id: 'acc-cash',
        user_id: dummyUserId,
        name: 'Cash',
        type: 'CASH',
        currency: 'INR',
        opening_balance: 1000,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
      {
        id: 'acc-bank',
        user_id: dummyUserId,
        name: 'HDFC Bank',
        type: 'BANK',
        currency: 'INR',
        opening_balance: 0,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
    ];

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        user_id: dummyUserId,
        account_id: 'acc-cash',
        type: 'CREDIT',
        amount: 500,
        transaction_date: '2026-10-02',
        created_at: '2026-10-02T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
      },
      {
        id: 'tx-2',
        user_id: dummyUserId,
        account_id: 'acc-cash',
        type: 'DEBIT',
        amount: 200,
        transaction_date: '2026-10-03',
        created_at: '2026-10-03T00:00:00Z',
        updated_at: '2026-10-03T00:00:00Z',
      },
    ];

    const transfers: Transfer[] = [
      {
        id: 'tr-1',
        user_id: dummyUserId,
        from_account_id: 'acc-cash',
        to_account_id: 'acc-bank',
        amount: 300,
        transaction_date: '2026-10-04',
        created_at: '2026-10-04T00:00:00Z',
        updated_at: '2026-10-04T00:00:00Z',
      },
    ];

    const total = calculateTotalBalance(accounts, transactions, transfers);
    expect(total).toBe(1300);

    const accountBalances = calculateAccountBalances(accounts, transactions, transfers);
    // Cash: 1000 opening + 500 in - 200 out - 300 transfer out = 1000
    expect(accountBalances.get('acc-cash')).toBe(1000);
    // Bank: 0 opening + 300 transfer in = 300
    expect(accountBalances.get('acc-bank')).toBe(300);
    // Sum of individual accounts must equal total
    expect(accountBalances.get('acc-cash')! + accountBalances.get('acc-bank')!).toBe(1300);
  });

  it('Section 71: Important Accounting Test Case', () => {
    // Starting:
    // Cash = ₹1,000
    // Bank = ₹2,000
    // Transfer: Cash → Bank ₹500
    // Expected:
    // Cash = ₹500
    // Bank = ₹2,500
    // Total = ₹3,000 (NOT ₹3,500)

    const accounts: Account[] = [
      {
        id: 'acc-cash',
        user_id: dummyUserId,
        name: 'Cash',
        type: 'CASH',
        currency: 'INR',
        opening_balance: 1000,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
      {
        id: 'acc-bank',
        user_id: dummyUserId,
        name: 'Bank',
        type: 'BANK',
        currency: 'INR',
        opening_balance: 2000,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
    ];

    const transfers: Transfer[] = [
      {
        id: 'tr-1',
        user_id: dummyUserId,
        from_account_id: 'acc-cash',
        to_account_id: 'acc-bank',
        amount: 500,
        transaction_date: '2026-10-04',
        created_at: '2026-10-04T00:00:00Z',
        updated_at: '2026-10-04T00:00:00Z',
      },
    ];

    const total = calculateTotalBalance(accounts, [], transfers);
    expect(total).toBe(3000);

    const balances = calculateAccountBalances(accounts, [], transfers);
    expect(balances.get('acc-cash')).toBe(500);
    expect(balances.get('acc-bank')).toBe(2500);
    expect(balances.get('acc-cash')! + balances.get('acc-bank')!).toBe(3000);
  });

  it('Soft deleted transactions and transfers must be completely excluded', () => {
    const accounts: Account[] = [
      {
        id: 'acc-1',
        user_id: dummyUserId,
        name: 'Cash',
        type: 'CASH',
        currency: 'INR',
        opening_balance: 500,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
    ];

    const transactions: Transaction[] = [
      {
        id: 'tx-active',
        user_id: dummyUserId,
        account_id: 'acc-1',
        type: 'CREDIT',
        amount: 200,
        transaction_date: '2026-10-02',
        created_at: '2026-10-02T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
      },
      {
        id: 'tx-deleted',
        user_id: dummyUserId,
        account_id: 'acc-1',
        type: 'CREDIT',
        amount: 9999,
        transaction_date: '2026-10-02',
        created_at: '2026-10-02T00:00:00Z',
        updated_at: '2026-10-02T00:00:00Z',
        deleted_at: '2026-10-03T00:00:00Z', // Deleted!
      },
    ];

    const total = calculateTotalBalance(accounts, transactions, []);
    expect(total).toBe(700); // 500 + 200
  });

  it('Monthly period summary reports correctly', () => {
    const accounts: Account[] = [
      {
        id: 'acc-1',
        user_id: dummyUserId,
        name: 'Main',
        type: 'BANK',
        currency: 'INR',
        opening_balance: 12000,
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-09-01T00:00:00Z',
      },
    ];

    const transactions: Transaction[] = [
      {
        id: 'tx-1',
        user_id: dummyUserId,
        account_id: 'acc-1',
        type: 'CREDIT',
        amount: 55000,
        transaction_date: '2026-10-05',
        created_at: '2026-10-05T00:00:00Z',
        updated_at: '2026-10-05T00:00:00Z',
      },
      {
        id: 'tx-2',
        user_id: dummyUserId,
        account_id: 'acc-1',
        type: 'DEBIT',
        amount: 25600,
        transaction_date: '2026-10-10',
        created_at: '2026-10-10T00:00:00Z',
        updated_at: '2026-10-10T00:00:00Z',
      },
    ];

    const summary = calculatePeriodSummary(
      accounts,
      transactions,
      [],
      '2026-10-01',
      '2026-10-31'
    );

    // Starting Balance: 12,000
    // Money In: 55,000
    // Money Out: 25,600
    // Ending Balance: 41,400
    expect(summary.startingBalance).toBe(12000);
    expect(summary.totalIncome).toBe(55000);
    expect(summary.totalExpense).toBe(25600);
    expect(summary.netSavings).toBe(29400);
    expect(summary.endingBalance).toBe(41400);
  });

  it('Clean Initial State: Zero balances and empty transactions', () => {
    const cleanAccounts: Account[] = [
      {
        id: 'acc-cash',
        user_id: dummyUserId,
        name: 'Cash',
        type: 'CASH',
        currency: 'INR',
        opening_balance: 0,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
      {
        id: 'acc-bank',
        user_id: dummyUserId,
        name: 'Bank Account',
        type: 'BANK',
        currency: 'INR',
        opening_balance: 0,
        created_at: '2026-10-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      },
    ];

    const total = calculateTotalBalance(cleanAccounts, [], []);
    expect(total).toBe(0);

    const accountBalances = calculateAccountBalances(cleanAccounts, [], []);
    expect(accountBalances.get('acc-cash')).toBe(0);
    expect(accountBalances.get('acc-bank')).toBe(0);

    const summary = calculatePeriodSummary(cleanAccounts, [], [], '2026-10-01', '2026-10-31');
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(0);
    expect(summary.netSavings).toBe(0);
    expect(summary.endingBalance).toBe(0);
    expect(summary.transferCount).toBe(0);

    const catExpenses = calculateCategoryExpenses([], []);
    expect(catExpenses).toHaveLength(0);
  });

  it('Formats currency with Indian Rupee symbol and commas', () => {
    expect(formatCurrency(1000)).toBe('₹1,000');
    expect(formatCurrency(41400)).toBe('₹41,400');
    expect(formatCurrency(0)).toBe('₹0');
    expect(formatCurrency(-300)).toBe('-₹300');
  });
});
