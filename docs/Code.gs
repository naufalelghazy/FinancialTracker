/**
 * Financial Tracker - Google Apps Script
 *
 * INSTRUKSI SETUP:
 * 1. Buka Google Sheet Anda
 * 2. Klik Extensions > Apps Script
 * 3. Hapus semua code default
 * 4. Copy-paste seluruh code ini
 * 5. Klik Deploy > New deployment
 * 6. Pilih type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Klik Deploy dan copy URL-nya
 * 10. Masukkan URL tersebut ke Settings di aplikasi
 *
 * UPDATE DARI VERSI LAMA (URL tetap sama):
 * Deploy > Manage deployments > ✏️ Edit > Version: "New version" > Deploy
 *
 * KEAMANAN (opsional tapi disarankan):
 * Project Settings > Script Properties > Add property
 *   Name : API_TOKEN
 *   Value: token rahasia Anda (isi yang sama di Settings aplikasi)
 * Jika API_TOKEN tidak diisi, API tetap terbuka seperti versi lama.
 *
 * STRUKTUR KOLOM DI SHEET "Main":
 * A: Timestamp     (otomatis dari Apps Script)
 * B: Tanggal       (tanggal transaksi)
 * C: Tipe          (Pemasukan/Pengeluaran)
 * D: Akun          (nama bank/e-wallet)
 * E: Kategori      (kategori transaksi)
 * F: Jumlah        (nominal uang)
 * G: Catatan       (notes opsional)
 */

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  SHEET_MAIN: "Main",
  SHEET_DASHBOARD: "Dashboard",
  // Dashboard layout: [startRow, endRow] for account name (col C) & balance (col D)
  BANK_ROWS: [7, 16], // Bank & E-wallet (10 accounts)
  CREDIT_ROWS: [21, 25], // Credit cards (5 accounts)
  TOTAL_ROW: 17,
  NAME_COL: 3, // Column C
  VALID_TYPES: ["Pemasukan", "Pengeluaran"],
  DEDUPE_TTL_SECONDS: 21600, // 6 hours
};

// ============================================
// HELPERS
// ============================================
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function errorResponse(message) {
  return jsonResponse({ status: "error", message: message });
}

// Returns true if no API_TOKEN is configured, or if the token matches
function isAuthorized(token) {
  const cache = CacheService.getScriptCache();
  let expected = cache.get("API_TOKEN_CACHE");
  if (expected === null) {
    expected =
      PropertiesService.getScriptProperties().getProperty("API_TOKEN") || "";
    cache.put("API_TOKEN_CACHE", expected, CONFIG.DEDUPE_TTL_SECONDS);
  }
  return !expected || token === expected;
}

function getSheetOrThrow(name) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error("Sheet " + name + " tidak ditemukan");
  return sheet;
}

// Validate a single transaction and return a normalized copy
function validateTransaction(t, index) {
  const label = "Transaksi #" + (index + 1) + ": ";
  if (!t || typeof t !== "object") throw new Error(label + "data kosong");
  if (CONFIG.VALID_TYPES.indexOf(t.tipe) === -1)
    throw new Error(label + "tipe tidak valid");
  const jumlah = Number(t.jumlah);
  if (!isFinite(jumlah) || jumlah <= 0)
    throw new Error(label + "jumlah harus lebih dari 0");
  if (!t.akun) throw new Error(label + "akun wajib diisi");
  if (!t.kategori) throw new Error(label + "kategori wajib diisi");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(t.tanggal)))
    throw new Error(label + "format tanggal harus YYYY-MM-DD");

  return {
    tanggal: String(t.tanggal),
    tipe: t.tipe,
    akun: String(t.akun),
    kategori: String(t.kategori),
    jumlah: jumlah,
    catatan: t.catatan ? String(t.catatan) : "",
  };
}

