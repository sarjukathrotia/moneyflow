# MoneyFlow Android Application & Widget Documentation

## 1. Overview

The MoneyFlow Android application is built using:
- **Language**: Kotlin 2.3+
- **UI Toolkit**: Jetpack Compose with Material 3 & Navigation 3
- **Local Persistence**: Offline-first repository architecture
- **Widget**: Android AppWidgetProvider (Small 2x1 and Medium 4x2)
- **Security**: Android BiometricPrompt & auto-lock timers
- **Build System**: Android Gradle Plugin 9.0+, compileSdk 36

---

## 2. Directory Structure

```text
android/app/src/main/
├── AndroidManifest.xml
├── java/com/example/moneyflow/
│   ├── MainActivity.kt               # Entry activity with widget deep-link handling
│   ├── Navigation.kt                 # Scaffold with bottom bar, FAB, and screen backstack
│   ├── NavigationKeys.kt             # Type-safe navigation keys
│   ├── data/
│   │   └── repository/
│   │       └── MoneyFlowRepository.kt# In-memory + persistent reactive repository
│   ├── domain/
│   │   ├── model/
│   │   │   └── Models.kt             # Domain data models & enums
│   │   └── usecase/
│   │       └── BalanceUseCases.kt    # Deterministic accounting & formatting
│   ├── feature/
│   │   ├── home/
│   │   │   └── HomeScreen.kt         # Minimalist hero balance & quick actions
│   │   ├── transaction/
│   │   │   ├── MoneyInScreen.kt      # Autofocused numeric income entry
│   │   │   ├── MoneyOutScreen.kt     # Fast expense entry
│   │   │   ├── MoveMoneyScreen.kt    # Internal money transfer
│   │   │   ├── QuickSpendScreen.kt   # 3-second 2-step quick expense
│   │   │   └── TransactionTimelineScreen.kt # Chronological history & search
│   │   ├── accounts/
│   │   │   └── AccountsScreen.kt     # Money Locations manager
│   │   ├── reports/
│   │   │   └── ReportsScreen.kt      # Monthly summary & category spend
│   │   └── settings/
│   │       └── SettingsScreen.kt     # Security, biometrics, sync info
│   ├── theme/
│   │   ├── Color.kt                  # Curated MoneyFlow palette
│   │   └── Theme.kt                  # Material3 light/dark theme
│   └── widget/
│       └── MoneyFlowWidgetProvider.kt# Small & Medium Home-Screen Widget
└── res/
    ├── layout/
    │   ├── widget_moneyflow_small.xml
    │   └── widget_moneyflow_medium.xml
    ├── xml/
    │   ├── widget_small_info.xml
    │   └── widget_medium_info.xml
    └── drawable/
        ├── widget_bg.xml
        ├── btn_positive_bg.xml
        └── btn_negative_bg.xml
```

---

## 3. Home-Screen Widget Integration

### Small Widget (2x1)
Displays:
1. "MoneyFlow" brand tag
2. Current Total Balance (e.g., `₹41,400`)
3. `+` Quick Button: Launches MainActivity directly into the **Money In** screen.
4. `-` Quick Button: Launches MainActivity directly into the **Money Out** screen.

### Medium Widget (4x2)
Displays:
1. Current Total Balance in the top right.
2. Monthly **Money In** received (e.g. `+₹55,000`).
3. Monthly **Money Out** spent (e.g. `-₹25,600`).
4. `+ Money In` button & `- Money Out` button.

### Widget Deep-Linking
`MoneyFlowWidgetProvider` sets intent extras on the pending intents:
```kotlin
val intent = Intent(context, MainActivity::class.java).apply {
    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
    putExtra("NAV_TARGET", "MONEY_OUT")
}
```
`MainActivity.kt` detects `NAV_TARGET` and immediately navigates into the requested transaction entry screen without any intermediate menus.

---

## 4. Running and Building Android

### Run Unit Tests
```bash
cd android
./gradlew test
```

### Build Debug APK
```bash
cd android
./gradlew assembleDebug
```
The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Install and Run on Connected Device or Emulator
```bash
cd android
./gradlew installDebug
# or using the android CLI
android run --apks=app/build/outputs/apk/debug/app-debug.apk
```
