/**
 * Holiday Inn Kolkata Airport — website enquiry/booking logger.
 *
 * Receives one enquiry from the website form (js/main.js -> logToSheet) and
 * appends it as a formatted row on the "Enquiries" sheet.
 *
 * Setup is in README.md next to this file. In short:
 *   1. Run setupSheet() once  (builds + formats the sheet, shares it)
 *   2. Deploy > New deployment > Web app
 *        Execute as:      Me
 *        Who has access:  Anyone
 *   3. Paste the /exec URL into js/config.js as SHEET_ENDPOINT
 */

var SHEET_NAME = 'Enquiries';

/** Column order. Must stay in sync with buildRow() below. */
var HEADERS = [
  'Timestamp',
  'Arrival',
  'Departure',
  'Enquiry Type',
  'Rooms',
  'Guests',
  'Form Page',
  'Full Name',
  'Number',
  'Email',
  'Location'
];

/**
 * The four enquiries already received through the website, transcribed from
 * the FormSubmit emails so the sheet starts with the real history rather than
 * empty.
 *
 * These arrived under the form's PREVIOUS field names, so a couple of values
 * are translated into the current column scheme:
 *
 *   Offer_or_Room "Suite enquiry"   -> Enquiry Type "Enquiry for Suite"
 *   Offer_or_Room "General enquiry" -> Enquiry Type "General Enquiry"
 *   Rooms_and_Guests "1 Room, 2 Adults" -> Rooms "1" + Guests "2 Adults"
 *   Page <full URL>                 -> Form Page "Rooms" / "Home"
 *
 * `timestamp` is left empty on purpose: the emails carry the submission date,
 * but that wasn't in what was passed to me, and guessing at it is exactly the
 * mistake worth not repeating. Fill each one in as 'YYYY-MM-DD HH:MM' from the
 * email's own date, or leave blank and the cell stays empty.
 *
 * Dates are plain 'YYYY-MM-DD' strings; blank means the enquiry had none.
 */
var SEED_ROWS = [
  {
    timestamp: '',
    name: 'Jayanta Sarkar',
    phone: '9831228083',
    email: 'sarkarj777@gmail.com',
    enquiryType: 'Enquiry for Suite',
    arrival: '',            // was "Not specified" - came straight off a room card
    departure: '',
    rooms: '',
    guests: '',
    page: 'Rooms',
    location: ''
  },
  {
    timestamp: '',
    name: 'Rabi Kumar Darji',
    phone: '8598022216',
    email: 'rabikumardarji@gmail.com',
    enquiryType: 'General Enquiry',
    arrival: '2026-08-11',
    departure: '2026-08-12',
    rooms: '1',
    guests: '2 Adults',
    page: 'Home',
    location: ''
  },
  {
    timestamp: '',
    name: 'Nitin Jain',
    phone: '9006777447',
    email: 'niks86@gmail.com',
    enquiryType: 'General Enquiry',
    arrival: '2026-08-13',
    departure: '2026-08-14',
    rooms: '1',
    guests: '2 Adults',
    page: 'Home',
    location: ''
  },
  {
    timestamp: '',
    name: 'Ayantika Bhattacherjee',
    phone: '9830712692',
    email: 'ayantikabhattacherjee26@gmail.com',
    enquiryType: 'General Enquiry',
    arrival: '2026-08-12',
    departure: '2026-08-13',
    rooms: '1',
    guests: '2 Adults',
    page: 'Home',
    location: ''
  }
];

/* ==========================================================================
   Receiving a submission
   ========================================================================== */

