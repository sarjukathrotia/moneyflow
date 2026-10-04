package com.example.moneyflow.domain.model

enum class AccountType {
    CASH, BANK, UPI, WALLET, CREDIT_CARD, OTHER
}

enum class TransactionType {
    CREDIT, DEBIT
}

enum class CategoryType {
    INCOME, EXPENSE, BOTH
}

enum class SyncStatus {
    PENDING, SYNCED, FAILED
}

data class MoneyAccount(
    val id: String,
    val name: String,
    val type: AccountType,
    val currency: String = "INR",
    val openingBalance: Double = 0.0,
    val currentBalance: Double = 0.0,
    val color: String = "#2563EB",
    val icon: String? = null,
    val isArchived: Boolean = false,
)

data class MoneyCategory(
    val id: String,
    val name: String,
    val type: CategoryType,
    val icon: String? = null,
    val color: String = "#6B7280",
    val isDefault: Boolean = false,
)

data class MoneyTransaction(
    val id: String,
    val accountId: String,
    val type: TransactionType,
    val amount: Double,
    val categoryId: String? = null,
    val description: String? = null,
    val sourceOrMerchant: String? = null,
    val note: String? = null,
    val transactionDate: String, // YYYY-MM-DD
    val transactionTime: String? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
    val deletedAt: String? = null,
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val syncVersion: Long = 1,
)

data class MoneyTransfer(
    val id: String,
    val fromAccountId: String,
    val toAccountId: String,
    val amount: Double,
    val note: String? = null,
    val transactionDate: String, // YYYY-MM-DD
    val createdAt: String = "",
    val updatedAt: String = "",
    val deletedAt: String? = null,
    val syncStatus: SyncStatus = SyncStatus.SYNCED,
    val syncVersion: Long = 1,
)

data class PeriodSummary(
    val startingBalance: Double,
    val totalIncome: Double,
    val totalExpense: Double,
    val netSavings: Double,
    val endingBalance: Double,
)

data class CategorySpending(
    val categoryId: String,
    val categoryName: String,
    val color: String,
    val icon: String,
    val amount: Double,
    val percentage: Int,
    val count: Int,
)
