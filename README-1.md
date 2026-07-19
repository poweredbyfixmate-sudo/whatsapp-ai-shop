# TeaChat AI ☕
### Talk. Order. Enjoy.

A conversational, WhatsApp-style tea parcel ordering experience. No product grid, no shopping cart page, no traditional checkout — the customer orders entirely by chatting with a friendly AI tea shop assistant.

Built with **pure HTML, CSS and JavaScript**. No backend, no database, no framework. 100% static — works offline once loaded and deploys instantly to Netlify.

---

## ✨ Features

- **Bilingual from the first tap** — English 🇬🇧 or Tamil 🇮🇳. Once chosen, the entire conversation stays in that language only.
- **WhatsApp-style chat UI** — rounded bubbles, typing indicator, online status, delivered ticks, glassmorphism cards, animated gradient background.
- **One question at a time** — the assistant never shows a form or a product grid. Menu choices appear as tappable chat chips.
- **Smart combo suggestions** — after every drink parcel, the assistant naturally suggests a matching snack (Biscuit / Rusk / Mixture / Murukku).
- **Free-text understanding** — customers can also just type ("2 tea", "வேணும் காபி") and the assistant will understand basic item + quantity phrases.
- **Live location capture** — "📍 Share My Location" uses the browser Geolocation API and turns it into a Google Maps link. If denied, the assistant gracefully asks for a typed address instead.
- **Auto-incrementing Order ID** — format `TP-YYYYMMDD-0001`, generated and tracked locally (`localStorage`), resets each new day.
- **Editable order summary** — before confirming, customers can remove items or add more, right inside the chat.
- **WhatsApp handoff — always in English** — even if the whole conversation happened in Tamil, the generated WhatsApp order message to the shop is always in English for consistent order processing.
- **Celebration on confirm** — confetti burst + "🎉 Order Confirmed!" moment designed to feel share-worthy.
- **Mobile-first, Gen-Z visual style** — animated gradients, glass cards, floating blobs, micro-interactions.

---

## 📁 Files

```
index.html   → App shell: Welcome screen, Name screen, Chat screen
style.css    → All visual design (glassmorphism, gradients, chat bubbles, confetti)
script.js    → Conversation engine, bilingual strings, cart logic, geolocation, WhatsApp + Order ID generation
README.md    → This file
```

No build step. No dependencies. No package.json required.

---

## 🛠 Customize

Open `script.js` and edit the top of the file:

```js
const WHATSAPP_NUMBER = "919025156687";   // shop WhatsApp number (with country code, no +)
```

Menu items and prices live in the `MENU` and `ADDONS` objects near the top of `script.js` — each item has an English name, Tamil name, price, and emoji. Add, remove, or reprice items there; the chat UI updates automatically.

All conversational text (both languages) lives in the `STR` object — tweak the tone, emojis, or wording per language without touching the flow logic.

---

## 🚀 Deploy to Netlify

**Option A — Drag & drop**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the whole project folder (containing `index.html`, `style.css`, `script.js`) onto the page
3. Done — Netlify gives you a live URL instantly

**Option B — GitHub**
1. Push these files to a new GitHub repo
2. In Netlify: **Add new site → Import an existing project → GitHub**
3. Select the repo — no build command needed, publish directory is the repo root (`/`)
4. Deploy

---

## 📱 How the conversation flows

1. **Welcome** — logo, tagline, language choice
2. **Name** — "Please enter your name"
3. **Chat starts** — greeting, then menu chips (Tea / Coffee / Black Tea / Black Coffee / View Full Menu / I'm done)
4. **Item tapped** → assistant asks quantity → confirms addition → suggests a matching snack combo
5. Loops back to "Anything else?" until customer taps **I'm done ordering**
6. **Location** — Share via GPS or type address manually
7. **Order Summary card** — Order ID, name, items, total, location → Confirm or Edit
8. **Confirmation** — confetti 🎉 + one-tap **Send Order on WhatsApp** button (message always in English)

---

## ⚠️ Notes

- This is a **parcel-only** ordering flow — no dine-in / table booking, per the shop's service model.
- Geolocation requires HTTPS (Netlify serves over HTTPS by default) and browser permission.
- Order IDs and their daily counter are stored in the visitor's own browser (`localStorage`), not shared across devices — this is a frontend-only project with no backend/database.
