/**
 * SpecializedAgents - نظام الوكلاء المتخصصين
 * 
 * وكلاء AI متخصصون لكل مرحلة من مراحل معالجة النص
 * لضمان الجودة والدقة والاحترافية
 */

import { gemini, geminiPro } from "@/api/geminiClient";
import { wordCount } from "./nlp/arabicTokenizer";

/**
 * الوكيل الأساسي - Base Agent
 */
class SpecializedAgent {
  constructor(config) {
    this.name = config.name;
    this.role = config.role;
    this.description = config.description;
    this.model = config.useAdvanced ? geminiPro : gemini;
    this.temperature = config.temperature || 0.5;
    this.maxRetries = config.maxRetries || 2;
  }
  
  /**
   * معالجة مع إعادة المحاولة
   */
  async processWithRetry(prompt, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.model.invokeLLM({
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || this.temperature,
          max_tokens: options.max_tokens
        });
        
        return response;
      } catch (error) {
        console.error(`${this.name} - محاولة ${attempt} فشلت:`, error.message);
        lastError = error;
        
        if (attempt < this.maxRetries) {
          // انتظار قبل إعادة المحاولة (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw new Error(`${this.name} فشل بعد ${this.maxRetries} محاولات: ${lastError.message}`);
  }
  
  /**
   * استخراج JSON من الرد
   */
  extractJSON(response) {
    try {
      // محاولة 1: JSON مباشر
      return JSON.parse(response);
    } catch (e) {
      // محاولة 2: استخراج من markdown code block
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // محاولة 3: استخراج أول كائن JSON
      const objectMatch = response.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      
      throw new Error('فشل استخراج JSON من الرد');
    }
  }
}

/**
 * 1. وكيل التحليل البنيوي
 * يكشف عن جميع عناصر الهيكلة القديمة
 */
class StructuralAnalysisAgent extends SpecializedAgent {
  constructor() {
    super({
      name: 'محلل البنية',
      role: 'structural_analysis',
      description: 'كشف أرقام الصفحات، الفهارس، علامات الفصول',
      temperature: 0.3, // دقة عالية
      useAdvanced: false
    });
  }
  
  async analyze(text) {
    const prompt = `أنت محلل بنية نصوص محترف. حلل النص التالي بدقة شديدة:

**مهامك:**
1. اكشف جميع أرقام الصفحات (ص، صفحة، Page، p.)
2. اكشف علامات الفصول (الفصل، Chapter، الجزء، Part، القسم، Section)
3. اكشف صفحات الفهرسة (الفهرس، المحتويات، Contents، Index)
4. اكشف الترقيم التسلسلي (1.2.3، أولاً، ثانياً)
5. حدد المحتوى غير ذي الصلة (محادثات، أكواد، نصوص خارجية)

النص:
---
${text.substring(0, 10000)}
${text.length > 10000 ? '\n... (تم الاقتطاع)' : ''}
---

أعد النتيجة بصيغة JSON:
{
  "page_numbers": [{"text": "ص 15", "position": 123}],
  "chapter_markers": [{"text": "الفصل الأول", "position": 456}],
  "table_of_contents": [{"text": "الفهرس", "position": 789}],
  "numbering_systems": [{"text": "1.2.3", "position": 101}],
  "irrelevant_content": [{"type": "code", "start": 200, "end": 350}],
  "estimated_chapters": 5,
  "structure_quality": "good/fair/poor"
}`;

    const response = await this.processWithRetry(prompt);
    return this.extractJSON(response);
  }
}

/**
 * 2. وكيل التنظيف اللغوي
 * ينظف النص مع الحفاظ التام على اللغة
 */
class LinguisticCleaningAgent extends SpecializedAgent {
  constructor() {
    super({
      name: 'محرر لغوي',
      role: 'linguistic_cleaning',
      description: 'تنظيف النص بدون تشويه اللغة',
      temperature: 0.2, // حذر جداً
      useAdvanced: true // استخدام Pro للدقة
    });
  }
  
