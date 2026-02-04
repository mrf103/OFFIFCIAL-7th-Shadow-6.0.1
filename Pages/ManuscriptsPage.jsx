/**
 * ManuscriptsPage - صفحة إدارة المخطوطات
 * 
 * الميزات:
 * - عرض جميع المخطوطات
 * - تصفية وبحث متقدم
 * - إحصائيات تفصيلية
 * - معاينة سريعة
 * - إجراءات (تحرير، تصدير، حذف)
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  Eye,
  Edit,
  Trash2,
  Download,
  BookOpen,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '../Components/ToastProvider';
import { useManuscripts } from '../hooks/useManuscripts';
import LoadingSpinner from '../Components/LoadingSpinner';
import ErrorDisplay from '../Components/ErrorDisplay';
import StatCard from '../Components/StatCard';
import Card from '../Components/Card';
import PageContainer, { PageContent, PageHeader } from '../Components/PageContainer';

const ManuscriptsPage = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const { data: manuscripts, isLoading, isError } = useManuscripts();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // تصفية وترتيب المخطوطات
  const filteredManuscripts = useMemo(() => {
    if (!manuscripts) return [];

    let filtered = manuscripts;

    // البحث
    if (searchQuery) {
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.genre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // التصفية حسب الحالة
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // الترتيب
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at) - new Date(a.updated_at);
        case 'oldest':
          return new Date(a.updated_at) - new Date(b.updated_at);
        case 'title':
          return a.title.localeCompare(b.title, 'ar');
        case 'wordCount':
          return (b.word_count || 0) - (a.word_count || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [manuscripts, searchQuery, statusFilter, sortBy]);

  // إحصائيات
  const stats = useMemo(() => {
    if (!manuscripts) return { total: 0, draft: 0, processing: 0, completed: 0, totalWords: 0 };
    
    return {
      total: manuscripts.length,
      draft: manuscripts.filter(m => m.status === 'draft').length,
      processing: manuscripts.filter(m => m.status === 'processing').length,
      completed: manuscripts.filter(m => m.status === 'completed').length,
      totalWords: manuscripts.reduce((sum, m) => sum + (m.word_count || 0), 0)
    };
  }, [manuscripts]);

  // معالجات الأحداث
  const handleNewManuscript = () => {
    navigate('/upload');
  };

  const handleView = (manuscript) => {
    navigate(`/manuscripts/${manuscript.id}`);
  };

  const handleEdit = (manuscript) => {
    navigate(`/elite-editor/${manuscript.id}`);
  };

  const handleExport = (manuscript) => {
    navigate('/export', { state: { manuscript } });
  };

  const handleDelete = async (manuscript) => {
    if (confirm(`هل تريد حذف "${manuscript.title}"؟`)) {
      try {
        // TODO: API call to delete
        success('تم حذف المخطوط بنجاح');
      } catch (err) {
        error('فشل حذف المخطوط');
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-shadow-bg flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري تحميل المخطوطات..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-shadow-bg flex items-center justify-center p-6">
        <ErrorDisplay 
          title="حدث خطأ"
          message="فشل تحميل المخطوطات. يرجى المحاولة مرة أخرى."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <PageContainer>
      <PageContent>
        {/* العنوان والإحصائيات */}
        <PageHeader 
          title="مخطوطاتي"
          subtitle="إدارة ومتابعة جميع أعمالك الأدبية"
          action={
            <button
              onClick={handleNewManuscript}
              className="cyber-button bg-shadow-accent px-6 py-3 rounded-lg hover:shadow-glow transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              مخطوط جديد
            </button>
          }
        />

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label="إجمالي المخطوطات"
            value={stats.total.toLocaleString()}
            color="default"
          />
          <StatCard
            icon={<Edit className="w-6 h-6" />}
            label="مسودات"
            value={stats.draft.toLocaleString()}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="قيد المعالجة"
            value={stats.processing.toLocaleString()}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="مكتملة"
            value={stats.completed.toLocaleString()}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="إجمالي الكلمات"
            value={(stats.totalWords / 1000).toFixed(1) + 'K'}
            color="default"
          />
        </div>

        {/* شريط البحث والتصفية */}
        <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* البحث */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-shadow-text/40" />
              <input
                type="text"
                placeholder="ابحث عن مخطوط..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text placeholder:text-shadow-text/40 focus:outline-none focus:border-shadow-accent transition-colors"
              />
            </div>

            {/* التصفية */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text focus:outline-none focus:border-shadow-accent transition-colors"
              >
                <option value="all">جميع الحالات</option>
                <option value="draft">مسودة</option>
                <option value="processing">قيد المعالجة</option>
                <option value="completed">مكتملة</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text focus:outline-none focus:border-shadow-accent transition-colors"
              >
                <option value="recent">الأحدث</option>
                <option value="oldest">الأقدم</option>
                <option value="title">الاسم</option>
                <option value="wordCount">عدد الكلمات</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-2 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text hover:border-shadow-accent transition-colors"
              >
                {viewMode === 'grid' ? 'قائمة' : 'شبكة'}
              </button>
            </div>
          </div>
        </div>

        {/* قائمة المخطوطات */}
        {filteredManuscripts.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-24 h-24 mx-auto text-shadow-text/20 mb-4" />
            <h3 className="text-2xl font-bold text-shadow-text mb-2">
              {searchQuery || statusFilter !== 'all' ? 'لا توجد نتائج' : 'لا توجد مخطوطات'}
            </h3>
            <p className="text-shadow-text/60 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'جرب تغيير معايير البحث' 
                : 'ابدأ بإنشاء مخطوطك الأول'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={handleNewManuscript}
                className="cyber-button bg-shadow-accent px-6 py-3 rounded-lg hover:shadow-glow transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                مخطوط جديد
              </button>
            )}
          </div>
        ) : (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
              : 'space-y-3'}
          `}>
            {filteredManuscripts.map(manuscript => (
              <ManuscriptCard
                key={manuscript.id}
                manuscript={manuscript}
                viewMode={viewMode}
                onView={handleView}
                onEdit={handleEdit}
                onExport={handleExport}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 cyber-grid -z-10" />
      </PageContent>
    </PageContainer>
  );
};

// بطاقة المخطوط
const ManuscriptCard = ({ manuscript, viewMode, onView, onEdit, onExport, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'text-blue-500 bg-blue-500/10';
      case 'processing':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-shadow-text/60 bg-shadow-bg';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'مسودة';
      case 'processing':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتملة';
      default:
        return status;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (viewMode === 'list') {
    return (
      <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4 hover:border-shadow-accent transition-all">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-shadow-text truncate">{manuscript.title}</h3>
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(manuscript.status)}`}>
                {getStatusText(manuscript.status)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-shadow-text/60">
              <span>{manuscript.author || 'غير محدد'}</span>
              <span>•</span>
              <span>{(manuscript.word_count || 0).toLocaleString()} كلمة</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(manuscript.updated_at)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <ActionButton icon={<Eye className="w-4 h-4" />} onClick={() => onView(manuscript)} tooltip="عرض" />
            <ActionButton icon={<Edit className="w-4 h-4" />} onClick={() => onEdit(manuscript)} tooltip="تحرير" />
            <ActionButton icon={<Download className="w-4 h-4" />} onClick={() => onExport(manuscript)} tooltip="تصدير" />
            <ActionButton icon={<Trash2 className="w-4 h-4" />} onClick={() => onDelete(manuscript)} tooltip="حذف" danger />
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4 hover:border-shadow-accent transition-all">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-shadow-text line-clamp-2">{manuscript.title}</h3>
          <span className={`px-2 py-1 rounded text-xs flex-shrink-0 ${getStatusColor(manuscript.status)}`}>
            {getStatusText(manuscript.status)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-shadow-text/60">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>{(manuscript.word_count || 0).toLocaleString()} كلمة</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(manuscript.updated_at)}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-shadow-primary/20 flex gap-2">
          <button
            onClick={() => onView(manuscript)}
            className="flex-1 cyber-button bg-shadow-accent/10 text-shadow-accent px-3 py-2 rounded text-sm hover:bg-shadow-accent/20 transition-all"
          >
            عرض
          </button>
          <button
            onClick={() => onEdit(manuscript)}
            className="flex-1 cyber-button bg-shadow-primary/10 text-shadow-text px-3 py-2 rounded text-sm hover:bg-shadow-primary/20 transition-all"
          >
            تحرير
          </button>
        </div>
      </div>
    </div>
  );
};

// زر الإجراء
const ActionButton = ({ icon, onClick, tooltip, danger = false }) => (
  <button
    onClick={onClick}
    title={tooltip}
    className={`
      p-2 rounded transition-all
      ${danger 
        ? 'hover:bg-red-500/10 text-red-500' 
        : 'hover:bg-shadow-accent/10 text-shadow-text hover:text-shadow-accent'}
    `}
  >
    {icon}
  </button>
);

export default ManuscriptsPage;
