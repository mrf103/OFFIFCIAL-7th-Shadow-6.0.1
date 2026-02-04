/**
 * PDFGenerator - مولد ملفات PDF
 * 
 * إنشاء ملفات PDF احترافية مع دعم:
 * - اللغة العربية (RTL)
 * - فهرس المحتويات
 * - ترقيم الصفحات
 * - تنسيق احترافي
 */

import jsPDF from 'jspdf';

class PDFGenerator {
  constructor() {
    this.defaultOptions = {
      format: 'a4',
      orientation: 'portrait',
      unit: 'mm',
      rtl: true,
      fontSize: 12,
      lineHeight: 1.5,
      margin: {
        top: 25,
        right: 20,
        bottom: 25,
        left: 20
      }
    };
  }

  /**
   * توليد PDF
   */
  async generate(manuscript, options = {}) {
    const config = { ...this.defaultOptions, ...options };
    
    try {
      // إنشاء مستند PDF
      const doc = new jsPDF({
        orientation: config.orientation,
        unit: config.unit,
        format: config.format
      });

      // تحميل خط عربي (إذا كان متوفراً)
      // Note: jsPDF يحتاج ملف خط TTF محول إلى base64
      // في الإنتاج، يجب تضمين خط عربي
      
      let currentY = config.margin.top;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - config.margin.left - config.margin.right;

      // صفحة الغلاف
      if (config.includeCover !== false) {
        currentY = this._addCoverPage(doc, manuscript, config, pageWidth, pageHeight);
        doc.addPage();
        currentY = config.margin.top;
      }

      // فهرس المحتويات
      if (config.includeTableOfContents && manuscript.chapters?.length) {
        currentY = this._addTableOfContents(doc, manuscript.chapters, config, contentWidth);
        doc.addPage();
        currentY = config.margin.top;
      }

      // المحتوى الرئيسي
      const content = manuscript.processedText || manuscript.content;
      
      if (manuscript.chapters?.length) {
        // إذا كان مقسم إلى فصول
        for (let i = 0; i < manuscript.chapters.length; i++) {
          const chapter = manuscript.chapters[i];
          currentY = this._addChapter(doc, chapter, i + 1, config, contentWidth, pageHeight, currentY);
        }
      } else {
        // نص واحد بدون فصول
        currentY = this._addText(doc, content, config, contentWidth, pageHeight, currentY);
      }

      // ترقيم الصفحات
      if (config.includePageNumbers !== false) {
        this._addPageNumbers(doc, config, pageWidth, pageHeight);
      }

      // إنشاء Blob
      const pdfBlob = doc.output('blob');
      
      return {
        blob: pdfBlob,
        filename: `${manuscript.title || 'book'}.pdf`,
        size: pdfBlob.size,
        pages: doc.internal.pages.length - 1 // -1 لأن jsPDF يبدأ بصفحة فارغة
      };

    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  /**
   * إضافة صفحة الغلاف
   */
  _addCoverPage(doc, manuscript, config, pageWidth, pageHeight) {
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;

    // العنوان
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    const title = manuscript.title || 'عنوان الكتاب';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, config.rtl ? pageWidth - centerX - titleWidth/2 : centerX, centerY - 20, {
      align: config.rtl ? 'right' : 'center'
    });

    // المؤلف
    if (manuscript.author) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      const author = manuscript.author;
      const authorWidth = doc.getTextWidth(author);
      doc.text(author, config.rtl ? pageWidth - centerX - authorWidth/2 : centerX, centerY + 10, {
        align: config.rtl ? 'right' : 'center'
      });
    }

    // التاريخ
    doc.setFontSize(12);
    const date = new Date().toLocaleDateString('ar-SA');
    const dateWidth = doc.getTextWidth(date);
    doc.text(date, config.rtl ? pageWidth - centerX - dateWidth/2 : centerX, pageHeight - 30, {
      align: config.rtl ? 'right' : 'center'
    });

    return pageHeight;
  }

