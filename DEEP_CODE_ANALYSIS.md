# 🔍 تحليل عميق للكود - Shadow Seven

## 📋 الهيكل العام

### 1. نقطة الدخول (Entry Point)
**File: `App.jsx`**
- استخدام React Router للملاحة
- Lazy loading للصفحات الثقيلة
- ErrorBoundary + ToastProvider + CollaborationProvider

### 2. الصفحات الرئيسية (9 صفحات)
```
Dashboard          - لوحة التحكم الرئيسية
UploadPage         - رفع المخطوطات
ManuscriptsPage    - إدارة المخطوطات
EliteEditorPage    - محرر النصوص الذكي
ExportPage         - تصدير الملفات
BookMergerPage     - دمج الكتب
CoverDesignerPage  - تصميم الأغلفة
SettingsPage       - الإعدادات
AnalyticsDashboardPage - لوحة التحليلات
```

---

## 🔌 طبقة API والتكامل

### A. Supabase Integration (`api/supabaseClient.js`)

**المكونات:**
1. **Database Helpers (db)**
   - `manuscripts` - إدارة المخطوطات (CRUD)
   - `complianceRules` - قواعد الامتثال
   - `coverDesigns` - تصاميم الأغلفة
   - `processingJobs` - وظائف المعالجة

2. **Authentication (auth)**
   - `getUser()` - الحصول على المستخدم الحالي
   - `signIn()` - تسجيل الدخول
   - `signUp()` - إنشاء حساب
   - `signOut()` - تسجيل الخروج
   - `updateUser()` - تحديث بيانات المستخدم

3. **Storage (storage)**
   - `uploadFile()` - رفع الملفات
   - `deleteFile()` - حذف الملفات
   - `getPublicUrl()` - الحصول على رابط عام

### B. Google Gemini Integration (`api/geminiClient.js`)

**الفئة: `GeminiClient`**
- نماذج متعددة:
  - `gemini-1.5-flash` (الافتراضي - سريع وأرخص)
  - `gemini-1.5-pro-latest` (معقد)
  - `gemini-pro-vision` (تحليل الصور)

**الوظائف الرئيسية:**
1. `invokeLLM()` - استدعاء LLM مع رسائل متعددة
2. `generateContent()` - توليد نص مباشر
3. `streamGenerate()` - توليد مع streaming
4. `analyzeImage()` - تحليل الصور

### C. API Client (`api/index.js`)

**الكائن `api.integrations.Core`:**
- `InvokeLLM` - استدعاء النموذج
- `UploadFile` - رفع الملفات
- `ExtractDataFromUploadedFile` - استخراج البيانات

**الكائن `apiClient`:**
- CRUD للمخطوطات
- إحصائيات Dashboard
- معالجة الملفات

---

## 🧠 نظام NLP المحلي (5 وحدات)

### 1. Arabic Tokenizer (`utils/nlp/arabicTokenizer.js`)
**الوظائف:**
- `getTextStats()` - إحصائيات النص (كلمات، أسطر، فقرات)
- `wordCount()` - عد الكلمات
- `detectLanguage()` - كشف اللغة

### 2. Pattern Extractor (`utils/nlp/patternExtractor.js`)
**الوظائف:**
- `quickAnalyze()` - تحليل سريع للبنية
- `extractChapters()` - استخراج الفصول
- `extractPageNumbers()` - استخراج أرقام الصفحات
- `extractTableOfContents()` - استخراج جدول المحتويات

### 3. Content Classifier (`utils/nlp/contentClassifier.js`)
**الوظائف:**
- `classifyContent()` - تصنيف المحتوى
- `classifyParagraphs()` - تصنيف الفقرات
- `detectIrrelevant()` - كشف المحتوى غير ذي الصلة

### 4. Duplicate Detector (`utils/nlp/duplicateDetector.js`)
**الوظائف:**
- `generateDuplicateReport()` - تقرير التكرار
- `removeDuplicates()` - إزالة التكرار

### 5. Chapter Divider (`utils/nlp/chapterDivider.js`)
**الوظائف:**
- `smartDivideChapters()` - تقسيم ذكي للفصول (2-13 فصل)

---

## 📊 معالجة النصوص الكبيرة

### ChunkProcessor (`utils/ChunkProcessor.js`)
- معالجة نصوص حتى 200,000 كلمة
- تقسيم إلى chunks
- معالجة متوازية

### CacheManager (`lib/cache/CacheManager.js`)
- تخزين مؤقت في Memory
- تخزين مؤقت في IndexedDB
- إدارة الذاكرة

### Web Worker (`workers/nlpProcessor.worker.js`)
- معالجة خلفية
- عدم حجب الـ UI

---

## 🎨 المكونات (51 مكون)

