# 🚀 Smart Delivery — Zamonaviy Yetkazib Berish Tizimi (2026)

[![Live Web](https://img.shields.io/badge/Live_Site-Vercel-success?style=for-the-badge&logo=vercel)](https://smart-delivery-system-2026.vercel.app)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-@Smart__delivery__fast__bot-blue?style=for-the-badge&logo=telegram)](https://t.me/Smart_delivery_fast_bot)
[![Keep Alive Status](https://img.shields.io/badge/Keep--Alive-Active-brightgreen?style=for-the-badge&logo=githubactions)](https://smart-delivery-system-sy6e.onrender.com/api/health)

Lokal ishchi katalog: `/mnt/sdcard/Agent/UI_UX_04_11_2026`  
Rasmiy GitHub repozitoriyasi: [https://github.com/nematjanoovv-max/UI_UX_04_11_2026](https://github.com/nematjanoovv-max/UI_UX_04_11_2026)

---

## 📖 Loyiha Haqida

**Smart Delivery** — bu 2026-yilgi eng so'nggi UI/UX standartlari asosida yaratilgan, to'liq avtomatlashtirilgan oziq-ovqat va taom yetkazib berish ekotizimi. Tizim mijozlar, dispetcherlar (admin), kuryerlar hamda Telegram botni yagona sinxron ma'lumotlar bazasida birlashtiradi.

---

## 🌟 Asosiy Imkoniyatlar va Modullar

### 1. 🌐 Mijoz Web-Ilovasi (Web & Telegram WebApp)
- **Obsidian Dark Dizayn:** Chuqur `#0B0F19` ranglar palitrasi, yuqori kontrastli zamonaviy tipografika.
- **320px dan 1440px gacha 100% Moslashuvchanlik (Responsive):** Gorizontal skroll (overflow-x) to'liq yo'qotilgan, har qanday smartfon yoki noutbuk ekranida tabiiy joylashadi.
- **Telegram WebApp & Mobil Viewport:** `min-h-[100dvh]` dinamik balandlik va pastki panel/savatchalar uchun `env(safe-area-inset-bottom)` safe-area qo'llab-quvvatlovi.
- **Dynamic Island Stepper To'siqsiz Joylashuvi:** Asosiy konteynerda Dynamic Island va pastki navigatsiya uchun yetarli padding (`pb-28 sm:pb-24`) berilgan.
- **44x44px Touch-Target Standarti:** Barcha interaktiv tugmalar (savatchaga qo'shish, +/-, tumanlar, to'lov turlari, promokod) kamida 44x44px bosish maydoniga ega.
- **Mikro-Animatsiyalar:** Har bir tugmada `active:scale-95 transition-all duration-150` va teginish bilan javob qaytarish.
- **Geolokatsiya va Tumanlar:** GPS orqali 1-bosishda manzilni aniqlash yoki Toshkentning tezkor tumanlarini tanlash.
- **Interaktiv Savatcha va To'lov Gateway:** Naqd, Click, Payme va Uzum to'lov tizimlari simulyatsiyasi.
- **Promokodlar va Keshbek Tizimi:** Chegirma promokodlari va xaridlardan yig'iladigan keshbek balansi.
- **Web Audio API Tovush Effektlari:** Tugmalar bosilganda, buyurtma qabul qilinganda va xatoliklarda yoqimli tabiiy tovushlar.
- **Dynamic Island & Jonli Kuzatuv:** Buyurtmaning 5 bosqichli real-vaqt stepperi (Qabul qilindi ➔ Tasdiqlandi ➔ Tayyorlanmoqda ➔ Kuryer yo'lda ➔ Yetkazildi).

### 2. 🔐 Xavfsiz Telegram OTP Tasdiqlash (Pullik SMS'larsiz)
- **Eskiz.uz talab etilmaydi:** Pullik uchinchi tomon SMS shlyuzlarisiz, to'g'ridan-to'g'ri Telegram bot orqali ishlaydigan 6 xonali OTP tizimi.
- **1-Bosishda Botga O'tish (Deep-Link):** Buyurtma berishda `[📲 Telegram botda kodni ochish]` orqali [@Smart_delivery_fast_bot](https://t.me/Smart_delivery_fast_bot) ochiladi.
- **Universal /start va Kodni Qabul Qilish:**
  - Foydalanuvchi bot linkini bosganda (`/start v_123456_90...`) bot darhol 6 xonali kodni chiroyli xabar shaklida taqdim etadi va raqamni tasdiqlaydi.
  - Foydalanuvchi botga shunchaki `/start` yuborsa ham unga biriktirilgan faol kod darhol yuboriladi yoki asosiy menyu ochiladi (hech qachon "buyruq tushunarsiz" xatosi chiqmaydi).
  - Foydalanuvchi botga 6 xonali kodni to'g'ridan-to'g'ri yozib yuborsa ham bot kodni tanib olib avtomatik tasdiqlaydi.
- **Ko'p Serverli Sinxronizatsiya (Vercel & Render Sync):** Vercel va Render o'rtasida OTP kodlar real-vaqtda sinxronlanadi.
- **Avto-Polling Tasdiqlash:** Foydalanuvchi botda "START" bosganida yoki 6 xonali kodni olganida, veb-sahifa har 1.8 soniyada holatni tekshirib, sahifani avtomatik yashil tasdiqlangan holatga o'tkazadi.
- **To'liq Maxfiylik va Shaxsiy Ma'lumotlar Himoyasi:**
  - Havolalarda ochiq telefon raqamlari qoldirilmaydi.
  - Xabarlarda telefon raqamlari niqoblanadi (`+998 90 *** ** 67`).
  - Maxfiy tasdiqlash kodlari mijoz brauzeri API javoblarida oshkor etilmaydi (faqat shaxsiy bot xabarida yetkaziladi).

### 3. 👑 Admin Dispetcherlik Markazi (`/admin`)
- **Mobil Card-View:** Mobil ekranlarda noqulay gorizontal jadvallar o'rniga har bir buyurtma qulay kartochka shaklida aks etadi (mijoz, manzil, taomlar, 44px kuryer biriktirish, fiskal chek va status tugmalari). Katta ekranlarda esa ixcham jadval ko'rinishi faollashadi.
- **CRUD Modallari:** Kichik ekranlarda ham oson to'ldiriladigan, `max-h-[90dvh]` skrollanadigan va xavfsiz soha hisobga olingan modal darchalar.
- Markaziy tahliliy ko'rsatkichlar: umumiy tushum, faol va yetkazilgan buyurtmalar soni, bo'sh kuryerlar.
- Menyu va taomlar boshqaruvi (CRUD: yangi taom qo'shish, tovar turi tanlash, tahrirlash, o'chirish).
- Kuryerlar ro'yxati va ularning jonli holati (`free`, `busy`, `offline`).

### 4. 🛵 Kuryer Kabineti (`/courier`)
- **Yirik Boshqaruv Tugmalari (52px+):** Yo'lda harakatlanayotgan kuryerlar uchun bir urishda bosiladigan ulkan **"Yo'lga chiqdim"** (olovrang gradient) va **"Yetkazib berdim"** (zumradrang gradient) tugmalari.
- 1-Bosishda Yandex Navigator va Google Maps orqali yo'nalish ochish.
- Mijozga 1-urishda qo'ng'iroq qilish (44px yashil tugma).
- Kuryerlar uchun mobilga 100% moslashtirilgan interfeys.
- Faqat o'ziga biriktirilgan faol buyurtmalarni ko'rish.

### 5. 🤖 Rasmiy Telegram Bot ([@Smart_delivery_fast_bot](https://t.me/Smart_delivery_fast_bot))
- Doimiy pastki menyu (Persistent Keyboard) va WebApp Chat Menu Button (`🍔 Do'konni ochish`).
- 3 tilda to'liq qo'llab-quvvatlash: 🇺🇿 O'zbekcha, 🇷🇺 Русский, 🇬🇧 English.
- Bot ichida interaktiv menyu, savatcha va buyurtma berish.
- Foydalanuvchi GIF/stiker tashlaganda avtomatik asosiy menyuga yo'naltirish.
- Kuryerlar uchun kuryer buyruqlari (`/courier`) orqali buyurtmalarni boshqarish.

### 6. ⚡ 24/7 Uxlab Qolishdan Himoya (Keep-Alive) & Server Uyg'onishi
- **Render Ichki Self-Ping:** Server har 9 daqiqada o'zini-o'zi uyg'otadi.
- **GitHub Actions Avto-Kuzatuv:** Har 10 daqiqada doimiy `/api/health` so'rovlari yuborilib, Render bepul serveri uxlab qolishi oldi olinadi.
- **Frontend Avto-Qayta Urinish va Info-Toast:** Server uyg'onish holatida bo'lsa (cold-start), mijoz so'rovi uzilib qolmasdan avtomatik 1.5 soniyada qayta urinadi va foydalanuvchiga qulay xabarnoma ko'rsatiladi.

### 7. 🛡 Barqarorlik, Double-Click Himoyasi va Web Audio Optimizatsiyasi
- **Double-Click (Qo'shaloq bosilish) va Loading Holatlari:**
  - Buyurtma berish (`POST /api/orders`), OTP yuborish/tasdiqlash, promokod tekshirish, kuryer biriktirish va buyurtma holatini yangilash tugmalariga qat'iy holat muhofazasi (`disabled:opacity-60 disabled:pointer-events-none`) o'rnatildi.
  - Tugma bosilganda darhol `Loader2` aylanuvchi spinneri aks etib, serverdan javob qaytmaguncha qayta bosilish bloklanadi.
- **Savatcha Hisob-Kitob Xavfsizligi (Anti-NaN & Anti-Negative):**
  - `updateQuantity` va `addToCart` funksiyalari to'liq sanitizatsiya qilinib, `Math.max(0, parseInt(..., 10) || 0)` orqali 0 dan 99 oralig'ida qat'iy cheklandi. Tezkor bosishlarda manfiy son yoki `NaN` chiqishi to'liq bartaraf etildi.
- **Xotira Sizib Chiqishidan Himoya (Memory-Safe OTP Polling):**
  - `/api/auth/check-otp-status` 1.8s polling mexanizmi `AbortController` va yagona polling bayrog'iga ulandi. Foydalanuvchi modalni yopsa, sahifani tark etsa yoki tasdiqlash yakunlansa, barcha taymerlar va faol HTTP ulanishlar darhol tozalanishi (`clearInterval` & `abort()`) kafolatlandi.
- **Yagona Web Audio Context (Singleton Engine):**
  - Har tugma bosilganda yangi `AudioContext` ochilib mobil brauzerni qotirishining oldi olindi. Singleton kontekst birinchi teginishda faollashtiriladi (`resume()`), va barcha tovush effektlari `try/catch` bilan himoyalanib, audio xatosi dastur ishlashiga hech qachon to'sqinlik qilmaydi.

### 8. 🎯 API Validatsiyasi va Optimistik (Instant) Holat Yangilanishi
- **To'liq Ma'lumotlar Validatsiyasi:**
  - O'zbekiston telefon raqamlari qat'iy formatlandi (`+998 XX XXX-XX-XX`). Noto'g'ri raqam yoki xato kiritilganda frontend va backendda aniq tushuntirish xabari chiqadi.
  - Bo'sh savatcha bilan buyurtma berish bloklandi va xatolik matni ko'rsatiladi.
  - Noto'g'ri yoki muddati o'tgan promokod kiritilganda aniq nom bilan tushuntirish beriladi.
  - Mavjud bo'lmagan buyurtma raqamini kuzatishda (`/api/orders/track/:query`) aniq ko'rsatma va xatolik darchasi aks etadi.
- **Kuryer va Admin Optimistik UI Yangilanishi (Instant State Update):**
  - Admin kuryer biriktirganda yoki buyurtma holatini o'zgartirganda sahifa qayta yuklanmasdan, 0ms kechikish bilan ekranda darhol yangilanadi. Serverda xato yuz bersa, holat avtomatik orqaga qaytariladi (rollback).
  - Kuryer "Yo'lga chiqdim" yoki "Yetkazib berdim" tugmasini bosganida holat darhol o'zgaradi va fonda server bilan sinxronlashadi.

### 9. 🚀 100% Stateless TOTP & Mobil UI/UX Mukammallashtirishi (Eng So'nggi Yangilanish)
- **Kechikishlarsiz (0ms) Stateless TOTP / HMAC Tasdiqlash Arxitekturasi:**
  - Vercel Serverless multi-instance (har xil lambda instansiyalari) xususiyati sababli kod kelmasligi yoki kechikishi to'liq bartaraf etildi.
  - 6 xonali OTP kodi HMAC-SHA256 va 5 daqiqalik vaqt darchasi asosida deterministik hisoblanadi. Istalgan lambda serverless instansiyasiga tushganda kod 0ms kechikish bilan va bazaga bog'liq bo'lmagan holda darhol tasdiqlanadi.
  - Telegram bot orqali jo'natish birinchi navbatda (100ms dan kam vaqtda) amalga oshiriladi; Eskiz.uz esa fon rejimida 3s qat'iy timeout bilan ishlaydi (hech qachon Telegramni kechiktirmaydi).
  - Mobil qurilmalarda Telegram ilovasini bir bosishda ochish uchun to'g'ridan-to'g'ri `tg://resolve?domain=Smart_delivery_fast_bot&start=v_...` protokoli qo'llab-quvvatlandi.
- **UI & Ekran Moslashuvidagi Xatoliklar Bartaraf Etildi:**
  - **Oltin Kartoshka Fri rasmi:** 404 xatosi berayotgan rasm ishchi Unsplash manziliga almashtirildi va barcha rasm teglari uchun ishonchli `onError` fallback qo'shildi.
  - **Narx qisqarib qolishi (`22 00...`):** `truncate` o'rniga vertikal mikro-qatlam (`22 000` ustida, `so'm` ostida) joriy etilib, hatto 320px ekranda ham to'liq va aniq aks etishi ta'minlandi.
  - **Ikki qavatli savatcha panellari to'qnashuvi:** Telegram WebApp'ning `MainButton` tugmasi bosh sahifada `MobileBottomNav` ustiga minmasligi uchun yashirildi; faqat savatcha va buyurtma darchalari ochilgandagina chiqadi.
  - **Yuqori Navbar tor ekranlarda siqilishi (< 380px):** Logo, til almashtirgich va ovoz tugmalari ixchamlashtirildi, `MobileBottomNav` da mavjud bo'lgan takroriy Admin tugmasi tor ekranlarda yashirilib, o'ng tomondan kesilib ketish to'liq yo'qotildi.
  - **OTP Tasdiqlash tugmasi kesilishi:** Mobil Chrome brauzerida `Tasdiqlash` tugmasi `min-w-[100px]` o'rniga dinamik `whitespace-nowrap shrink-0` bilan moslashtirilib, 6 ta raqam terilishi bilan avtomatik tasdiqlash ulandi.

---

## 🛠 Texnologik Stek

| Qatlam | Texnologiyalar |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide React, Web Audio API |
| **Backend** | Node.js (v22+), Express.js, CORS, Dotenv |
| **Ma'lumotlar Bazasi** | SQLite (`node:sqlite` yuqori tezlikdagi WAL rejimi) |
| **Bot & Webhook** | Telegram Bot API, Serverless Webhook & Polling |
| **Hosting & Deploy** | Vercel (Frontend & Serverless API), Render (Backend Service), GitHub Actions |

---

## 📌 Jonli Havolalar

- 🌐 **Mijoz Web-Sayti:** [https://smart-delivery-system-2026.vercel.app](https://smart-delivery-system-2026.vercel.app)
- 👑 **Admin Panel:** [https://smart-delivery-system-2026.vercel.app/admin](https://smart-delivery-system-2026.vercel.app/admin)
- 🛵 **Kuryer Paneli:** [https://smart-delivery-system-2026.vercel.app/courier](https://smart-delivery-system-2026.vercel.app/courier)
- 🤖 **Telegram Bot:** [@Smart_delivery_fast_bot](https://t.me/Smart_delivery_fast_bot)
- 🩺 **Tizim Salomatlik Holati (Health Check):** [https://smart-delivery-system-2026.vercel.app/api/health](https://smart-delivery-system-2026.vercel.app/api/health)

---

## 🔌 Asosiy REST API Endpointlar

### 📦 Buyurtmalar va Mahsulotlar
- `GET /api/categories` — Barcha kategoriyalar
- `GET /api/products` — Taomlar ro'yxati (kategoriya bo'yicha filtrlash bilan)
- `POST /api/orders` — Yangi buyurtma yaratish
- `GET /api/orders/track/:query` — Buyurtma kodi yoki telefon raqami bo'yicha jonli kuzatish
- `PATCH /api/orders/:id/status` — Buyurtma holatini yangilash
- `PATCH /api/orders/:id/assign-courier` — Kuryer biriktirish

### 🔐 Autentifikatsiya va OTP Tasdiqlash
- `POST /api/auth/send-otp` — Telegram bot orqali 6 xonali tasdiqlash kodini yuborish
- `POST /api/auth/verify-otp` — 6 xonali tasdiqlash kodini tekshirish
- `GET /api/auth/check-otp-status` — Polling orqali botdagi tasdiqlash holatini bilish
- `POST /api/auth/bot-verified` — Telegram bot webhook orqali avtomatik tasdiqlash

### 📊 Statistika va Yordamchi
- `GET /api/stats` — Admin dashboard tahliliy hisobotlari
- `POST /api/promocodes/validate` — Promokodlarni tekshirish va chegirma hisoblash
- `GET /api/reviews` & `POST /api/reviews` — Mijozlar fikrlari
- `GET /api/health` — Tizim, ma'lumotlar bazasi va bot holati

---

## 💻 Lokal Ishga Tushirish

```bash
# 1. Repozitoriyani klonlash
git clone https://github.com/nematjanoovv-max/UI_UX_04_11_2026.git
cd UI_UX_04_11_2026

# 2. Barcha paketlarni o'rnatish
npm run install:all

# 3. Ma'lumotlar bazasini boshlang'ich ma'lumotlar bilan to'ldirish
npm run seed

# 4. Backend va Telegram botni ishga tushirish
npm start

# 5. Frontendni ishlab chiqish rejimida ishga tushirish (alohida terminalda)
npm run client
```

---

## 📝 Muhim Eslatmalar
- Bot ishlashi uchun `.env` faylida `BOT_TOKEN` va `ADMIN_TELEGRAM_ID` o'rnatilgan bo'lishi lozim (serverless muhitda avtomatik zaxira token mavjud).
- Shaxsiy foydalanuvchi ma'lumotlari va xavfsizlik kodlari tashqi manbalarga oshkor etilmaydi.
