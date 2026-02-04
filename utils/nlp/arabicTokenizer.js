/**
 * Arabic Text Tokenizer
 * معالجة نصوص عربية محلية - سريعة ومجانية
 */

// تطبيع الأحرف العربية
export function normalizeArabic(text) {
  if (!text) return '';
  
  return text
    // توحيد الهمزات
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    // إزالة التشكيل
    .replace(/[\u064B-\u065F]/g, '')
    // إزالة الكشيدة
    .replace(/ـ/g, '')
    // توحيد المسافات
    .replace(/\s+/g, ' ')
    .trim();
}

// تقسيم النص إلى كلمات
export function tokenize(text) {
  const normalized = normalizeArabic(text);
  return normalized
    .split(/\s+/)
    .filter(word => word.length > 0);
}

// تقسيم النص إلى جمل
export function sentenceSplit(text) {
  return text
    .split(/[.!؟?।\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

// تقسيم النص إلى فقرات
export function paragraphSplit(text) {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20);
}

// حساب عدد الكلمات
export function wordCount(text) {
  return tokenize(text).length;
}

// حساب مقاييس النص
export function getTextStats(text) {
  const words = tokenize(text);
  const sentences = sentenceSplit(text);
  const paragraphs = paragraphSplit(text);
  const uniqueWords = new Set(words);
  
  return {
    words: words.length,
    sentences: sentences.length,
    paragraphs: paragraphs.length,
    uniqueWords: uniqueWords.size,
    avgWordsPerSentence: words.length / Math.max(sentences.length, 1),
    avgWordsPerParagraph: words.length / Math.max(paragraphs.length, 1),
    vocabularyRichness: uniqueWords.size / Math.max(words.length, 1)
  };
}

// كشف اللغة (عربي أم لا)
export function detectLanguage(text) {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.replace(/\s/g, '').length;
  const arabicRatio = arabicChars / Math.max(totalChars, 1);
  
  if (arabicRatio > 0.7) return 'ar';
  if (arabicRatio > 0.3) return 'mixed';
  return 'other';
}

// استخراج الكلمات المفتاحية (بسيط)
export function extractKeywords(text, topN = 10) {
  const words = tokenize(text);
  const wordFreq = {};
  
  // حذف الكلمات الشائعة
  const stopWords = new Set([
    'في', 'من', 'إلى', 'على', 'أن', 'هذا', 'هذه', 'التي', 'الذي',
    'كان', 'قد', 'لم', 'لن', 'لا', 'نعم', 'هل', 'ما', 'ماذا',
    'كل', 'بعض', 'أي', 'كيف', 'متى', 'أين', 'لماذا'
  ]);
  
  words.forEach(word => {
    if (word.length > 2 && !stopWords.has(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, freq]) => ({ word, freq }));
}

export default {
  normalizeArabic,
  tokenize,
  sentenceSplit,
  paragraphSplit,
  wordCount,
  getTextStats,
  detectLanguage,
  extractKeywords
};
