/* Renders the menu (menu.html), plus the featured dishes and section tiles on index.html. */
(function () {
  var C = window.Chillioz;
  var TAG_LABELS = { spicy: "Spicy", veg: "Vegetarian", kids: "Kids" };

  function tagsHTML(tags) {
    if (!tags || !tags.length) return "";
    return '<ul class="tags">' + tags.map(function (t) {
      return '<li class="tag tag-' + t + '">' + (TAG_LABELS[t] || t) + "</li>";
    }).join("") + "</ul>";
  }

  function priceHTML(item) {
    if (item.sizes) {
      return item.sizes.map(function (s) {
        return '<span class="price-size"><small>' + C.esc(s.label) + "</small> " + C.money(s.price) + "</span>";
      }).join("");
    }
    return C.money(item.price);
  }

  function optionsHTML(item, uid) {
    var out = [];
    if (item.sizes) {
      out.push('<fieldset class="sizes"><legend class="visually-hidden">Size</legend>' +
        item.sizes.map(function (s, i) {
          var id = uid + "-size-" + i;
          return '<input type="radio" name="' + uid + '-size" id="' + id + '" value="' + C.esc(s.label) + '"' +
            (i === 0 ? " checked" : "") + ' data-size>' +
            '<label for="' + id + '">' + C.esc(s.label) + " " + C.money(s.price) + "</label>";
        }).join("") + "</fieldset>");
    }
    (item.choices || []).forEach(function (c, ci) {
      var id = uid + "-c" + ci;
      out.push('<label class="field-inline" for="' + id + '">' + C.esc(c.name) +
        ' <select id="' + id + '" data-choice="' + C.esc(c.name) + '">' +
        c.values.map(function (v) {
          var label = C.valueLabel(v), add = C.valueAdd(v);
          return '<option value="' + C.esc(label) + '"' + (c.initial === label ? " selected" : "") + ">" +
            C.esc(label) + (add ? " +" + C.money(add) : "") + "</option>";
        }).join("") + "</select></label>");
    });
    (item.addons || []).forEach(function (a, ai) {
      var id = uid + "-a" + ai;
      out.push('<label class="field-inline check" for="' + id + '"><input type="checkbox" id="' + id +
        '" data-addon="' + C.esc(a.label) + '"> ' + C.esc(a.label) + (a.add ? " +" + C.money(a.add) : "") + "</label>");
    });
    return out.length ? '<div class="item-options">' + out.join("") + "</div>" : "";
  }

  function itemHTML(item, prefix) {
    var uid = (prefix || "m") + "-" + item.id;
    var soldOut = !!item.soldOut;
    return '<article class="item' + (soldOut ? " is-sold-out" : "") + '" data-item="' + item.id + '">' +
      '<div class="item-head">' +
        '<h3 class="item-name">' + C.esc(item.name) + "</h3>" +
        '<span class="item-price">' + priceHTML(item) + "</span>" +
      "</div>" +
      (item.desc ? '<p class="item-desc">' + C.esc(item.desc) + "</p>" : "") +
      tagsHTML(item.tags) +
      (soldOut ? '<p class="sold-out">Sold out today</p>' :
        optionsHTML(item, uid) +
        '<div class="item-actions">' +
          '<div class="stepper" role="group" aria-label="Quantity for ' + C.esc(item.name) + '">' +
            '<button type="button" data-step="-1" aria-label="One fewer">−</button>' +
            '<output data-qty>1</output>' +
            '<button type="button" data-step="1" aria-label="One more">+</button>' +
          "</div>" +
          '<button type="button" class="btn btn-add" data-add>Add to order</button>' +
        "</div>") +
    "</article>";
  }

  function readLine(card) {
    var line = { id: card.getAttribute("data-item"), qty: parseInt(card.querySelector("[data-qty]").textContent, 10) };
    var size = card.querySelector("[data-size]:checked");
    if (size) line.size = size.value;
    var choices = {};
    card.querySelectorAll("[data-choice]").forEach(function (sel) { choices[sel.getAttribute("data-choice")] = sel.value; });
    if (Object.keys(choices).length) line.choices = choices;
    var addons = [];
    card.querySelectorAll("[data-addon]:checked").forEach(function (cb) { addons.push(cb.getAttribute("data-addon")); });
    if (addons.length) line.addons = addons;
    return line;
  }

  function wireItems(root) {
    root.addEventListener("click", function (e) {
      var card = e.target.closest("[data-item]");
      if (!card) return;
      var qtyEl = card.querySelector("[data-qty]");
      var step = e.target.closest("[data-step]");
      if (step) {
        qtyEl.textContent = Math.min(20, Math.max(1, parseInt(qtyEl.textContent, 10) + parseInt(step.getAttribute("data-step"), 10)));
        return;
      }
      if (e.target.closest("[data-add]")) {
        var line = readLine(card);
        C.addToCart(line);
        qtyEl.textContent = 1;
        card.querySelectorAll("[data-addon]").forEach(function (cb) { cb.checked = false; });
        var label = C.lineLabel(line);
        toast("Added " + line.qty + " × " + C.findItem(line.id).name + (label ? " (" + label + ")" : ""));
      }
    });
  }

  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      t.setAttribute("role", "status");
      document.body.appendChild(t);
    }
    t.innerHTML = C.esc(msg) + ' <a href="order.html">View order</a>';
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3500);
  }

  // If a photo fails to load, show the brand colour block instead of a broken image.
  function photoHTML(src, alt, cls) {
    return '<img class="' + cls + '" src="' + C.esc(src) + '" alt="' + C.esc(alt) + '" loading="lazy" ' +
      'onerror="this.classList.add(\'is-missing\')">';
  }

  function renderMenu(root) {
    var menu = window.CHILLIOZ_MENU;
    var jump = document.getElementById("menu-jump");
    if (jump) {
      jump.innerHTML = menu.map(function (cat) {
        return '<a href="#' + cat.id + '">' + C.esc(cat.name) + "</a>";
      }).join("");
    }
    root.innerHTML = menu.map(function (cat) {
      return '<section class="menu-section" id="' + cat.id + '" aria-labelledby="h-' + cat.id + '">' +
        '<header class="menu-banner">' +
          (cat.photo ? photoHTML(cat.photo, cat.name, "menu-banner-img") : "") +
          '<div class="menu-banner-text">' +
            '<h2 id="h-' + cat.id + '">' + C.esc(cat.name) + "</h2>" +
            (cat.blurb ? "<p>" + C.esc(cat.blurb) + "</p>" : "") +
          "</div>" +
        "</header>" +
        '<div class="item-grid">' + cat.items.map(function (it) { return itemHTML(it, "m"); }).join("") + "</div>" +
      "</section>";
    }).join("");
    wireItems(root);
  }

  function renderFeatured(root) {
    var picks = [];
    window.CHILLIOZ_MENU.forEach(function (cat) {
      cat.items.forEach(function (it) { if (it.featured && !it.soldOut) picks.push(it); });
    });
    root.innerHTML = picks.slice(0, 6).map(function (it) { return itemHTML(it, "f"); }).join("");
    wireItems(root);
  }

  function renderTiles(root) {
    root.innerHTML = window.CHILLIOZ_MENU.map(function (cat) {
      var from = Math.min.apply(null, cat.items.map(function (it) {
        return it.sizes ? it.sizes[0].price : it.price;
      }));
      return '<a class="tile" href="menu.html#' + cat.id + '">' +
        (cat.photo ? photoHTML(cat.photo, "", "tile-img") : "") +
        '<span class="tile-text"><span class="tile-name">' + C.esc(cat.name) + "</span>" +
        '<span class="tile-from">from ' + C.money(from) + "</span></span>" +
      "</a>";
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var m = document.getElementById("menu-root");
    if (m) renderMenu(m);
    var f = document.getElementById("featured-root");
    if (f) renderFeatured(f);
    var t = document.getElementById("tiles-root");
    if (t) renderTiles(t);
  });
})();
