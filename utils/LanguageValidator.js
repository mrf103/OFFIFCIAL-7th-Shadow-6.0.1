/**
 * LanguageValidator - التحقق الصارم من سلامة اللغة
 * 
 * يضمن عدم تشويه النصوص العربية برمجياً
 * ويتحقق من التناسق اللغوي
 */

import { detectLanguage, getTextStats } from "./nlp/arabicTokenizer";

/**
 * الأحرف العربية الصحيحة (Unicode Range)
 */
const ARABIC_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_LETTERS = /[\u0621-\u064A]/g;

/**
 * أحرف Unicode المشوهة الشائعة (Mojibake)
 */
const CORRUPTED_PATTERNS = [
  /Ø£|Ù\u0088|Ø§|Ø¨|ÙŠ|Ø©|Ù\u0085|Ø¯|Ø±/g, // UTF-8 decoded as Latin-1
  /ï»\u00BF|ï»½|ï»¾/g, // BOM and replacement characters
  /â€\u009C|â€\u009D|â€\u0093/g, // Smart quotes corrupted
  /\uFFFD/g, // Replacement character
];

/**
 * معايير التناسق اللغوي
 */
const LANGUAGE_STANDARDS = {
  MIN_ARABIC_PERCENTAGE: 70, // الحد الأدنى للغة العربية في نص عربي
  MAX_MIXED_LANGUAGES: 2, // عدد اللغات المسموح بها
  MIN_TEXT_LENGTH: 100, // الحد الأدنى لطول النص للتحليل
  MAX_CORRUPTION_RATE: 0.01, // الحد الأقصى لنسبة الأحرف المشوهة (1%)
};

/**
 * كشف الأحرف المشوهة
 */
function detectCorruption(text) {
  const corruptions = [];
  
  // فحص كل pattern مشوه
  CORRUPTED_PATTERNS.forEach((pattern, index) => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      corruptions.push({
        type: `pattern_${index}`,
        count: matches.length,
        samples: matches.slice(0, 5)
      });
    }
  });
  
  // فحص أحرف خارج النطاق الصحيح
  const invalidChars = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // تخطي المسافات والأرقام والعلامات الشائعة
    if (/[\s\d.,;:!?()[\]{}\\-]/.test(char)) continue;
    
    // إذا كان الحرف عربياً
    if (ARABIC_RANGE.test(char)) {
      // تحقق من أنه ليس حرفاً معطوباً
      if (code >= 0xFFFD) { // Replacement character
        invalidChars.push({ char, code: code.toString(16), position: i });
      }
    }
  }
  
  if (invalidChars.length > 0) {
    corruptions.push({
      type: 'invalid_unicode',
      count: invalidChars.length,
      samples: invalidChars.slice(0, 5)
    });
  }
  
  const corruptionRate = text.length > 0 
    ? corruptions.reduce((sum, c) => sum + c.count, 0) / text.length
    : 0;
  
  return {
    isCorrupted: corruptionRate > LANGUAGE_STANDARDS.MAX_CORRUPTION_RATE,
    corruptionRate: (corruptionRate * 100).toFixed(3) + '%',
    corruptions,
    totalCorrupted: corruptions.reduce((sum, c) => sum + c.count, 0)
  };
}

/**
 * تحليل التناسق اللغوي
 */
function analyzeLanguageConsistency(text) {
  if (text.length < LANGUAGE_STANDARDS.MIN_TEXT_LENGTH) {
    return {
      consistent: true,
      warning: 'النص قصير جداً للتحليل الدقيق'
    };
  }
  
  // كشف اللغة السائدة
  const detectedLang = detectLanguage(text);
  
  // حساب نسبة الأحرف العربية
  const arabicChars = (text.match(ARABIC_LETTERS) || []).length;
  const totalChars = text.replace(/[\s\d.,;:!?()[\]{}\\-]/g, '').length;
  const arabicPercentage = totalChars > 0 ? (arabicChars / totalChars) * 100 : 0;
  
  // كشف خليط اللغات
  const hasEnglish = /[a-zA-Z]{3,}/.test(text);
  const hasArabic = arabicPercentage > 10;
  const languageMix = [];
  
  if (hasArabic) languageMix.push('ar');
  if (hasEnglish) languageMix.push('en');
  
  // التحقق من التناسق
  const issues = [];
  
  if (detectedLang === 'ar' && arabicPercentage < LANGUAGE_STANDARDS.MIN_ARABIC_PERCENTAGE) {
    issues.push(`نسبة العربية منخفضة (${arabicPercentage.toFixed(1)}%) في نص يُفترض أن يكون عربياً`);
  }
  
  if (languageMix.length > LANGUAGE_STANDARDS.MAX_MIXED_LANGUAGES) {
    issues.push(`خليط من ${languageMix.length} لغات: ${languageMix.join(', ')}`);
  }
  
  return {
    consistent: issues.length === 0,
    detectedLanguage: detectedLang,
    arabicPercentage: arabicPercentage.toFixed(1) + '%',
    languageMix,
    issues
  };
}

