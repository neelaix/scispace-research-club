/**
 * Q-CONNECT 2026 — Google Apps Script data collection backend.
 *
 * PURPOSE: Manual UPI flow (no payment gateway).
 *   1. `saveLead` — Step 1 participant details → LEADS tab.
 *   2. `uploadScreenshot` — payment screenshot → Google Drive folder only.
 *   3. `savePending` — Step 2 registration row → REGISTRATIONS tab with
 *      PENDING status (same 10 columns, structure unchanged).
 *   Later an admin manually verifies the Drive screenshot, marks CONFIRMED,
 *   and sends the confirmation email from spaceresearch.club@vitap.ac.in.
 *   `save` (CONFIRMED) is kept for backwards compatibility with old rows.
 *
 * SETUP (one-time, ~5 min):
 * 1. Create a new Google Spreadsheet. Copy its ID from the URL.
 * 2. Create a Google Drive folder for payment screenshots. Copy its ID
 *    from the URL (drive.google.com/drive/folders/<FOLDER_ID>).
 * 3. Extensions → Apps Script → paste this file.
 * 4. Project Settings → Script Properties → add:
 *      SPREADSHEET_ID  = <your sheet ID>
 *      DRIVE_FOLDER_ID = <your Drive folder ID for screenshots>
 *      GAS_SECRET      = <long random string — must match QCONNECT_GAS_SECRET in Vercel>
 * 5. Deploy → New deployment → Web app
 *      Execute as : Me
 *      Who has access : Anyone
 * 6. Copy the /exec URL → Vercel env QCONNECT_GAS_URL
 *
 * SHEET SCHEMA — "REGISTRATIONS" tab (auto-created on first save, UNCHANGED):
 *   Booking ID | Full Name | Registration Number | Phone | Email |
 *   Amount | Cashfree Payment ID | Payment Status | Booking Status | Saved At
 * (Screenshot files live ONLY in Drive; filenames contain booking ID + reg no.
 *  The Cashfree Payment ID column stays empty for manual-UPI rows.)
 *
 * ACTIONS (all POST, body must include { secret }):
 *   save             — write one confirmed registration row (idempotent, legacy)
 *   saveLead         — write one pre-payment participant lead to LEADS tab (Step 1 of form)
 *   uploadScreenshot — save payment screenshot to Drive, returns { fileId, fileUrl }
 *   savePending      — write one PENDING registration row (idempotent, Step 2 of form)
 *   get   — fetch a single row by bookingId
 *   list  — paginated list, optional ?query
 *   stats — confirmed count + capacity
 */

// ─── Column map (1-based) ────────────────────────────────────────────────────
var COLS = {
  BOOKING_ID:          1,
  FULL_NAME:           2,
  REGISTRATION_NUMBER: 3,
  PHONE:               4,
  EMAIL:               5,
  AMOUNT:              6,
  CF_PAYMENT_ID:       7,
  PAYMENT_STATUS:      8,
  BOOKING_STATUS:      9,
  SAVED_AT:            10,
  TOTAL:               10
};

var HEADERS = [
  "Booking ID", "Full Name", "Registration Number", "Phone", "Email",
  "Amount", "Cashfree Payment ID", "Payment Status", "Booking Status", "Saved At"
];

// ─── LEADS tab (pre-payment collection, Step 1 of the form) ─────────────────
// One row per Participant Details submit, written BEFORE any payment.
var LEAD_HEADERS = [
  "Lead ID", "Full Name", "Registration Number", "Phone", "Email", "Saved At"
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function prop_(k, d) {
  var v = PropertiesService.getScriptProperties().getProperty(k);
  return (v === null || v === undefined) ? d : v;
}

function sheet_() {
  var ss = SpreadsheetApp.openById(prop_("SPREADSHEET_ID", ""));
  var s  = ss.getSheetByName("REGISTRATIONS");
  if (!s) {
    s = ss.insertSheet("REGISTRATIONS");
    s.appendRow(HEADERS);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, HEADERS.length)
     .setFontWeight("bold")
     .setBackground("#0b1530")
     .setFontColor("#22d3ee");
  }
  return s;
}

function ok_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function err_(msg) { return ok_({ ok: false, error: msg }); }

