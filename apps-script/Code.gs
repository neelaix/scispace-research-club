/**
 * SciSpace Research Club - Interstellar Booking Handler
 * Deploy as Web App: Execute as Me, Who has access: Anyone
 * This doPost handles the exact payload sent by the Vite + Vercel frontend
 */

// TODO: Replace with your actual IDs
var CONFIG = {
  SPREADSHEET_ID: 'PUT_YOUR_SPREADSHEET_ID_HERE', // from sheet URL
  DRIVE_FOLDER_ID: 'PUT_YOUR_DRIVE_FOLDER_ID_HERE', // Payment Screenshots folder ID
  // Optional: restrict UPI
  EXPECTED_UPI_ID: 'mithintiramani@upi',
  EXPECTED_RECIPIENT: 'SciSpace'
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, message: 'Missing payload' });
    }
    var data = JSON.parse(e.postData.contents);

    // --- Validate required fields ---
    if (!data.bookingId || !data.bookingContact || !data.attendees || !data.attendeeCount) {
      return jsonResponse({ success: false, message: 'Invalid booking data' });
    }
    var expectedTotal = Number(data.attendeeCount) * 25;
    if (Number(data.totalAmount) !== expectedTotal) {
      return jsonResponse({ success: false, message: 'Amount mismatch: expected ₹' + expectedTotal });
    }

    // --- Screenshot handling ---
    var screenshotUrl = '';
    var screenshotFileName = '';
    if (data.paymentScreenshot && data.paymentScreenshot.base64) {
      try {
        var mime = data.paymentScreenshot.mimeType || 'image/png';
        var fileName = data.paymentScreenshot.fileName || (data.bookingId + '.png');
        // Sanitize filename
        fileName = data.bookingId + '_' + fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        var blob = Utilities.newBlob(Utilities.base64Decode(data.paymentScreenshot.base64), mime, fileName);
        var folder = CONFIG.DRIVE_FOLDER_ID ? DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID) : DriveApp.getRootFolder();
        var file = folder.createFile(blob);
        file.setDescription('Interstellar booking ' + data.bookingId);
        screenshotUrl = file.getUrl();
        screenshotFileName = fileName;
        // Do NOT make public - keep private as per spec
      } catch (err) {
        // Log but don't fail booking if screenshot save fails - still record booking
        console.error('Screenshot save failed: ' + err);
      }
    } else {
      return jsonResponse({ success: false, message: 'Payment screenshot is required' });
    }

    // --- Sheets ---
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    
    // Bookings sheet: BookingID | Event | Club | Institution | ContactName | ContactEmail | ContactPhone | AttendeeCount | PricePerPerson | TotalAmount | Currency | PaymentMethod | RecipientName | RecipientUPI | ExpectedAmount | TransactionRef | Status | Seating | CreatedAt | ScreenshotFile | ScreenshotUrl
    var bookingsSheet = ss.getSheetByName('Bookings') || ss.insertSheet('Bookings');
    ensureHeaders(bookingsSheet, ['BookingID','Event','Club','Institution','ContactName','ContactEmail','ContactPhone','AttendeeCount','PricePerPerson','TotalAmount','Currency','PaymentMethod','RecipientName','RecipientUPI','ExpectedAmount','TransactionRef','Status','Seating','CreatedAt','ScreenshotFile','ScreenshotUrl']);
    // Duplicate check by TransactionRef if provided
    if (data.payment && data.payment.transactionReference) {
      var existing = findTransaction(bookingsSheet, data.payment.transactionReference);
      if (existing) {
        return jsonResponse({ success: false, message: 'This payment reference has already been submitted.' });
      }
    }
    // Duplicate BookingID check
    if (findBookingId(bookingsSheet, data.bookingId)) {
      return jsonResponse({ success: false, message: 'Duplicate booking ID' });
    }

    bookingsSheet.appendRow([
      data.bookingId,
      data.event ? data.event.name : 'Interstellar',
      data.event ? data.event.club : 'SciSpace Research Club',
      data.event ? data.event.institution : 'VIT-AP University',
      data.bookingContact.name,
      data.bookingContact.email,
      data.bookingContact.phone,
      Number(data.attendeeCount),
      Number(data.pricePerPerson),
      Number(data.totalAmount),
      data.currency || 'INR',
      data.payment ? data.payment.method : 'UPI',
      data.payment ? data.payment.recipientName : CONFIG.EXPECTED_RECIPIENT,
      data.payment ? data.payment.recipientUpiId : CONFIG.EXPECTED_UPI_ID,
      data.payment ? Number(data.payment.expectedAmount) : expectedTotal,
      data.payment ? (data.payment.transactionReference || '') : '',
      data.payment ? (data.payment.status || 'SUBMITTED') : 'SUBMITTED',
      data.seating || 'Open Seating',
      data.createdAt || new Date().toISOString(),
      screenshotFileName,
      screenshotUrl
    ]);

    // Attendees sheet
    var attendeesSheet = ss.getSheetByName('Attendees') || ss.insertSheet('Attendees');
    ensureHeaders(attendeesSheet, ['BookingID','AttendeeIndex','Name','RegistrationNumber','Email','CreatedAt']);
    for (var i = 0; i < data.attendees.length; i++) {
      var a = data.attendees[i];
      attendeesSheet.appendRow([data.bookingId, i+1, a.name, a.registrationNumber, a.email, new Date().toISOString()]);
    }

    // Payments sheet
    var paymentsSheet = ss.getSheetByName('Payments') || ss.insertSheet('Payments');
    ensureHeaders(paymentsSheet, ['BookingID','Method','RecipientName','RecipientUPI','ExpectedAmount','TransactionRef','Status','ScreenshotFile','ScreenshotUrl','CreatedAt']);
    paymentsSheet.appendRow([
      data.bookingId,
      data.payment ? data.payment.method : 'UPI',
      data.payment ? data.payment.recipientName : '',
      data.payment ? data.payment.recipientUpiId : '',
      data.payment ? Number(data.payment.expectedAmount) : expectedTotal,
      data.payment ? (data.payment.transactionReference || '') : '',
      data.payment ? (data.payment.status || 'SUBMITTED') : 'SUBMITTED',
      screenshotFileName,
      screenshotUrl,
      new Date().toISOString()
    ]);

    // --- Confirmation Email ---
    try {
      var subject = 'Interstellar Ticket Confirmation | SciSpace Research Club';
      var attendeeList = data.attendees.map(function(a, idx){ return (idx+1)+'. '+a.name+' ('+a.registrationNumber+')'; }).join('\n');
      var body = 'Booking Submitted Successfully 🎉\n\n'
        + 'Booking ID: ' + data.bookingId + '\n'
        + 'Event: Interstellar — A SciSpace Research Club Movie Experience\n'
        + 'Institution: VIT-AP University\n'
        + 'Booking Contact: ' + data.bookingContact.name + ' (' + data.bookingContact.email + ', ' + data.bookingContact.phone + ')\n'
        + 'Attendees:\n' + attendeeList + '\n'
        + 'Number of Attendees: ' + data.attendeeCount + '\n'
        + 'Total Amount: ₹' + data.totalAmount + ' ' + (data.currency || 'INR') + '\n'
        + 'Payment Status: SUBMITTED (Payment details checked)\n'
        + 'Payment Method: UPI to ' + (data.payment ? data.payment.recipientName : '') + ' (' + (data.payment ? data.payment.recipientUpiId : '') + ')\n'
        + 'General Admission\n'
        + 'Open Seating\n'
        + 'Seating: Open Seating — Choose any available seat at the venue.\n'
        + 'Screenshot: ' + screenshotUrl + '\n\n'
        + 'Thank you for booking with SciSpace Research Club!';
      MailApp.sendEmail({ to: data.bookingContact.email, subject: subject, body: body });
    } catch (emailErr) {
      console.error('Email failed: ' + emailErr);
      // Don't fail booking if email fails
    }

    return jsonResponse({ success: true, bookingId: data.bookingId, message: 'Booking submitted successfully' });

  } catch (err) {
    console.error('doPost error: ' + err + ' stack: ' + err.stack);
    return jsonResponse({ success: false, message: 'Server error: ' + err.message });
  }
}

function doGet(e) {
  // Health check - optional
  return jsonResponse({ success: true, message: 'SciSpace Interstellar Web App is running. POST bookings here.' });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function ensureHeaders(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1,1,1,headers.length).setFontWeight('bold');
  }
}

function findTransaction(sheet, ref) {
  if (!ref) return false;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var vals = sheet.getRange(2, 16, lastRow-1, 1).getValues(); // Column P = TransactionRef (16)
  var norm = String(ref).trim().toUpperCase();
  for (var i=0;i<vals.length;i++) if (String(vals[i][0]).trim().toUpperCase() === norm) return true;
  return false;
}

function findBookingId(sheet, bookingId) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  var vals = sheet.getRange(2,1,lastRow-1,1).getValues();
  for (var i=0;i<vals.length;i++) if (String(vals[i][0])===String(bookingId)) return true;
  return false;
}
