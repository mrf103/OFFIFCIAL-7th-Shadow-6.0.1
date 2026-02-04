/**
 * Duplicate Detector
 * كشف المحتوى المكرر باستخدام Shingling
 */

import { tokenize } from './arabicTokenizer.js';

// Simple hash function
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}

// كشف المحتوى المكرر باستخدام Shingling
export function detectDuplicates(text, windowSize = 5) {
  const words = tokenize(text);
  const shingles = new Map(); // hash -> first position
  const duplicates = [];
  
  for (let i = 0; i <= words.length - windowSize; i++) {
    const shingle = words.slice(i, i + windowSize).join(' ');
    const hash = simpleHash(shingle);
    
    if (shingles.has(hash)) {
      duplicates.push({
        position: i,
        firstPosition: shingles.get(hash),
        text: shingle,
        hash: hash
      });
    } else {
      shingles.set(hash, i);
    }
  }
  
  // حساب نسبة التكرار
  const totalShingles = words.length - windowSize + 1;
  const uniqueShingles = shingles.size;
  const repetitionRate = (duplicates.length / Math.max(totalShingles, 1)) * 100;
  
  return {
    duplicates,
    repetitionRate,
    uniqueShingles,
    totalShingles
  };
}

// كشف الفقرات المتطابقة
export function detectDuplicateParagraphs(text) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
  const seen = new Map();
  const duplicates = [];
  
  paragraphs.forEach((para, index) => {
    const normalized = tokenize(para).slice(0, 20).join(' ');
    const hash = simpleHash(normalized);
    
    if (seen.has(hash)) {
      duplicates.push({
        index,
        duplicateOf: seen.get(hash),
        text: para.substring(0, 100) + '...'
      });
    } else {
      seen.set(hash, index);
    }
  });
  
  return duplicates;
}

// كشف الجمل المتكررة
export function detectRepeatedSentences(text, minRepetitions = 2) {
  const sentences = text.split(/[.!؟?।]+/).filter(s => s.trim().length > 10);
  const sentenceCount = new Map();
  
  sentences.forEach(sentence => {
    const normalized = tokenize(sentence).join(' ');
    const hash = simpleHash(normalized);
    
    const count = sentenceCount.get(hash) || { count: 0, text: sentence };
    count.count++;
    sentenceCount.set(hash, count);
  });
  
  const repeated = [];
  sentenceCount.forEach((value, hash) => {
    if (value.count >= minRepetitions) {
      repeated.push({
        text: value.text.substring(0, 100),
        count: value.count,
        hash
      });
    }
  });
  
  return repeated.sort((a, b) => b.count - a.count);
}

// إزالة التكرار (مع الحفاظ على المعنى)
export function removeDuplicates(text, threshold = 0.8) {
  const paragraphs = text.split(/\n\n+/);
  const seen = new Map();
  const unique = [];
  
  paragraphs.forEach(para => {
    const words = tokenize(para);
    if (words.length < 10) {
      unique.push(para);
      return;
    }
    
    // خلق بصمة للفقرة
    const fingerprint = words.slice(0, 15).join(' ');
    const hash = simpleHash(fingerprint);
    
    // تحقق من التشابه
    let isDuplicate = false;
    for (const existingFingerprint of seen.values()) {
      const similarity = calculateSimilarity(fingerprint, existingFingerprint);
      if (similarity > threshold) {
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      unique.push(para);
      seen.set(hash, fingerprint);
    }
  });
  
  return unique.join('\n\n');
}

// حساب التشابه (Jaccard)
function calculateSimilarity(text1, text2) {
  const words1 = new Set(tokenize(text1));
  const words2 = new Set(tokenize(text2));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / Math.max(union.size, 1);
}

// تقرير شامل عن التكرار
export function generateDuplicateReport(text) {
  const shingles = detectDuplicates(text);
  const paragraphs = detectDuplicateParagraphs(text);
  const sentences = detectRepeatedSentences(text);
  
  return {
    overall: {
      repetitionRate: shingles.repetitionRate,
      hasIssues: shingles.repetitionRate > 15 || paragraphs.length > 0
    },
    shingles: {
      total: shingles.totalShingles,
      unique: shingles.uniqueShingles,
      duplicates: shingles.duplicates.length,
      rate: shingles.repetitionRate
    },
    paragraphs: {
      total: text.split(/\n\n+/).length,
      duplicates: paragraphs.length,
      items: paragraphs.slice(0, 5)
    },
    sentences: {
      repeated: sentences.length,
      items: sentences.slice(0, 5)
    },
    recommendation: shingles.repetitionRate > 20 
      ? 'high_repetition' 
      : shingles.repetitionRate > 10 
      ? 'moderate_repetition'
      : 'acceptable'
  };
}

export default {
  detectDuplicates,
  detectDuplicateParagraphs,
  detectRepeatedSentences,
  removeDuplicates,
  generateDuplicateReport
};