/**
 * مقارنة النص قبل وبعد المعالجة
 */
function compareTexts(originalText, processedText) {
  const originalLang = detectLanguage(originalText);
  const processedLang = detectLanguage(processedText);
  
  const originalStats = getTextStats(originalText);
  const processedStats = getTextStats(processedText);
  
  const languageChanged = originalLang !== processedLang;
  const significantChange = Math.abs(
    originalStats.arabicPercentage - processedStats.arabicPercentage
  ) > 15; // تغيير أكثر من 15%
  
  return {
    languageChanged,
    originalLanguage: originalLang,
    processedLanguage: processedLang,
    significantChange,
    originalArabicPct: originalStats.arabicPercentage?.toFixed(1) + '%',
    processedArabicPct: processedStats.arabicPercentage?.toFixed(1) + '%',
    valid: !languageChanged && !significantChange
  };
}

/**
 * التحقق الشامل من سلامة اللغة
 * 
 * @param {string} text - النص المراد فحصه
 * @param {string} originalText - النص الأصلي للمقارنة (اختياري)
 * @returns {Object} نتيجة التحقق
 */
export function validateLanguageIntegrity(text, originalText = null) {
  if (!text || typeof text !== 'string') {
    throw new Error('النص المدخل غير صالح');
  }
  
  // 1. كشف التشويه
  const corruptionCheck = detectCorruption(text);
  
  // 2. تحليل التناسق
  const consistencyCheck = analyzeLanguageConsistency(text);
  
  // 3. المقارنة مع الأصل (إذا وُجد)
  let comparisonCheck = null;
  if (originalText) {
    comparisonCheck = compareTexts(originalText, text);
  }
  
  // التقييم الشامل
  const issues = [];
  const warnings = [];
  
  if (corruptionCheck.isCorrupted) {
    issues.push(`النص يحتوي على أحرف مشوهة (${corruptionCheck.corruptionRate})`);
  }
  
  if (!consistencyCheck.consistent) {
    issues.push(...consistencyCheck.issues);
  }
  
  if (comparisonCheck && !comparisonCheck.valid) {
    if (comparisonCheck.languageChanged) {
      issues.push(`تغيرت اللغة من ${comparisonCheck.originalLanguage} إلى ${comparisonCheck.processedLanguage}`);
    }
    if (comparisonCheck.significantChange) {
      warnings.push(`تغير كبير في نسبة العربية: ${comparisonCheck.originalArabicPct} → ${comparisonCheck.processedArabicPct}`);
    }
  }
  
  const passed = issues.length === 0;
  
  return {
    passed,
    valid: passed, // alias
    issues,
    warnings,
    corruption: corruptionCheck,
    consistency: consistencyCheck,
    comparison: comparisonCheck,
    score: calculateLanguageScore(corruptionCheck, consistencyCheck, comparisonCheck)
  };
}

/**
 * حساب درجة سلامة اللغة
 */
function calculateLanguageScore(corruption, consistency, comparison) {
  let score = 100;
  
  // خصم على التشويه
  if (corruption.isCorrupted) {
    score -= Math.min(30, corruption.totalCorrupted * 5);
  }
  
  // خصم على عدم التناسق
  if (!consistency.consistent) {
    score -= consistency.issues.length * 10;
  }
  
  // خصم على التغيير
  if (comparison && !comparison.valid) {
    if (comparison.languageChanged) score -= 25;
    if (comparison.significantChange) score -= 15;
  }
  
  return Math.max(0, score);
}

/**
 * محاولة إصلاح التشويه تلقائياً (تجريبي)
 */
export function attemptAutoFix(text) {
  let fixed = text;
  

  // إزالة replacement characters
  fixed = fixed.replace(/\uFFFD/g, '');
  
  // TODO: إضافة مزيد من قواعد الإصلاح
  
  return {
    fixed,
    changes: text.length - fixed.length
  };
}

/**
 * تحقق سريع (للاستخدام أثناء المعالجة)
 */
export function quickValidate(text) {
  const corruption = detectCorruption(text);
  return {
    valid: !corruption.isCorrupted,
    corrupted: corruption.isCorrupted,
    rate: corruption.corruptionRate
  };
}

export default {
  validateLanguageIntegrity,
  quickValidate,
  attemptAutoFix,
  detectCorruption,
  analyzeLanguageConsistency,
  compareTexts,
  LANGUAGE_STANDARDS
};
