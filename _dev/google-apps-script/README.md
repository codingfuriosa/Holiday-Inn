# Recording enquiries to Google Sheets — setup

The website is a plain static site with no server of its own, so it can't hold
a Google password or API key. The standard way around that is a **Google Apps
Script Web App**: a small script that lives inside your own Sheet and exposes
one URL the website can post to. Nothing secret ever ends up in the website's
code — only that URL.

This is a one-time setup, and it needs your Google account, so it's the part
I can't do for you.

---

## 1. Create the Sheet

1. Go to <https://sheets.new> and create a spreadsheet.
2. Name it something like **Holiday Inn Kolkata Airport — Website Enquiries**.

## 2. Add the script

1. In that Sheet: **Extensions → Apps Script**.
2. Delete whatever is in `Code.gs`, and paste in the full contents of
   [`Code.gs`](Code.gs) from this folder.
3. Find `SEED_ROWS` near the top. It holds the four enquiries already received
   through the site — Jayanta Sarkar, Rabi Kumar Darji, Nitin Jain and
   Ayantika Bhattacherjee — transcribed from their FormSubmit emails, so the
   sheet starts with the real history instead of empty.

   **One field is blank: `timestamp`.** The submission date lives in each
   FormSubmit email, and rather than guess at it I've left it empty. Fill each
   one in as `'2026-08-10 14:30'` from the email's own date if you want the
   column complete; leave blank and the cell just stays empty.

   > **Note on where past enquiries come from:** the site relays mail through
   > FormSubmit's account-less mode, which has no dashboard, no login and no
   > stored history. The delivered email is the only record that exists, so
   > anything older can only be recovered from the `ai@thejaingroup.com`
   > inbox, never from FormSubmit itself. That's exactly the gap the Google
   > Sheet closes going forward.

4. Save (the floppy icon).

## 3. Build and format the sheet

1. In the Apps Script toolbar, pick the function **`setupSheet`** and press
   **Run**.
2. Google will ask you to authorise it the first time — approve it. (It shows
   an "unverified app" warning because it's your own private script rather
   than a published one: **Advanced → Go to … (unsafe)** is the expected path
   here.)
3. Switch back to the Sheet. There's now a formatted **Enquiries** tab with the
   header row, column widths, date formats and colour coding in place, and the
   four existing enquiries already in rows 2–5.

Seeding only happens into an empty sheet, so it's safe to re-run `setupSheet`
later to re-apply formatting: it won't duplicate those four or touch real
enquiries that have come in since.

## 4. Deploy it as a Web App

1. Back in Apps Script: **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone` ← this must be *Anyone*, not "Anyone with
     Google account". It's what lets a visitor's browser post to it without
     signing in. The URL is unguessable and the script only ever appends rows,
     so it can't be used to read your data.
4. **Deploy**, then copy the **Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfycb…………/exec
   ```

## 5. Paste the URL into the site

Open [`js/config.js`](../../js/config.js) and set it:

```js
window.SITE_CONFIG = {
  TO_EMAIL: "ai@thejaingroup.com",
  CC_EMAIL: "pritesh.zavery@ihg.com",
  SHEET_ENDPOINT: "https://script.google.com/macros/s/AKfycb…………/exec"
};
```

Commit and push. That's it — every enquiry from then on lands in the Sheet.

## 6. Check it works

Open the live site, submit a test enquiry, and confirm a new row appears.
You can also open the `/exec` URL directly in a browser — it should answer
`{"result":"ok","message":"Holiday Inn enquiry logger is running."}`.

---

## Columns

| Column | Filled by | Notes |
|---|---|---|
| Timestamp | automatic | Server-side time of submission, not the visitor's clock |
| Arrival | booking widget | Real date cell — sorts and filters properly |
| Departure | booking widget | Real date cell |
| Enquiry Type | automatic | See the table below |
| Rooms | booking widget | Number of rooms |
| Guests | booking widget | e.g. `2 Adults, 1 Child` |
| Form Page | automatic | Which page the enquiry was submitted from |
| Full Name | guest | |
| Number | guest | Stored as text so a leading `0` survives |
| Email | guest | |
| **Location** | **you, by hand** | Tinted cream — the website doesn't collect this |

Arrival, Departure, Rooms and Guests are blank for enquiries that never went
through the booking widget (Groups & Events, and the offer cards) — those
never ask for dates.

### Enquiry Type values

| Where the guest started | Enquiry Type |
|---|---|
| Rooms page → Standard Rooms → Book Now | `Enquiry for Standard Room` |
| Rooms page → Suite → Book Now | `Enquiry for Suite` |
| Header / mobile bar → Book Now | `General Enquiry` |
| Groups & Events → Enquire Now | `Groups & Events` |
| An offer card → Book Now | `Offer Enquiry` (offer name in *Interested In* on the email) |

---

## If you ever change the columns

`HEADERS` in `Code.gs` is the single source of truth for column order — the
row builder and all the formatting read from it. Change it there, re-run
`setupSheet`, and **create a new deployment version** (Deploy → Manage
deployments → edit → Version: New version), otherwise the live URL keeps
running the old code.

## Note on redeploying

Editing `Code.gs` does **not** update the live Web App on its own. Any time you
change the script, go to **Deploy → Manage deployments → ✏️ → Version: New
version → Deploy**. The URL stays the same.
