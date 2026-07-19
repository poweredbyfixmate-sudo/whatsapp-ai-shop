/* ============================================================
   WhatsApp AI Shop — Application Logic
   Pure vanilla JS. No frameworks. No external libraries.
   IIFE-wrapped, event-delegated (no inline onclick).
   ============================================================ */
(function () {
  "use strict";

  /* ============================================================
     CONFIG
     ============================================================ */
  const STORE_WHATSAPP_NUMBER = "919025156687"; // country code + number, no + or spaces
  const STORAGE_KEYS = {
    cart: "was_cart_v1",
    theme: "was_theme_v1",
    orderHistory: "was_order_history_v1"
  };

  /* ============================================================
     STATE
     ============================================================ */
  let cart = loadJSON(STORAGE_KEYS.cart, {});         // { productId: qty }
  let orderHistory = loadJSON(STORAGE_KEYS.orderHistory, []); // [productId, ...] most recent first, deduped
  let currentSearch = "";
  let activeCategory = "all";
  let userLocation = null; // { lat, lng }

  /* ============================================================
     DOM REFS
     ============================================================ */
  const el = {
    themeToggle: document.getElementById("themeToggle"),
    themeIcon: document.getElementById("themeIcon"),
    cartIconBtn: document.getElementById("cartIconBtn"),
    cartBadge: document.getElementById("cartBadge"),
    searchInput: document.getElementById("searchInput"),
    searchClear: document.getElementById("searchClear"),
    aiTypingText: document.getElementById("aiTypingText"),
    aiChips: document.getElementById("aiChips"),
    categoryRail: document.getElementById("categoryRail"),
    searchHeading: document.getElementById("searchHeading"),
    searchHeadingText: document.getElementById("searchHeadingText"),
    searchCount: document.getElementById("searchCount"),
    popularSection: document.getElementById("popularSection"),
    popularRail: document.getElementById("popularRail"),
    recentSection: document.getElementById("recentSection"),
    recentRail: document.getElementById("recentRail"),
    reorderSection: document.getElementById("reorderSection"),
    reorderRail: document.getElementById("reorderRail"),
    clearHistoryBtn: document.getElementById("clearHistoryBtn"),
    categoryGrids: document.getElementById("categoryGrids"),
    fabWhatsapp: document.getElementById("fabWhatsapp"),
    cartBar: document.getElementById("cartBar"),
    cartBarCount: document.getElementById("cartBarCount"),
    cartBarTotal: document.getElementById("cartBarTotal"),
    viewCartBtn: document.getElementById("viewCartBtn"),
    cartOverlay: document.getElementById("cartOverlay"),
    cartSheet: document.getElementById("cartSheet"),
    closeCartBtn: document.getElementById("closeCartBtn"),
    cartItemsWrap: document.getElementById("cartItemsWrap"),
    cartEmptyState: document.getElementById("cartEmptyState"),
    cartList: document.getElementById("cartList"),
    cartFooter: document.getElementById("cartFooter"),
    cartSubtotal: document.getElementById("cartSubtotal"),
    cartTotal: document.getElementById("cartTotal"),
    clearCartBtn: document.getElementById("clearCartBtn"),
    checkoutBtn: document.getElementById("checkoutBtn"),
    checkoutOverlay: document.getElementById("checkoutOverlay"),
    checkoutSheet: document.getElementById("checkoutSheet"),
    closeCheckoutBtn: document.getElementById("closeCheckoutBtn"),
    customerName: document.getElementById("customerName"),
    shareLocationBtn: document.getElementById("shareLocationBtn"),
    locationStatus: document.getElementById("locationStatus"),
    orderPreview: document.getElementById("orderPreview"),
    sendWhatsappBtn: document.getElementById("sendWhatsappBtn"),
    toast: document.getElementById("toast")
  };

  /* ============================================================
     UTILITIES
     ============================================================ */
  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage full or unavailable — fail silently, app still works in-memory */
    }
  }

  function formatRupees(n) {
    return "₹" + Math.round(n).toLocaleString("en-IN");
  }

  function showToast(message) {
    el.toast.textContent = message;
    el.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => el.toast.classList.remove("show"), 2200);
  }

  /* Ripple effect on any element with .btn, .chip, .category-pill, .add-btn */
  function attachRipple(target, evt) {
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const span = document.createElement("span");
    const x = (evt.touches ? evt.touches[0].clientX : evt.clientX) - rect.left - size / 2;
    const y = (evt.touches ? evt.touches[0].clientY : evt.clientY) - rect.top - size / 2;
    span.className = "ripple";
    span.style.width = span.style.height = size + "px";
    span.style.left = x + "px";
    span.style.top = y + "px";
    target.style.position = target.style.position || "relative";
    target.appendChild(span);
    setTimeout(() => span.remove(), 500);
  }

  document.addEventListener("click", (e) => {
    const target = e.target.closest(".btn, .chip, .category-pill, .add-btn");
    if (target) attachRipple(target, e);
  });

  /* Generate a deterministic placeholder "photo" as inline SVG data URI,
     colour-coded per category with a category emoji + product initial. */
  const CATEGORY_COLORS = {
    rice: "#F2B705",
    oil: "#E4572E",
    snacks: "#8E6C88",
    dairy: "#128C7E",
    household: "#3F7CAC"
  };
  function getPlaceholderImage(product) {
    const emoji = (CATEGORIES.find((c) => c.id === product.category) || {}).emoji || "🛒";
    const color = CATEGORY_COLORS[product.category] || "#25D366";
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'>
      <rect width='200' height='200' fill='${color}' opacity='0.14'/>
      <text x='100' y='118' font-size='72' text-anchor='middle'>${emoji}</text>
    </svg>`;
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  /* ============================================================
     THEME (Light / Dark)
     ============================================================ */
  function initTheme() {
    const saved = loadJSON(STORAGE_KEYS.theme, null);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    applyTheme(theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    el.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
    saveJSON(STORAGE_KEYS.theme, theme);
  }

  el.themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ============================================================
     AI ASSISTANT — typing effect + quick suggestion chips
     ============================================================ */
  function initAIAssistant() {
    const message = "👋 Vanakkam!\n\nWelcome to WhatsApp AI Shop.\nWhat would you like to buy today?";
    let i = 0;
    el.aiTypingText.innerHTML = "";
    const cursor = document.createElement("span");
    cursor.className = "cursor";

    function typeNext() {
      if (i <= message.length) {
        el.aiTypingText.textContent = message.slice(0, i);
        el.aiTypingText.appendChild(cursor);
        i += 2;
        setTimeout(typeNext, 18);
      } else {
        el.aiTypingText.textContent = message;
        el.aiChips.hidden = false;
      }
    }
    typeNext();
  }

  el.aiChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const map = { rice: "rice", milk: "dairy", oil: "oil", biscuits: "snacks", household: "household" };
    const catId = map[chip.dataset.suggest];
    if (catId) {
      setActiveCategory(catId);
      scrollToCategory(catId);
    }
  });

  /* ============================================================
     CATEGORY RAIL
     ============================================================ */
  function renderCategoryRail() {
    const allPill = `<button class="category-pill ${activeCategory === "all" ? "active" : ""}" data-cat="all">🛍️ All</button>`;
    const pills = CATEGORIES.map(
      (c) => `<button class="category-pill ${activeCategory === c.id ? "active" : ""}" data-cat="${c.id}">${c.emoji} ${c.name}</button>`
    ).join("");
    el.categoryRail.innerHTML = allPill + pills;
  }

  el.categoryRail.addEventListener("click", (e) => {
    const pill = e.target.closest(".category-pill");
    if (!pill) return;
    setActiveCategory(pill.dataset.cat);
    scrollToCategory(pill.dataset.cat);
  });

  function setActiveCategory(catId) {
    activeCategory = catId;
    renderCategoryRail();
  }

  function scrollToCategory(catId) {
    if (catId === "all") {
      window.scrollTo({ top: el.categoryRail.offsetTop, behavior: "smooth" });
      return;
    }
    const section = document.getElementById("cat-" + catId);
    if (section) {
      const y = section.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }

  /* ============================================================
     PRODUCT CARD RENDERING
     ============================================================ */
  function productCardHTML(product) {
    const qty = cart[product.id] || 0;
    const img = product.image || getPlaceholderImage(product);
    const footer = !product.availability
      ? `<button class="add-btn" disabled style="opacity:.5;">Sold Out</button>`
      : qty > 0
      ? `<div class="stepper" data-id="${product.id}">
           <button class="stepper__btn" data-action="decrement">−</button>
           <span class="stepper__qty">${qty}</span>
           <button class="stepper__btn" data-action="increment">+</button>
         </div>`
      : `<button class="add-btn" data-action="add-to-cart" data-id="${product.id}">Add +</button>`;

    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-card__img-wrap">
          ${!product.availability ? `<div class="product-card__badge">OUT OF STOCK</div>` : ""}
          <img src="${img}" alt="${product.name}" loading="lazy" />
        </div>
        <div class="product-card__body">
          <span class="product-card__brand">${product.brand}</span>
          <h3 class="product-card__name">${product.name}</h3>
          <span class="product-card__unit">${product.unit}</span>
          <div class="product-card__price-row">
            <span class="product-card__price">${formatRupees(product.price)}</span>
          </div>
          <div class="product-card__footer">${footer}</div>
        </div>
      </article>`;
  }

  function renderRail(container, products) {
    container.innerHTML = products.map(productCardHTML).join("");
  }

  function renderGrid(container, products) {
    container.innerHTML = products.map(productCardHTML).join("");
  }

  /* Refresh just the footer (add-btn/stepper) of any visible card for a product,
     without re-rendering the whole DOM tree (keeps scroll position, avoids flicker) */
  function refreshProductCardFooters(productId) {
    const product = getProductById(productId);
    if (!product) return;
    document.querySelectorAll(`.product-card[data-product-id="${productId}"] .product-card__footer`).forEach((footerEl) => {
      const qty = cart[productId] || 0;
      footerEl.innerHTML =
        qty > 0
          ? `<div class="stepper" data-id="${productId}">
               <button class="stepper__btn" data-action="decrement">−</button>
               <span class="stepper__qty">${qty}</span>
               <button class="stepper__btn" data-action="increment">+</button>
             </div>`
          : `<button class="add-btn" data-action="add-to-cart" data-id="${productId}">Add +</button>`;
    });
  }

  /* ============================================================
     HOME SECTIONS — Popular / Recently Added / Quick Reorder / Category grids
     ============================================================ */
  function renderHomeSections() {
    // Popular: deterministic pseudo-popularity — every 3rd product by id order, capped at 10
    const popular = PRODUCTS.filter((p) => p.availability).filter((_, idx) => idx % 3 === 0).slice(0, 10);
    renderRail(el.popularRail, popular);

    // Recently added: last 10 items in catalog order (simulates "newest")
    const recent = PRODUCTS.slice(-10).reverse();
    renderRail(el.recentRail, recent);

    renderReorderRail();
    renderCategoryGrids();
  }

  function renderReorderRail() {
    if (!orderHistory.length) {
      el.reorderSection.hidden = true;
      return;
    }
    const products = orderHistory.map(getProductById).filter(Boolean).slice(0, 10);
    if (!products.length) {
      el.reorderSection.hidden = true;
      return;
    }
    el.reorderSection.hidden = false;
    renderRail(el.reorderRail, products);
  }

  el.clearHistoryBtn.addEventListener("click", () => {
    orderHistory = [];
    saveJSON(STORAGE_KEYS.orderHistory, orderHistory);
    renderReorderRail();
    showToast("Reorder history cleared");
  });

  function renderCategoryGrids() {
    el.categoryGrids.innerHTML = CATEGORIES.map(
      (c) => `
      <section class="rail-section" id="cat-${c.id}">
        <div class="section-heading">
          <h2>${c.emoji} ${c.name}</h2>
        </div>
        <div class="product-grid" id="grid-${c.id}"></div>
      </section>`
    ).join("");

    CATEGORIES.forEach((c) => {
      const gridEl = document.getElementById("grid-" + c.id);
      renderGrid(gridEl, getProductsByCategory(c.id));
    });
  }

  /* ============================================================
     SEARCH (instant, by name / brand / category)
     ============================================================ */
  function runSearch(query) {
    currentSearch = query.trim().toLowerCase();
    el.searchClear.hidden = currentSearch.length === 0;

    const isSearching = currentSearch.length > 0;
    el.popularSection.hidden = isSearching;
    el.recentSection.hidden = isSearching;
    el.reorderSection.hidden = isSearching || !orderHistory.length;
    el.categoryGrids.hidden = isSearching;
    el.categoryRail.hidden = isSearching;
    el.searchHeading.hidden = !isSearching;

    if (!isSearching) return;

    const categoryMatch = CATEGORIES.find(
      (c) => c.name.toLowerCase().includes(currentSearch) || c.id.includes(currentSearch)
    );

    const results = PRODUCTS.filter((p) => {
      if (categoryMatch && p.category === categoryMatch.id) return true;
      return (
        p.name.toLowerCase().includes(currentSearch) ||
        p.brand.toLowerCase().includes(currentSearch) ||
        p.category.toLowerCase().includes(currentSearch)
      );
    });

    el.searchHeadingText.textContent = `Results for "${query.trim()}"`;
    el.searchCount.textContent = `${results.length} item${results.length !== 1 ? "s" : ""}`;

    if (!el.searchResultsGrid) {
      el.searchResultsGrid = document.createElement("div");
      el.searchResultsGrid.className = "product-grid";
      el.searchResultsGrid.id = "searchResultsGrid";
      el.searchHeading.insertAdjacentElement("afterend", el.searchResultsGrid);
    }
    el.searchResultsGrid.hidden = false;

    if (results.length === 0) {
      el.searchResultsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state__emoji">🔎</div>
          <p>No products found for "${query.trim()}". Try "rice", "oil" or a brand name.</p>
        </div>`;
    } else {
      renderGrid(el.searchResultsGrid, results);
    }
  }

  el.searchInput.addEventListener("input", (e) => runSearch(e.target.value));
  el.searchClear.addEventListener("click", () => {
    el.searchInput.value = "";
    runSearch("");
    if (el.searchResultsGrid) el.searchResultsGrid.hidden = true;
  });

  /* ============================================================
     CART — add / increment / decrement / remove / clear
     ============================================================ */
  function addToCart(productId) {
    cart[productId] = (cart[productId] || 0) + 1;
    persistCart();
    refreshProductCardFooters(productId);
    updateCartUI();
    pushToHistory(productId);
    showToast("Added to cart 🛒");
  }

  function incrementItem(productId) {
    cart[productId] = (cart[productId] || 0) + 1;
    persistCart();
    refreshProductCardFooters(productId);
    updateCartUI();
    renderCartList();
  }

  function decrementItem(productId) {
    if (!cart[productId]) return;
    cart[productId] -= 1;
    if (cart[productId] <= 0) delete cart[productId];
    persistCart();
    refreshProductCardFooters(productId);
    updateCartUI();
    renderCartList();
  }

  function removeItem(productId) {
    delete cart[productId];
    persistCart();
    refreshProductCardFooters(productId);
    updateCartUI();
    renderCartList();
  }

  function clearCart() {
    cart = {};
    persistCart();
    document.querySelectorAll(".product-card").forEach((cardEl) => {
      refreshProductCardFooters(cardEl.dataset.productId);
    });
    updateCartUI();
    renderCartList();
    showToast("Cart cleared");
  }

  function persistCart() {
    saveJSON(STORAGE_KEYS.cart, cart);
  }

  function pushToHistory(productId) {
    orderHistory = [productId, ...orderHistory.filter((id) => id !== productId)].slice(0, 12);
    saveJSON(STORAGE_KEYS.orderHistory, orderHistory);
  }

  function getCartEntries() {
    return Object.entries(cart)
      .map(([id, qty]) => ({ product: getProductById(id), qty }))
      .filter((e) => e.product);
  }

  function getCartTotals() {
    const entries = getCartEntries();
    const itemCount = entries.reduce((sum, e) => sum + e.qty, 0);
    const subtotal = entries.reduce((sum, e) => sum + e.qty * e.product.price, 0);
    return { itemCount, subtotal, total: subtotal }; // no delivery fee / tax in this offline-only app
  }

  function updateCartUI() {
    const { itemCount, total } = getCartTotals();

    if (itemCount > 0) {
      el.cartBadge.hidden = false;
      el.cartBadge.textContent = itemCount;
      el.cartBar.hidden = false;
      el.cartBarCount.textContent = `${itemCount} item${itemCount !== 1 ? "s" : ""}`;
      el.cartBarTotal.textContent = formatRupees(total);
    } else {
      el.cartBadge.hidden = true;
      el.cartBar.hidden = true;
    }
  }

  function renderCartList() {
    const entries = getCartEntries();
    if (entries.length === 0) {
      el.cartEmptyState.hidden = false;
      el.cartList.hidden = true;
      el.cartFooter.hidden = true;
      return;
    }
    el.cartEmptyState.hidden = true;
    el.cartList.hidden = false;
    el.cartFooter.hidden = false;

    el.cartList.innerHTML = entries
      .map(
        ({ product, qty }) => `
        <li class="cart-list__item" data-id="${product.id}">
          <div class="cart-list__img"><img src="${product.image || getPlaceholderImage(product)}" alt="${product.name}" /></div>
          <div class="cart-list__info">
            <div class="cart-list__name">${product.name}</div>
            <div class="cart-list__meta">${product.brand} · ${product.unit}</div>
            <div class="cart-list__price">${formatRupees(product.price * qty)}</div>
          </div>
          <div class="stepper" data-id="${product.id}" style="flex-shrink:0;">
            <button class="stepper__btn" data-action="decrement">−</button>
            <span class="stepper__qty">${qty}</span>
            <button class="stepper__btn" data-action="increment">+</button>
          </div>
        </li>`
      )
      .join("");

    const { subtotal, total } = getCartTotals();
    el.cartSubtotal.textContent = formatRupees(subtotal);
    el.cartTotal.textContent = formatRupees(total);
  }

  /* Delegated click handling for add/stepper buttons across the whole document */
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    if (addBtn) {
      addToCart(addBtn.dataset.id);
      return;
    }
    const stepperBtn = e.target.closest(".stepper__btn");
    if (stepperBtn) {
      const stepper = stepperBtn.closest(".stepper");
      const id = stepper.dataset.id;
      if (stepperBtn.dataset.action === "increment") incrementItem(id);
      else decrementItem(id);
    }
  });

  el.clearCartBtn.addEventListener("click", clearCart);

  /* ============================================================
     CART SHEET open/close
     ============================================================ */
  function openCartSheet() {
    renderCartList();
    el.cartOverlay.hidden = false;
    el.cartSheet.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeCartSheet() {
    el.cartOverlay.hidden = true;
    el.cartSheet.hidden = true;
    document.body.style.overflow = "";
  }
  el.cartIconBtn.addEventListener("click", openCartSheet);
  el.viewCartBtn.addEventListener("click", openCartSheet);
  el.closeCartBtn.addEventListener("click", closeCartSheet);
  el.cartOverlay.addEventListener("click", closeCartSheet);

  /* ============================================================
     CHECKOUT SHEET
     ============================================================ */
  function openCheckoutSheet() {
    if (getCartEntries().length === 0) {
      showToast("Your cart is empty");
      return;
    }
    closeCartSheet();
    updateOrderPreview();
    el.checkoutOverlay.hidden = false;
    el.checkoutSheet.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeCheckoutSheet() {
    el.checkoutOverlay.hidden = true;
    el.checkoutSheet.hidden = true;
    document.body.style.overflow = "";
  }
  el.checkoutBtn.addEventListener("click", openCheckoutSheet);
  el.closeCheckoutBtn.addEventListener("click", closeCheckoutSheet);
  el.checkoutOverlay.addEventListener("click", closeCheckoutSheet);
  el.customerName.addEventListener("input", updateOrderPreview);

  /* ---------- Geolocation ---------- */
  el.shareLocationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      el.locationStatus.textContent = "Geolocation isn't supported on this device. You can still send the order and mention your address in WhatsApp.";
      el.locationStatus.className = "location-status error";
      return;
    }
    el.locationStatus.textContent = "Detecting your location...";
    el.locationStatus.className = "location-status";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        el.locationStatus.textContent = "📍 Location captured successfully!";
        el.locationStatus.className = "location-status success";
        updateOrderPreview();
      },
      (err) => {
        userLocation = null;
        el.locationStatus.textContent = "Couldn't get your location. You can allow location access and try again, or share it manually in WhatsApp.";
        el.locationStatus.className = "location-status error";
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });

  /* ---------- Build the WhatsApp order message ---------- */
  function buildOrderMessage() {
    const name = el.customerName.value.trim() || "Not provided";
    const entries = getCartEntries();
    const { total } = getCartTotals();

    const locationLine = userLocation
      ? `https://maps.google.com/?q=${userLocation.lat},${userLocation.lng}`
      : "Not shared";

    const itemLines = entries
      .map(({ product, qty }, idx) => `${idx + 1}. ${product.name} (${product.brand}) x${qty} — ${formatRupees(product.price * qty)}`)
      .join("\n");

    return (
      `🛒 *New Grocery Order*\n\n` +
      `*Customer Name:* ${name}\n` +
      `*Location:* ${locationLine}\n\n` +
      `*Order:*\n${itemLines}\n\n` +
      `*Grand Total:* ${formatRupees(total)}\n\n` +
      `🙏 Thank you!`
    );
  }

  function updateOrderPreview() {
    el.orderPreview.textContent = buildOrderMessage();
  }

  el.sendWhatsappBtn.addEventListener("click", () => {
    if (getCartEntries().length === 0) {
      showToast("Your cart is empty");
      return;
    }
    const message = buildOrderMessage();
    const url = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    showToast("Opening WhatsApp...");
  });

  /* ============================================================
     FLOATING WHATSAPP BUTTON — general enquiry chat
     ============================================================ */
  el.fabWhatsapp.addEventListener("click", (e) => {
    e.preventDefault();
    const message = "Hi! I'd like to know more about products at WhatsApp AI Shop 🛒";
    const url = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });

  /* ============================================================
     INIT
     ============================================================ */
  function init() {
    initTheme();
    initAIAssistant();
    renderCategoryRail();
    renderHomeSections();
    updateCartUI();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
