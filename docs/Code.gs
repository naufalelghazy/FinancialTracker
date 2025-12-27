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
 * STRUKTUR KOLOM DI GOOGLE SHEET:
 * A: Timestamp     (otomatis dari Apps Script)
 * B: Tanggal       (tanggal transaksi)
 * C: Tipe          (Pemasukan/Pengeluaran)
 * D: Akun          (nama bank/e-wallet)
 * E: Kategori      (kategori transaksi)
 * F: Jumlah        (nominal uang)
 * G: Catatan       (notes opsional)
 */

ffunction doPost(e) {
  try {
    // Get the active spreadsheet and sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);

    // Format timestamp
    const timestamp = new Date();
    const formattedTimestamp = Utilities.formatDate(
      timestamp,
      Session.getScriptTimeZone(),
      "yyyy-MM-dd HH:mm:ss"
    );

    // Append row to sheet
    sheet.appendRow([
      formattedTimestamp, // A: Timestamp
      data.tanggal, // B: Tanggal transaksi
      data.tipe, // C: Tipe (Pemasukan/Pengeluaran)
      data.akun, // D: Akun bank
      data.kategori, // E: Kategori
      data.jumlah, // F: Jumlah
      data.catatan || "", // G: Catatan
    ]);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        message: "Data berhasil disimpan",
        timestamp: formattedTimestamp,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests
function doGet(e) {
  try {
    const action = e.parameter.action;

    if (action === "getBalances") {
      return getBalances();
    }

    // Default response
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "ok",
        message: "Financial Tracker API is running",
        timestamp: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Get balances from Dashboard sheet
function getBalances() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const dashboard = spreadsheet.getSheetByName("Dashboard");

  if (!dashboard) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: "Sheet Dashboard tidak ditemukan",
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Read balance data from Dashboard (rows 7-16, columns C and D)
  // Column C = Account name, Column E = Balance amount
  const balances = {};

  // Accounts are in rows 7-16
  for (let row = 7; row <= 16; row++) {
    const accountName = dashboard.getRange(row, 3).getValue(); // Column C
    const balanceValue = dashboard.getRange(row, 4).getValue(); // Column D

    if (accountName && balanceValue !== "") {
      const numericBalance = Number(balanceValue) || 0;
      balances[accountName] = numericBalance;
    }
  }

  // Get total from row 17
  const totalSaldo = dashboard.getRange(17, 4).getValue() || 0;

  return ContentService.createTextOutput(
    JSON.stringify({
      status: "success",
      balances: balances,
      total: Number(totalSaldo),
      timestamp: new Date().toISOString(),
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// Optional: Create sheet with headers
function setupSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

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