// ============================================
// POST: save one or more transactions
// Body (new):  { token, requestId, transactions: [ {...}, {...} ] }
// Body (old):  { tipe, jumlah, akun, kategori, tanggal, catatan }
// ============================================
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    if (!isAuthorized(data.token)) {
      return errorResponse("Token tidak valid");
    }

    // Support both batch (new) and single (legacy) format
    const rawList = Array.isArray(data.transactions)
      ? data.transactions
      : [data];
    if (rawList.length === 0) return errorResponse("Tidak ada transaksi");

    const transactions = rawList.map(validateTransaction);

    // Prevent concurrent writes from overlapping
    lock.waitLock(10000);

    // Ignore duplicate retries of the same request (e.g. offline queue resend)
    const cache = CacheService.getScriptCache();
    if (data.requestId && cache.get("req_" + data.requestId)) {
      return jsonResponse({
        status: "success",
        message: "Duplikat diabaikan",
        duplicate: true,
      });
    }

    const sheet = getSheetOrThrow(CONFIG.SHEET_MAIN);

    // Format timestamp
    const formattedTimestamp = Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss",
    );

    const rows = transactions.map(function (t) {
      return [
        formattedTimestamp, // A: Timestamp
        t.tanggal, // B: Tanggal transaksi
        t.tipe, // C: Tipe (Pemasukan/Pengeluaran)
        t.akun, // D: Akun bank
        t.kategori, // E: Kategori
        t.jumlah, // F: Jumlah
        t.catatan, // G: Catatan
      ];
    });

    // Write all rows in a single call (atomic for transfers)
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);

    if (data.requestId) {
      cache.put("req_" + data.requestId, "1", CONFIG.DEDUPE_TTL_SECONDS);
    }

    // Return success response
    return jsonResponse({
      status: "success",
      message: "Data berhasil disimpan",
      count: rows.length,
      timestamp: formattedTimestamp,
    });
  } catch (error) {
    // Return error response
    return errorResponse(error.message || error.toString());
  } finally {
    lock.releaseLock();
  }
}

// ============================================
// GET
// ============================================
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    const action = params.action;

    if (action === "getBalances") {
      if (!isAuthorized(params.token)) return errorResponse("Token tidak valid");
      return getBalances();
    }

    // Default response
    return jsonResponse({
      status: "ok",
      message: "Financial Tracker API is running",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error.toString());
  }
}

// Read [name, balance] pairs for a row range in ONE call
function readAccountRange(sheet, rowRange, target) {
  const startRow = rowRange[0];
  const numRows = rowRange[1] - rowRange[0] + 1;
  const values = sheet.getRange(startRow, CONFIG.NAME_COL, numRows, 2).getValues();

  values.forEach(function (row) {
    const accountName = row[0];
    const balanceValue = row[1];
    if (accountName && balanceValue !== "") {
      target[accountName] = Number(balanceValue) || 0;
    }
  });
}

// Get balances from Dashboard sheet
function getBalances() {
  const dashboard = getSheetOrThrow(CONFIG.SHEET_DASHBOARD);
  const balances = {};

  readAccountRange(dashboard, CONFIG.BANK_ROWS, balances);
  readAccountRange(dashboard, CONFIG.CREDIT_ROWS, balances);

  // Get total
  const totalSaldo =
    dashboard.getRange(CONFIG.TOTAL_ROW, CONFIG.NAME_COL + 1).getValue() || 0;

  return jsonResponse({
    status: "success",
    balances: balances,
    total: Number(totalSaldo),
    timestamp: new Date().toISOString(),
  });
}

// Optional: Create "Main" sheet with headers
function setupSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet =
    spreadsheet.getSheetByName(CONFIG.SHEET_MAIN) ||
    spreadsheet.insertSheet(CONFIG.SHEET_MAIN);

  // Set headers
  const headers = [
    "Timestamp",
    "Tanggal",
    "Tipe",
    "Akun",
    "Kategori",
    "Jumlah",
    "Catatan",
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#667eea");
  headerRange.setFontColor("#ffffff");

  // Set column widths
  sheet.setColumnWidth(1, 150); // Timestamp
  sheet.setColumnWidth(2, 100); // Tanggal
  sheet.setColumnWidth(3, 100); // Tipe
  sheet.setColumnWidth(4, 100); // Akun
  sheet.setColumnWidth(5, 120); // Kategori
  sheet.setColumnWidth(6, 100); // Jumlah
  sheet.setColumnWidth(7, 200); // Catatan

  // Freeze header row
  sheet.setFrozenRows(1);
}
