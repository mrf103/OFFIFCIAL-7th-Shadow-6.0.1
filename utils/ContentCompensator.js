/**
 * ContentCompensator - نظام تعويض النص المحذوف
 * 
 * يقوم بتوليد محتوى إضافي عند حذف أكثر من 10% من النص الأصلي
 * للحفاظ على نسبة ±40% المسموحة
 */

import { gemini, geminiPro } from "@/api/geminiClient";
import { wordCount } from "./nlp/arabicTokenizer";

/**
 * إعدادات التعويض
 */
const COMPENSATION_CONFIG = {
  // نسبة النقص التي تستدعي التعويض
  MIN_DEFICIT_PERCENTAGE: 10,
  
  // الحد الأقصى للنسبة المسموحة
  MAX_ALLOWED_PERCENTAGE: 40,
  
  // عدد المحاولات لتوليد المحتوى
  MAX_GENERATION_ATTEMPTS: 3,
  
  // نسبة الأمان (للتأكد من عدم تجاوز الحد)
  SAFETY_MARGIN: 0.05, // 5%
};

/**
 * حساب نسبة التغيير في عدد الكلمات
 */
function calculateDelta(originalCount, finalCount) {
  const delta = Math.abs(originalCount - finalCount);
  const percentage = (delta / originalCount) * 100;
  const isDeficit = finalCount < originalCount;
  
  return {
    delta,
    percentage: percentage.toFixed(2),
    isDeficit,
    isSurplus: !isDeficit,
    needsCompensation: isDeficit && percentage > COMPENSATION_CONFIG.MIN_DEFICIT_PERCENTAGE
  };
}

/**
 * التحقق من صحة النسبة
 */
export function validateWordCountDelta(originalCount, finalCount) {
  const analysis = calculateDelta(originalCount, finalCount);
  
  if (parseFloat(analysis.percentage) > COMPENSATION_CONFIG.MAX_ALLOWED_PERCENTAGE) {
    return {
      valid: false,
      analysis,
      error: `تجاوزت نسبة التغيير الحد المسموح (${analysis.percentage}% > ${COMPENSATION_CONFIG.MAX_ALLOWED_PERCENTAGE}%)`
    };
  }
  
  return {
    valid: true,
    analysis,
    message: `نسبة التغيير مقبولة: ${analysis.percentage}%`
  };
}

/**
 * تحليل سياق النص لتوليد تكملات متناسقة
 */
async function analyzeContext(text, chapters) {
  const prompt = `حلل النص التالي واستخرج:
1. الموضوع الرئيسي
2. الأسلوب الكتابي (رسمي، أدبي، علمي، إلخ)
3. اللغة المستخدمة
4. النغمة العامة (جدي، فكاهي، درامي، إلخ)
5. المواضيع الفرعية المطروحة

النص:
${text.substring(0, 5000)}

${chapters?.length > 0 ? `\nعناوين الفصول:\n${chapters.map(ch => `- ${ch.title || ch.theme}`).join('\n')}` : ''}

أعد النتيجة بصيغة JSON:
{
  "main_theme": "الموضوع الرئيسي",
  "writing_style": "الأسلوب",
  "language": "ar/en/mixed",
  "tone": "النغمة",
  "sub_themes": ["موضوع1", "موضوع2"],
  "key_elements": ["عنصر1", "عنصر2"]
}`;

  try {
    const response = await gemini.invokeLLM({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3 // منخفضة للدقة
    });
    
    // استخراج JSON من الرد
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // إذا فشل، نعيد سياق افتراضي
    return {
      main_theme: "غير محدد",
      writing_style: "عام",
      language: "ar",
      tone: "محايد",
      sub_themes: [],
      key_elements: []
    };
  } catch (error) {
    console.error('فشل تحليل السياق:', error);
    return null;
  }
}

/**
 * توليد محتوى تعويضي بناءً على السياق
 */
async function generateCompensation(context, targetWordCount, chapters) {
  const prompt = `أنت كاتب محترف. ولّد محتوى إضافي بعدد كلمات تقريبي: ${targetWordCount.toLocaleString()} كلمة.

**معلومات السياق:**
- الموضوع الرئيسي: ${context.main_theme}
- الأسلوب: ${context.writing_style}
- اللغة: ${context.language === 'ar' ? 'العربية' : context.language === 'en' ? 'الإنجليزية' : 'مختلطة'}
- النغمة: ${context.tone}
- المواضيع الفرعية: ${context.sub_themes?.join(', ') || 'لا يوجد'}

${chapters?.length > 0 ? `**الفصول الموجودة:**\n${chapters.map((ch, i) => `${i + 1}. ${ch.title || ch.theme || 'فصل ' + (i + 1)}`).join('\n')}` : ''}

**إرشادات التوليد:**
1. احتفظ بنفس الأسلوب الكتابي واللغة
2. تأكد من التناسق الموضوعي الكامل
3. لا تكرر المحتوى الموجود
4. اكتب محتوى ذو قيمة يثري النص
5. استخدم ${context.language === 'ar' ? 'العربية الفصحى' : 'نفس اللغة المستخدمة'}
6. حافظ على النغمة العامة للنص

**المحتوى الإضافي:**`;

  try {
    const response = await geminiPro.invokeLLM({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, // معتدلة للإبداع مع الالتزام
      max_tokens: Math.min(targetWordCount * 2, 4000) // تقدير: كلمة = 2 tokens
    });
    
    return response;
  } catch (error) {
    console.error('فشل توليد التعويض:', error);
    throw new Error(`فشل توليد المحتوى التعويضي: ${error.message}`);
  }
}

