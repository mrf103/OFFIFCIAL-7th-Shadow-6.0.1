/**
 * SocialMediaAgent - وكيل السوشال ميديا
 * 
 * توليد محتوى احترافي لمنصات التواصل الاجتماعي
 * يشمل: منشورات، تغريدات، قصص، كابشنز، تقويم محتوى
 */

import { geminiPro } from "@/api/geminiClient";

class SocialMediaAgent {
  constructor() {
    this.name = 'وكيل السوشال ميديا';
    this.role = 'social_media_content';
    this.description = 'توليد محتوى لمنصات التواصل الاجتماعي';
    this.model = geminiPro;
    this.temperature = 0.8; // إبداع عالي
    this.maxRetries = 3;
  }

  /**
   * توليد حزمة كاملة من محتوى السوشال ميديا
   */
  async generateSocialMediaPackage(manuscript) {
    const { title, content, genre, targetAudience } = manuscript;
    const contentSample = this._extractSample(content, 1500);
    
    const prompt = `أنت خبير محتوى سوشال ميديا متخصص في الترويج للكتب والمحتوى الثقافي.

**معلومات الكتاب:**
- العنوان: ${title || 'غير محدد'}
- النوع: ${genre || 'غير محدد'}
- الجمهور: ${targetAudience || 'عام'}
- عينة المحتوى:
${contentSample}

**مهمتك:** أنشئ حزمة محتوى سوشال ميديا شاملة تتضمن:

1. **تويتر/X - 10 تغريدات متنوعة**
   - كل تغريدة 250-280 حرف
   - أنماط مختلفة: تشويقية، اقتباسات، أسئلة، حقائق، دعوات
   - استخدم emojis بذكاء
   - أضف 2-3 هاشتاجات لكل تغريدة

2. **فيسبوك - 5 منشورات متنوعة**
   - منشور إعلاني طويل (150-200 كلمة)
   - منشور قصير وجذاب (50-80 كلمة)
   - منشور سؤال يشجع التفاعل
   - منشور اقتباس ملهم
   - منشور كواليس (Behind the scenes)

3. **إنستغرام - 8 كابشنز + اقتراحات**
   - كابشن رئيسي للإعلان (100-150 كلمة)
   - 3 كابشنز قصيرة (30-50 كلمة)
   - 4 كابشنز لقصص (Stories) - 15-25 كلمة
   - اقتراحات للصور المصاحبة
   - 10-15 هاشتاج لكل منشور

4. **لينكدإن - 3 منشورات احترافية**
   - منشور تحفيزي/مهني (200-250 كلمة)
   - منشور عن دروس مستفادة (150-180 كلمة)
   - منشور تعليمي/نصائح (100-150 كلمة)

5. **تيك توك - 5 أفكار سكريبتات قصيرة**
   - كل سكريبت 15-30 ثانية
   - مع وصف المشهد والحركة
   - Hook قوي في أول 3 ثواني

6. **تقويم المحتوى - خطة 30 يوم**
   - توزيع المحتوى على المنصات
   - أفضل أوقات النشر
   - تنويع بين المحتوى الترويجي والتفاعلي

7. **استراتيجيات التفاعل**
   - أسئلة لطرحها على المتابعين
   - مسابقات وتحديات مقترحة
   - طرق زيادة Engagement

**التنسيق المطلوب:** JSON بالشكل التالي:

\`\`\`json
{
  "twitter": {
    "tweets": [
      {
        "content": "نص التغريدة...",
        "hashtags": ["#هاشتاج1", "#هاشتاج2"],
        "type": "teaser|quote|question|fact|cta"
      }
    ]
  },
  "facebook": {
    "posts": [
      {
        "content": "نص المنشور...",
        "type": "announcement|short|question|quote|behind_scenes",
        "callToAction": "دعوة لاتخاذ إجراء"
      }
    ]
  },
  "instagram": {
    "posts": [
      {
        "caption": "الكابشن...",
        "hashtags": ["#هاشتاج1", "#هاشتاج2"],
        "imageIdea": "اقتراح للصورة",
        "type": "feed|story"
      }
    ]
  },
  "linkedin": {
    "posts": [
      {
        "content": "نص المنشور...",
        "type": "motivational|lessons|educational"
      }
    ]
  },
  "tiktok": {
    "scripts": [
      {
        "title": "عنوان الفيديو",
        "hook": "الـ Hook (أول 3 ثواني)",
        "content": "محتوى الفيديو",
        "visualIdeas": "اقتراحات بصرية",
        "duration": "15-30s"
      }
    ]
  },
  "contentCalendar": {
    "week1": [
      {
        "day": "الأحد",
        "platform": "Twitter",
        "content": "تغريدة تشويقية",
        "time": "9:00 صباحاً"
      }
    ],
    "week2": [],
    "week3": [],
    "week4": []
  },
  "engagementStrategies": {
    "questions": [
      "ما هو كتابك المفضل في هذا النوع؟",
      "..."
    ],
    "contests": [
      {
        "title": "مسابقة 1",
        "description": "وصف المسابقة",
        "prize": "الجائزة"
      }
    ],
    "challenges": [
      {
        "title": "تحدي 1",
        "description": "وصف التحدي"
      }
    ]
  }
}
\`\`\`

**ملاحظات مهمة:**
- استخدم لغة عصرية وجذابة
- ركز على القيمة والتفاعل وليس الترويج المباشر فقط
- نوّع بين المحتوى الترفيهي والتعليمي والتحفيزي
- استخدم emojis بذكاء (لا تفرط)
- اجعل المحتوى قابل للمشاركة`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 3000 });
      const socialPackage = this._extractJSON(response);
      
      return {
        success: true,
        data: socialPackage,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('SocialMediaAgent Error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this._generateFallbackSocial(manuscript)
      };
    }
  }

  /**
   * توليد تغريدة سريعة
   */
  async generateQuickTweet(manuscript, type = 'teaser') {
    const { title, genre } = manuscript;
    
    const types = {
      teaser: 'تشويقية تثير الفضول',
      quote: 'اقتباس ملهم',
      question: 'سؤال يشجع التفاعل',
      fact: 'حقيقة مثيرة',
      cta: 'دعوة لاتخاذ إجراء'
    };
    
    const prompt = `أنشئ تغريدة ${types[type]} عن الكتاب:

العنوان: ${title}
النوع: ${genre}

المتطلبات:
- 250-280 حرف فقط
- استخدم 1-2 emoji مناسب
- أضف 2-3 هاشتاجات
- اجعلها جذابة ومشوقة

أرجع JSON: {
  "tweet": "نص التغريدة...",
  "hashtags": ["#هاشتاج1", "#هاشتاج2"]
}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 200 });
      return this._extractJSON(response);
    } catch (error) {
      return {
        tweet: `📚 ${title} - كتاب يستحق القراءة!`,
        hashtags: ['#كتب', '#قراءة']
      };
    }
  }

  /**
   * توليد كابشن إنستغرام سريع
   */
  async generateQuickInstagramCaption(manuscript) {
    const contentSample = this._extractSample(manuscript.content, 300);
    
    const prompt = `اكتب كابشن إنستغرام جذاب (80-120 كلمة) للكتاب بناءً على:

${contentSample}

المتطلبات:
- ابدأ بـ Hook قوي
- استخدم 3-5 emojis
- أضف سطور فارغة للقراءة السهلة
- اختم بـ CTA
- أضف 10 هاشتاجات في النهاية

أرجع JSON: {
  "caption": "الكابشن...",
  "hashtags": ["#هاشتاج1", "..."]
}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 300 });
      return this._extractJSON(response);
    } catch (error) {
      return {
        caption: '📖 اكتشف عالماً جديداً من المعرفة...',
        hashtags: ['#كتب', '#قراءة', '#ثقافة']
      };
    }
  }

  /**
   * توليد منشور فيسبوك سريع
   */
  async generateQuickFacebookPost(manuscript, type = 'announcement') {
    const { title, content } = manuscript;
    const contentSample = this._extractSample(content, 500);
    
    const types = {
      announcement: 'إعلان',
      question: 'سؤال تفاعلي',
      quote: 'اقتباس ملهم'
    };
    
    const prompt = `اكتب منشور فيسبوك ${types[type]} (100-150 كلمة) للكتاب:

العنوان: ${title}
عينة: ${contentSample}

أرجع JSON: {
  "post": "نص المنشور...",
  "cta": "دعوة لاتخاذ إجراء"
}`;

    try {
      const response = await this._processWithRetry(prompt, { max_tokens: 250 });
      return this._extractJSON(response);
    } catch (error) {
      return {
        post: `📚 ${title}\n\nكتاب جديد يستحق القراءة...`,
        cta: 'اطلب نسختك الآن!'
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
          max_tokens: options.max_tokens || 2500
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
   * محتوى سوشال ميديا احتياطي
   */
  _generateFallbackSocial(manuscript) {
    const title = manuscript.title || 'كتاب رائع';
    
    return {
      twitter: {
        tweets: [
          {
            content: `📚 ${title} - رحلة جديدة في عالم المعرفة! #كتب #قراءة`,
            hashtags: ['#كتب', '#قراءة'],
            type: 'teaser'
          }
        ]
      },
      facebook: {
        posts: [
          {
            content: `📖 ${title}\n\nكتاب جديد يستحق القراءة والاقتناء!`,
            type: 'announcement',
            callToAction: 'احصل على نسختك الآن'
          }
        ]
      },
      instagram: {
        posts: [
          {
            caption: `📚 ${title}\n\n✨ اكتشف عالماً جديداً\n\n#كتب #قراءة #ثقافة`,
            hashtags: ['#كتب', '#قراءة', '#ثقافة'],
            imageIdea: 'صورة غلاف الكتاب',
            type: 'feed'
          }
        ]
      },
      linkedin: {
        posts: [
          {
            content: `📖 ${title}\n\nكتاب يستحق القراءة والتأمل.`,
            type: 'educational'
          }
        ]
      },
      tiktok: {
        scripts: [
          {
            title: `مراجعة ${title}`,
            hook: 'هذا الكتاب غيّر نظرتي للأمور!',
            content: 'عرض سريع للكتاب',
            visualIdeas: 'تصوير الكتاب مع موسيقى',
            duration: '15-30s'
          }
        ]
      },
      contentCalendar: {
        week1: [],
        week2: [],
        week3: [],
        week4: []
      },
      engagementStrategies: {
        questions: ['ما هو كتابك المفضل؟'],
        contests: [],
        challenges: []
      }
    };
  }
}

export default SocialMediaAgent;
