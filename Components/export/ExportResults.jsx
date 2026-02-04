/**
 * ExportResults - نتائج التصدير والتنزيل
 * 
 * عرض الملفات المُصدَّرة بنجاح مع:
 * - أزرار التنزيل
 * - معلومات الملفات
 * - خيارات المشاركة
 * - إحصائيات التصدير
 */

import { Download, Share2, FileText, BookOpen, Package, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const ExportResults = ({ results, onDownload, onDownloadAll }) => {
  const [copied, setCopied] = useState(false);

  // نسخ رابط المشاركة (افتراضي)
  const handleCopyLink = () => {
    // هنا يمكن إضافة منطق للحصول على رابط مشاركة فعلي
    const shareLink = `https://shadowseven.agency/share/${results.packageId || 'demo'}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // حساب الحجم الإجمالي
  const totalSize = results.files?.reduce((sum, file) => sum + (file.size || 0), 0) || 0;
  const formattedSize = (totalSize / 1024 / 1024).toFixed(2);

  return (
    <div className="bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6 space-y-6">
      {/* رسالة النجاح */}
      <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <CheckCircle className="w-8 h-8 text-green-500" />
        <div className="flex-1">
          <h2 className="text-xl font-bold text-green-500">تم التصدير بنجاح! 🎉</h2>
          <p className="text-sm text-green-400 mt-1">
            {results.files?.length || 0} ملف جاهز • {formattedSize} MB
          </p>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="الملفات"
          value={results.files?.length || 0}
          icon={<FileText className="w-5 h-5" />}
        />
        <StatCard
          label="الحجم الكلي"
          value={`${formattedSize} MB`}
          icon={<Package className="w-5 h-5" />}
        />
        <StatCard
          label="وقت التصدير"
          value={`${results.duration || 0}ث`}
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <StatCard
          label="الصيغات"
          value={results.formats?.length || 0}
          icon={<FileText className="w-5 h-5" />}
        />
      </div>

      {/* قائمة الملفات */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-shadow-text">الملفات المُصدَّرة</h3>
          {results.files?.length > 1 && (
            <button
              onClick={onDownloadAll}
              className="cyber-button px-4 py-2 text-sm bg-shadow-accent rounded-lg flex items-center gap-2 hover:shadow-glow transition-all"
            >
              <Download className="w-4 h-4" />
              تنزيل الكل
            </button>
          )}
        </div>

        <div className="space-y-2">
          {results.files?.map((file, index) => (
            <FileCard
              key={index}
              file={file}
              onDownload={() => onDownload(file)}
            />
          ))}
        </div>
      </div>

      {/* خيارات المشاركة */}
      <div className="border-t border-shadow-primary/20 pt-6 space-y-3">
        <h3 className="text-lg font-semibold text-shadow-text flex items-center gap-2">
          <Share2 className="w-5 h-5" />
          مشاركة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* نسخ الرابط */}
          <button
            onClick={handleCopyLink}
            className={`
              flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
              ${copied 
                ? 'border-green-500 bg-green-500/10 text-green-500' 
                : 'border-shadow-primary/20 hover:border-shadow-accent/50 text-shadow-text'}
            `}
          >
            {copied ? (
              <>
                <CheckCircle className="w-5 h-5" />
                تم النسخ!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                نسخ رابط المشاركة
              </>
            )}
          </button>

          {/* فتح في متصفح */}
          <button
            className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-shadow-primary/20 hover:border-shadow-accent/50 text-shadow-text transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            معاينة في متصفح جديد
          </button>
        </div>
      </div>

      {/* ملاحظات */}
      <div className="p-4 bg-shadow-bg rounded-lg border border-shadow-primary/20">
        <h4 className="font-semibold text-shadow-text mb-2">💡 ملاحظات:</h4>
        <ul className="text-sm text-shadow-text/60 space-y-1 mr-4">
          <li>• ملفات PDF جاهزة للطباعة بجودة 300 DPI</li>
          <li>• ملفات EPUB متوافقة مع Kindle و Apple Books</li>
          <li>• ملفات DOCX قابلة للتعديل في Microsoft Word</li>
          {results.includesAgency && (
            <li className="text-shadow-accent">• حزمة Agency تحتوي على كل ما تحتاجه للتسويق والنشر</li>
          )}
        </ul>
      </div>

      {/* إجراءات إضافية */}
      <div className="flex flex-wrap gap-3">
        <button className="cyber-button px-6 py-3 bg-shadow-secondary rounded-lg hover:shadow-glow transition-all">
          تصدير جديد
        </button>
        <button className="px-6 py-3 border-2 border-shadow-primary/20 rounded-lg hover:border-shadow-accent/50 text-shadow-text transition-all">
          حفظ في السحابة
        </button>
      </div>
    </div>
  );
};

// مكون بطاقة الملف
const FileCard = ({ file, onDownload }) => {
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6 text-red-500" />;
      case 'epub': return <BookOpen className="w-6 h-6 text-blue-500" />;
      case 'docx': return <FileText className="w-6 h-6 text-blue-600" />;
      case 'zip': return <Package className="w-6 h-6 text-shadow-accent" />;
      default: return <FileText className="w-6 h-6 text-shadow-text/60" />;
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-shadow-bg rounded-lg border border-shadow-primary/20 hover:border-shadow-accent/30 transition-all group">
      {/* الأيقونة */}
      <div className="flex-shrink-0">
        {getFileIcon(file.type)}
      </div>

      {/* معلومات الملف */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-shadow-text truncate">{file.filename}</div>
        <div className="text-sm text-shadow-text/60 flex items-center gap-3">
          <span>{formatSize(file.size)}</span>
          <span>•</span>
          <span>{file.type?.toUpperCase()}</span>
          {file.pages && (
            <>
              <span>•</span>
              <span>{file.pages} صفحة</span>
            </>
          )}
        </div>
      </div>

      {/* زر التنزيل */}
      <button
        onClick={onDownload}
        className="cyber-button px-4 py-2 bg-shadow-accent rounded-lg flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all hover:shadow-glow"
      >
        <Download className="w-4 h-4" />
        تنزيل
      </button>
    </div>
  );
};

// مكون بطاقة الإحصائية
const StatCard = ({ label, value, icon }) => (
  <div className="p-4 bg-shadow-bg rounded-lg border border-shadow-primary/20">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-shadow-text/60">{label}</span>
      <div className="text-shadow-accent">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-shadow-text">{value}</div>
  </div>
);

export default ExportResults;
