/* ============================================
   Financial Tracker PWA - Application Logic
   ============================================ */

// Accounts Configuration (single source of truth)
// IMPORTANT: `value` must EXACTLY match the account names in Google Sheets
// type: "bank" = bank & e-wallet (Saldo tab), "credit" = credit card / paylater (Tagihan tab)
const ACCOUNTS = [
  { value: "CASH", emoji: "💵", type: "bank" },
  { value: "BCA", emoji: "🔵", type: "bank", icon: "icons/banks/bca.webp" },
  { value: "MANDIRI", emoji: "🟡", type: "bank", icon: "icons/banks/mandiri.webp" },
  { value: "KROM", emoji: "🟣", type: "bank", icon: "icons/banks/krom.webp" },
  { value: "JAGO", emoji: "🟡", type: "bank", icon: "icons/banks/jago.webp" },
  { value: "SAMPOERNA", emoji: "🟠", type: "bank", icon: "icons/banks/sampoerna.webp" },
  { value: "SEABANK", emoji: "🔵", type: "bank", icon: "icons/banks/seabank.webp" },
  { value: "GOPAY", emoji: "🟢", type: "bank", icon: "icons/banks/gopay.webp" },
  { value: "SHOPEEPAY", emoji: "🟠", type: "bank", icon: "icons/banks/shopeepay.webp" },
  { value: "DANA", emoji: "🔵", type: "bank", icon: "icons/banks/dana.webp" },
  { value: "Honest Card", emoji: "💳", type: "credit", icon: "icons/banks/honest.webp" },
  { value: "Nex Card", emoji: "💳", type: "credit", icon: "icons/banks/nex.webp" },
  { value: "Kredivo", emoji: "💳", type: "credit", icon: "icons/banks/kredivo.webp" },
  { value: "Spaylatter", emoji: "💳", type: "credit", icon: "icons/banks/spaylatter.webp" },
  { value: "Jago Loan", emoji: "💳", type: "credit", icon: "icons/banks/jagoloan.webp" },
];

// Derived lookups
const CREDIT_ACCOUNTS = new Set(
  ACCOUNTS.filter((a) => a.type === "credit").map((a) => a.value)
);
const ACCOUNT_ICONS = Object.fromEntries(
  ACCOUNTS.filter((a) => a.icon).map((a) => [a.value, a.icon])
);

// Categories Configuration
const CATEGORIES = {
  pengeluaran: [
    { value: "Kesehatan/Healthcare", emoji: "🏥" },
    { value: "Selfcare", emoji: "💆" },
    { value: "Subscriptions", emoji: "📺" },
    { value: "Makan", emoji: "🍔" },
    { value: "Coffee/Snack", emoji: "☕" },
    { value: "Admin", emoji: "💳" },
    { value: "Bensin", emoji: "⛽" },
    { value: "Parkir", emoji: "🅿️" },
    { value: "Service Motor", emoji: "🏍️" },
    { value: "Makanan Pokok", emoji: "🍚" },
    { value: "Minuman Pokok", emoji: "🥛" },
    { value: "Kitchen Essential", emoji: "🍳" },
    { value: "Nabung/Invest", emoji: "💰" },
    { value: "Listrik", emoji: "💡" },
    { value: "WIFI", emoji: "📶" },
    { value: "Internet Package", emoji: "📱" },
    { value: "Laundry", emoji: "👕" },
    { value: "Toiletries", emoji: "🧴" },
    { value: "Keluarga", emoji: "👨‍👩‍👧" },
    { value: "Bayar Paylatter", emoji: "💳" },
    { value: "Kuliah", emoji: "🎓" },
    { value: "Hobby/Entertainment", emoji: "🎮" },
    { value: "Donate", emoji: "❤️" },
    { value: "Kondangan/Kado", emoji: "🎁" },
    { value: "Annual Expenses", emoji: "📅" },
    { value: "Biaya Tak Terduga", emoji: "⚠️" },
  ],
  pemasukan: [
    { value: "Gaji", emoji: "💵" },
    { value: "Kembalian Hutang", emoji: "🔙" },
    { value: "Interest", emoji: "📈" },
    { value: "Loan", emoji: "🤝" },
    { value: "Cashback", emoji: "💸" },
    { value: "Gift", emoji: "🎁" },
  ],
};

