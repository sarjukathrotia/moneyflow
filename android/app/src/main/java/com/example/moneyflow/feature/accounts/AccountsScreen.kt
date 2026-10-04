package com.example.moneyflow.feature.accounts

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import com.example.moneyflow.domain.model.AccountType
import com.example.moneyflow.domain.usecase.BalanceUseCases
import com.example.moneyflow.theme.MoneyFlowAccent
import com.example.moneyflow.theme.MoneyFlowBackground
import com.example.moneyflow.theme.MoneyFlowBorder
import com.example.moneyflow.theme.MoneyFlowPrimaryText
import com.example.moneyflow.theme.MoneyFlowSecondaryText
import com.example.moneyflow.theme.MoneyFlowSurface

@Composable
fun AccountsScreen(
    repository: MoneyFlowRepository = MoneyFlowRepository.getInstance(),
    onBack: () -> Unit
) {
    val accounts by repository.accounts.collectAsState()
    var isAddDialogOpen by remember { mutableStateOf(false) }

    var newAccountName by remember { mutableStateOf("") }
    var newAccountOpeningBalance by remember { mutableStateOf("") }
    var newAccountType by remember { mutableStateOf(AccountType.BANK) }

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
                text = "Money Locations",
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

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(accounts.filter { !it.isArchived }) { acc ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(Color(android.graphics.Color.parseColor(acc.color))),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = acc.name.take(1),
                                    color = Color.White,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Column {
                                Text(
                                    text = acc.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MoneyFlowPrimaryText
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Opening: ${BalanceUseCases.formatCurrency(acc.openingBalance)}",
                                    fontSize = 11.sp,
                                    color = MoneyFlowSecondaryText
                                )
                            }
                        }

                        Text(
                            text = BalanceUseCases.formatCurrency(acc.currentBalance),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MoneyFlowPrimaryText
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { isAddDialogOpen = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = MoneyFlowAccent)
                ) {
                    Text(
                        text = "+ Add Money Location",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }

    if (isAddDialogOpen) {
        AlertDialog(
            onDismissRequest = { isAddDialogOpen = false },
            title = {
                Text(text = "New Money Location", fontWeight = FontWeight.Bold)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = newAccountName,
                        onValueChange = { newAccountName = it },
                        placeholder = { Text("Location Name (e.g. ICICI Bank)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MoneyFlowAccent,
                            unfocusedBorderColor = MoneyFlowBorder
                        )
                    )

                    OutlinedTextField(
                        value = newAccountOpeningBalance,
                        onValueChange = { newAccountOpeningBalance = it },
                        placeholder = { Text("Opening Balance (₹)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = MoneyFlowAccent,
                            unfocusedBorderColor = MoneyFlowBorder
                        )
                    )
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (newAccountName.isNotBlank()) {
                            repository.addAccount(
                                name = newAccountName.trim(),
                                type = newAccountType,
                                openingBalance = newAccountOpeningBalance.toDoubleOrNull() ?: 0.0
                            )
                            newAccountName = ""
                            newAccountOpeningBalance = ""
                            isAddDialogOpen = false
                        }
                    }
                ) {
                    Text(text = "Add", color = MoneyFlowAccent, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { isAddDialogOpen = false }) {
                    Text(text = "Cancel", color = MoneyFlowSecondaryText)
                }
            }
        )
    }
}
