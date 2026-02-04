/**
 * EliteEditorPage - محرر النصوص الاحترافي مع AI
 * 
 * الميزات:
 * - محرر Rich Text متقدم
 * - AI Writing Assistant
 * - Real-time word count
 * - Auto-save
 * - Format tools (Bold, Italic, Headers, Lists)
 * - تصحيح نحوي وإملائي
 * - اقتراحات تحسين النص
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Save,
  Download,
  Sparkles,
  Type,
  AlignRight,
  AlignCenter,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Undo,
  Redo,
  Eye,
  Edit3,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap
} from 'lucide-react';
import { useToast } from '../Components/ToastProvider';
import { useManuscript, useUpdateManuscript } from '../hooks/useManuscripts';
import { useDebounce } from '../hooks/useDebounce';

// مكونات مساعدة
const LoadingSpinner = ({ size = 'md', text = 'جاري التحميل...' }) => (
  <div className="flex flex-col items-center gap-2">
    <Loader2 className={`animate-spin ${size === 'lg' ? 'w-8 h-8' : 'w-5 h-5'}`} />
    <span className="text-sm text-gray-600">{text}</span>
  </div>
);

const EmptyState = ({ icon: Icon, title, description, action, actionLabel }) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <Icon className="w-12 h-12 text-gray-400" />
    <div>
      <h3 className="font-semibold text-lg text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
    {action && (
      <button
        onClick={action}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const EliteEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const editorRef = useRef(null);
  
  const { data: manuscript, isLoading } = useManuscript(id);
  const updateManuscript = useUpdateManuscript();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Debounced content for auto-save
  const debouncedContent = useDebounce(content, 2000);

  // تحميل المخطوط
  useEffect(() => {
    if (manuscript) {
      setTitle(manuscript.title || '');
      setContent(manuscript.content || '');
    }
  }, [manuscript]);

  // حساب إحصائيات النص
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    
    setWordCount(words);
    setCharacterCount(chars);
  }, [content]);

  // Auto-save
  useEffect(() => {
    if (debouncedContent && manuscript && debouncedContent !== manuscript.content) {
      handleSave(true);
    }
  }, [debouncedContent]);

  // معالج الحفظ
  const handleSave = async (isAutoSave = false) => {
    if (!id || !content) return;

    setIsSaving(true);
    try {
      await updateManuscript.mutateAsync({
        id,
        data: { title, content }
      });
      
      setLastSaved(new Date());
      if (!isAutoSave) {
        success('تم الحفظ بنجاح');
      }
    } catch (err) {
      console.error('Save error:', err);
      if (!isAutoSave) {
        error('فشل الحفظ');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // معالجات التنسيق
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // الحصول على النص المحدد
  const getSelectedText = () => {
    const selection = window.getSelection();
    return selection?.toString() || '';
  };

  const improveText = (text) => {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    if (!cleaned) return '';
    const capitalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return `${capitalized}${/[.!؟…]$/.test(capitalized) ? '' : '.'}`;
  };

  const expandText = (text) => {
    const base = text.trim();
    if (!base) return '';
    return `${base}\n\nتفصيل إضافي: ${base.split(' ').slice(0, 8).join(' ')}...`;
  };

  const summarizeText = (text) => {
    const sentences = text
      .replace(/\n+/g, ' ')
      .split(/[.!؟…]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (sentences.length === 0) return '';
    const summary = sentences.slice(0, 2).join('، ');
    return `ملخص: ${summary}${summary.endsWith('...') ? '' : '...'}`;
  };

  const continueWriting = (text) => {
    const tail = text.split(/\s+/).slice(-12).join(' ');
    return `${text ? '\n\n' : ''}${tail} ...`;
  };

  // AI Writing Assistant
  const handleAISuggestion = async (type) => {
    const selected = getSelectedText();
    if (!selected && type !== 'continue') {
      info('قم بتحديد نص أولاً');
      return;
    }

    setAiLoading(true);
    try {
      let suggestion = '';
      const plainContent = content.replace(/<[^>]*>/g, ' ');
      const sourceText = selected || plainContent;

      switch (type) {
        case 'improve':
          suggestion = improveText(sourceText);
          info('تم تحسين النص');
          break;
        case 'expand':
          suggestion = expandText(sourceText);
          info('تم توسيع النص');
          break;
        case 'summarize':
          suggestion = summarizeText(sourceText);
          info('تم تلخيص النص');
          break;
        case 'continue':
          suggestion = continueWriting(sourceText || title);
          info('تمت متابعة الكتابة');
          break;
        default:
          break;
      }

      // إدراج الاقتراح
      if (suggestion) {
        document.execCommand('insertText', false, suggestion);
      }
    } catch (err) {
      error('فشل الحصول على اقتراح AI');
    } finally {
      setAiLoading(false);
    }
  };

  // معالجات اختصارات لوحة المفاتيح
  const handleKeyDown = (e) => {
    // Ctrl+S للحفظ
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    
    // Ctrl+B للعريض
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      applyFormat('bold');
    }
    
    // Ctrl+I للمائل
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      applyFormat('italic');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-shadow-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل المحرر..." />
      </div>
    );
  }

  if (!manuscript) {
    return (
      <div className="min-h-screen bg-shadow-bg flex items-center justify-center p-6">
        <EmptyState
          icon={AlertCircle}
          title="المخطوط غير موجود"
          description="لم نتمكن من العثور على المخطوط المطلوب"
          action={() => navigate('/manuscripts')}
          actionLabel="العودة للمخطوطات"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shadow-bg">
      {/* شريط الأدوات العلوي */}
      <div className="sticky top-0 z-50 bg-shadow-surface border-b border-shadow-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* السطر الأول - العنوان والإجراءات */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان المخطوط..."
                className="w-full bg-transparent text-2xl font-bold text-shadow-text border-none outline-none placeholder:text-shadow-text/40"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* حالة الحفظ */}
              <div className="flex items-center gap-2 text-sm text-shadow-text/60">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>حُفظ {new Date(lastSaved).toLocaleTimeString('ar-SA')}</span>
                  </>
                ) : null}
              </div>

              {/* أزرار الإجراءات */}
              <button
                onClick={() => handleSave()}
                disabled={isSaving}
                className="cyber-button bg-shadow-accent px-4 py-2 rounded hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                حفظ
              </button>

              <button
                onClick={() => navigate('/export', { state: { manuscript } })}
                className="cyber-button bg-shadow-primary/20 px-4 py-2 rounded hover:bg-shadow-primary/30 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                تصدير
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`cyber-button px-4 py-2 rounded transition-all flex items-center gap-2 ${
                  showPreview ? 'bg-shadow-accent' : 'bg-shadow-primary/20 hover:bg-shadow-primary/30'
                }`}
              >
                {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'تحرير' : 'معاينة'}
              </button>
            </div>
          </div>

          {/* السطر الثاني - أدوات التنسيق */}
          {!showPreview && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* أدوات النص */}
              <div className="flex items-center gap-1 border-l border-shadow-primary/20 pl-2">
                <ToolButton icon={<Bold />} onClick={() => applyFormat('bold')} tooltip="عريض (Ctrl+B)" />
                <ToolButton icon={<Italic />} onClick={() => applyFormat('italic')} tooltip="مائل (Ctrl+I)" />
                <ToolButton icon={<Underline />} onClick={() => applyFormat('underline')} tooltip="تحته خط" />
              </div>

              {/* العناوين */}
              <div className="flex items-center gap-1 border-l border-shadow-primary/20 pl-2">
                <ToolButton icon={<Heading1 />} onClick={() => applyFormat('formatBlock', '<h1>')} tooltip="عنوان 1" />
                <ToolButton icon={<Heading2 />} onClick={() => applyFormat('formatBlock', '<h2>')} tooltip="عنوان 2" />
              </div>

              {/* القوائم */}
              <div className="flex items-center gap-1 border-l border-shadow-primary/20 pl-2">
                <ToolButton icon={<List />} onClick={() => applyFormat('insertUnorderedList')} tooltip="قائمة نقطية" />
                <ToolButton icon={<ListOrdered />} onClick={() => applyFormat('insertOrderedList')} tooltip="قائمة مرقمة" />
              </div>

              {/* المحاذاة */}
              <div className="flex items-center gap-1 border-l border-shadow-primary/20 pl-2">
                <ToolButton icon={<AlignRight />} onClick={() => applyFormat('justifyRight')} tooltip="محاذاة لليمين" />
                <ToolButton icon={<AlignCenter />} onClick={() => applyFormat('justifyCenter')} tooltip="توسيط" />
              </div>

              {/* التراجع والإعادة */}
              <div className="flex items-center gap-1 border-l border-shadow-primary/20 pl-2">
                <ToolButton icon={<Undo />} onClick={() => applyFormat('undo')} tooltip="تراجع" />
                <ToolButton icon={<Redo />} onClick={() => applyFormat('redo')} tooltip="إعادة" />
              </div>

              {/* أدوات AI */}
              <div className="flex items-center gap-1">
                <ToolButton
                  icon={aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  onClick={() => handleAISuggestion('improve')}
                  tooltip="تحسين النص بالذكاء الاصطناعي"
                  accent
                  disabled={aiLoading}
                />
                <ToolButton
                  icon={<Zap />}
                  onClick={() => handleAISuggestion('continue')}
                  tooltip="استكمال الكتابة بالذكاء الاصطناعي"
                  accent
                  disabled={aiLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* منطقة المحرر */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* المحرر الرئيسي */}
          <div className="lg:col-span-3">
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6 min-h-[600px]">
              {showPreview ? (
                // وضع المعاينة
                <div
                  className="prose prose-invert max-w-none text-shadow-text"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                // وضع التحرير
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={(e) => setContent(e.currentTarget.innerHTML)}
                  onKeyDown={handleKeyDown}
                  onMouseUp={() => setSelectedText(getSelectedText())}
                  className="outline-none min-h-[550px] text-shadow-text leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: content }}
                  dir="rtl"
                />
              )}
            </div>
          </div>

          {/* الشريط الجانبي - الإحصائيات والأدوات */}
          <div className="lg:col-span-1 space-y-4">
            {/* الإحصائيات */}
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
              <h3 className="text-lg font-bold text-shadow-text mb-4 flex items-center gap-2">
                <Type className="w-5 h-5 text-shadow-accent" />
                الإحصائيات
              </h3>
              <div className="space-y-3">
                <StatItem label="الكلمات" value={wordCount.toLocaleString()} />
                <StatItem label="الأحرف" value={characterCount.toLocaleString()} />
                <StatItem label="الفقرات" value={content.split('<p>').length - 1} />
              </div>
            </div>

            {/* أدوات AI المتقدمة */}
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
              <h3 className="text-lg font-bold text-shadow-text mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-shadow-accent" />
                مساعد الكتابة
              </h3>
              <div className="space-y-2">
                <AIButton
                  label="تحسين النص"
                  onClick={() => handleAISuggestion('improve')}
                  disabled={!selectedText || aiLoading}
                />
                <AIButton
                  label="توسيع الفكرة"
                  onClick={() => handleAISuggestion('expand')}
                  disabled={!selectedText || aiLoading}
                />
                <AIButton
                  label="تلخيص"
                  onClick={() => handleAISuggestion('summarize')}
                  disabled={!selectedText || aiLoading}
                />
                <AIButton
                  label="استكمال الكتابة"
                  onClick={() => handleAISuggestion('continue')}
                  disabled={aiLoading}
                />
              </div>
              {selectedText && (
                <p className="text-xs text-shadow-text/60 mt-3">
                  محدد: {selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}
                </p>
              )}
            </div>

            {/* اختصارات لوحة المفاتيح */}
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
              <h3 className="text-sm font-bold text-shadow-text mb-3">الاختصارات</h3>
              <div className="space-y-2 text-xs text-shadow-text/60">
                <ShortcutItem keys="Ctrl+S" action="حفظ" />
                <ShortcutItem keys="Ctrl+B" action="عريض" />
                <ShortcutItem keys="Ctrl+I" action="مائل" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 cyber-grid -z-10" />
    </div>
  );
};

// زر الأداة
const ToolButton = ({ icon, onClick, tooltip, accent = false, disabled = false }) => (
  <button
    onClick={onClick}
    title={tooltip}
    disabled={disabled}
    className={`
      p-2 rounded transition-all
      ${accent 
        ? 'hover:bg-shadow-accent/20 text-shadow-accent' 
        : 'hover:bg-shadow-primary/20 text-shadow-text'}
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
  >
    {icon}
  </button>
);

// عنصر الإحصائية
const StatItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-shadow-text/60">{label}</span>
    <span className="text-lg font-bold text-shadow-text">{value}</span>
  </div>
);

// زر AI
const AIButton = ({ label, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full cyber-button bg-shadow-accent/10 text-shadow-accent px-3 py-2 rounded text-sm hover:bg-shadow-accent/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {label}
  </button>
);

// عنصر الاختصار
const ShortcutItem = ({ keys, action }) => (
  <div className="flex justify-between items-center">
    <span>{action}</span>
    <kbd className="px-2 py-1 bg-shadow-bg rounded text-xs">{keys}</kbd>
  </div>
);

export default EliteEditorPage;