  async clean(text, elementsToRemove, language = 'ar') {
    const prompt = `أنت محرر لغوي محترف. نظف النص التالي بحذر شديد:

**العناصر المطلوب إزالتها:**
${JSON.stringify(elementsToRemove, null, 2)}

**إرشادات صارمة:**
1. أزل فقط العناصر المحددة أعلاه
2. احتفظ بكل الأحرف ${language === 'ar' ? 'العربية' : 'الأصلية'} دون تشويه
3. لا تغير الكلمات أو العبارات
4. احتفظ بالفقرات والتنسيق
5. تأكد من أن النص النهائي قابل للقراءة بنفس اللغة

النص:
---
${text}
---

أعد النص المنظف فقط (بدون تعليقات أو إضافات):`;

    return await this.processWithRetry(prompt, { temperature: 0.1 });
  }
}

/**
 * 3. وكيل مراقبة الجودة
 * يتحقق من جودة النص بعد كل مرحلة
 */
class QualityControlAgent extends SpecializedAgent {
  constructor() {
    super({
      name: 'مراقب الجودة',
      role: 'quality_control',
      description: 'التحقق من جودة النص والتناسق',
      temperature: 0.3,
      useAdvanced: false
    });
  }
  
  async inspect(text) {
    const prompt = `أنت مراقب جودة محترف في دار نشر. افحص النص التالي:

**معايير الفحص:**
- التناسق اللغوي (يجب أن يكون ≥85%)
- الوحدة الموضوعية (يجب أن تكون ≥75%)
- نسبة التكرار (يجب أن تكون <15%)
- سلامة اللغة (لا تشويه)
- التماسك السردي

النص:
---
${text.substring(0, 8000)}
${text.length > 8000 ? '\n... (النص أطول)' : ''}
---

أعد تقرير الجودة بصيغة JSON:
{
  "language_consistency": 92.5,
  "thematic_unity": 88.0,
  "repetition_rate": 8.3,
  "language_integrity": "intact/corrupted",
  "narrative_coherence": 85.0,
  "overall_quality": "excellent/good/fair/poor",
  "issues": ["مشكلة 1", "مشكلة 2"],
  "recommendations": ["توصية 1"]
}`;

    const response = await this.processWithRetry(prompt);
    return this.extractJSON(response);
  }
}

/**
 * 4. وكيل توليد التكملات
 * يولد محتوى لتعويض النص المحذوف
 */
class CompensationAgent extends SpecializedAgent {
  constructor() {
    super({
      name: 'مولد التكملات',
      role: 'content_compensation',
      description: 'توليد محتوى متناسق لتعويض النقص',
      temperature: 0.7, // إبداعي مع الالتزام
      useAdvanced: true // Pro للجودة
    });
  }
  
  async generate(context, targetWords, existingChapters = []) {
    const prompt = `أنت كاتب محترف. ولّد محتوى إضافي عالي الجودة:

**المواصفات:**
- عدد الكلمات المطلوب: ${targetWords.toLocaleString()}
- الموضوع: ${context.main_theme}
- الأسلوب: ${context.writing_style}
- اللغة: ${context.language === 'ar' ? 'العربية الفصحى' : context.language}
- النغمة: ${context.tone}

${existingChapters.length > 0 ? `**الفصول الموجودة:**\n${existingChapters.map((ch, i) => `${i+1}. ${ch.title || 'فصل ' + (i+1)}`).join('\n')}` : ''}

**متطلبات الجودة:**
1. تناسق كامل مع السياق والأسلوب
2. محتوى أصيل (لا تكرار)
3. قيمة مضافة للنص
4. تدفق طبيعي
5. لغة سليمة خالية من الأخطاء

**المحتوى الإضافي:**`;

    return await this.processWithRetry(prompt, {
      temperature: 0.7,
      max_tokens: Math.min(targetWords * 2, 4000)
    });
  }
}

/**
 * 5. وكيل تقسيم الفصول
 * يقسم النص إلى فصول منطقية
 */
class ChapterDivisionAgent extends SpecializedAgent {
  constructor() {
    super({
      name: 'مقسم الفصول',
      role: 'chapter_division',
      description: 'تقسيم ذكي للنص إلى 2-13 فصل',
      temperature: 0.4,
      useAdvanced: false
    });
  }
  
