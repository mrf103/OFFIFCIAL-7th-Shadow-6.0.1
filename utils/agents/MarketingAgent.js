/**
 * MarketingAgent - وكيل التسويق
 * 
 * توليد محتوى تسويقي احترافي شامل للكتاب
 * يشمل: عناوين جذابة، أوصاف، نقاط بيع، جمهور مستهدف، كلمات مفتاحية SEO
 */

import { geminiPro } from "@/api/geminiClient";

class MarketingAgent {
  constructor() {
    this.name = 'وكيل التسويق';
    this.role = 'marketing_generation';
    this.description = 'توليد محتوى تسويقي احترافي للكتاب';
    this.model = geminiPro;
    this.temperature = 0.7; // إبداع متوسط-عالي
    this.maxRetries = 3;
  }

  /**
   * توليد حزمة تسويقية كاملة للكتاب
   */
  async generateMarketingPackage(manuscript) {
    const { title, content, genre, targetAudience } = manuscript;
    
    // استخراج عينة من المحتوى (أول 2000 كلمة)
    const contentSample = this._extractSample(content, 2000);
    
    const prompt = `أنت خبير تسويق كتب محترف متخصص في السوق العربي والعالمي.

**معلومات الكتاب:**
- العنوان: ${title || 'غير محدد'}
- النوع: ${genre || 'غير محدد'}
- الجمهور المستهدف: ${targetAudience || 'عام'}
- عينة من المحتوى:
${contentSample}

**مهمتك:** أنشئ حزمة تسويقية احترافية شاملة تتضمن:

1. **العنوان التسويقي الجذاب** (Catchy Title)
   - عنوان رئيسي قوي يجذب الانتباه فوراً
   - عنوان فرعي يوضح الفائدة الرئيسية

2. **الوصف المختصر** (Elevator Pitch - 50-80 كلمة)
   - وصف مشوق يمكن قراءته في 30 ثانية
   - يركز على المشكلة والحل
   - يثير الفضول

3. **الوصف المفصل** (Long Description - 200-300 كلمة)
   - مقدمة قوية تجذب القارئ
   - نبذة عن المحتوى والموضوعات الرئيسية
   - ما الذي يميز هذا الكتاب؟
   - لماذا يجب على القارئ شراء هذا الكتاب؟

4. **نقاط البيع الرئيسية** (Key Selling Points - 5-7 نقاط)
   - ميزات فريدة وفوائد ملموسة
   - كل نقطة في جملة واحدة قوية
   - تبدأ بفعل أمر أو فائدة مباشرة

5. **الجمهور المستهدف** (Target Audience)
   - من هم القراء المثاليون؟ (3-5 فئات)
   - ما احتياجاتهم التي يلبيها الكتاب؟
   - الفئة العمرية والاهتمامات

6. **كلمات مفتاحية SEO** (SEO Keywords)
   - 10-15 كلمة مفتاحية رئيسية
   - مزيج من كلمات عامة وطويلة (long-tail)
   - باللغتين العربية والإنجليزية

7. **هاشتاجات مقترحة** (Hashtags - 8-12 هاشتاج)
   - هاشتاجات شائعة وذات صلة
   - باللغتين العربية والإنجليزية

8. **عبارة الدعوة لاتخاذ إجراء** (Call-to-Action - 3 خيارات)
   - عبارات تحفيزية قوية
   - تدفع للشراء الفوري

9. **زوايا تسويقية إبداعية** (Marketing Angles - 3-4 زوايا)
   - طرق مختلفة لتسويق نفس الكتاب
   - لجماهير مختلفة أو منصات مختلفة

10. **مقارنات تنافسية** (Competitive Positioning)
    - "إذا أعجبك [كتاب شهير]، ستحب هذا الكتاب لأن..."
    - 2-3 مقارنات

**التنسيق المطلوب:** JSON بالشكل التالي:

\`\`\`json
{
  "catchyTitle": {
    "main": "العنوان الرئيسي",
    "subtitle": "العنوان الفرعي"
  },
  "elevatorPitch": "الوصف المختصر...",
  "longDescription": "الوصف المفصل...",
  "keySellingPoints": [
    "نقطة بيع 1",
    "نقطة بيع 2",
    "..."
  ],
  "targetAudience": {
    "segments": [
      "فئة 1",
      "فئة 2",
      "..."
    ],
    "needs": "الاحتياجات التي يلبيها...",
    "ageRange": "الفئة العمرية"
  },
  "seoKeywords": {
    "arabic": ["كلمة1", "كلمة2", "..."],
    "english": ["keyword1", "keyword2", "..."],
    "longTail": ["عبارة طويلة 1", "..."]
  },
  "hashtags": {
    "arabic": ["#هاشتاج1", "#هاشتاج2", "..."],
    "english": ["#hashtag1", "#hashtag2", "..."]
  },
  "callToAction": [
    "احصل على نسختك الآن!",
    "اكتشف السر الذي غيّر حياة الآلاف",
    "لا تفوت هذه الفرصة - احجز نسختك"
  ],
  "marketingAngles": [
    {
      "angle": "الزاوية 1",
      "description": "وصف الزاوية",
      "audience": "الجمهور المستهدف"
    }
  ],
  "competitivePositioning": [
    "إذا أعجبك [كتاب]، ستحب هذا لأن..."
  ]
}
\`\`\`

**ملاحظات مهمة:**
- استخدم لغة مقنعة وجذابة
- ركز على الفوائد أكثر من الميزات
- كن محدداً وملموساً
- استخدم أرقاماً وإحصائيات إن أمكن
- اجعل المحتوى سهل القراءة والمشاركة`;

    try {
      const response = await this._processWithRetry(prompt);
      const marketingPackage = this._extractJSON(response);
      
      return {
        success: true,
        data: marketingPackage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('MarketingAgent Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this._generateFallbackMarketing(manuscript)
      };
    }
  }

  /**
   * توليد عنوان تسويقي قصير (لاستخدام سريع)
   */
  async generateQuickTitle(manuscript) {
    const { title, genre } = manuscript;
    
    const prompt = `أنشئ عنواناً تسويقياً جذاباً للكتاب التالي:

العنوان الأصلي: ${title}
النوع: ${genre || 'عام'}

المطلوب: عنوان رئيسي قصير (5-10 كلمات) يجذب الانتباه فوراً.
استخدم أسلوب تشويقي وابتعد عن الكليشيهات.

أرجع JSON: {"title": "العنوان الجديد"}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 100 });
      const result = this._extractJSON(response);
      return result.title;
    } catch (error) {
      return title; // استخدام العنوان الأصلي
    }
  }

  /**
   * توليد وصف مختصر سريع
   */
  async generateQuickPitch(manuscript) {
    const contentSample = this._extractSample(manuscript.content, 500);
    
    const prompt = `اكتب وصفاً مختصراً مشوقاً (50-70 كلمة) للكتاب بناءً على:

${contentSample}

الوصف يجب أن:
- يثير الفضول
- يركز على الفائدة
- يكون قابل للقراءة في 30 ثانية

أرجع JSON: {"pitch": "الوصف"}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 150 });
      const result = this._extractJSON(response);
      return result.pitch;
    } catch (error) {
      return 'كتاب رائع يستحق القراءة...';
    }
  }

  /**
   * معالجة مع إعادة المحاولة
   */
  async _processWithRetry(prompt, options = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.model.invokeLLM({
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || this.temperature,
          max_tokens: options.max_tokens || 2000
        });
        
        return response;
      } catch (error) {
        console.error(`${this.name} - محاولة ${attempt} فشلت:`, error.message);
        lastError = error;
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    
    throw new Error(`${this.name} فشل بعد ${this.maxRetries} محاولات: ${lastError.message}`);
  }

  /**
   * استخراج JSON من الرد
   */
  _extractJSON(response) {
    try {
      return JSON.parse(response);
    } catch (e) {
      const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      const objectMatch = response.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }
      
      throw new Error('فشل استخراج JSON من الرد');
    }
  }

  /**
   * استخراج عينة من النص
   */
  _extractSample(text, maxWords) {
    if (!text) return '';
    
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    
    return words.slice(0, maxWords).join(' ') + '...';
  }

  /**
   * محتوى تسويقي احتياطي
   */
  _generateFallbackMarketing(manuscript) {
    return {
      catchyTitle: {
        main: manuscript.title || 'كتاب رائع',
        subtitle: 'رحلة استثنائية في عالم الكتب'
      },
      elevatorPitch: 'كتاب مميز يقدم محتوى قيّم وممتع يستحق القراءة.',
      longDescription: 'هذا الكتاب يقدم تجربة قراءة فريدة مع محتوى غني ومفيد.',
      keySellingPoints: [
        'محتوى حصري ومميز',
        'أسلوب سلس وجذاب',
        'معلومات قيمة ومفيدة'
      ],
      targetAudience: {
        segments: ['محبو القراءة', 'الباحثون عن المعرفة'],
        needs: 'محتوى مفيد وممتع',
        ageRange: '18-60'
      },
      seoKeywords: {
        arabic: ['كتاب', 'قراءة', 'ثقافة'],
        english: ['book', 'reading', 'culture'],
        longTail: ['كتاب عربي جديد', 'قراءة ممتعة']
      },
      hashtags: {
        arabic: ['#كتاب', '#قراءة', '#ثقافة'],
        english: ['#book', '#reading', '#culture']
      },
      callToAction: [
        'احصل على نسختك الآن',
        'ابدأ رحلة القراءة',
        'اكتشف المزيد'
      ],
      marketingAngles: [],
      competitivePositioning: []
    };
  }
}

export default MarketingAgent;
