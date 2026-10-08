# 💰 Financial Tracker PWA

Personal financial tracking app that syncs with Google Sheets.

## ✨ Features

- 📱 Progressive Web App (installable on mobile)
- 🎨 Modern Purple Gradient UI Theme
- 💳 Track income & expenses
- 🔄 Transfer between accounts
- 🏦 10 bank/e-wallet accounts (incl. CASH) + 5 credit/paylater accounts
- 💰 View account balances (Dashboard)
- 📊 Auto-sync to Google Sheets
- 📴 Offline queue (transactions auto-sync when back online)
- 🔐 Optional API token protection
- 🔢 Number formatting with thousand separators

## 🏦 Supported Accounts

**Bank & E-Wallet:**

- BCA
- Mandiri
- Krom
- Jago
- Sampoerna
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

### 3. (Optional) Secure the API

1. In Apps Script: **Project Settings → Script Properties → Add property**
2. Name: `API_TOKEN`, Value: a secret string
3. Enter the same token in the app's Settings

### 4. Configure App

1. Open the app
2. Click ⚙️ Settings
3. Paste your Apps Script URL (and API token if set)
4. Save

### Updating the Apps Script

After changing `docs/Code.gs`: **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same.

### Adding / Renaming Accounts

Edit the `ACCOUNTS` array at the top of `app.js` (name must match the Dashboard sheet exactly), and adjust `BANK_ROWS` / `CREDIT_ROWS` in `Code.gs` if the Dashboard layout changes.

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
