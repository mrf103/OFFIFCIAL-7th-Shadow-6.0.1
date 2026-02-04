/**
 * MediaScriptAgent - وكيل السكريبتات الإعلامية
 * 
 * كتابة سكريبتات احترافية للمحتوى الإعلامي المرئي والصوتي
 * يشمل: يوتيوب، بودكاست، تريلر الكتاب، إعلانات راديو، أسئلة مقابلات
 */

import { geminiPro } from "@/api/geminiClient";

class MediaScriptAgent {
  constructor() {
    this.name = 'وكيل السكريبتات الإعلامية';
    this.role = 'media_script_generation';
    this.description = 'كتابة سكريبتات احترافية للمحتوى المرئي والصوتي';
    this.model = geminiPro;
    this.temperature = 0.75; // توازن بين الإبداع والدقة
    this.maxRetries = 3;
  }

  /**
   * توليد حزمة كاملة من السكريبتات الإعلامية
   */
  async generateMediaScriptPackage(manuscript) {
    const { title, content, genre, targetAudience, author } = manuscript;
    const contentSample = this._extractSample(content, 2000);
    
    const prompt = `أنت كاتب سكريبتات محترف متخصص في المحتوى الإعلامي المرئي والصوتي.

**معلومات الكتاب:**
- العنوان: ${title || 'غير محدد'}
- المؤلف: ${author || 'غير محدد'}
- النوع: ${genre || 'غير محدد'}
- الجمهور: ${targetAudience || 'عام'}
- عينة المحتوى:
${contentSample}

**مهمتك:** أنشئ حزمة شاملة من السكريبتات الإعلامية تتضمن:

1. **سكريبت يوتيوب - فيديو ترويجي (5-8 دقائق)**
   - Hook قوي (أول 10 ثواني)
   - مقدمة جذابة (30 ثانية)
   - عرض المحتوى (3-4 دقائق)
   - الفوائد والقيمة المضافة (1-2 دقيقة)
   - دعوة لاتخاذ إجراء قوية (30 ثانية)
   - ملاحظات للمونتاج والموسيقى
   - اقتراحات للمشاهد البصرية
   - أماكن إضافة B-Roll

2. **سكريبت بودكاست - حلقة كاملة (20-30 دقيقة)**
   - مقدمة الحلقة والضيف (2-3 دقائق)
   - قصة الكتاب وخلفيته (5-7 دقائق)
   - محاور النقاش الرئيسية (10-15 دقيقة)
   - أسئلة عميقة ومثيرة للاهتمام
   - لحظات مشوقة وقصص شخصية
   - خاتمة وتوصيات (2-3 دقائق)

3. **تريلر الكتاب - فيديو قصير (60-90 ثانية)**
   - Hook درامي قوي (5 ثواني)
   - بناء التشويق (20-30 ثانية)
   - عرض القيمة (20-30 ثانية)
   - Climax (10 ثواني)
   - CTA + معلومات الكتاب (10-15 ثانية)
   - Voice-over script كامل
   - اقتراحات للموسيقى والمؤثرات

4. **إعلان راديو - نسختان**
   - نسخة 30 ثانية (قصيرة ومركزة)
   - نسخة 60 ثانية (تفصيلية أكثر)
   - لكل نسخة:
     * Hook جذاب
     * رسالة واضحة
     * CTA قوي
     * معلومات التواصل
     * ملاحظات للتنغيم والأداء الصوتي

5. **أسئلة المقابلات - 3 مستويات**
   - **أسئلة سريعة** (5 أسئلة - 1-2 دقيقة لكل سؤال)
     * أسئلة مباشرة وسهلة
   - **أسئلة متعمقة** (8 أسئلة - 3-5 دقائق لكل سؤال)
     * أسئلة تحليلية ومثيرة
   - **أسئلة فلسفية/إبداعية** (5 أسئلة - 5-10 دقائق لكل سؤال)
     * أسئلة تستكشف الأعماق

6. **سكريبت Instagram/TikTok Reels - 5 أفكار**
   - كل سكريبت 15-30 ثانية
   - Hook في 3 ثواني الأولى
   - محتوى مشوق
   - نهاية قوية
   - وصف المشاهد والحركات

7. **ستوري بورد للتريلر - وصف مرئي**
   - تقسيم التريلر إلى مشاهد (Scenes)
   - وصف كل مشهد
   - زوايا الكاميرا المقترحة
   - الإضاءة والألوان
   - التايمينج

**التنسيق المطلوب:** JSON بالشكل التالي:

\`\`\`json
{
  "youtubeScript": {
    "duration": "5-8 دقائق",
    "hook": "أول 10 ثواني...",
    "intro": "المقدمة...",
    "mainContent": "المحتوى الرئيسي...",
    "benefits": "الفوائد...",
    "cta": "الدعوة لاتخاذ إجراء...",
    "editingNotes": [
      "أضف موسيقى حماسية في البداية",
      "..."
    ],
    "visualSuggestions": [
      "لقطة للكتاب",
      "..."
    ],
    "bRollPoints": [
      "عند الحديث عن [موضوع]: أضف B-Roll لـ...",
      "..."
    ]
  },
  "podcastScript": {
    "duration": "20-30 دقيقة",
    "intro": "مقدمة الحلقة...",
    "backstory": "قصة الكتاب...",
    "mainDiscussion": [
      {
        "topic": "محور 1",
        "duration": "5 دقائق",
        "content": "محتوى النقاش...",
        "questions": ["سؤال 1", "سؤال 2"]
      }
    ],
    "personalStories": [
      "قصة شخصية 1...",
      "..."
    ],
    "closing": "الخاتمة..."
  },
  "bookTrailer": {
    "duration": "60-90 ثانية",
    "hook": "[0-5s] Hook درامي...",
    "build": "[5-35s] بناء التشويق...",
    "value": "[35-65s] القيمة...",
    "climax": "[65-75s] Climax...",
    "cta": "[75-90s] CTA...",
    "voiceOver": "السكريبت الكامل للـ Voice-over...",
    "musicSuggestions": [
      "موسيقى تصاعدية",
      "..."
    ],
    "soundEffects": [
      "صوت 1",
      "..."
    ]
  },
  "radioAds": {
    "30seconds": {
      "script": "سكريبت 30 ثانية...",
      "performanceNotes": "ملاحظات الأداء...",
      "tone": "حماسي/جدي/ودود"
    },
    "60seconds": {
      "script": "سكريبت 60 ثانية...",
      "performanceNotes": "ملاحظات الأداء...",
      "tone": "حماسي/جدي/ودود"
    }
  },
  "interviewQuestions": {
    "quick": [
      {
        "question": "سؤال سريع 1",
        "expectedDuration": "1-2 دقيقة",
        "followUp": "سؤال تكميلي محتمل"
      }
    ],
    "indepth": [
      {
        "question": "سؤال متعمق 1",
        "expectedDuration": "3-5 دقائق",
        "context": "سياق السؤال",
        "followUp": "سؤال تكميلي"
      }
    ],
    "philosophical": [
      {
        "question": "سؤال فلسفي 1",
        "expectedDuration": "5-10 دقائق",
        "depth": "عمق السؤال"
      }
    ]
  },
  "reelsScripts": [
    {
      "platform": "Instagram/TikTok",
      "duration": "15-30s",
      "hook": "Hook الـ 3 ثواني الأولى",
      "content": "المحتوى",
      "ending": "النهاية",
      "visualDescription": "وصف المشاهد",
      "movements": "الحركات المطلوبة"
    }
  ],
  "trailerStoryboard": [
    {
      "scene": 1,
      "duration": "5s",
      "description": "وصف المشهد",
      "cameraAngle": "زاوية الكاميرا",
      "lighting": "الإضاءة",
      "colors": "الألوان",
      "voiceOver": "النص الصوتي"
    }
  ]
}
\`\`\`

**ملاحظات مهمة:**
- استخدم لغة حوارية وطبيعية
- اجعل السكريبتات سهلة القراءة والأداء
- ضع ملاحظات واضحة للأداء الصوتي والبصري
- ركز على القصة والعاطفة
- اجعل كل سكريبت قابل للتنفيذ مباشرة`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 4000 });
      const scriptPackage = this._extractJSON(response);
      
      return {
        success: true,
        data: scriptPackage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('MediaScriptAgent Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this._generateFallbackScripts(manuscript)
      };
    }
  }

  /**
   * توليد تريلر سريع
   */
  async generateQuickTrailer(manuscript) {
    const { title, genre } = manuscript;
    const contentSample = this._extractSample(manuscript.content, 500);
    
    const prompt = `اكتب سكريبت تريلر 60 ثانية للكتاب:

العنوان: ${title}
النوع: ${genre}
عينة: ${contentSample}

أرجع JSON: {
  "voiceOver": "السكريبت الكامل...",
  "duration": "60 ثانية",
  "mood": "المزاج/الجو"
}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 400 });
      return this._extractJSON(response);
    } catch (error) {
      return {
        voiceOver: `في عالم مليء بالأسرار... ${title}... قصة لن تنساها...`,
        duration: '60 ثانية',
        mood: 'تشويقي'
      };
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
          max_tokens: options.max_tokens || 3000
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
   * سكريبتات احتياطية
   */
  _generateFallbackScripts(manuscript) {
    const title = manuscript.title || 'كتاب رائع';
    
    return {
      youtubeScript: {
        duration: '5-8 دقائق',
        hook: `هل تبحث عن كتاب يغير نظرتك للأمور؟`,
        intro: `مرحباً بكم، اليوم سنتحدث عن ${title}...`,
        mainContent: `هذا الكتاب يأخذك في رحلة مميزة...`,
        benefits: `ستكتسب معرفة قيمة وتجربة فريدة...`,
        cta: `احصل على نسختك الآن من الرابط في الوصف!`,
        editingNotes: ['موسيقى خلفية هادئة', 'لقطات للكتاب'],
        visualSuggestions: ['صورة الغلاف', 'اقتباسات'],
        bRollPoints: ['لقطات قراءة']
      },
      podcastScript: {
        duration: '20-30 دقيقة',
        intro: `أهلاً بكم في حلقة جديدة، نستضيف اليوم حديثاً عن ${title}...`,
        backstory: `القصة وراء هذا الكتاب...`,
        mainDiscussion: [],
        personalStories: [],
        closing: `شكراً للاستماع...`
      },
      bookTrailer: {
        duration: '60 ثانية',
        hook: `في عالم مليء بالأسرار...`,
        build: `قصة تأخذك إلى أماكن لم تتخيلها...`,
        value: `${title} - تجربة لن تنساها...`,
        climax: `هل أنت مستعد؟`,
        cta: `احصل على نسختك الآن!`,
        voiceOver: `سكريبت كامل...`,
        musicSuggestions: ['موسيقى تشويقية'],
        soundEffects: ['مؤثرات درامية']
      },
      radioAds: {
        '30seconds': {
          script: `${title} - الكتاب الذي ينتظره الجميع. احصل عليه الآن!`,
          performanceNotes: 'صوت حماسي',
          tone: 'حماسي'
        },
        '60seconds': {
          script: `${title} - رحلة مميزة في عالم المعرفة...`,
          performanceNotes: 'صوت واثق',
          tone: 'جدي'
        }
      },
      interviewQuestions: {
        quick: [],
        indepth: [],
        philosophical: []
      },
      reelsScripts: [],
      trailerStoryboard: []
    };
  }
}

export default MediaScriptAgent;
