/**
 * PackagePreview - معاينة محتويات الحزمة
 * 
 * عرض تفصيلي لما سيتم تضمينه في الحزمة:
 * - الكتاب (جميع الصيغ)
 * - المحتوى التسويقي
 * - محتوى السوشيال ميديا
 * - السكريبتات
 * - التصميم
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, BookOpen, Package, Image, Megaphone, Share2, Video, Palette } from 'lucide-react';

const PackagePreview = ({ agencyData }) => {
  const [expandedSections, setExpandedSections] = useState({
    book: true,
    marketing: false,
    social: false,
    scripts: false,
    design: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // حساب الإحصائيات
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    filesByType: {}
  };

  if (agencyData?.exports) {
    if (agencyData.exports.pdf) stats.totalFiles++;
    if (agencyData.exports.epub) stats.totalFiles++;
    if (agencyData.exports.docx) stats.totalFiles++;
  }

  if (agencyData?.marketing) stats.totalFiles += 3;
  if (agencyData?.socialMedia) stats.totalFiles += 15;
  if (agencyData?.mediaScripts) stats.totalFiles += 8;
  if (agencyData?.design) stats.totalFiles += 5;

  return (
    <div className="bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6 space-y-4">
      {/* العنوان */}
      <div className="flex items-center gap-3 border-b border-shadow-primary/20 pb-4">
        <Package className="w-6 h-6 text-shadow-accent" />
        <div>
          <h2 className="text-xl font-bold text-shadow-text">معاينة الحزمة</h2>
          <p className="text-sm text-shadow-text/60">
            {stats.totalFiles} ملف • حجم تقريبي: 8-12 MB
          </p>
        </div>
      </div>

      {/* قسم الكتاب */}
      <Section
        icon={<BookOpen className="w-5 h-5" />}
        title="الكتاب"
        badge="3 صيغ"
        expanded={expandedSections.book}
        onToggle={() => toggleSection('book')}
        color="accent"
      >
        <div className="space-y-2">
          {agencyData?.exports?.pdf && (
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name={`${agencyData.manuscript?.title || 'book'}.pdf`}
              description="نسخة للطباعة والقراءة • A4 • 300 DPI"
              size="2.1 MB"
            />
          )}
          {agencyData?.exports?.epub && (
            <FileItem
              icon={<BookOpen className="w-4 h-4" />}
              name={`${agencyData.manuscript?.title || 'book'}.epub`}
              description="Kindle • Apple Books • Google Play"
              size="1.2 MB"
            />
          )}
          {agencyData?.exports?.docx && (
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name={`${agencyData.manuscript?.title || 'book'}.docx`}
              description="قابل للتعديل في Microsoft Word"
              size="0.8 MB"
            />
          )}
        </div>
      </Section>

      {/* قسم التسويق */}
      {agencyData?.marketing && (
        <Section
          icon={<Megaphone className="w-5 h-5" />}
          title="المحتوى التسويقي"
          badge="10+ عناصر"
          expanded={expandedSections.marketing}
          onToggle={() => toggleSection('marketing')}
          color="secondary"
        >
          <div className="space-y-2">
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="marketing_package.json"
              description="حزمة تسويقية كاملة • بيانات منظمة"
              size="45 KB"
            />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="marketing_content.md"
              description="عناوين • أوصاف • نقاط بيع • SEO"
              size="32 KB"
            />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="catchy_titles.txt"
              description={`${agencyData.marketing.catchyTitles?.length || 0} عنوان جذاب`}
              size="8 KB"
            />
          </div>
        </Section>
      )}

      {/* قسم السوشيال ميديا */}
      {agencyData?.socialMedia && (
        <Section
          icon={<Share2 className="w-5 h-5" />}
          title="محتوى السوشيال ميديا"
          badge="5 منصات"
          expanded={expandedSections.social}
          onToggle={() => toggleSection('social')}
          color="primary"
        >
          <div className="space-y-2">
            <FolderItem name="twitter" fileCount={2} description="10 تغريدات جاهزة" />
            <FolderItem name="facebook" fileCount={2} description="5 منشورات طويلة" />
            <FolderItem name="instagram" fileCount={2} description="8 كابشنات مع هاشتاجات" />
            <FolderItem name="linkedin" fileCount={2} description="3 منشورات احترافية" />
            <FolderItem name="tiktok" fileCount={2} description="5 سكريبتات ريلز" />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="content_calendar.json"
              description="تقويم 30 يوم"
              size="28 KB"
            />
          </div>
        </Section>
      )}

      {/* قسم السكريبتات */}
      {agencyData?.mediaScripts && (
        <Section
          icon={<Video className="w-5 h-5" />}
          title="السكريبتات الإعلامية"
          badge="6 أنواع"
          expanded={expandedSections.scripts}
          onToggle={() => toggleSection('scripts')}
          color="accent"
        >
          <div className="space-y-2">
            <FileItem
              icon={<Video className="w-4 h-4" />}
              name="youtube_script.txt"
              description="فيديو 5-8 دقائق • جاهز للتصوير"
              size="12 KB"
            />
            <FileItem
              icon={<Video className="w-4 h-4" />}
              name="podcast_script.txt"
              description="حلقة 20-30 دقيقة • مع أسئلة"
              size="18 KB"
            />
            <FileItem
              icon={<Video className="w-4 h-4" />}
              name="book_trailer.txt"
              description="إعلان 60-90 ثانية"
              size="6 KB"
            />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="radio_ads.txt"
              description="إعلانات 30s و 60s"
              size="8 KB"
            />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="interview_questions.md"
              description="3 مستويات • 30+ سؤال"
              size="15 KB"
            />
          </div>
        </Section>
      )}

      {/* قسم التصميم */}
      {agencyData?.design && (
        <Section
          icon={<Palette className="w-5 h-5" />}
          title="أفكار التصميم"
          badge="4 لوحات"
          expanded={expandedSections.design}
          onToggle={() => toggleSection('design')}
          color="secondary"
        >
          <div className="space-y-2">
            <FileItem
              icon={<Image className="w-4 h-4" />}
              name="color_palettes.json"
              description="4 لوحات ألوان احترافية"
              size="8 KB"
            />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="design_concepts.md"
              description="5 أفكار تصميم مفصلة"
              size="22 KB"
            />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="ai_prompts.txt"
              description="5 prompts لـ Midjourney/DALL-E"
              size="12 KB"
            />
            <FileItem
              icon={<FileText className="w-4 h-4" />}
              name="mood_board.md"
              description="لوحة مزاجية + مراجع بصرية"
              size="18 KB"
            />
          </div>
        </Section>
      )}

      {/* ملفات إضافية */}
      <Section
        icon={<FileText className="w-5 h-5" />}
        title="ملفات إرشادية"
        badge="2 ملف"
        expanded={true}
        color="primary"
      >
        <div className="space-y-2">
          <FileItem
            icon={<FileText className="w-4 h-4" />}
            name="README.md"
            description="دليل شامل للحزمة"
            size="25 KB"
          />
          <FileItem
            icon={<FileText className="w-4 h-4" />}
            name="USER_GUIDE.md"
            description="دليل الاستخدام المفصل"
            size="35 KB"
          />
        </div>
      </Section>
    </div>
  );
};

