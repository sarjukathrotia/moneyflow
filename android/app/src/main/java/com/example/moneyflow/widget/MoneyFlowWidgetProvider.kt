package com.example.moneyflow.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.example.moneyflow.MainActivity
import com.example.moneyflow.R
import com.example.moneyflow.data.repository.MoneyFlowRepository
import com.example.moneyflow.domain.model.TransactionType
import com.example.moneyflow.domain.usecase.BalanceUseCases

class MoneyFlowWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        val repository = MoneyFlowRepository.getInstance()
        val totalBalance = repository.getTotalBalance()
        val formattedBalance = BalanceUseCases.formatCurrency(totalBalance)
        val transactions = repository.transactions.value
        val totalIncome = transactions.filter { it.type == TransactionType.CREDIT && it.deletedAt == null }.sumOf { it.amount }
        val totalExpense = transactions.filter { it.type == TransactionType.DEBIT && it.deletedAt == null }.sumOf { it.amount }
        val formattedIncome = BalanceUseCases.formatCurrency(totalIncome)
        val formattedExpense = BalanceUseCases.formatCurrency(totalExpense)

        for (appWidgetId in appWidgetIds) {
            val appWidgetInfo = appWidgetManager.getAppWidgetInfo(appWidgetId)
            val isSmall = appWidgetInfo?.initialLayout == R.layout.widget_moneyflow_small

            val views = if (isSmall) {
                RemoteViews(context.packageName, R.layout.widget_moneyflow_small).apply {
                    setTextViewText(R.id.widget_small_balance, formattedBalance)

                    // Intent for Money In
                    val inIntent = Intent(context, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        putExtra("NAV_TARGET", "MONEY_IN")
                    }
                    val inPendingIntent = PendingIntent.getActivity(
                        context,
                        101,
                        inIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setOnClickPendingIntent(R.id.widget_btn_plus, inPendingIntent)

                    // Intent for Money Out
                    val outIntent = Intent(context, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        putExtra("NAV_TARGET", "MONEY_OUT")
                    }
                    val outPendingIntent = PendingIntent.getActivity(
                        context,
                        102,
                        outIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setOnClickPendingIntent(R.id.widget_btn_minus, outPendingIntent)
                }
            } else {
                RemoteViews(context.packageName, R.layout.widget_moneyflow_medium).apply {
                    setTextViewText(R.id.widget_medium_balance, formattedBalance)
                    setTextViewText(R.id.widget_medium_income, formattedIncome)
                    setTextViewText(R.id.widget_medium_expense, formattedExpense)

                    val inIntent = Intent(context, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        putExtra("NAV_TARGET", "MONEY_IN")
                    }
                    val inPendingIntent = PendingIntent.getActivity(
                        context,
                        201,
                        inIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setOnClickPendingIntent(R.id.widget_medium_btn_plus, inPendingIntent)

                    val outIntent = Intent(context, MainActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        putExtra("NAV_TARGET", "MONEY_OUT")
                    }
                    val outPendingIntent = PendingIntent.getActivity(
                        context,
                        202,
                        outIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    setOnClickPendingIntent(R.id.widget_medium_btn_minus, outPendingIntent)
                }
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
