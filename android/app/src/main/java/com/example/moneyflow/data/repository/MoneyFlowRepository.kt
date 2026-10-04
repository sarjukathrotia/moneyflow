package com.example.moneyflow.data.repository

import com.example.moneyflow.domain.model.AccountType
import com.example.moneyflow.domain.model.CategoryType
import com.example.moneyflow.domain.model.MoneyAccount
import com.example.moneyflow.domain.model.MoneyCategory
import com.example.moneyflow.domain.model.MoneyTransaction
import com.example.moneyflow.domain.model.MoneyTransfer
import com.example.moneyflow.domain.model.SyncStatus
import com.example.moneyflow.domain.model.TransactionType
import com.example.moneyflow.domain.usecase.BalanceUseCases
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

/**
 * Offline-first repository managing local and synced financial state.
 */
class MoneyFlowRepository private constructor() {

    private val _accounts = MutableStateFlow<List<MoneyAccount>>(emptyList())
    val accounts: StateFlow<List<MoneyAccount>> = _accounts.asStateFlow()

    private val _categories = MutableStateFlow<List<MoneyCategory>>(emptyList())
    val categories: StateFlow<List<MoneyCategory>> = _categories.asStateFlow()

    private val _transactions = MutableStateFlow<List<MoneyTransaction>>(emptyList())
    val transactions: StateFlow<List<MoneyTransaction>> = _transactions.asStateFlow()

    private val _transfers = MutableStateFlow<List<MoneyTransfer>>(emptyList())
    val transfers: StateFlow<List<MoneyTransfer>> = _transfers.asStateFlow()

    private val _syncStatus = MutableStateFlow(SyncStatus.SYNCED)
    val syncStatus: StateFlow<SyncStatus> = _syncStatus.asStateFlow()

    init {
        seedInitialData()
    }

    private fun seedInitialData() {
        val initialAccounts = listOf(
            MoneyAccount(id = "acc-cash", name = "Cash", type = AccountType.CASH, openingBalance = 0.0, color = "#16A34A"),
            MoneyAccount(id = "acc-bank", name = "Bank Account", type = AccountType.BANK, openingBalance = 0.0, color = "#2563EB"),
            MoneyAccount(id = "acc-upi", name = "UPI", type = AccountType.UPI, openingBalance = 0.0, color = "#7C3AED")
        )

        val initialCategories = listOf(
            // Income
            MoneyCategory(id = "cat-salary", name = "Salary", type = CategoryType.INCOME, color = "#16A34A", isDefault = true),
            MoneyCategory(id = "cat-freelance", name = "Freelance", type = CategoryType.INCOME, color = "#10B981", isDefault = true),
            MoneyCategory(id = "cat-gift", name = "Gift", type = CategoryType.INCOME, color = "#0D9488", isDefault = true),
            MoneyCategory(id = "cat-cashback", name = "Cashback", type = CategoryType.INCOME, color = "#2563EB", isDefault = true),
            MoneyCategory(id = "cat-refund", name = "Refund", type = CategoryType.INCOME, color = "#0284C7", isDefault = true),
            MoneyCategory(id = "cat-other-income", name = "Other Income", type = CategoryType.INCOME, color = "#6366F1", isDefault = true),
            // Expense
            MoneyCategory(id = "cat-food", name = "Food", type = CategoryType.EXPENSE, color = "#EA580C", isDefault = true),
            MoneyCategory(id = "cat-shopping", name = "Shopping", type = CategoryType.EXPENSE, color = "#DB2777", isDefault = true),
            MoneyCategory(id = "cat-travel", name = "Travel", type = CategoryType.EXPENSE, color = "#0284C7", isDefault = true),
            MoneyCategory(id = "cat-fuel", name = "Fuel", type = CategoryType.EXPENSE, color = "#D97706", isDefault = true),
            MoneyCategory(id = "cat-bills", name = "Bills", type = CategoryType.EXPENSE, color = "#DC2626", isDefault = true),
            MoneyCategory(id = "cat-entertainment", name = "Entertainment", type = CategoryType.EXPENSE, color = "#9333EA", isDefault = true),
            MoneyCategory(id = "cat-health", name = "Health", type = CategoryType.EXPENSE, color = "#E11D48", isDefault = true),
            MoneyCategory(id = "cat-subscriptions", name = "Subscriptions", type = CategoryType.EXPENSE, color = "#7C3AED", isDefault = true),
            MoneyCategory(id = "cat-other-expense", name = "Other", type = CategoryType.EXPENSE, color = "#6B7280", isDefault = true)
        )

        _categories.value = initialCategories
        _transactions.value = emptyList()
        _transfers.value = emptyList()

        recomputeAccountBalances(initialAccounts, emptyList(), emptyList())
    }

