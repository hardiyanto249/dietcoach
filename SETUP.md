# Diet Coach - Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)

## Database Setup

### Option 1: Using Docker (Recommended)
```bash
docker-compose up -d
```

### Option 2: Local PostgreSQL
1. Install PostgreSQL di komputer Anda
2. Buat database baru bernama `dietcoach`
3. Update file `.env` dengan connection string Anda

### Option 3: Cloud Database (Neon, Supabase, Railway)
1. Buat database PostgreSQL di cloud provider pilihan Anda
2. Copy connection string
3. Update file `.env`

## Environment Variables

Buat file `.env` di root project dengan isi:

```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/dietcoach?schema=public"
```

Ganti dengan kredensial database Anda.

## Installation Steps

1. **Install dependencies**
```bash
npm install
```

2. **Generate Prisma Client**
```bash
npx prisma generate
```

3. **Run database migrations**
```bash
npx prisma db push
```

4. **Start development server**
```bash
npm run dev
```

5. **Open browser**
Navigate to `http://localhost:3000`

## First Time Usage

1. **Register**: Klik "Start Your Journey" → pilih "Sign up"
2. **Create account**: Masukkan nama, email, dan password
3. **Login**: Sign in dengan kredensial yang baru dibuat
4. **Onboarding**: Isi data diri (gender, umur, tinggi, berat, aktivitas)
5. **Chat**: Mulai chat dengan Diet Coach AI!

## Features Implemented

✅ **Authentication System**
- Register & Login dengan bcrypt password hashing
- Session management dengan JWT
- Protected routes

✅ **User Profile**
- Onboarding flow untuk data diri
- BMR & TDEE calculation
- Target kalori harian

✅ **Chat Interface**
- Real-time chat UI
- Personalized greeting dengan nama user
- Sidebar dengan tracking kalori & makro (desktop)

✅ **Database Integration**
- PostgreSQL dengan Prisma ORM
- User & DietProfile models
- Automatic timestamps

## Next Steps (Future Development)

🔄 **AI Integration**
- Connect OpenAI API untuk real food recognition
- Natural language processing untuk chat

🔄 **Food Logging**
- Foto makanan → AI recognition
- Barcode scanner
- Manual input dengan database makanan Indonesia

🔄 **Google Calendar Integration**
- Meal reminders
- Exercise reminders
- Sleep tracking

🔄 **Advanced Features**
- Weight prediction graph
- Weekly reports
- Mood & energy tracking

## Troubleshooting

### Prisma Generate Error
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
npx prisma generate
```

### Database Connection Error
- Pastikan PostgreSQL running
- Check kredensial di `.env`
- Test connection: `npx prisma db push`

### Port Already in Use
```bash
# Change port in package.json or kill process
npx kill-port 3000
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (jose) + bcryptjs
- **Styling**: CSS Modules + Global CSS
- **Icons**: Lucide React

---

**Selamat mencoba Diet Coach! 🥗💪**
