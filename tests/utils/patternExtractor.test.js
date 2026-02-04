import { describe, it, expect } from 'vitest';
import patternExtractor, {
  extractPageNumbers,
  extractChapters,
  extractTableOfContents,
  extractDocumentStructure,
  quickAnalyze
} from '@/utils/nlp/patternExtractor';

describe('Pattern Extractor', () => {
  it('يجب أن يكتشف أرقام الصفحات', () => {
    const text = 'نص الصفحة\nصفحة 25\nمحتوى النص';
    const result = extractPageNumbers(text);

    expect(result.length).toBeGreaterThan(0);
    expect(result.some(p => p.number === 25)).toBe(true);
  });

  it('يجب أن يكتشف عناوين الفصول', () => {
    const text = 'الفصل الأول\nمحتوى الفصل\nالفصل الثاني\nمحتوى آخر';
    const result = extractChapters(text);

    expect(result.length).toBe(2);
    expect(result[0].text).toContain('الفصل الأول');
  });

  it('يجب أن يكتشف جدول المحتويات', () => {
    const text = 'المحتويات\nالفصل الأول ......... 5\nالفصل الثاني ....... 15';
    const result = extractTableOfContents(text);

    expect(result).not.toBeNull();
    expect(result.length).toBeGreaterThan(0);
  });

  it('يجب أن يستخرج بنية الوثيقة', () => {
    const text = '# عنوان رئيسي\n\nفقرة طويلة جداً تحتوي على أكثر من خمسين حرفاً لكي يتم اعتبارها فقرة صحيحة في النظام.\n\n- عنصر قائمة';
    const result = extractDocumentStructure(text);

    expect(result.headers.length).toBeGreaterThan(0);
    expect(result.paragraphs.length).toBeGreaterThan(0);
    expect(result.lists.length).toBeGreaterThan(0);
  });

  it('يجب أن يتعامل مع أنماط مختلفة من الصفحات', () => {
    const patterns = [
      'صفحة 5',
      '[15]',
    ];

    patterns.forEach(pattern => {
      const result = extractPageNumbers(`نص ${pattern} نص`);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  it('يجب أن يقوم بتحليل سريع للنص', () => {
    const text = 'الفصل الأول\nمحتوى الفصل صفحة 10\nالفصل الثاني\nمحتوى آخر';
    const result = quickAnalyze(text);

    expect(result.hasChapters).toBe(true);
    expect(result.hasPageNumbers).toBe(true);
    expect(result.chapters.length).toBe(2);
  });
});
