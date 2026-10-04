package com.example.moneyflow.domain.usecase

import com.example.moneyflow.domain.model.MoneyAccount
import com.example.moneyflow.domain.model.MoneyTransaction
import com.example.moneyflow.domain.model.MoneyTransfer
import com.example.moneyflow.domain.model.PeriodSummary
import com.example.moneyflow.domain.model.TransactionType
import java.text.NumberFormat
import java.util.Locale
import kotlin.math.roundToInt

object BalanceUseCases {

    /**
     * Calculates the overall total balance across all active accounts.
     * Current Balance = Sum(Opening Balances) + Sum(CREDIT) - Sum(DEBIT)
     * Transfers between accounts NEVER alter the overall total balance.
     */
    fun calculateTotalBalance(
        accounts: List<MoneyAccount>,
        transactions: List<MoneyTransaction>,
        transfers: List<MoneyTransfer> = emptyList()
    ): Double {
        val activeAccounts = accounts.filter { !it.isArchived }
        val activeAccountIds = activeAccounts.map { it.id }.toSet()

        val totalOpening = activeAccounts.sumOf { it.openingBalance }

        val activeTransactions = transactions.filter {
            it.deletedAt == null && activeAccountIds.contains(it.accountId)
        }

        val totalCredit = activeTransactions
            .filter { it.type == TransactionType.CREDIT }
            .sumOf { it.amount }

        val totalDebit = activeTransactions
            .filter { it.type == TransactionType.DEBIT }
            .sumOf { it.amount }

        return ((totalOpening + totalCredit - totalDebit) * 100.0).roundToInt() / 100.0
    }

    /**
     * Calculates individual balances for each money location.
     * Cash = Opening + Credits - Debits - Transfers Out + Transfers In
     */
    fun calculateAccountBalances(
        accounts: List<MoneyAccount>,
        transactions: List<MoneyTransaction>,
        transfers: List<MoneyTransfer>
    ): Map<String, Double> {
        val balances = mutableMapOf<String, Double>()

        for (acc in accounts) {
            balances[acc.id] = acc.openingBalance
        }

        for (t in transactions) {
            if (t.deletedAt != null) continue
            val current = balances[t.accountId] ?: continue
            if (t.type == TransactionType.CREDIT) {
                balances[t.accountId] = current + t.amount
            } else if (t.type == TransactionType.DEBIT) {
                balances[t.accountId] = current - t.amount
            }
        }

        for (tr in transfers) {
            if (tr.deletedAt != null) continue
            val fromBal = balances[tr.fromAccountId]
            if (fromBal != null) {
                balances[tr.fromAccountId] = fromBal - tr.amount
            }
            val toBal = balances[tr.toAccountId]
            if (toBal != null) {
                balances[tr.toAccountId] = toBal + tr.amount
            }
        }

        return balances.mapValues { ((it.value * 100.0).roundToInt() / 100.0) }
    }

    /**
     * Monthly Period Summary
     */
    fun calculatePeriodSummary(
        accounts: List<MoneyAccount>,
        transactions: List<MoneyTransaction>,
        transfers: List<MoneyTransfer>,
        startDate: String,
        endDate: String
    ): PeriodSummary {
        val activeAccounts = accounts.filter { !it.isArchived }
        val activeAccountIds = activeAccounts.map { it.id }.toSet()

        val priorTransactions = transactions.filter {
            it.deletedAt == null && activeAccountIds.contains(it.accountId) && it.transactionDate < startDate
        }
        val totalOpening = activeAccounts.sumOf { it.openingBalance }
        val priorCredit = priorTransactions.filter { it.type == TransactionType.CREDIT }.sumOf { it.amount }
        val priorDebit = priorTransactions.filter { it.type == TransactionType.DEBIT }.sumOf { it.amount }
        val startingBalance = ((totalOpening + priorCredit - priorDebit) * 100.0).roundToInt() / 100.0

        val periodTransactions = transactions.filter {
            it.deletedAt == null &&
            activeAccountIds.contains(it.accountId) &&
            it.transactionDate >= startDate &&
            it.transactionDate <= endDate
        }

        val totalIncome = periodTransactions.filter { it.type == TransactionType.CREDIT }.sumOf { it.amount }
        val totalExpense = periodTransactions.filter { it.type == TransactionType.DEBIT }.sumOf { it.amount }
        val netSavings = ((totalIncome - totalExpense) * 100.0).roundToInt() / 100.0
        val endingBalance = ((startingBalance + netSavings) * 100.0).roundToInt() / 100.0

        return PeriodSummary(
            startingBalance = startingBalance,
            totalIncome = ((totalIncome * 100.0).roundToInt() / 100.0),
            totalExpense = ((totalExpense * 100.0).roundToInt() / 100.0),
            netSavings = netSavings,
            endingBalance = endingBalance
        )
    }

    /**
     * Formats currency with ₹ symbol and commas (e.g. ₹41,400)
     */
    fun formatCurrency(amount: Double, currency: String = "INR"): String {
        val format = NumberFormat.getNumberInstance(Locale("en", "IN"))
        format.maximumFractionDigits = 2
        format.minimumFractionDigits = if (amount % 1.0 == 0.0) 0 else 2

        val abs = kotlin.math.abs(amount)
        val sign = if (amount < 0) "-" else ""
        val symbol = if (currency == "INR") "₹" else "$currency "

        return "$sign$symbol${format.format(abs)}"
    }
}
