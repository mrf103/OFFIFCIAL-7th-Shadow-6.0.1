import { useState } from 'react';
import { Card } from '@/Components/ui/card';

const SocialSharing = ({ manuscript }) => {
  const [shareStats, setShareStats] = useState({
    twitter: 0,
    facebook: 0,
    linkedin: 0,
    whatsapp: 0,
    telegram: 0
  });

  const [copied, setCopied] = useState(false);

  // Generate share URL (في production سيكون URL حقيقي)
  const shareUrl = manuscript?.id 
    ? `https://shadowseven.com/manuscripts/${manuscript.id}`
    : 'https://shadowseven.com';

  // Generate share text
  const getShareText = (platform) => {
    const title = manuscript?.title || 'مخطوطة رائعة';
    const description = manuscript?.description || 'اكتشف هذه المخطوطة المميزة';
    
    const texts = {
      twitter: `📚 ${title}\n\n${description}\n\n#رواية #أدب #قراءة`,
      facebook: `📚 ${title}\n\n${description}`,
      linkedin: `أحب أن أشارككم هذه المخطوطة الرائعة:\n\n📚 ${title}\n\n${description}`,
      whatsapp: `📚 ${title}\n\n${description}\n\nاقرأها الآن: ${shareUrl}`,
      telegram: `📚 ${title}\n\n${description}\n\n${shareUrl}`,
      email: `${title}\n\n${description}\n\nالرابط: ${shareUrl}`
    };

    return texts[platform] || texts.facebook;
  };

  // Share handlers
  const shareToTwitter = () => {
    const text = encodeURIComponent(getShareText('twitter'));
    const url = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    updateShareCount('twitter');
  };

  const shareToFacebook = () => {
    const url = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    updateShareCount('facebook');
  };

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(shareUrl);
    const title = encodeURIComponent(manuscript?.title || 'مخطوطة رائعة');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
    updateShareCount('linkedin');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText('whatsapp'));
    window.open(`https://wa.me/?text=${text}`, '_blank');
    updateShareCount('whatsapp');
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(getShareText('telegram'));
    window.open(`https://t.me/share/url?url=${shareUrl}&text=${text}`, '_blank');
    updateShareCount('telegram');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(manuscript?.title || 'مخطوطة رائعة');
    const body = encodeURIComponent(getShareText('email'));
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  const updateShareCount = (platform) => {
    setShareStats(prev => ({
      ...prev,
      [platform]: prev[platform] + 1
    }));

    // في production، سيتم حفظ الإحصائيات في قاعدة البيانات
    // await supabase.from('share_stats').insert({ manuscript_id, platform })
  };

  // Native Web Share API (للأجهزة المحمولة)
  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: manuscript?.title || 'مخطوطة رائعة',
          text: manuscript?.description || 'اكتشف هذه المخطوطة المميزة',
          url: shareUrl
        });
        console.log('Shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      alert('المشاركة غير مدعومة في هذا المتصفح');
    }
  };

  const SocialButton = ({ icon, label, color, onClick, count }) => (
    <button
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all hover:shadow-lg hover:scale-105 ${color}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
      {count > 0 && (
        <span className="px-2 py-1 bg-white rounded-full text-sm font-bold">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">📤 مشاركة المخطوطة</h3>
        <p className="text-gray-600">شارك مخطوطتك مع العالم على منصات التواصل الاجتماعي</p>
      </Card>

      {/* Manuscript Preview */}
      {manuscript && (
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900 mb-2">{manuscript.title}</h4>
              <p className="text-gray-600 mb-3 line-clamp-2">{manuscript.description}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>📝 {manuscript.wordCount?.toLocaleString() || 0} كلمة</span>
                <span>📖 {manuscript.chapters || 0} فصل</span>
                <span>⭐ {manuscript.rating || '0.0'}</span>
              </div>
            </div>
            <div className="w-24 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-4xl">
              📚
            </div>
          </div>
        </Card>
      )}

      {/* Social Media Buttons */}
      <Card className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">مشاركة على وسائل التواصل</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SocialButton
            icon="🐦"
            label="Twitter"
            color="border-blue-400 hover:bg-blue-50"
            onClick={shareToTwitter}
            count={shareStats.twitter}
          />
          <SocialButton
            icon="📘"
            label="Facebook"
            color="border-blue-600 hover:bg-blue-50"
            onClick={shareToFacebook}
            count={shareStats.facebook}
          />
          <SocialButton
            icon="💼"
            label="LinkedIn"
            color="border-blue-700 hover:bg-blue-50"
            onClick={shareToLinkedIn}
            count={shareStats.linkedin}
          />
          <SocialButton
            icon="💬"
            label="WhatsApp"
            color="border-green-500 hover:bg-green-50"
            onClick={shareToWhatsApp}
            count={shareStats.whatsapp}
          />
          <SocialButton
            icon="✈️"
            label="Telegram"
            color="border-blue-500 hover:bg-blue-50"
            onClick={shareToTelegram}
            count={shareStats.telegram}
          />
          <SocialButton
            icon="📧"
            label="Email"
            color="border-gray-400 hover:bg-gray-50"
            onClick={shareViaEmail}
            count={0}
          />
        </div>
      </Card>

      {/* Copy Link */}
      <Card className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">نسخ الرابط</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
            dir="ltr"
          />
          <button
            onClick={copyLink}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {copied ? '✅ تم النسخ!' : '📋 نسخ'}
          </button>
        </div>
      </Card>

      {/* Native Share (Mobile) */}
      {navigator.share && (
        <Card className="p-6">
          <button
            onClick={shareNative}
            className="w-full p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            📱 مشاركة (نظام التشغيل)
          </button>
        </Card>
      )}

      {/* Share Stats */}
      <Card className="p-6 bg-gray-50">
        <h4 className="text-lg font-bold text-gray-900 mb-4">📊 إحصائيات المشاركة</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{shareStats.twitter}</div>
            <div className="text-sm text-gray-600">Twitter</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-700">{shareStats.facebook}</div>
            <div className="text-sm text-gray-600">Facebook</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-800">{shareStats.linkedin}</div>
            <div className="text-sm text-gray-600">LinkedIn</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{shareStats.whatsapp}</div>
            <div className="text-sm text-gray-600">WhatsApp</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500">{shareStats.telegram}</div>
            <div className="text-sm text-gray-600">Telegram</div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Object.values(shareStats).reduce((a, b) => a + b, 0)}
          </div>
          <div className="text-sm text-gray-600">إجمالي المشاركات</div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-2">💡 نصائح للمشاركة الفعالة</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• شارك في الأوقات المناسبة لجمهورك المستهدف</li>
          <li>• استخدم الهاشتاجات المناسبة لزيادة الوصول</li>
          <li>• أضف صورة غلاف جذابة للمشاركة</li>
          <li>• اطلب من متابعيك المشاركة والتعليق</li>
          <li>• تفاعل مع التعليقات والردود</li>
        </ul>
      </Card>

      {/* QR Code Generator (اختياري) */}
      <Card className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">📱 رمز QR للمشاركة السريعة</h4>
        <div className="flex flex-col items-center">
          <div className="w-48 h-48 bg-white border-4 border-gray-200 rounded-lg flex items-center justify-center mb-4">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-2">📱</div>
              <div className="text-sm">QR Code</div>
              <div className="text-xs">(قريباً)</div>
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            امسح هذا الرمز للوصول المباشر للمخطوطة
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SocialSharing;
