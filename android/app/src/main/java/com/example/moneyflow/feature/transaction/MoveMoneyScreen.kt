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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.moneyflow.data.repository.MoneyFlowRepository
import com.example.moneyflow.domain.usecase.BalanceUseCases
import com.example.moneyflow.theme.MoneyFlowAccent
import com.example.moneyflow.theme.MoneyFlowAccentLight
import com.example.moneyflow.theme.MoneyFlowBackground
import com.example.moneyflow.theme.MoneyFlowBorder
import com.example.moneyflow.theme.MoneyFlowPrimaryText
import com.example.moneyflow.theme.MoneyFlowSecondaryText
import com.example.moneyflow.theme.MoneyFlowSurface

@Composable
fun MoveMoneyScreen(
    repository: MoneyFlowRepository = MoneyFlowRepository.getInstance(),
    onComplete: () -> Unit
) {
    val accounts by repository.accounts.collectAsState()

    var amount by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var fromAccountId by remember { mutableStateOf(accounts.firstOrNull()?.id ?: "") }
    var toAccountId by remember {
        mutableStateOf(accounts.getOrNull(1)?.id ?: accounts.firstOrNull()?.id ?: "")
    }

    val focusRequester = remember { FocusRequester() }

    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MoneyFlowBackground)
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Move Money",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = MoneyFlowPrimaryText
                )
                Text(
                    text = "Cancel",
                    fontSize = 14.sp,
                    color = MoneyFlowSecondaryText,
                    modifier = Modifier.clickable { onComplete() }
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Amount Input
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "₹",
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Bold,
                    color = MoneyFlowAccent
                )
                Spacer(modifier = Modifier.width(8.dp))
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    placeholder = { Text("0", fontSize = 36.sp, color = MoneyFlowSecondaryText) },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focusRequester),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        fontSize = 36.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MoneyFlowPrimaryText
                    ),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent
                    )
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // From Account
            Text(
                text = "From",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MoneyFlowSecondaryText
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                accounts.forEach { acc ->
                    val isSelected = acc.id == fromAccountId
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) MoneyFlowAccentLight else MoneyFlowSurface)
                            .clickable { fromAccountId = acc.id }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = acc.name,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) MoneyFlowAccent else MoneyFlowPrimaryText
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Text(text = "↓", fontSize = 20.sp, color = MoneyFlowSecondaryText)
            }
            Spacer(modifier = Modifier.height(8.dp))

            // To Account
            Text(
                text = "To",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MoneyFlowSecondaryText
            )
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                accounts.forEach { acc ->
                    val isSelected = acc.id == toAccountId
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (isSelected) MoneyFlowAccentLight else MoneyFlowSurface)
                            .clickable { toAccountId = acc.id }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = acc.name,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) MoneyFlowAccent else MoneyFlowPrimaryText
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Note (Optional)
            Text(
                text = "Note (Optional)",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = MoneyFlowSecondaryText
            )
            Spacer(modifier = Modifier.height(6.dp))
            OutlinedTextField(
                value = note,
                onValueChange = { note = it },
                placeholder = { Text("e.g. ATM withdrawal, Bank transfer") },
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
        }

        val numAmount = amount.toDoubleOrNull() ?: 0.0
        val isValid = numAmount > 0 && fromAccountId.isNotBlank() && toAccountId.isNotBlank() && fromAccountId != toAccountId

        // Move Money Button
        Button(
            onClick = {
                if (isValid) {
                    repository.addTransfer(
                        fromAccountId = fromAccountId,
                        toAccountId = toAccountId,
                        amount = numAmount,
                        note = note.ifBlank { null }
                    )
                    onComplete()
                }
            },
            enabled = isValid,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MoneyFlowAccent,
                disabledContainerColor = MoneyFlowAccent.copy(alpha = 0.4f)
            )
        ) {
            Text(
                text = if (numAmount > 0) "Move ${BalanceUseCases.formatCurrency(numAmount)}" else "Move Money",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}
