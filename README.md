# 🚀 Smart Delivery — Yetkazib Berish Tizimi (2026)

Lokal papka: `/mnt/sdcard/Agent/UI_UX_04_11_2026`  
GitHub Repo: [https://github.com/nematjanoovv-max/UI_UX_04_11_2026](https://github.com/nematjanoovv-max/UI_UX_04_11_2026)

Zamonaviy, to'liq sinxronlashtirilgan oziq-ovqat va taom yetkazib berish ekotizimi:
- 🌐 **Mijoz Web-Sayti:** Zamonaviy 2026 UI/UX, mobil-moslashuvchan, savatcha, geolokatsiya, jonli buyurtma kuzatish (5-bosqichli stepper).
- 👑 **Admin Panel:** Markaziy dispetcherlik, kuryerlarni biriktirish, buyurtmalar statistikasi, taomlar va kuryerlar CRUD boshqaruvi.
- 🛵 **Kuryer Paneli:** Kuryerlar uchun mobil-qulay doska, "Yo'lga chiqdim" va "Yetkazib berdim" harakatlari.
- 🤖 **Telegram Bot (@Smart_delivery_fast_bot):** Mijozlar uchun inline menyu, savatcha va buyurtma berish; Kuryerlar uchun biriktirilgan buyurtmalarni bot orqali qabul qilish va yetkazish; Adminlar uchun tezkor xabarnomalar.

---

## 🛠 Texnologik Stek
- **Backend:** Node.js (v22+), Express.js, CORS, Dotenv
- **Ma'lumotlar bazasi:** SQLite (`node:sqlite` built-in yuqori unumli dvigatel)
- **Frontend:** React 18, Vite 6, Tailwind CSS, Lucide React, Glassmorphism UI
- **Telegram Bot:** Telegram Bot API (Long-polling & Webhook, auto getMe)
- **Deployment:** Vercel (Frontend & Serverless API), Render (Backend Service), GitHub

---

## 📌 Asosiy Havolalar va Interfeyslar
- **Mijoz Web-Sayti:** [https://smart-delivery-system-2026.vercel.app](https://smart-delivery-system-2026.vercel.app)
- **Admin Panel:** [https://smart-delivery-system-2026.vercel.app/admin](https://smart-delivery-system-2026.vercel.app/admin) *(Xavfsiz login/parol bilan himoyalangan)*
- **Kuryer Paneli:** [https://smart-delivery-system-2026.vercel.app/courier](https://smart-delivery-system-2026.vercel.app/courier)
- **Telegram Bot:** [@Smart_delivery_fast_bot](https://t.me/Smart_delivery_fast_bot)
- **API Health Check:** [https://smart-delivery-system-2026.vercel.app/api/health](https://smart-delivery-system-2026.vercel.app/api/health)
- **Render 1-Click Deploy:** [Deploy to Render](https://render.com/deploy?repo=https://github.com/nematjanoovv-max/UI_UX_04_11_2026)

---

## 🤖 Telegram Bot Buyruqlari
1. **Mijoz rejimi:**
   - `/start` — Asosiy menyu, xush kelibsiz xabari
   - `🍔 Menyu va Buyurtma berish` — Inline kategoriyalar, taomlar, savatga qo'shish
   - `📦 Buyurtmam holati` — Faol buyurtmalar va kuryer ma'lumotlari
   - `🌐 Web-sayt orqali buyurtma (WebApp)` — Web interfeysni Telegram ichida ochish
2. **Kuryer rejimi:**
   - `/courier` — Kuryer sifatida telefon raqam orqali ro'yxatdan o'tish yoki bog'lanish
   - Biriktirilgan buyurtma xabari ostida: `[🚗 Qabul qildim / Yo'lga chiqdim]` va `[🏁 Yetkazib berdim]` tugmalari
3. **Admin rejimi:**
   - `/admin_bot` — Yangi buyurtmalar xabarnomasi va tizim statistikasi

---

## 🔌 REST API Endpointlar
- `GET /api/health` — Tizim, baza va bot holati
- `GET /api/categories` & `POST /api/categories` — Kategoriyalar
- `GET /api/products` & `POST /api/products` — Taomlar
- `GET /api/orders` & `POST /api/orders` — Buyurtmalar
- `GET /api/orders/track/:query` — Buyurtmani jonli kuzatish
- `PATCH /api/orders/:id/status` — Statusni o'zgartirish
- `PATCH /api/orders/:id/assign-courier` — Kuryer biriktirish
- `GET /api/couriers` & `POST /api/couriers` — Kuryerlar
- `GET /api/stats` — Admin dashboard tahlili

---

## 💻 Lokal Ishga Tushirish
```bash
# 1. Barcha bog'liqliklarni o'rnatish
npm run install:all

# 2. Ma'lumotlar bazasini to'ldirish (seed)
npm run seed

# 3. Backend va Botni ishga tushirish
npm start
```
