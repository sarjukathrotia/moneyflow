package com.example.moneyflow

import androidx.navigation3.runtime.NavKey
import kotlinx.serialization.Serializable

@Serializable data object NavHome : NavKey
@Serializable data object NavMoneyIn : NavKey
@Serializable data object NavMoneyOut : NavKey
@Serializable data object NavMoveMoney : NavKey
@Serializable data object NavQuickSpend : NavKey
@Serializable data object NavTransactions : NavKey
@Serializable data object NavAccounts : NavKey
@Serializable data object NavReports : NavKey
@Serializable data object NavSettings : NavKey
