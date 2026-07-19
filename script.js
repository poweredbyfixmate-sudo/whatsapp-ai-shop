/* ===========================================================
   TeaChat AI — Conversation Engine
   Pure JS. No backend. No framework.
=========================================================== */
(function(){
  "use strict";

  /* ============================================================
     CONFIG
  ============================================================ */
  const WHATSAPP_NUMBER = "919025156687"; // shop WhatsApp number
  const SHOP_NAME_EN = "Velpaari Tea Parcel Service";
  const SHOP_NAME_TA = "வேள்பாரி டீ பார்சல் சேவை";

  const MENU = {
    tea:          { en:"Tea Parcel",          ta:"டீ பார்சல்",          price:79, serves:5, emoji:"☕" },
    coffee:       { en:"Coffee Parcel",       ta:"காபி பார்சல்",         price:99, serves:5, emoji:"☕" },
    blacktea:     { en:"Black Tea Parcel",    ta:"பிளாக் டீ பார்சல்",    price:89, serves:5, emoji:"🍵" },
    blackcoffee:  { en:"Black Coffee Parcel", ta:"பிளாக் காபி பார்சல்",  price:79, serves:5, emoji:"🖤" }
  };

  const ADDONS = {
    biscuit:  { en:"Biscuit",  ta:"பிஸ்கட்",   price:10, emoji:"🍪" },
    rusk:     { en:"Rusk",     ta:"ரஸ்க்",      price:10, emoji:"🥨" },
    mixture:  { en:"Mixture",  ta:"மிக்சர்",    price:30, emoji:"🥜" },
    murukku:  { en:"Murukku",  ta:"முறுக்கு",   price:10, emoji:"🥠" }
  };

  const NUM_WORDS_EN = {one:1,two:2,three:3,four:4,five:5};
  const NUM_WORDS_TA = {ஒன்று:1,ரெண்டு:2,இரண்டு:2,மூன்று:3,நான்கு:4,நாலு:4,ஐந்து:5};

  /* ============================================================
     STATE
  ============================================================ */
  let lang = "en";
  let customerName = "";
  let cart = [];              // {key, type:'menu'|'addon', qty}
  let step = "MAIN_MENU";
  let pendingItem = null;     // {key,type} awaiting quantity
  let lastAddedType = null;   // 'menu' | 'addon'
  let location = null;        // {lat,lng,link} or {manual:text}
  let orderId = null;
  let lastRawText = "";

  /* ============================================================
     STRINGS
  ============================================================ */
  const STR = {
    en:{
      namePrompt:"Please enter your name 👋",
      namePlaceholder:"e.g. Kannan",
      continueBtn:"Continue 🚀",
      greeting:(n)=>`Welcome ${n} 👋<br>Welcome to <b>${SHOP_NAME_EN}</b> ☕<br>What would you like to order today? 😍`,
      mainMenuPrompt:"Tap something delicious below 👇",
      menuChip_tea:`☕ Tea Parcel`,
      menuChip_coffee:`☕ Coffee Parcel`,
      menuChip_blacktea:`🍵 Black Tea Parcel`,
      menuChip_blackcoffee:`🖤 Black Coffee Parcel`,
      viewFullMenu:"📋 View Full Menu",
      finishOrdering:"✅ I'm done ordering",
      fullMenuTitle:"📋 Our Menu",
      qtyPrompt:(item)=>`${item.emoji} <b>${item.en}</b><br>Price ₹${item.price} · ${item.serves} Serves<br>How many parcels would you like? 😋`,
      qtyPromptAddon:(item)=>`${item.emoji} <b>${item.en}</b> — ₹${item.price}<br>How many would you like?`,
      addedConfirm:(item,qty)=>{
        const lines = [`✅ ${qty} ${item.en} Added! 🔥`,`Nice one! ${qty} ${item.en} added 🎉`,`Got it! ${qty} x ${item.en} in your order 😍`,`Perfect choice! ${qty} ${item.en} added 💯`];
        return lines[Math.floor(Math.random()*lines.length)];
      },
      comboIntro:["Would you like to add? 😋","This goes perfectly with it! 🍪❤️","Wanna make it a combo? 🔥","One more thing... 😍"],
      addonAdded:(item)=>`Yum! ${item.emoji} ${item.en} added too ❤️`,
      skipBtn:"Skip 🙅",
      addBtn:(item)=>`Add ${item.emoji}`,
      anythingElse:"Anything else? 😊",
      emptyCartWarning:"You haven't ordered anything yet! 😅 Pick something tasty 👇",
      askLocation:"Awesome! 🎉 Please share your delivery location 📍",
      shareLocationBtn:"📍 Share My Location",
      manualLocationBtn:"✏️ Enter Address Manually",
      manualLocationPlaceholder:"Type your delivery address…",
      locationCaptured:"Got your location! 📍✅",
      locationDenied:"Couldn't access location 😅 No worries, just type your address below.",
      summaryTitle:"🧾 Order Summary",
      orderIdLabel:"Order ID",
      nameLabel:"Name",
      itemsLabel:"Items",
      totalLabel:"Grand Total",
      locationLabel:"Location",
      confirmBtn:"✅ Confirm Order",
      editBtn:"✏️ Edit Order",
      editMenuTitle:"What would you like to change? ✏️",
      removePrefix:"❌ Remove",
      addMoreLabel:"➕ Add More Items",
      doneEditingLabel:"✔ Done Editing",
      orderConfirmedTitle:"🎉 Order Confirmed!",
      orderConfirmedSub:"Your tea is getting ready ☕❤️ Tap below to send it on WhatsApp!",
      sendWhatsAppBtn:"📲 Send Order on WhatsApp",
      newOrderBtn:"🔄 Start New Order",
      unknownReply:"Hmm, didn't quite get that 😅 Try tapping one of the options below!",
      dineNote:"This is a Parcel-only service 📦 (No dine-in)",
    },
    ta:{
      namePrompt:"உங்கள் பெயரை உள்ளிடுங்கள் 👋",
      namePlaceholder:"எ.கா. கண்ணன்",
      continueBtn:"தொடரவும் 🚀",
      greeting:(n)=>`வணக்கம் ${n} 👋<br><b>${SHOP_NAME_TA}</b>க்கு வரவேற்கிறோம் ☕<br>இன்று என்ன வேண்டும்? 😍`,
      mainMenuPrompt:"கீழே இருந்து செலக்ட் பண்ணுங்க 👇",
      menuChip_tea:`☕ டீ பார்சல்`,
      menuChip_coffee:`☕ காபி பார்சல்`,
      menuChip_blacktea:`🍵 பிளாக் டீ பார்சல்`,
      menuChip_blackcoffee:`🖤 பிளாக் காபி பார்சல்`,
      viewFullMenu:"📋 முழு மெனு பார்க்க",
      finishOrdering:"✅ ஆர்டர் முடிச்சாச்சு",
      fullMenuTitle:"📋 எங்க மெனு",
      qtyPrompt:(item)=>`${item.emoji} <b>${item.ta}</b><br>விலை ₹${item.price} · ${item.serves} Serves<br>எத்தனை பார்சல் வேணும்? 😋`,
      qtyPromptAddon:(item)=>`${item.emoji} <b>${item.ta}</b> — ₹${item.price}<br>எத்தனை வேணும்?`,
      addedConfirm:(item,qty)=>{
        const lines = [`✅ ${qty} ${item.ta} சேர்த்தாச்சு! 🔥`,`சூப்பர்! ${qty} ${item.ta} ஆட் ஆச்சு 🎉`,`சரி! ${qty} x ${item.ta} ஆர்டர்ல இருக்கு 😍`,`செம்ம சாய்ஸ்! ${qty} ${item.ta} சேர்த்தாச்சு 💯`];
        return lines[Math.floor(Math.random()*lines.length)];
      },
      comboIntro:["வேற ஏதாவது சேர்க்கலாமா? 😋","இது இதுக்கு செம்ம காம்போ! 🍪❤️","காம்போ பண்ணலாமா? 🔥","இன்னும் ஒண்ணு... 😍"],
      addonAdded:(item)=>`சூப்பர்! ${item.emoji} ${item.ta}-உம் சேர்த்தாச்சு ❤️`,
      skipBtn:"வேண்டாம் 🙅",
      addBtn:(item)=>`சேர் ${item.emoji}`,
      anythingElse:"வேற ஏதாவது வேணுமா? 😊",
      emptyCartWarning:"நீங்க இன்னும் ஒன்னும் ஆர்டர் பண்ணல! 😅 ஏதாவது செலக்ட் பண்ணுங்க 👇",
      askLocation:"சூப்பர்! 🎉 உங்க டெலிவரி லொகேஷன் ஷேர் பண்ணுங்க 📍",
      shareLocationBtn:"📍 என் லொகேஷனை ஷேர் செய்",
      manualLocationBtn:"✏️ முகவரியை டைப் செய்",
      manualLocationPlaceholder:"உங்க டெலிவரி அட்ரஸ் டைப் பண்ணுங்க…",
      locationCaptured:"லொகேஷன் கிடைச்சாச்சு! 📍✅",
      locationDenied:"லொகேஷன் access ஆகல 😅 பரவால்ல, கீழே அட்ரஸை டைப் பண்ணுங்க.",
      summaryTitle:"🧾 ஆர்டர் சுருக்கம்",
      orderIdLabel:"ஆர்டர் ஐடி",
      nameLabel:"பெயர்",
      itemsLabel:"ஐட்டம்ஸ்",
      totalLabel:"மொத்த தொகை",
      locationLabel:"லொகேஷன்",
      confirmBtn:"✅ ஆர்டரை உறுதி செய்",
      editBtn:"✏️ ஆர்டரை மாற்று",
      editMenuTitle:"என்ன மாத்தணும்? ✏️",
      removePrefix:"❌ நீக்கு",
      addMoreLabel:"➕ இன்னும் சேர்",
      doneEditingLabel:"✔ முடிச்சாச்சு",
      orderConfirmedTitle:"🎉 ஆர்டர் கன்பர்ம் ஆச்சு!",
      orderConfirmedSub:"உங்க டீ ரெடி ஆகுது ☕❤️ கீழே தட்டி WhatsApp-ல அனுப்புங்க!",
      sendWhatsAppBtn:"📲 WhatsApp-ல ஆர்டர் அனுப்பு",
      newOrderBtn:"🔄 புது ஆர்டர்",
      unknownReply:"சரியா புரியல 😅 கீழே இருக்கிற ஆப்ஷன்ஸ்ல தட்டுங்க!",
      dineNote:"இது Parcel மட்டும் தான் 📦 (Dine-in கிடையாது)",
    }
  };

  function T(key, ...args){
    const v = STR[lang][key];
    return typeof v === "function" ? v(...args) : v;
  }

  /* ============================================================
     DOM refs
  ============================================================ */
  const screenWelcome = document.getElementById('screen-welcome');
  const screenName = document.getElementById('screen-name');
  const screenChat = document.getElementById('screen-chat');
  const namePromptText = document.getElementById('namePromptText');
  const nameInput = document.getElementById('nameInput');
  const nameContinueBtn = document.getElementById('nameContinueBtn');
  const chatArea = document.getElementById('chatArea');
  const chipsHost = document.getElementById('chipsHost');
  const textInput = document.getElementById('textInput');
  const sendBtn = document.getElementById('sendBtn');
  const headerStatus = document.getElementById('headerStatus');
  const cartPill = document.getElementById('cartPill');
  const cartCount = document.getElementById('cartCount');
  const confettiLayer = document.getElementById('confettiLayer');

  function showScreen(el){
    [screenWelcome, screenName, screenChat].forEach(s=>s.classList.remove('active'));
    el.classList.add('active');
  }

  /* ============================================================
     LANGUAGE SELECTION
  ============================================================ */
  document.querySelectorAll('.lang-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      lang = btn.dataset.lang;
      namePromptText.textContent = T('namePrompt');
      nameInput.placeholder = T('namePlaceholder');
      nameContinueBtn.textContent = T('continueBtn');
      document.documentElement.lang = lang;
      showScreen(screenName);
      setTimeout(()=>nameInput.focus(), 300);
    });
  });

  /* ============================================================
     NAME SCREEN
  ============================================================ */
  function submitName(){
    const val = nameInput.value.trim();
    if(!val) { nameInput.focus(); return; }
    customerName = val;
    showScreen(screenChat);
    startConversation();
  }
  nameContinueBtn.addEventListener('click', submitName);
  nameInput.addEventListener('keydown', e=>{ if(e.key==='Enter') submitName(); });

  /* ============================================================
     TIME / SCROLL HELPERS
  ============================================================ */
  function nowTime(){
    const d = new Date();
    let h = d.getHours(), m = d.getMinutes();
    const ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if(h === 0) h = 12;
    return h + ":" + (m < 10 ? '0'+m : m) + " " + ap;
  }
  function scrollBottom(){
    requestAnimationFrame(()=>{ chatArea.scrollTop = chatArea.scrollHeight + 300; });
  }
  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ============================================================
     MESSAGE RENDERING
  ============================================================ */
  function addUserMessage(text){
    const row = document.createElement('div');
    row.className = 'msg-row user';
    row.innerHTML = `<div class="bubble">${escapeHtml(text)}<span class="meta">${nowTime()} ✓✓</span></div>`;
    chatArea.appendChild(row);
    scrollBottom();
  }

  function showTyping(){
    return new Promise(resolve=>{
      headerStatus.textContent = lang==='ta' ? 'டைப் செய்கிறார்…' : 'typing…';
      const row = document.createElement('div');
      row.className = 'typing-row';
      row.id = 'typingRow';
      row.innerHTML = `<div class="typing-bubble"><span></span><span></span><span></span></div>`;
      chatArea.appendChild(row);
      scrollBottom();
      const delay = 480 + Math.random()*520;
      setTimeout(()=>{
        const t = document.getElementById('typingRow');
        if(t) t.remove();
        headerStatus.textContent = 'Online 🟢';
        resolve();
      }, delay);
    });
  }

  async function addBotMessage(html){
    await showTyping();
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.innerHTML = `<div class="bubble">${html}<span class="meta">${nowTime()}</span></div>`;
    chatArea.appendChild(row);
    scrollBottom();
  }

  async function addBotCard(innerHtml){
    await showTyping();
    const row = document.createElement('div');
    row.className = 'msg-row bot';
    row.innerHTML = `<div class="receipt-card">${innerHtml}</div>`;
    chatArea.appendChild(row);
    scrollBottom();
    return row;
  }

  function clearChips(){ chipsHost.innerHTML = ''; }

  function showChips(list){
    clearChips();
    const wrap = document.createElement('div');
    wrap.className = 'chips-wrap';
    list.forEach(c=>{
      const btn = document.createElement('button');
      btn.className = 'chip' + (c.accent ? ' accent' : '') + (c.ghost ? ' ghost' : '');
      btn.innerHTML = c.label;
      btn.onclick = ()=>{
        clearChips();
        if(c.showAsUser !== false) addUserMessage(c.userLabel || c.plainLabel || c.label.replace(/<[^>]+>/g,''));
        route(c.value);
      };
      wrap.appendChild(btn);
    });
    chipsHost.appendChild(wrap);
    scrollBottom();
  }

  function updateCartPill(){
    const count = cart.reduce((a,i)=>a+i.qty,0);
    cartCount.textContent = count;
    cartPill.classList.add('pulse');
    setTimeout(()=>cartPill.classList.remove('pulse'), 250);
  }

  function itemData(key,type){
    return type === 'menu' ? MENU[key] : ADDONS[key];
  }

  function cartTotal(){
    return cart.reduce((sum,c)=>sum + c.qty * itemData(c.key,c.type).price, 0);
  }

  function addToCart(key,type,qty){
    const existing = cart.find(c=>c.key===key && c.type===type);
    if(existing) existing.qty += qty;
    else cart.push({key,type,qty});
    lastAddedType = type;
    updateCartPill();
  }

  function removeFromCart(key,type){
    cart = cart.filter(c=>!(c.key===key && c.type===type));
    updateCartPill();
  }

  /* ============================================================
     ORDER ID GENERATION (localStorage-backed counter)
  ============================================================ */
  function generateOrderId(){
    const d = new Date();
    const dateStr = d.getFullYear().toString() +
      String(d.getMonth()+1).padStart(2,'0') +
      String(d.getDate()).padStart(2,'0');
    let store = {};
    try{
      store = JSON.parse(localStorage.getItem('teachat_order_seq') || '{}');
    }catch(e){ store = {}; }
    if(store.date !== dateStr){
      store = { date: dateStr, seq: 0 };
    }
    store.seq = (store.seq || 0) + 1;
    try{ localStorage.setItem('teachat_order_seq', JSON.stringify(store)); }catch(e){}
    const seqStr = String(store.seq).padStart(4,'0');
    return `TP-${dateStr}-${seqStr}`;
  }

  /* ============================================================
     CONVERSATION FLOW
  ============================================================ */
  async function startConversation(){
    await addBotMessage(T('greeting', escapeHtml(customerName)));
    await showMainMenu();
  }

  async function showMainMenu(){
    step = "MAIN_MENU";
    await addBotMessage(T('mainMenuPrompt'));
    const chips = [
      { label:T('menuChip_tea'), value:'menu_tea' },
      { label:T('menuChip_coffee'), value:'menu_coffee' },
      { label:T('menuChip_blacktea'), value:'menu_blacktea' },
      { label:T('menuChip_blackcoffee'), value:'menu_blackcoffee' },
      { label:T('viewFullMenu'), value:'view_full_menu', ghost:true },
      { label:T('finishOrdering'), value:'finish', accent:true }
    ];
    showChips(chips);
  }

  async function showFullMenu(){
    let rows = `<div class="r-title">${T('fullMenuTitle')}</div>`;
    Object.values(MENU).forEach(m=>{
      rows += `<div class="receipt-row"><span>${m.emoji} ${lang==='ta'?m.ta:m.en} (${m.serves} Serves)</span><span>₹${m.price}</span></div>`;
    });
    Object.values(ADDONS).forEach(a=>{
      rows += `<div class="receipt-row"><span>${a.emoji} ${lang==='ta'?a.ta:a.en}</span><span>₹${a.price}</span></div>`;
    });
    rows += `<div class="receipt-meta" style="margin-top:8px;">${T('dineNote')}</div>`;
    await addBotCard(rows);
    await showMainMenu();
  }

  async function askQty(key,type){
    pendingItem = {key,type};
    step = "QTY";
    const item = itemData(key,type);
    const text = type === 'menu' ? T('qtyPrompt', item) : T('qtyPromptAddon', item);
    await addBotMessage(text);
    showChips([
      {label:"1", value:"qty_1"},
      {label:"2", value:"qty_2"},
      {label:"3", value:"qty_3"},
      {label:"4", value:"qty_4"},
      {label:"5", value:"qty_5"}
    ]);
  }

  function pickAddonSuggestion(){
    const inCart = cart.filter(c=>c.type==='addon').map(c=>c.key);
    const candidates = Object.keys(ADDONS).filter(k=>!inCart.includes(k));
    if(candidates.length === 0) return null;
    return candidates[Math.floor(Math.random()*candidates.length)];
  }

  async function afterAddFlow(key,type,qty){
    const item = itemData(key,type);
    await addBotMessage(T('addedConfirm', item, qty));

    // only suggest add-ons after a menu (drink) item, and only if add-ons remain
    if(type === 'menu'){
      const suggKey = pickAddonSuggestion();
      if(suggKey){
        return showAddonSuggestion(suggKey);
      }
    }
    return goToAnythingElse();
  }

  async function showAddonSuggestion(suggKey){
    step = "ADDON_SUGGEST";
    const item = ADDONS[suggKey];
    const intro = STR[lang].comboIntro;
    const line = intro[Math.floor(Math.random()*intro.length)];
    await addBotMessage(`${line}<br>${item.emoji} <b>${lang==='ta'?item.ta:item.en}</b> — ₹${item.price}`);
    showChips([
      { label:T('addBtn', item), value:'addon_add_'+suggKey, accent:true },
      { label:T('skipBtn'), value:'addon_skip' }
    ]);
  }

  async function goToAnythingElse(){
    step = "MAIN_MENU";
    await addBotMessage(T('anythingElse'));
    showChips([
      { label:T('menuChip_tea'), value:'menu_tea' },
      { label:T('menuChip_coffee'), value:'menu_coffee' },
      { label:T('menuChip_blacktea'), value:'menu_blacktea' },
      { label:T('menuChip_blackcoffee'), value:'menu_blackcoffee' },
      { label:T('viewFullMenu'), value:'view_full_menu', ghost:true },
      { label:T('finishOrdering'), value:'finish', accent:true }
    ]);
  }

  /* ------------------- LOCATION ------------------- */
  async function goToLocation(){
    if(cart.length === 0){
      await addBotMessage(T('emptyCartWarning'));
      return showMainMenu();
    }
    step = "LOCATION";
    await addBotMessage(T('askLocation'));
    clearChips();
    const wrap = document.createElement('div');
    wrap.className = 'chips-wrap';

    const geoBtn = document.createElement('button');
    geoBtn.className = 'chip accent';
    geoBtn.style.width = '100%';
    geoBtn.textContent = T('shareLocationBtn');
    geoBtn.onclick = requestGeolocation;

    const manualBtn = document.createElement('button');
    manualBtn.className = 'chip ghost';
    manualBtn.style.width = '100%';
    manualBtn.textContent = T('manualLocationBtn');
    manualBtn.onclick = ()=>{
      clearChips();
      textInput.placeholder = T('manualLocationPlaceholder');
      textInput.focus();
    };

    wrap.appendChild(geoBtn);
    wrap.appendChild(manualBtn);
    chipsHost.appendChild(wrap);
    scrollBottom();
  }

  function requestGeolocation(){
    addUserMessage(T('shareLocationBtn'));
    clearChips();
    if(!navigator.geolocation){
      handleLocationDenied();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos)=>{
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const link = `https://www.google.com/maps?q=${lat},${lng}`;
        location = { lat, lng, link };
        await addBotMessage(T('locationCaptured'));
        goToSummary();
      },
      async ()=>{
        await handleLocationDenied();
      },
      { enableHighAccuracy:true, timeout:8000 }
    );
  }

  async function handleLocationDenied(){
    await addBotMessage(T('locationDenied'));
    textInput.placeholder = T('manualLocationPlaceholder');
    textInput.focus();
  }

  /* ------------------- SUMMARY / CHECKOUT ------------------- */
  function buildItemsRows(){
    return cart.map(c=>{
      const item = itemData(c.key,c.type);
      const name = lang==='ta' ? item.ta : item.en;
      return `<div class="receipt-row"><span>${item.emoji} ${name} × ${c.qty}</span><span>₹${c.qty*item.price}</span></div>`;
    }).join('');
  }

  function locationDisplayHtml(){
    if(!location) return '-';
    if(location.link) return `<a class="map-link" href="${location.link}" target="_blank" rel="noopener">📍 View on Map</a>`;
    return escapeHtml(location.manual || '-');
  }

  async function goToSummary(){
    step = "SUMMARY";
    if(!orderId) orderId = generateOrderId();
    const html = `
      <div class="r-title">${T('summaryTitle')}</div>
      <div class="receipt-meta">${T('orderIdLabel')}: <b>${orderId}</b></div>
      <div class="receipt-meta">${T('nameLabel')}: <b>${escapeHtml(customerName)}</b></div>
      ${buildItemsRows()}
      <div class="receipt-row total"><span>${T('totalLabel')}</span><span>₹${cartTotal()}</span></div>
      <div class="receipt-meta" style="margin-top:8px;">${T('locationLabel')}: ${locationDisplayHtml()}</div>
      <div class="receipt-actions">
        <button class="btn-confirm" id="btnConfirmOrder">${T('confirmBtn')}</button>
        <button class="btn-edit" id="btnEditOrder">${T('editBtn')}</button>
      </div>
    `;
    const row = await addBotCard(html);
    row.querySelector('#btnConfirmOrder').onclick = confirmOrder;
    row.querySelector('#btnEditOrder').onclick = openEditMenu;
  }

  async function openEditMenu(){
    step = "EDIT";
    clearChips();
    await addBotMessage(T('editMenuTitle'));
    const chips = cart.map(c=>{
      const item = itemData(c.key,c.type);
      const name = lang==='ta' ? item.ta : item.en;
      return { label:`${T('removePrefix')} ${item.emoji} ${name}`, value:`remove_${c.type}_${c.key}` };
    });
    chips.push({ label:T('addMoreLabel'), value:'edit_add_more', accent:true });
    chips.push({ label:T('doneEditingLabel'), value:'edit_done', ghost:true });
    showChips(chips);
  }

  /* ------------------- CONFIRM + WHATSAPP ------------------- */
  function buildWhatsAppText(){
    // ALWAYS ENGLISH regardless of UI language
    let lines = [];
    lines.push(`Order ID:`);
    lines.push(orderId);
    lines.push(``);
    lines.push(`Customer:`);
    lines.push(customerName);
    lines.push(``);
    lines.push(`Location:`);
    lines.push(location ? (location.link || location.manual || '-') : '-');
    lines.push(``);
    lines.push(`Items`);
    cart.forEach(c=>{
      const item = itemData(c.key,c.type);
      lines.push(`${item.en} x${c.qty}`);
    });
    lines.push(``);
    lines.push(`Grand Total`);
    lines.push(`₹${cartTotal()}`);
    lines.push(``);
    const now = new Date();
    lines.push(`Order Time`);
    lines.push(now.toLocaleDateString('en-IN'));
    lines.push(now.toLocaleTimeString('en-IN'));
    return lines.join('\n');
  }

  async function confirmOrder(){
    clearChips();
    fireConfetti();
    const waText = buildWhatsAppText();
    const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    const html = `
      <div class="r-title">${T('orderConfirmedTitle')}</div>
      <div class="receipt-meta">${T('orderConfirmedSub')}</div>
      <a class="wa-send-btn" href="${waLink}" target="_blank" rel="noopener">${T('sendWhatsAppBtn')}</a>
    `;
    await addBotCard(html);
    step = "DONE";
    showChips([{ label:T('newOrderBtn'), value:'restart', accent:true }]);
  }

  /* ------------------- CONFETTI ------------------- */
  function fireConfetti(){
    const colors = ['#ff9a6c','#ff6ec7','#7b6cff','#22d1c1','#ffd166','#3cff9e'];
    for(let i=0;i<60;i++){
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random()*100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random()*colors.length)];
      piece.style.animationDuration = (2.2 + Math.random()*1.6) + 's';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.width = (6 + Math.random()*6) + 'px';
      piece.style.height = (10 + Math.random()*8) + 'px';
      confettiLayer.appendChild(piece);
      setTimeout(()=>piece.remove(), 4200);
    }
  }

  /* ============================================================
     INPUT PARSER (free text)
  ============================================================ */
  function parseFreeText(text){
    const t = text.toLowerCase().trim();

    if(/\b(done|finish|bill|checkout)\b/.test(t) || t.includes('முடி')){
      return { intent:'finish' };
    }

    // menu item mentions
    for(const key in MENU){
      const item = MENU[key];
      if(t.includes(key) || t.includes(item.en.toLowerCase()) || text.includes(item.ta)){
        return { intent:'direct_item', key, type:'menu', qty: extractQty(t,text) };
      }
    }
    for(const key in ADDONS){
      const item = ADDONS[key];
      if(t.includes(key) || t.includes(item.en.toLowerCase()) || text.includes(item.ta)){
        return { intent:'direct_item', key, type:'addon', qty: extractQty(t,text) };
      }
    }

    if(step === 'QTY' || (pendingItem)){
      const numMatch = t.match(/\d+/);
      if(numMatch) return { intent:'qty', qty: parseInt(numMatch[0]) };
      for(const w in NUM_WORDS_EN){ if(t.includes(w)) return {intent:'qty', qty:NUM_WORDS_EN[w]}; }
      for(const w in NUM_WORDS_TA){ if(text.includes(w)) return {intent:'qty', qty:NUM_WORDS_TA[w]}; }
    }

    return { intent:'unknown' };
  }

  function extractQty(tLower, rawText){
    const numMatch = tLower.match(/\d+/);
    if(numMatch) return parseInt(numMatch[0]);
    for(const w in NUM_WORDS_EN){ if(tLower.includes(w)) return NUM_WORDS_EN[w]; }
    for(const w in NUM_WORDS_TA){ if(rawText.includes(w)) return NUM_WORDS_TA[w]; }
    return 1;
  }

  /* ============================================================
     ROUTER
  ============================================================ */
  async function route(value){
    if(value.startsWith('menu_')){
      const key = value.replace('menu_','');
      return askQty(key,'menu');
    }
    if(value === 'view_full_menu') return showFullMenu();
    if(value === 'finish') return goToLocation();

    if(value.startsWith('qty_')){
      const qty = parseInt(value.replace('qty_',''));
      if(pendingItem){
        addToCart(pendingItem.key, pendingItem.type, qty);
        const {key,type} = pendingItem;
        pendingItem = null;
        return afterAddFlow(key,type,qty);
      }
    }

    if(value.startsWith('addon_add_')){
      const key = value.replace('addon_add_','');
      return askQty(key,'addon');
    }
    if(value === 'addon_skip'){
      await addBotMessage(lang==='ta' ? "சரி, no problem 😄" : "No worries! 😄");
      return goToAnythingElse();
    }

    if(value.startsWith('remove_')){
      const parts = value.split('_');
      const type = parts[1];
      const key = parts.slice(2).join('_');
      removeFromCart(key,type);
      await addBotMessage(lang==='ta' ? "நீக்கிட்டேன் ✅" : "Removed ✅");
      return openEditMenu();
    }
    if(value === 'edit_add_more'){
      return showMainMenu();
    }
    if(value === 'edit_done'){
      return goToSummary();
    }

    if(value === 'restart'){
      return restartAll();
    }
  }

  async function routeParsed(parsed, rawText){
    if(step === 'LOCATION'){
      location = { manual: rawText };
      await addBotMessage(T('locationCaptured'));
      return goToSummary();
    }

    if(parsed.intent === 'finish') return goToLocation();

    if(parsed.intent === 'direct_item'){
      addToCart(parsed.key, parsed.type, parsed.qty || 1);
      return afterAddFlow(parsed.key, parsed.type, parsed.qty || 1);
    }
    if(parsed.intent === 'qty' && pendingItem){
      const {key,type} = pendingItem;
      addToCart(key,type,parsed.qty);
      pendingItem = null;
      return afterAddFlow(key,type,parsed.qty);
    }

    await addBotMessage(T('unknownReply'));
    if(step === 'MAIN_MENU'){
      showChips([
        { label:T('menuChip_tea'), value:'menu_tea' },
        { label:T('menuChip_coffee'), value:'menu_coffee' },
        { label:T('viewFullMenu'), value:'view_full_menu', ghost:true },
        { label:T('finishOrdering'), value:'finish', accent:true }
      ]);
    }
  }

  /* ============================================================
     TEXT INPUT WIRING
  ============================================================ */
  function handleSend(){
    const val = textInput.value.trim();
    if(!val) return;
    lastRawText = val;
    addUserMessage(val);
    textInput.value = '';
    textInput.placeholder = lang==='ta' ? 'இங்கே டைப் செய்யுங்க…' : 'Type here…';
    clearChips();
    const parsed = parseFreeText(val);
    routeParsed(parsed, val);
  }
  sendBtn.addEventListener('click', handleSend);
  textInput.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){ e.preventDefault(); handleSend(); }
  });

  /* ============================================================
     RESTART
  ============================================================ */
  function restartAll(){
    cart = [];
    pendingItem = null;
    lastAddedType = null;
    location = null;
    orderId = null;
    step = "MAIN_MENU";
    updateCartPill();
    chatArea.innerHTML = '';
    clearChips();
    startConversation();
  }

})();
