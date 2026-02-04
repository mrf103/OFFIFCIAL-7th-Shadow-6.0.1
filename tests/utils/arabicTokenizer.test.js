import { describe, it, expect } from 'vitest';
import arabicTokenizer, {
  tokenize,
  normalizeArabic,
  getTextStats,
  extractKeywords
} from '@/utils/nlp/arabicTokenizer';

describe('Arabic Tokenizer', () => {
  it('يجب أن يقسم النص العربي إلى كلمات', () => {
    const text = 'هذا نص عربي للاختبار';
    const tokens = tokenize(text);

    expect(tokens).toContain('نص');
    expect(tokens).toContain('عربي');
    expect(tokens).toContain('للاختبار');
  });

  it('يجب أن يزيل التشكيل بشكل صحيح', () => {
    const text = 'كِتَابٌ جَمِيلٌ';
    const normalized = normalizeArabic(text);

    expect(normalized).not.toContain('َ');
    expect(normalized).not.toContain('ٌ');
  });

  it('يجب أن يتعامل مع النص الفارغ', () => {
    const tokens = tokenize('');
    expect(tokens).toEqual([]);
  });

  it('يجب أن يتعامل مع المسافات الزائدة', () => {
    const text = 'كلمه    اولى     ثانيه';
    const tokens = tokenize(text);

    expect(tokens.length).toBe(3);
  });

  it('يجب أن يتعامل مع علامات الترقيم', () => {
    const text = 'السلام عليكم! كيف حالك؟';
    const tokens = tokenize(text);

    expect(tokens.some(t => t.includes('سلام'))).toBe(true);
    expect(tokens).not.toContain('!');
    expect(tokens).not.toContain('؟');
  });

  it('يجب أن يحسب الإحصائيات بشكل صحيح', () => {
    const text = 'هذا نص قصير للاختبار. نص ثاني.';
    const stats = getTextStats(text);

    expect(stats.words).toBeGreaterThan(0);
    expect(stats.sentences).toBeGreaterThanOrEqual(1);
  });

  it('يجب أن يكتشف الكلمات المفتاحية', () => {
    const text = 'الذكاء الاصطناعي مهم جداً. الذكاء الاصطناعي يتطور بسرعة. الذكاء يزداد.';
    const keywords = extractKeywords(text, 3);

    // extractKeywords returns array of {word, freq} objects
    const keywordWords = keywords.map(k => k.word);
    expect(keywordWords.some(w => w.includes('ذكاء') || w.includes('الذكاء'))).toBe(true);
  });
});
