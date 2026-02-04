import { useState, useEffect } from 'react';
import { Card } from '@/Components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { supabase } from '@/api/supabaseClient';

const AnalyticsDashboardPage = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalManuscripts: 0,
      totalWords: 0,
      totalReads: 0,
      avgRating: 0,
      growthRate: 0
    },
    manuscriptStats: [],
    genreDistribution: [],
    readingTrends: [],
    userEngagement: [],
    performanceMetrics: []
  });

  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d, 1y
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('id,title,word_count,genre,status,created_at');

      if (error) throw error;

      const manuscripts = data || [];

      // Overview
      const totalManuscripts = manuscripts.length;
      const totalWords = manuscripts.reduce((sum, m) => sum + (m.word_count || 0), 0);

      // Genre distribution
      const genreColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#14b8a6'];
      const genreMap = manuscripts.reduce((acc, m) => {
        const key = m.genre || 'غير محدد';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const genreDistribution = Object.entries(genreMap).map(([name, value], idx) => ({
        name,
        value,
        color: genreColors[idx % genreColors.length]
      }));

      // Manuscript stats (top 10 by words)
      const manuscriptStats = [...manuscripts]
        .sort((a, b) => (b.word_count || 0) - (a.word_count || 0))
        .slice(0, 10)
        .map((m) => ({
          name: m.title || 'بدون عنوان',
          words: m.word_count || 0,
          reads: 0, // لا يوجد حقل قراءات حالياً
          rating: 0, // لا يوجد تقييم حالياً
          status: m.status || 'draft'
        }));

      // Reading trends by day (based على created_at إن وجد)
      const trendsMap = manuscripts.reduce((acc, m) => {
        if (!m.created_at) return acc;
        const date = new Date(m.created_at);
        if (isNaN(date)) return acc;
        const key = date.toLocaleDateString('ar-EG');
        if (!acc[key]) acc[key] = { date: key, reads: 0, likes: 0, shares: 0 };
        acc[key].reads += 1;
        return acc;
      }, {});
      const readingTrends = Object.values(trendsMap).sort((a, b) => new Date(a.date) - new Date(b.date));

      // Performance metrics by month
      const perfMap = manuscripts.reduce((acc, m) => {
        if (!m.created_at) return acc;
        const date = new Date(m.created_at);
        if (isNaN(date)) return acc;
        const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!acc[key]) acc[key] = { month: key, manuscripts: 0, reads: 0, engagement: 0 };
        acc[key].manuscripts += 1;
        return acc;
      }, {});
      const performanceMetrics = Object.values(perfMap).sort((a, b) => a.month.localeCompare(b.month));

      setAnalytics({
        overview: {
          totalManuscripts,
          totalWords,
          totalReads: 0, // لا يوجد حقل قراءات حالياً
          avgRating: 0,
          growthRate: 0
        },
        manuscriptStats,
        genreDistribution,
        readingTrends,
        userEngagement: [],
        performanceMetrics
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics((prev) => ({
        ...prev,
        overview: { ...prev.overview, totalManuscripts: 0, totalWords: 0 },
        manuscriptStats: [],
        genreDistribution: [],
        readingTrends: [],
        performanceMetrics: [],
        userEngagement: []
      }));
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, trend }) => (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
      {trend && (
        <div className={`mt-4 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% من الشهر الماضي
        </div>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 لوحة التحليلات</h1>
        <p className="text-gray-600">تحليل شامل لأداء مخطوطاتك وتفاعل القراء</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {[
          { label: '7 أيام', value: '7d' },
          { label: '30 يوم', value: '30d' },
          { label: '90 يوم', value: '90d' },
          { label: 'سنة', value: '1y' }
        ].map(range => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي المخطوطات"
          value={analytics.overview.totalManuscripts}
          icon="📚"
          trend={0}
        />
        <StatCard
          title="إجمالي الكلمات"
          value={analytics.overview.totalWords.toLocaleString()}
          icon="📝"
          trend={0}
        />
        <StatCard
          title="إجمالي القراءات"
          value={analytics.overview.totalReads.toLocaleString()}
          icon="👁️"
          trend={0}
        />
        <StatCard
          title="متوسط التقييم"
          value={analytics.overview.avgRating.toFixed(1)}
          subtitle="من 5.0"
          icon="⭐"
          trend={0}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reading Trends */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 اتجاهات القراءة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.readingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="reads" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="القراءات" />
              <Area type="monotone" dataKey="likes" stackId="1" stroke="#10b981" fill="#10b981" name="الإعجابات" />
              <Area type="monotone" dataKey="shares" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="المشاركات" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Genre Distribution */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 توزيع الأنواع الأدبية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.genreDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.genreDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Manuscript Performance */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 أداء المخطوطات</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.manuscriptStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reads" fill="#3b82f6" name="القراءات" />
              <Bar dataKey="rating" fill="#10b981" name="التقييم (×1000)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* User Engagement Radar */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">💫 تفاعل المستخدمين</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={analytics.userEngagement}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="التفاعل" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Performance Timeline */}
      <Card className="p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📅 الأداء عبر الزمن</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.performanceMetrics}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="left" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="manuscripts" stroke="#3b82f6" name="المخطوطات" strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="reads" stroke="#10b981" name="القراءات (÷100)" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#f59e0b" name="التفاعل %" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Manuscripts Table */}
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🏆 أفضل المخطوطات أداءً</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">#</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">العنوان</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">الكلمات</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">القراءات</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">التقييم</th>
                <th className="px-4 py-3 text-sm font-medium text-gray-700">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics.manuscriptStats.map((manuscript, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">{manuscript.name}</td>
                  <td className="px-4 py-3 text-sm">{manuscript.words.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">{manuscript.reads.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span>{manuscript.rating}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      manuscript.status === 'منشورة' 
                        ? 'bg-green-100 text-green-800'
                        : manuscript.status === 'قيد المراجعة'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {manuscript.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Analytics Button */}
      <div className="mt-8 flex justify-center">
        <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow">
          📥 تصدير التحليلات (PDF)
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
