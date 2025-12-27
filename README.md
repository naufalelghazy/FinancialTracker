# 💰 Financial Tracker PWA

Personal financial tracking app that syncs with Google Sheets.

## ✨ Features

- 📱 Progressive Web App (installable on mobile)
- 🎨 Modern Purple Gradient UI Theme
- 💳 Track income & expenses
- 🔄 Transfer between accounts
- 🏦 10 bank accounts with custom icons
- 💰 View account balances (Dashboard)
- 📊 Auto-sync to Google Sheets
- 📴 Offline support
- 🔢 Number formatting with thousand separators

## 🏦 Supported Accounts

| Account   | Icon                                     |
| --------- | ---------------------------------------- |
| CASH      | 💵                                       |
| BCA       | ![BCA](icons/banks/bca.webp)             |
| MANDIRI   | ![Mandiri](icons/banks/mandiri.webp)     |
| KROM      | ![Krom](icons/banks/krom.webp)           |
| JAGO      | ![Jago](icons/banks/jago.webp)           |
| SUPERBANK | ![Superbank](icons/banks/superbank.webp) |
| SEABANK   | ![Seabank](icons/banks/seabank.webp)     |
| GOPAY     | ![GoPay](icons/banks/gopay.webp)         |
| SHOPEEPAY | ![ShopeePay](icons/banks/shopeepay.webp) |
| DANA      | ![Dana](icons/banks/dana.webp)           |

## 📂 Categories

**Pengeluaran (Expenses):**
Kesehatan/Healthcare, Selfcare, Subscriptions, Makan, Coffee/Snack, Admin, Bensin, Parkir, Service Motor, Makanan Pokok, Minuman Pokok, Kitchen Essential, Nabung/Invest, Listrik, WIFI, Internet Package, Laundry, Toiletries, Keluarga, Bayar Paylatter, Kuliah, Hobby/Entertainment, Donate, Kondangan/Kado, Annual Expenses, Biaya Tak Terduga

**Pemasukan (Income):**
Gaji, Kembalian Hutang, Interest, Loan, Cashback, Gift

## 🚀 Setup

### 1. Google Sheet Setup

1. Create new Google Sheet
2. Create 2 sheets: `Main` (for transactions) and `Dashboard` (for balances)
3. Main sheet headers: `Timestamp | Tanggal | Tipe | Akun | Kategori | Jumlah | Catatan`

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

## 📖 Usage

### Input Transaction

1. Select **Keluar** (expense), **Transfer**, or **Masuk** (income)
2. Enter amount (auto-formatted with dots)
3. Select account and category
4. Tap **Simpan Transaksi**

### Transfer Between Accounts

1. Select **Transfer** tab
2. Choose source account (Dari Akun)
3. Choose destination account (Ke Akun)
4. Enter amount and save

### View Balances

1. Tap **Saldo** on bottom navigation
2. View all account balances
3. Tap 🔄 Refresh to update

## 🛠️ Tech Stack

- HTML5, CSS3, JavaScript (Vanilla)
- Google Apps Script (Backend)
- Google Sheets (Database)
- Service Worker (PWA/Offline)

## 📄 License

MIT License - Personal use only