// ─── LEADS sheet helper ──────────────────────────────────────────────────────
function leadsSheet_() {
  var ss = SpreadsheetApp.openById(prop_("SPREADSHEET_ID", ""));
  var s  = ss.getSheetByName("LEADS");
  if (!s) {
    s = ss.insertSheet("LEADS");
    s.appendRow(LEAD_HEADERS);
    s.setFrozenRows(1);
    s.getRange(1, 1, 1, LEAD_HEADERS.length)
     .setFontWeight("bold")
     .setBackground("#0b1530")
     .setFontColor("#22d3ee");
  }
  return s;
}

function findRow_(bookingId) {
  var sh   = sheet_();
  var last = sh.getLastRow();
  if (last < 2) return -1;
  var ids = sh.getRange(2, COLS.BOOKING_ID, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === bookingId) return i + 2;
  }
  return -1;
}

// ─── ACTION: save ─────────────────────────────────────────────────────────────
// Idempotent — calling save twice for the same bookingId is a no-op.
function handleSave_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    // Validate required fields
    var id = String(body.bookingId || "");
    if (!/^QCON-2026-\d{6}$/.test(id)) return err_("Invalid booking ID.");

    // Idempotency: if row already exists, return success without writing again
    if (findRow_(id) > 0) {
      return ok_({ ok: true, alreadySaved: true, bookingId: id });
    }

    // Capacity guard — only save CONFIRMED registrations
    if (String(body.bookingStatus || "") !== "CONFIRMED") {
      return err_("Only CONFIRMED registrations can be saved.");
    }

    sheet_().appendRow([
      id,                                            // Booking ID
      String(body.fullName            || ""),        // Full Name
      String(body.registrationNumber  || ""),        // Registration Number
      String(body.phone               || ""),        // Phone
      String(body.email               || ""),        // Email
      Number(body.amount)             || 50,         // Amount
      String(body.cashfreePaymentId   || ""),        // Payment ref (empty for manual UPI)
      "PAYMENT_SUCCESS",                             // Payment Status
      "CONFIRMED",                                   // Booking Status
      new Date()                                     // Saved At
    ]);

    return ok_({ ok: true, saved: true, bookingId: id });
  } finally {
    lock.releaseLock();
  }
}

// ─── ACTION: savePending (manual-UPI registration, PENDING status) ─────────
// Same 10 columns as `save` (structure unchanged). Screenshot lives ONLY in
// Drive; this row stores PENDING / PENDING with an empty payment-ref column.
// Idempotent by bookingId.
function handleSavePending_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var id = String(body.bookingId || "");
    if (!/^QCON-2026-\d{6}$/.test(id)) return err_("Invalid booking ID.");

    if (findRow_(id) > 0) {
      return ok_({ ok: true, alreadySaved: true, bookingId: id });
    }

    var fullName = String(body.fullName || "").trim().slice(0, 80);
    var regNo    = String(body.registrationNumber || "").trim().toUpperCase().slice(0, 20);
    var phone    = String(body.phone || "").replace(/\D/g, "").slice(0, 15);
    var email    = String(body.email || "").trim().toLowerCase().slice(0, 254);

    if (!/^[a-zA-Z\s.'-]{2,80}$/.test(fullName))  return err_("Enter a valid full name.");
    if (!/^[A-Z0-9-]{5,20}$/.test(regNo))         return err_("Enter a valid registration number.");
    if (!/^[0-9]{10}$/.test(phone))               return err_("Enter a valid 10-digit phone number.");
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) return err_("Enter a valid email address.");

    sheet_().appendRow([
      id,                                            // Booking ID
      fullName,                                      // Full Name
      regNo,                                         // Registration Number
      phone,                                         // Phone
      email,                                         // Email
      Number(body.amount)             || 50,         // Amount
      "",                                            // Payment ref (empty — manual UPI)
      "PENDING",                                     // Payment Status
      "PENDING",                                     // Booking Status
      new Date()                                     // Saved At
    ]);

    return ok_({ ok: true, saved: true, bookingId: id });
  } finally {
    lock.releaseLock();
  }
}

