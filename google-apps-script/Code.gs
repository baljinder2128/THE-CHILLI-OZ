/**
 * THE CHILLI'OZ — ONLINE ORDERS
 *
 * Receives orders from the website, adds each one as a row in this Google Sheet,
 * emails the café, and (if the customer gave an email) sends them a confirmation.
 *
 * Paste this whole file into Extensions → Apps Script of your orders spreadsheet.
 * Full steps are in SETUP.md.
 */

// ---- Settings you can change -------------------------------------------------
var CAFE_NAME = "The Chilli'Oz";
// Where new-order emails go. Leave "" to use the Google account that deploys this script.
var NOTIFY_EMAIL = "";
// Send customers a confirmation email when they give an address.
var SEND_CUSTOMER_EMAIL = true;
var SHEET_NAME = "Orders";
var TIME_ZONE = "Australia/Melbourne";
// ------------------------------------------------------------------------------

var HEADERS = [
  "Received", "Order ID", "Status", "Pickup day", "Pickup date", "Pickup time",
  "Name", "Phone", "Email", "Items", "Total (AUD)", "Notes"
];

/** Run this once from the editor to create the sheet and grant permissions. */
function setup() {
  getSheet_();
  Logger.log("Ready. Orders will be saved to the '" + SHEET_NAME + "' tab.");
}

/** Opening the web app URL in a browser shows this, which is a quick way to check it is live. */
function doGet() {
  return ContentService.createTextOutput(CAFE_NAME + " order service is running.");
}

function doPost(e) {
  try {
    var order = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Spam trap: the website has a hidden "website" field that people never fill in.
    if (order.website) return json_({ ok: true, orderId: "CO-0" });

    var problem = validate_(order);
    if (problem) return json_({ ok: false, error: problem });

    var items = order.items.map(function (it) {
      var qty = Math.max(1, Math.min(20, parseInt(it.qty, 10) || 1));
      var unit = Math.max(0, Number(it.unitPrice) || 0);
      return {
        name: clean_(it.name, 80),
        options: clean_(it.options, 80),
        qty: qty,
        lineTotal: Math.round(unit * qty * 100) / 100
      };
    });
    var total = items.reduce(function (s, it) { return s + it.lineTotal; }, 0);

    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    var orderId;
    try {
      var sheet = getSheet_();
      var now = new Date();
      orderId = "CO-" + Utilities.formatDate(now, TIME_ZONE, "yyMMdd") + "-" +
        ("000" + sheet.getLastRow()).slice(-4);
      sheet.appendRow([
        now,
        orderId,
        "New",
        safe_(clean_(order.pickupDay, 30)),
        safe_(clean_(order.pickupDate, 10)),
        safe_(clean_(order.pickupTime, 20)),
        safe_(clean_(order.name, 80)),
        safe_(clean_(order.phone, 30)),
        safe_(clean_(order.email, 120)),
        safe_(items.map(itemLine_).join("\n")),
        total,
        safe_(clean_(order.notes, 500))
      ]);
    } finally {
      lock.releaseLock();
    }

    var details = {
      orderId: orderId, items: items, total: total,
      name: clean_(order.name, 80), phone: clean_(order.phone, 30), email: clean_(order.email, 120),
      pickup: clean_(order.pickupDay, 30) + ", " +
        (order.pickupTime === "ASAP" ? "as soon as possible" : clean_(order.pickupTime, 20)),
      notes: clean_(order.notes, 500)
    };
    notifyCafe_(details);
    if (SEND_CUSTOMER_EMAIL && isEmail_(details.email)) confirmCustomer_(details);

    return json_({ ok: true, orderId: orderId });
  } catch (err) {
    return json_({ ok: false, error: "Server error, please try again" });
  }
}

// ---- helpers -----------------------------------------------------------------