function doPost(e) {
  // A lock keeps two submissions landing in the same second from writing over
  // each other's row — appendRow alone is not atomic across concurrent runs.
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter; // tolerate a plain form POST too
    }

    var sheet = getSheet();
    sheet.appendRow(buildRow(data));
    formatLastRow(sheet);

    return json({ result: 'success', row: sheet.getLastRow() });
  } catch (err) {
    return json({ result: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/** Lets you confirm the deployment is live by opening the /exec URL. */
function doGet() {
  return json({ result: 'ok', message: 'Holiday Inn enquiry logger is running.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Text written into the four stay-detail columns when an enquiry never asked
 * for them — Groups & Events and the offer cards go straight to contact
 * details, so they have no dates, rooms or guests to record.
 *
 * A blank cell can't be told apart from "something failed to record", which is
 * why these read NA instead. Trade-off worth knowing: it makes Arrival and
 * Departure mixed text/date columns, so date sorting and date filters put the
 * NA rows on their own rather than ordering them. Set this to '' to go back to
 * genuinely empty cells and fully typed date columns.
 */
var NOT_APPLICABLE = 'NA';

function buildRow(d) {
  return [
    new Date(),                       // Timestamp — server-side, not client clock
    orNA(asDate(d.arrival)),          // Arrival
    orNA(asDate(d.departure)),        // Departure
    d.enquiryType || '',              // Enquiry Type
    orNA(d.rooms),                    // Rooms
    orNA(d.guests),                   // Guests
    d.page || '',                     // Form Page
    d.name || '',                     // Full Name
    asPhoneText(d.phone),             // Number
    d.email || '',                    // Email
    ''                                // Location — filled in manually by the team
  ];
}

/** A real value, or the NA marker when there's nothing to record. */
function orNA(value) {
  if (value instanceof Date) return value;
  return (value === '' || value === null || value === undefined) ? NOT_APPLICABLE : value;
}

/** "2026-08-14" -> a real Date cell, so the column sorts and filters properly. */
function asDate(value) {
  if (!value) return '';
  var parts = String(value).split('-');
  if (parts.length !== 3) return value;
  var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return isNaN(d.getTime()) ? value : d;
}

/** Keep phone numbers as text — as numbers they lose any leading zero. */
function asPhoneText(value) {
  return value ? "'" + String(value) : '';
}

/* ==========================================================================
   One-time setup / formatting
   ========================================================================== */

function setupSheet() {
  var sheet = getSheet();
  formatSheet(sheet);
  var seeded = seedSampleRows(sheet);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    seeded ? 'Sheet ready, with the 4 starting entries.' : 'Sheet ready (rows already present, nothing seeded).',
    'Holiday Inn', 5);
}

/**
 * Writes SEED_ROWS, but only into an empty sheet — so running setupSheet()
 * again later to re-apply formatting never duplicates them or disturbs real
 * enquiries that have come in since.
 * Returns true if it wrote anything.
 */
function seedSampleRows(sheet) {
  if (sheet.getLastRow() > 1) return false;   // header only == empty

  var rows = SEED_ROWS.map(function (s) {
    return [
      parseTimestamp(s.timestamp),      // left blank where unknown, not NA
      orNA(asDate(s.arrival)),
      orNA(asDate(s.departure)),
      s.enquiryType || '',
      orNA(s.rooms),
      orNA(s.guests),
      s.page || '',
      s.name || '',
      s.phone ? "'" + s.phone : '',
      s.email || '',
      s.location || ''
    ];
  });

  sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
  for (var i = 0; i < rows.length; i++) formatRow(sheet, 2 + i);
  return true;
}

/** 'YYYY-MM-DD HH:MM' (or just 'YYYY-MM-DD') -> Date. Empty stays empty. */
function parseTimestamp(value) {
  if (!value) return '';
  var bits = String(value).trim().split(/[ T]/);
  var d = asDate(bits[0]);
  if (!(d instanceof Date)) return value;
  if (bits[1]) {
    var hm = bits[1].split(':');
    d.setHours(Number(hm[0]) || 0, Number(hm[1]) || 0, 0, 0);
  }
  return d;
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    formatSheet(sheet);
  }
  if (sheet.getLastRow() === 0) writeHeaders(sheet);
  return sheet;
}

function writeHeaders(sheet) {
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
}

function formatSheet(sheet) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  writeHeaders(sheet);

  var lastCol = HEADERS.length;

  // --- Header row: brand green, white bold text, frozen, filterable -------
  var header = sheet.getRange(1, 1, 1, lastCol);
  header
    .setBackground('#216245')            // Holiday Inn green
    .setFontColor('#ffffff')
    .setFontFamily('Poppins')
    .setFontSize(11)
    .setFontWeight('bold')
    .setVerticalAlignment('middle')
    .setHorizontalAlignment('left');
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  if (!sheet.getFilter()) {
    sheet.getRange(1, 1, Math.max(sheet.getMaxRows(), 2), lastCol).createFilter();
  }

  // --- Body: readable font, aligned, wrapped ------------------------------
  var body = sheet.getRange(2, 1, Math.max(sheet.getMaxRows() - 1, 1), lastCol);
  body
    .setFontFamily('Poppins')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setWrap(false);

  // --- Per-column formats -------------------------------------------------
  col(sheet, 'Timestamp').setNumberFormat('dd-mmm-yyyy hh:mm am/pm');
  col(sheet, 'Arrival').setNumberFormat('dd-mmm-yyyy');
  col(sheet, 'Departure').setNumberFormat('dd-mmm-yyyy');
  col(sheet, 'Rooms').setHorizontalAlignment('center');
  col(sheet, 'Number').setNumberFormat('@');   // text, so 0-prefixed numbers survive

  // --- Column widths ------------------------------------------------------
  var widths = {
    'Timestamp': 175,
    'Arrival': 115,
    'Departure': 115,
    'Enquiry Type': 190,
    'Rooms': 70,
    'Guests': 150,
    'Form Page': 120,
    'Full Name': 170,
    'Number': 125,
    'Email': 230,
    'Location': 160
  };
  HEADERS.forEach(function (name, i) {
    if (widths[name]) sheet.setColumnWidth(i + 1, widths[name]);
  });

  // --- Alternating row shading -------------------------------------------
  sheet.getBandings().forEach(function (b) { b.remove(); });
  sheet.getRange(1, 1, sheet.getMaxRows(), lastCol)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false);

  // --- Colour-code the Enquiry Type column so types are scannable ---------
  var typeCol = col(sheet, 'Enquiry Type');
  var rules = [
    typeRule(typeCol, 'Standard Room', '#e3f0e8'),
    typeRule(typeCol, 'Suite', '#e7ecf7'),
    typeRule(typeCol, 'Groups & Events', '#fbeee0'),
    typeRule(typeCol, 'General Enquiry', '#f2f2f2')
  ];

  // Grey out the NA markers so they recede instead of competing visually with
  // the rows that do carry real dates and room counts.
  if (NOT_APPLICABLE) {
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(NOT_APPLICABLE)
      .setFontColor('#9e9e9e')
      .setItalic(true)
      .setRanges([
        col(sheet, 'Arrival'), col(sheet, 'Departure'),
        col(sheet, 'Rooms'), col(sheet, 'Guests')
      ])
      .build());
  }

  sheet.setConditionalFormatRules(rules);

  // --- Location is the one column filled in by hand -----------------------
  // Tint it so it reads as "yours to fill", and note that in the header cell.
  var locCol = HEADERS.indexOf('Location') + 1;
  sheet.getRange(2, locCol, Math.max(sheet.getMaxRows() - 1, 1), 1).setBackground('#fff8e1');
  sheet.getRange(1, locCol)
    .setNote('Filled in manually by the team — the website does not collect this.');

  sheet.getRange(1, 1, sheet.getMaxRows(), lastCol)
    .setBorder(true, true, true, true, true, true, '#d9d6cd', SpreadsheetApp.BorderStyle.SOLID);
}

/** The full data range of one named column, header excluded. */
function col(sheet, name) {
  var index = HEADERS.indexOf(name) + 1;
  return sheet.getRange(2, index, Math.max(sheet.getMaxRows() - 1, 1), 1);
}

function typeRule(range, text, colour) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenTextContains(text)
    .setBackground(colour)
    .setRanges([range])
    .build();
}

/** Re-apply row formatting to whatever appendRow just added. */
function formatLastRow(sheet) {
  formatRow(sheet, sheet.getLastRow());
}

function formatRow(sheet, row) {
  sheet.getRange(row, 1, 1, HEADERS.length)
    .setFontFamily('Poppins').setFontSize(10).setVerticalAlignment('middle');
  sheet.getRange(row, 1).setNumberFormat('dd-mmm-yyyy hh:mm am/pm');
  sheet.getRange(row, 2, 1, 2).setNumberFormat('dd-mmm-yyyy');
  sheet.getRange(row, HEADERS.indexOf('Number') + 1).setNumberFormat('@');
  sheet.getRange(row, HEADERS.indexOf('Location') + 1).setBackground('#fff8e1');
  sheet.setRowHeight(row, 26);
}
