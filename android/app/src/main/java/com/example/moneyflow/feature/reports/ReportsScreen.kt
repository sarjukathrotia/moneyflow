package com.example.moneyflow.feature.reports

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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import com.example.moneyflow.domain.model.TransactionType
import com.example.moneyflow.domain.usecase.BalanceUseCases
import com.example.moneyflow.theme.MoneyFlowAccent
import com.example.moneyflow.theme.MoneyFlowAccentLight
import com.example.moneyflow.theme.MoneyFlowBackground
import com.example.moneyflow.theme.MoneyFlowNegative
import com.example.moneyflow.theme.MoneyFlowNegativeLight
import com.example.moneyflow.theme.MoneyFlowPositive
import com.example.moneyflow.theme.MoneyFlowPositiveLight
import com.example.moneyflow.theme.MoneyFlowPrimaryText
import com.example.moneyflow.theme.MoneyFlowSecondaryText
import com.example.moneyflow.theme.MoneyFlowSurface

@Composable
fun ReportsScreen(
    repository: MoneyFlowRepository = MoneyFlowRepository.getInstance(),
    onBack: () -> Unit
) {
    val accounts by repository.accounts.collectAsState()
    val transactions by repository.transactions.collectAsState()
    val transfers by repository.transfers.collectAsState()
    val categories by repository.categories.collectAsState()

    val periodSummary = BalanceUseCases.calculatePeriodSummary(
        accounts, transactions, transfers, "2026-10-01", "2026-10-31"
    )

    // Category breakdown
    val categoryMap = categories.associateBy { it.id }
    val expenseTxs = transactions.filter { it.deletedAt == null && it.type == TransactionType.DEBIT }
    val categoryTotals = expenseTxs.groupBy { it.categoryId ?: "other" }
        .map { (catId, txs) ->
            val cat = categoryMap[catId]
            val total = txs.sumOf { it.amount }
            Triple(cat?.name ?: "Other", total, cat?.color ?: "#6B7280")
        }.sortedByDescending { it.second }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MoneyFlowBackground)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(16.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "October 2026",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MoneyFlowPrimaryText
                )
                Text(
                    text = "Done",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MoneyFlowAccent,
                    modifier = Modifier.clickable { onBack() }
                )
            }
        }

        // Section 34: Monthly Report Card
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Text(
                        text = "Monthly Money Summary",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MoneyFlowSecondaryText
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Starting Balance", fontSize = 14.sp, color = MoneyFlowPrimaryText)
                        Text(
                            text = BalanceUseCases.formatCurrency(periodSummary.startingBalance),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MoneyFlowPrimaryText
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Money In", fontSize = 14.sp, color = MoneyFlowPositive)
                        Text(
                            text = "+${BalanceUseCases.formatCurrency(periodSummary.totalIncome)}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MoneyFlowPositive
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Money Out", fontSize = 14.sp, color = MoneyFlowNegative)
                        Text(
                            text = "-${BalanceUseCases.formatCurrency(periodSummary.totalExpense)}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = MoneyFlowNegative
                        )
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(MoneyFlowAccentLight)
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Ending Balance", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = MoneyFlowAccent)
                        Text(
                            text = BalanceUseCases.formatCurrency(periodSummary.endingBalance),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MoneyFlowAccent
                        )
                    }
                }
            }
        }

        // Section 33: Where did I spend it?
        item {
            Text(
                text = "Where did I spend it?",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = MoneyFlowPrimaryText
            )
        }

        items(categoryTotals) { (catName, amount, colorHex) ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
                shape = RoundedCornerShape(12.dp)
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
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(12.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(Color(android.graphics.Color.parseColor(colorHex)))
                        )
                        Text(
                            text = catName,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = MoneyFlowPrimaryText
                        )
                    }

                    Text(
                        text = BalanceUseCases.formatCurrency(amount),
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MoneyFlowPrimaryText
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}
