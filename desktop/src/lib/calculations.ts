import { Account, Category, CategorySpending, PeriodSummary, Transaction, Transfer, BalanceTrendPoint } from '../types/moneyflow';

/**
 * Calculates the current total balance across all active accounts.
 *
 * Current Balance = Sum(Opening Balances) + Sum(CREDIT) - Sum(DEBIT)
 * NOTE: Transfers between own accounts NEVER alter the overall total balance.
 */
export function calculateTotalBalance(
  accounts: Account[],
  transactions: Transaction[],
  _transfers: Transfer[] = []
): number {
  const activeAccounts = accounts.filter(a => !a.deleted_at);
  const activeAccountIds = new Set(activeAccounts.map(a => a.id));

  const totalOpening = activeAccounts.reduce(
    (sum, acc) => sum + (Number(acc.opening_balance) || 0),
    0
  );

  const activeTransactions = transactions.filter(
    t => !t.deleted_at && activeAccountIds.has(t.account_id)
  );

  const totalCredit = activeTransactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalDebit = activeTransactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return Math.round((totalOpening + totalCredit - totalDebit) * 100) / 100;
}

/**
 * Calculates individual balances for each account, taking into account:
 * - Opening balance
 * - Credits to this account
 * - Debits from this account
 * - Transfers into this account (+)
 * - Transfers out of this account (-)
 */
export function calculateAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
  transfers: Transfer[]
): Map<string, number> {
  const balances = new Map<string, number>();

  // 1. Initialize with opening balances
  for (const acc of accounts) {
    if (!acc.deleted_at) {
      balances.set(acc.id, Number(acc.opening_balance) || 0);
    }
  }

  // 2. Apply Credits and Debits
  for (const t of transactions) {
    if (t.deleted_at) continue;
    const current = balances.get(t.account_id);
    if (current !== undefined) {
      const amount = Number(t.amount) || 0;
      if (t.type === 'CREDIT') {
        balances.set(t.account_id, current + amount);
      } else if (t.type === 'DEBIT') {
        balances.set(t.account_id, current - amount);
      }
    }
  }

  // 3. Apply Transfers
  for (const tr of transfers) {
    if (tr.deleted_at) continue;
    const amount = Number(tr.amount) || 0;

    const fromBal = balances.get(tr.from_account_id);
    if (fromBal !== undefined) {
      balances.set(tr.from_account_id, fromBal - amount);
    }

    const toBal = balances.get(tr.to_account_id);
    if (toBal !== undefined) {
      balances.set(tr.to_account_id, toBal + amount);
    }
  }

  // Round results
  for (const [id, val] of balances.entries()) {
    balances.set(id, Math.round(val * 100) / 100);
  }

  return balances;
}

/**
 * Calculates financial summary for a given time period [startDate, endDate] (inclusive).
 */
export function calculatePeriodSummary(
  accounts: Account[],
  transactions: Transaction[],
  transfers: Transfer[],
  startDate: string,
  endDate: string
): PeriodSummary {
  const activeAccounts = accounts.filter(a => !a.deleted_at);
  const activeAccountIds = new Set(activeAccounts.map(a => a.id));

  // Transactions before startDate determine starting balance
  const priorTransactions = transactions.filter(
    t => !t.deleted_at && activeAccountIds.has(t.account_id) && t.transaction_date < startDate
  );
  const totalOpening = activeAccounts.reduce(
    (sum, acc) => sum + (Number(acc.opening_balance) || 0),
    0
  );
  const priorCredit = priorTransactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const priorDebit = priorTransactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const startingBalance = Math.round((totalOpening + priorCredit - priorDebit) * 100) / 100;

  // Transactions within period
  const periodTransactions = transactions.filter(
    t =>
      !t.deleted_at &&
      activeAccountIds.has(t.account_id) &&
      t.transaction_date >= startDate &&
      t.transaction_date <= endDate
  );

  const totalIncome = periodTransactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = periodTransactions
    .filter(t => t.type === 'DEBIT')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = Math.round((totalIncome - totalExpense) * 100) / 100;
  const endingBalance = Math.round((startingBalance + netSavings) * 100) / 100;

  const periodTransfers = transfers.filter(
    tr =>
      !tr.deleted_at &&
      tr.transaction_date >= startDate &&
      tr.transaction_date <= endDate
  );

  return {
    startingBalance,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpense: Math.round(totalExpense * 100) / 100,
    netSavings,
    endingBalance,
    transferCount: periodTransfers.length,
  };
}

