/* Shared header, footer, cart and trading-hours helpers for every page. */
(function () {
  var CFG = window.CHILLIOZ_CONFIG;
  var CART_KEY = "chillioz-cart-v1";
  var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------- money ---------- */
  function money(n) {
    return "$" + (Math.round(n * 100) / 100).toFixed(2);
  }

  /* ---------- trading hours (always in Melbourne time) ---------- */
  function toMinutes(hhmm) {
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }

  function formatTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h >= 12 ? "pm" : "am";
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ":" + (m < 10 ? "0" : "") + m + suffix;
  }

  // Current date and time in the café's time zone, whatever the visitor's own zone is.
  function cafeNow() {
    var parts = new Intl.DateTimeFormat("en-AU", {
      timeZone: CFG.timeZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23"
    }).formatToParts(new Date());
    var v = {};
    parts.forEach(function (p) { v[p.type] = p.value; });
    var y = +v.year, mo = +v.month, d = +v.day;
    return {
      y: y, m: mo, d: d,
      weekday: new Date(Date.UTC(y, mo - 1, d)).getUTCDay(),
      minutes: (+v.hour) * 60 + (+v.minute)
    };
  }

  // A calendar day `offset` days after today (café time).
  function cafeDay(offset) {
    var now = cafeNow();
    var dt = new Date(Date.UTC(now.y, now.m - 1, now.d + offset));
    var iso = dt.toISOString().slice(0, 10);
    return {
      iso: iso,
      weekday: dt.getUTCDay(),
      label: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" :
        DAY_NAMES[dt.getUTCDay()] + " " + dt.getUTCDate() + " " +
        dt.toLocaleString("en-AU", { month: "short", timeZone: "UTC" })
    };
  }

  function hoursFor(weekday) {
    return CFG.hours[weekday] || null;
  }

  function openStatus() {
    var now = cafeNow();
    var today = hoursFor(now.weekday);
    if (today && now.minutes >= toMinutes(today.open) && now.minutes < toMinutes(today.close)) {
      return { open: true, text: "Open now · until " + formatTime(toMinutes(today.close)) };
    }
    if (today && now.minutes < toMinutes(today.open)) {
      return { open: false, text: "Closed · opens " + formatTime(toMinutes(today.open)) + " today" };
    }
    for (var i = 1; i <= 7; i++) {
      var wd = (now.weekday + i) % 7, h = hoursFor(wd);
      if (h) {
        return { open: false, text: "Closed · opens " + (i === 1 ? "tomorrow" : DAY_NAMES[wd]) + " " + formatTime(toMinutes(h.open)) };
      }
    }
    return { open: false, text: "Closed" };
  }

  // Pickup slots for a day offset, as minutes after midnight.
  function pickupSlots(offset) {
    var day = cafeDay(offset), h = hoursFor(day.weekday);
    if (!h) return [];
    var start = toMinutes(h.open);
    var end = toMinutes(h.close) - CFG.lastOrderBeforeCloseMinutes;
    if (offset === 0) {
      var earliest = cafeNow().minutes + CFG.prepMinutes;
      start = Math.max(start, Math.ceil(earliest / 15) * 15);
    }
    var slots = [];
    for (var t = start; t <= end; t += 15) slots.push(t);
    return slots;
  }

  /* ---------- cart (kept in this browser) ---------- */
  function readCart() {
    try {
      var c = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(c) ? c : [];
    } catch (e) { return []; }
  }

  function writeCart(cart) {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* storage blocked */ }
    updateCartBadge();
    document.dispatchEvent(new CustomEvent("cart:change"));
  }

  function findItem(id) {
    var menu = window.CHILLIOZ_MENU || [];
    for (var i = 0; i < menu.length; i++) {
      for (var j = 0; j < menu[i].items.length; j++) {
        if (menu[i].items[j].id === id) return menu[i].items[j];
      }
    }
    return null;
  }

  function findCategory(id) {
    var menu = window.CHILLIOZ_MENU || [];
    for (var i = 0; i < menu.length; i++) {
      for (var j = 0; j < menu[i].items.length; j++) {
        if (menu[i].items[j].id === id) return menu[i];
      }
    }
    return null;
  }

  // A choice value is either plain text or { label, add }.
  function valueLabel(v) { return typeof v === "string" ? v : v.label; }
  function valueAdd(v) { return typeof v === "string" ? 0 : (v.add || 0); }

  // Price of one unit including size and extras, always worked out from menu-data.js.
  function unitPrice(line) {
    var item = findItem(line.id);
    if (!item) return 0;
    var p = item.price || 0;
    if (item.sizes) {
      var size = item.sizes.filter(function (s) { return s.label === line.size; })[0] || item.sizes[0];
      p = size.price;
    }
    (item.choices || []).forEach(function (c) {
      var picked = line.choices && line.choices[c.name];
      c.values.forEach(function (v) { if (valueLabel(v) === picked) p += valueAdd(v); });
    });
    (item.addons || []).forEach(function (a) {
      if (line.addons && line.addons.indexOf(a.label) > -1) p += a.add || 0;
    });
    return p;
  }

  // "Large, Latte, Oat milk" — what the kitchen needs to know about a line.
  function lineLabel(line) {
    var item = findItem(line.id), bits = [];
    if (!item) return "";
    if (item.sizes && line.size) bits.push(line.size);
    (item.choices || []).forEach(function (c) {
      var v = line.choices && line.choices[c.name];
      if (v) bits.push(c.name === "Milk" ? v + " milk" : c.name === "Sauce" ? v + " sauce" : v);
    });
    (line.addons || []).forEach(function (a) { bits.push(a); });
    return bits.join(", ");
  }

  function lineKey(line) {
    return JSON.stringify([line.id, line.size || "", line.choices || {}, (line.addons || []).slice().sort()]);
  }

  // Sections like breakfast are only served until a set time.
  function availableUntil(id) {
    var cat = findCategory(id);
    return cat && cat.availableUntil ? toMinutes(cat.availableUntil) : null;
  }

  function addToCart(line) {
    var cart = readCart(), key = lineKey(line), found = false;
    cart.forEach(function (l) {
      if (lineKey(l) === key) { l.qty = Math.min(20, l.qty + line.qty); found = true; }
    });
    if (!found) cart.push(line);
    writeCart(cart);
  }

  function cartCount() {
    return readCart().reduce(function (n, l) { return n + l.qty; }, 0);
  }

  function updateCartBadge() {
    var n = cartCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.hidden = n === 0;
    });
  }

  /* ---------- header and footer ---------- */
  var NAV = [
    { href: "index.html", label: "Home" },
    { href: "menu.html", label: "Menu" },
    { href: "about.html", label: "About" },
    { href: "contact.html", label: "Contact" }
  ];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderHeader() {
    var el = document.getElementById("site-header");
    if (!el) return;
    var page = document.body.getAttribute("data-page");
    var status = openStatus();
    el.innerHTML =
      '<div class="header-inner">' +
        '<a class="brand" href="index.html" aria-label="The Chilli\'Oz home">' +
          '<img src="assets/img/logo-small.png" alt="" width="52" height="52">' +
          '<span class="brand-name">The Chilli\'Oz</span>' +
        '</a>' +
        '<button class="nav-toggle" id="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Show pages">☰</button>' +
        '<nav class="site-nav" id="site-nav" aria-label="Main">' +
          NAV.map(function (n) {
            var current = n.href.indexOf(page) === 0 ? ' aria-current="page"' : "";
            return '<a href="' + n.href + '"' + current + '>' + n.label + '</a>';
          }).join("") +
        '</nav>' +
        '<a class="cart-link" href="order.html" aria-label="Your order">' +
          '<span>Order</span><span class="cart-count" data-cart-count hidden>0</span>' +
        '</a>' +
      '</div>' +
      '<div class="status-strip ' + (status.open ? "is-open" : "is-closed") + '">' +
        '<span class="dot" aria-hidden="true"></span>' + esc(status.text) +
      '</div>';

    // The menu page's category bar sticks just under the header, so it needs the header's height.
    function setHeaderHeight() {
      document.documentElement.style.setProperty("--header-h", el.offsetHeight + "px");
    }
    setHeaderHeight();
    window.addEventListener("resize", setHeaderHeight);

    var toggle = document.getElementById("nav-toggle");
    toggle.addEventListener("click", function () {
      var open = el.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      setHeaderHeight();
    });
  }

  function hoursListHTML() {
    var order = [1, 2, 3, 4, 5, 6, 0];
    return '<dl class="hours-list">' + order.map(function (wd) {
      var h = hoursFor(wd);
      return '<div><dt>' + DAY_NAMES[wd] + '</dt><dd>' +
        (h ? formatTime(toMinutes(h.open)) + " – " + formatTime(toMinutes(h.close)) : "Closed") +
        '</dd></div>';
    }).join("") + '</dl>';
  }

  function contactLinesHTML() {
    var out = [];
    if (CFG.address) {
      out.push(CFG.mapLink
        ? '<a href="' + esc(CFG.mapLink) + '" target="_blank" rel="noopener">' + esc(CFG.address) + '</a>'
        : esc(CFG.address));
    }
    if (CFG.phone) out.push('<a href="tel:' + esc(CFG.phone.replace(/\s+/g, "")) + '">' + esc(CFG.phone) + '</a>');
    if (CFG.email) out.push('<a href="mailto:' + esc(CFG.email) + '">' + esc(CFG.email) + '</a>');
    if (CFG.instagram) out.push('<a href="' + esc(CFG.instagram) + '" target="_blank" rel="noopener">Instagram</a>');
    if (CFG.facebook) out.push('<a href="' + esc(CFG.facebook) + '" target="_blank" rel="noopener">Facebook</a>');
    return out.map(function (l) { return "<li>" + l + "</li>"; }).join("");
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML =
      '<div class="footer-inner">' +
        '<div class="footer-brand">' +
          '<img src="assets/img/logo-small.png" alt="The Chilli\'Oz logo" width="88" height="88">' +
          '<p class="tagline">Where spice meets sweet.</p>' +
        '</div>' +
        '<div><h2 class="footer-h">Find us</h2><ul class="plain">' + contactLinesHTML() + '</ul></div>' +
        '<div><h2 class="footer-h">Opening hours</h2>' + hoursListHTML() + '</div>' +
      '</div>' +
      '<p class="footer-small">© ' + new Date().getFullYear() + ' The Chilli\'Oz · Breakfast, coffee, seafood, steak &amp; more · Food photos from <a href="https://unsplash.com" target="_blank" rel="noopener">Unsplash</a></p>';
  }

  window.Chillioz = {
    money: money, esc: esc, formatTime: formatTime, cafeDay: cafeDay, pickupSlots: pickupSlots,
    openStatus: openStatus, hoursListHTML: hoursListHTML, contactLinesHTML: contactLinesHTML,
    readCart: readCart, writeCart: writeCart, addToCart: addToCart, findItem: findItem,
    findCategory: findCategory, unitPrice: unitPrice, lineKey: lineKey, lineLabel: lineLabel,
    valueLabel: valueLabel, valueAdd: valueAdd, availableUntil: availableUntil,
    toMinutes: toMinutes, cafeNow: cafeNow, cartCount: cartCount
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    updateCartBadge();
  });
  // Keep the badge in step when the cart changes in another tab.
  window.addEventListener("storage", function (e) { if (e.key === CART_KEY) updateCartBadge(); });
})();
