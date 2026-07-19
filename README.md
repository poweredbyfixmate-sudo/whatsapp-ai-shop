# 🛒 WhatsApp AI Shop

A super simple, AI-style grocery shopping web app for local stores. Customers browse products, build a cart, and send the entire order straight to your store's WhatsApp — no signup, no OTP, no address forms, no backend at all.

Built with **pure HTML, CSS and vanilla JavaScript**. No frameworks, no build step, no external libraries, no CDN, no database. Works fully offline once loaded.

---

## ✨ Features

- **AI Assistant greeting** with a typing animation and quick-suggestion chips (Rice, Milk, Oil, Biscuits, Household)
- **60 products** across **5 categories** (Rice & Grains, Oil & Spices, Biscuits & Snacks, Dairy & Daily Needs, Household Essentials)
- **Instant search** by product name, brand, or category
- **Product cards** with quantity stepper (+ / −) that swaps in once an item is added
- **Floating bottom cart bar** with a live item count and total
- **Cart drawer** (slide-up sheet) with per-item quantity controls and a running subtotal/total
- **Checkout drawer** that only asks for a **name** and an optional **📍 Share My Location** (browser Geolocation API) — nothing else
- **One-tap WhatsApp order**: builds a formatted order message (items, quantities, total, Google Maps link) and opens WhatsApp automatically
- **Floating WhatsApp button** for general enquiries
- **Dark mode / Light mode** toggle, remembered across visits
- **Recently Added** and **Popular Products** rails
- **Quick Reorder** rail built from your last-ordered items
- **Cart persistence** via `localStorage` — your cart survives a page refresh
- Smooth fade/slide animations, button ripple effect, card hover, and an animated AI chat bubble
- Full SEO meta tags, Open Graph, Twitter Card, PWA manifest and favicon

---

## 📁 Files

```
index.html      → App shell, markup, SEO meta, PWA manifest link
style.css       → All styling: theme tokens, layout, components, animations, dark mode
script.js       → All app logic: cart, search, AI assistant, checkout, WhatsApp, storage
products.js     → Product catalog data (60 products, 5 categories) + category list
manifest.json   → PWA manifest (installable "Add to Home Screen")
README.md       → This file
```

No other files or dependencies are required.

---

## 🚀 Getting Started

### Run locally
Just open `index.html` in a browser — everything runs client-side. For the Geolocation API to work reliably on mobile Chrome, serve over `http://localhost` or `https://` rather than `file://`:

```bash
# any simple static server works, e.g.
python3 -m http.server 8080
# then visit http://localhost:8080
```

### Deploy to Netlify
1. Drag and drop the project folder onto [app.netlify.com/drop](https://app.netlify.com/drop), **or**
2. Connect your GitHub repo → Netlify auto-detects a static site → deploy (no build command needed).

### Deploy to GitHub Pages
1. Push these files to a GitHub repository.
2. Go to **Settings → Pages** → set source to your main branch (root).
3. Your site will be live at `https://<username>.github.io/<repo>/`.

---

## ⚙️ Configuration

### 1. Set your store's WhatsApp number
Open `script.js` and edit the top of the file:

```js
const STORE_WHATSAPP_NUMBER = "919025156687"; // country code + number, no + or spaces
```

### 2. Edit the product catalog
Open `products.js`. Each product is a plain object:

```js
{ id: "R01", category: "rice", name: "Ponni Boiled Rice", brand: "Aachi",
  price: 65, unit: "1 kg", image: "", description: "...", availability: true }
```

- `category` must match one of the ids in the `CATEGORIES` array at the top of the file.
- `image` can be left `""` to use the built-in colour-coded placeholder icon, or set to any image URL / local path (e.g. `"images/rice-ponni.jpg"`) to show a real product photo.
- Set `availability: false` to show a product as "Sold Out" (it becomes unselectable).
- Add/remove products freely — the UI (grids, search, rails) rebuilds automatically from this array.

### 3. Update store branding
In `index.html`, edit the `<title>`, meta description/keywords, and the `.app-bar__title` / `.app-bar__subtitle` text. The logo emoji (🛒) in the app bar and favicon can be swapped for a real logo image if you have one.

### 4. Colors / theme
All colors live as CSS custom properties at the top of `style.css`:

```css
:root {
  --primary: #25D366;      /* WhatsApp green */
  --primary-dark: #128C7E;
  --bg: #F7F8FA;
  ...
}
[data-theme="dark"] { /* dark mode overrides */ }
```

Change these values to re-theme the entire app instantly.

---

## 🧠 How the WhatsApp order message is built

When a customer taps **Send Order on WhatsApp**, the app composes a message like:

```
🛒 New Grocery Order

Customer Name: Karthik
Location: https://maps.google.com/?q=11.0168,76.9558

Order:
1. Ponni Boiled Rice (Aachi) x2 — ₹130
2. Toned Milk (Aavin) x1 — ₹25

Grand Total: ₹155

🙏 Thank you!
```

...and opens `https://wa.me/<number>?text=<encoded message>` in a new tab, which launches WhatsApp (app on mobile, WhatsApp Web on desktop) with the message pre-filled and ready to send.

---

## 🗂️ Data & Storage

Everything is stored in the browser's `localStorage` — nothing is sent to any server:

| Key                  | Purpose                                  |
|-----------------------|-------------------------------------------|
| `was_cart_v1`         | Current cart contents (product id → qty) |
| `was_theme_v1`        | Light/dark theme preference               |
| `was_order_history_v1`| Recently ordered product ids (Quick Reorder) |

Clearing browser data/cache will reset the app to a fresh state.

---

## 📱 Browser support notes

- **Geolocation** requires a secure context (`https://` or `localhost`) and the user's permission. If denied or unavailable, checkout still works — the order message simply shows "Location: Not shared" and the customer can describe their address directly in WhatsApp.
- Designed **mobile-first** (tested down to 320px width) and scales up gracefully to tablet/desktop.
- No external fonts/icons are loaded — all icons are emoji or inline SVG, keeping the app fast and fully offline-capable after first load.

---

## 📄 License

Free to use and modify for your own store.
