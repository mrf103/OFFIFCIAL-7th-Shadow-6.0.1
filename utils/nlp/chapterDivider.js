/**
 * Chapter Divider - تقسيم ذكي للفصول
 * تقسيم النص إلى 2-13 فصل بناءً على الوحدة الموضوعية
 */

import { paragraphSplit, wordCount } from './arabicTokenizer.js';
import { extractChapters } from './patternExtractor.js';

export function smartDivideChapters(text, options = {}) {
  const {
    minChapters = 2,
    maxChapters = 13,
    targetWordsPerChapter = 6000,
    preserveExisting = true
  } = options;
  
  // 1. تحقق من وجود فصول موجودة
  const existingChapters = extractChapters(text);
  if (preserveExisting && existingChapters.length >= minChapters && existingChapters.length <= maxChapters) {
    return {
      method: 'existing',
      chapters: existingChapters.map((ch, idx) => ({
        number: idx + 1,
        title: ch.text,
        startLine: ch.line,
        startPos: ch.position,
        existing: true
      }))
    };
  }
  
  // 2. حساب عدد الفصول المثالي
  const totalWords = wordCount(text);
  const estimatedChapters = Math.round(totalWords / targetWordsPerChapter);
  const finalChapterCount = Math.max(minChapters, Math.min(maxChapters, estimatedChapters));
  
  // 3. تقسيم إلى فقرات
  const paragraphs = paragraphSplit(text);
  const targetWordsPerChapterActual = Math.floor(totalWords / finalChapterCount);
  
  // 4. خوارزمية التقسيم الذكي
  const chapters = [];
  let currentChapter = {
    paragraphs: [],
    words: 0,
    startIdx: 0
  };
  
  paragraphs.forEach((para, idx) => {
    const paraWords = wordCount(para);
    
    // شروط إنشاء فصل جديد:
    // 1. وصلنا للحد المستهدف
    // 2. الفقرة التالية تبدأ بنقطة انقطاع طبيعية
    const shouldSplit = 
      currentChapter.words >= targetWordsPerChapterActual * 0.8 && // 80% من الهدف
      chapters.length < finalChapterCount - 1 && // ليس الفصل الأخير
      (isNaturalBreakPoint(para) || currentChapter.words + paraWords > targetWordsPerChapterActual * 1.3);
    
    if (shouldSplit && currentChapter.paragraphs.length > 0) {
      // حفظ الفصل الحالي
      chapters.push({
        number: chapters.length + 1,
        title: generateChapterTitle(chapters.length + 1),
        startIdx: currentChapter.startIdx,
        endIdx: idx - 1,
        paragraphs: currentChapter.paragraphs.length,
        words: currentChapter.words,
        text: currentChapter.paragraphs.join('\n\n')
      });
      
      // بدء فصل جديد
      currentChapter = {
        paragraphs: [para],
        words: paraWords,
        startIdx: idx
      };
    } else {
      // إضافة للفصل الحالي
      currentChapter.paragraphs.push(para);
      currentChapter.words += paraWords;
    }
  });
  
  // إضافة الفصل الأخير
  if (currentChapter.paragraphs.length > 0) {
    chapters.push({
      number: chapters.length + 1,
      title: generateChapterTitle(chapters.length + 1),
      startIdx: currentChapter.startIdx,
      endIdx: paragraphs.length - 1,
      paragraphs: currentChapter.paragraphs.length,
      words: currentChapter.words,
      text: currentChapter.paragraphs.join('\n\n')
    });
  }
  
  // 5. تحسين التوازن (إذا كان هناك فصول غير متوازنة)
  const balanced = balanceChapters(chapters, targetWordsPerChapterActual);
  
  return {
    method: 'smart',
    totalWords,
    targetChapters: finalChapterCount,
    actualChapters: balanced.length,
    avgWordsPerChapter: Math.round(totalWords / balanced.length),
    chapters: balanced
  };
}

/**
 * تحديد نقاط الانقطاع الطبيعية
 */
function isNaturalBreakPoint(paragraph) {
  const text = paragraph.trim();
  
  // نقاط انقطاع طبيعية:
  // 1. فقرة قصيرة جداً (أقل من 20 كلمة) - قد تكون فاصل
  // 2. تبدأ بعبارات انتقالية
  // 3. تنتهي بعلامات ختام قوية
  
  const words = wordCount(text);
  if (words < 20) return true;
  
  // عبارات الانتقال
  const transitionPhrases = [
    /^في اليوم التالي/i,
    /^بعد ذلك/i,
    /^وفي صباح/i,
    /^مرت أيام/i,
    /^مرت الأيام/i,
    /^وبعد/i,
    /^ثم/i,
    /^الفصل/i,
    /^الباب/i
  ];
  
  for (const phrase of transitionPhrases) {
    if (phrase.test(text)) return true;
  }
  
  // علامات ختام
  const closingPhrases = [
    /وانتهى/i,
    /والآن/i,
    /وهكذا/i,
    /في النهاية/i,
    /أخيراً/i
  ];
  
  for (const phrase of closingPhrases) {
    if (phrase.test(text)) return true;
  }
  
  return false;
}

/**
 * توليد عنوان للفصل
 */
function generateChapterTitle(number) {
  const arabicNumbers = [
    '', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس',
    'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر',
    'الحادي عشر', 'الثاني عشر', 'الثالث عشر'
  ];
  
  if (number <= 13) {
    return `الفصل ${arabicNumbers[number]}`;
  }
  
  return `الفصل ${number}`;
}

/**
 * موازنة الفصول (دمج الفصول الصغيرة جداً)
 */
function balanceChapters(chapters, targetWords) {
  const balanced = [];
  let pending = null;
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    
    // إذا كان الفصل صغير جداً (أقل من 40% من الهدف)
    if (chapter.words < targetWords * 0.4 && i < chapters.length - 1) {
      if (pending) {
        // دمج مع الفصل المعلق
        pending.words += chapter.words;
        pending.paragraphs += chapter.paragraphs;
        pending.endIdx = chapter.endIdx;
        pending.text += '\n\n' + chapter.text;
      } else {
        pending = { ...chapter };
      }
    } else {
      if (pending) {
        // دمج الفصل المعلق مع الحالي
        chapter.words += pending.words;
        chapter.paragraphs += pending.paragraphs;
        chapter.startIdx = pending.startIdx;
        chapter.text = pending.text + '\n\n' + chapter.text;
        pending = null;
      }
      
      balanced.push({
        ...chapter,
        number: balanced.length + 1,
        title: generateChapterTitle(balanced.length + 1)
      });
    }
  }
  
  // إضافة أي فصل معلق متبقي
  if (pending && balanced.length > 0) {
    const last = balanced[balanced.length - 1];
    last.words += pending.words;
    last.paragraphs += pending.paragraphs;
    last.endIdx = pending.endIdx;
    last.text += '\n\n' + pending.text;
  }
  
  return balanced;
}

export default smartDivideChapters;
