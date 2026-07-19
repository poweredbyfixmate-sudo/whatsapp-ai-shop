/* ============================================================
   WhatsApp AI Shop — Product Catalog
   60 products across 5 categories, realistic Coimbatore pricing.
   Each product: id, category, name, brand, price, unit, image, description, availability
   Images are SVG placeholders generated at runtime by getPlaceholderImage()
   in script.js — swap the `image` field with a real photo URL/path any time.
   ============================================================ */

const CATEGORIES = [
  { id: "rice",      name: "Rice & Grains",        emoji: "🍚" },
  { id: "oil",       name: "Oil & Spices",          emoji: "🛢️" },
  { id: "snacks",    name: "Biscuits & Snacks",     emoji: "🍪" },
  { id: "dairy",     name: "Dairy & Daily Needs",   emoji: "🥛" },
  { id: "household", name: "Household Essentials",  emoji: "🧼" }
];

const PRODUCTS = [
  /* ---------------- 1. RICE & GRAINS (12) ---------------- */
  { id: "R01", category: "rice", name: "Ponni Boiled Rice", brand: "Aachi", price: 65, unit: "1 kg", image: "", description: "Everyday boiled rice, soft texture, ideal for daily meals.", availability: true },
  { id: "R02", category: "rice", name: "Sona Masoori Rice", brand: "Daawat", price: 70, unit: "1 kg", image: "", description: "Lightweight aromatic rice, great for South Indian meals.", availability: true },
  { id: "R03", category: "rice", name: "Basmati Rice", brand: "India Gate", price: 180, unit: "1 kg", image: "", description: "Long-grain premium basmati, perfect for biryani.", availability: true },
  { id: "R04", category: "rice", name: "Idli Rice", brand: "Local Mill", price: 55, unit: "1 kg", image: "", description: "Specially processed rice for soft idlis and dosas.", availability: true },
  { id: "R05", category: "rice", name: "Toor Dal", brand: "Aachi", price: 160, unit: "1 kg", image: "", description: "Premium split pigeon peas for sambar and dal.", availability: true },
  { id: "R06", category: "rice", name: "Moong Dal", brand: "Aachi", price: 140, unit: "1 kg", image: "", description: "Split green gram, easy to digest, high protein.", availability: true },
  { id: "R07", category: "rice", name: "Chana Dal", brand: "Aachi", price: 110, unit: "1 kg", image: "", description: "Split Bengal gram, great for curries and snacks.", availability: true },
  { id: "R08", category: "rice", name: "Urad Dal", brand: "Aachi", price: 150, unit: "1 kg", image: "", description: "Whole black gram split, essential for idli-dosa batter.", availability: true },
  { id: "R09", category: "rice", name: "Wheat Flour (Atta)", brand: "Aashirvaad", price: 250, unit: "5 kg", image: "", description: "Whole wheat atta for soft rotis and chapatis.", availability: true },
  { id: "R10", category: "rice", name: "Rava / Sooji", brand: "Aachi", price: 55, unit: "1 kg", image: "", description: "Fine semolina for upma, kesari and snacks.", availability: true },
  { id: "R11", category: "rice", name: "Poha (Aval)", brand: "Local Mill", price: 45, unit: "500 g", image: "", description: "Flattened rice, quick to cook, light breakfast option.", availability: true },
  { id: "R12", category: "rice", name: "Red Rice", brand: "Organic Farms", price: 90, unit: "1 kg", image: "", description: "Unpolished nutrient-rich red rice.", availability: false },

  /* ---------------- 2. OIL & SPICES (12) ---------------- */
  { id: "O01", category: "oil", name: "Sunflower Oil", brand: "Gold Winner", price: 140, unit: "1 L", image: "", description: "Refined sunflower oil, light and cholesterol-free.", availability: true },
  { id: "O02", category: "oil", name: "Groundnut Oil", brand: "Idhayam", price: 210, unit: "1 L", image: "", description: "Cold-pressed groundnut oil for authentic taste.", availability: true },
  { id: "O03", category: "oil", name: "Gingelly (Sesame) Oil", brand: "Idhayam", price: 150, unit: "500 ml", image: "", description: "Pure sesame oil, ideal for tempering and oil baths.", availability: true },
  { id: "O04", category: "oil", name: "Coconut Oil", brand: "Parachute", price: 135, unit: "500 ml", image: "", description: "Pure coconut oil for cooking and hair care.", availability: true },
  { id: "O05", category: "oil", name: "Turmeric Powder", brand: "Aachi", price: 45, unit: "200 g", image: "", description: "Pure turmeric powder, rich colour and aroma.", availability: true },
  { id: "O06", category: "oil", name: "Chilli Powder", brand: "Aachi", price: 60, unit: "200 g", image: "", description: "Spicy red chilli powder for everyday cooking.", availability: true },
  { id: "O07", category: "oil", name: "Coriander Powder", brand: "Aachi", price: 50, unit: "200 g", image: "", description: "Freshly ground coriander powder.", availability: true },
  { id: "O08", category: "oil", name: "Sambar Powder", brand: "Aachi", price: 65, unit: "200 g", image: "", description: "Authentic South Indian sambar masala blend.", availability: true },
  { id: "O09", category: "oil", name: "Garam Masala", brand: "Everest", price: 85, unit: "100 g", image: "", description: "Aromatic blend of whole spices, ground fresh.", availability: true },
  { id: "O10", category: "oil", name: "Mustard Seeds", brand: "Local", price: 35, unit: "200 g", image: "", description: "Whole mustard seeds for tempering.", availability: true },
  { id: "O11", category: "oil", name: "Iodised Salt", brand: "Tata Salt", price: 28, unit: "1 kg", image: "", description: "Vacuum evaporated iodised salt.", availability: true },
  { id: "O12", category: "oil", name: "Tamarind", brand: "Local", price: 40, unit: "250 g", image: "", description: "Deseeded tamarind, tangy and fresh.", availability: true },

  /* ---------------- 3. BISCUITS & SNACKS (12) ---------------- */
  { id: "S01", category: "snacks", name: "Parle-G Biscuit", brand: "Parle", price: 30, unit: "250 g", image: "", description: "India's favourite glucose biscuit.", availability: true },
  { id: "S02", category: "snacks", name: "Marie Gold", brand: "Britannia", price: 40, unit: "250 g", image: "", description: "Light and crispy tea-time biscuit.", availability: true },
  { id: "S03", category: "snacks", name: "Good Day Biscuit", brand: "Britannia", price: 35, unit: "200 g", image: "", description: "Butter cashew cookies, rich and crunchy.", availability: true },
  { id: "S04", category: "snacks", name: "Bourbon Biscuit", brand: "Britannia", price: 35, unit: "150 g", image: "", description: "Chocolate cream sandwich biscuit.", availability: true },
  { id: "S05", category: "snacks", name: "Oreo Biscuit", brand: "Cadbury", price: 40, unit: "120 g", image: "", description: "Chocolate cookies with vanilla cream filling.", availability: true },
  { id: "S06", category: "snacks", name: "Monaco Salted", brand: "Parle", price: 35, unit: "200 g", image: "", description: "Crispy salted snack biscuit.", availability: true },
  { id: "S07", category: "snacks", name: "Kurkure Masala Munch", brand: "Pepsico", price: 20, unit: "90 g", image: "", description: "Crunchy corn snack with tangy masala.", availability: true },
  { id: "S08", category: "snacks", name: "Lays Chips", brand: "Pepsico", price: 20, unit: "90 g", image: "", description: "Classic salted potato chips.", availability: true },
  { id: "S09", category: "snacks", name: "Haldiram Mixture", brand: "Haldiram's", price: 60, unit: "200 g", image: "", description: "Spicy savoury namkeen mixture.", availability: true },
  { id: "S10", category: "snacks", name: "Banana Chips", brand: "Local", price: 55, unit: "200 g", image: "", description: "Crispy Kerala-style banana chips.", availability: true },
  { id: "S11", category: "snacks", name: "Murukku", brand: "Local", price: 65, unit: "250 g", image: "", description: "Traditional crunchy rice-flour snack.", availability: true },
  { id: "S12", category: "snacks", name: "Rusk", brand: "Britannia", price: 40, unit: "200 g", image: "", description: "Toasted crispy rusk, perfect with tea.", availability: true },

  /* ---------------- 4. DAIRY & DAILY NEEDS (12) ---------------- */
  { id: "D01", category: "dairy", name: "Toned Milk", brand: "Aavin", price: 25, unit: "500 ml", image: "", description: "Fresh toned milk, delivered daily.", availability: true },
  { id: "D02", category: "dairy", name: "Curd", brand: "Aavin", price: 30, unit: "400 g", image: "", description: "Thick and fresh set curd.", availability: true },
  { id: "D03", category: "dairy", name: "Pure Ghee", brand: "Aavin", price: 280, unit: "500 ml", image: "", description: "Rich aromatic cow ghee.", availability: true },
  { id: "D04", category: "dairy", name: "Paneer", brand: "Aavin", price: 90, unit: "200 g", image: "", description: "Soft fresh paneer cubes.", availability: true },
  { id: "D05", category: "dairy", name: "Butter", brand: "Amul", price: 58, unit: "100 g", image: "", description: "Creamy salted table butter.", availability: true },
  { id: "D06", category: "dairy", name: "Farm Eggs (6 pc)", brand: "Local Farm", price: 45, unit: "Tray of 6", image: "", description: "Fresh farm eggs, tray of six.", availability: true },
  { id: "D07", category: "dairy", name: "Bread", brand: "Modern", price: 40, unit: "400 g", image: "", description: "Soft white sandwich bread.", availability: true },
  { id: "D08", category: "dairy", name: "Sugar", brand: "Local", price: 45, unit: "1 kg", image: "", description: "Refined white sugar.", availability: true },
  { id: "D09", category: "dairy", name: "Tea Powder", brand: "3 Roses", price: 135, unit: "250 g", image: "", description: "Strong aromatic CTC tea powder.", availability: true },
  { id: "D10", category: "dairy", name: "Coffee Powder", brand: "Bru", price: 150, unit: "200 g", image: "", description: "Filter coffee blend, rich aroma.", availability: true },
  { id: "D11", category: "dairy", name: "Honey", brand: "Dabur", price: 135, unit: "250 g", image: "", description: "Pure natural honey.", availability: true },
  { id: "D12", category: "dairy", name: "Jaggery", brand: "Local", price: 55, unit: "500 g", image: "", description: "Traditional unrefined cane jaggery.", availability: true },

  /* ---------------- 5. HOUSEHOLD ESSENTIALS (12) ---------------- */
  { id: "H01", category: "household", name: "Detergent Powder", brand: "Surf Excel", price: 135, unit: "1 kg", image: "", description: "Powerful stain-removal detergent powder.", availability: true },
  { id: "H02", category: "household", name: "Dishwash Bar", brand: "Vim", price: 20, unit: "200 g", image: "", description: "Grease-cutting dishwashing bar.", availability: true },
  { id: "H03", category: "household", name: "Dishwash Liquid", brand: "Vim", price: 110, unit: "500 ml", image: "", description: "Concentrated dishwashing liquid gel.", availability: true },
  { id: "H04", category: "household", name: "Floor Cleaner", brand: "Lizol", price: 120, unit: "500 ml", image: "", description: "Disinfectant floor cleaner, fresh fragrance.", availability: true },
  { id: "H05", category: "household", name: "Toilet Cleaner", brand: "Harpic", price: 100, unit: "500 ml", image: "", description: "Powerful germ-kill toilet cleaner.", availability: true },
  { id: "H06", category: "household", name: "Bathing Soap", brand: "Lifebuoy", price: 35, unit: "100 g", image: "", description: "Germ-protection bathing soap.", availability: true },
  { id: "H07", category: "household", name: "Shampoo", brand: "Clinic Plus", price: 95, unit: "175 ml", image: "", description: "Strong hair nourishing shampoo.", availability: true },
  { id: "H08", category: "household", name: "Toothpaste", brand: "Colgate", price: 110, unit: "200 g", image: "", description: "Cavity protection toothpaste.", availability: true },
  { id: "H09", category: "household", name: "Phenyl", brand: "Local", price: 45, unit: "500 ml", image: "", description: "Floor disinfectant phenyl concentrate.", availability: true },
  { id: "H10", category: "household", name: "Garbage Bags", brand: "Local", price: 60, unit: "Pack of 30", image: "", description: "Medium size disposable garbage bags.", availability: true },
  { id: "H11", category: "household", name: "Mosquito Coil", brand: "Good Knight", price: 45, unit: "Pack", image: "", description: "Overnight mosquito protection coil.", availability: true },
  { id: "H12", category: "household", name: "Tissue Paper", brand: "Local", price: 40, unit: "Pack", image: "", description: "Soft multi-purpose tissue paper pack.", availability: false }
];

/* Quick lookups used across script.js */
const getProductById = (id) => PRODUCTS.find((p) => p.id === id);
const getProductsByCategory = (catId) => PRODUCTS.filter((p) => p.category === catId);
