/**
 * Hook لإدارة مؤشر التقدم الحي
 * Live Progress Manager Hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export function useProgressTracker() {
  const [currentStage, setCurrentStage] = useState('');
  const [progress, setProgress] = useState({ 
    percentage: 0, 
    completed: 0, 
    total: 0 
  });
  const [stageData, setStageData] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const stageHistoryRef = useRef([]);

  // بدء التتبع
  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsComplete(false);
    setHasError(false);
    setErrorMessage('');
    setElapsedTime(0);
    stageHistoryRef.current = [];
    
    // تحديث الوقت المنقضي كل ثانية
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setElapsedTime(elapsed);
      }
    }, 1000);
  }, []);

  // تحديث المرحلة
  const updateStage = useCallback((stage, data = {}) => {
    setCurrentStage(stage);
    setStageData(data);
    
    // حفظ في التاريخ
    stageHistoryRef.current.push({
      stage,
      timestamp: Date.now(),
      data
    });
    
    // حساب الوقت المتبقي بناءً على التاريخ
    if (stageHistoryRef.current.length > 1) {
      const avgTimePerStage = elapsedTime / stageHistoryRef.current.length;
      const remainingStages = 5 - stageHistoryRef.current.length; // تقديري: 5 مراحل
      setEstimatedTime(avgTimePerStage * remainingStages);
    }
  }, [elapsedTime]);

  // تحديث التقدم
  const updateProgress = useCallback((newProgress) => {
    if (typeof newProgress === 'number') {
      setProgress(prev => ({
        ...prev,
        percentage: newProgress
      }));
    } else {
      setProgress(prev => ({
        ...prev,
        ...newProgress,
        percentage: newProgress.total > 0 
          ? (newProgress.completed / newProgress.total) * 100 
          : prev.percentage
      }));
    }
  }, []);

  // تحديث بيانات المرحلة
  const updateStageData = useCallback((data) => {
    setStageData(prev => ({ ...prev, ...data }));
  }, []);

  // إنهاء بنجاح
  const complete = useCallback(() => {
    setIsComplete(true);
    setProgress({ percentage: 100, completed: 100, total: 100 });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // إنهاء بخطأ
  const error = useCallback((message) => {
    setHasError(true);
    setErrorMessage(message);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // إعادة تعيين
  const reset = useCallback(() => {
    setCurrentStage('');
    setProgress({ percentage: 0, completed: 0, total: 0 });
    setStageData({});
    setIsComplete(false);
    setHasError(false);
    setErrorMessage('');
    setElapsedTime(0);
    setEstimatedTime(0);
    startTimeRef.current = null;
    stageHistoryRef.current = [];
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // تنظيف عند الإلغاء
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // إنشاء Logger للتوافق مع TextAnalyzerEnhanced
  const createLogger = useCallback(() => {
    return {
      progress: (stage, data) => {
        updateStage(stage, data);
        if (data.percentage !== undefined) {
          updateProgress(data.percentage);
        } else if (data.completed !== undefined && data.total !== undefined) {
          updateProgress(data);
        }
      },
      log: (message, data) => {
        console.log(`[Progress] ${message}`, data);
      },
      error: (message, err) => {
        console.error(`[Progress Error] ${message}`, err);
        error(message);
      }
    };
  }, [updateStage, updateProgress, error]);

  return {
    currentStage,
    progress,
    stageData,
    isComplete,
    hasError,
    errorMessage,
    elapsedTime,
    estimatedTime,
    start,
    updateStage,
    updateProgress,
    updateStageData,
    complete,
    error,
    reset,
    createLogger,
    stageHistory: stageHistoryRef.current
  };
}

export default useProgressTracker;