// مكون القسم القابل للطي
const Section = ({ icon, title, badge, expanded, onToggle, color, children }) => {
  const colorClasses = {
    accent: 'text-shadow-accent border-shadow-accent',
    secondary: 'text-shadow-secondary border-shadow-secondary',
    primary: 'text-shadow-primary border-shadow-primary'
  };

  return (
    <div className="border border-shadow-primary/20 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`
          w-full flex items-center justify-between p-4 
          bg-shadow-bg hover:bg-shadow-surface transition-colors
        `}
      >
        <div className="flex items-center gap-3">
          <div className={colorClasses[color]}>{icon}</div>
          <div className="text-right">
            <div className="font-semibold text-shadow-text">{title}</div>
            {badge && (
              <div className="text-xs text-shadow-text/60">{badge}</div>
            )}
          </div>
        </div>
        {onToggle && (
          expanded ? <ChevronUp className="w-5 h-5 text-shadow-text/60" /> : <ChevronDown className="w-5 h-5 text-shadow-text/60" />
        )}
      </button>
      {expanded && (
        <div className="p-4 bg-shadow-surface border-t border-shadow-primary/20">
          {children}
        </div>
      )}
    </div>
  );
};

// مكون الملف
const FileItem = ({ icon, name, description, size }) => (
  <div className="flex items-center gap-3 p-2 rounded hover:bg-shadow-bg transition-colors">
    <div className="text-shadow-text/60">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-shadow-text truncate">{name}</div>
      <div className="text-xs text-shadow-text/60">{description}</div>
    </div>
    {size && (
      <div className="text-xs text-shadow-text/40">{size}</div>
    )}
  </div>
);

// مكون المجلد
const FolderItem = ({ name, fileCount, description }) => (
  <div className="flex items-center gap-3 p-2 rounded hover:bg-shadow-bg transition-colors">
    <div className="text-shadow-accent">
      <Package className="w-4 h-4" />
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-shadow-text">{name}/</div>
      <div className="text-xs text-shadow-text/60">{description}</div>
    </div>
    <div className="text-xs text-shadow-text/40">{fileCount} files</div>
  </div>
);

export default PackagePreview;