// DOM Elements
const elements = {
  form: document.getElementById("transactionForm"),
  toggleBtns: document.querySelectorAll(".toggle-btn"),
  amountInput: document.getElementById("amount"),
  accountSelect: document.getElementById("account"),
  accountLabel: document.getElementById("accountLabel"),
  destAccountSelect: document.getElementById("destAccount"),
  destAccountGroup: document.getElementById("destAccountGroup"),
  categorySelect: document.getElementById("category"),
  categoryGroup: document.getElementById("categoryGroup"),
  dateInput: document.getElementById("date"),
  notesInput: document.getElementById("notes"),
  submitBtn: document.getElementById("submitBtn"),
  btnText: document.querySelector(".btn-text"),
  btnLoader: document.querySelector(".btn-loader"),
  settingsBtn: document.getElementById("settingsBtn"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettings: document.getElementById("closeSettings"),
  scriptUrlInput: document.getElementById("scriptUrl"),
  apiTokenInput: document.getElementById("apiToken"),
  saveSettingsBtn: document.getElementById("saveSettings"),
  toast: document.getElementById("toast"),
  toastIcon: document.querySelector(".toast-icon"),
  toastMessage: document.querySelector(".toast-message"),
  modalOverlay: document.querySelector(".modal-overlay"),
  // Page Navigation
  navBtns: document.querySelectorAll(".nav-btn"),
  inputPage: document.getElementById("inputPage"),
  saldoPage: document.getElementById("saldoPage"),
  tagihanPage: document.getElementById("tagihanPage"),
  // Balance Elements
  balanceList: document.getElementById("balanceList"),
  totalBalance: document.getElementById("totalBalance"),
  refreshBalance: document.getElementById("refreshBalance"),
  // Bills Elements
  billsList: document.getElementById("billsList"),
  refreshBills: document.getElementById("refreshBills"),
};

// App State
let state = {
  transactionType: "pengeluaran",
  scriptUrl: localStorage.getItem("scriptUrl") || "",
  apiToken: localStorage.getItem("apiToken") || "",
  isSyncing: false,
};

// Initialize App
function init() {
  populateAccountSelects();
  setDefaultDate();
  updateCategories();
  loadSettings();
  attachEventListeners();
  setInitialUIState();

  // Register service worker for PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.log("Service Worker registration failed:", err);
    });
  }

  // Try to send any transactions saved while offline
  flushPendingQueue();
}

// Fill both account dropdowns from ACCOUNTS config
function populateAccountSelects() {
  [elements.accountSelect, elements.destAccountSelect].forEach((select) => {
    ACCOUNTS.forEach((acc) => {
      const option = document.createElement("option");
      option.value = acc.value;
      option.textContent = `${acc.emoji} ${acc.value}`;
      select.appendChild(option);
    });
  });
}

// Set initial UI state based on default transaction type
function setInitialUIState() {
  const isTransfer = state.transactionType === "transfer";
  elements.destAccountGroup.hidden = !isTransfer;
  elements.destAccountSelect.required = isTransfer;
  elements.categoryGroup.hidden = isTransfer;
  elements.categorySelect.required = !isTransfer;
  elements.accountLabel.textContent = isTransfer ? "Dari Akun" : "Akun";
}

// Set default date to today
function setDefaultDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  elements.dateInput.value = `${year}-${month}-${day}`;
}

// Update categories based on transaction type
function updateCategories() {
  const categories = CATEGORIES[state.transactionType] || [];
  elements.categorySelect.innerHTML =
    '<option value="">Pilih Kategori</option>';

  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat.value;
    option.textContent = `${cat.emoji} ${cat.value}`;
    elements.categorySelect.appendChild(option);
  });
}

// Load settings from localStorage
function loadSettings() {
  if (state.scriptUrl) {
    elements.scriptUrlInput.value = state.scriptUrl;
  }
  if (state.apiToken) {
    elements.apiTokenInput.value = state.apiToken;
  }
}

