# 📚 API Documentation - Shadow Seven

**Version:** 4.0.0  
**Last Updated:** January 19, 2026

---

## 📋 جدول المحتويات

1. [نظرة عامة](#-نظرة-عامة)
2. [Authentication](#-authentication)
3. [NLP APIs](#-nlp-apis)
4. [Export APIs](#-export-apis)
5. [AI Agents APIs](#-ai-agents-apis)
6. [Manuscript APIs](#-manuscript-apis)
7. [Utilities APIs](#-utilities-apis)
8. [Error Handling](#-error-handling)

---

## 🎯 نظرة عامة

Shadow Seven توفر مجموعة شاملة من APIs لمعالجة النصوص والتصدير والذكاء الاصطناعي.

### Base Configuration

```javascript
// vite.config.js
export default {
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/Components',
      '@pages': '/src/Pages',
      '@utils': '/src/utils',
      '@api': '/src/api',
      '@hooks': '/src/hooks'
    }
  }
}
```

---

## 🔐 Authentication

### Supabase Client

**Location:** `src/api/supabaseClient.js`

```javascript
import { supabase } from '@/api/supabaseClient';

// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign Out
const { error } = await supabase.auth.signOut();

// Get Current User
const { data: { user } } = await supabase.auth.getUser();
```

### AuthContext

**Location:** `src/contexts/AuthContext.jsx`

```javascript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signOut, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signIn(email, password)}>Sign In</button>
      )}
    </div>
  );
}
```

**Methods:**
- `signIn(email, password)` - تسجيل الدخول
- `signUp(email, password)` - إنشاء حساب
- `signOut()` - تسجيل الخروج
- `user` - بيانات المستخدم الحالي
- `loading` - حالة التحميل

---

## 🧠 NLP APIs

### 1. Text Analyzer Enhanced

**Location:** `src/Components/upload/TextAnalyzerEnhanced.js`

#### analyzeAndCleanText()

معالجة شاملة للنصوص مع تقليل 60-70% من استخدام LLM.

```javascript
import { analyzeAndCleanText } from '@/Components/upload/TextAnalyzerEnhanced';

const result = await analyzeAndCleanText(
  text,              // النص الأصلي
  language,          // 'ar' | 'en'
  callbacks          // Object with start, progress, complete
);
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| text | string | ✅ | النص المراد معالجته |
| language | string | ✅ | لغة النص ('ar' or 'en') |
| callbacks | object | ❌ | دوال callback للتقدم |

**Callbacks Structure:**

```javascript
{
  start: (stageName) => void,      // عند بدء مرحلة
  progress: (stageName, data) => void,  // أثناء التقدم
  complete: (stageName) => void     // عند اكتمال مرحلة
}
```

**Return Value:**

```javascript
{
  cleaned_text: string,           // النص المنظف
  statistics: {
    original_words: number,       // عدد الكلمات الأصلي
    final_words: number,          // عدد الكلمات النهائي
    original_chars: number,       // عدد الأحرف الأصلي
    final_chars: number,          // عدد الأحرف النهائي
    removed_pages: number,        // الصفحات المحذوفة
    removed_toc: boolean,         // هل تم حذف الفهرس؟
    removed_duplicates: number,   // التكرارات المحذوفة
    chapters_detected: number,    // الفصول المكتشفة
    processing_time: number       // وقت المعالجة (ms)
  },
  chapters: [
    {
      title: string,              // عنوان الفصل
      content: string,            // محتوى الفصل
      wordCount: number,          // عدد الكلمات
      number: number              // رقم الفصل
    }
  ],
  quality: {
    score: number,                // 0-100
    issues: string[],             // المشاكل المكتشفة
    suggestions: string[]         // اقتراحات التحسين
  },
  metadata: {
    language: string,
    processed_at: string,
    version: string
  }
}
```

**Example:**

```javascript
const callbacks = {
  start: (stage) => console.log(`🚀 بدأ: ${stage}`),
  progress: (stage, data) => {
    console.log(`⏳ ${stage}: ${data.progress}%`);
  },
  complete: (stage) => console.log(`✅ اكتمل: ${stage}`)
};

const result = await analyzeAndCleanText(bookText, 'ar', callbacks);

console.log('📊 الإحصائيات:', result.statistics);
console.log('📖 الفصول:', result.chapters.length);
console.log('✨ الجودة:', result.quality.score);
```

---

### 2. NLP Core Modules

#### arabicTokenizer

**Location:** `src/utils/nlp/arabicTokenizer.js`

```javascript
import { tokenize, normalizeArabic } from '@/utils/nlp/arabicTokenizer';

// Tokenization
const tokens = tokenize(text);
// Returns: ['كلمة', 'أخرى', '...']

// Normalization
const normalized = normalizeArabic(text);
// يزيل التشكيل والتطبيع
```

**Methods:**

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `tokenize()` | text: string | string[] | تقسيم النص لكلمات |
| `normalizeArabic()` | text: string | string | تطبيع النص العربي |
| `removeStopwords()` | tokens: string[] | string[] | إزالة stop words |
| `stem()` | word: string | string | استخراج الجذر |

---

#### patternExtractor

**Location:** `src/utils/nlp/patternExtractor.js`

```javascript
import { 
  extractPageNumbers,
  extractTableOfContents,
  extractChapterTitles
} from '@/utils/nlp/patternExtractor';

// استخراج أرقام الصفحات
const { text: cleanText, removed } = extractPageNumbers(text);

// استخراج الفهرس
const { text: noTOC, foundTOC } = extractTableOfContents(text);

// استخراج عناوين الفصول
const chapters = extractChapterTitles(text);
```

**Methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `extractPageNumbers()` | `{text, removed}` | إزالة أرقام الصفحات |
| `extractTableOfContents()` | `{text, foundTOC}` | إزالة الفهرس |
| `extractChapterTitles()` | `ChapterInfo[]` | استخراج الفصول |
| `extractFootnotes()` | `{text, footnotes}` | استخراج الحواشي |

---

#### contentClassifier

**Location:** `src/utils/nlp/contentClassifier.js`

```javascript
import { classifyContent, detectGenre } from '@/utils/nlp/contentClassifier';

// تصنيف المحتوى
const type = classifyContent(text);
// Returns: 'رواية' | 'قصة قصيرة' | 'شعر' | 'مقال' | 'دراسة'

// كشف النوع الأدبي
const genre = detectGenre(text);
// Returns: 'خيال علمي' | 'رومانسي' | 'تاريخي' | ...
```

---

#### duplicateDetector

**Location:** `src/utils/nlp/duplicateDetector.js`

```javascript
import { detectDuplicates, removeDuplicates } from '@/utils/nlp/duplicateDetector';

// كشف التكرارات
const duplicates = detectDuplicates(text, {
  threshold: 0.8,        // 80% تشابه
  minLength: 50          // الحد الأدنى للطول
});

// إزالة التكرارات
const { text: clean, removed } = removeDuplicates(text);
```

**Options:**

```javascript
{
  threshold: number,      // 0-1 (default: 0.8)
  minLength: number,      // minimum chars (default: 50)
  method: 'shingling' | 'lcs'  // algorithm (default: 'shingling')
}
```

---

#### chapterDivider

**Location:** `src/utils/nlp/chapterDivider.js`

```javascript
import { divideIntoChapters, smartDivide } from '@/utils/nlp/chapterDivider';

// تقسيم تلقائي
const chapters = divideIntoChapters(text);

// تقسيم ذكي (2-13 فصل)
const smartChapters = smartDivide(text, {
  minChapters: 2,
  maxChapters: 13,
  targetWords: 5000
});
```

**Return Value:**

```javascript
[
  {
    number: 1,
    title: 'الفصل الأول',
    content: '...',
    wordCount: 5420,
    startIndex: 0,
    endIndex: 25000
  },
  // ...
]
```

---

### 3. ChunkProcessor

**Location:** `src/utils/ChunkProcessor.js`

معالجة نصوص كبيرة (حتى 200k كلمة) بطريقة متوازية.

```javascript
import ChunkProcessor from '@/utils/ChunkProcessor';

const processor = new ChunkProcessor({
  chunkSize: 10000,        // كلمات لكل chunk
  overlap: 500,            // overlap بين chunks
  maxConcurrent: 3         // معالجة متوازية
});

const result = await processor.process(
  largeText,
  async (chunk) => {
    // معالجة كل chunk
    return await analyzeChunk(chunk);
  },
  (progress) => {
    console.log(`Progress: ${progress}%`);
  }
);
```

**Methods:**

| Method | Parameters | Description |
|--------|-----------|-------------|
| `process()` | text, processor, onProgress | معالجة النص |
| `splitIntoChunks()` | text | تقسيم لـ chunks |
| `mergeResults()` | results | دمج النتائج |

---

### 4. CacheManager

**Location:** `src/lib/cache/CacheManager.js`

نظام تخزين مؤقت ثنائي (Memory + IndexedDB).

```javascript
import CacheManager from '@/lib/cache/CacheManager';

const cache = new CacheManager({
  namespace: 'nlp',
  ttl: 24 * 60 * 60 * 1000  // 24 hours
});

// Set
await cache.set('key', data);

// Get
const data = await cache.get('key');

// Delete
await cache.delete('key');

// Clear all
await cache.clear();
```

**Features:**
- ✅ Memory cache (سريع)
- ✅ IndexedDB cache (دائم)
- ✅ TTL support
- ✅ Auto-cleanup
- ✅ Compression

---

## 📤 Export APIs

### ExportModule

**Location:** `src/utils/export/ExportModule.js`

```javascript
import { ExportModule } from '@/utils/export/ExportModule';

// PDF Export
await ExportModule.exportPDF(manuscript, {
  includeTableOfContents: true,
  rtl: true,
  fontSize: 12,
  fontFamily: 'Arial'
});

// EPUB Export
await ExportModule.exportEPUB(manuscript, {
  coverImage: coverUrl,
  metadata: {
    author: 'المؤلف',
    publisher: 'الناشر'
  }
});

// DOCX Export
await ExportModule.exportDOCX(manuscript);

// ZIP Package
await ExportModule.exportZIP(manuscript, {
  formats: ['pdf', 'epub', 'docx'],
  includeMarketing: true
});

// Agency Package
await ExportModule.createAgencyPackage(manuscript, options);
```

---

### PDFGenerator

**Location:** `src/utils/export/PDFGenerator.js`

```javascript
import PDFGenerator from '@/utils/export/PDFGenerator';

const generator = new PDFGenerator();

const blob = await generator.generate(manuscript, {
  includeTableOfContents: true,
  rtl: true,
  fontSize: 12,
  fontFamily: 'Arial',
  pageSize: 'A4',
  margins: { top: 20, bottom: 20, left: 20, right: 20 }
});

// Download
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'book.pdf';
a.click();
```

---

### EPUBGenerator

**Location:** `src/utils/export/EPUBGenerator.js`

```javascript
import EPUBGenerator from '@/utils/export/EPUBGenerator';

const generator = new EPUBGenerator();

const blob = await generator.generate(manuscript, {
  coverImage: coverUrl,
  metadata: {
    title: 'عنوان الكتاب',
    author: 'المؤلف',
    publisher: 'الناشر',
    language: 'ar',
    isbn: '978-...'
  }
});
```

---

### DOCXGenerator

**Location:** `src/utils/export/DOCXGenerator.js`

```javascript
import DOCXGenerator from '@/utils/export/DOCXGenerator';

const generator = new DOCXGenerator();

const blob = await generator.generate(manuscript, {
  rtl: true,
  fontSize: 12,
  fontFamily: 'Arial',
  includePageNumbers: true
});
```

---

## 🤖 AI Agents APIs

### SpecializedAgents

**Location:** `src/utils/SpecializedAgents.js`

```javascript
import { SpecializedAgents } from '@/utils/SpecializedAgents';
```

---

#### 1. Marketing Agent

```javascript
const marketing = await SpecializedAgents.generateMarketing({
  title: 'عنوان الكتاب',
  genre: 'رواية',
  description: 'وصف مختصر للكتاب',
  targetAudience: 'الشباب',
  keywords: ['خيال', 'مغامرة']
});

// Returns:
{
  strategy: string,           // استراتيجية تسويقية
  tagline: string,           // شعار جذاب
  description: string,       // وصف تسويقي
  targetAudience: string[],  // الجمهور المستهدف
  channels: string[],        // قنوات التسويق
  timeline: object          // جدول زمني
}
```

---

#### 2. Social Media Agent

```javascript
const social = await SpecializedAgents.generateSocialMedia({
  title: 'عنوان الكتاب',
  genre: 'رواية',
  platforms: ['twitter', 'instagram', 'facebook']
});

// Returns:
{
  twitter: {
    posts: string[],         // 5 تغريدات
    hashtags: string[],      // هاشتاجات
    schedule: object         // جدول النشر
  },
  instagram: {
    captions: string[],      // 5 captions
    hashtags: string[],
    stories: string[]        // أفكار للقصص
  },
  facebook: {
    posts: string[],         // 5 منشورات
    schedule: object
  }
}
```

---

#### 3. Media Script Agent

```javascript
const script = await SpecializedAgents.generateMediaScript({
  title: 'عنوان الكتاب',
  type: 'video' | 'audio' | 'trailer',
  duration: 60,              // seconds
  style: 'dramatic' | 'informative' | 'promotional'
});

// Returns:
{
  script: string,            // النص الكامل
  scenes: [
    {
      number: 1,
      duration: 10,
      visual: string,        // وصف المشهد
      audio: string,         // النص الصوتي
      notes: string          // ملاحظات
    }
  ],
  voiceOver: string,        // النص الصوتي الكامل
  music: string[]           // اقتراحات موسيقية
}
```

---

#### 4. Design Cover Agent

```javascript
const cover = await SpecializedAgents.designCover({
  title: 'عنوان الكتاب',
  author: 'المؤلف',
  genre: 'رواية',
  style: 'modern' | 'classic' | 'minimalist' | 'artistic' | 'dramatic' | 'elegant',
  colors: {
    primary: '#1a1a1a',
    secondary: '#ffffff',
    text: '#333333'
  },
  mood: 'dark' | 'light' | 'mysterious' | 'romantic'
});

// Returns:
{
  prompt: string,           // Prompt لـ AI generation
  layout: object,           // تخطيط الغلاف
  typography: object,       // خطوط مقترحة
  colors: object,          // نظام ألوان
  elements: string[],      // عناصر التصميم
  mockup: string          // Base64 image (if generated)
}
```

---

## 📚 Manuscript APIs

### File Service

**Location:** `src/api/fileService.js`

```javascript
import fileService from '@/api/fileService';

// Upload file
const result = await fileService.uploadFile(file, userId);

// Get manuscripts
const manuscripts = await fileService.getManuscripts(userId);

// Get single manuscript
const manuscript = await fileService.getManuscript(id);

// Update manuscript
await fileService.updateManuscript(id, updates);

// Delete manuscript
await fileService.deleteManuscript(id);
```

---

### useManuscripts Hook

**Location:** `src/hooks/useManuscripts.js`

```javascript
import { useManuscripts } from '@/hooks/useManuscripts';

function MyComponent() {
  const {
    manuscripts,
    loading,
    error,
    addManuscript,
    updateManuscript,
    deleteManuscript,
    refreshManuscripts
  } = useManuscripts();

  // Use manuscripts data
}
```

---

## 🛠️ Utilities APIs

### useDebounce

```javascript
import { useDebounce } from '@/hooks/useDebounce';

function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    // سيتم استدعاؤه بعد 500ms من آخر تغيير
    performSearch(debouncedSearch);
  }, [debouncedSearch]);
}
```

---

### useLocalStorage

```javascript
import { useLocalStorage } from '@/hooks/useLocalStorage';

function MyComponent() {
  const [value, setValue] = useLocalStorage('key', defaultValue);

  // استخدامه مثل useState عادي
  // لكن مع حفظ تلقائي في localStorage
}
```

---

### useWorker

```javascript
import { useWorker } from '@/hooks/useWorker';

function MyComponent() {
  const { execute, result, loading, error } = useWorker(
    '/workers/nlpProcessor.worker.js'
  );

  const processText = async () => {
    await execute({ action: 'analyze', text: myText });
  };

  return <div>{result}</div>;
}
```

---

## ⚠️ Error Handling

### Error Types

```javascript
// NLP Errors
class NLPError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'NLPError';
    this.code = code;
  }
}

// Export Errors
class ExportError extends Error {
  constructor(message, format) {
    super(message);
    this.name = 'ExportError';
    this.format = format;
  }
}

// API Errors
class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}
```

---

### Error Handling Best Practices

```javascript
try {
  const result = await analyzeAndCleanText(text, 'ar', callbacks);
} catch (error) {
  if (error instanceof NLPError) {
    console.error('NLP Error:', error.code, error.message);
    // Handle NLP-specific error
  } else if (error instanceof ExportError) {
    console.error('Export Error:', error.format, error.message);
    // Handle export-specific error
  } else {
    console.error('Unknown Error:', error);
    // Handle unknown error
  }
}
```

---

### ErrorBoundary Component

```javascript
import ErrorBoundary from '@/Components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

---

### Toast Notifications

```javascript
import { useToast } from '@/Components/ToastProvider';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('تم الحفظ بنجاح!', 'success');
  };

  const handleError = () => {
    showToast('حدث خطأ!', 'error');
  };

  const handleWarning = () => {
    showToast('تحذير!', 'warning');
  };

  const handleInfo = () => {
    showToast('معلومة', 'info');
  };
}
```

---

## 📊 Rate Limits

| API | Rate Limit | Notes |
|-----|-----------|-------|
| Gemini AI | 60 requests/min | حسب خطة Google |
| NLP Local | Unlimited | معالجة محلية |
| Export | 10 requests/min | لمنع إساءة الاستخدام |
| Upload | 5 files/min | حد الرفع |

---

## 🔧 Configuration

### Environment Variables

```bash
# Required
VITE_GOOGLE_AI_API_KEY=your-google-ai-api-key
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional
VITE_MAX_FILE_SIZE=52428800  # 50MB default
```

---

## 📞 Support

لمزيد من المساعدة:
- 📖 [دليل المستخدم](./USER_GUIDE.md)
- 🧠 [NLP System Guide](./NLP_SYSTEM_GUIDE.md)
- 🐛 [افتح Issue](https://github.com/mrf103/777777777777777777777777777777/issues)

---

<div align="center">

**API Documentation v4.0.0**

Made with ❤️ by Shadow Seven Team

</div>