### المكونات الأساسية (shadcn/ui)
- Button, Input, Card, Dialog
- Form, Select, Checkbox, Radio
- Tabs, Accordion, Dropdown
- ... و 38 مكون آخر

### المكونات المخصصة
- **Editor**: EliteEditor, EditingSuggestions, NarrativeArcChart
- **Export**: ExportOptions, ExportProgress, ExportResults, PackagePreview
- **Upload**: TextAnalyzer, FileValidator, PublishingStandards
- **Collaboration**: CollaborativeEditor
- **Layout**: Layout, ErrorBoundary, ToastProvider, LoadingSpinner

---

## 🔄 Contexts و Hooks

### Contexts
- `AuthContext` - إدارة المصادقة
- `CollaborationContext` - إدارة التعاون

### Hooks المخصصة
- `useManuscripts()` - إدارة المخطوطات
- `useDebounce()` - تأخير الإدخال
- `useLocalStorage()` - التخزين المحلي
- `useWorker()` - استخدام Web Worker
- `useTextAnalysis()` - تحليل النص
- `useChunkProcessor()` - معالجة الـ chunks

---

## 📝 المتغيرات البيئية المطلوبة

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Google Gemini
VITE_GOOGLE_AI_API_KEY=AIza...

# API (اختياري)
VITE_API_BASE_URL=https://api.example.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000
```

---

## 🧪 الاختبارات (67 اختبار)

### أنواع الاختبارات
- **Unit Tests**: 33 اختبار
- **Integration Tests**: 34 اختبار
- **E2E Tests**: Playwright

### ملفات الاختبار
- `tests/components/` - اختبارات المكونات
- `tests/hooks/` - اختبارات الـ Hooks
- `tests/pages/` - اختبارات الصفحات
- `tests/utils/` - اختبارات الـ Utils
- `e2e/` - اختبارات End-to-End

---

## 🚀 سير العمل (Workflow)

### 1. رفع المخطوطة
```
Upload → FileValidator → TextAnalyzerEnhanced
→ NLP Processing → Database → Dashboard
```

### 2. تحرير المخطوطة
```
EliteEditor → AI Suggestions → Save → Database
```

### 3. تصدير الملف
```
Manuscript → Export Options → PDF/EPUB/DOCX
→ Storage → Download
```

### 4. تصميم الغلاف
```
CoverDesigner → Gemini AI → Image Generation
→ Storage → Preview
```

---

## ⚙️ الأداء

### التحسينات المطبقة
- Lazy loading للصفحات
- Code splitting
- Caching متعدد المستويات
- NLP محلي (60-70% تقليل API)
- Web Workers للمعالجة الثقيلة
- Streaming للـ Gemini

### الأرقام
- Build time: 3.39s
- Bundle size: ~80KB (gzipped)
- استخراج الفصول: 100x أسرع
- كشف الصفحات: 100x أسرع
- إحصائيات النص: 400x أسرع

---

## 🔴 المشاكل المعروفة والحلول

### 1. عدم وجود Database Schema
**الحل المطلوب:**
```sql
-- Manuscripts table
CREATE TABLE manuscripts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT,
  content TEXT,
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Compliance Rules table
CREATE TABLE compliance_rules (
  id UUID PRIMARY KEY,
  name TEXT,
  rule TEXT,
  created_at TIMESTAMP
);

-- Cover Designs table
CREATE TABLE cover_designs (
  id UUID PRIMARY KEY,
  manuscript_id UUID REFERENCES manuscripts,
  design_data JSONB,
  created_at TIMESTAMP
);

-- Processing Jobs table
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY,
  manuscript_id UUID REFERENCES manuscripts,
  status TEXT,
  progress FLOAT,
  created_at TIMESTAMP
);
```

### 2. عدم وجود AI Agents
**الوكلاء المطلوبة:**
- Marketing Agent
- Social Media Agent
- Media Script Agent
- Cover Design Agent

### 3. عدم وجود Export Functions
**الوظائف المطلوبة:**
- PDF Export (مع TOC و RTL)
- EPUB Export
- DOCX Export
- ZIP Export

---

## 📈 الخطوات التالية

### الأولوية 1 (حرجة):
1. [ ] إنشاء Database Schema في Supabase
2. [ ] اختبار الاتصال بـ Supabase
3. [ ] تطوير Authentication UI
4. [ ] اختبار Google Gemini Integration

### الأولوية 2 (مهمة):
1. [ ] تطوير Export Functions
2. [ ] تطوير AI Agents
3. [ ] إضافة المزيد من الاختبارات

### الأولوية 3 (عادية):
1. [ ] تحسينات الأداء
2. [ ] تحسينات الـ UI/UX
3. [ ] ميزات متقدمة

