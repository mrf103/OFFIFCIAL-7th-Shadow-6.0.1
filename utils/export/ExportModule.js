/**
 * ExportModule - نظام التصدير الشامل
 * 
 * وحدة مركزية لتصدير الكتب بجميع الصيغ:
 * PDF, EPUB, DOCX, وتجميعها في حزمة ZIP
 */

import PDFGenerator from './PDFGenerator.js';
import EPUBGenerator from './EPUBGenerator.js';
import DOCXGenerator from './DOCXGenerator.js';
import ZIPPackager from './ZIPPackager.js';

class ExportModule {
  constructor() {
    this.pdfGenerator = new PDFGenerator();
    this.epubGenerator = new EPUBGenerator();
    this.docxGenerator = new DOCXGenerator();
    this.zipPackager = new ZIPPackager();
  }

  /**
   * تصدير إلى PDF
   */
  async exportToPDF(manuscript, options = {}) {
    try {
      const result = await this.pdfGenerator.generate(manuscript, {
        includeTableOfContents: options.includeTOC !== false,
        includePageNumbers: options.includePageNumbers !== false,
        fontSize: options.fontSize || 12,
        fontFamily: options.fontFamily || 'Arial',
        rtl: options.rtl !== false,
        ...options
      });
      
      return result;
    } catch (error) {
      throw new Error(`PDF Export Failed: ${error.message}`);
    }
  }

  /**
   * تصدير إلى EPUB
   */
  async exportToEPUB(manuscript, options = {}) {
    
    try {
      const result = await this.epubGenerator.generate(manuscript, {
        includeTableOfContents: options.includeTOC !== false,
        includeCover: options.includeCover !== false,
        language: options.language || 'ar',
        ...options
      });
      
      return result;
    } catch (error) {
      console.error('❌ فشل تصدير EPUB:', error);
      throw new Error(`EPUB Export Failed: ${error.message}`);
    }
  }

  /**
   * تصدير إلى DOCX
   */
  async exportToDOCX(manuscript, options = {}) {
    
    try {
      const result = await this.docxGenerator.generate(manuscript, {
        includeTableOfContents: options.includeTOC !== false,
        enableTrackChanges: options.enableTrackChanges || false,
        fontSize: options.fontSize || 12,
        rtl: options.rtl !== false,
        ...options
      });
      
      return result;
    } catch (error) {
      console.error('❌ فشل تصدير DOCX:', error);
      throw new Error(`DOCX Export Failed: ${error.message}`);
    }
  }

  /**
   * تصدير بجميع الصيغ
   */
  async exportAll(manuscript, options = {}) {
    
    const results = {
      pdf: null,
      epub: null,
      docx: null,
      errors: []
    };

    // تصدير متوازي للسرعة
    const exports = await Promise.allSettled([
      this.exportToPDF(manuscript, options),
      this.exportToEPUB(manuscript, options),
      this.exportToDOCX(manuscript, options)
    ]);

    // معالجة النتائج
    if (exports[0].status === 'fulfilled') {
      results.pdf = exports[0].value;
    } else {
      results.errors.push({ format: 'PDF', error: exports[0].reason.message });
    }

    if (exports[1].status === 'fulfilled') {
      results.epub = exports[1].value;
    } else {
      results.errors.push({ format: 'EPUB', error: exports[1].reason.message });
    }

    if (exports[2].status === 'fulfilled') {
      results.docx = exports[2].value;
    } else {
      results.errors.push({ format: 'DOCX', error: exports[2].reason.message });
    }

    return results;
  }

  /**
   * إنشاء حزمة Agency كاملة (ZIP)
   */
  async createAgencyPackage(agencyData, options = {}) {
    
    try {
      // المرحلة 1: تصدير الكتاب بجميع الصيغ
      const exports = await this.exportAll(agencyData.manuscript, options);
      
      // المرحلة 2: تجميع كل شيء في ZIP
      const zipFile = await this.zipPackager.createPackage({
        manuscript: agencyData.manuscript,
        exports: exports,
        marketing: agencyData.marketing,
        socialMedia: agencyData.socialMedia,
        mediaScripts: agencyData.mediaScripts,
        coverDesign: agencyData.coverDesign,
        options: options
      });
      
      
      return {
        success: true,
        zipFile: zipFile,
        exports: exports,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ فشل إنشاء حزمة Agency:', error);
      throw new Error(`Agency Package Creation Failed: ${error.message}`);
    }
  }

  /**
   * تنزيل ملف
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * الحصول على generator محدد
   */
  getGenerator(format) {
    const generators = {
      pdf: this.pdfGenerator,
      epub: this.epubGenerator,
      docx: this.docxGenerator
    };
    return generators[format.toLowerCase()];
  }

  /**
   * التحقق من دعم التصدير
   */
  isFormatSupported(format) {
    return ['pdf', 'epub', 'docx', 'zip'].includes(format.toLowerCase());
  }

  /**
   * الحصول على معلومات الصيغ المدعومة
   */
  getSupportedFormats() {
    return [
      {
        format: 'PDF',
        extension: '.pdf',
        mimeType: 'application/pdf',
        description: 'ملف PDF للطباعة والقراءة الرقمية',
        features: ['Table of Contents', 'Page Numbers', 'RTL Support']
      },
      {
        format: 'EPUB',
        extension: '.epub',
        mimeType: 'application/epub+zip',
        description: 'كتاب إلكتروني متوافق مع Kindle والقارئات الإلكترونية',
        features: ['Reflowable Text', 'Metadata', 'Cover Image', 'TOC']
      },
      {
        format: 'DOCX',
        extension: '.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        description: 'مستند Word قابل للتحرير',
        features: ['Track Changes', 'Comments', 'Styles', 'TOC']
      },
      {
        format: 'ZIP',
        extension: '.zip',
        mimeType: 'application/zip',
        description: 'حزمة Agency in a Box الكاملة',
        features: ['All Formats', 'Marketing Materials', 'Scripts', 'Design Assets']
      }
    ];
  }
}

// Singleton instance
const exportModule = new ExportModule();

export { ExportModule };
export default exportModule;