// Attach event listeners
function attachEventListeners() {
  // Transaction type toggle
  elements.toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => handleToggle(btn));
  });

  // Form submission
  elements.form.addEventListener("submit", handleSubmit);

  // Settings modal
  elements.settingsBtn.addEventListener("click", openSettings);
  elements.closeSettings.addEventListener("click", closeSettings);
  elements.modalOverlay.addEventListener("click", closeSettings);
  elements.saveSettingsBtn.addEventListener("click", saveSettings);

  // Format amount on input (show dots for thousands)
  elements.amountInput.addEventListener("input", formatAmountDisplay);

  // Prevent form submission on Enter in certain fields
  elements.notesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  });

  // Page Navigation
  elements.navBtns.forEach((btn) => {
    btn.addEventListener("click", () => handlePageSwitch(btn));
  });

  // Refresh Balance - force refresh to bypass cache
  elements.refreshBalance.addEventListener("click", () => {
    fetchBalances(true); // forceRefresh = true
  });

  // Refresh Bills - force refresh to bypass cache
  elements.refreshBills.addEventListener("click", () => {
    fetchBills(true); // forceRefresh = true
  });

  // Sync offline queue when connection comes back
  window.addEventListener("online", flushPendingQueue);
}

// Handle transaction type toggle
function handleToggle(clickedBtn) {
  elements.toggleBtns.forEach((btn) => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
  state.transactionType = clickedBtn.dataset.type;

  // Update UI based on transaction type
  setInitialUIState();

  // Update categories
  updateCategories();

  // Add haptic feedback if available
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// Format amount display with thousand separators (dots)
function formatAmountDisplay(e) {
  // Get raw numbers only
  let value = e.target.value.replace(/\D/g, "");

  // Remove leading zeros
  value = value.replace(/^0+/, "") || "";

  // Format with dots for thousands
  if (value) {
    value = parseInt(value, 10).toLocaleString("id-ID");
  }

  // Update input value
  e.target.value = value;
}

// Get raw amount value (without dots)
function getRawAmount() {
  const raw = elements.amountInput.value.replace(/\D/g, "");
  return parseInt(raw, 10) || 0;
}

// ============================================
// API LAYER
// ============================================

class ApiError extends Error {}

// Generate a unique request id (used by the backend to ignore duplicate retries)
function generateId() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Send a batch of transactions to Apps Script.
// Uses text/plain (a "simple" CORS request) instead of no-cors,
// so the JSON response can actually be read and errors are detected.
async function postTransactions(payload) {
  let response;
  try {
    response = await fetch(state.scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...payload, token: state.apiToken }),
    });
  } catch (networkError) {
    // Network failure (offline, DNS, etc.) - caller may queue it
    throw networkError;
  }

  let data;
  try {
    data = await response.json();
  } catch (_) {
    throw new ApiError(
      "Respons server tidak valid. Pastikan Apps Script sudah di-deploy ulang dengan akses 'Anyone'."
    );
  }

  if (data.status !== "success") {
    throw new ApiError(data.message || "Gagal menyimpan data");
  }
  return data;
}

// Build the API URL for GET requests
function buildGetUrl(action) {
  const url = new URL(state.scriptUrl);
  url.searchParams.set("action", action);
  if (state.apiToken) url.searchParams.set("token", state.apiToken);
  return url.toString();
}

// ============================================
// OFFLINE QUEUE
// ============================================

const QUEUE_KEY = "pendingTransactions";

function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
  } catch (_) {
    return [];
  }
}

function setQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function enqueue(payload) {
  const queue = getQueue();
  queue.push(payload);
  setQueue(queue);
}

// Send queued transactions one by one (in order)
async function flushPendingQueue() {
  if (state.isSyncing || !state.scriptUrl || !navigator.onLine) return;
  let queue = getQueue();
  if (queue.length === 0) return;

  state.isSyncing = true;
  let sent = 0;

  try {
    while (queue.length > 0) {
      await postTransactions(queue[0]);
      queue.shift();
      setQueue(queue);
      sent++;
    }
  } catch (error) {
    console.error("Queue sync stopped:", error);
    if (error instanceof ApiError) {
      showToast("error", `❌ Sinkron gagal: ${error.message}`);
    }
  } finally {
    state.isSyncing = false;
  }

  if (sent > 0) {
    invalidateBalanceCache();
    showToast("success", `🔄 ${sent} transaksi offline berhasil disinkron`);
  }
}

