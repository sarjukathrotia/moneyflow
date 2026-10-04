package com.example.moneyflow.feature.transaction

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.moneyflow.data.repository.MoneyFlowRepository
import com.example.moneyflow.theme.MoneyFlowBackground
import com.example.moneyflow.theme.MoneyFlowBorder
import com.example.moneyflow.theme.MoneyFlowNegative
import com.example.moneyflow.theme.MoneyFlowPrimaryText
import com.example.moneyflow.theme.MoneyFlowSecondaryText
import com.example.moneyflow.theme.MoneyFlowSurface

@Composable
fun QuickSpendScreen(
    repository: MoneyFlowRepository = MoneyFlowRepository.getInstance(),
    onComplete: () -> Unit
) {
    var step by remember { mutableStateOf(1) } // 1: Amount, 2: Merchant
    var amount by remember { mutableStateOf("") }
    var merchant by remember { mutableStateOf("") }

    val amountFocusRequester = remember { FocusRequester() }
    val merchantFocusRequester = remember { FocusRequester() }

    LaunchedEffect(step) {
        if (step == 1) {
            amountFocusRequester.requestFocus()
        } else {
            merchantFocusRequester.requestFocus()
        }
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
                    text = "Quick Spend",
                    fontSize = 18.sp,
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

            Spacer(modifier = Modifier.height(48.dp))

            if (step == 1) {
                // Step 1: Immediately show ₹ 0
                Text(
                    text = "How much did you spend?",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = MoneyFlowSecondaryText
                )
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "₹",
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Bold,
                        color = MoneyFlowNegative
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedTextField(
                        value = amount,
                        onValueChange = { amount = it },
                        placeholder = { Text("0", fontSize = 48.sp, color = MoneyFlowSecondaryText) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier
                            .fillMaxWidth()
                            .focusRequester(amountFocusRequester),
                        textStyle = androidx.compose.ui.text.TextStyle(
                            fontSize = 48.sp,
                            fontWeight = FontWeight.Black,
                            color = MoneyFlowPrimaryText
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color.Transparent,
                            unfocusedBorderColor = Color.Transparent
                        )
                    )
                }
            } else {
                // Step 2: What did you spend it on?
                Text(
                    text = "₹$amount spent on:",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MoneyFlowNegative
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "What did you spend it on?",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = MoneyFlowSecondaryText
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = merchant,
                    onValueChange = { merchant = it },
                    placeholder = { Text("e.g. Coffee, Grocery, Taxi") },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(merchantFocusRequester),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = MoneyFlowSurface,
                        unfocusedContainerColor = MoneyFlowSurface,
                        focusedBorderColor = MoneyFlowNegative,
                        unfocusedBorderColor = MoneyFlowBorder
                    )
                )
            }
        }

        // Action Button
        Button(
            onClick = {
                if (step == 1) {
                    if ((amount.toDoubleOrNull() ?: 0.0) > 0) {
                        step = 2
                    }
                } else {
                    val num = amount.toDoubleOrNull() ?: 0.0
                    repository.quickSpend(num, merchant.ifBlank { "Quick Spend" })
                    onComplete()
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = MoneyFlowNegative
            )
        ) {
            Text(
                text = if (step == 1) "Next" else "Save",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }
    }
}