function validate_(o) {
  if (!o || typeof o !== "object") return "Empty order";
  if (!clean_(o.name, 80)) return "Please add your name";
  if (!/[0-9]{8,}/.test(String(o.phone || "").replace(/[\s()+-]/g, ""))) return "Please add a valid phone number";
  if (o.email && !isEmail_(o.email)) return "Please check your email address";
  if (!Array.isArray(o.items) || !o.items.length) return "Your order is empty";
  if (o.items.length > 40) return "Too many items in one order";
  if (!o.pickupTime) return "Please choose a pickup time";
  return "";
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#FFF6E6");
    sheet.getRange("A:A").setNumberFormat("ddd d mmm, h:mm am/pm");
    sheet.getRange("K:K").setNumberFormat("$0.00");
    sheet.getRange("J:J").setWrap(true);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["New", "Making", "Ready", "Collected", "Cancelled"], true).build();
    sheet.getRange("C2:C").setDataValidation(rule);
  }
  return sheet;
}

function itemLine_(it) {
  return it.qty + " × " + it.name + (it.options ? " (" + it.options + ")" : "") + "  $" + it.lineTotal.toFixed(2);
}

function itemsTable_(d) {
  var rows = d.items.map(function (it) {
    return "<tr><td style='padding:4px 12px 4px 0'>" + it.qty + " × " + esc_(it.name) +
      (it.options ? "<br><small style='color:#6b4a3a'>" + esc_(it.options) + "</small>" : "") +
      "</td><td style='padding:4px 0;text-align:right'>$" + it.lineTotal.toFixed(2) + "</td></tr>";
  }).join("");
  return "<table style='border-collapse:collapse;font:15px/1.4 Arial,sans-serif;color:#4A2214'>" + rows +
    "<tr><td style='padding-top:8px;border-top:1px solid #e6d3b8'><b>Total</b></td>" +
    "<td style='padding-top:8px;border-top:1px solid #e6d3b8;text-align:right'><b>$" + d.total.toFixed(2) +
    "</b></td></tr></table>";
}

function notifyCafe_(d) {
  var to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  var html =
    "<div style='font:15px/1.5 Arial,sans-serif;color:#4A2214'>" +
    "<h2 style='color:#E03A22;margin:0 0 8px'>New order " + d.orderId + "</h2>" +
    "<p><b>Pickup:</b> " + esc_(d.pickup) + "<br><b>Name:</b> " + esc_(d.name) +
    "<br><b>Phone:</b> " + esc_(d.phone) + (d.email ? "<br><b>Email:</b> " + esc_(d.email) : "") + "</p>" +
    itemsTable_(d) +
    (d.notes ? "<p><b>Notes:</b> " + esc_(d.notes) + "</p>" : "") +
    "<p style='color:#6b4a3a'>Payment is taken at pickup.</p></div>";
  MailApp.sendEmail({
    to: to,
    subject: "🌶 New order " + d.orderId + " · " + d.pickup + " · $" + d.total.toFixed(2),
    htmlBody: html,
    replyTo: isEmail_(d.email) ? d.email : to,
    name: CAFE_NAME + " Orders"
  });
}

function confirmCustomer_(d) {
  var html =
    "<div style='font:15px/1.5 Arial,sans-serif;color:#4A2214'>" +
    "<h2 style='color:#E03A22;margin:0 0 8px'>Thanks, " + esc_(d.name) + "!</h2>" +
    "<p>We've got your order <b>" + d.orderId + "</b> and will have it ready for pickup " +
    esc_(d.pickup) + ".</p>" + itemsTable_(d) +
    "<p>See you soon!</p>" +
    "<p style='color:#4FAE2E'><b>" + CAFE_NAME + "</b> · Where spice meets sweet</p></div>";
  MailApp.sendEmail({
    to: d.email,
    subject: "Your " + CAFE_NAME + " order " + d.orderId,
    htmlBody: html,
    name: CAFE_NAME
  });
}

function clean_(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
}

// Stops text that starts with = + - @ being run as a spreadsheet formula.
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function isEmail_(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || ""));
}

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
