package com.example.moneyflow.feature.settings

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.moneyflow.data.repository.MoneyFlowRepository
import com.example.moneyflow.theme.MoneyFlowAccent
import com.example.moneyflow.theme.MoneyFlowBackground
import com.example.moneyflow.theme.MoneyFlowNegative
import com.example.moneyflow.theme.MoneyFlowPrimaryText
import com.example.moneyflow.theme.MoneyFlowSecondaryText
import com.example.moneyflow.theme.MoneyFlowSurface

@Composable
fun SettingsScreen(
    onBack: () -> Unit
) {
    var appLockOn by remember { mutableStateOf(false) }
    var biometricOn by remember { mutableStateOf(true) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MoneyFlowBackground)
            .padding(horizontal = 20.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Settings",
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

        // Section 51: Security & App Lock
        Text(
            text = "Security",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = MoneyFlowPrimaryText
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "App Lock",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MoneyFlowPrimaryText
                        )
                        Text(
                            text = "Require authentication to open",
                            fontSize = 11.sp,
                            color = MoneyFlowSecondaryText
                        )
                    }
                    Switch(
                        checked = appLockOn,
                        onCheckedChange = { appLockOn = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = MoneyFlowAccent)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Biometric Unlock",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = MoneyFlowPrimaryText
                        )
                        Text(
                            text = "Fingerprint or Face unlock",
                            fontSize = 11.sp,
                            color = MoneyFlowSecondaryText
                        )
                    }
                    Switch(
                        checked = biometricOn,
                        onCheckedChange = { biometricOn = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = MoneyFlowAccent)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Auto Lock",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MoneyFlowPrimaryText
                    )
                    Text(
                        text = "5 minutes",
                        fontSize = 13.sp,
                        color = MoneyFlowSecondaryText
                    )
                }
            }
        }

        // Cloud & Sync Section
        Text(
            text = "Cloud Synchronization",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = MoneyFlowPrimaryText
        )

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Offline-First Sync Engine",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = MoneyFlowPrimaryText
                )
                Text(
                    text = "All your money movements are saved immediately to local storage on your device and will synchronize when online.",
                    fontSize = 12.sp,
                    color = MoneyFlowSecondaryText,
                    lineHeight = 18.sp
                )
            }
        }

        // Data Reset Section
        Text(
            text = "Data Management",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = MoneyFlowPrimaryText
        )

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable {
                    MoneyFlowRepository.getInstance().resetToCleanState()
                    onBack()
                },
            colors = CardDefaults.cardColors(containerColor = MoneyFlowSurface),
            shape = RoundedCornerShape(16.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Reset All Data",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MoneyFlowNegative
                    )
                    Text(
                        text = "Wipe all transactions and reset balances to ₹0",
                        fontSize = 11.sp,
                        color = MoneyFlowSecondaryText
                    )
                }
            }
        }
    }
}
