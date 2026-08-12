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

/** People who get edit access to the sheet when setupSheet() runs. */
var TEAM_EMAILS = [
  // TODO: real addresses for Jayanta Sarkar, Rabi Kumar Darji, Nitin Jain,
  // Ayantika Bhatacharjee — fill these in before running setupSheet().
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

function buildRow(d) {
  return [
    new Date(),                 // Timestamp — server-side, not client clock
    asDate(d.arrival),          // Arrival
    asDate(d.departure),        // Departure
    d.enquiryType || '',        // Enquiry Type
    d.rooms || '',              // Rooms
    d.guests || '',             // Guests
    d.page || '',               // Form Page
    d.name || '',               // Full Name
    asPhoneText(d.phone),       // Number
    d.email || '',              // Email
    ''                          // Location — filled in manually by the team
  ];
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
  shareWithTeam();
  SpreadsheetApp.getActiveSpreadsheet().toast('Sheet ready.', 'Holiday Inn', 5);
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
  var row = sheet.getLastRow();
  var range = sheet.getRange(row, 1, 1, HEADERS.length);
  range.setFontFamily('Poppins').setFontSize(10).setVerticalAlignment('middle');
  sheet.getRange(row, 1).setNumberFormat('dd-mmm-yyyy hh:mm am/pm');
  sheet.getRange(row, 2, 1, 2).setNumberFormat('dd-mmm-yyyy');
  sheet.getRange(row, HEADERS.indexOf('Number') + 1).setNumberFormat('@');
  sheet.getRange(row, HEADERS.indexOf('Location') + 1).setBackground('#fff8e1');
  sheet.setRowHeight(row, 26);
}

function shareWithTeam() {
  if (!TEAM_EMAILS.length) return;
  var file = DriveApp.getFileById(SpreadsheetApp.getActiveSpreadsheet().getId());
  TEAM_EMAILS.forEach(function (email) {
    try {
      file.addEditor(email);
    } catch (err) {
      Logger.log('Could not share with ' + email + ': ' + err);
    }
  });
}
