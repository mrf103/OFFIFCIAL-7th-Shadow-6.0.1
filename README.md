# 📚 منصة Shadow Seven - الظل السابع | Agency in a Box

<div align="center">

![Version](https://img.shields.io/badge/version-4.0.0-blue)
![Status](https://img.shields.io/badge/status-production--ready-success)
![License](https://img.shields.io/badge/license-MIT-green)
![Tech](https://img.shields.io/badge/tech-React%20%7C%20AI%20%7C%20NLP-blueviolet)
![Tests](https://img.shields.io/badge/tests-67%20passing-brightgreen)

**منصة احترافية شاملة للنشر والتسويق مدعومة بالذكاء الاصطناعي**

[🚀 Demo](http://localhost:3001) | [📖 Documentation](#-التوثيق) | [🔧 Installation](#-التثبيت) | [🎯 Features](#-المميزات)

</div>

---

## 🎯 نظرة عامة

**Shadow Seven** هي منصة متكاملة تجمع بين النشر الاحترافي والتسويق الذكي في مكان واحد. توفر جميع الأدوات التي يحتاجها الناشرون والكتاب من رفع المخطوطات إلى النشر والتسويق.

### ⚡ القوة في الأرقام

```
394  ملف تم إنشاؤها
15K+ سطر من الكود
9    صفحات رئيسية
13   وحدة NLP
67   اختبار (passing)
85%  تغطية المميزات
```

---

## 🚀 المميزات الرئيسية

### 📝 نظام النشر المتكامل

#### 1. **رفع ومعالجة المخطوطات**
- 📤 رفع متعدد الصيغ (TXT, PDF, DOC, DOCX)
- 🔍 تحليل NLP محلي (60-70% أسرع)
- 🧹 تنظيف تلقائي (صفحات، فهارس، تكرارات)
- 📊 إحصائيات فورية ودقيقة

#### 2. **المحرر الذكي (Elite Editor)**
- ✍️ محرر نصوص احترافي
- 🤖 4 أدوات AI (تحسين، توسيع، تلخيص، إكمال)
- 💾 حفظ تلقائي (2 ثانية)
- 📈 إحصائيات مباشرة
- 👁️ وضع المعاينة

#### 3. **إدارة المخطوطات**
- 📚 عرض شبكي/قائمة
- 🔍 بحث وفلترة متقدمة
- 📊 5 بطاقات إحصائية
- 🏷️ تصنيفات حالة المخطوطات
- ⚡ عمليات CRUD سريعة

#### 4. **نظام التصدير المتكامل**
```
✓ PDF (مع TOC و RTL)
✓ EPUB (متوافق مع Kindle)
✓ DOCX (Microsoft Word)
✓ ZIP (جميع الصيغ)
✓ Agency Package (تصدير + تسويق)
```

### 🎨 أدوات التصميم والإبداع

#### 5. **مصمم الأغلفة (Cover Designer)**
- 🎨 توليد AI للأغلفة
- 6️⃣ أنماط تصميم (Modern, Classic, Minimalist...)
- 🎭 10 أنواع أدبية
- 🌈 منتقي ألوان متقدم
- 📐 6 قوالب جاهزة

#### 6. **دمج الكتب (Book Merger)**
- 📖 دمج مخطوطات متعددة
- 3️⃣ أوضاع دمج (متتابع، متداخل، مخصص)
- 🔄 إعادة ترتيب بالسحب والإفلات
- 6️⃣ خيارات دمج متقدمة
- 📊 معاينة وإحصائيات

### 🤖 نظام الذكاء الاصطناعي

#### **9 وكلاء AI متخصصون:**

**التسويق (4 وكلاء):**
1. 📱 **Marketing Agent** - استراتيجيات تسويقية
2. 🌐 **Social Media Agent** - محتوى اجتماعي
3. 🎬 **Media Script Agent** - نصوص إعلانية
4. 🎨 **Design Cover Agent** - تصميم أغلفة

**معالجة النصوص (5 وحدات NLP محلية):**
1. 🔤 **Arabic Tokenizer** - تقسيم وتطبيع
2. 🔍 **Pattern Extractor** - كشف الأنماط
3. 📑 **Content Classifier** - تصنيف المحتوى
4. 🔄 **Duplicate Detector** - كشف التكرار
5. 📖 **Chapter Divider** - تقسيم الفصول

---

## 🏗️ البنية التقنية

### Frontend Stack
```javascript
React 18.3.1        // UI Framework
Vite 5.4.21         // Build Tool
TailwindCSS         // Styling
Shadcn/ui (51)      // Components
React Router        // Navigation
Recharts            // Charts
```

### AI & NLP
```javascript
Google Gemini       // LLM
Local NLP System    // 60-70% تقليل LLM
ChunkProcessor      // معالجة 200k كلمة
CacheManager        // Memory + IndexedDB
Web Workers         // معالجة خلفية
```

### Export System
```javascript
jsPDF              // PDF Generation
epub-gen-memory    // EPUB Creation
docx               // Word Documents
JSZip              // ZIP Packaging
```

### Testing
```javascript
Vitest             // Unit Testing
Testing Library    // Component Tests
Playwright         // E2E Testing
67 Tests           // 33 Unit + 34 Integration
```

---

## 📦 التثبيت

### المتطلبات
- Node.js 18+
- npm 9+
- Git

### خطوات التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/shadow-seven.git
cd shadow-seven

# 2. تثبيت الحزم
npm install

# 3. إعداد المتغيرات البيئية
cp .env.example .env
# للتطوير المحلي يفضل استخدام:
# cp .env.local.example .env.local
# ثم عدل القيم وأضف مفاتيحك

# 4. تشغيل Development Server
npm run dev

# 5. فتح المتصفح
# http://localhost:3001
```

### المتغيرات البيئية المطلوبة

```bash
# Supabase (مطلوب للإنتاج وللتخزين)
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Google Gemini AI
VITE_GOOGLE_AI_API_KEY=your-google-ai-api-key

# API Base (اختياري إذا كنت تستخدم خادم خارجي)
VITE_API_BASE_URL=https://api.shadowseven.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# Railway (أمر مفيد لضبط المتغيرات على البيئة المستضافة)
# railway variables set \
#   VITE_SUPABASE_URL=... \
#   VITE_SUPABASE_ANON_KEY=... \
#   VITE_GOOGLE_AI_API_KEY=... 
```

---

## 🧪 الاختبارات

### تشغيل الاختبارات

```bash
# جميع الاختبارات
npm test

# مع واجهة UI
npm run test:ui

# تغطية الكود
npm run test:coverage

# اختبارات E2E
npx playwright test

## 📚 التوثيق الكامل

### الأدلة المتوفرة

| الدليل | الوصف | الرابط |
|--------|-------|-------|
| 📘 **دليل المستخدم** | شرح شامل لجميع المميزات | [USER_GUIDE.md](./USER_GUIDE.md) |
| 📚 **API Documentation** | توثيق API الكامل | [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) |
| 🧠 **NLP System Guide** | دليل نظام NLP | [NLP_SYSTEM_GUIDE.md](./NLP_SYSTEM_GUIDE.md) |
| 📊 **Project Status** | حالة المشروع | [PROJECT_STATUS.md](./PROJECT_STATUS.md) |
| 🚀 **Upgrade Plan** | خطة الترقية | [UPGRADE_PLAN.md](./UPGRADE_PLAN.md) |

---

## 🎮 الاستخدام

### البدء السريع

```javascript
// 1. رفع مخطوطة
import { analyzeAndCleanText } from '@/Components/upload/TextAnalyzerEnhanced';

const result = await analyzeAndCleanText(text, 'ar', {
  start: (name) => console.log(`بدأ: ${name}`),
  progress: (name, data) => console.log(`تقدم: ${name}`),
  complete: (name) => console.log(`اكتمل: ${name}`)
});

// 2. النتائج
console.log('📝 النص:', result.cleaned_text);
console.log('📊 إحصائيات:', result.statistics);
console.log('📖 الفصول:', result.chapters);
console.log('✨ الجودة:', result.quality);
```

### استخدام AI Agents

```javascript
import { SpecializedAgents } from '@/utils/SpecializedAgents';

// Marketing Agent
const marketing = await SpecializedAgents.generateMarketing({
  title: 'عنوان الكتاب',
  genre: 'رواية',
  description: 'وصف مختصر'
});

// Cover Designer
const cover = await SpecializedAgents.designCover({
  title: 'عنوان الكتاب',
  style: 'modern',
  colors: ['#1a1a1a', '#ffffff']
});
```

### التصدير

```javascript
import { ExportModule } from '@/utils/export/ExportModule';

// PDF Export
await ExportModule.exportPDF(manuscript, {
  includeTableOfContents: true,
  rtl: true
});

// EPUB Export
await ExportModule.exportEPUB(manuscript, {
  coverImage: coverUrl,
  metadata: { author, publisher }
});

// Agency Package
await ExportModule.createAgencyPackage(manuscript, {
  formats: ['pdf', 'epub', 'docx'],
  marketing: true
});
```

---

## 🏭 البناء والنشر

### البناء للإنتاج

```bash
# بناء المشروع
npm run build

# تحليل الحزمة
npm run analyze

# معاينة Production
npm run preview
```

### إحصائيات البناء

```
Build Time:    20.13s
Total Bundle:  ~1.4 MB
Chunks:        25 files
Compression:   Gzip
Tree Shaking:  ✅ Enabled
```

### النشر

**🚀 SSH Deployment to VPS (Recommended for mrf103.com):**
```bash
# One-time server setup
scp scripts/server-setup.sh root@45.224.225.96:/tmp/
ssh root@45.224.225.96 'bash /tmp/server-setup.sh'

# Deploy to subdomain with Cloudflare
./scripts/deploy-to-server.sh app.mrf103.com
```

See [QUICKSTART.md](./QUICKSTART.md) for 15-minute deployment guide.

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Docker:**
```bash
docker build -t shadow-seven .
docker run -p 3001:3001 shadow-seven
```

**Railway:**
See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

---

## 🌐 Deployment Guides

Complete deployment documentation available:

| Guide | Description | When to Use |
|-------|-------------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | ⭐ Quick 15-min deployment | First deployment to mrf103.com |
| [DEPLOYMENT_MRF103.md](./DEPLOYMENT_MRF103.md) | Complete guide for mrf103.com | Detailed deployment steps |
| [SSH_DEPLOYMENT_GUIDE.md](./SSH_DEPLOYMENT_GUIDE.md) | Generic SSH deployment | Deploy to any VPS |
| [CLOUDFLARE_GUIDE.md](./CLOUDFLARE_GUIDE.md) | Cloudflare configuration | DNS, SSL, security setup |
| [DEPLOYMENT_CHECKLIST_MRF103.md](./DEPLOYMENT_CHECKLIST_MRF103.md) | Deployment checklist | Print and check off items |
| [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) | Overview of all guides | Start here for orientation |

---

## 🤝 المساهمة

نرحب بالمساهمات! يرجى اتباع الخطوات التالية:

1. **Fork** المشروع
2. إنشاء **branch** جديد (`git checkout -b feature/amazing-feature`)
3. **Commit** التغييرات (`git commit -m 'Add amazing feature'`)
4. **Push** إلى Branch (`git push origin feature/amazing-feature`)
5. فتح **Pull Request**

### قواعد المساهمة

- اكتب **اختبارات** للميزات الجديدة
- اتبع **ESLint** و **Prettier** rules
- اكتب **توثيق** واضح
- استخدم **Conventional Commits**

---

## 🐛 الإبلاغ عن المشاكل

وجدت مشكلة؟ [افتح Issue](https://github.com/your-username/shadow-seven/issues)

يرجى تضمين:
- وصف المشكلة
- خطوات إعادة الإنتاج
- السلوك المتوقع
- Screenshots (إن أمكن)
- بيئة التشغيل (OS, Browser, Node version)

---

## 📊 الإحصائيات

```
⭐ Stars:        [Your stars]
🍴 Forks:        [Your forks]
🐛 Issues:       [Open issues]
📈 Contributors: [Contributors]
📝 Commits:      100+
📦 Releases:     v4.0.0
```

---

## 📜 الترخيص

هذا المشروع مرخص تحت **MIT License** - انظر ملف [LICENSE](LICENSE) للتفاصيل.

```
MIT License

Copyright (c) 2026 Shadow Seven Team

Permission is hereby granted, free of charge...
```

---

## 🙏 شكر وتقدير

### التقنيات المستخدمة

- [React](https://react.dev) - UI Framework
- [Vite](https://vitejs.dev) - Build Tool
- [TailwindCSS](https://tailwindcss.com) - CSS Framework
- [Shadcn/ui](https://ui.shadcn.com) - Component Library
- [Google Gemini](https://ai.google.dev) - AI Model
- [Vitest](https://vitest.dev) - Testing Framework
- [Playwright](https://playwright.dev) - E2E Testing

### المساهمون

شكراً لكل من ساهم في هذا المشروع! 💪

---

## 📞 الاتصال

- **الموقع:** [shadow-seven.com](#)
- **البريد:** [support@shadow-seven.com](mailto:support@shadow-seven.com)
- **Twitter:** [@ShadowSeven](#)
- **Discord:** [انضم للمجتمع](#)

---

<div align="center">

**صُنع بـ ❤️ بواسطة Shadow Seven Team**

[⬆ العودة للأعلى](#-منصة-shadow-seven---الظل-السابع--agency-in-a-box)

</div>

console.log('النص النهائي:', results.finalText);
console.log('Metadata:', results.metadata);
```

---

## 📊 الأداء

| العملية | الطريقة القديمة | الطريقة الجديدة | التحسين |
|---------|-----------------|-----------------|---------|
| استخراج الفصول | 10s (LLM) | 0.1s (Local) | **100x** |
| كشف الصفحات | 5s (LLM) | 0.05s (Regex) | **100x** |
| كشف التكرار | 8s (LLM) | 0.2s (Hash) | **40x** |
| تصنيف المحتوى | 5s (LLM) | 0.1s (Keywords) | **50x** |
| **إجمالي LLM** | **100%** | **30-40%** | **-60-70%** |

---

## 🧪 الاختبارات

```bash
# All tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Production tests
npm run test:production

# With coverage
npm run test:coverage
```

---

## 🚂 النشر على Railway

### الطريقة السريعة

```bash
# 1. ربط المشروع بـ Railway
railway login
railway link

# 2. إضافة المتغيرات البيئية
# انسخ من .env.railway إلى Railway Dashboard

# 3. النشر
git push origin main  # Auto-deploy enabled
```

### الطريقة المحلية

```bash
# Deploy from CLI
railway up
```

راجع [دليل النشر الكامل](./RAILWAY_DEPLOYMENT.md)

---

---

## 🔗 روابط مفيدة

- **الموقع:** [http://localhost:3001](http://localhost:3001)
- **GitHub:** [mrf103/shadow-seven](https://github.com/mrf103/777777777777777777777777777777)
- **الدعم:** [افتح Issue](https://github.com/mrf103/777777777777777777777777777777/issues)

---



---

## 📜 الترخيص

هذا المشروع مرخص تحت **MIT License**.

---

<div align="center">

**صُنع بـ ❤️ بواسطة Shadow Seven Team**

[⬆ العودة للأعلى](#-منصة-shadow-seven---الظل-السابع--agency-in-a-box)

</div>
