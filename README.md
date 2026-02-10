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

**Bank & E-Wallet:**

- BCA
- Mandiri
- Krom
- Jago
- Superbank
- Seabank
- GOPAY
- SHOPEEPAY
- DANA

**Kartu Kredit & Paylater:**

- 💳 Honest Card
- 💳 Nex Card
- 💳 Kredivo
- 💳 Spaylatter
- 💳 Jago Loan

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

### Use Credit Card / Paylater

**Belanja dengan Kartu Kredit:**

1. Select **Keluar** (expense)
2. Choose credit card account (e.g., HONEST_CARD)
3. Select category and enter amount
4. Save - debt will be tracked as negative balance

**Bayar Tagihan:**

1. Select **Transfer**
2. From account: Your bank (e.g., BCA)
3. To account: Credit card (e.g., HONEST_CARD)
4. Enter payment amount and save

**View Credit Debt:**

- Credit cards show with 💳 icon and "KREDIT" badge
- Negative balance = debt (shown in red)
- Positive balance = overpayment (shown in green)

## 🛠️ Tech Stack

- HTML5, CSS3, JavaScript (Vanilla)
- Google Apps Script (Backend)
- Google Sheets (Database)
- Service Worker (PWA/Offline)

## 📄 License

MIT License - Personal use only