  async divide(text, minChapters = 2, maxChapters = 13) {
    const words = wordCount(text);
    const optimalChapters = Math.min(maxChapters, Math.max(minChapters, Math.ceil(words / 6000)));
    
    const prompt = `أنت خبير في تقسيم النصوص. قسّم النص التالي إلى ${optimalChapters} فصلاً تقريباً:

**معايير التقسيم:**
- الوحدة الموضوعية لكل فصل
- التوازن في الأطوال (بقدر المستطاع)
- الانتقالات الطبيعية
- عدد الفصول: ${minChapters}-${maxChapters}

النص (${words.toLocaleString()} كلمة):
---
${text.substring(0, 15000)}
${text.length > 15000 ? '\n... (تم الاقتطاع للطول)' : ''}
---

أعد النتيجة بصيغة JSON:
{
  "chapters": [
    {
      "id": "ch1",
      "title": "عنوان الفصل",
      "start_marker": "أول 5 كلمات",
      "end_marker": "آخر 5 كلمات",
      "theme": "الموضوع الرئيسي",
      "estimated_words": 5000
    }
  ],
  "total_chapters": ${optimalChapters},
  "division_rationale": "تفسير التقسيم"
}`;

    const response = await this.processWithRetry(prompt);
    return this.extractJSON(response);
  }
}

/**
 * منسق الوكلاء - Agent Coordinator
 * ينسق العمل بين الوكلاء المختلفين
 */
class AgentCoordinator {
  constructor() {
    this.agents = {
      // Existing Agents - معالجة النص الأساسية
      structural: new StructuralAnalysisAgent(),
      linguistic: new LinguisticCleaningAgent(),
      quality: new QualityControlAgent(),
      compensation: new CompensationAgent(),
      chapter: new ChapterDivisionAgent()
    };
    
    // NEW - Agency Agents (lazy loading)
    this.agencyAgents = null;
  }
  
  /**
   * تحميل وكلاء الوكالة عند الحاجة
   */
  async _loadAgencyAgents() {
    if (!this.agencyAgents) {
      const { 
        MarketingAgent, 
        SocialMediaAgent, 
        MediaScriptAgent, 
        DesignCoverAgent 
      } = await import('./agents/index.js');
      
      this.agencyAgents = {
        marketing: new MarketingAgent(),
        socialMedia: new SocialMediaAgent(),
        mediaScript: new MediaScriptAgent(),
        coverDesign: new DesignCoverAgent()
      };
    }
    return this.agencyAgents;
  }
  
