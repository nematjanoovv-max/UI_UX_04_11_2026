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
- **120Hz+ Ultra-Silliq Skroll:** Mobil qurilmalarda tepaga qaytib sakrab ketish (overscroll-bounce) muammolari bartaraf etilgan, momentum skroll fizikasiga ega interfeys.
- **Geolokatsiya va Tumanlar:** GPS orqali 1-bosishda manzilni aniqlash yoki Toshkentning tezkor tumanlarini tanlash.
- **Interaktiv Savatcha va To'lov Gateway:** Naqd, Click, Payme va Uzum to'lov tizimlari simulyatsiyasi.
- **Promokodlar va Keshbek Tizimi:** Chegirma promokodlari va xaridlardan yig'iladigan keshbek balansi.
- **Web Audio API Tovush Effektlari:** Tugmalar bosilganda, buyurtma qabul qilinganda va xatoliklarda yoqimli tabiiy tovushlar.
- **Dynamic Island & Jonli Kuzatuv:** Buyurtmaning 5 bosqichli real-vaqt stepperi (Qabul qilindi ➔ Tasdiqlandi ➔ Tayyorlanmoqda ➔ Kuryer yo'lda ➔ Yetkazildi).

### 2. 🔐 Xavfsiz Telegram OTP Tasdiqlash (Pullik SMS'larsiz)
- **Eskiz.uz talab etilmaydi:** Pullik uchinchi tomon SMS shlyuzlarisiz, to'g'ridan-to'g'ri Telegram bot orqali ishlaydigan 6 xonali OTP tizimi.
- **1-Bosishda Botga O'tish (Deep-Link):** Buyurtma berishda `[📲 Telegram botda kodni ochish]` orqali [@Smart_delivery_fast_bot](https://t.me/Smart_delivery_fast_bot) ochiladi.
- **Avto-Polling Tasdiqlash:** Foydalanuvchi botda "START" bosganida yoki 6 xonali kodni olganida, veb-sahifa har 1.8 soniyada holatni tekshirib, sahifani avtomatik yashil tasdiqlangan holatga o'tkazadi.
- **To'liq Maxfiylik va Shaxsiy Ma'lumotlar Himoyasi:**
  - Havolalarda ochiq telefon raqamlari qoldirilmaydi.
  - Xabarlarda telefon raqamlari niqoblanadi (`+998 90 *** ** 67`).
  - Maxfiy tasdiqlash kodlari mijoz brauzeri API javoblarida oshkor etilmaydi (faqat shaxsiy bot xabarida yetkaziladi).

### 3. 👑 Admin Dispetcherlik Markazi (`/admin`)
- Markaziy tahliliy ko'rsatkichlar: umumiy tushum, faol va yetkazilgan buyurtmalar soni, bo'sh kuryerlar.
- Buyurtmalar monitoringi va kuryer biriktirish.
- Menyu va taomlar boshqaruvi (CRUD: yangi taom qo'shish, tahrirlash, o'chirish).
- Kuryerlar ro'yxati va ularning jonli holati (`free`, `busy`, `offline`).

### 4. 🛵 Kuryer Kabineti (`/courier`)
- Kuryerlar uchun mobilga moslashtirilgan interfeys.
- Faqat o'ziga biriktirilgan faol buyurtmalarni ko'rish.
- **"Yo'lga chiqdim"** va **"Yetkazib berdim"** tezkor boshqaruv tugmalari.

### 5. 🤖 Rasmiy Telegram Bot ([@Smart_delivery_fast_bot](https://t.me/Smart_delivery_fast_bot))
- Doimiy pastki menyu (Persistent Keyboard) va WebApp Chat Menu Button (`🍔 Do'konni ochish`).
- 3 tilda to'liq qo'llab-quvvatlash: 🇺🇿 O'zbekcha, 🇷🇺 Русский, 🇬🇧 English.
- Bot ichida interaktiv menyu, savatcha va buyurtma berish.
- Foydalanuvchi GIF/stiker tashlaganda avtomatik asosiy menyuga yo'naltirish.
- Kuryerlar uchun kuryer buyruqlari (`/courier`) orqali buyurtmalarni boshqarish.

### 6. ⚡ 24/7 Uxlab Qolishdan Himoya (Keep-Alive)
- **Render Ichki Self-Ping:** Server har 9 daqiqada o'zini-o'zi uyg'otadi.
- **GitHub Actions Avto-Kuzatuv:** Har 10 daqiqada doimiy `/api/health` so'rovlari yuborilib, Render bepul serveri uxlab qolishi oldi olinadi.
- **Frontend Avto-Qayta Urinish:** Server uyg'onish holatida bo'lsa, mijoz so'rovi uzilib qolmasdan avtomatik 1.5 soniyada qayta urinadi.

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