  /**
   * إضافة فهرس المحتويات
   */
  addTableOfContents(doc, manuscript, config) {
    const chapters = manuscript.chapters || [];
    let currentY = config.margin.top;

    // عنوان الفهرس
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const tocTitle = 'الفهرس';
    const pageWidth = doc.internal.pageSize.getWidth();
    const x = config.rtl ? pageWidth - config.margin.right : config.margin.left;
    doc.text(tocTitle, x, currentY, { align: config.rtl ? 'right' : 'left' });
    currentY += 15;

    // قائمة الفصول
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    chapters.forEach((chapter, index) => {
      const chapterTitle = chapter.title || `الفصل ${index + 1}`;
      const pageNum = chapter.pageNumber || (index * 5 + 3); // تقدير رقم الصفحة
      
      const text = `${chapterTitle} ................ ${pageNum}`;
      doc.text(text, x, currentY, { align: config.rtl ? 'right' : 'left' });
      currentY += 8;

      // صفحة جديدة إذا امتلأت
      if (currentY > doc.internal.pageSize.getHeight() - config.margin.bottom) {
        doc.addPage();
        currentY = config.margin.top;
      }
    });

    return currentY;
  }

  /**
   * إضافة فصل
   */
  _addChapter(doc, chapter, chapterNumber, config, contentWidth, pageHeight, startY) {
    let currentY = startY;

    // عنوان الفصل
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    const chapterTitle = chapter.title || `الفصل ${chapterNumber}`;
    const x = config.rtl ? doc.internal.pageSize.getWidth() - config.margin.right : config.margin.left;
    
    doc.text(chapterTitle, x, currentY, { align: config.rtl ? 'right' : 'left' });
    currentY += 12;

    // محتوى الفصل
    doc.setFontSize(config.fontSize);
    doc.setFont('helvetica', 'normal');

    const content = chapter.content || '';
    currentY = this._addText(doc, content, config, contentWidth, pageHeight, currentY);

    // فاصل بين الفصول
    currentY += 10;
    if (currentY > pageHeight - config.margin.bottom) {
      doc.addPage();
      currentY = config.margin.top;
    }

    return currentY;
  }

  /**
   * إضافة نص مع التفاف
   */
  _addText(doc, text, config, contentWidth, pageHeight, startY) {
    let currentY = startY;
    const x = config.rtl ? doc.internal.pageSize.getWidth() - config.margin.right : config.margin.left;

    // تقسيم النص إلى فقرات
    const paragraphs = text.split('\n\n');

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      // تقسيم الفقرة إلى أسطر تتناسب مع العرض
      const lines = doc.splitTextToSize(paragraph, contentWidth);

      for (const line of lines) {
        // التحقق من المساحة المتبقية
        if (currentY > pageHeight - config.margin.bottom) {
          doc.addPage();
          currentY = config.margin.top;
        }

        doc.text(line, x, currentY, { 
          align: config.rtl ? 'right' : 'left',
          maxWidth: contentWidth
        });
        currentY += config.fontSize * config.lineHeight * 0.35; // Convert pt to mm
      }

      // مسافة بين الفقرات
      currentY += 5;
    }

    return currentY;
  }

  /**
   * إضافة أرقام الصفحات
   */
  _addPageNumbers(doc, config, pageWidth, pageHeight) {
    const totalPages = doc.internal.pages.length - 1;

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      
      const pageNum = config.rtl ? 
        `${this._convertToArabicNumerals(i)} / ${this._convertToArabicNumerals(totalPages)}` :
        `${i} / ${totalPages}`;
      
      const x = pageWidth / 2;
      const y = pageHeight - 15;
      
      doc.text(pageNum, x, y, { align: 'center' });
    }
  }

  /**
   * تحويل الأرقام إلى عربية
   */
  _convertToArabicNumerals(num) {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(d => arabicNumerals[parseInt(d)] || d).join('');
  }

  /**
   * تنزيل PDF
   */
  download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export default PDFGenerator;
