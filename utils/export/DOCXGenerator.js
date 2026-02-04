/**
 * DOCXGenerator - مولد ملفات DOCX
 * 
 * إنشاء مستندات Word متوافقة مع:
 * - Microsoft Word
 * - Google Docs
 * - LibreOffice Writer
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TableOfContents } from 'docx';
import { saveAs } from 'file-saver';

class DOCXGenerator {
  constructor() {
    this.defaultOptions = {
      language: 'ar',
      direction: 'rtl',
      fontSize: 24, // 12pt (half-points)
      fontFamily: 'Arial',
      lineSpacing: 360, // 1.5
      includeCover: true,
      includeTableOfContents: true,
      includePageNumbers: true
    };
  }

  /**
   * توليد DOCX
   */
  async generate(manuscript, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      const sections = [];
      
      // 1. صفحة الغلاف
      if (config.includeCover) {
        sections.push(...this._generateCoverPage(manuscript, config));
      }
      
      // 2. جدول المحتويات
      if (config.includeTableOfContents) {
        sections.push(
          new Paragraph({
            text: 'الفهرس',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          new TableOfContents('الفهرس', {
            hyperlink: true,
            headingStyleRange: '1-3'
          }),
          this._pageBreak()
        );
      }
      
      // 3. الفصول
      const chapters = manuscript.chapters || this._splitIntoChapters(manuscript.content);
      chapters.forEach((chapter, index) => {
        sections.push(...this._generateChapter(chapter, index + 1, config));
      });
      
      // إنشاء المستند
      const doc = new Document({
        creator: manuscript.author || 'Shadow Seven Agency',
        title: manuscript.title || 'Untitled',
        description: manuscript.description || '',
        styles: this._generateStyles(config),
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: sections
        }]
      });
      
      // توليد Blob
      const docxBlob = await Packer.toBlob(doc);
      
      return {
        blob: docxBlob,
        filename: `${manuscript.title || 'book'}.docx`,
        size: docxBlob.size
      };
      
    } catch (error) {
      console.error('DOCX Generation Error:', error);
      throw new Error(`Failed to generate DOCX: ${error.message}`);
    }
  }

  /**
   * توليد صفحة الغلاف
   */
  _generateCoverPage(manuscript, config) {
    const title = manuscript.title || 'عنوان الكتاب';
    const author = manuscript.author || 'اسم المؤلف';
    const date = new Date().toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return [
      // عنوان الكتاب
      new Paragraph({
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 48, // 24pt
            font: config.fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 4000, after: 800 },
        bidirectional: config.direction === 'rtl'
      }),
      
      // اسم المؤلف
      new Paragraph({
        children: [
          new TextRun({
            text: author,
            size: 32, // 16pt
            font: config.fontFamily
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        bidirectional: config.direction === 'rtl'
      }),
      
      // التاريخ
      new Paragraph({
        children: [
          new TextRun({
            text: date,
            size: 24, // 12pt
            font: config.fontFamily,
            italics: true
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        bidirectional: config.direction === 'rtl'
      }),
      
      // فاصل صفحة
      this._pageBreak()
    ];
  }

  /**
   * توليد فصل
   */
  _generateChapter(chapter, chapterNumber, config) {
    const elements = [];
    const title = chapter.title || `الفصل ${chapterNumber}`;
    const content = chapter.content || chapter;
    
    // عنوان الفصل
    elements.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
        bidirectional: config.direction === 'rtl'
      })
    );
    
    // محتوى الفصل
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    paragraphs.forEach(para => {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: para.trim(),
              size: config.fontSize,
              font: config.fontFamily
            })
          ],
          spacing: {
            line: config.lineSpacing,
            after: 200
          },
          alignment: AlignmentType.JUSTIFIED,
          bidirectional: config.direction === 'rtl',
          indent: {
            firstLine: 720 // 0.5 inch first line indent
          }
        })
      );
    });
    
    // فاصل صفحة بعد الفصل
    elements.push(this._pageBreak());
    
    return elements;
  }

  /**
   * توليد الأنماط
   */
  _generateStyles(config) {
    return {
      default: {
        document: {
          run: {
            font: config.fontFamily,
            size: config.fontSize
          },
          paragraph: {
            spacing: {
              line: config.lineSpacing
            }
          }
        },
        heading1: {
          run: {
            size: 32, // 16pt
            bold: true,
            font: config.fontFamily
          },
          paragraph: {
            spacing: {
              before: 480,
              after: 240
            }
          }
        },
        heading2: {
          run: {
            size: 28, // 14pt
            bold: true,
            font: config.fontFamily
          },
          paragraph: {
            spacing: {
              before: 360,
              after: 180
            }
          }
        },
        heading3: {
          run: {
            size: 26, // 13pt
            bold: true,
            font: config.fontFamily
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120
            }
          }
        }
      }
    };
  }

  /**
   * فاصل صفحة
   */
  _pageBreak() {
    return new Paragraph({
      children: [],
      pageBreakBefore: true
    });
  }

  /**
   * تقسيم النص إلى فصول
   */
  _splitIntoChapters(content) {
    // تقسيم بسيط بناءً على الفقرات
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    const chapterSize = Math.ceil(paragraphs.length / 10);
    
    const chapters = [];
    for (let i = 0; i < paragraphs.length; i += chapterSize) {
      chapters.push({
        title: `الفصل ${Math.floor(i / chapterSize) + 1}`,
        content: paragraphs.slice(i, i + chapterSize).join('\n\n')
      });
    }
    
    return chapters;
  }

  /**
   * تنزيل DOCX
   */
  download(blob, filename) {
    saveAs(blob, filename);
  }
}

export default DOCXGenerator;
