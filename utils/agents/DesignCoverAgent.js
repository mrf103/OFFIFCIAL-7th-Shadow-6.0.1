/**
 * DesignCoverAgent - وكيل تصميم الأغلفة
 * 
 * توليد أفكار تصميم أغلفة احترافية للكتاب
 * يشمل: تحليل النوع، نظام الألوان، أفكار تصميمية، Prompts لـ AI، مواصفات طباعة
 */

import { geminiPro } from "@/api/geminiClient";

class DesignCoverAgent {
  constructor() {
    this.name = 'وكيل تصميم الأغلفة';
    this.role = 'cover_design_generation';
    this.description = 'توليد أفكار تصميم أغلفة احترافية';
    this.model = geminiPro;
    this.temperature = 0.9; // إبداع عالي جداً
    this.maxRetries = 3;
  }

  /**
   * توليد حزمة تصميم أغلفة كاملة
   */
  async generateCoverDesignPackage(manuscript) {
    const { title, content, genre, targetAudience, mood } = manuscript;
    const contentSample = this._extractSample(content, 1500);
    
    const prompt = `أنت مصمم أغلفة كتب محترف ومدير فني متخصص في تصميم الأغلفة الجذابة.

**معلومات الكتاب:**
- العنوان: ${title || 'غير محدد'}
- النوع: ${genre || 'غير محدد'}
- الجمهور: ${targetAudience || 'عام'}
- المزاج: ${mood || 'غير محدد'}
- عينة المحتوى:
${contentSample}

**مهمتك:** أنشئ حزمة تصميم أغلفة شاملة تتضمن:

1. **تحليل النوع والموضوع** (Genre & Theme Analysis)
   - النوع الأدبي وتأثيره على التصميم
   - الموضوعات الرئيسية
   - المشاعر المراد إيصالها
   - الرموز والاستعارات المناسبة

2. **أنظمة الألوان المقترحة** (Color Palettes - 3-4 أنظمة)
   - لكل نظام:
     * اللون الرئيسي (Primary)
     * اللون الثانوي (Secondary)
     * اللون المميز (Accent)
     * ألوان الخلفية (Background)
     * أكواد HEX لكل لون
     * سيكولوجية الألوان وتأثيرها
     * متى يُستخدم هذا النظام

3. **أفكار تصميمية إبداعية** (Design Concepts - 5 أفكار مختلفة)
   - لكل فكرة:
     * الاسم والوصف
     * التكوين البصري (Visual Composition)
     * العناصر الرئيسية
     * الأسلوب الفني (Minimalist, Abstract, Realistic, etc.)
     * نوع الخط المناسب (Typography)
     * التأثير المتوقع على القارئ
     * الأنسب لـ: نسخة ورقية/إلكترونية/كليهما

4. **Prompts لـ AI Art Generators** (Midjourney, DALL-E, Stable Diffusion)
   - 5 prompts مختلفة ومفصلة
   - لكل prompt:
     * Positive prompts (ما نريده)
     * Negative prompts (ما نتجنبه)
     * الأسلوب الفني
     * الإعدادات المقترحة (aspect ratio, quality, etc.)
     * أمثلة على الكلمات المفتاحية

5. **Typography - اقتراحات الخطوط**
   - خط العنوان الرئيسي (3 خيارات)
   - خط العنوان الفرعي (إن وجد)
   - خط اسم المؤلف
   - حجم الخط ووزنه
   - التباعد والمحاذاة
   - خطوط احتياطية

6. **Layout & Composition - التخطيط**
   - تقسيم المساحة (Grid System)
   - موقع العنوان
   - موقع اسم المؤلف
   - توازن العناصر
   - نقاط التركيز (Focal Points)
   - المساحة السلبية (Negative Space)

7. **مواصفات الطباعة** (Print Specifications)
   - **الأبعاد:**
     * Paperback: 5.5" × 8.5" (14cm × 21.6cm)
     * Hardcover: 6" × 9" (15.2cm × 22.9cm)
     * Large Print: 7" × 10" (17.8cm × 25.4cm)
   - **الدقة:** 300 DPI minimum
   - **نظام الألوان:** CMYK للطباعة، RGB للرقمي
   - **Bleed:** 0.125" (3mm) على كل جانب
   - **Safe Zone:** 0.25" (6mm) من الحواف
   - **تنسيق الملف:** PDF, TIFF, or PSD
   - **الغلاف الكامل:** الأمامي + الخلفي + Spine

8. **Mood Board - لوحة المزاج**
   - وصف للصور المرجعية
   - أمثلة على أغلفة مشابهة ناجحة
   - عناصر بصرية ملهمة
   - Textures (خامات) مقترحة
   - أنماط (Patterns) مناسبة

9. **نسخ مختلفة** (Variations)
   - نسخة للطباعة (Print)
   - نسخة إلكترونية (E-book)
   - نسخة مصغرة (Thumbnail) لـ Amazon/متاجر
   - نسخة السوشال ميديا (Square format)
   - نسخة 3D Mock-up

10. **ملاحظات التنفيذ** (Implementation Notes)
    - نصائح للمصمم
    - الأخطاء الشائعة التي يجب تجنبها
    - كيفية التعامل مع النصوص الطويلة
    - التكيف مع السوق المستهدف

**التنسيق المطلوب:** JSON بالشكل التالي:

\`\`\`json
{
  "genreAnalysis": {
    "genre": "النوع الأدبي",
    "themes": ["موضوع 1", "موضوع 2"],
    "emotions": ["مشاعر 1", "مشاعر 2"],
    "symbols": ["رمز 1", "رمز 2"],
    "designImplications": "تأثيرات على التصميم..."
  },
  "colorPalettes": [
    {
      "name": "اسم النظام",
      "primary": "#HEX",
      "secondary": "#HEX",
      "accent": "#HEX",
      "background": "#HEX",
      "psychology": "تأثير الألوان...",
      "usage": "متى يُستخدم..."
    }
  ],
  "designConcepts": [
    {
      "name": "اسم الفكرة",
      "description": "وصف مفصل...",
      "composition": "التكوين البصري...",
      "elements": ["عنصر 1", "عنصر 2"],
      "style": "الأسلوب الفني",
      "typography": "نوع الخط",
      "impact": "التأثير المتوقع...",
      "bestFor": "print|digital|both"
    }
  ],
  "aiPrompts": [
    {
      "generator": "Midjourney|DALL-E|Stable Diffusion",
      "positivePrompt": "Detailed positive prompt...",
      "negativePrompt": "What to avoid...",
      "style": "art style",
      "settings": {
        "aspectRatio": "16:9",
        "quality": "high",
        "other": "..."
      },
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "typography": {
    "titleFont": {
      "options": ["Font 1", "Font 2", "Font 3"],
      "size": "48-72pt",
      "weight": "Bold",
      "fallback": "Fallback font"
    },
    "subtitleFont": {
      "options": ["Font 1", "Font 2"],
      "size": "24-36pt",
      "weight": "Regular"
    },
    "authorFont": {
      "options": ["Font 1", "Font 2"],
      "size": "18-24pt",
      "weight": "Light"
    }
  },
  "layoutComposition": {
    "gridSystem": "وصف نظام الشبكة",
    "titlePlacement": "Top|Center|Bottom",
    "authorPlacement": "Top|Bottom",
    "balance": "وصف التوازن",
    "focalPoints": ["نقطة 1", "نقطة 2"],
    "negativeSpace": "استخدام المساحة السلبية"
  },
  "printSpecifications": {
    "dimensions": {
      "paperback": "5.5 × 8.5 inches",
      "hardcover": "6 × 9 inches",
      "largePrint": "7 × 10 inches"
    },
    "resolution": "300 DPI",
    "colorMode": {
      "print": "CMYK",
      "digital": "RGB"
    },
    "bleed": "0.125 inches",
    "safeZone": "0.25 inches",
    "fileFormat": ["PDF", "TIFF", "PSD"],
    "fullCover": "Front + Back + Spine dimensions"
  },
  "moodBoard": {
    "referenceImages": [
      "وصف صورة مرجعية 1",
      "..."
    ],
    "successfulExamples": [
      "مثال 1: [اسم الكتاب] - لماذا نجح",
      "..."
    ],
    "visualElements": ["عنصر 1", "عنصر 2"],
    "textures": ["خامة 1", "خامة 2"],
    "patterns": ["نمط 1", "نمط 2"]
  },
  "variations": {
    "print": "ملاحظات للنسخة المطبوعة",
    "ebook": "ملاحظات للنسخة الإلكترونية",
    "thumbnail": "ملاحظات للنسخة المصغرة (256×256px minimum)",
    "socialMedia": "نسخة مربعة (1080×1080px)",
    "mockup3D": "اقتراحات لـ Mock-up ثلاثي الأبعاد"
  },
  "implementationNotes": {
    "designerTips": [
      "نصيحة 1",
      "نصيحة 2"
    ],
    "commonMistakes": [
      "خطأ شائع 1",
      "..."
    ],
    "longTitles": "كيفية التعامل مع العناوين الطويلة",
    "marketAdaptation": "التكيف مع السوق المستهدف"
  }
}
\`\`\`

**ملاحظات مهمة:**
- كن محدداً وعملياً في الاقتراحات
- ركز على الجاذبية البصرية والوضوح
- ضع في الاعتبار معايير الصناعة
- اقترح تصاميم يمكن تنفيذها بسهولة
- راعي الاختلافات الثقافية إن وجدت`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 4000 });
      const designPackage = this._extractJSON(response);
      
      return {
        success: true,
        data: designPackage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('DesignCoverAgent Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this._generateFallbackDesign(manuscript)
      };
    }
  }

  /**
   * توليد prompt سريع لـ AI Art
   */
  async generateQuickAIPrompt(manuscript) {
    const { title, genre, mood } = manuscript;
    
    const prompt = `أنشئ Midjourney prompt مفصل لغلاف كتاب:

العنوان: ${title}
النوع: ${genre}
المزاج: ${mood || 'تشويقي'}

أرجع JSON: {
  "prompt": "Detailed Midjourney prompt...",
  "settings": "--ar 2:3 --quality 2 --stylize 750"
}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 250 });
      return this._extractJSON(response);
    } catch (error) {
      return {
        prompt: `Book cover design for "${title}", ${genre} genre, professional, high quality, award winning design --ar 2:3`,
        settings: '--ar 2:3 --quality 2'
      };
    }
  }

  /**
   * توليد نظام ألوان سريع
   */
  async generateQuickColorPalette(manuscript) {
    const { genre, mood } = manuscript;
    
    const prompt = `اقترح نظام ألوان للكتاب:

النوع: ${genre}
المزاج: ${mood}

أرجع JSON: {
  "primary": "#HEX",
  "secondary": "#HEX",
  "accent": "#HEX",
  "reason": "سبب الاختيار"
}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 150 });
      return this._extractJSON(response);
    } catch (error) {
      return {
        primary: '#2C3E50',
        secondary: '#E74C3C',
        accent: '#ECF0F1',
        reason: 'ألوان كلاسيكية متوازنة'
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
          max_tokens: options.max_tokens || 3500
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
   * تصميم احتياطي
   */
  _generateFallbackDesign(manuscript) {
    const title = manuscript.title || 'كتاب رائع';
    const genre = manuscript.genre || 'عام';
    
    return {
      genreAnalysis: {
        genre: genre,
        themes: ['المعرفة', 'الإلهام'],
        emotions: ['الفضول', 'الإثارة'],
        symbols: ['كتاب', 'نور'],
        designImplications: 'تصميم بسيط وجذاب'
      },
      colorPalettes: [
        {
          name: 'كلاسيكي',
          primary: '#2C3E50',
          secondary: '#E74C3C',
          accent: '#ECF0F1',
          background: '#FFFFFF',
          psychology: 'ألوان جادة وموثوقة',
          usage: 'للكتب الأدبية والتعليمية'
        }
      ],
      designConcepts: [
        {
          name: 'Minimalist Elegance',
          description: 'تصميم بسيط وأنيق مع تركيز على الخط',
          composition: 'مركز مع مساحة سلبية واسعة',
          elements: ['العنوان', 'اسم المؤلف', 'عنصر بصري بسيط'],
          style: 'Minimalist',
          typography: 'Serif نظيف',
          impact: 'احترافي وراقي',
          bestFor: 'both'
        }
      ],
      aiPrompts: [
        {
          generator: 'Midjourney',
          positivePrompt: `Professional book cover design for "${title}", ${genre} genre, minimalist, elegant typography, award winning design, high quality --ar 2:3 --quality 2`,
          negativePrompt: 'cluttered, busy, low quality, blurry',
          style: 'minimalist professional',
          settings: {
            aspectRatio: '2:3',
            quality: 'high',
            stylize: '750'
          },
          keywords: ['book cover', 'professional', 'minimalist', genre]
        }
      ],
      typography: {
        titleFont: {
          options: ['Playfair Display', 'Merriweather', 'Lora'],
          size: '48-72pt',
          weight: 'Bold',
          fallback: 'Serif'
        },
        authorFont: {
          options: ['Open Sans', 'Lato', 'Roboto'],
          size: '18-24pt',
          weight: 'Light'
        }
      },
      layoutComposition: {
        gridSystem: 'شبكة بسيطة مركزية',
        titlePlacement: 'Center',
        authorPlacement: 'Bottom',
        balance: 'متوازن ومتناظر',
        focalPoints: ['العنوان'],
        negativeSpace: 'استخدام سخي للمساحة البيضاء'
      },
      printSpecifications: {
        dimensions: {
          paperback: '5.5 × 8.5 inches',
          hardcover: '6 × 9 inches'
        },
        resolution: '300 DPI',
        colorMode: {
          print: 'CMYK',
          digital: 'RGB'
        },
        bleed: '0.125 inches',
        safeZone: '0.25 inches',
        fileFormat: ['PDF', 'TIFF']
      },
      moodBoard: {
        referenceImages: [],
        successfulExamples: [],
        visualElements: [],
        textures: [],
        patterns: []
      },
      variations: {
        print: 'CMYK, 300 DPI',
        ebook: 'RGB, 72 DPI',
        thumbnail: '256×256px minimum',
        socialMedia: '1080×1080px',
        mockup3D: 'استخدام Smart Objects'
      },
      implementationNotes: {
        designerTips: [
          'حافظ على البساطة',
          'استخدم تباين عالي للقراءة'
        ],
        commonMistakes: [
          'الإفراط في العناصر',
          'خطوط صغيرة جداً'
        ],
        longTitles: 'استخدم سطرين مع حجم خط أصغر',
        marketAdaptation: 'تكيف مع توقعات السوق المستهدف'
      }
    };
  }
}

export default DesignCoverAgent;