// ============================================
// FORM SUBMISSION
// ============================================

// Handle form submission
async function handleSubmit(e) {
  e.preventDefault();

  // Validate script URL
  if (!state.scriptUrl) {
    showToast("error", "⚠️ Silakan atur URL Google Apps Script di Settings");
    openSettings();
    return;
  }

  const jumlah = getRawAmount();
  const sourceAccount = elements.accountSelect.value;
  const tanggal = elements.dateInput.value;
  const catatan = elements.notesInput.value.trim();

  // Validate common required fields
  if (!jumlah || !sourceAccount || !tanggal) {
    showToast("error", "⚠️ Mohon lengkapi semua field yang diperlukan");
    return;
  }

  let transactions;
  let successMessage;

  if (state.transactionType === "transfer") {
    // Handle Transfer Mode
    const destAccount = elements.destAccountSelect.value;

    if (!destAccount) {
      showToast("error", "⚠️ Pilih akun tujuan");
      return;
    }

    if (sourceAccount === destAccount) {
      showToast("error", "⚠️ Akun asal dan tujuan tidak boleh sama");
      return;
    }

    // Both legs are sent in ONE request so they are saved atomically
    transactions = [
      {
        // Pengeluaran entry (money out from source)
        tipe: "Pengeluaran",
        jumlah,
        akun: sourceAccount,
        kategori: "Pindah Akun",
        tanggal,
        catatan: catatan
          ? `Transfer ke ${destAccount}: ${catatan}`
          : `Transfer ke ${destAccount}`,
      },
      {
        // Pemasukan entry (money in to destination)
        tipe: "Pemasukan",
        jumlah,
        akun: destAccount,
        kategori: "Pindah Akun",
        tanggal,
        catatan: catatan
          ? `Transfer dari ${sourceAccount}: ${catatan}`
          : `Transfer dari ${sourceAccount}`,
      },
    ];
    successMessage = "✅ Transfer berhasil dicatat!";
  } else {
    // Handle Regular Transaction (Pemasukan/Pengeluaran)
    const kategori = elements.categorySelect.value;

    if (!kategori) {
      showToast("error", "⚠️ Pilih kategori transaksi");
      return;
    }

    transactions = [
      {
        tipe:
          state.transactionType === "pemasukan" ? "Pemasukan" : "Pengeluaran",
        jumlah,
        akun: sourceAccount,
        kategori,
        tanggal,
        catatan,
      },
    ];
    successMessage = "✅ Transaksi berhasil disimpan!";
  }

  const payload = { requestId: generateId(), transactions };

  // Offline: save locally and sync later
  if (!navigator.onLine) {
    enqueue(payload);
    showToast("warning", "📴 Offline — disimpan & akan disinkron otomatis");
    resetForm();
    return;
  }

  setLoading(true);

  try {
    await postTransactions(payload);
    invalidateBalanceCache();
    showToast("success", successMessage);
    resetForm();

    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    if (error instanceof ApiError) {
      // Server rejected the data - keep the form so the user can fix/retry
      showToast("error", `❌ ${error.message}`);
    } else {
      // Network error - queue it so nothing is lost
      enqueue(payload);
      showToast("warning", "📴 Koneksi gagal — disimpan & akan disinkron");
      resetForm();
    }
  } finally {
    setLoading(false);
  }
}

// Reset form after successful submission
function resetForm() {
  elements.amountInput.value = "";
  elements.accountSelect.value = "";
  elements.destAccountSelect.value = "";
  elements.categorySelect.value = "";
  elements.notesInput.value = "";
  setDefaultDate();

  // Focus on amount input for next entry
  elements.amountInput.focus();
}

// Set loading state
function setLoading(isLoading) {
  elements.submitBtn.disabled = isLoading;
  elements.btnText.hidden = isLoading;
  elements.btnLoader.hidden = !isLoading;
}

// Settings Modal Functions
function openSettings() {
  elements.settingsModal.hidden = false;
  elements.scriptUrlInput.focus();
  document.body.style.overflow = "hidden";
}

