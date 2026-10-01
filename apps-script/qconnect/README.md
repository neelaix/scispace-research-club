# Q-Connect 2026 — Google Apps Script Setup

Google Apps Script handles data collection + payment screenshot storage for the manual UPI flow (no payment gateway).

---

## What GAS does

- `saveLead` — Step 1 participant details → `LEADS` tab
- `uploadScreenshot` — payment screenshot → Google Drive folder only (never in the Sheet)
- `savePending` — Step 2 registration row → `REGISTRATIONS` tab with `PENDING` status (same 10 columns, structure unchanged)
- `save` — legacy CONFIRMED rows (kept for backwards compatibility)

## What GAS does NOT do

- It never processes payments
- It never auto-verifies screenshots or auto-confirms bookings
- It never sends confirmation emails (admin sends manually from spaceresearch.club@vitap.ac.in after Drive verification)

---

## Setup (one-time, ~5 minutes)

### 1. Create a Google Sheet

Create a new Google Spreadsheet. Copy its ID from the URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
```

### 2. Create a Google Drive folder for screenshots

Create a new Drive folder (e.g. `Q-Connect 2026 — Payment Screenshots`). Copy its ID from the URL:
```
https://drive.google.com/drive/folders/YOUR_DRIVE_FOLDER_ID
```

### 3. Open Apps Script

Inside the sheet: **Extensions → Apps Script**

Paste the contents of `Code.gs` into the editor and save.

### 4. Set Script Properties

Go to **Project Settings → Script Properties** and add:

| Key | Value |
|---|---|
| `SPREADSHEET_ID` | Your spreadsheet ID from step 1 |
| `DRIVE_FOLDER_ID` | Your Drive folder ID from step 2 |
| `GAS_SECRET` | A long random string — must match `QCONNECT_GAS_SECRET` in Vercel |
| `MAX_PARTICIPANTS` | `180` (optional, used by `stats` action) |

### 5. Deploy as Web App

Click **Deploy → New deployment → Web app**

| Setting | Value |
|---|---|
| Execute as | **Me** |
| Who has access | **Anyone** |

Click **Deploy**. Copy the `/exec` URL. After any Code.gs or property change, use **Manage deployments → New version**.

### 6. Add to Vercel environment variables

In your Vercel project: **Settings → Environment Variables**

| Variable | Value |
|---|---|
| `QCONNECT_GAS_URL` | The `/exec` URL from step 5 |
| `QCONNECT_GAS_SECRET` | The same value as `GAS_SECRET` above |

For local dev, add both to `.env.local`.

---

## Sheet schema — REGISTRATIONS tab (UNCHANGED)

The tab is created automatically on the first `save`/`savePending` call. Columns are identical for PENDING and CONFIRMED rows.

| Column | PENDING row value | CONFIRMED row value |
|---|---|---|
| Booking ID | `QCON-2026-XXXXXX` | `QCON-2026-XXXXXX` |
| Full Name | Participant name | Participant name |
| Registration Number | VIT reg number | VIT reg number |
| Phone | 10-digit number | 10-digit number |
| Email | Email address | Email address |
| Amount | `50` | `50` |
| Cashfree Payment ID | (empty — manual UPI) | (empty or legacy ref) |
| Payment Status | `PENDING` | `PAYMENT_SUCCESS` |
| Booking Status | `PENDING` | `CONFIRMED` |
| Saved At | Timestamp | Timestamp |

Screenshot files live ONLY in Drive. Filenames are `{BOOKING_ID}_{REGNO}_{timestamp}.jpg/png/webp`.

---

## Supported actions (POST body must include `{ secret }`)

| Action | Purpose |
|---|---|
| `saveLead` | Write Step-1 participant lead to LEADS tab |
| `uploadScreenshot` | Save screenshot to Drive, returns `{ fileId, fileUrl }` |
| `savePending` | Write PENDING registration row (idempotent) |
| `save` | Write CONFIRMED row (idempotent, legacy) |
| `get` | Fetch a row by `bookingId` |
| `list` | Paginated list, optional `query` |
| `stats` | Confirmed count + capacity |

---

## Notes

- `savePending` / `uploadScreenshot` failures ARE shown to the user (unlike the old fire-and-forget audit log) — the user must retry the submit.
- All three write actions are idempotent — retrying the same booking ID is safe.
- Confirmation emails are manual-only, sent after Drive screenshot verification.
