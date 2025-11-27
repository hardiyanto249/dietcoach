# 🥗 DIET COACH - User Guide

## ✅ Status Aplikasi

**Aplikasi sudah SIAP DIGUNAKAN!**

- ✅ Database PostgreSQL: Connected
- ✅ Authentication: Working
- ✅ Onboarding: Working
- ✅ Chat Interface: Working
- ✅ Personalized Greeting: Working

---

## 🚀 Cara Menggunakan Aplikasi

### 1️⃣ **Buka Aplikasi**
```
http://localhost:3000
```

### 2️⃣ **Registrasi Akun Baru**

1. Klik tombol **"Start Your Journey"** di landing page
2. Isi form registrasi:
   - **Full Name**: Nama lengkap Anda (contoh: "Yan")
   - **Email**: Email Anda (contoh: "yan@test.com")
   - **Password**: Password Anda (minimal 8 karakter)
3. Klik **"Sign Up"**
4. Anda akan otomatis login dan diarahkan ke halaman Onboarding

### 3️⃣ **Lengkapi Onboarding (4 Langkah)**

**Step 1: Data Diri**
- Pilih **Gender**: Male / Female
- Masukkan **Age**: Umur Anda (contoh: 30)
- Klik **Next**

**Step 2: Body Measurements**
- **Height (cm)**: Tinggi badan dalam cm (contoh: 175)
- **Current Weight (kg)**: Berat badan saat ini (contoh: 75)
- **Target Weight (kg)**: Target berat badan (contoh: 70)
- Klik **Next**

**Step 3: Activity Level**
- Pilih level aktivitas harian Anda:
  - Sedentary (Office job, little exercise)
  - Lightly Active (1-3 days/week)
  - **Moderately Active (3-5 days/week)** ← Recommended
  - Very Active (6-7 days/week)
- Klik **Next**

**Step 4: TDEE Result**
- Lihat hasil kalkulasi **TDEE** (Total Daily Energy Expenditure)
- Lihat rekomendasi kalori untuk **Weight Loss** (TDEE - 500 kcal)
- Klik **"Start Chatting"**

### 4️⃣ **Mulai Chat dengan Diet Coach**

Anda akan diarahkan ke halaman chat dengan greeting personal:
```
"Halo! Selamat pagi [NAMA ANDA], mau sarapan apa hari ini?"
```

**Cara Menggunakan Chat:**

1. **Ketik makanan yang Anda konsumsi** di input box
   
   Contoh:
   ```
   Tadi pagi saya sarapan nasi goreng 1 piring dan teh manis
   ```

2. **Klik tombol Send** (tombol hijau dengan icon panah)

3. **Bot akan merespon** dengan:
   - Konfirmasi: "Oke noted! Saya sedang menghitung kalorinya..."
   - Detail kalori (mock response untuk demo)

**Fitur Chat Interface:**

- 📊 **Sidebar (Desktop)**: Menampilkan tracking kalori & makro
  - Calories Left: 1,200 / 2,000 kcal
  - Protein: 45g / 120g
  - Carbs: 150g / 250g

- 💬 **Chat Bubbles**: 
  - Pesan Anda: Hijau (kanan)
  - Pesan Bot: Abu-abu (kiri)

- 📷 **Icon Camera**: Untuk foto makanan (coming soon)
- 🎤 **Icon Mic**: Untuk voice input (coming soon)

---

## 🎯 Fitur yang Sudah Berfungsi

### ✅ **Authentication System**
- Register dengan nama, email, password
- Login dengan session JWT
- Password di-hash dengan bcryptjs
- Auto-login setelah register
- Protected routes (redirect ke login jika belum login)

### ✅ **Onboarding Flow**
- 4-step wizard dengan progress indicator
- Input validation
- BMR calculation (Basal Metabolic Rate)
- TDEE calculation berdasarkan activity level
- Rekomendasi kalori untuk weight loss

### ✅ **Chat Interface**
- **Personalized greeting** dengan nama user dari database
- Real-time chat UI
- Mock AI response untuk demo
- Responsive design (mobile & desktop)
- Sidebar tracking (desktop only)

### ✅ **Database Integration**
- PostgreSQL dengan Prisma ORM
- Model User & DietProfile
- Data persisten
- Automatic timestamps

---

## 📱 Fitur yang Akan Dikembangkan

### 🔄 **AI Integration** (Next Step)
```javascript
// TODO: Integrate OpenAI API
// - Food recognition dari foto
// - Natural language processing untuk chat
// - Kalori estimation otomatis
```

### 🔄 **Food Database**
```javascript
// TODO: Database makanan Indonesia
// - FatSecret API integration
// - Manual food database
// - Barcode scanner
```

### 🔄 **Google Calendar Integration**
```javascript
// TODO: Calendar reminders
// - Meal reminders
// - Exercise reminders
// - Sleep tracking
```

### 🔄 **Advanced Features**
```javascript
// TODO: Analytics & Prediction
// - Weight prediction graph (1-6 months)
// - Weekly reports
// - Mood & energy tracking
// - Progress photos
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript
- **Styling**: CSS Modules + Global CSS (Glassmorphism)
- **Database**: PostgreSQL + Prisma ORM v5.22.0
- **Authentication**: JWT (jose) + bcryptjs
- **Icons**: Lucide React
- **Animations**: CSS Keyframes

---

## 📊 Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  profile   DietProfile?
}

model DietProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id])
  gender        String
  age           Int
  height        Float
  weight        Float
  targetWeight  Float
  activityLevel String
  bmr           Float
  tdee          Float
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio (Database GUI)
npx prisma studio
```

---

## 🎨 Design Features

- ✨ **Dark Mode** dengan glassmorphism effect
- 🌈 **Gradient colors** (Emerald Green + Indigo)
- 💫 **Smooth animations** (fade-in, float, hover effects)
- 🎯 **Modern typography** (Inter font from Google Fonts)
- 📱 **Responsive design** (mobile-first approach)
- 🔥 **Premium UI/UX** dengan micro-interactions

---

## 🎉 Selamat!

Aplikasi **DIET COACH** Anda sudah siap digunakan!

**Nama Anda sekarang muncul di chat**, bukan lagi "Andi" 😊

Silakan explore aplikasinya dan nikmati fitur-fitur yang sudah tersedia!

---

**Made with ❤️ by Antigravity AI**
