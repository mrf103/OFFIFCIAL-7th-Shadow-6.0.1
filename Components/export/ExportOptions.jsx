/**
 * ExportOptions - واجهة خيارات التصدير
 * 
 * يسمح للمستخدم باختيار:
 * - الصيغ (PDF, EPUB, DOCX)
 * - حزمة Agency كاملة
 * - خيارات التخصيص
 */

import { useState } from 'react';
import { FileDown, Package, FileText, BookOpen, FileImage } from 'lucide-react';

const ExportOptions = ({ onExport }) => {
  const [selectedFormats, setSelectedFormats] = useState({
    pdf: true,
    epub: false,
    docx: false
  });
  
  const [includeAgencyPackage, setIncludeAgencyPackage] = useState(false);
  
  const [exportOptions, setExportOptions] = useState({
    includeCover: true,
    includeTableOfContents: true,
    includePageNumbers: true,
    fontSize: 12,
    lineSpacing: 1.5
  });
  
  const [isExporting, setIsExporting] = useState(false);

  // التعامل مع تغيير الصيغ
  const handleFormatToggle = (format) => {
    setSelectedFormats(prev => ({
      ...prev,
      [format]: !prev[format]
    }));
  };

  // التعامل مع بدء التصدير
  const handleStartExport = async () => {
    // التحقق من اختيار صيغة واحدة على الأقل
    const hasSelectedFormat = Object.values(selectedFormats).some(v => v);
    
    if (!hasSelectedFormat && !includeAgencyPackage) {
      alert('⚠️ الرجاء اختيار صيغة واحدة على الأقل');
      return;
    }

    setIsExporting(true);

    try {
      await onExport({
        formats: selectedFormats,
        agencyPackage: includeAgencyPackage,
        options: exportOptions
      });
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ فشل التصدير: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // حساب الحجم المتوقع
  const estimatedSize = () => {
    let size = 0;
    if (selectedFormats.pdf) size += 2; // MB
    if (selectedFormats.epub) size += 1;
    if (selectedFormats.docx) size += 0.5;
    if (includeAgencyPackage) size += 5;
    return size.toFixed(1);
  };

  return (
    <div className="bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center gap-3 border-b border-shadow-primary/20 pb-4">
        <FileDown className="w-6 h-6 text-shadow-accent" />
        <div>
          <h2 className="text-xl font-bold text-shadow-text">خيارات التصدير</h2>
          <p className="text-sm text-shadow-text/60">اختر الصيغات والإعدادات المطلوبة</p>
        </div>
      </div>

      {/* اختيار الصيغ */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-shadow-text flex items-center gap-2">
          <FileText className="w-5 h-5" />
          صيغ التصدير
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PDF */}
          <label className={`
            relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
            ${selectedFormats.pdf 
              ? 'border-shadow-accent bg-shadow-accent/10' 
              : 'border-shadow-primary/20 hover:border-shadow-accent/50'}
          `}>
            <input
              type="checkbox"
              checked={selectedFormats.pdf}
              onChange={() => handleFormatToggle('pdf')}
              className="hidden"
            />
            <FileText className={`w-6 h-6 ${selectedFormats.pdf ? 'text-shadow-accent' : 'text-shadow-text/60'}`} />
            <div className="flex-1">
              <div className="font-semibold text-shadow-text">PDF</div>
              <div className="text-xs text-shadow-text/60">للطباعة والقراءة</div>
            </div>
            {selectedFormats.pdf && (
              <div className="absolute top-2 left-2 w-3 h-3 bg-shadow-accent rounded-full animate-pulse-neon" />
            )}
          </label>

          {/* EPUB */}
          <label className={`
            relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
            ${selectedFormats.epub 
              ? 'border-shadow-accent bg-shadow-accent/10' 
              : 'border-shadow-primary/20 hover:border-shadow-accent/50'}
          `}>
            <input
              type="checkbox"
              checked={selectedFormats.epub}
              onChange={() => handleFormatToggle('epub')}
              className="hidden"
            />
            <BookOpen className={`w-6 h-6 ${selectedFormats.epub ? 'text-shadow-accent' : 'text-shadow-text/60'}`} />
            <div className="flex-1">
              <div className="font-semibold text-shadow-text">EPUB</div>
              <div className="text-xs text-shadow-text/60">Kindle & القراء الإلكترونية</div>
            </div>
            {selectedFormats.epub && (
              <div className="absolute top-2 left-2 w-3 h-3 bg-shadow-accent rounded-full animate-pulse-neon" />
            )}
          </label>

          {/* DOCX */}
          <label className={`
            relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all
            ${selectedFormats.docx 
              ? 'border-shadow-accent bg-shadow-accent/10' 
              : 'border-shadow-primary/20 hover:border-shadow-accent/50'}
          `}>
            <input
              type="checkbox"
              checked={selectedFormats.docx}
              onChange={() => handleFormatToggle('docx')}
              className="hidden"
            />
            <FileImage className={`w-6 h-6 ${selectedFormats.docx ? 'text-shadow-accent' : 'text-shadow-text/60'}`} />
            <div className="flex-1">
              <div className="font-semibold text-shadow-text">DOCX</div>
              <div className="text-xs text-shadow-text/60">قابل للتعديل في Word</div>
            </div>
            {selectedFormats.docx && (
              <div className="absolute top-2 left-2 w-3 h-3 bg-shadow-accent rounded-full animate-pulse-neon" />
            )}
          </label>
        </div>
      </div>

      {/* حزمة Agency */}
      <div className="space-y-3">
        <label className={`
          relative flex items-center gap-4 p-5 rounded-lg border-2 cursor-pointer transition-all
          ${includeAgencyPackage 
            ? 'border-shadow-secondary bg-shadow-secondary/10' 
            : 'border-shadow-primary/20 hover:border-shadow-secondary/50'}
        `}>
          <input
            type="checkbox"
            checked={includeAgencyPackage}
            onChange={() => setIncludeAgencyPackage(!includeAgencyPackage)}
            className="hidden"
          />
          <Package className={`w-8 h-8 ${includeAgencyPackage ? 'text-shadow-secondary' : 'text-shadow-text/60'}`} />
          <div className="flex-1">
            <div className="text-lg font-bold text-shadow-text">حزمة Agency in a Box الكاملة</div>
            <div className="text-sm text-shadow-text/60 mt-1">
              الكتاب + تسويق + سوشيال ميديا + سكريبتات + تصميم + دليل استخدام
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-shadow-accent/20 text-shadow-accent">
                📢 تسويق
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-shadow-accent/20 text-shadow-accent">
                📱 سوشيال ميديا
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-shadow-accent/20 text-shadow-accent">
                🎬 سكريبتات
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-shadow-accent/20 text-shadow-accent">
                🎨 تصميم
              </span>
            </div>
          </div>
          {includeAgencyPackage && (
            <div className="absolute top-3 left-3 w-4 h-4 bg-shadow-secondary rounded-full animate-pulse-neon" />
          )}
        </label>
      </div>

      {/* خيارات إضافية */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-shadow-text">خيارات التنسيق</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.includeCover}
              onChange={(e) => setExportOptions({ ...exportOptions, includeCover: e.target.checked })}
              className="w-4 h-4 text-shadow-accent rounded focus:ring-shadow-accent"
            />
            <span className="text-sm text-shadow-text">صفحة الغلاف</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.includeTableOfContents}
              onChange={(e) => setExportOptions({ ...exportOptions, includeTableOfContents: e.target.checked })}
              className="w-4 h-4 text-shadow-accent rounded focus:ring-shadow-accent"
            />
            <span className="text-sm text-shadow-text">جدول المحتويات</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.includePageNumbers}
              onChange={(e) => setExportOptions({ ...exportOptions, includePageNumbers: e.target.checked })}
              className="w-4 h-4 text-shadow-accent rounded focus:ring-shadow-accent"
            />
            <span className="text-sm text-shadow-text">أرقام الصفحات</span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-shadow-text">حجم الخط:</label>
            <select
              value={exportOptions.fontSize}
              onChange={(e) => setExportOptions({ ...exportOptions, fontSize: Number(e.target.value) })}
              className="px-2 py-1 bg-shadow-bg border border-shadow-primary/20 rounded text-shadow-text text-sm"
            >
              <option value={10}>10pt</option>
              <option value={11}>11pt</option>
              <option value={12}>12pt</option>
              <option value={14}>14pt</option>
              <option value={16}>16pt</option>
            </select>
          </div>
        </div>
      </div>

      {/* الحجم المتوقع */}
      <div className="flex items-center justify-between p-4 bg-shadow-bg rounded-lg border border-shadow-primary/20">
        <span className="text-sm text-shadow-text/60">الحجم المتوقع:</span>
        <span className="text-lg font-bold text-shadow-accent">{estimatedSize()} MB</span>
      </div>

      {/* زر التصدير */}
      <button
        onClick={handleStartExport}
        disabled={isExporting}
        className={`
          w-full py-4 px-6 rounded-lg font-bold text-lg
          transition-all duration-300
          ${isExporting 
            ? 'bg-shadow-primary/50 cursor-not-allowed' 
            : 'cyber-button bg-shadow-accent hover:shadow-glow'}
        `}
      >
        {isExporting ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-shadow-text/30 border-t-shadow-text rounded-full animate-spin" />
            جاري التصدير...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FileDown className="w-6 h-6" />
            بدء التصدير
          </span>
        )}
      </button>
    </div>
  );
};

export default ExportOptions;
