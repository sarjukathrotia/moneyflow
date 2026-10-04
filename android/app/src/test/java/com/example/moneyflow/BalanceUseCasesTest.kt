package com.example.moneyflow

import com.example.moneyflow.domain.model.AccountType
import com.example.moneyflow.domain.model.MoneyAccount
import com.example.moneyflow.domain.model.MoneyTransaction
import com.example.moneyflow.domain.model.MoneyTransfer
import com.example.moneyflow.domain.model.TransactionType
import com.example.moneyflow.domain.usecase.BalanceUseCases
import org.junit.Assert.assertEquals
import org.junit.Test

class BalanceUseCasesTest {

    @Test
    fun testSection70_BalanceTestCase() {
        // Given:
        // Opening balance = ₹1,000
        // Credit = ₹500
        // Debit = ₹200
        // Transfer = ₹300
        // Overall balance = ₹1,300

        val accounts = listOf(
            MoneyAccount(id = "acc-cash", name = "Cash", type = AccountType.CASH, openingBalance = 1000.0),
            MoneyAccount(id = "acc-bank", name = "Bank", type = AccountType.BANK, openingBalance = 0.0)
        )

        val transactions = listOf(
            MoneyTransaction(
                id = "tx-1",
                accountId = "acc-cash",
                type = TransactionType.CREDIT,
                amount = 500.0,
                transactionDate = "2026-10-02"
            ),
            MoneyTransaction(
                id = "tx-2",
                accountId = "acc-cash",
                type = TransactionType.DEBIT,
                amount = 200.0,
                transactionDate = "2026-10-03"
            )
        )

        val transfers = listOf(
            MoneyTransfer(
                id = "tr-1",
                fromAccountId = "acc-cash",
                toAccountId = "acc-bank",
                amount = 300.0,
                transactionDate = "2026-10-04"
            )
        )

        val total = BalanceUseCases.calculateTotalBalance(accounts, transactions, transfers)
        assertEquals(1300.0, total, 0.01)

        val balances = BalanceUseCases.calculateAccountBalances(accounts, transactions, transfers)
        // Cash: 1000 + 500 - 200 - 300 = 1000
        assertEquals(1000.0, balances["acc-cash"] ?: 0.0, 0.01)
        // Bank: 0 + 300 = 300
        assertEquals(300.0, balances["acc-bank"] ?: 0.0, 0.01)
    }

    @Test
    fun testSection71_ImportantAccountingTestCase() {
        // Starting:
        // Cash = ₹1,000
        // Bank = ₹2,000
        // Transfer: Cash → Bank ₹500
        // Expected: Cash = ₹500, Bank = ₹2,500, Total = ₹3,000 (NOT ₹3,500)

        val accounts = listOf(
            MoneyAccount(id = "acc-cash", name = "Cash", type = AccountType.CASH, openingBalance = 1000.0),
            MoneyAccount(id = "acc-bank", name = "Bank", type = AccountType.BANK, openingBalance = 2000.0)
        )

        val transfers = listOf(
            MoneyTransfer(
                id = "tr-1",
                fromAccountId = "acc-cash",
                toAccountId = "acc-bank",
                amount = 500.0,
                transactionDate = "2026-10-04"
            )
        )

        val total = BalanceUseCases.calculateTotalBalance(accounts, emptyList(), transfers)
        assertEquals(3000.0, total, 0.01)

        val balances = BalanceUseCases.calculateAccountBalances(accounts, emptyList(), transfers)
        assertEquals(500.0, balances["acc-cash"] ?: 0.0, 0.01)
        assertEquals(2500.0, balances["acc-bank"] ?: 0.0, 0.01)
    }
}
