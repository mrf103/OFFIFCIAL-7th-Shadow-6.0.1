/**
 * Export Page - صفحة التصدير الرئيسية
 * 
 * واجهة كاملة لتصدير الكتب وإنشاء حزمة Agency in a Box
 */

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ExportOptions, ExportProgress, PackagePreview, ExportResults } from '../Components/export';
import useExportManager from '../hooks/useExportManager';

const ExportPage = () => {
  const [selectedManuscript] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    isProcessing,
    progress,
    currentStage,
    stages,
    results,
    error,
    exportWithAgency,
    downloadFile,
    downloadAll,
    reset
  } = useExportManager();

  // بيانات تجريبية للمخطوطة (في الواقع ستأتي من props أو context)
  const demoManuscript = {
    id: '123',
    title: 'رحلة في عالم الخيال',
    author: 'محمد أحمد',
    content: `كان ياما كان في قديم الزمان...
    
    هذا نص تجريبي للمخطوطة. في التطبيق الفعلي، سيتم جلب المحتوى من قاعدة البيانات.
    
    الفصل الأول: البداية
    في صباح يوم مشرق، بدأت القصة...
    
    الفصل الثاني: المغامرة
    وفي يوم آخر، حدثت أحداث مثيرة...`,
    chapters: [
      {
        title: 'الفصل الأول: البداية',
        content: 'في صباح يوم مشرق، بدأت القصة...'
      },
      {
        title: 'الفصل الثاني: المغامرة',
        content: 'وفي يوم آخر، حدثت أحداث مثيرة...'
      }
    ]
  };

  // معالجة التصدير
  const handleExport = async (exportConfig) => {
    try {
      const manuscript = selectedManuscript || demoManuscript;
      await exportWithAgency(manuscript, exportConfig);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  // بدء تصدير جديد
  const handleNewExport = () => {
    reset();
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-shadow-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان الرئيسي */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-shadow-accent animate-pulse-neon" />
            <h1 className="text-4xl md:text-5xl font-bold text-shadow-text cyber-text">
              الظل السابع - Agency in a Box
            </h1>
            <Sparkles className="w-10 h-10 text-shadow-accent animate-pulse-neon" />
          </div>
          <p className="text-xl text-shadow-text/60">
            صدّر كتابك واحصل على حزمة تسويقية شاملة بالذكاء الاصطناعي
          </p>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* العمود الأيسر: الخيارات والتقدم */}
          <div className="space-y-6">
            {/* معلومات المخطوطة */}
            {!results && (
              <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6">
                <h3 className="text-lg font-semibold text-shadow-text mb-4">
                  المخطوطة المحددة
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-shadow-text/60">العنوان:</span>
                    <span className="text-shadow-text font-semibold">
                      {demoManuscript.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-shadow-text/60">المؤلف:</span>
                    <span className="text-shadow-text font-semibold">
                      {demoManuscript.author}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-shadow-text/60">الفصول:</span>
                    <span className="text-shadow-text font-semibold">
                      {demoManuscript.chapters?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* خيارات التصدير */}
            {!isProcessing && !results && (
              <ExportOptions
                manuscript={demoManuscript}
                onExport={handleExport}
              />
            )}

            {/* شريط التقدم */}
            {isProcessing && (
              <ExportProgress
                progress={progress}
                currentStage={currentStage}
                stages={stages}
                error={error}
              />
            )}

            {/* النتائج */}
            {results && !isProcessing && (
              <ExportResults
                results={results}
                onDownload={downloadFile}
                onDownloadAll={downloadAll}
              />
            )}

            {/* زر بدء جديد */}
            {results && (
              <button
                onClick={handleNewExport}
                className="w-full cyber-button bg-shadow-secondary py-4 px-6 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:shadow-glow transition-all"
              >
                <ArrowRight className="w-6 h-6" />
                تصدير جديد
              </button>
            )}
          </div>

          {/* العمود الأيمن: المعاينة */}
          <div className="space-y-6">
            {/* زر المعاينة */}
            {!showPreview && !results && (
              <button
                onClick={() => setShowPreview(true)}
                className="w-full cyber-card bg-shadow-surface rounded-lg border-2 border-shadow-accent/30 p-8 hover:border-shadow-accent/60 transition-all group"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto bg-shadow-accent/20 rounded-full flex items-center justify-center group-hover:bg-shadow-accent/30 transition-all">
                    <Sparkles className="w-8 h-8 text-shadow-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-shadow-text">
                    معاينة محتويات الحزمة
                  </h3>
                  <p className="text-shadow-text/60">
                    شاهد ما ستحصل عليه في حزمة Agency in a Box
                  </p>
                </div>
              </button>
            )}

            {/* المعاينة */}
            {(showPreview || results) && (
              <PackagePreview
                agencyData={{
                  manuscript: demoManuscript,
                  exports: results?.agencyData?.exports || {},
                  marketing: results?.agencyData?.marketing || {
                    catchyTitles: ['عنوان جذاب 1', 'عنوان جذاب 2'],
                    elevatorPitch: 'وصف قصير مثير...',
                    seoKeywords: ['كلمة 1', 'كلمة 2']
                  },
                  socialMedia: results?.agencyData?.socialMedia || {
                    twitter: ['تغريدة 1', 'تغريدة 2'],
                    facebook: ['منشور 1'],
                    instagram: ['كابشن 1'],
                    linkedin: ['منشور احترافي'],
                    tiktok: ['سكريبت'],
                    contentCalendar: []
                  },
                  mediaScripts: results?.agencyData?.mediaScripts || {
                    youtubeScript: 'سكريبت يوتيوب...',
                    podcastScript: 'سكريبت بودكاست...',
                    interviewQuestions: {
                      basic: ['سؤال 1', 'سؤال 2'],
                      intermediate: ['سؤال 3'],
                      advanced: ['سؤال 4']
                    }
                  },
                  design: results?.agencyData?.design || {
                    colorPalettes: [
                      { name: 'لوحة 1', colors: ['#000', '#fff'] }
                    ],
                    designConcepts: ['فكرة 1', 'فكرة 2'],
                    aiPrompts: ['Prompt 1', 'Prompt 2']
                  }
                }}
              />
            )}

            {/* معلومات إضافية */}
            {!results && (
              <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6 space-y-4">
                <h3 className="text-lg font-bold text-shadow-text">
                  💡 ما الذي ستحصل عليه؟
                </h3>
                <ul className="space-y-3 text-shadow-text/80">
                  <li className="flex items-start gap-2">
                    <span className="text-shadow-accent mt-1">✓</span>
                    <span>كتابك بـ 3 صيغ احترافية (PDF, EPUB, DOCX)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-shadow-accent mt-1">✓</span>
                    <span>استراتيجية تسويقية كاملة مع عناوين جذابة</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-shadow-accent mt-1">✓</span>
                    <span>محتوى جاهز لـ 5 منصات سوشيال ميديا</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-shadow-accent mt-1">✓</span>
                    <span>سكريبتات يوتيوب وبودكاست وإعلانات راديو</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-shadow-accent mt-1">✓</span>
                    <span>4 أفكار تصميم غلاف احترافية</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-shadow-accent mt-1">✓</span>
                    <span>دليل استخدام شامل مع نصائح التسويق</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* تذييل */}
        <div className="text-center text-shadow-text/40 text-sm mt-12">
          <p>🌟 صُنع بحب بواسطة الظل السابع - Shadow Seven Agency v4.0</p>
        </div>
      </div>

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 cyber-grid -z-10" />
    </div>
  );
};

export default ExportPage;
