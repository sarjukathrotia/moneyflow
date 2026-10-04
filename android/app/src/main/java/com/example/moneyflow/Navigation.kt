package com.example.moneyflow

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.moneyflow.feature.accounts.AccountsScreen
import com.example.moneyflow.feature.home.HomeScreen
import com.example.moneyflow.feature.reports.ReportsScreen
import com.example.moneyflow.feature.settings.SettingsScreen
import com.example.moneyflow.feature.transaction.MoneyInScreen
import com.example.moneyflow.feature.transaction.MoneyOutScreen
import com.example.moneyflow.feature.transaction.MoveMoneyScreen
import com.example.moneyflow.feature.transaction.QuickSpendScreen
import com.example.moneyflow.feature.transaction.TransactionTimelineScreen
import com.example.moneyflow.theme.MoneyFlowAccent
import com.example.moneyflow.theme.MoneyFlowBackground
import com.example.moneyflow.theme.MoneyFlowPrimaryText
import com.example.moneyflow.theme.MoneyFlowSecondaryText
import com.example.moneyflow.theme.MoneyFlowSurface

@Composable
fun MainNavigation(initialTarget: String? = null) {
    val backStack = rememberNavBackStack(NavHome)
    var currentTab by remember { mutableStateOf<NavKey>(NavHome) }

    LaunchedEffect(initialTarget) {
        when (initialTarget) {
            "MONEY_IN" -> backStack.add(NavMoneyIn)
            "MONEY_OUT" -> backStack.add(NavMoneyOut)
            "QUICK_SPEND" -> backStack.add(NavQuickSpend)
        }
    }

    val isTopLevel = backStack.lastOrNull() in listOf(NavHome, NavTransactions, NavReports, NavSettings)

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MoneyFlowBackground,
        floatingActionButton = {
            if (isTopLevel) {
                FloatingActionButton(
                    onClick = { backStack.add(NavMoneyOut) },
                    containerColor = MoneyFlowAccent,
                    contentColor = Color.White
                ) {
                    Text(text = "+", fontSize = 26.sp, fontWeight = FontWeight.Light)
                }
            }
        },
        bottomBar = {
            if (isTopLevel) {
                NavigationBar(
                    containerColor = MoneyFlowSurface,
                    tonalElevation = 4.dp
                ) {
                    val tabs = listOf(
                        Triple(NavHome, "Home", "⌂"),
                        Triple(NavTransactions, "History", "⇄"),
                        Triple(NavReports, "Reports", "📊"),
                        Triple(NavSettings, "Settings", "⚙")
                    )

                    tabs.forEach { (tabKey, title, iconSymbol) ->
                        val isSelected = backStack.lastOrNull() == tabKey
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                currentTab = tabKey
                                while (backStack.size > 1) {
                                    backStack.removeLastOrNull()
                                }
                                if (tabKey != NavHome) {
                                    backStack.add(tabKey)
                                }
                            },
                            icon = {
                                Text(
                                    text = iconSymbol,
                                    fontSize = 18.sp,
                                    color = if (isSelected) MoneyFlowAccent else MoneyFlowSecondaryText
                                )
                            },
                            label = {
                                Text(
                                    text = title,
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = MoneyFlowSurface
                            )
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavDisplay(
            backStack = backStack,
            onBack = { backStack.removeLastOrNull() },
            modifier = Modifier.padding(innerPadding),
            entryProvider = entryProvider {
                entry<NavHome> {
                    HomeScreen(
                        onNavigateMoneyIn = { backStack.add(NavMoneyIn) },
                        onNavigateMoneyOut = { backStack.add(NavMoneyOut) },
                        onNavigateMoveMoney = { backStack.add(NavMoveMoney) },
                        onNavigateQuickSpend = { backStack.add(NavQuickSpend) },
                        onNavigateTransactions = { backStack.add(NavTransactions) },
                        onNavigateAccounts = { backStack.add(NavAccounts) },
                        onTransactionClick = { backStack.add(NavTransactions) }
                    )
                }
                entry<NavMoneyIn> {
                    MoneyInScreen(onComplete = { backStack.removeLastOrNull() })
                }
                entry<NavMoneyOut> {
                    MoneyOutScreen(onComplete = { backStack.removeLastOrNull() })
                }
                entry<NavMoveMoney> {
                    MoveMoneyScreen(onComplete = { backStack.removeLastOrNull() })
                }
                entry<NavQuickSpend> {
                    QuickSpendScreen(onComplete = { backStack.removeLastOrNull() })
                }
                entry<NavTransactions> {
                    TransactionTimelineScreen(onBack = { backStack.removeLastOrNull() })
                }
                entry<NavAccounts> {
                    AccountsScreen(onBack = { backStack.removeLastOrNull() })
                }
                entry<NavReports> {
                    ReportsScreen(onBack = { backStack.removeLastOrNull() })
                }
                entry<NavSettings> {
                    SettingsScreen(onBack = { backStack.removeLastOrNull() })
                }
            }
        )
    }
}
