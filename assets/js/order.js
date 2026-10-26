/* Cart and checkout on order.html. Sends the order to the Google Apps Script web app. */
(function () {
  var C = window.Chillioz;
  var CFG = window.CHILLIOZ_CONFIG;

  var els = {};

  var lineLabel = C.lineLabel;

  // Minutes after midnight for the chosen pickup slot ("ASAP" means now plus prep time).
  function pickupMinutes() {
    var v = els.time.value;
    if (!v) return null;
    if (v === "ASAP") return C.cafeNow().minutes + CFG.prepMinutes;
    var m = /^(\d+):(\d+)(am|pm)$/.exec(v);
    if (!m) return null;
    var h = parseInt(m[1], 10) % 12 + (m[3] === "pm" ? 12 : 0);
    return h * 60 + parseInt(m[2], 10);
  }

  // Items such as breakfast that can't be served at the chosen pickup time.
  function lateItems() {
    var at = pickupMinutes();
    if (at === null) return [];
    var names = [];
    C.readCart().forEach(function (l) {
      var until = C.availableUntil(l.id);
      var it = C.findItem(l.id);
      if (until !== null && at > until && it && names.indexOf(it.name) === -1) names.push(it.name);
    });
    return names;
  }

  function checkTiming() {
    var late = lateItems();
    if (late.length) {
      setMessage("warn", "Breakfast is served until 11:30am. Please choose an earlier pickup time, or remove: " +
        late.map(C.esc).join(", ") + ".");
    } else if (els.msg.className.indexOf("warn") > -1) {
      els.msg.hidden = true;
    }
    return late.length === 0;
  }

  function total(cart) {
    return cart.reduce(function (s, l) { return s + C.unitPrice(l) * l.qty; }, 0);
  }

  function renderCart() {
    // Drop anything no longer on the menu (renamed, removed or sold out).
    var stored = C.readCart();
    var cart = stored.filter(function (l) {
      var it = C.findItem(l.id);
      return it && !it.soldOut && l.qty > 0;
    });
    if (cart.length !== stored.length) {
      C.writeCart(cart); // fires cart:change, which renders again with the cleaned cart
      return;
    }

    if (!cart.length) {
      els.cart.innerHTML =
        '<div class="empty-cart">' +
          "<p>Your order is empty.</p>" +
          '<a class="btn" href="menu.html">Browse the menu</a>' +
        "</div>";
      els.total.textContent = C.money(0);
      els.form.hidden = true;
      return;
    }
    els.form.hidden = false;

    els.cart.innerHTML = '<ul class="cart-lines">' + cart.map(function (l, i) {
      var it = C.findItem(l.id), opts = lineLabel(l);
      return '<li class="cart-line" data-index="' + i + '">' +
        '<div class="cart-line-main">' +
          '<span class="cart-line-name">' + C.esc(it.name) + "</span>" +
          (opts ? '<span class="cart-line-opts">' + C.esc(opts) + "</span>" : "") +
        "</div>" +
        '<div class="stepper small" role="group" aria-label="Quantity for ' + C.esc(it.name) + '">' +
          '<button type="button" data-step="-1" aria-label="One fewer">−</button>' +
          "<output>" + l.qty + "</output>" +
          '<button type="button" data-step="1" aria-label="One more">+</button>' +
        "</div>" +
        '<span class="cart-line-price">' + C.money(C.unitPrice(l) * l.qty) + "</span>" +
        '<button type="button" class="link-btn" data-remove aria-label="Remove ' + C.esc(it.name) + '">Remove</button>' +
      "</li>";
    }).join("") + "</ul>";
    els.total.textContent = C.money(total(cart));
  }

  function onCartClick(e) {
    var row = e.target.closest("[data-index]");
    if (!row) return;
    var cart = C.readCart(), i = +row.getAttribute("data-index");
    if (!cart[i]) return;
    var step = e.target.closest("[data-step]");
    if (step) {
      cart[i].qty = Math.min(20, cart[i].qty + parseInt(step.getAttribute("data-step"), 10));
      if (cart[i].qty <= 0) cart.splice(i, 1);
    } else if (e.target.closest("[data-remove]")) {
      cart.splice(i, 1);
    } else {
      return;
    }
    C.writeCart(cart);
  }

  /* ---------- pickup day and time ---------- */
  function fillDays() {
    var html = [];
    for (var i = 0; i <= CFG.daysAhead; i++) {
      if (C.pickupSlots(i).length) {
        var d = C.cafeDay(i);
        html.push('<option value="' + i + '">' + C.esc(d.label) + "</option>");
      }
    }
    els.day.innerHTML = html.join("");
    fillTimes();
  }

  function fillTimes() {
    var offset = parseInt(els.day.value, 10);
    var slots = C.pickupSlots(offset);
    var html = [];
    if (offset === 0 && C.openStatus().open && slots.length) {
      html.push('<option value="ASAP">As soon as possible (about ' + CFG.prepMinutes + " min)</option>");
    }
    slots.forEach(function (m) {
      html.push('<option value="' + C.formatTime(m) + '">' + C.formatTime(m) + "</option>");
    });
    els.time.innerHTML = html.join("");
  }

  /* ---------- submit ---------- */
  function setMessage(kind, html) {
    els.msg.className = "form-msg " + kind;
    els.msg.innerHTML = html;
    els.msg.hidden = false;
  }

  function contactFallback() {
    var bits = [];
    if (CFG.phone) bits.push("call us on <strong>" + C.esc(CFG.phone) + "</strong>");
    if (CFG.email) bits.push("email <strong>" + C.esc(CFG.email) + "</strong>");
    return bits.length ? " You can also " + bits.join(" or ") + "." : "";
  }

  function onSubmit(e) {
    e.preventDefault();
    els.msg.hidden = true;

    if (!CFG.orderEndpoint) {
      setMessage("warn", "Online ordering is being set up and will open soon. Please order at the counter for now." + contactFallback());
      return;
    }
    var phone = els.form.elements.phone;
    phone.setCustomValidity(phone.value.replace(/\D/g, "").length >= 8 ? "" : "Please enter a phone number we can call");
    if (!els.form.reportValidity()) return;
    if (!checkTiming()) return;

    var cart = C.readCart();
    if (!cart.length) return;

    var dayOffset = parseInt(els.day.value, 10);
    var payload = {
      name: els.form.elements.name.value.trim(),
      phone: els.form.elements.phone.value.trim(),
      email: els.form.elements.email.value.trim(),
      pickupDate: C.cafeDay(dayOffset).iso,
      pickupDay: C.cafeDay(dayOffset).label,
      pickupTime: els.time.value,
      notes: els.form.elements.notes.value.trim(),
      website: els.form.elements.website.value, // spam trap, real people leave it empty
      items: cart.map(function (l) {
        var it = C.findItem(l.id);
        return {
          id: l.id, name: it.name, qty: l.qty, options: lineLabel(l),
          unitPrice: +C.unitPrice(l).toFixed(2),
          lineTotal: +(C.unitPrice(l) * l.qty).toFixed(2)
        };
      }),
      total: +total(cart).toFixed(2)
    };

    els.submit.disabled = true;
    els.submit.textContent = "Sending your order…";

    // text/plain keeps this a "simple" request, which Google Apps Script accepts from any site.
    fetch(CFG.orderEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.error) || "Order not accepted");
        C.writeCart([]);
        showConfirmation(res.orderId, payload);
      })
      .catch(function (err) {
        setMessage("error",
          "We couldn't send your order (" + C.esc(err.message || "network error") + "). " +
          "Please check your connection and try again." + contactFallback());
      })
      .then(function () {
        els.submit.disabled = false;
        els.submit.textContent = "Place order";
      });
  }

  function showConfirmation(orderId, p) {
    els.checkout.hidden = true;
    els.done.hidden = false;
    els.done.querySelector("[data-order-id]").textContent = orderId;
    els.done.querySelector("[data-pickup]").textContent =
      p.pickupDay + ", " + (p.pickupTime === "ASAP" ? "as soon as possible" : p.pickupTime);
    els.done.querySelector("[data-total]").textContent = C.money(p.total);
    els.done.querySelector("[data-email-note]").hidden = !p.email;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    els = {
      checkout: document.getElementById("checkout"),
      done: document.getElementById("order-done"),
      cart: document.getElementById("cart-root"),
      total: document.getElementById("cart-total"),
      form: document.getElementById("checkout-form"),
      day: document.getElementById("pickup-day"),
      time: document.getElementById("pickup-time"),
      msg: document.getElementById("form-msg"),
      submit: document.getElementById("submit-order"),
      setup: document.getElementById("setup-note")
    };
    if (!CFG.orderEndpoint) els.setup.hidden = false;

    document.addEventListener("cart:change", renderCart);
    renderCart();
    fillDays();
    if (!els.day.options.length) {
      setMessage("warn", "Pickup times aren't available right now. Please check back during opening hours.");
      els.submit.disabled = true;
    }
    els.cart.addEventListener("click", onCartClick);
    els.day.addEventListener("change", function () { fillTimes(); checkTiming(); });
    els.time.addEventListener("change", checkTiming);
    document.addEventListener("cart:change", checkTiming);
    els.form.addEventListener("submit", onSubmit);
  });
})();
