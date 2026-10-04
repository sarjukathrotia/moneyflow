package com.example.moneyflow.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = MoneyFlowAccent,
    onPrimary = Color.White,
    background = DarkBackground,
    surface = DarkSurface,
    onBackground = DarkPrimaryText,
    onSurface = DarkPrimaryText,
    outline = DarkBorder,
)

private val LightColorScheme = lightColorScheme(
    primary = MoneyFlowAccent,
    onPrimary = Color.White,
    background = MoneyFlowBackground,
    surface = MoneyFlowSurface,
    onBackground = MoneyFlowPrimaryText,
    onSurface = MoneyFlowPrimaryText,
    outline = MoneyFlowBorder,
)

@Composable
fun MoneyFlowTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Use our brand colors by default for consistent premium look
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}
