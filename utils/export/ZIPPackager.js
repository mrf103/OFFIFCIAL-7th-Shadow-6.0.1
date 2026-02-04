/**
 * ZIPPackager - مغلف الحزمة الكاملة
 * 
 * إنشاء حزمة Agency in a Box الشاملة:
 * - الكتاب (PDF, EPUB, DOCX)
 * - المحتوى التسويقي
 * - محتوى السوشيال ميديا
 * - السكريبتات الإعلامية
 * - أفكار التصميم
 * - دليل الاستخدام
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

class ZIPPackager {
  constructor() {
    this.defaultOptions = {
      compressionLevel: 6, // 0-9 (9 أقصى ضغط)
      includeReadme: true,
      includeSampleFiles: false
    };
  }

  /**
   * إنشاء حزمة Agency كاملة
   */
  async createAgencyPackage(agencyData, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      const zip = new JSZip();
      const packageName = this._sanitizeFilename(agencyData.manuscript?.title || 'agency_package');
      
      // المجلد الرئيسي
      const root = zip.folder(packageName);
      
      // 1. مجلد الكتاب
      if (agencyData.exports) {
        const bookFolder = root.folder('01_Book');
        
        if (agencyData.exports.pdf) {
          bookFolder.file(`${packageName}.pdf`, agencyData.exports.pdf);
        }
        
        if (agencyData.exports.epub) {
          bookFolder.file(`${packageName}.epub`, agencyData.exports.epub);
        }
        
        if (agencyData.exports.docx) {
          bookFolder.file(`${packageName}.docx`, agencyData.exports.docx);
        }
      }
      
      // 2. مجلد التسويق
      if (agencyData.marketing) {
        const marketingFolder = root.folder('02_Marketing');
        
        // ملف JSON كامل
        marketingFolder.file(
          'marketing_package.json',
          JSON.stringify(agencyData.marketing, null, 2)
        );
        
        // ملف Markdown منسق
        marketingFolder.file(
          'marketing_content.md',
          this._formatMarketingMarkdown(agencyData.marketing)
        );
        
        // ملفات فردية
        if (agencyData.marketing.catchyTitles) {
          marketingFolder.file(
            'catchy_titles.txt',
            agencyData.marketing.catchyTitles.join('\n\n')
          );
        }
        
        if (agencyData.marketing.elevatorPitch) {
          marketingFolder.file('elevator_pitch.txt', agencyData.marketing.elevatorPitch);
        }
        
        if (agencyData.marketing.seoKeywords) {
          marketingFolder.file(
            'seo_keywords.txt',
            agencyData.marketing.seoKeywords.join(', ')
          );
        }
      }
      
      // 3. مجلد السوشيال ميديا
      if (agencyData.socialMedia) {
        const socialFolder = root.folder('03_Social_Media');
        
        // ملف JSON كامل
        socialFolder.file(
          'social_media_package.json',
          JSON.stringify(agencyData.socialMedia, null, 2)
        );
        
        // منصات منفصلة
        const platforms = ['twitter', 'facebook', 'instagram', 'linkedin', 'tiktok'];
        platforms.forEach(platform => {
          if (agencyData.socialMedia[platform]) {
            const platformFolder = socialFolder.folder(platform);
            
            // Posts/Tweets
            if (Array.isArray(agencyData.socialMedia[platform])) {
              platformFolder.file(
                `${platform}_posts.json`,
                JSON.stringify(agencyData.socialMedia[platform], null, 2)
              );
              
              platformFolder.file(
                `${platform}_posts.txt`,
                agencyData.socialMedia[platform]
                  .map((post, i) => `--- Post ${i + 1} ---\n${post}`)
                  .join('\n\n')
              );
            }
          }
        });
        
        // التقويم الشهري
        if (agencyData.socialMedia.contentCalendar) {
          socialFolder.file(
            'content_calendar.json',
            JSON.stringify(agencyData.socialMedia.contentCalendar, null, 2)
          );
          
          socialFolder.file(
            'content_calendar.md',
            this._formatCalendarMarkdown(agencyData.socialMedia.contentCalendar)
          );
        }
      }
      
      // 4. مجلد السكريبتات الإعلامية
      if (agencyData.mediaScripts) {
        const scriptsFolder = root.folder('04_Media_Scripts');
        
        // ملف JSON كامل
        scriptsFolder.file(
          'media_scripts_package.json',
          JSON.stringify(agencyData.mediaScripts, null, 2)
        );
        
        // سكريبتات منفصلة
        const scriptTypes = [
          { key: 'youtubeScript', name: 'youtube_script' },
          { key: 'podcastScript', name: 'podcast_script' },
          { key: 'bookTrailer', name: 'book_trailer' },
          { key: 'radioAds', name: 'radio_ads' },
          { key: 'reelsScripts', name: 'reels_scripts' },
          { key: 'storyboard', name: 'storyboard' }
        ];
        
        scriptTypes.forEach(({ key, name }) => {
          if (agencyData.mediaScripts[key]) {
            const data = agencyData.mediaScripts[key];
            
            // JSON format
            scriptsFolder.file(
              `${name}.json`,
              JSON.stringify(data, null, 2)
            );
            
            // Text format
            if (typeof data === 'string') {
              scriptsFolder.file(`${name}.txt`, data);
            } else if (typeof data === 'object') {
              scriptsFolder.file(
                `${name}.txt`,
                JSON.stringify(data, null, 2)
              );
            }
          }
        });
        
        // أسئلة المقابلات
        if (agencyData.mediaScripts.interviewQuestions) {
          scriptsFolder.file(
            'interview_questions.md',
            this._formatInterviewQuestionsMarkdown(agencyData.mediaScripts.interviewQuestions)
          );
        }
      }
      
      // 5. مجلد التصميم
      if (agencyData.design) {
        const designFolder = root.folder('05_Design');
        
        // ملف JSON كامل
        designFolder.file(
          'design_package.json',
          JSON.stringify(agencyData.design, null, 2)
        );
        
        // لوحات الألوان
        if (agencyData.design.colorPalettes) {
          designFolder.file(
            'color_palettes.json',
            JSON.stringify(agencyData.design.colorPalettes, null, 2)
          );
          
          designFolder.file(
            'color_palettes.md',
            this._formatColorPalettesMarkdown(agencyData.design.colorPalettes)
          );
        }
        
        // أفكار التصميم
        if (agencyData.design.designConcepts) {
          designFolder.file(
            'design_concepts.md',
            agencyData.design.designConcepts
              .map((concept, i) => `## تصميم ${i + 1}\n\n${concept}`)
              .join('\n\n---\n\n')
          );
        }
        
        // AI Prompts
        if (agencyData.design.aiPrompts) {
          designFolder.file(
            'ai_prompts.txt',
            agencyData.design.aiPrompts
              .map((prompt, i) => `--- Prompt ${i + 1} ---\n${prompt}`)
              .join('\n\n')
          );
        }
        
        // Mood Board
        if (agencyData.design.moodBoard) {
          designFolder.file('mood_board.md', agencyData.design.moodBoard);
        }
      }
      
      // 6. README.md
      if (config.includeReadme) {
        root.file('README.md', this._generateReadme(agencyData, packageName));
      }
      
      // 7. دليل الاستخدام
      root.file('USER_GUIDE.md', this._generateUserGuide());
      
      // توليد ZIP
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: config.compressionLevel
        }
      });
      
      return {
        blob: zipBlob,
        filename: `${packageName}_agency_package.zip`,
        size: zipBlob.size
      };
      
    } catch (error) {
      console.error('ZIP Packaging Error:', error);
      throw new Error(`Failed to create agency package: ${error.message}`);
    }
  }

  /**
   * تنسيق التسويق Markdown
   */
  _formatMarketingMarkdown(marketing) {
    let md = '# 📢 حزمة المحتوى التسويقي\n\n';
    
    if (marketing.catchyTitles) {
      md += '## 🎯 عناوين جذابة\n\n';
      marketing.catchyTitles.forEach((title, i) => {
        md += `${i + 1}. ${title}\n`;
      });
      md += '\n';
    }
    
    if (marketing.elevatorPitch) {
      md += '## 🚀 Elevator Pitch\n\n';
      md += `${marketing.elevatorPitch}\n\n`;
    }
    
    if (marketing.longDescription) {
      md += '## 📝 الوصف الطويل\n\n';
      md += `${marketing.longDescription}\n\n`;
    }
    
    if (marketing.sellingPoints) {
      md += '## ⭐ نقاط البيع الرئيسية\n\n';
      marketing.sellingPoints.forEach(point => {
        md += `- ${point}\n`;
      });
      md += '\n';
    }
    
    if (marketing.seoKeywords) {
      md += '## 🔍 كلمات SEO\n\n';
      md += marketing.seoKeywords.join(', ') + '\n\n';
    }
    
    if (marketing.hashtags) {
      md += '## #️⃣ هاشتاجات\n\n';
      md += marketing.hashtags.join(' ') + '\n\n';
    }
    
    return md;
  }

  /**
   * تنسيق التقويم Markdown
   */
  _formatCalendarMarkdown(calendar) {
    let md = '# 📅 التقويم الشهري للمحتوى\n\n';
    
    if (Array.isArray(calendar)) {
      calendar.forEach((day, i) => {
        md += `## اليوم ${i + 1}\n\n`;
        if (typeof day === 'object') {
          Object.entries(day).forEach(([key, value]) => {
            md += `**${key}**: ${value}\n\n`;
          });
        } else {
          md += `${day}\n\n`;
        }
      });
    }
    
    return md;
  }

  /**
   * تنسيق أسئلة المقابلات Markdown
   */
  _formatInterviewQuestionsMarkdown(questions) {
    let md = '# 🎤 أسئلة المقابلات\n\n';
    
    ['basic', 'intermediate', 'advanced'].forEach(level => {
      if (questions[level]) {
        md += `## مستوى: ${level === 'basic' ? 'مبتدئ' : level === 'intermediate' ? 'متوسط' : 'متقدم'}\n\n`;
        questions[level].forEach((q, i) => {
          md += `${i + 1}. ${q}\n`;
        });
        md += '\n';
      }
    });
    
    return md;
  }

  /**
   * تنسيق لوحات الألوان Markdown
   */
  _formatColorPalettesMarkdown(palettes) {
    let md = '# 🎨 لوحات الألوان\n\n';
    
    palettes.forEach((palette, i) => {
      md += `## لوحة ${i + 1}\n\n`;
      md += `**الاسم**: ${palette.name || 'بدون اسم'}\n`;
      md += `**الألوان**: ${palette.colors?.join(', ') || 'N/A'}\n`;
      md += `**الوصف**: ${palette.description || 'N/A'}\n\n`;
    });
    
    return md;
  }

  /**
   * توليد README
   */
  _generateReadme(agencyData, packageName) {
    const title = agencyData.manuscript?.title || packageName;
    const author = agencyData.manuscript?.author || 'Unknown Author';
    
    return `# 📦 ${title} - Agency in a Box

## 🎯 نظرة عامة

هذه الحزمة الكاملة تم إنشاؤها بواسطة **الظل السابع - Shadow Seven Agency**

تحتوي على كل ما تحتاجه لتسويق ونشر كتابك بشكل احترافي.

---

## 📂 محتويات الحزمة

### 📖 01_Book
- **PDF**: نسخة قابلة للطباعة والقراءة
- **EPUB**: نسخة للقراء الإلكترونية (Kindle, Apple Books, etc.)
- **DOCX**: نسخة قابلة للتعديل في Word

### 📢 02_Marketing
- استراتيجية تسويقية كاملة
- عناوين جذابة
- وصف طويل وقصير
- كلمات مفتاحية SEO
- هاشتاجات جاهزة

### 📱 03_Social_Media
- محتوى لـ 5 منصات (Twitter, Facebook, Instagram, LinkedIn, TikTok)
- تقويم محتوى لمدة 30 يوم
- استراتيجيات التفاعل

### 🎬 04_Media_Scripts
- سكريبت يوتيوب (5-8 دقائق)
- سكريبت بودكاست (20-30 دقيقة)
- إعلانات راديو (30s/60s)
- سكريبتات ريلز
- أسئلة مقابلات

### 🎨 05_Design
- 4 لوحات ألوان احترافية
- 5 أفكار تصميم غلاف
- 5 AI Prompts للتصميم
- Mood Board
- مواصفات الطباعة

---

## 🚀 كيفية الاستخدام

1. **نشر الكتاب**: استخدم ملفات PDF/EPUB/DOCX للنشر على المنصات المختلفة
2. **التسويق**: اتبع الاستراتيجية في مجلد Marketing
3. **السوشيال ميديا**: جدول المحتوى جاهز لـ 30 يوم
4. **الإعلام**: استخدم السكريبتات للبودكاست واليوتيوب
5. **التصميم**: شارك الـ AI Prompts مع المصمم أو استخدمها في Midjourney/DALL-E

---

## 📊 الإحصائيات

- **المؤلف**: ${author}
- **تاريخ الإنشاء**: ${new Date().toLocaleDateString('ar-EG')}
- **النسخة**: 1.0.0

---

## 💡 نصائح

- ابدأ بنشر المحتوى على السوشيال ميديا قبل إطلاق الكتاب بأسبوعين
- استخدم الهاشتاجات المقترحة لزيادة الوصول
- جرب عدة عناوين واختر الأكثر تفاعلاً
- تواصل مع البودكاستات باستخدام أسئلة المقابلات المعدة

---

## 🔗 الدعم

للمزيد من المعلومات، راجع ملف **USER_GUIDE.md**

---

**🌟 صُنع بحب بواسطة الظل السابع - Shadow Seven Agency**
`;
  }

  /**
   * توليد دليل الاستخدام
   */
  _generateUserGuide() {
    return `# 📘 دليل الاستخدام - Agency in a Box

## 🎯 مرحباً بك!

هذا الدليل الشامل سيساعدك على الاستفادة القصوى من حزمة Agency in a Box.

---

## 📋 الخطوات الأولى

### 1️⃣ مراجعة المحتوى
- افتح ملف **README.md** للحصول على نظرة عامة
- راجع جميع الملفات في كل مجلد
- تأكد من اكتمال جميع المحتويات

### 2️⃣ النشر
**PDF**:
- جاهز للطباعة (300 DPI)
- يمكن استخدامه في Amazon KDP
- مناسب للنشر الإلكتروني

**EPUB**:
- ارفعه مباشرة على Kindle Direct Publishing
- متوافق مع Apple Books
- يعمل على جميع القراء الإلكترونية

**DOCX**:
- قابل للتعديل في Microsoft Word
- يمكن تحويله لـ PDF أو EPUB
- مناسب للمراجعات والتعديلات

### 3️⃣ التسويق

#### استراتيجية الإطلاق:
1. **قبل الإطلاق بأسبوعين**:
   - ابدأ نشر محتوى تشويقي
   - استخدم الـ Teasers من مجلد Social Media
   - أنشئ صفحة هبوط (Landing Page)

2. **أسبوع الإطلاق**:
   - انشر محتوى يومي على جميع المنصات
   - استخدم التقويم المحتوى
   - فعّل الإعلانات المدفوعة

3. **بعد الإطلاق**:
   - استمر في النشر وفق التقويم
   - شارك مراجعات القراء
   - تفاعل مع التعليقات

### 4️⃣ السوشيال ميديا

#### Twitter:
- 10 تغريدات جاهزة
- انشر 2-3 يومياً
- استخدم Thread لزيادة التفاعل

#### Facebook:
- 5 منشورات طويلة
- انشر مرة كل يومين
- أضف صور جذابة

#### Instagram:
- 8 كابشنات جاهزة
- استخدم Carousel Posts
- أضف Stories يومياً

#### LinkedIn:
- 3 منشورات احترافية
- شارك insights عن عملية الكتابة
- تواصل مع المؤثرين

#### TikTok:
- 5 سكريبتات ريلز
- 15-30 ثانية لكل فيديو
- استخدم Trending Sounds

### 5️⃣ الإعلام

#### YouTube:
- سكريبت فيديو 5-8 دقائق
- أضف مقدمة وخاتمة جذابة
- استخدم Call-to-Action

#### Podcast:
- سكريبت حلقة 20-30 دقيقة
- تواصل مع البودكاستات المهتمة
- شارك أسئلة المقابلات المعدة

#### راديو:
- إعلانات 30 و 60 ثانية
- تواصل مع المحطات المحلية
- جرب أوقات بث مختلفة

### 6️⃣ التصميم

#### استخدام AI Prompts:
1. **Midjourney**:
   \`\`\`
   /imagine [نسخ الـ Prompt من ملف ai_prompts.txt]
   \`\`\`

2. **DALL-E**:
   - افتح ChatGPT
   - اختر DALL-E 3
   - الصق الـ Prompt

3. **Stable Diffusion**:
   - استخدم نفس الـ Prompts
   - عدّل الـ Negative Prompts حسب الحاجة

#### اختيار لوحة الألوان:
- راجع الـ 4 لوحات المقترحة
- اختبرها على mockups
- استشر مصمم محترف

---

## 💰 خطة الربح

### 1. البيع المباشر:
- Amazon KDP
- Google Play Books
- Apple Books
- موقعك الشخصي

### 2. التسويق بالعمولة:
- برنامج Amazon Associates
- اربط مع المؤثرين

### 3. المحتوى الإضافي:
- كورسات مرتبطة
- Workshops
- استشارات

---

## 📊 تتبع الأداء

### مؤشرات النجاح (KPIs):
- عدد النسخ المباعة
- معدل التفاعل على السوشيال ميديا
- زيارات صفحة الهبوط
- معدل التحويل (Conversion Rate)

### أدوات التحليل:
- Google Analytics
- Facebook Insights
- Twitter Analytics
- Amazon KDP Reports

---

## ⚠️ أخطاء شائعة

1. ❌ **عدم الاتساق**: انشر بانتظام وفق التقويم
2. ❌ **إهمال التفاعل**: رد على جميع التعليقات
3. ❌ **الاستعجال**: امنح الحملة 2-3 أشهر
4. ❌ **عدم التنويع**: استخدم جميع القنوات المتاحة

---

## 🆘 الدعم

### أسئلة شائعة:

**س: هل يمكن تعديل المحتوى؟**
ج: نعم، جميع الملفات قابلة للتعديل.

**س: كم مدة الحملة التسويقية؟**
ج: 30 يوم على الأقل، يفضل 60-90 يوم.

**س: هل أحتاج مصمم؟**
ج: يُفضل، لكن يمكنك استخدام AI لإنشاء الغلاف.

---

## 🎉 نصائح النجاح

1. ✅ **كن صبوراً**: النجاح يحتاج وقت
2. ✅ **تفاعل مع الجمهور**: ابنِ مجتمع حول كتابك
3. ✅ **تعلم من البيانات**: راقب الأداء وعدّل
4. ✅ **استمر**: لا تتوقف بعد الإطلاق

---

**🌟 حظاً موفقاً في رحلتك!**

**الظل السابع - Shadow Seven Agency**
`;
  }

  /**
   * تنظيف اسم الملف
   */
  _sanitizeFilename(filename) {
    return filename
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s_-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }

  /**
   * تنزيل ZIP
   */
  download(blob, filename) {
    saveAs(blob, filename);
  }
}

export default ZIPPackager;
