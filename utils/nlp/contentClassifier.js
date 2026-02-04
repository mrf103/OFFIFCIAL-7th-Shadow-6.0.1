/**
 * Content Classifier
 * تصنيف نوع المحتوى بدون LLM (سريع ومجاني)
 */

import { tokenize, sentenceSplit } from './arabicTokenizer.js';

// أنماط للتصنيف
const PATTERNS = {
  narrative: {
    verbs: /كان|أصبح|ذهب|جاء|رأى|سمع|شعر|قرر|فكر/g,
    timeMarkers: /اليوم|غداً|أمس|حين|عندما|بعد|قبل|منذ/g,
    pronouns: /هو|هي|هم|هن|أنا|نحن/g
  },
  
  dialogue: {
    quotes: /["«»""]/g,
    verbs: /قال|قالت|أجاب|ردّ|سأل|صرخ|همس/g,
    punctuation: /[!؟?]/g
  },
  
  description: {
    adjectives: /جميل|كبير|صغير|طويل|قصير|واسع|ضيق/g,
    colors: /أحمر|أزرق|أخضر|أصفر|أبيض|أسود/g,
    sensory: /رائحة|صوت|ملمس|طعم|منظر/g
  },
  
  code: {
    keywords: /function|class|return|if|for|while|const|let|var/g,
    brackets: /[{}();]/g,
    operators: /[+\-*/%=<>!&|]/g
  },
  
  academic: {
    citations: /\[\d+\]|\(\d{4}\)/g,
    phrases: /نستنتج|نخلص|الدراسة|البحث|النتائج|الخلاصة|التحليل/g,
    formality: /بناءً على|وفقاً|حيث أن|من الواضح/g
  }
};

// حساب درجة لكل نوع
function calculateScore(text, patterns) {
  let score = 0;
  
  Object.values(patterns).forEach((pattern) => {
    const matches = (text.match(pattern) || []).length;
    score += matches;
  });
  
  return score;
}

// تصنيف النص
export function classifyContent(text) {
  const words = tokenize(text);
  const totalWords = words.length;
  
  if (totalWords === 0) {
    return { type: 'unknown', confidence: 0, scores: {} };
  }
  
  // حساب الدرجات
  const scores = {
    narrative: calculateScore(text, PATTERNS.narrative) / totalWords,
    dialogue: calculateScore(text, PATTERNS.dialogue) / totalWords,
    description: calculateScore(text, PATTERNS.description) / totalWords,
    code: calculateScore(text, PATTERNS.code) / totalWords,
    academic: calculateScore(text, PATTERNS.academic) / totalWords
  };
  
  // إيجاد أعلى درجة
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = sorted[0];
  
  return {
    type: topType,
    confidence: Math.min(topScore * 10, 1), // تحويل إلى نسبة 0-1
    scores: scores,
    features: extractFeatures(text)
  };
}

// استخراج ميزات إضافية
function extractFeatures(text) {
  const words = tokenize(text);
  const sentences = sentenceSplit(text);
  const uniqueWords = new Set(words);
  
  return {
    // Dialogue indicators
    dialogueQuotes: (text.match(/["«»""]/g) || []).length,
    dialogueVerbs: (text.match(/قال|قالت|أجاب|ردّ|سأل/g) || []).length,
    
    // Narrative indicators
    narrativeVerbs: (text.match(/كان|أصبح|ذهب|جاء|رأى/g) || []).length,
    timeMarkers: (text.match(/اليوم|غداً|أمس|حين|عندما/g) || []).length,
    
    // Code indicators
    codePatterns: (text.match(/function|class|return|if|for/g) || []).length,
    codeBrackets: (text.match(/[{}();]/g) || []).length,
    
    // Academic indicators
    citations: (text.match(/\[\d+\]|\(\d{4}\)/g) || []).length,
    academicPhrases: (text.match(/نستنتج|نخلص|الدراسة|البحث/g) || []).length,
    
    // Statistics
    avgSentenceLength: words.length / Math.max(sentences.length, 1),
    vocabularyRichness: uniqueWords.size / Math.max(words.length, 1)
  };
}

// تصنيف فقرات متعددة
export function classifyParagraphs(text) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 50);
  
  return paragraphs.map((para, index) => ({
    index,
    text: para.substring(0, 100) + '...',
    classification: classifyContent(para)
  }));
}

// كشف المحتوى غير ذي الصلة
export function detectIrrelevant(text, mainType) {
  const classification = classifyContent(text);
  
  // إذا كان نوع المحتوى مختلف جداً عن النوع الرئيسي
  if (classification.type !== mainType && classification.confidence > 0.6) {
    return {
      isIrrelevant: true,
      reason: `Content type mismatch: expected ${mainType}, got ${classification.type}`,
      confidence: classification.confidence
    };
  }
  
  // كشف الكود البرمجي في نص أدبي
  if (mainType === 'narrative' && classification.scores.code > 0.3) {
    return {
      isIrrelevant: true,
      reason: 'Code detected in narrative text',
      confidence: classification.scores.code
    };
  }
  
  return { isIrrelevant: false };
}

export default {
  classifyContent,
  classifyParagraphs,
  detectIrrelevant,
  extractFeatures
};
