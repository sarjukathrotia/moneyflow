package com.example.moneyflow.feature.home

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.moneyflow.data.repository.MoneyFlowRepository
import com.example.moneyflow.domain.model.MoneyAccount
import com.example.moneyflow.domain.model.MoneyTransaction
import com.example.moneyflow.domain.model.TransactionType
import com.example.moneyflow.domain.usecase.BalanceUseCases
import com.example.moneyflow.theme.MoneyFlowAccent
import com.example.moneyflow.theme.MoneyFlowAccentLight
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
fun HomeScreen(
    repository: MoneyFlowRepository = MoneyFlowRepository.getInstance(),
    onNavigateMoneyIn: () -> Unit,
    onNavigateMoneyOut: () -> Unit,
    onNavigateMoveMoney: () -> Unit,
    onNavigateQuickSpend: () -> Unit,
    onNavigateTransactions: () -> Unit,
    onNavigateAccounts: () -> Unit,
    onTransactionClick: (String) -> Unit
) {
    val accounts by repository.accounts.collectAsState()
    val transactions by repository.transactions.collectAsState()
    val transfers by repository.transfers.collectAsState()

    val totalBalance = BalanceUseCases.calculateTotalBalance(accounts, transactions, transfers)
    val periodSummary = BalanceUseCases.calculatePeriodSummary(
        accounts, transactions, transfers, "2026-10-01", "2026-10-31"
    )

    val recentTransactions = transactions.filter { it.deletedAt == null }.take(5)

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MoneyFlowBackground)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            // Greeting & Balance Section (Prompt Section 22 & 23)
            Column(modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "Good morning",
                    fontSize = 14.sp,
                    color = MoneyFlowSecondaryText,
                    fontWeight = FontWeight.Medium
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Your Money",
                    fontSize = 12.sp,
                    color = MoneyFlowSecondaryText,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = BalanceUseCases.formatCurrency(totalBalance),
                    fontSize = 44.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = MoneyFlowPrimaryText,
                    letterSpacing = (-1).sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "+${BalanceUseCases.formatCurrency(periodSummary.totalIncome)} received",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MoneyFlowPositive
                    )
                    Text(
                        text = "-${BalanceUseCases.formatCurrency(periodSummary.totalExpense)} spent",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MoneyFlowNegative
                    )
                }
            }
        }

        // Quick Actions Section (Prompt Section 22)
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Quick Actions",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MoneyFlowPrimaryText
                    )
                    Text(
                        text = "⚡ Quick Spend",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MoneyFlowAccent,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(MoneyFlowAccentLight)
                            .clickable { onNavigateQuickSpend() }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    QuickActionButton(
                        title = "+ Money In",
                        color = MoneyFlowPositive,
                        bgColor = MoneyFlowPositiveLight,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateMoneyIn
                    )
                    QuickActionButton(
                        title = "- Money Out",
                        color = MoneyFlowNegative,
                        bgColor = MoneyFlowNegativeLight,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateMoneyOut
                    )
                    QuickActionButton(
                        title = "↔ Move",
                        color = MoneyFlowAccent,
                        bgColor = MoneyFlowAccentLight,
                        modifier = Modifier.weight(0.9f),
                        onClick = onNavigateMoveMoney
                    )
                }
            }
        }

        // Money Locations Section (Prompt Section 22 & 32)
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Money Locations",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MoneyFlowPrimaryText
                    )
                    Text(
                        text = "Manage",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = MoneyFlowAccent,
                        modifier = Modifier.clickable { onNavigateAccounts() }
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(accounts) { acc ->
                        MoneyLocationCard(account = acc)
                    }
                }
            }
        }

        // Recent Activity Section (Prompt Section 22)
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Activity",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = MoneyFlowPrimaryText
                )
                Text(
                    text = "View all",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = MoneyFlowAccent,
                    modifier = Modifier.clickable { onNavigateTransactions() }
                )
            }
        }

        items(recentTransactions) { tx ->
            RecentTransactionItem(
                transaction = tx,
                onClick = { onTransactionClick(tx.id) }
            )
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
fun QuickActionButton(
    title: String,
    color: Color,
    bgColor: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(bgColor)
            .clickable { onClick() }
            .padding(vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = title,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = color
        )
    }
}

@Composable
fun MoneyLocationCard(account: MoneyAccount) {
    Card(
        modifier = Modifier
            .width(140.dp)
            .clip(RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(Color(android.graphics.Color.parseColor(account.color))),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = account.name.take(1),
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = account.name,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = MoneyFlowSecondaryText
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = BalanceUseCases.formatCurrency(account.currentBalance),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = MoneyFlowPrimaryText
            )
        }
    }
}

@Composable
fun RecentTransactionItem(
    transaction: MoneyTransaction,
    onClick: () -> Unit
) {
    val isCredit = transaction.type == TransactionType.CREDIT

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
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
                        text = transaction.sourceOrMerchant ?: transaction.description ?: "Activity",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MoneyFlowPrimaryText
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = if (isCredit) "Money received" else "Expense",
                        fontSize = 11.sp,
                        color = MoneyFlowSecondaryText
                    )
                }
            }

            Text(
                text = (if (isCredit) "+" else "-") + BalanceUseCases.formatCurrency(transaction.amount),
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = if (isCredit) MoneyFlowPositive else MoneyFlowPrimaryText
            )
        }
    }
}
