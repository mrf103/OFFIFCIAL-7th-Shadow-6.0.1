/**
 * SettingsPage - صفحة الإعدادات
 * 
 * الميزات:
 * - إعدادات الحساب
 * - تفضيلات العرض (Theme, Language, Font)
 * - إعدادات النشر
 * - إعدادات الخصوصية
 * - إدارة الاشتراكات
 */

import { useState, useEffect } from 'react';
import {
  User,
  Palette,
  Lock,
  Bell,
  CreditCard,
  Moon,
  Sun,
  Type,
  BookOpen,
  Download,
  Save,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../Components/ToastProvider';

const SettingsPage = () => {
  const { success, error } = useToast();
  const STORAGE_KEY = 'manuscript-app:settings';

  const [settings, setSettings] = useState({
    // حساب
    username: 'مؤلف محترف',
    email: 'author@example.com',
    bio: '',
    
    // عرض
    theme: 'dark',
    language: 'ar',
    fontSize: 'medium',
    
    // نشر
    defaultFormat: 'pdf',
    autoSave: true,
    autoBackup: true,
    
    // إشعارات
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    
    // خصوصية
    profilePublic: false,
    showStatistics: true,
    allowAnalytics: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('account');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  }, []);

  // حفظ الإعدادات
  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      success('تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      error('فشل حفظ الإعدادات');
    } finally {
      setIsSaving(false);
    }
  };

  // تحديث إعداد واحد
  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  // الأقسام
  const tabs = [
    { id: 'account', label: 'الحساب', icon: User },
    { id: 'appearance', label: 'المظهر', icon: Palette },
    { id: 'publishing', label: 'النشر', icon: BookOpen },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
    { id: 'privacy', label: 'الخصوصية', icon: Lock },
    { id: 'subscription', label: 'الاشتراك', icon: CreditCard }
  ];

  return (
    <div className="min-h-screen bg-shadow-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان */}
        <div>
          <h1 className="text-4xl font-bold text-shadow-text cyber-text mb-2">
            الإعدادات
          </h1>
          <p className="text-shadow-text/60">
            تخصيص تجربتك وإدارة حسابك
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* القائمة الجانبية */}
          <div className="lg:col-span-1">
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-2">
              <div className="space-y-1">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${activeTab === tab.id 
                          ? 'bg-shadow-accent text-white' 
                          : 'text-shadow-text hover:bg-shadow-primary/10'}
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className="lg:col-span-3">
            <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6">
              {/* قسم الحساب */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-shadow-text mb-2">معلومات الحساب</h2>
                    <p className="text-shadow-text/60">إدارة معلومات ملفك الشخصي</p>
                  </div>

                  <div className="space-y-4">
                    <SettingInput
                      label="اسم المستخدم"
                      value={settings.username}
                      onChange={(v) => updateSetting('username', v)}
                    />
                    <SettingInput
                      label="البريد الإلكتروني"
                      type="email"
                      value={settings.email}
                      onChange={(v) => updateSetting('email', v)}
                    />
                    <div>
                      <label className="block text-sm text-shadow-text/60 mb-2">نبذة عنك</label>
                      <textarea
                        value={settings.bio}
                        onChange={(e) => updateSetting('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text placeholder:text-shadow-text/40 focus:outline-none focus:border-shadow-accent transition-colors resize-none"
                        placeholder="اكتب نبذة مختصرة عنك..."
                      />
                    </div>

                    <div className="pt-4 border-t border-shadow-primary/20">
                      <button className="cyber-button bg-red-500/10 text-red-500 px-4 py-2 rounded hover:bg-red-500/20 transition-all">
                        حذف الحساب
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* قسم المظهر */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-shadow-text mb-2">تفضيلات العرض</h2>
                    <p className="text-shadow-text/60">تخصيص مظهر التطبيق</p>
                  </div>

                  <div className="space-y-6">
                    {/* المظهر */}
                    <div>
                      <label className="block text-sm font-semibold text-shadow-text mb-3">المظهر</label>
                      <div className="grid grid-cols-3 gap-3">
                        <ThemeButton
                          active={settings.theme === 'dark'}
                          onClick={() => updateSetting('theme', 'dark')}
                          icon={<Moon className="w-5 h-5" />}
                          label="داكن"
                        />
                        <ThemeButton
                          active={settings.theme === 'light'}
                          onClick={() => updateSetting('theme', 'light')}
                          icon={<Sun className="w-5 h-5" />}
                          label="فاتح"
                        />
                        <ThemeButton
                          active={settings.theme === 'auto'}
                          onClick={() => updateSetting('theme', 'auto')}
                          icon={<Palette className="w-5 h-5" />}
                          label="تلقائي"
                        />
                      </div>
                    </div>

                    {/* اللغة */}
                    <div>
                      <label className="block text-sm font-semibold text-shadow-text mb-3">اللغة</label>
                      <select
                        value={settings.language}
                        onChange={(e) => updateSetting('language', e.target.value)}
                        className="w-full px-4 py-3 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text focus:outline-none focus:border-shadow-accent transition-colors"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    {/* حجم الخط */}
                    <div>
                      <label className="block text-sm font-semibold text-shadow-text mb-3">حجم الخط</label>
                      <div className="grid grid-cols-3 gap-3">
                        <ThemeButton
                          active={settings.fontSize === 'small'}
                          onClick={() => updateSetting('fontSize', 'small')}
                          icon={<Type className="w-4 h-4" />}
                          label="صغير"
                        />
                        <ThemeButton
                          active={settings.fontSize === 'medium'}
                          onClick={() => updateSetting('fontSize', 'medium')}
                          icon={<Type className="w-5 h-5" />}
                          label="متوسط"
                        />
                        <ThemeButton
                          active={settings.fontSize === 'large'}
                          onClick={() => updateSetting('fontSize', 'large')}
                          icon={<Type className="w-6 h-6" />}
                          label="كبير"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* قسم النشر */}
              {activeTab === 'publishing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-shadow-text mb-2">إعدادات النشر</h2>
                    <p className="text-shadow-text/60">تفضيلات النشر والتصدير</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-shadow-text mb-3">صيغة التصدير الافتراضية</label>
                      <select
                        value={settings.defaultFormat}
                        onChange={(e) => updateSetting('defaultFormat', e.target.value)}
                        className="w-full px-4 py-3 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text focus:outline-none focus:border-shadow-accent transition-colors"
                      >
                        <option value="pdf">PDF</option>
                        <option value="epub">EPUB</option>
                        <option value="docx">DOCX</option>
                        <option value="txt">TXT</option>
                      </select>
                    </div>

                    <SettingToggle
                      label="حفظ تلقائي"
                      description="حفظ التغييرات تلقائياً أثناء الكتابة"
                      checked={settings.autoSave}
                      onChange={(v) => updateSetting('autoSave', v)}
                    />

                    <SettingToggle
                      label="نسخ احتياطي تلقائي"
                      description="إنشاء نسخ احتياطية يومية"
                      checked={settings.autoBackup}
                      onChange={(v) => updateSetting('autoBackup', v)}
                    />
                  </div>
                </div>
              )}

              {/* قسم الإشعارات */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-shadow-text mb-2">الإشعارات</h2>
                    <p className="text-shadow-text/60">إدارة تنبيهاتك وإشعاراتك</p>
                  </div>

                  <div className="space-y-4">
                    <SettingToggle
                      label="إشعارات البريد"
                      description="استلام تحديثات عبر البريد الإلكتروني"
                      checked={settings.emailNotifications}
                      onChange={(v) => updateSetting('emailNotifications', v)}
                    />

                    <SettingToggle
                      label="الإشعارات الفورية"
                      description="إشعارات push على المتصفح"
                      checked={settings.pushNotifications}
                      onChange={(v) => updateSetting('pushNotifications', v)}
                    />

                    <SettingToggle
                      label="التقرير الأسبوعي"
                      description="ملخص أسبوعي لنشاطك"
                      checked={settings.weeklyReport}
                      onChange={(v) => updateSetting('weeklyReport', v)}
                    />
                  </div>
                </div>
              )}

              {/* قسم الخصوصية */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-shadow-text mb-2">الخصوصية والأمان</h2>
                    <p className="text-shadow-text/60">التحكم في خصوصية بياناتك</p>
                  </div>

                  <div className="space-y-4">
                    <SettingToggle
                      label="ملف عام"
                      description="السماح للآخرين برؤية ملفك الشخصي"
                      checked={settings.profilePublic}
                      onChange={(v) => updateSetting('profilePublic', v)}
                    />

                    <SettingToggle
                      label="إظهار الإحصائيات"
                      description="عرض إحصائيات كتاباتك للعامة"
                      checked={settings.showStatistics}
                      onChange={(v) => updateSetting('showStatistics', v)}
                    />

                    <SettingToggle
                      label="السماح بالتحليلات"
                      description="المساعدة في تحسين التطبيق"
                      checked={settings.allowAnalytics}
                      onChange={(v) => updateSetting('allowAnalytics', v)}
                    />

                    <div className="pt-4 border-t border-shadow-primary/20">
                      <button className="cyber-button bg-shadow-accent/10 text-shadow-accent px-4 py-2 rounded hover:bg-shadow-accent/20 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        تحميل بياناتي
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* قسم الاشتراك */}
              {activeTab === 'subscription' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-shadow-text mb-2">الاشتراك والفوترة</h2>
                    <p className="text-shadow-text/60">إدارة اشتراكك ومدفوعاتك</p>
                  </div>

                  <div className="cyber-card bg-gradient-to-br from-shadow-accent/10 to-purple-600/10 border-2 border-shadow-accent/30 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-shadow-text mb-2">الخطة الاحترافية</h3>
                        <p className="text-shadow-text/60">اشتراك نشط</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        نشط
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-shadow-text/60">السعر</span>
                        <span className="font-bold text-shadow-text">$29.99/شهر</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-shadow-text/60">التجديد التالي</span>
                        <span className="font-bold text-shadow-text">15 فبراير 2026</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 cyber-button bg-shadow-accent px-4 py-2 rounded hover:shadow-glow transition-all">
                        ترقية الخطة
                      </button>
                      <button className="flex-1 cyber-button bg-shadow-primary/20 px-4 py-2 rounded hover:bg-shadow-primary/30 transition-all">
                        إلغاء الاشتراك
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-shadow-text mb-3">سجل الفواتير</h3>
                    <div className="space-y-2">
                      <InvoiceItem date="15 يناير 2026" amount="$29.99" status="مدفوع" />
                      <InvoiceItem date="15 ديسمبر 2025" amount="$29.99" status="مدفوع" />
                      <InvoiceItem date="15 نوفمبر 2025" amount="$29.99" status="مدفوع" />
                    </div>
                  </div>
                </div>
              )}

              {/* زر الحفظ */}
              <div className="pt-6 border-t border-shadow-primary/20 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="cyber-button bg-shadow-accent px-6 py-3 rounded-lg hover:shadow-glow transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      حفظ التغييرات
                    </>
                  )}
                </button>
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