// ─── ACTION: uploadScreenshot (payment screenshot → Drive only) ────────────
// Body: { bookingId, fileName, mimeType, dataBase64 }.
// Saves to DRIVE_FOLDER_ID with a booking-ID-prefixed filename.
// Never writes to the Sheet.
function handleUploadScreenshot_(body) {
  var folderId = prop_("DRIVE_FOLDER_ID", "");
  if (!folderId) return err_("Screenshot storage not configured.");

  var id = String(body.bookingId || "");
  if (!/^QCON-2026-\d{6}$/.test(id)) return err_("Invalid booking ID.");

  var mimeType = String(body.mimeType || "").toLowerCase();
  if (["image/jpeg", "image/png", "image/webp", "image/jpg"].indexOf(mimeType) < 0) {
    return err_("Screenshot must be JPG, PNG or WebP.");
  }

  var data = String(body.dataBase64 || "");
  if (!data) return err_("Missing screenshot data.");
  // ~5MB cap (base64 length ≈ 4/3 × bytes)
  if (data.length > 7 * 1024 * 1024) return err_("Screenshot must be 5MB or smaller.");

  var rawName = String(body.fileName || "payment-screenshot").replace(/[^\w\-. ]+/g, "").slice(0, 80);
  if (!rawName) rawName = "payment-screenshot";
  if (!/\.(jpe?g|png|webp)$/i.test(rawName)) {
    rawName += (mimeType.indexOf("png") >= 0 ? ".png" : mimeType.indexOf("webp") >= 0 ? ".webp" : ".jpg");
  }
  var fileName = id + "_" + rawName;

  try {
    var blob = Utilities.newBlob(Utilities.base64Decode(data), mimeType, fileName);
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    return ok_({ ok: true, saved: true, bookingId: id, fileId: file.getId(), fileUrl: file.getUrl(), fileName: fileName });
  } catch (ex) {
    return err_("Could not save screenshot: " + ex.message);
  }
}

// ─── ACTION: saveLead (pre-payment participant details) ───────────────────
// Writes one row to the LEADS tab. No Booking ID / payment required.
// Dedupe: same Registration Number + Email returns alreadySaved (no duplicate row).
function handleSaveLead_(body) {
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var fullName = String(body.fullName || "").trim().slice(0, 80);
    var regNo    = String(body.registrationNumber || "").trim().toUpperCase().slice(0, 20);
    var phone    = String(body.phone || "").replace(/\D/g, "").slice(0, 15);
    var email    = String(body.email || "").trim().toLowerCase().slice(0, 254);

    if (!/^[a-zA-Z\s.'-]{2,80}$/.test(fullName))  return err_("Enter a valid full name.");
    if (!/^[A-Z0-9-]{5,20}$/.test(regNo))         return err_("Enter a valid registration number.");
    if (!/^[0-9]{10}$/.test(phone))               return err_("Enter a valid 10-digit phone number.");
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email)) return err_("Enter a valid email address.");

    var sh   = leadsSheet_();
    var last = sh.getLastRow();
    if (last > 1) {
      var vals = sh.getRange(2, 1, last - 1, LEAD_HEADERS.length).getValues();
      for (var i = 0; i < vals.length; i++) {
        var rReg   = String(vals[i][2] || "").toUpperCase();
        var rEmail = String(vals[i][4] || "").toLowerCase();
        if (rReg === regNo && rEmail === email) {
          return ok_({ ok: true, alreadySaved: true, leadId: String(vals[i][0] || "") });
        }
      }
    }

    var leadId = "LEAD-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss")
      + "-" + Math.floor(Math.random() * 9000 + 1000);

    sh.appendRow([leadId, fullName, regNo, phone, email, new Date()]);

    return ok_({ ok: true, saved: true, leadId: leadId });
  } finally {
    lock.releaseLock();
  }
}

