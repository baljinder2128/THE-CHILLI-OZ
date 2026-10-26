/* Renders the menu (menu.html) and the featured signatures (index.html). */
(function () {
  var C = window.Chillioz;
  var OPTIONS = window.CHILLIOZ_OPTIONS;
  var TAG_LABELS = { signature: "Signature", spicy: "Spicy", veg: "Vegetarian" };

  function tagsHTML(tags) {
    if (!tags || !tags.length) return "";
    return '<ul class="tags">' + tags.map(function (t) {
      return '<li class="tag tag-' + t + '">' + (TAG_LABELS[t] || t) + "</li>";
    }).join("") + "</ul>";
  }

  function optionsHTML(item) {
    var opts = item.options && OPTIONS[item.options];
    if (!opts) return "";
    var id = "opt-" + item.id;
    return '<div class="item-options">' +
      '<label class="field-inline" for="' + id + '-milk">Milk ' +
        '<select id="' + id + '-milk" data-milk>' +
          opts.milk.map(function (m) {
            return '<option value="' + C.esc(m.label) + '">' + C.esc(m.label) +
              (m.price ? " +" + C.money(m.price) : "") + "</option>";
          }).join("") +
        "</select></label>" +
      '<label class="field-inline check" for="' + id + '-shot">' +
        '<input type="checkbox" id="' + id + '-shot" data-shot> Extra shot +' + C.money(opts.extraShot) +
      "</label>" +
    "</div>";
  }

  function itemHTML(item) {
    var soldOut = !!item.soldOut;
    return '<article class="item' + (soldOut ? " is-sold-out" : "") + '" data-item="' + item.id + '">' +
      '<div class="item-head">' +
        '<h3 class="item-name">' + C.esc(item.name) + "</h3>" +
        '<span class="item-price">' + C.money(item.price) + "</span>" +
      "</div>" +
      '<p class="item-desc">' + C.esc(item.desc || "") + "</p>" +
      tagsHTML(item.tags) +
      (soldOut ? '<p class="sold-out">Sold out today</p>' :
        optionsHTML(item) +
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

  function wireItems(root) {
    root.addEventListener("click", function (e) {
      var card = e.target.closest("[data-item]");
      if (!card) return;
      var qtyEl = card.querySelector("[data-qty]");
      var step = e.target.closest("[data-step]");
      if (step) {
        var q = Math.min(20, Math.max(1, parseInt(qtyEl.textContent, 10) + parseInt(step.getAttribute("data-step"), 10)));
        qtyEl.textContent = q;
        return;
      }
      if (e.target.closest("[data-add]")) {
        var milk = card.querySelector("[data-milk]");
        var shot = card.querySelector("[data-shot]");
        var line = { id: card.getAttribute("data-item"), qty: parseInt(qtyEl.textContent, 10) };
        if (milk) line.milk = milk.value;
        if (shot && shot.checked) line.extraShot = true;
        C.addToCart(line);
        qtyEl.textContent = 1;
        if (shot) shot.checked = false;
        toast("Added " + line.qty + " × " + C.findItem(line.id).name);
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
        '<header class="menu-section-head">' +
          '<h2 id="h-' + cat.id + '">' + C.esc(cat.name) + "</h2>" +
          (cat.blurb ? "<p>" + C.esc(cat.blurb) + "</p>" : "") +
        "</header>" +
        '<div class="item-grid">' + cat.items.map(itemHTML).join("") + "</div>" +
      "</section>";
    }).join("");
    wireItems(root);
  }

  function renderFeatured(root) {
    var picks = [];
    window.CHILLIOZ_MENU.forEach(function (cat) {
      cat.items.forEach(function (it) {
        if (it.tags && it.tags.indexOf("signature") > -1 && !it.soldOut) picks.push(it);
      });
    });
    // One from each part of the menu reads better than four drinks in a row.
    var chosen = ["chilli-cocoa", "chilli-brownie", "chicken-chilli-mayo", "spiced-chai"]
      .map(C.findItem).filter(function (it) { return it && !it.soldOut; });
    if (chosen.length < 4) chosen = picks.slice(0, 4);
    root.innerHTML = chosen.map(itemHTML).join("");
    wireItems(root);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var m = document.getElementById("menu-root");
    if (m) renderMenu(m);
    var f = document.getElementById("featured-root");
    if (f) renderFeatured(f);
  });
})();