/**
 * الوظيفة الرئيسية: تعويض النص المحذوف
 * 
 * @param {string} originalText - النص الأصلي
 * @param {string} cleanedText - النص المنظف
 * @param {Array} chapters - الفصول (اختياري)
 * @param {Object} options - خيارات إضافية
 * @returns {Promise<Object>} النتيجة مع المحتوى المعوَّض
 */
export async function compensateDeletedContent(
  originalText, 
  cleanedText, 
  chapters = []
) {
  const originalWords = wordCount(originalText);
  const cleanedWords = wordCount(cleanedText);
  
  const deltaAnalysis = calculateDelta(originalWords, cleanedWords);
  
  // إذا لم يكن هناك حاجة للتعويض
  if (!deltaAnalysis.needsCompensation) {
    return {
      compensated: false,
      reason: `النقص (${deltaAnalysis.percentage}%) أقل من الحد الأدنى (${COMPENSATION_CONFIG.MIN_DEFICIT_PERCENTAGE}%)`,
      original_word_count: originalWords,
      final_word_count: cleanedWords,
      final_text: cleanedText,
      delta_analysis: deltaAnalysis
    };
  }
  
  // إذا كان النقص أكبر من المسموح
  if (parseFloat(deltaAnalysis.percentage) > COMPENSATION_CONFIG.MAX_ALLOWED_PERCENTAGE) {
    throw new Error(
      `النقص (${deltaAnalysis.percentage}%) يتجاوز الحد الأقصى المسموح (${COMPENSATION_CONFIG.MAX_ALLOWED_PERCENTAGE}%). يجب مراجعة النص يدوياً.`
    );
  }
  
  // تحليل السياق
  const context = await analyzeContext(cleanedText, chapters);
  
  if (!context) {
    throw new Error('فشل تحليل سياق النص للتعويض');
  }
  
  // حساب عدد الكلمات المطلوبة
  const targetCompensation = deltaAnalysis.delta;
  const safeTarget = Math.floor(targetCompensation * (1 - COMPENSATION_CONFIG.SAFETY_MARGIN));
  
  // توليد المحتوى التعويضي
  let generatedContent = '';
  let attempts = 0;
  
  while (attempts < COMPENSATION_CONFIG.MAX_GENERATION_ATTEMPTS) {
    attempts++;
    
    try {
      generatedContent = await generateCompensation(context, safeTarget, chapters);
      
      const generatedWords = wordCount(generatedContent);
      
      // تحقق من أن المحتوى المولد كافٍ
      if (generatedWords >= safeTarget * 0.8) {
        break;
      }
      
      console.log(`محاولة ${attempts}: ولّد ${generatedWords} كلمة من ${safeTarget} مطلوبة`);
    } catch (error) {
      if (attempts === COMPENSATION_CONFIG.MAX_GENERATION_ATTEMPTS) {
        throw error;
      }
    }
  }
  
  // دمج المحتوى
  const finalText = cleanedText + '\n\n' + generatedContent;
  const finalWords = wordCount(finalText);
  
  // التحقق النهائي من النسبة
  const finalDelta = calculateDelta(originalWords, finalWords);
  const validation = validateWordCountDelta(originalWords, finalWords);
  
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  return {
    compensated: true,
    reason: `تم تعويض النقص (${deltaAnalysis.percentage}%)`,
    original_word_count: originalWords,
    cleaned_word_count: cleanedWords,
    generated_word_count: wordCount(generatedContent),
    final_word_count: finalWords,
    final_text: finalText,
    generated_content: generatedContent,
    context_analysis: context,
    delta_analysis: finalDelta,
    validation,
    attempts
  };
}

/**
 * تعويض ذكي مع تحديد الموقع المناسب للإدراج
 * (نسخة متقدمة - للمستقبل)
 */
export async function smartCompensation(originalText, cleanedText, chapters = []) {
  // TODO: تحليل أين تم الحذف وإدراج التعويض في الموقع المناسب
  // بدلاً من الإلحاق في النهاية فقط
  
  return compensateDeletedContent(originalText, cleanedText, chapters);
}

export default {
  compensateDeletedContent,
  validateWordCountDelta,
  calculateDelta,
  smartCompensation,
  COMPENSATION_CONFIG
};
