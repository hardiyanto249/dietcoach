# 🔧 Hydration Error Fix

## ❌ **Problem: React Hydration Error**

Error yang muncul:
```
A tree hydrated but some attributes of the server rendered HTML 
didn't match the client properties.
```

### **Root Cause:**
Hydration error terjadi karena ada perbedaan antara HTML yang di-render di **server** (SSR) dan HTML yang di-render di **client** (browser).

**Penyebab spesifik di aplikasi ini:**
1. ✅ `new Date()` - Waktu berbeda antara server dan client
2. ✅ `toLocaleTimeString()` - Format waktu berbeda berdasarkan timezone

---

## ✅ **Solution Applied:**

### **1. Add Mounted State**
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  // ... fetch data
}, []);

if (!mounted) {
  return null; // Prevent hydration mismatch
}
```

**Penjelasan:**
- Component tidak render apapun di server (return null)
- Hanya render di client setelah `mounted = true`
- Mencegah perbedaan antara server dan client render

### **2. Suppress Hydration Warning for Timestamps**
```typescript
<div suppressHydrationWarning>
  {msg.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}
</div>
```

**Penjelasan:**
- `suppressHydrationWarning` memberitahu React bahwa perbedaan ini OK
- Digunakan untuk konten yang memang berbeda (seperti waktu)
- React tidak akan throw error untuk elemen ini

---

## 🧪 **How to Test:**

### **Before Fix:**
1. Buka http://localhost:3000/chat
2. Buka Console (F12)
3. Lihat error: ❌ "Hydration error..."

### **After Fix:**
1. Refresh halaman (F5)
2. Buka Console (F12)
3. ✅ **No hydration errors!**

---

## 📚 **Technical Details:**

### **What is Hydration?**
Hydration adalah proses dimana React "mengaktifkan" HTML statis yang sudah di-render di server dengan menambahkan event listeners dan state management.

**Flow:**
```
1. Server renders HTML → Static HTML sent to browser
2. Browser shows HTML → User sees content immediately
3. React hydrates → Adds interactivity
```

### **When Hydration Errors Occur:**
```javascript
// ❌ BAD: Different on server vs client
export default function Component() {
  const time = new Date().toLocaleTimeString();
  return <div>{time}</div>;
}

// ✅ GOOD: Only render on client
export default function Component() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const time = new Date().toLocaleTimeString();
  return <div>{time}</div>;
}
```

---

## 🎯 **Best Practices:**

### **1. Use Client-Only Rendering for Dynamic Content**
```typescript
"use client"; // Mark as client component

const [data, setData] = useState(null);

useEffect(() => {
  // Fetch data only on client
  fetchData().then(setData);
}, []);
```

### **2. Use suppressHydrationWarning Sparingly**
```typescript
// Only for content that MUST be different
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>
```

### **3. Avoid These in SSR:**
- ❌ `Date.now()`
- ❌ `Math.random()`
- ❌ `window` or `document` (use `typeof window !== 'undefined'`)
- ❌ `localStorage` (wrap in useEffect)

### **4. Safe Alternatives:**
```typescript
// ✅ Use server-provided timestamp
const timestamp = props.serverTimestamp;

// ✅ Use static placeholder, update on client
const [time, setTime] = useState('--:--');
useEffect(() => {
  setTime(new Date().toLocaleTimeString());
}, []);
```

---

## 🔍 **Debugging Hydration Errors:**

### **Step 1: Find the Component**
Error message will show which component has the mismatch.

### **Step 2: Check for Dynamic Content**
Look for:
- Date/Time operations
- Random numbers
- Browser-only APIs
- External data without snapshots

### **Step 3: Apply Fix**
- Add mounted state
- Move to useEffect
- Use suppressHydrationWarning (last resort)

---

## ✅ **Status:**

- ✅ Hydration error: **FIXED**
- ✅ Chat page: **Working**
- ✅ Timestamps: **Displaying correctly**
- ✅ No console errors

---

## 📖 **References:**

- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration](https://react.dev/reference/react-dom/client/hydrateRoot)
- [suppressHydrationWarning](https://react.dev/reference/react-dom/components/common#common-props)

---

**Fixed:** 2025-11-21 17:38
**Version:** 1.1.1