/**
 * Calculates category-wise expense breakdown.
 */
export function calculateCategoryExpenses(
  transactions: Transaction[],
  categories: Category[],
  startDate?: string,
  endDate?: string
): CategorySpending[] {
  const categoryMap = new Map<string, Category>();
  for (const c of categories) {
    categoryMap.set(c.id, c);
  }

  let filtered = transactions.filter(t => !t.deleted_at && t.type === 'DEBIT');
  if (startDate) {
    filtered = filtered.filter(t => t.transaction_date >= startDate);
  }
  if (endDate) {
    filtered = filtered.filter(t => t.transaction_date <= endDate);
  }

  const totalExpense = filtered.reduce((sum, t) => sum + Number(t.amount), 0);

  const spendMap = new Map<string, { amount: number; count: number }>();
  for (const t of filtered) {
    const catId = t.category_id || 'uncategorized';
    const entry = spendMap.get(catId) || { amount: 0, count: 0 };
    entry.amount += Number(t.amount);
    entry.count += 1;
    spendMap.set(catId, entry);
  }

  const result: CategorySpending[] = [];
  for (const [catId, data] of spendMap.entries()) {
    const cat = categoryMap.get(catId);
    const categoryName = cat ? cat.name : 'Other / Uncategorized';
    const color = cat?.color || '#6B7280';
    const icon = cat?.icon || 'HelpCircle';
    const percentage = totalExpense > 0 ? Math.round((data.amount / totalExpense) * 100) : 0;

    result.push({
      categoryId: catId,
      categoryName,
      color,
      icon,
      amount: Math.round(data.amount * 100) / 100,
      percentage,
      count: data.count,
    });
  }

  // Sort descending by amount
  return result.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculates daily balance timeline for trend charts over the last N days.
 */
export function calculateBalanceHistory(
  accounts: Account[],
  transactions: Transaction[],
  days: number = 30
): BalanceTrendPoint[] {
  const result: BalanceTrendPoint[] = [];
  const now = new Date();

  // Generate date list
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }

  const activeAccounts = accounts.filter(a => !a.deleted_at);
  const activeAccountIds = new Set(activeAccounts.map(a => a.id));
  const totalOpening = activeAccounts.reduce(
    (sum, acc) => sum + (Number(acc.opening_balance) || 0),
    0
  );

  const activeTransactions = transactions.filter(
    t => !t.deleted_at && activeAccountIds.has(t.account_id)
  );

  for (const d of dates) {
    const upToDateTxs = activeTransactions.filter(t => t.transaction_date <= d);
    const dayTxs = activeTransactions.filter(t => t.transaction_date === d);

    const creditUpTo = upToDateTxs
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const debitUpTo = upToDateTxs
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const dayCredit = dayTxs
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const dayDebit = dayTxs
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    result.push({
      date: d,
      balance: Math.round((totalOpening + creditUpTo - debitUpTo) * 100) / 100,
      income: Math.round(dayCredit * 100) / 100,
      expense: Math.round(dayDebit * 100) / 100,
    });
  }

  return result;
}

/**
 * Currency formatter with Indian Rupee symbol default
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  let formattedNumber = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
  });

  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `;
  return `${isNegative ? '-' : ''}${symbol}${formattedNumber}`;
}
