/**
 * Pattern Extractor
 * استخراج الأنماط والبنية من النصوص العربية
 */

// الأنماط العربية للبحث
export const ARABIC_PATTERNS = {
  // أنماط الفصول
  chapter: [
    /(?:الفصل|الباب|القسم)\s+(?:الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|الثامن|التاسع|العاشر|الحادي عشر|الثاني عشر)/gi,
    /(?:الفصل|الباب|القسم)\s+(\d+)/gi,
    /Chapter\s+(\d+|[IVXLC]+)/gi,
    /الجزء\s+(?:الأول|الثاني|الثالث|\d+)/gi
  ],
  
  // أنماط الصفحات
  page: [
    /(?:ص|صفحة|صفحه|page)\s*\.?\s*(\d+)/gi,
    /\[(\d+)\]/g,
    /^(\d+)$/gm  // أرقام منفردة في سطر
  ],
  
  // أنماط الترقيم
  numbering: [
    /^\d+\.\d+(?:\.\d+)?/gm,  // 1.2.3
    /^[أ-ي]\)/gm,              // أ) ب) ج)
    /^[-•●]\s/gm               // قوائم
  ],
  
  // أنماط الفهرس
  toc: /(?:فهرس|محتويات|المحتويات|جدول المحتويات|table of contents)/gi,
  
  // أنماط العناوين
  header: /^#{1,6}\s+.+$/gm,
  
  // أنماط الاقتباسات
  quote: /^>\s+.+$/gm,
  
  // أنماط الكود البرمجي
  code: /```[\s\S]*?```|`[^`]+`/g
};

// الأرقام العربية
export const ARABIC_NUMBERS = {
  'الأول': 1, 'الثاني': 2, 'الثالث': 3, 'الرابع': 4, 'الخامس': 5,
  'السادس': 6, 'السابع': 7, 'الثامن': 8, 'التاسع': 9, 'العاشر': 10,
  'الحادي عشر': 11, 'الثاني عشر': 12, 'الثالث عشر': 13
};

// استخراج أرقام الفصول
export function extractChapters(text) {
  const chapters = [];
  
  ARABIC_PATTERNS.chapter.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      const fullText = match[0];
      const numberText = match[1] || fullText;
      
      chapters.push({
        type: 'chapter',
        number: parseArabicNumber(numberText),
        position: match.index,
        text: fullText,
        line: text.substring(0, match.index).split('\n').length
      });
    }
  });
  
  return chapters.sort((a, b) => a.position - b.position);
}

// استخراج أرقام الصفحات
export function extractPageNumbers(text) {
  const pages = [];
  
  ARABIC_PATTERNS.page.forEach(pattern => {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);
    
    while ((match = regex.exec(text)) !== null) {
      const pageNum = parseInt(match[1] || match[0]);
      
      if (pageNum && pageNum < 10000) { // تصفية الأرقام غير المنطقية
        pages.push({
          type: 'page',
          number: pageNum,
          position: match.index,
          text: match[0],
          line: text.substring(0, match.index).split('\n').length
        });
      }
    }
  });
  
  return pages.sort((a, b) => a.number - b.number);
}

// استخراج الفهرس
export function extractTableOfContents(text) {
  const tocMatch = text.match(ARABIC_PATTERNS.toc);
  
  if (!tocMatch) return null;
  
  const tocStart = tocMatch.index;
  const lines = text.substring(tocStart).split('\n');
  const toc = [];
  
  for (let i = 1; i < Math.min(lines.length, 50); i++) {
    const line = lines[i].trim();
    
    // توقف عند أول سطر لا يبدو كجزء من الفهرس
    if (line.length > 100 || (i > 20 && !/\d+/.test(line))) {
      break;
    }
    
    // "الفصل الأول .................. 5"
    const match = line.match(/^(.+?)\s*[.…]+\s*(\d+)$/);
    
    if (match) {
      toc.push({
        title: match[1].trim(),
        page: parseInt(match[2]),
        level: getIndentLevel(line)
      });
    }
  }
  
  return toc.length > 0 ? toc : null;
}

// استخراج بنية الوثيقة
export function extractDocumentStructure(text) {
  const lines = text.split('\n');
  const structure = {
    headers: [],
    paragraphs: [],
    lists: [],
    quotes: [],
    codeBlocks: []
  };
  
  let inCodeBlock = false;
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Code blocks
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    
    if (inCodeBlock) {
      structure.codeBlocks.push({ line: index, text: line });
      return;
    }
    
    // Headers
    if (/^#+\s/.test(trimmed)) {
      const level = trimmed.match(/^#+/)[0].length;
      structure.headers.push({
        line: index,
        text: trimmed.replace(/^#+\s*/, ''),
        level: level
      });
    }
    // Headers (alternative style) - نص بمفرده على سطر
    else if (trimmed.length > 5 && trimmed.length < 80 && 
             /^[A-Z\u0600-\u06FF]/.test(trimmed) &&
             !/[.،؟!]$/.test(trimmed)) {
      structure.headers.push({
        line: index,
        text: trimmed,
        level: 0,
        alternative: true
      });
    }
    
    // Lists
    if (/^[-*•●]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      structure.lists.push({ line: index, text: trimmed });
    }
    
    // Quotes
    if (/^>\s/.test(trimmed) || /^["«"]/.test(trimmed)) {
      structure.quotes.push({ line: index, text: trimmed });
    }
    
    // Paragraphs
    if (trimmed.length > 50) {
      structure.paragraphs.push({
        line: index,
        text: trimmed,
        words: trimmed.split(/\s+/).length
      });
    }
  });
  
  return structure;
}

// تحليل سريع للنص
export function quickAnalyze(text) {
  return {
    chapters: extractChapters(text),
    pages: extractPageNumbers(text),
    toc: extractTableOfContents(text),
    structure: extractDocumentStructure(text),
    hasChapters: extractChapters(text).length > 0,
    hasPageNumbers: extractPageNumbers(text).length > 0,
    hasTOC: extractTableOfContents(text) !== null
  };
}

// مساعدات
function parseArabicNumber(text) {
  // إذا كان رقماً
  const num = parseInt(text);
  if (!isNaN(num)) return num;
  
  // إذا كان نصاً عربياً
  return ARABIC_NUMBERS[text] || 0;
}

function getIndentLevel(line) {
  const spaces = line.match(/^\s*/)[0].length;
  return Math.floor(spaces / 2);
}

export default {
  ARABIC_PATTERNS,
  ARABIC_NUMBERS,
  extractChapters,
  extractPageNumbers,
  extractTableOfContents,
  extractDocumentStructure,
  quickAnalyze
};