// مكون إدخال الإعدادات
const SettingInput = ({ label, type = 'text', value, onChange }) => (
  <div>
    <label className="block text-sm text-shadow-text/60 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-shadow-bg border border-shadow-primary/30 rounded-lg text-shadow-text placeholder:text-shadow-text/40 focus:outline-none focus:border-shadow-accent transition-colors"
    />
  </div>
);

// مكون Toggle
const SettingToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 p-4 bg-shadow-bg rounded-lg">
    <div className="flex-1">
      <h4 className="text-sm font-semibold text-shadow-text mb-1">{label}</h4>
      <p className="text-xs text-shadow-text/60">{description}</p>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-colors
        ${checked ? 'bg-shadow-accent' : 'bg-shadow-primary/30'}
      `}
    >
      <div
        className={`
          absolute top-1 w-4 h-4 bg-white rounded-full transition-transform
          ${checked ? 'translate-x-7' : 'translate-x-1'}
        `}
      />
    </button>
  </div>
);

// زر المظهر
const ThemeButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      cyber-button p-4 rounded-lg transition-all flex flex-col items-center gap-2
      ${active 
        ? 'bg-shadow-accent text-white' 
        : 'bg-shadow-bg text-shadow-text hover:bg-shadow-primary/20'}
    `}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

// عنصر الفاتورة
const InvoiceItem = ({ date, amount, status }) => (
  <div className="flex items-center justify-between p-3 bg-shadow-bg rounded-lg">
    <div>
      <p className="text-sm text-shadow-text">{date}</p>
    </div>
    <div className="flex items-center gap-3">
      <span className="font-bold text-shadow-text">{amount}</span>
      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs">{status}</span>
      <button className="text-shadow-text/60 hover:text-shadow-accent transition-colors">
        <Download className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default SettingsPage;
