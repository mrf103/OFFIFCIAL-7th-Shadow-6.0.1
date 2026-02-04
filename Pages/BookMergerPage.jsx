/**
 * BookMergerPage - صفحة دمج الكتب والسلاسل
 * 
 * الميزات:
 * - دمج مخطوطات متعددة في كتاب واحد
 * - إنشاء سلاسل كتب
 * - إعادة ترتيب الفصول
 * - دمج ذكي مع AI
 * - معاينة قبل الدمج
 * - تصدير مباشر
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Shuffle,
  GitMerge,
  Eye,
  Sparkles,
  FileText,
  CheckCircle,
  GripVertical,
  Book,
  Layers,
  Settings2
} from 'lucide-react';
import { useToast } from '../Components/ToastProvider';
import { useManuscripts } from '../hooks/useManuscripts';
import LoadingSpinner from '../Components/LoadingSpinner';

const BookMergerPage = () => {
  const navigate = useNavigate();
  const { success, error, info, warning } = useToast();
  const { data: manuscripts, isLoading } = useManuscripts();

  const [selectedBooks, setSelectedBooks] = useState([]);
  const [mergedTitle, setMergedTitle] = useState('');
  const [mergeMode, setMergeMode] = useState('sequential'); // sequential, interleaved, custom
  const [showPreview, setShowPreview] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeOptions, setMergeOptions] = useState({
    addToc: true,
    addPageNumbers: true,
    addChapterHeaders: true,
    unifyFormatting: true,
    removeRedundancy: false,
    aiEnhancement: false
  });

  const mergeInterleaved = (books) => {
    const paragraphs = books.map((book) => (book.content || '').split(/\n\s*\n/));
    const maxLength = Math.max(...paragraphs.map((p) => p.length));
    const merged = [];

    for (let i = 0; i < maxLength; i++) {
      books.forEach((book, idx) => {
        if (paragraphs[idx][i]) {
          merged.push(`## ${book.title} - جزء ${i + 1}\n${paragraphs[idx][i].trim()}`);
        }
      });
    }

    return merged.join('\n\n');
  };

  const buildMergedContent = () => {
    const cleaned = selectedBooks.map((book) => ({
      ...book,
      content: (book.content || '').trim()
    }));

    let mergedText = '';
    let pageCursor = 1;

    const withPageNote = (book, body) => {
      if (!mergeOptions.addPageNumbers) return body;
      const words = book.wordCount || ((book.content || '').split(/\s+/).filter(Boolean).length);
      const estimatedPages = Math.max(1, Math.ceil(words / 250));
      const note = `\n\n[ص ~${pageCursor}-${pageCursor + estimatedPages - 1}]`;
      pageCursor += estimatedPages;
      return `${body}${note}`;
    };

    if (mergeMode === 'interleaved') {
      mergedText = mergeInterleaved(cleaned);
    } else {
      mergedText = cleaned
        .map((book, idx) => {
          const body = `# ${book.title || `قسم ${idx + 1}`}\n\n${book.content}`;
          return withPageNote(book, body);
        })
        .join('\n\n');
    }

    if (mergeOptions.unifyFormatting) {
      mergedText = mergedText.replace(/[\t ]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    const toc = mergeOptions.addToc
      ? cleaned.map((book, idx) => `${idx + 1}. ${book.title}`)
      : [];

    const wordCount = mergedText
      ? mergedText.split(/\s+/).filter(Boolean).length
      : 0;

    const estimatedPages = Math.max(1, Math.ceil(wordCount / 250));

    return { mergedText, toc, wordCount, estimatedPages };
  };

  // إضافة كتاب للدمج
  const handleAddBook = (manuscript) => {
    if (selectedBooks.find(b => b.id === manuscript.id)) {
      warning('هذا الكتاب مضاف بالفعل');
      return;
    }

    setSelectedBooks([...selectedBooks, {
      id: manuscript.id,
      title: manuscript.title,
      content: manuscript.content,
      wordCount: manuscript.word_count || 0,
      order: selectedBooks.length + 1
    }]);

    success(`تم إضافة: ${manuscript.title}`);
  };

  // إزالة كتاب
  const handleRemoveBook = (bookId) => {
    setSelectedBooks(selectedBooks.filter(b => b.id !== bookId));
    info('تم الإزالة');
  };

  // تحريك كتاب لأعلى
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newBooks = [...selectedBooks];
    [newBooks[index], newBooks[index - 1]] = [newBooks[index - 1], newBooks[index]];
    setSelectedBooks(newBooks);
  };

  // تحريك كتاب لأسفل
  const handleMoveDown = (index) => {
    if (index === selectedBooks.length - 1) return;
    const newBooks = [...selectedBooks];
    [newBooks[index], newBooks[index + 1]] = [newBooks[index + 1], newBooks[index]];
    setSelectedBooks(newBooks);
  };

  // خلط عشوائي
  const handleShuffle = () => {
    const shuffled = [...selectedBooks].sort(() => Math.random() - 0.5);
    setSelectedBooks(shuffled);
    info('تم الخلط بشكل عشوائي');
  };

  // دمج الكتب
  const handleMerge = async () => {
    if (selectedBooks.length < 2) {
      error('يجب اختيار كتابين على الأقل للدمج');
      return;
    }

    if (!mergedTitle.trim()) {
      error('يرجى إدخال عنوان للكتاب المدمج');
      return;
    }

    if (selectedBooks.some((book) => !book.content)) {
      error('بعض المخطوطات لا تحتوي على محتوى قابل للدمج');
      return;
    }

    setIsMerging(true);
    try {
      const { mergedText, toc, wordCount, estimatedPages } = buildMergedContent();

      const mergedContent = {
        title: mergedTitle,
        books: selectedBooks,
        mode: mergeMode,
        options: mergeOptions,
        toc,
        content: mergedText,
        totalWordCount: wordCount,
        estimatedPages
      };

      success('تم الدمج بنجاح! 🎉');
      info('جاهز للتصدير');
      navigate('/export', { state: { mergedBook: mergedContent } });

    } catch (err) {
      console.error('Merge error:', err);
      error('فشل الدمج');
    } finally {
      setIsMerging(false);
    }
  };

  // معاينة الدمج
  const handlePreview = () => {
    if (selectedBooks.length < 2) {
      warning('اختر كتابين على الأقل للمعاينة');
      return;
    }
    setShowPreview(true);
  };

  // حساب الإحصائيات
  const stats = {
    totalBooks: selectedBooks.length,
    totalWords: selectedBooks.reduce((sum, b) => sum + b.wordCount, 0),
    avgWords: selectedBooks.length > 0 
      ? Math.round(selectedBooks.reduce((sum, b) => sum + b.wordCount, 0) / selectedBooks.length)
      : 0,
    estimatedPages: Math.ceil(selectedBooks.reduce((sum, b) => sum + b.wordCount, 0) / 250)
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-shadow-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري التحميل..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shadow-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <GitMerge className="w-10 h-10 text-shadow-accent" />
            <h1 className="text-4xl font-bold text-shadow-text cyber-text">
              دمج الكتب والسلاسل
            </h1>
          </div>
          <p className="text-shadow-text/60">
            ادمج مخطوطات متعددة في كتاب واحد أو سلسلة متكاملة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* القائمة الجانبية - المخطوطات المتاحة */}
          <div className="lg:col-span-1 space-y-4">
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
              <h2 className="text-xl font-bold text-shadow-text mb-4 flex items-center gap-2">
                <Book className="w-5 h-5 text-shadow-accent" />
                المخطوطات المتاحة
              </h2>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {manuscripts && manuscripts.length > 0 ? (
                  manuscripts
                    .filter(m => m.status === 'completed')
                    .map(manuscript => (
                      <ManuscriptItem
                        key={manuscript.id}
                        manuscript={manuscript}
                        onAdd={handleAddBook}
                        isAdded={selectedBooks.some(b => b.id === manuscript.id)}
                      />
                    ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-shadow-text/20 mb-2" />
                    <p className="text-shadow-text/60 text-sm">لا توجد مخطوطات مكتملة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* المنطقة الرئيسية - الكتب المختارة */}
          <div className="lg:col-span-2 space-y-4">
            {/* إعدادات الدمج */}
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-shadow-text flex items-center gap-2">
                  <Layers className="w-5 h-5 text-shadow-accent" />
                  إعدادات الدمج
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleShuffle}
                    disabled={selectedBooks.length < 2}
                    className="cyber-button bg-shadow-primary/20 px-3 py-2 rounded text-sm hover:bg-shadow-primary/30 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    خلط
                  </button>
                </div>
              </div>

              {/* عنوان الكتاب المدمج */}
              <input
                type="text"
                value={mergedTitle}
                onChange={(e) => setMergedTitle(e.target.value)}
                placeholder="عنوان الكتاب المدمج..."
                className="w-full mb-4 px-4 py-3 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text placeholder:text-shadow-text/40 focus:outline-none focus:border-shadow-accent transition-colors text-lg font-bold"
              />

              {/* وضع الدمج */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <ModeButton
                  active={mergeMode === 'sequential'}
                  onClick={() => setMergeMode('sequential')}
                  icon={<Layers className="w-4 h-4" />}
                  label="متسلسل"
                />
                <ModeButton
                  active={mergeMode === 'interleaved'}
                  onClick={() => setMergeMode('interleaved')}
                  icon={<Shuffle className="w-4 h-4" />}
                  label="متداخل"
                />
                <ModeButton
                  active={mergeMode === 'custom'}
                  onClick={() => setMergeMode('custom')}
                  icon={<Settings2 className="w-4 h-4" />}
                  label="مخصص"
                />
              </div>

              {/* خيارات الدمج */}
              <div className="grid grid-cols-2 gap-3">
                <OptionCheckbox
                  checked={mergeOptions.addToc}
                  onChange={(checked) => setMergeOptions({...mergeOptions, addToc: checked})}
                  label="إضافة فهرس"
                />
                <OptionCheckbox
                  checked={mergeOptions.addPageNumbers}
                  onChange={(checked) => setMergeOptions({...mergeOptions, addPageNumbers: checked})}
                  label="ترقيم الصفحات"
                />
                <OptionCheckbox
                  checked={mergeOptions.addChapterHeaders}
                  onChange={(checked) => setMergeOptions({...mergeOptions, addChapterHeaders: checked})}
                  label="عناوين الفصول"
                />
                <OptionCheckbox
                  checked={mergeOptions.unifyFormatting}
                  onChange={(checked) => setMergeOptions({...mergeOptions, unifyFormatting: checked})}
                  label="توحيد التنسيق"
                />
                <OptionCheckbox
                  checked={mergeOptions.removeRedundancy}
                  onChange={(checked) => setMergeOptions({...mergeOptions, removeRedundancy: checked})}
                  label="إزالة التكرار"
                  icon={<Sparkles className="w-3 h-3" />}
                />
                <OptionCheckbox
                  checked={mergeOptions.aiEnhancement}
                  onChange={(checked) => setMergeOptions({...mergeOptions, aiEnhancement: checked})}
                  label="تحسين بالذكاء"
                  icon={<Sparkles className="w-3 h-3" />}
                />
              </div>
            </div>

            {/* الكتب المختارة */}
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
              <h3 className="text-lg font-bold text-shadow-text mb-4 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-shadow-accent" />
                الكتب المختارة ({selectedBooks.length})
              </h3>

              {selectedBooks.length === 0 ? (
                <div className="text-center py-12">
                  <GitMerge className="w-16 h-16 mx-auto text-shadow-text/20 mb-3" />
                  <p className="text-shadow-text/60">اختر كتابين على الأقل للبدء</p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {selectedBooks.map((book, index) => (
                    <SelectedBookItem
                      key={book.id}
                      book={book}
                      index={index}
                      total={selectedBooks.length}
                      onRemove={() => handleRemoveBook(book.id)}
                      onMoveUp={() => handleMoveUp(index)}
                      onMoveDown={() => handleMoveDown(index)}
                    />
                  ))}
                </div>
              )}

              {/* الإحصائيات */}
              {selectedBooks.length > 0 && (
                <div className="grid grid-cols-4 gap-3 p-4 bg-shadow-bg rounded-lg">
                  <StatBox label="الكتب" value={stats.totalBooks} />
                  <StatBox label="الكلمات" value={stats.totalWords.toLocaleString()} />
                  <StatBox label="متوسط" value={stats.avgWords.toLocaleString()} />
                  <StatBox label="الصفحات" value={stats.estimatedPages} />
                </div>
              )}

              {/* أزرار الإجراءات */}
              {selectedBooks.length >= 2 && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handlePreview}
                    className="flex-1 cyber-button bg-shadow-primary/20 px-4 py-3 rounded-lg hover:bg-shadow-primary/30 transition-all flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    معاينة
                  </button>
                  <button
                    onClick={handleMerge}
                    disabled={isMerging || !mergedTitle.trim()}
                    className="flex-1 cyber-button bg-shadow-accent px-4 py-3 rounded-lg hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isMerging ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        جاري الدمج...
                      </>
                    ) : (
                      <>
                        <GitMerge className="w-5 h-5" />
                        دمج الآن
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal المعاينة */}
        {showPreview && (
          <PreviewModal
            books={selectedBooks}
            title={mergedTitle}
            mode={mergeMode}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 cyber-grid -z-10" />
    </div>
  );
};

// عنصر المخطوط في القائمة
const ManuscriptItem = ({ manuscript, onAdd, isAdded }) => (
  <div className={`
    p-3 rounded-lg border transition-all cursor-pointer
    ${isAdded 
      ? 'border-shadow-accent/50 bg-shadow-accent/5 opacity-50' 
      : 'border-shadow-primary/20 hover:border-shadow-accent hover:bg-shadow-accent/5'}
  `}>
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-shadow-text truncate">{manuscript.title}</h4>
        <p className="text-xs text-shadow-text/60">
          {(manuscript.word_count || 0).toLocaleString()} كلمة
        </p>
      </div>
      <button
        onClick={() => onAdd(manuscript)}
        disabled={isAdded}
        className={`
          p-2 rounded transition-all
          ${isAdded 
            ? 'bg-shadow-accent/20 text-shadow-accent cursor-not-allowed' 
            : 'hover:bg-shadow-accent/20 text-shadow-text hover:text-shadow-accent'}
        `}
      >
        {isAdded ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>
    </div>
  </div>
);

// عنصر الكتاب المختار
const SelectedBookItem = ({ book, index, total, onRemove, onMoveUp, onMoveDown }) => (
  <div className="cyber-card bg-shadow-bg border border-shadow-primary/20 p-3 rounded-lg">
    <div className="flex items-center gap-3">
      <div className="flex flex-col gap-1">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded hover:bg-shadow-primary/20 text-shadow-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded hover:bg-shadow-primary/20 text-shadow-text disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      </div>

      <div className="text-shadow-text/40">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-shadow-accent bg-shadow-accent/10 px-2 py-1 rounded">
            #{index + 1}
          </span>
          <h4 className="text-sm font-bold text-shadow-text truncate">{book.title}</h4>
        </div>
        <p className="text-xs text-shadow-text/60">{book.wordCount.toLocaleString()} كلمة</p>
      </div>

      <button
        onClick={onRemove}
        className="p-2 rounded hover:bg-red-500/10 text-red-500 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// زر وضع الدمج
const ModeButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      cyber-button px-3 py-2 rounded-lg transition-all flex flex-col items-center gap-1
      ${active 
        ? 'bg-shadow-accent text-white' 
        : 'bg-shadow-bg text-shadow-text hover:bg-shadow-primary/20'}
    `}
  >
    {icon}
    <span className="text-xs">{label}</span>
  </button>
);

// Checkbox للخيارات
const OptionCheckbox = ({ checked, onChange, label, icon }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded border-shadow-primary/30 bg-shadow-bg text-shadow-accent focus:ring-shadow-accent"
    />
    <span className="text-sm text-shadow-text group-hover:text-shadow-accent transition-colors flex items-center gap-1">
      {label}
      {icon}
    </span>
  </label>
);

// صندوق الإحصائية
const StatBox = ({ label, value }) => (
  <div className="text-center">
    <div className="text-lg font-bold text-shadow-text">{value}</div>
    <div className="text-xs text-shadow-text/60">{label}</div>
  </div>
);

// Modal المعاينة
const PreviewModal = ({ books, title, mode, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
    <div className="cyber-card bg-shadow-surface rounded-lg border-2 border-shadow-accent max-w-4xl w-full max-h-[80vh] overflow-hidden">
      <div className="p-6 border-b border-shadow-primary/20 flex items-center justify-between">
        <h3 className="text-2xl font-bold text-shadow-text flex items-center gap-2">
          <Eye className="w-6 h-6 text-shadow-accent" />
          معاينة الدمج
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded hover:bg-shadow-primary/20 text-shadow-text transition-all"
        >
          ✕
        </button>
      </div>

      <div className="p-6 overflow-y-auto max-h-[60vh]">
        <div className="space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-shadow-text mb-2">{title || 'كتاب مدمج'}</h1>
            <p className="text-shadow-text/60">وضع الدمج: {mode === 'sequential' ? 'متسلسل' : mode === 'interleaved' ? 'متداخل' : 'مخصص'}</p>
          </div>

          {books.map((book, index) => (
            <div key={book.id} className="cyber-card bg-shadow-bg p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-shadow-accent">الفصل {index + 1}</span>
                <h4 className="text-lg font-bold text-shadow-text">{book.title}</h4>
              </div>
              <p className="text-sm text-shadow-text/60">{book.wordCount.toLocaleString()} كلمة</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 border-t border-shadow-primary/20 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="cyber-button bg-shadow-primary/20 px-6 py-2 rounded hover:bg-shadow-primary/30 transition-all"
        >
          إغلاق
        </button>
      </div>
    </div>
  </div>
);

export default BookMergerPage;