    private fun recomputeAccountBalances(
        rawAccounts: List<MoneyAccount> = _accounts.value,
        txs: List<MoneyTransaction> = _transactions.value,
        trs: List<MoneyTransfer> = _transfers.value
    ) {
        val balances = BalanceUseCases.calculateAccountBalances(rawAccounts, txs, trs)
        _accounts.value = rawAccounts.map {
            it.copy(currentBalance = balances[it.id] ?: it.openingBalance)
        }
    }

    fun getTotalBalance(): Double {
        return BalanceUseCases.calculateTotalBalance(_accounts.value, _transactions.value, _transfers.value)
    }

    fun addTransaction(
        type: TransactionType,
        amount: Double,
        sourceOrMerchant: String,
        categoryId: String?,
        accountId: String,
        note: String? = null,
        date: String = getTodayDate()
    ): String {
        val id = UUID.randomUUID().toString()
        val newTx = MoneyTransaction(
            id = id,
            accountId = accountId,
            type = type,
            amount = amount,
            categoryId = categoryId,
            description = sourceOrMerchant,
            sourceOrMerchant = sourceOrMerchant,
            note = note,
            transactionDate = date,
            createdAt = Date().toString(),
            updatedAt = Date().toString(),
            syncStatus = SyncStatus.SYNCED
        )

        val updated = listOf(newTx) + _transactions.value
        _transactions.value = updated
        recomputeAccountBalances(txs = updated)
        return id
    }

    /**
     * Section 26: Quick Expense Mode (3 seconds entry)
     */
    fun quickSpend(amount: Double, merchant: String): String {
        val defaultAccount = _accounts.value.firstOrNull()?.id ?: "acc-cash"
        val defaultCategory = _categories.value.firstOrNull { it.type == CategoryType.EXPENSE }?.id
        return addTransaction(
            type = TransactionType.DEBIT,
            amount = amount,
            sourceOrMerchant = merchant,
            categoryId = defaultCategory,
            accountId = defaultAccount,
            date = getTodayDate()
        )
    }

    fun addTransfer(
        fromAccountId: String,
        toAccountId: String,
        amount: Double,
        note: String? = null,
        date: String = getTodayDate()
    ): String {
        val id = UUID.randomUUID().toString()
        val newTr = MoneyTransfer(
            id = id,
            fromAccountId = fromAccountId,
            toAccountId = toAccountId,
            amount = amount,
            note = note,
            transactionDate = date,
            createdAt = Date().toString(),
            updatedAt = Date().toString(),
            syncStatus = SyncStatus.SYNCED
        )

        val updated = listOf(newTr) + _transfers.value
        _transfers.value = updated
        recomputeAccountBalances(trs = updated)
        return id
    }

    fun addAccount(
        name: String,
        type: AccountType,
        openingBalance: Double,
        color: String = "#2563EB"
    ): String {
        val id = UUID.randomUUID().toString()
        val newAcc = MoneyAccount(
            id = id,
            name = name,
            type = type,
            openingBalance = openingBalance,
            currentBalance = openingBalance,
            color = color
        )

        val updated = _accounts.value + newAcc
        recomputeAccountBalances(rawAccounts = updated)
        return id
    }

    fun deleteTransaction(id: String) {
        val now = Date().toString()
        val updated = _transactions.value.map {
            if (it.id == id) it.copy(deletedAt = now) else it
        }
        _transactions.value = updated
        recomputeAccountBalances(txs = updated)
    }

    fun deleteAccount(id: String) {
        val updated = _accounts.value.map {
            if (it.id == id) it.copy(isArchived = true) else it
        }
        recomputeAccountBalances(rawAccounts = updated)
    }

    fun resetToCleanState() {
        seedInitialData()
    }

    private fun getTodayDate(): String {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        return sdf.format(Date())
    }

    companion object {
        @Volatile
        private var INSTANCE: MoneyFlowRepository? = null

        fun getInstance(): MoneyFlowRepository {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: MoneyFlowRepository().also { INSTANCE = it }
            }
        }
    }
}
