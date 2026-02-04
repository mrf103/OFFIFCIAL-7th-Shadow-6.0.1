/**
 * ExportProgress - شريط التقدم للتصدير
 * 
 * عرض حالة التصدير في الوقت الفعلي:
 * - النسبة المئوية
 * - المرحلة الحالية
 * - الوقت المتبقي
 * - الرسائل التفصيلية
 */

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, FileText, BookOpen, Package } from 'lucide-react';

const ExportProgress = ({ progress, currentStage, stages, error }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(null);

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [progress]);

  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const timePerPercent = elapsedTime / progress;
      const remainingPercent = 100 - progress;
      setEstimatedTimeLeft(Math.round(timePerPercent * remainingPercent));
    }
  }, [progress, elapsedTime]);

  // أيقونات المراحل
  const getStageIcon = (stageName) => {
    switch (stageName) {
      case 'pdf': return <FileText className="w-5 h-5" />;
      case 'epub': return <BookOpen className="w-5 h-5" />;
      case 'docx': return <FileText className="w-5 h-5" />;
      case 'agency': return <Package className="w-5 h-5" />;
      default: return <Loader2 className="w-5 h-5 animate-spin" />;
    }
  };

  // تنسيق الوقت
  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}د ${secs}ث` : `${secs}ث`;
  };

  return (
    <div className="bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6 space-y-6">
      {/* العنوان */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-shadow-text">حالة التصدير</h3>
        <div className="text-3xl font-bold text-shadow-accent">
          {progress}%
        </div>
      </div>

      {/* شريط التقدم الرئيسي */}
      <div className="space-y-2">
        <div className="relative h-4 bg-shadow-bg rounded-full overflow-hidden border border-shadow-primary/20">
          <div
            className={`
              absolute top-0 right-0 h-full transition-all duration-500 ease-out
              ${error 
                ? 'bg-red-500' 
                : progress === 100 
                  ? 'bg-green-500' 
                  : 'bg-gradient-to-l from-shadow-accent to-shadow-secondary'}
            `}
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-scan" />
          </div>
        </div>

        {/* معلومات التقدم */}
        <div className="flex justify-between text-sm text-shadow-text/60">
          <span>الوقت المنقضي: {formatTime(elapsedTime)}</span>
          {estimatedTimeLeft && progress < 100 && (
            <span>المتبقي: {formatTime(estimatedTimeLeft)}</span>
          )}
        </div>
      </div>

      {/* المرحلة الحالية */}
      {currentStage && (
        <div className="flex items-center gap-3 p-4 bg-shadow-bg rounded-lg border border-shadow-accent/30">
          <div className="text-shadow-accent">
            {getStageIcon(currentStage.name)}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-shadow-text">{currentStage.label}</div>
            <div className="text-sm text-shadow-text/60">{currentStage.message}</div>
          </div>
          <Loader2 className="w-5 h-5 text-shadow-accent animate-spin" />
        </div>
      )}

      {/* قائمة المراحل */}
      {stages && stages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-shadow-text/60 mb-3">المراحل:</h4>
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`
                flex items-center gap-3 p-3 rounded-lg transition-all
                ${stage.status === 'completed' 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : stage.status === 'in-progress'
                    ? 'bg-shadow-accent/10 border border-shadow-accent/30'
                    : stage.status === 'error'
                      ? 'bg-red-500/10 border border-red-500/30'
                      : 'bg-shadow-bg border border-shadow-primary/20'}
              `}
            >
              {/* الأيقونة */}
              <div className={`
                ${stage.status === 'completed' 
                  ? 'text-green-500' 
                  : stage.status === 'in-progress'
                    ? 'text-shadow-accent'
                    : stage.status === 'error'
                      ? 'text-red-500'
                      : 'text-shadow-text/40'}
              `}>
                {stage.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : stage.status === 'error' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : stage.status === 'in-progress' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  getStageIcon(stage.name)
                )}
              </div>

              {/* المعلومات */}
              <div className="flex-1">
                <div className={`
                  font-medium
                  ${stage.status === 'completed' 
                    ? 'text-green-500' 
                    : stage.status === 'error'
                      ? 'text-red-500'
                      : 'text-shadow-text'}
                `}>
                  {stage.label}
                </div>
                {stage.message && (
                  <div className="text-xs text-shadow-text/60 mt-1">
                    {stage.message}
                  </div>
                )}
              </div>

              {/* الحجم */}
              {stage.size && (
                <div className="text-xs text-shadow-text/60">
                  {(stage.size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* رسالة الخطأ */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-red-500 font-semibold mb-2">
            <AlertCircle className="w-5 h-5" />
            حدث خطأ
          </div>
          <div className="text-sm text-red-400">{error}</div>
        </div>
      )}

      {/* رسالة النجاح */}
      {progress === 100 && !error && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2 text-green-500 font-semibold mb-2">
            <CheckCircle className="w-5 h-5" />
            تم التصدير بنجاح!
          </div>
          <div className="text-sm text-green-400">
            جميع الملفات جاهزة للتنزيل
          </div>
        </div>
      )}

      {/* Cyber Effect */}
      <div className="absolute inset-0 pointer-events-none rounded-lg border border-shadow-accent/20 animate-glow" />
    </div>
  );
};

export default ExportProgress;
