/* ============================================
   Financial Tracker PWA - Application Logic
   ============================================ */

// Categories Configuration
const CATEGORIES = {
  pengeluaran: [
    { value: "Belanja Online", emoji: "🛒" },
    { value: "Indo/Alfa", emoji: "🏪" },
    { value: "Admin", emoji: "💳" },
    { value: "Bensin", emoji: "⛽" },
    { value: "Makanan", emoji: "🍔" },
    { value: "Nabung/Invest", emoji: "💰" },
    { value: "Keluarga", emoji: "👨‍👩‍👧" },
    { value: "Bayar Paylatter", emoji: "📱" },
    { value: "Kuliah", emoji: "🎓" },
    { value: "Kuota/WIFI", emoji: "📶" },
    { value: "Listrik", emoji: "💡" },
    { value: "Donate", emoji: "❤️" },
  ],
  pemasukan: [
    { value: "Gaji", emoji: "💵" },
    { value: "Kembalian Hutang", emoji: "🔄" },
    { value: "Interest", emoji: "📈" },
    { value: "Loan", emoji: "🤝" },
  ],
};

// DOM Elements
const elements = {
  form: document.getElementById("transactionForm"),
  toggleBtns: document.querySelectorAll(".toggle-btn"),
  amountInput: document.getElementById("amount"),
  accountSelect: document.getElementById("account"),
  categorySelect: document.getElementById("category"),
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

  // Register service worker for PWA
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.log("Service Worker registration failed:", err);
    });
  }
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

  // Format amount on blur
  elements.amountInput.addEventListener("blur", formatAmount);

  // Prevent form submission on Enter in certain fields
  elements.notesInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  });
}

// Handle transaction type toggle
function handleToggle(clickedBtn) {
  elements.toggleBtns.forEach((btn) => btn.classList.remove("active"));
  clickedBtn.classList.add("active");
  state.transactionType = clickedBtn.dataset.type;
  updateCategories();

  // Add haptic feedback if available
  if (navigator.vibrate) {
    navigator.vibrate(10);
  }
}

// Format amount input
function formatAmount() {
  const value = elements.amountInput.value;
  if (value) {
    elements.amountInput.value = Math.abs(parseInt(value, 10)) || "";
  }
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

  // Get form data
  const formData = {
    tipe: state.transactionType === "pemasukan" ? "Pemasukan" : "Pengeluaran",
    jumlah: parseInt(elements.amountInput.value, 10),
    akun: elements.accountSelect.value,
    kategori: elements.categorySelect.value,
    tanggal: elements.dateInput.value,
    catatan: elements.notesInput.value.trim(),
  };

  // Validate required fields
  if (
    !formData.jumlah ||
    !formData.akun ||
    !formData.kategori ||
    !formData.tanggal
  ) {
    showToast("error", "⚠️ Mohon lengkapi semua field yang diperlukan");
    return;
  }

  // Show loading state
  setLoading(true);

  try {
    // Send data to Google Apps Script
    const response = await fetch(state.scriptUrl, {
      method: "POST",
      mode: "no-cors", // Required for Apps Script
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    // Since no-cors doesn't return response, assume success
    showToast("success", "✅ Transaksi berhasil disimpan!");

    // Reset form
    resetForm();

    // Haptic feedback
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

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