function closeSettings() {
  elements.settingsModal.hidden = true;
  document.body.style.overflow = "";
}

function saveSettings() {
  const url = elements.scriptUrlInput.value.trim();
  const token = elements.apiTokenInput.value.trim();

  if (url && !isValidUrl(url)) {
    showToast("error", "⚠️ URL tidak valid");
    return;
  }

  state.scriptUrl = url;
  state.apiToken = token;
  localStorage.setItem("scriptUrl", url);
  localStorage.setItem("apiToken", token);
  invalidateBalanceCache();

  showToast("success", "✅ Pengaturan disimpan!");
  closeSettings();
  flushPendingQueue();
}

// URL Validation
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return (
      url.protocol === "https:" && url.hostname.includes("script.google.com")
    );
  } catch (_) {
    return false;
  }
}

// Toast Notification
let toastTimer = null;
let toastHideTimer = null;

function showToast(type, message) {
  // Cancel any pending hide so rapid toasts don't flicker
  clearTimeout(toastTimer);
  clearTimeout(toastHideTimer);

  elements.toast.className = `toast ${type}`;
  elements.toastMessage.textContent = message;
  elements.toast.hidden = false;

  // Trigger reflow for animation
  elements.toast.offsetHeight;
  elements.toast.classList.add("show");

  // Auto hide after 3 seconds
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
    toastHideTimer = setTimeout(() => {
      elements.toast.hidden = true;
    }, 300);
  }, 3000);
}

// Escape text before inserting into innerHTML
function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

// ============================================
// PAGE NAVIGATION
// ============================================

