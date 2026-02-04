# 🚀 دليل النشر على Railway - Seyadi Publishing Platform

## نظرة عامة
هذا الدليل يشرح خطوات نشر منصة سيادي للنشر الذكي على Railway.app

---

## 📋 المتطلبات الأساسية

### 1. حساب Railway
- قم بإنشاء حساب على [Railway.app](https://railway.app)
- ربط حساب GitHub الخاص بك

### 2. المتغيرات البيئية المطلوبة
انسخ من `.env.example` وقم بتعبئة القيم:

```env
# API Configuration (Required)
VITE_API_BASE_URL=https://api.seyadi.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google AI Configuration (Required for AI features)
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key

# Feature Flags (Optional)
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_AI_SUGGESTIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NLP_CACHING=true
VITE_ENABLE_WEB_WORKERS=true
```

---

## 🚂 خطوات النشر على Railway

### الطريقة 1: النشر عبر GitHub (موصى به)

#### 1. دفع الكود إلى GitHub
```bash
git add .
git commit -m "feat: Prepare for Railway deployment"
git push origin main
```

#### 2. إنشاء مشروع جديد على Railway
1. اذهب إلى [Railway Dashboard](https://railway.app/dashboard)
2. انقر على **"New Project"**
3. اختر **"Deploy from GitHub repo"**
4. حدد repository الخاص بك
5. Railway سيكتشف تلقائياً ملفات التهيئة:
   - `nixpacks.toml`
   - `railway.json`
   - `Dockerfile`

#### 3. تكوين المتغيرات البيئية
1. في صفحة المشروع، اذهب إلى **"Variables"**
2. انقر على **"RAW Editor"**
3. الصق جميع المتغيرات من `.env.example` مع القيم الحقيقية
4. انقر على **"Update Variables"**

#### 4. إضافة Domain (اختياري)
1. في صفحة المشروع، اذهب إلى **"Settings"**
2. في قسم **"Domains"**، انقر على **"Generate Domain"**
3. أو أضف custom domain الخاص بك

#### 5. انتظر اكتمال البناء
- Railway سيبدأ تلقائياً في بناء ونشر التطبيق
- راقب السجلات في تبويب **"Deployments"**
- عند الانتهاء، سيظهر رابط التطبيق

---

### الطريقة 2: النشر عبر Railway CLI

#### 1. تثبيت Railway CLI
```bash
# macOS/Linux
curl -fsSL https://railway.app/install.sh | sh

# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# أو عبر npm
npm install -g @railway/cli
```

#### 2. تسجيل الدخول
```bash
railway login
```

#### 3. ربط المشروع
```bash
# إنشاء مشروع جديد
railway init

# أو ربط مشروع موجود
railway link
```

#### 4. إضافة المتغيرات البيئية
```bash
# إضافة متغير واحد
railway variables set VITE_API_BASE_URL=https://api.seyadi.com

# أو من ملف
railway variables set --file .env
```

#### 5. النشر
```bash
railway up
```

---

## 🔧 التكوين المتقدم

### تخصيص عملية البناء

#### استخدام Nixpacks (افتراضي)
الملف `nixpacks.toml` موجود مسبقاً ويحدد:
- Node.js 20
- أوامر التثبيت والبناء
- أمر التشغيل

#### استخدام Dockerfile
إذا أردت استخدام Docker بدلاً من Nixpacks:

1. في Railway Dashboard → Settings
2. في قسم **"Build"**
3. غير **"Builder"** من Nixpacks إلى Dockerfile

---

## 📊 المراقبة والأداء

### 1. مراقبة السجلات
```bash
# عبر CLI
railway logs

# أو في Dashboard → Deployments → View Logs
```

### 2. مراقبة الأداء
- Railway يوفر metrics تلقائية:
  - CPU Usage
  - Memory Usage
  - Network Traffic
  - Response Times

### 3. Health Checks
التطبيق يتضمن health check تلقائي على المسار `/`

---

## 🔄 التحديثات المستمرة

### Auto-Deploy من GitHub
Railway يدعم التحديث التلقائي:
1. في Settings → Service
2. فعّل **"Auto Deploy"**
3. كل push لـ `main` سيحدث deployment تلقائي

### Manual Deploy
```bash
railway up
```

---

## 🛡️ الأمان

### 1. حماية المتغيرات البيئية
- ✅ جميع المتغيرات مشفرة على Railway
- ✅ لا تُدفع `.env` إلى Git (في `.gitignore`)
- ✅ استخدم `.env.example` فقط كقالب

### 2. CORS Configuration
تأكد من تكوين CORS في Backend API:
```javascript
// مثال
allowedOrigins: [
  'https://your-railway-domain.railway.app',
  'https://your-custom-domain.com'
]
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: فشل البناء
**الحل:**
```bash
# تحقق من السجلات
railway logs --build

# تأكد من صحة package.json
npm run build  # اختبار محلي
```

### المشكلة: التطبيق لا يعمل بعد النشر
**الحل:**
1. تحقق من المتغيرات البيئية
2. راجع السجلات: `railway logs`
3. تأكد من PORT configuration (Railway يوفر $PORT تلقائياً)

### المشكلة: خطأ في Web Workers
**الحل:**
تأكد من تكوين headers صحيحة في `vite.config.js`:
```javascript
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp'
  }
}
```

---

## 📈 التوسع والأداء

### 1. تحسين الأداء
- Railway يدعم scaling تلقائي
- يمكنك ترقية الخطة للحصول على resources أكثر

### 2. Caching Strategy
التطبيق يستخدم:
- Memory Cache (5 دقائق)
- IndexedDB Cache (24 ساعة)
- Browser Cache للـ static assets

### 3. CDN Integration
يمكنك ربط CDN مثل Cloudflare:
1. أضف custom domain
2. أشر CNAME إلى Railway
3. فعّل Cloudflare proxy

---

## 📞 الدعم

### Railway Support
- [Railway Docs](https://docs.railway.app)
- [Discord Community](https://discord.gg/railway)
- [GitHub Discussions](https://github.com/railwayapp/railway/discussions)

### مشروع Seyadi
- راجع `README.md` للتوثيق الكامل
- انظر `IMPLEMENTATION_SUMMARY.md` للتفاصيل التقنية

---

## ✅ Checklist قبل النشر

- [ ] تحديث جميع المتغيرات في `.env.example`
- [ ] اختبار البناء محلياً: `npm run build`
- [ ] اختبار Preview محلياً: `npm run preview`
- [ ] تشغيل الاختبارات: `npm run test:production`
- [ ] مراجعة أمان المتغيرات البيئية
- [ ] تكوين CORS في Backend
- [ ] إضافة custom domain (اختياري)
- [ ] تفعيل Auto-Deploy
- [ ] إعداد monitoring alerts

---

## 🎉 بعد النشر

بعد نشر ناجح:
1. ✅ اختبر جميع الميزات على production
2. ✅ راقب السجلات للأخطاء
3. ✅ تحقق من الأداء
4. ✅ فعّل Analytics إذا كانت متاحة
5. ✅ شارك الرابط مع الفريق!

---

**نشر سعيد! 🚀**
