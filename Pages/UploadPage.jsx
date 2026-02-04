/**
 * UploadPage - صفحة رفع المخطوطات الكاملة
 * 
 * الميزات:
 * - Drag & Drop متقدم
 * - معالجة NLP محلية
 * - Preview + Validation
 * - تكامل مع TextAnalyzerEnhanced
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../Components/ToastProvider';
import { analyzeAndCleanText } from '@/Components/upload/TextAnalyzerEnhanced';
import { supabase } from '../api/supabaseClient';

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const fileInputRef = useRef(null);
  const { success, error } = useToast();

  // التحقق من نوع الملف
  const validateFile = (file) => {
    const validTypes = ['text/plain'];
    const validExtensions = ['.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      error('الآن ندعم ملفات TXT فقط. حوّل الملف إلى TXT ثم أعد الرفع.');
      return false;
    }

    // حجم الملف (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      error('حجم الملف كبير جداً. الحد الأقصى: 50 ميجابايت');
      return false;
    }

    return true;
  };

  // قراءة محتوى الملف
  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = () => {
        reject(new Error('فشل قراءة الملف'));
      };

      // قراءة النص (TXT فقط)
      reader.readAsText(file, 'UTF-8');
    });
  };

  // معالجة الملفات المرفوعة
  const handleFiles = async (newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length === 0) return;

    // إضافة الملفات مع حالة
    const filesWithState = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'pending', // pending, analyzing, completed, error
      progress: 0,
      content: null,
      analysis: null
    }));

    setFiles(prev => [...prev, ...filesWithState]);
    success(`تم إضافة ${validFiles.length} ملف بنجاح`);

    // بدء معالجة أول ملف تلقائياً
    if (validFiles.length > 0 && !analyzing) {
      processFile(filesWithState[0]);
    }
  };

  // معالجة ملف واحد
  const processFile = async (fileObj) => {
    setAnalyzing(true);
    setCurrentFile(fileObj);

    try {
      // تحديث حالة الملف
      updateFileStatus(fileObj.id, 'analyzing', 10);

      // قراءة المحتوى
      const content = await readFileContent(fileObj.file);
      
      updateFileStatus(fileObj.id, 'analyzing', 30);

      // تخزين المحتوى
      setFiles(prev => prev.map(f => 
        f.id === fileObj.id ? { ...f, content } : f
      ));

      success('تم قراءة الملف بنجاح. جاري التحليل...');
      updateFileStatus(fileObj.id, 'analyzing', 50);

      // بدء التحليل مباشرة باستخدام الدالة بدلاً من مكون غير موجود
      const logger = {
        start: () => {},
        progress: (info) => {
          // تقدير تقدّم بسيط بين 50% و 90%
          const next = Math.min(90, 50 + Math.floor((info?.completed || 0) / (info?.total || 1) * 40));
          updateFileStatus(fileObj.id, 'analyzing', next);
        },
        complete: () => {},
        warn: () => {}
      };

      const analysis = await analyzeAndCleanText(content, 'ar', logger);
      await handleAnalysisComplete(analysis);

    } catch (err) {
      console.error('Error processing file:', err);
      updateFileStatus(fileObj.id, 'error', 0);
      error(`فشل معالجة الملف: ${err.message}`);
      setAnalyzing(false);
      setCurrentFile(null);
    }
  };

  // تحديث حالة الملف
  const updateFileStatus = (fileId, status, progress) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, status, progress } : f
    ));
  };

  // رفع إلى Supabase
  const uploadToSupabase = async (fileObj, analysisResults) => {
    try {
      updateFileStatus(fileObj.id, 'analyzing', 80);

      // 1. رفع الملف إلى Storage
      const fileName = `${Date.now()}-${fileObj.file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from('manuscripts')
        .upload(fileName, fileObj.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) throw storageError;

      updateFileStatus(fileObj.id, 'analyzing', 90);

      // 2. الحصول على المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();

      // 3. حفظ البيانات في Database
      const { data: manuscript, error: dbError } = await supabase
        .from('manuscripts')
        .insert({
          title: fileObj.name.replace(/\.(txt|docx|pdf)$/i, ''),
          content: fileObj.content,
          file_path: storageData.path,
          word_count: analysisResults.wordCount || 0,
          status: 'draft',
          user_id: user?.id,
          metadata: {
            chapters: analysisResults.chapters || [],
            content_type: analysisResults.contentType,
            language: analysisResults.language,
            analysis: analysisResults
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      updateFileStatus(fileObj.id, 'completed', 100);
      success('تم رفع المخطوطة بنجاح إلى قاعدة البيانات! 🎉');
      
      return manuscript;
    } catch (err) {
      console.error('Upload to Supabase error:', err);
      error(`فشل الرفع: ${err.message}`);
      throw err;
    }
  };

  // معالجة نتائج التحليل
  const handleAnalysisComplete = async (results) => {
    if (currentFile) {
      setFiles(prev => prev.map(f =>
        f.id === currentFile.id 
          ? { ...f, status: 'completed', progress: 100, analysis: results }
          : f
      ));
      
      setAnalysisResults(results);
      success('✅ تم التحليل بنجاح! يمكنك الآن الانتقال للخطوة التالية.');
      
      // TODO: رفع إلى Supabase بعد إنشاء الجداول
      // await uploadToSupabase(currentFile, results);
    }
    
    setAnalyzing(false);
    setCurrentFile(null);
  };

  // حذف ملف
  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (currentFile?.id === fileId) {
      setCurrentFile(null);
      setAnalyzing(false);
    }
  };

  // Drag & Drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, []);

  // فتح نافذة اختيار الملفات
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // معالجة اختيار الملفات
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // تنسيق حجم الملف
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-shadow-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* العنوان */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-shadow-text cyber-text">
            رفع مخطوط جديد
          </h1>
          <p className="text-shadow-text/60">
            ارفع ملف النص وسنقوم بتحليله بالذكاء الاصطناعي
          </p>
        </div>

        {/* منطقة الرفع */}
        <div
          className={`
            cyber-card relative rounded-lg border-2 border-dashed p-12 text-center
            transition-all duration-300 cursor-pointer
            ${isDragging 
              ? 'border-shadow-accent bg-shadow-accent/10 scale-105' 
              : 'border-shadow-primary/30 hover:border-shadow-accent/50'}
          `}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,text/plain"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`
                w-24 h-24 rounded-full flex items-center justify-center
                ${isDragging ? 'bg-shadow-accent/20' : 'bg-shadow-primary/10'}
                transition-all
              `}>
                <Upload className={`
                  w-12 h-12
                  ${isDragging ? 'text-shadow-accent animate-pulse' : 'text-shadow-text/60'}
                `} />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-shadow-text mb-2">
                {isDragging ? 'أفلت الملفات هنا' : 'اسحب الملفات هنا'}
              </h3>
              <p className="text-shadow-text/60">
                أو انقر للاختيار من جهازك
              </p>
            </div>

            <div className="flex justify-center gap-2 flex-wrap text-sm text-shadow-text/40">
              <span>الصيغ المدعومة:</span>
              <span className="text-shadow-accent">TXT</span>
            </div>

            <div className="text-sm text-shadow-text/40">
              الحد الأقصى للحجم: 50 ميجابايت
            </div>
          </div>
        </div>

        {/* قائمة الملفات */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-shadow-text">
              الملفات المرفوعة ({files.length})
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {files.map(fileObj => (
                <FileCard
                  key={fileObj.id}
                  fileObj={fileObj}
                  onRemove={() => removeFile(fileObj.id)}
                  onAnalyze={() => processFile(fileObj)}
                  isProcessing={currentFile?.id === fileObj.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* التحليل يتم الآن مباشرة عبر الدالة analyzeAndCleanText */}

        {/* نتائج التحليل */}
        {analysisResults && (
          <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-6">
            <h2 className="text-2xl font-bold text-shadow-text mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-shadow-accent" />
              نتائج التحليل
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="عدد الكلمات" value={analysisResults.wordCount?.toLocaleString() || '0'} />
              <StatCard label="الفصول" value={analysisResults.chapters?.length || '0'} />
              <StatCard label="نوع المحتوى" value={analysisResults.contentType || 'غير محدد'} />
              <StatCard label="الحالة" value="جاهز للنشر" icon={<CheckCircle className="w-5 h-5 text-green-500" />} />
            </div>
          </div>
        )}
      </div>

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-10 cyber-grid -z-10" />
    </div>
  );
};

// بطاقة الملف
const FileCard = ({ fileObj, onRemove, onAnalyze, isProcessing }) => {
  const getStatusIcon = () => {
    switch (fileObj.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'analyzing':
        return <div className="w-5 h-5 border-2 border-shadow-accent border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="w-5 h-5 text-shadow-text/60" />;
    }
  };

  const getStatusText = () => {
    switch (fileObj.status) {
      case 'completed':
        return 'اكتمل التحليل';
      case 'error':
        return 'فشل';
      case 'analyzing':
        return 'جاري التحليل...';
      default:
        return 'قيد الانتظار';
    }
  };

  return (
    <div className="cyber-card bg-shadow-surface rounded-lg border border-shadow-primary/20 p-4">
      <div className="flex items-center gap-4">
        {/* الأيقونة */}
        <div className="flex-shrink-0">
          {getStatusIcon()}
        </div>

        {/* معلومات الملف */}
        <div className="flex-1 min-w-0">
          <h3 className="text-shadow-text font-semibold truncate">{fileObj.name}</h3>
          <div className="flex items-center gap-3 text-sm text-shadow-text/60">
            <span>{formatFileSize(fileObj.size)}</span>
            <span>•</span>
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* شريط التقدم */}
        {fileObj.status === 'analyzing' && (
          <div className="w-32">
            <div className="h-2 bg-shadow-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-shadow-accent transition-all duration-300"
                style={{ width: `${fileObj.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* الأزرار */}
        <div className="flex gap-2">
          {fileObj.status === 'pending' && !isProcessing && (
            <button
              onClick={onAnalyze}
              className="cyber-button bg-shadow-accent px-4 py-2 rounded text-sm hover:shadow-glow transition-all"
            >
              تحليل
            </button>
          )}
          
          <button
            onClick={onRemove}
            className="p-2 rounded hover:bg-red-500/10 text-red-500 transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// بطاقة الإحصائية
const StatCard = ({ label, value, icon }) => (
  <div className="bg-shadow-bg rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-shadow-text/60">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold text-shadow-text">{value}</div>
  </div>
);

// Helper function
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default UploadPage;