// Handle page switch from bottom nav
function handlePageSwitch(clickedBtn) {
  const page = clickedBtn.dataset.page;

  // Update nav buttons
  elements.navBtns.forEach((btn) => btn.classList.remove("active"));
  clickedBtn.classList.add("active");

  // Hide all pages
  elements.inputPage.hidden = true;
  elements.saldoPage.hidden = true;
  elements.tagihanPage.hidden = true;

  // Show selected page
  if (page === "input") {
    elements.inputPage.hidden = false;
  } else if (page === "saldo") {
    elements.saldoPage.hidden = false;
    // Fetch balances when switching to saldo page
    fetchBalances();
  } else if (page === "tagihan") {
    elements.tagihanPage.hidden = false;
    // Fetch bills when switching to tagihan page
    fetchBills();
  }

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// ============================================
// BALANCE FUNCTIONS
// ============================================

// Data caching to reduce API calls
let cachedBalances = null;
let cacheTimestamp = null;
const CACHE_DURATION = 60000; // 60 seconds (1 minute)

function invalidateBalanceCache() {
  cachedBalances = null;
  cacheTimestamp = null;
}

// Centralized function to fetch account data with caching
async function fetchAccountData(forceRefresh = false) {
  if (!state.scriptUrl) {
    showToast("error", "⚠️ Silakan atur URL Google Apps Script di Settings");
    return null;
  }

  const now = Date.now();

  // Return cached data if valid
  if (!forceRefresh && cachedBalances && now - cacheTimestamp < CACHE_DURATION) {
    return cachedBalances;
  }

  try {
    // Fetch new data
    const response = await fetch(buildGetUrl("getBalances"));
    const data = await response.json();

    if (data.status === "success") {
      // Update cache
      cachedBalances = data.balances;
      cacheTimestamp = now;
      return cachedBalances;
    } else {
      throw new Error(data.message || "Failed to fetch data");
    }
  } catch (error) {
    console.error("Error fetching account data:", error);
    showToast("error", "❌ Gagal memuat data");
    return null;
  }
}

// Fetch balances from Google Sheets via Apps Script
async function fetchBalances(forceRefresh = false) {
  // Show loading state
  elements.balanceList.innerHTML = `
    <div class="loading-placeholder">
      <span>⏳ Memuat data...</span>
    </div>
  `;

  const balances = await fetchAccountData(forceRefresh);

  if (balances) {
    displayBalances(balances);
  } else {
    elements.balanceList.innerHTML = `
      <div class="loading-placeholder">
        <span>❌ Gagal memuat data. Coba refresh lagi.</span>
      </div>
    `;
  }
}

// Helper function to generate account icon HTML
function getAccountIconHTML(account, fallbackEmoji = "💰") {
  const iconPath = ACCOUNT_ICONS[account];
  return iconPath
    ? `<img src="${iconPath}" class="account-icon-img" alt="${escapeHTML(account)}">`
    : `<span class="account-icon-emoji">${fallbackEmoji}</span>`;
}

// Display balances in the UI
function displayBalances(balances) {
  // Filter non-credit accounts
  const bankAccounts = Object.entries(balances).filter(
    ([account]) => !CREDIT_ACCOUNTS.has(account)
  );

  // Calculate total
  const totalSaldo = bankAccounts.reduce((sum, [, amount]) => sum + amount, 0);

  // Generate HTML
  const html = bankAccounts
    .map(([account, amount]) => {
      const iconHtml = getAccountIconHTML(account, "💰");
      const formattedAmount = formatCurrency(amount);
      const amountClass = amount >= 0 ? "positive" : "negative";

      return `
      <div class="balance-card">
        <div class="account-info">
          ${iconHtml}
          <span class="account-name">${escapeHTML(account)}</span>
        </div>
        <span class="balance-amount ${amountClass}">${formattedAmount}</span>
      </div>
    `;
    })
    .join("");

  elements.balanceList.innerHTML =
    html || '<div class="loading-placeholder"><span>Tidak ada data</span></div>';
  elements.totalBalance.textContent = formatCurrency(totalSaldo);
}

// Format number as Indonesian Rupiah
function formatCurrency(amount) {
  const prefix = amount < 0 ? "-Rp " : "Rp ";
  return prefix + Math.abs(amount).toLocaleString("id-ID");
}

// ============================================
// BILLS FUNCTIONS
// ============================================

// Fetch credit card bills (accounts with negative balance)
async function fetchBills(forceRefresh = false) {
  // Show loading state
  elements.billsList.innerHTML = `
    <div class="loading-placeholder">
      <span>⏳ Memuat data...</span>
    </div>
  `;

  const balances = await fetchAccountData(forceRefresh);

  if (balances) {
    displayBills(balances);
  } else {
    elements.billsList.innerHTML = `
      <div class="loading-placeholder">
        <span>❌ Gagal memuat data. Coba refresh lagi.</span>
      </div>
    `;
  }
}

// Display credit card bills in the UI
function displayBills(balances) {
  // Filter credit accounts
  const creditAccounts = Object.entries(balances).filter(([account]) =>
    CREDIT_ACCOUNTS.has(account)
  );

  // Calculate total debt (only negative balances)
  const totalDebt = creditAccounts
    .filter(([, amount]) => amount < 0)
    .reduce((sum, [, amount]) => sum + Math.abs(amount), 0);

  // Generate HTML for all credit accounts
  const html = creditAccounts
    .map(([account, amount]) => {
      const iconHtml = getAccountIconHTML(account, "💳");
      const displayAmount = amount < 0 ? Math.abs(amount) : 0;
      const formattedAmount = formatCurrency(displayAmount);

      return `
      <div class="bill-card">
        <div class="bill-info">
          ${iconHtml}
          <div class="bill-details">
            <span class="bill-account">${escapeHTML(account)}</span>
            <span class="bill-label">Tagihan</span>
          </div>
        </div>
        <span class="bill-amount">${formattedAmount}</span>
      </div>
    `;
    })
    .join("");

  // Show message if no credit accounts found
  if (html === "") {
    elements.billsList.innerHTML = `
      <div class="no-bills">
        <span class="no-bills-icon">✅</span>
        <span class="no-bills-text">Tidak ada tagihan</span>
        <span class="no-bills-subtext">Semua kartu kredit sudah lunas!</span>
      </div>
    `;
    return;
  }

  // Add total debt card at the top
  const totalCard = `
    <div class="total-debt-card">
      <span class="total-debt-label">Total Tagihan</span>
      <span class="total-debt-amount">${formatCurrency(totalDebt)}</span>
    </div>
  `;

  elements.billsList.innerHTML = totalCard + html;
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
