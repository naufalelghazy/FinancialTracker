/* ============================================
   Financial Tracker PWA - Application Logic
   ============================================ */

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
  saveSettingsBtn: document.getElementById("saveSettings"),
  toast: document.getElementById("toast"),
  toastIcon: document.querySelector(".toast-icon"),
  toastMessage: document.querySelector(".toast-message"),
  modalOverlay: document.querySelector(".modal-overlay"),
  // Page Navigation
  navBtns: document.querySelectorAll(".nav-btn"),
  inputPage: document.getElementById("inputPage"),
  saldoPage: document.getElementById("saldoPage"),
  // Balance Elements
  balanceList: document.getElementById("balanceList"),
  totalBalance: document.getElementById("totalBalance"),
  refreshBalance: document.getElementById("refreshBalance"),
};

// App State
let state = {
  transactionType: "pengeluaran",
  scriptUrl: localStorage.getItem("scriptUrl") || "",
};

// Initialize App
function init() {
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
  const categories = CATEGORIES[state.transactionType];
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

  // Refresh Balance
  elements.refreshBalance.addEventListener("click", fetchBalances);
}

// Handle transaction type toggle
function handleToggle(clickedBtn) {
  elements.toggleBtns.forEach((btn) => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
  state.transactionType = clickedBtn.dataset.type;
  
  // Update UI based on transaction type
  const isTransfer = state.transactionType === "transfer";
  
  // Show/hide destination account for transfer
  elements.destAccountGroup.hidden = !isTransfer;
  elements.destAccountSelect.required = isTransfer;
  
  // Show/hide category for non-transfer
  elements.categoryGroup.hidden = isTransfer;
  elements.categorySelect.required = !isTransfer;
  
  // Update account label
  elements.accountLabel.textContent = isTransfer ? "Dari Akun" : "Akun";
  
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
  const formatted = elements.amountInput.value;
  const raw = formatted.replace(/\./g, "");
  return parseInt(raw, 10) || 0;
}

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

  // Handle Transfer Mode
  if (state.transactionType === "transfer") {
    const destAccount = elements.destAccountSelect.value;
    
    if (!destAccount) {
      showToast("error", "⚠️ Pilih akun tujuan");
      return;
    }
    
    if (sourceAccount === destAccount) {
      showToast("error", "⚠️ Akun asal dan tujuan tidak boleh sama");
      return;
    }

    setLoading(true);

    try {
      // Create Pengeluaran entry (money out from source)
      const pengeluaranData = {
        tipe: "Pengeluaran",
        jumlah: jumlah,
        akun: sourceAccount,
        kategori: "Pindah Akun",
        tanggal: tanggal,
        catatan: catatan ? `Transfer ke ${destAccount}: ${catatan}` : `Transfer ke ${destAccount}`,
      };

      // Create Pemasukan entry (money in to destination)
      const pemasukanData = {
        tipe: "Pemasukan",
        jumlah: jumlah,
        akun: destAccount,
        kategori: "Pindah Akun",
        tanggal: tanggal,
        catatan: catatan ? `Transfer dari ${sourceAccount}: ${catatan}` : `Transfer dari ${sourceAccount}`,
      };

      // Send both entries
      await fetch(state.scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pengeluaranData),
      });

      await fetch(state.scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pemasukanData),
      });

      showToast("success", "✅ Transfer berhasil dicatat!");
      resetForm();

      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    } catch (error) {
      console.error("Error submitting transfer:", error);
      showToast("error", "❌ Gagal menyimpan. Coba lagi.");
    } finally {
      setLoading(false);
    }
    return;
  }

  // Handle Regular Transaction (Pemasukan/Pengeluaran)
  const kategori = elements.categorySelect.value;
  
  if (!kategori) {
    showToast("error", "⚠️ Pilih kategori transaksi");
    return;
  }

  const formData = {
    tipe: state.transactionType === "pemasukan" ? "Pemasukan" : "Pengeluaran",
    jumlah: jumlah,
    akun: sourceAccount,
    kategori: kategori,
    tanggal: tanggal,
    catatan: catatan,
  };

  setLoading(true);

  try {
    await fetch(state.scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    showToast("success", "✅ Transaksi berhasil disimpan!");
    resetForm();

    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  } catch (error) {
    console.error("Error submitting transaction:", error);
    showToast("error", "❌ Gagal menyimpan. Coba lagi.");
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

  if (url && !isValidUrl(url)) {
    showToast("error", "⚠️ URL tidak valid");
    return;
  }

  state.scriptUrl = url;
  localStorage.setItem("scriptUrl", url);

  showToast("success", "✅ Pengaturan disimpan!");
  closeSettings();
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
function showToast(type, message) {
  elements.toast.className = `toast ${type}`;
  elements.toastMessage.textContent = message;
  elements.toast.hidden = false;

  // Trigger reflow for animation
  elements.toast.offsetHeight;
  elements.toast.classList.add("show");

  // Auto hide after 3 seconds
  setTimeout(() => {
    elements.toast.classList.remove("show");
    setTimeout(() => {
      elements.toast.hidden = true;
    }, 300);
  }, 3000);
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
  
  // Switch pages
  if (page === "input") {
    elements.inputPage.hidden = false;
    elements.saldoPage.hidden = true;
  } else if (page === "saldo") {
    elements.inputPage.hidden = true;
    elements.saldoPage.hidden = false;
    // Fetch balances when switching to saldo page
    fetchBalances();
  }
  
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// ============================================
// BALANCE FUNCTIONS
// ============================================

// Account icons mapping (WebP images)
const ACCOUNT_ICONS = {
  BCA: "icons/banks/bca.webp",
  MANDIRI: "icons/banks/mandiri.webp",
  KROM: "icons/banks/krom.webp",
  JAGO: "icons/banks/jago.webp",
  SUPERBANK: "icons/banks/superbank.webp",
  SEABANK: "icons/banks/seabank.webp",
  GOPAY: "icons/banks/gopay.webp",
  SHOPEEPAY: "icons/banks/shopeepay.webp",
  DANA: "icons/banks/dana.webp",
};

// Fetch balances from Google Sheets via Apps Script
async function fetchBalances() {
  if (!state.scriptUrl) {
    showToast("error", "⚠️ Silakan atur URL Google Apps Script di Settings");
    return;
  }
  
  // Show loading state
  elements.balanceList.innerHTML = `
    <div class="loading-placeholder">
      <span>⏳ Memuat data...</span>
    </div>
  `;
  
  try {
    // Fetch balance data from Apps Script
    const response = await fetch(state.scriptUrl + "?action=getBalances");
    const data = await response.json();
    
    if (data.status === "success") {
      displayBalances(data.balances);
    } else {
      throw new Error(data.message || "Failed to fetch balances");
    }
  } catch (error) {
    console.error("Error fetching balances:", error);
    elements.balanceList.innerHTML = `
      <div class="loading-placeholder">
        <span>❌ Gagal memuat data. Coba refresh lagi.</span>
      </div>
    `;
  }
}

// Display balances in the UI
function displayBalances(balances) {
  let totalSaldo = 0;
  let html = "";
  
  for (const [account, amount] of Object.entries(balances)) {
    totalSaldo += amount;
    const iconPath = ACCOUNT_ICONS[account];
    const iconHtml = iconPath 
      ? `<img src="${iconPath}" class="account-icon-img" alt="${account}">`
      : `<span class="account-icon-emoji">💰</span>`;
    const formattedAmount = formatCurrency(amount);
    const amountClass = amount >= 0 ? "positive" : "negative";
    
    html += `
      <div class="balance-card">
        <div class="account-info">
          ${iconHtml}
          <span class="account-name">${account}</span>
        </div>
        <span class="balance-amount ${amountClass}">${formattedAmount}</span>
      </div>
    `;
  }
  
  elements.balanceList.innerHTML = html || '<div class="loading-placeholder"><span>Tidak ada data</span></div>';
  elements.totalBalance.textContent = formatCurrency(totalSaldo);
}

// Format number as Indonesian Rupiah
function formatCurrency(amount) {
  const prefix = amount < 0 ? "-Rp " : "Rp ";
  return prefix + Math.abs(amount).toLocaleString("id-ID");
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