  /**
   * سير العمل الكامل بالوكلاء
   */
  async processWithAgents(text, options = {}) {
    const results = {
      stages: [],
      finalText: text,
      metadata: {}
    };
    
    try {
      // المرحلة 1: التحليل البنيوي
      const structural = await this.agents.structural.analyze(text);
      results.stages.push({ stage: 'structural_analysis', data: structural });
      results.metadata.structural = structural;
      
      // المرحلة 2: التنظيف اللغوي
      const cleaned = await this.agents.linguistic.clean(
        text,
        structural,
        options.language || 'ar'
      );
      results.stages.push({ stage: 'linguistic_cleaning', success: true });
      results.finalText = cleaned;
      
      // المرحلة 3: مراقبة الجودة
      const quality = await this.agents.quality.inspect(cleaned);
      results.stages.push({ stage: 'quality_control', data: quality });
      results.metadata.quality = quality;
      
      // المرحلة 4: تقسيم الفصول (إذا طُلب)
      if (options.divideChapters !== false) {
        const chapters = await this.agents.chapter.divide(cleaned);
        results.stages.push({ stage: 'chapter_division', data: chapters });
        results.metadata.chapters = chapters.chapters;
      }
      
      // المرحلة 5: التعويض (إذا لزم)
      if (options.compensate && options.originalWordCount) {
        const currentWords = wordCount(cleaned);
        const deficit = options.originalWordCount - currentWords;
        const deficitPct = (deficit / options.originalWordCount) * 100;
        
        if (deficitPct > 10) {
          const compensation = await this.agents.compensation.generate(
            options.context || {},
            deficit,
            results.metadata.chapters || []
          );
          results.stages.push({ stage: 'compensation', generated: true });
          results.finalText = cleaned + '\n\n' + compensation;
        }
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ فشل نظام الوكلاء:', error);
      throw error;
    }
  }
  
  /**
   * NEW - توليد حزمة Agency كاملة
   * يولد: محتوى تسويقي + سوشال ميديا + سكريبتات + تصميم أغلفة
   */
  async generateAgencyPackage(manuscript, options = {}) {
    
    const results = {
      manuscript: {
        title: manuscript.title,
        processedText: null
      },
      marketing: null,
      socialMedia: null,
      mediaScripts: null,
      coverDesign: null,
      timestamp: new Date().toISOString(),
      metadata: {}
    };
    
    try {
      // تحميل وكلاء الوكالة
      const agents = await this._loadAgencyAgents();
      
      // المرحلة 1: معالجة النص الأساسية (الوكلاء الأصليين)
      if (options.processText !== false) {
        const processed = await this.processWithAgents(manuscript.content, {
          language: 'ar',
          divideChapters: true,
          compensate: options.compensate || false,
          originalWordCount: wordCount(manuscript.content),
          context: {
            main_theme: manuscript.genre || 'عام',
            writing_style: 'احترافي',
            language: 'ar',
            tone: manuscript.mood || 'متوازن'
          }
        });
        
        results.manuscript.processedText = processed.finalText;
        results.metadata.textProcessing = processed.metadata;
      }
      
      // المرحلة 2: توليد المحتوى التسويقي
      if (options.includeMarketing !== false) {
        const marketing = await agents.marketing.generateMarketingPackage(manuscript);
        results.marketing = marketing;
      }
      
      // المرحلة 3: توليد محتوى السوشال ميديا
      if (options.includeSocialMedia !== false) {
        const social = await agents.socialMedia.generateSocialMediaPackage(manuscript);
        results.socialMedia = social;
      }
      
      // المرحلة 4: توليد السكريبتات الإعلامية
      if (options.includeMediaScripts !== false) {
        const scripts = await agents.mediaScript.generateMediaScriptPackage(manuscript);
        results.mediaScripts = scripts;
      }
      
      // المرحلة 5: توليد تصاميم الأغلفة
      if (options.includeCoverDesign !== false) {
        const covers = await agents.coverDesign.generateCoverDesignPackage(manuscript);
        results.coverDesign = covers;
      }
      
      
      return {
        success: true,
        data: results
      };
      
    } catch (error) {
      console.error('❌ فشل توليد حزمة Agency:', error);
      return {
        success: false,
        error: error.message,
        partialData: results
      };
    }
  }
  
  /**
   * الحصول على وكيل محدد
   */
  getAgent(type) {
    return this.agents[type];
  }
  
  /**
   * الحصول على وكيل وكالة محدد
   */
  async getAgencyAgent(type) {
    const agents = await this._loadAgencyAgents();
    return agents[type];
  }
}

// تصدير singleton
export const agentCoordinator = new AgentCoordinator();

// تصدير الوكلاء الفردية
export {
  SpecializedAgent,
  StructuralAnalysisAgent,
  LinguisticCleaningAgent,
  QualityControlAgent,
  CompensationAgent,
  ChapterDivisionAgent,
  AgentCoordinator
};

export default agentCoordinator;