// ─── ACTION: get ──────────────────────────────────────────────────────────────
function handleGet_(body) {
  var id = String(body.bookingId || "");
  var r  = findRow_(id);
  if (r < 0) return err_("Booking not found.");
  var v = sheet_().getRange(r, 1, 1, COLS.TOTAL).getValues()[0];
  return ok_({
    ok:                 true,
    bookingId:          v[COLS.BOOKING_ID          - 1],
    fullName:           v[COLS.FULL_NAME            - 1],
    registrationNumber: v[COLS.REGISTRATION_NUMBER  - 1],
    phone:              v[COLS.PHONE                - 1],
    email:              v[COLS.EMAIL                - 1],
    amount:             v[COLS.AMOUNT               - 1],
    cashfreePaymentId:  v[COLS.CF_PAYMENT_ID        - 1],
    paymentStatus:      v[COLS.PAYMENT_STATUS       - 1],
    bookingStatus:      v[COLS.BOOKING_STATUS       - 1],
    savedAt:            v[COLS.SAVED_AT             - 1]
  });
}

// ─── ACTION: list ─────────────────────────────────────────────────────────────
function handleList_(body) {
  var q     = String(body.query || "").toLowerCase();
  var page  = Math.max(1, Number(body.page  || 1));
  var limit = Math.min(50, Math.max(1, Number(body.limit || 25)));
  var sh    = sheet_();
  var last  = sh.getLastRow();
  var rows  = [];
  if (last > 1) {
    var vals = sh.getRange(2, 1, last - 1, COLS.TOTAL).getValues();
    for (var i = vals.length - 1; i >= 0; i--) {
      var v = vals[i];
      if (q && [v[0], v[1], v[2], v[7], v[8]].join(" ").toLowerCase().indexOf(q) < 0) continue;
      rows.push({
        bookingId:          v[COLS.BOOKING_ID          - 1],
        fullName:           v[COLS.FULL_NAME            - 1],
        registrationNumber: v[COLS.REGISTRATION_NUMBER  - 1],
        phone:              v[COLS.PHONE                - 1],
        email:              v[COLS.EMAIL                - 1],
        amount:             v[COLS.AMOUNT               - 1],
        cashfreePaymentId:  v[COLS.CF_PAYMENT_ID        - 1],
        paymentStatus:      v[COLS.PAYMENT_STATUS       - 1],
        bookingStatus:      v[COLS.BOOKING_STATUS       - 1],
        savedAt:            v[COLS.SAVED_AT             - 1]
      });
    }
  }
  var total = rows.length;
  return ok_({ ok: true, rows: rows.slice((page - 1) * limit, page * limit), total: total, page: page });
}

// ─── ACTION: stats ────────────────────────────────────────────────────────────
// Counts by Booking Status (PENDING + CONFIRMED both occupy a seat).
// Test rows (QCON-2026-999xxx) are excluded so dummy data never eats seats.
function handleStats_() {
  var sh       = sheet_();
  var last     = sh.getLastRow();
  var confirmed = 0, pending = 0;
  if (last > 1) {
    var vals = sh.getRange(2, 1, last - 1, COLS.TOTAL).getValues();
    for (var i = 0; i < vals.length; i++) {
      var id = String(vals[i][0] || "");
      if (/^QCON-2026-999\d{3}$/.test(id)) continue; // test rows
      var st = String(vals[i][COLS.BOOKING_STATUS - 1] || "").toUpperCase();
      if (st === "CONFIRMED") confirmed++;
      else pending++;
    }
  }
  var capacity  = Number(prop_("MAX_PARTICIPANTS", "160")) || 160;
  return ok_({
    ok:        true,
    confirmed: confirmed,
    pending:   pending,
    capacity:  capacity,
    seatsLeft: Math.max(0, capacity - confirmed - pending)
  });
}

// ─── Entry point ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var secret = prop_("GAS_SECRET", "");
    if (!secret || String(body.secret || "") !== secret) return err_("Unauthorized.");
    switch (String(body.action || "")) {
      case "save":             return handleSave_(body);
      case "saveLead":         return handleSaveLead_(body);
      case "uploadScreenshot": return handleUploadScreenshot_(body);
      case "savePending":      return handleSavePending_(body);
      case "get":   return handleGet_(body);
      case "list":  return handleList_(body);
      case "stats": return handleStats_();
      default:      return err_("Unknown action.");
    }
  } catch (ex) {
    return err_("Server error: " + ex.message);
  }
}

function doGet() { return ok_({ ok: true, service: "qconnect-2026" }); }
