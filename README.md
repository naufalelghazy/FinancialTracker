# 💰 Financial Tracker PWA

Personal financial tracking app that syncs with Google Sheets.

## Features

- 📱 Progressive Web App (installable on mobile)
- 🌙 Dark mode with modern UI
- 💳 Track income & expenses
- 🏦 10 bank accounts supported
- 📊 Auto-sync to Google Sheets
- 📴 Offline support

## Accounts

CASH, KROM, BCA, JAGO, ShopeePay, DANA, GOPAY, SEABANK, Mandiri, SUPERBANK

## Categories

**Expenses:** Belanja Online, Indo/Alfa, Admin, Bensin, Makanan, Nabung/Invest, Keluarga, Bayar Paylatter, Kuliah, Kuota/WIFI, Listrik, Donate

**Income:** Gaji, Kembalian Hutang, Interest, Loan

## Setup

### 1. Google Sheet Setup

1. Create new Google Sheet
2. Add headers: `Timestamp | Tanggal | Tipe | Akun | Kategori | Jumlah | Catatan`

### 2. Google Apps Script

1. In Google Sheet: **Extensions → Apps Script**
2. Copy content from `docs/Code.gs`
3. **Deploy → New deployment → Web app**
4. Set "Who has access" to **Anyone**
5. Copy the deployment URL

### 3. Configure App

1. Open the app
2. Click ⚙️ Settings
3. Paste your Apps Script URL
4. Save

## Usage

1. Select **Pengeluaran** (expense) or **Pemasukan** (income)
2. Enter amount
3. Select account and category
4. Tap **Simpan Transaksi**

## License

MIT License - Personal use only
