package com.example.moneyflow.feature.transaction

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.moneyflow.data.repository.MoneyFlowRepository
import com.example.moneyflow.domain.model.MoneyTransaction
import com.example.moneyflow.domain.model.TransactionType
import com.example.moneyflow.domain.usecase.BalanceUseCases
import com.example.moneyflow.theme.MoneyFlowAccent
import com.example.moneyflow.theme.MoneyFlowBackground
import com.example.moneyflow.theme.MoneyFlowBorder
import com.example.moneyflow.theme.MoneyFlowNegative
import com.example.moneyflow.theme.MoneyFlowNegativeLight
import com.example.moneyflow.theme.MoneyFlowPositive
import com.example.moneyflow.theme.MoneyFlowPositiveLight
import com.example.moneyflow.theme.MoneyFlowPrimaryText
import com.example.moneyflow.theme.MoneyFlowSecondaryText
import com.example.moneyflow.theme.MoneyFlowSurface

@Composable
fun TransactionTimelineScreen(
    repository: MoneyFlowRepository = MoneyFlowRepository.getInstance(),
    onBack: () -> Unit
) {
    val transactions by repository.transactions.collectAsState()
    val accounts by repository.accounts.collectAsState()

    var searchQuery by remember { mutableStateOf("") }
    var selectedFilterType by remember { mutableStateOf("ALL") } // ALL, CREDIT, DEBIT
    var itemToDelete by remember { mutableStateOf<MoneyTransaction?>(null) }

    val accountMap = remember(accounts) { accounts.associateBy { it.id } }

    val filteredTransactions = transactions.filter { tx ->
        tx.deletedAt == null &&
        (selectedFilterType == "ALL" ||
            (selectedFilterType == "CREDIT" && tx.type == TransactionType.CREDIT) ||
            (selectedFilterType == "DEBIT" && tx.type == TransactionType.DEBIT)) &&
        (searchQuery.isBlank() ||
            (tx.sourceOrMerchant?.contains(searchQuery, ignoreCase = true) == true) ||
            (tx.description?.contains(searchQuery, ignoreCase = true) == true) ||
            (tx.note?.contains(searchQuery, ignoreCase = true) == true) ||
            (tx.amount.toString().contains(searchQuery)))
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MoneyFlowBackground)
            .padding(horizontal = 20.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Transactions",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = MoneyFlowPrimaryText
            )
            Text(
                text = "Back",
                fontSize = 14.sp,
                color = MoneyFlowAccent,
                modifier = Modifier.clickable { onBack() }
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Search Input (Prompt Section 30)
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search description, merchant, note...", fontSize = 13.sp) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = MoneyFlowSurface,
                unfocusedContainerColor = MoneyFlowSurface,
                focusedBorderColor = MoneyFlowAccent,
                unfocusedBorderColor = MoneyFlowBorder
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Filter Pills (Prompt Section 31)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("ALL" to "All", "CREDIT" to "Money In", "DEBIT" to "Money Out").forEach { (typeKey, label) ->
                val isSelected = selectedFilterType == typeKey
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) MoneyFlowPrimaryText else MoneyFlowSurface)
                        .clickable { selectedFilterType = typeKey }
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else MoneyFlowPrimaryText
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Timeline list
        if (filteredTransactions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No transactions found",
                    color = MoneyFlowSecondaryText,
                    fontSize = 14.sp
                )
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredTransactions) { tx ->
                    val isCredit = tx.type == TransactionType.CREDIT
                    val acc = accountMap[tx.accountId]

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { itemToDelete = tx },
                        colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
                        shape = RoundedCornerShape(14.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.5.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isCredit) MoneyFlowPositiveLight else MoneyFlowNegativeLight),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = if (isCredit) "+" else "-",
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isCredit) MoneyFlowPositive else MoneyFlowNegative
                                    )
                                }

                                Column {
                                    Text(
                                        text = tx.sourceOrMerchant ?: tx.description ?: "Activity",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MoneyFlowPrimaryText
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = "${tx.transactionDate} • ${acc?.name ?: "Account"}" +
                                                (if (!tx.note.isNullOrBlank()) " • ${tx.note}" else ""),
                                        fontSize = 11.sp,
                                        color = MoneyFlowSecondaryText
                                    )
                                }
                            }

                            Text(
                                text = (if (isCredit) "+" else "-") + BalanceUseCases.formatCurrency(tx.amount),
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isCredit) MoneyFlowPositive else MoneyFlowPrimaryText
                            )
                        }
                    }
                }

                item {
                    Spacer(modifier = Modifier.height(20.dp))
                }
            }
        }
    }

    // Soft Delete Confirmation Dialog (Prompt Section 73)
    itemToDelete?.let { tx ->
        AlertDialog(
            onDismissRequest = { itemToDelete = null },
            title = {
                Text(text = "Are you sure?", fontWeight = FontWeight.Bold)
            },
            text = {
                Text(
                    text = "This will remove ${BalanceUseCases.formatCurrency(tx.amount)} from your money history."
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        repository.deleteTransaction(tx.id)
                        itemToDelete = null
                    }
                ) {
                    Text(text = "Delete", color = MoneyFlowNegative, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { itemToDelete = null }) {
                    Text(text = "Cancel", color = MoneyFlowSecondaryText)
                }
            }
        )
    }
}
