# 📷 AI Food Recognition - Setup Guide

## 🎯 **Fitur Baru: AI Food Recognition**

Aplikasi Diet Coach sekarang bisa **mengenali makanan dari foto** menggunakan OpenAI Vision API!

### ✨ **Cara Kerja:**
1. 📷 **Upload foto makanan** (klik icon camera)
2. 🤖 **AI menganalisis** foto dan mengenali makanan
3. 📊 **Auto-calculate kalori** untuk setiap makanan
4. 💬 **Tampilkan hasil** di chat

---

## 🔧 **Setup Instructions**

### **Step 1: Get OpenAI API Key**

1. **Buka** [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. **Login** atau buat akun baru
3. **Klik** "Create new secret key"
4. **Copy** API key (mulai dengan `sk-...`)
5. **Simpan** di tempat aman (tidak bisa dilihat lagi!)

### **Step 2: Add API Key to .env**

Buka file `.env` di root project dan tambahkan:

```env
DATABASE_URL="postgresql://dietcoach_user:dietcoach_pass@localhost:5432/dietcoach?schema=public"
OPENAI_API_KEY="sk-your-api-key-here"
```

⚠️ **PENTING:** Ganti `sk-your-api-key-here` dengan API key Anda yang sebenarnya!

### **Step 3: Restart Development Server**

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

---

## 💰 **Biaya OpenAI API**

### **Model: gpt-4o-mini (Vision)**
- **Input:** $0.15 per 1M tokens (~$0.000015 per image)
- **Output:** $0.60 per 1M tokens

### **Estimasi Biaya:**
- 1 foto makanan ≈ **$0.001 - $0.002** (1-2 sen USD)
- 100 foto ≈ **$0.10 - $0.20** (10-20 sen USD)
- 1000 foto ≈ **$1 - $2** (1-2 dollar USD)

💡 **Tip:** OpenAI memberikan **$5 free credit** untuk akun baru!

---

## 🎨 **Cara Menggunakan**

### **1. Upload Foto Makanan**

1. Buka halaman chat: `http://localhost:3000/chat`
2. Klik **icon camera** 📷 di input area
3. Pilih foto makanan dari device Anda
4. Tunggu AI menganalisis (5-10 detik)

### **2. Lihat Hasil Analisis**

Bot akan memberikan response seperti:

```
Saya menemukan:

Nasi goreng (1 piring) ≈ 550 kcal
Telur mata sapi (1 butir) ≈ 90 kcal
Kerupuk (5 keping) ≈ 80 kcal

Total: 720 kcal
Sisa kalori hari ini: 1280 kcal
```

---

## 📸 **Tips untuk Foto yang Baik**

### ✅ **DO:**
- Foto dari atas (bird's eye view)
- Pencahayaan yang cukup
- Fokus pada makanan
- Satu piring/porsi per foto
- Background yang bersih

### ❌ **DON'T:**
- Foto blur atau gelap
- Terlalu jauh atau terlalu dekat
- Banyak makanan berbeda dalam 1 foto
- Background yang ramai

---

## 🔍 **Troubleshooting**

### **Error: "OpenAI API key not configured"**
**Solusi:**
1. Pastikan file `.env` ada di root project
2. Pastikan ada baris: `OPENAI_API_KEY="sk-..."`
3. Restart development server

### **Error: "Invalid API key"**
**Solusi:**
1. Cek API key di [OpenAI Dashboard](https://platform.openai.com/api-keys)
2. Pastikan API key masih aktif
3. Pastikan tidak ada spasi di awal/akhir key

### **Error: "Insufficient quota"**
**Solusi:**
1. Cek usage di [OpenAI Usage](https://platform.openai.com/usage)
2. Top up balance jika sudah habis
3. Atau gunakan mock detection (text input) sementara

### **AI tidak bisa mengenali makanan**
**Solusi:**
1. Coba foto dengan pencahayaan lebih baik
2. Foto lebih dekat ke makanan
3. Atau sebutkan nama makanan secara manual di chat

---

## 🧪 **Testing**

### **Test 1: Upload Foto Nasi Goreng**
1. Ambil foto nasi goreng
2. Upload via camera button
3. Cek apakah AI mengenali "nasi goreng"
4. Cek estimasi kalori (seharusnya ~500-600 kcal)

### **Test 2: Upload Foto Multiple Foods**
1. Foto piring dengan nasi + ayam + sayur
2. Upload
3. Cek apakah AI mengenali semua makanan
4. Cek total kalori

### **Test 3: Upload Foto Blur**
1. Upload foto yang blur/gelap
2. Cek response AI
3. Seharusnya ada warning "confidence: low"

---

## 🚀 **Advanced Features (Future)**

### **1. Save Food Log to Database**
```typescript
// TODO: Save to FoodLog table
await prisma.foodLog.create({
  data: {
    userId: user.id,
    foods: result.foods,
    totalCalories: result.totalCalories,
    imageUrl: uploadedImageUrl,
    timestamp: new Date(),
  }
});
```

### **2. Nutrition Breakdown**
```typescript
// TODO: Get detailed nutrition
{
  "protein": 25,
  "carbs": 60,
  "fat": 15,
  "fiber": 5
}
```

### **3. Meal Recommendations**
```typescript
// TODO: AI suggests better alternatives
"Tip: Ganti nasi putih dengan nasi merah untuk lebih sehat!"
```

---

## 📊 **API Response Format**

```json
{
  "foods": [
    {
      "name": "Nasi goreng",
      "portion": "1 piring",
      "calories": 550
    },
    {
      "name": "Telur mata sapi",
      "portion": "1 butir",
      "calories": 90
    }
  ],
  "totalCalories": 640,
  "confidence": "high"
}
```

---

## 🔐 **Security Notes**

⚠️ **JANGAN:**
- Commit `.env` file ke Git
- Share API key di public
- Hardcode API key di code

✅ **LAKUKAN:**
- Simpan API key di `.env`
- Add `.env` ke `.gitignore`
- Rotate API key secara berkala

---

## 📚 **Resources**

- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)
- [OpenAI Pricing](https://openai.com/pricing)
- [Best Practices](https://platform.openai.com/docs/guides/production-best-practices)

---

**Status:** ✅ Ready to use (after adding API key)
**Version:** 2.0.0
**Updated:** 2025-11-21
