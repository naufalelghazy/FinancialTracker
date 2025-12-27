# Changelog

All notable changes to Financial Tracker PWA.

## [2.0.0] - 2025-12-27

### Added

- ✨ **Transfer Between Accounts** - New transfer mode to move money between accounts
- 💰 **Balance View** - New Saldo tab showing all account balances from Dashboard sheet
- 🔢 **Number Formatting** - Amount input now shows thousand separators (e.g., 1.000.000)
- 🏦 **Bank Logo Icons** - WebP icons for all bank accounts (BCA, Mandiri, KROM, etc.)
- 📱 **Bottom Navigation** - Tab navigation between Input and Saldo pages
- 🔄 **Refresh Balance** - Button to refresh balance data from Google Sheets

### Changed

- 🎨 **New Purple Theme** - Complete UI redesign with purple gradient theme
- 🔤 **Font Update** - Changed from Inter to Plus Jakarta Sans
- ⚙️ **Settings Icon** - Updated to cleaner gear icon
- 📦 **Apps Script** - Updated `doGet()` to support `getBalances` action

### Fixed

- 🐛 Toggle button sizing on mobile devices
- 🐛 Service Worker caching for PWA

## [1.0.0] - 2025-12-24

### Added

- 📱 Initial PWA release
- 💳 Income/Expense tracking
- 🏦 10 bank account support
- 📊 Google Sheets integration
- 🌙 Dark mode UI
- 📴 Offline support via Service Worker
