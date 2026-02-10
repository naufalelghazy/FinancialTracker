# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2026-02-10

### Added

- 💳 **Credit Card & Paylater Support** - 5 new accounts (Honest Card, Nex Card, Kredivo, Spaylatter, Jago Loan)
- � **Tagihan Tab** - New dedicated tab to view all credit card bills with total debt summary
- 🖼️ **Custom Credit Card Icons** - WebP icon support for all credit card accounts
- � **Smart Balance Display** - Credit cards always shown in Tagihan tab (even with Rp 0)

### Changed

- 🎨 **Balance Calculation** - Total Saldo now excludes credit card debts (only bank & e-wallet)
- 📱 **Account Dropdown** - Added 5 credit card options to all account selectors
- 🧭 **Bottom Navigation** - Now has 3 tabs: Input, Saldo, and Tagihan
- 📊 **Tagihan Display** - Shows all credit cards regardless of balance (Rp 0 if no debt)

### Fixed

- 🔧 **Account Name Matching** - Fixed credit card names to match Google Sheets exactly
- 🎨 **Icon Sizing** - Fixed oversized credit card icons in Tagihan tab (now 48x48px)
- � **Balance Filtering** - Credit cards no longer appear in Saldo tab

### Technical

- 📝 **Google Apps Script** - Updated to read 5 credit accounts from rows 21-25
- 🎨 **CSS Optimization** - Added dedicated styling for bill card icons
- 📊 **Code Structure** - Separated balance and bills display logic

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
