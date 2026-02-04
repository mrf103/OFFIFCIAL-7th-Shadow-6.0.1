/**
 * useExportManager - Custom Hook لإدارة التصدير
 * 
 * يدير عملية التصدير الكاملة:
 * - توليد المحتوى بواسطة AI Agents
 * - تصدير بجميع الصيغ
 * - إنشاء حزمة Agency
 * - تتبع التقدم والحالة
 */

import { useState, useCallback, useMemo } from 'react';
import { ExportModule } from '../utils/export/ExportModule';
import { AgentCoordinator } from '../utils/SpecializedAgents';

const useExportManager = () => {
  const [state, setState] = useState({
    isProcessing: false,
    progress: 0,
    currentStage: null,
    stages: [],
    results: null,
    error: null
  });

  const exportModule = useMemo(() => new ExportModule(), []);
  const agentCoordinator = useMemo(() => new AgentCoordinator(), []);

  /**
   * تحديث التقدم
   */
  const updateProgress = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * إضافة مرحلة جديدة
   */
  const addStage = useCallback((stage) => {
    setState(prev => ({
      ...prev,
      stages: [...prev.stages, stage]
    }));
  }, []);

  /**
   * تحديث حالة مرحلة
   */
  const updateStage = useCallback((stageName, updates) => {
    setState(prev => ({
      ...prev,
      stages: prev.stages.map(stage =>
        stage.name === stageName ? { ...stage, ...updates } : stage
      )
    }));
  }, []);

  /**
   * التصدير الكامل مع Agency Package
   */
  const exportWithAgency = useCallback(async (manuscript, options = {}) => {
    try {
      setState({
        isProcessing: true,
        progress: 0,
        currentStage: null,
        stages: [],
        results: null,
        error: null
      });

      const startTime = Date.now();

      // المراحل
      const totalStages = 5;
      let currentProgress = 0;

      // 1. توليد المحتوى بواسطة AI (40% من التقدم)
      addStage({
        name: 'ai-generation',
        label: 'توليد المحتوى بالذكاء الاصطناعي',
        status: 'in-progress',
        message: 'جاري معالجة النص وتوليد المحتوى التسويقي...'
      });

      updateProgress({
        progress: 10,
        currentStage: {
          name: 'ai-generation',
          label: 'توليد المحتوى بالذكاء الاصطناعي',
          message: 'معالجة النص الأصلي...'
        }
      });

      const agencyData = await agentCoordinator.generateAgencyPackage(manuscript.content);
      agencyData.manuscript = manuscript;

      updateStage('ai-generation', {
        status: 'completed',
        message: 'تم توليد المحتوى بنجاح'
      });

      currentProgress = 40;
      updateProgress({ progress: currentProgress });

      // 2. تصدير PDF (إذا كان مطلوباً)
      if (options.formats?.pdf) {
        addStage({
          name: 'pdf',
          label: 'تصدير PDF',
          status: 'in-progress',
          message: 'إنشاء ملف PDF...'
        });

        updateProgress({
          progress: currentProgress + 5,
          currentStage: {
            name: 'pdf',
            label: 'تصدير PDF',
            message: 'جاري إنشاء ملف PDF...'
          }
        });

        const pdfResult = await exportModule.exportToPDF(manuscript, options.options);
        if (!agencyData.exports) agencyData.exports = {};
        agencyData.exports.pdf = pdfResult.blob;

        updateStage('pdf', {
          status: 'completed',
          message: 'تم إنشاء PDF بنجاح',
          size: pdfResult.size
        });

        currentProgress += 15;
        updateProgress({ progress: currentProgress });
      }

      // 3. تصدير EPUB (إذا كان مطلوباً)
      if (options.formats?.epub) {
        addStage({
          name: 'epub',
          label: 'تصدير EPUB',
          status: 'in-progress',
          message: 'إنشاء ملف EPUB...'
        });

        updateProgress({
          progress: currentProgress + 5,
          currentStage: {
            name: 'epub',
            label: 'تصدير EPUB',
            message: 'جاري إنشاء ملف EPUB...'
          }
        });

        const epubResult = await exportModule.exportToEPUB(manuscript, options.options);
        agencyData.exports.epub = epubResult.blob;

        updateStage('epub', {
          status: 'completed',
          message: 'تم إنشاء EPUB بنجاح',
          size: epubResult.size
        });

        currentProgress += 15;
        updateProgress({ progress: currentProgress });
      }

      // 4. تصدير DOCX (إذا كان مطلوباً)
      if (options.formats?.docx) {
        addStage({
          name: 'docx',
          label: 'تصدير DOCX',
          status: 'in-progress',
          message: 'إنشاء ملف DOCX...'
        });

        updateProgress({
          progress: currentProgress + 5,
          currentStage: {
            name: 'docx',
            label: 'تصدير DOCX',
            message: 'جاري إنشاء ملف DOCX...'
          }
        });

        const docxResult = await exportModule.exportToDOCX(manuscript, options.options);
        agencyData.exports.docx = docxResult.blob;

        updateStage('docx', {
          status: 'completed',
          message: 'تم إنشاء DOCX بنجاح',
          size: docxResult.size
        });

        currentProgress += 15;
        updateProgress({ progress: currentProgress });
      }

      // 5. إنشاء حزمة Agency (إذا كان مطلوباً)
      if (options.agencyPackage) {
        addStage({
          name: 'agency',
          label: 'حزمة Agency in a Box',
          status: 'in-progress',
          message: 'تجميع الحزمة الكاملة...'
        });

        updateProgress({
          progress: 95,
          currentStage: {
            name: 'agency',
            label: 'حزمة Agency in a Box',
            message: 'جاري تجميع جميع المحتويات...'
          }
        });

        const agencyResult = await exportModule.createAgencyPackage(agencyData);

        updateStage('agency', {
          status: 'completed',
          message: 'تم إنشاء الحزمة الكاملة',
          size: agencyResult.size
        });
      }

      // إنهاء
      const duration = Math.round((Date.now() - startTime) / 1000);

      // إعداد النتائج
      const files = [];
      const formats = [];

      if (agencyData.exports?.pdf) {
        files.push({
          type: 'pdf',
          filename: `${manuscript.title || 'book'}.pdf`,
          blob: agencyData.exports.pdf,
          size: agencyData.exports.pdf.size
        });
        formats.push('PDF');
      }

      if (agencyData.exports?.epub) {
        files.push({
          type: 'epub',
          filename: `${manuscript.title || 'book'}.epub`,
          blob: agencyData.exports.epub,
          size: agencyData.exports.epub.size
        });
        formats.push('EPUB');
      }

      if (agencyData.exports?.docx) {
        files.push({
          type: 'docx',
          filename: `${manuscript.title || 'book'}.docx`,
          blob: agencyData.exports.docx,
          size: agencyData.exports.docx.size
        });
        formats.push('DOCX');
      }

      updateProgress({
        progress: 100,
        currentStage: null,
        results: {
          files,
          formats,
          duration,
          includesAgency: options.agencyPackage,
          agencyData
        },
        isProcessing: false
      });

      return agencyData;

    } catch (error) {
      console.error('Export error:', error);
      setState(prevState => ({
        ...prevState,
        error: error.message,
        isProcessing: false,
        currentStage: null
      }));

      // تحديث المرحلة الحالية كفاشلة
      setState(prevState => {
        if (prevState.currentStage) {
          updateStage(prevState.currentStage.name, {
            status: 'error',
            message: error.message
          });
        }
        return prevState;
      });

      throw error;
    }
  }, [agentCoordinator, exportModule, addStage, updateStage, updateProgress]);

  /**
   * تصدير بصيغة واحدة فقط (بدون Agency)
   */
  const exportSingle = useCallback(async (manuscript, format, options = {}) => {
    try {
      setState({
        isProcessing: true,
        progress: 0,
        currentStage: { name: format, label: `تصدير ${format.toUpperCase()}` },
        stages: [],
        results: null,
        error: null
      });

      updateProgress({ progress: 20 });

      let result;
      switch (format) {
        case 'pdf':
          result = await exportModule.exportToPDF(manuscript, options);
          break;
        case 'epub':
          result = await exportModule.exportToEPUB(manuscript, options);
          break;
        case 'docx':
          result = await exportModule.exportToDOCX(manuscript, options);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      updateProgress({ progress: 100 });

      const finalResults = {
        files: [{
          type: format,
          filename: result.filename,
          blob: result.blob,
          size: result.size
        }],
        formats: [format.toUpperCase()],
        duration: 0,
        includesAgency: false
      };

      setState(prev => ({
        ...prev,
        isProcessing: false,
        results: finalResults
      }));

      return result;

    } catch (error) {
      console.error('Export error:', error);
      setState(prev => ({
        ...prev,
        error: error.message,
        isProcessing: false
      }));
      throw error;
    }
  }, [exportModule, updateProgress]);

  /**
   * تنزيل ملف واحد
   */
  const downloadFile = useCallback((file) => {
    exportModule.downloadFile(file.blob, file.filename);
  }, [exportModule]);

  /**
   * تنزيل جميع الملفات
   */
  const downloadAll = useCallback(async () => {
    if (!state.results?.files) return;

    for (const file of state.results.files) {
      await downloadFile(file);
      // تأخير صغير بين التنزيلات
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }, [state.results, downloadFile]);

  /**
   * إعادة تعيين الحالة
   */
  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      currentStage: null,
      stages: [],
      results: null,
      error: null
    });
  }, []);

  return {
    // الحالة
    isProcessing: state.isProcessing,
    progress: state.progress,
    currentStage: state.currentStage,
    stages: state.stages,
    results: state.results,
    error: state.error,

    // الوظائف
    exportWithAgency,
    exportSingle,
    downloadFile,
    downloadAll,
    reset
  };
};

export default useExportManager;
