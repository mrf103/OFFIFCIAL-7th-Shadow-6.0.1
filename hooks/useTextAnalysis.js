/**
 * Custom Hook لتحليل النصوص
 */

import { useState, useCallback } from 'react';
import { analyzeAndCleanText } from '@/Components/upload/TextAnalyzerEnhanced';
import cacheManager from '@/lib/cache/CacheManager';

export function useTextAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const analyze = useCallback(async (text, options = {}) => {
    setAnalyzing(true);
    setError(null);
    setProgress(0);
    
    try {
      // تحقق من Cache
      const cacheKey = { 
        content: text.substring(0, 1000), 
        language: options.language || 'ar' 
      };
      
      const cached = await cacheManager.get('text_analysis', cacheKey);
      if (cached && !options.skipCache) {
        setResults(cached.data);
        setProgress(100);
        return cached.data;
      }
      
      // تحليل جديد
      const logger = {
        log: (msg) => console.log(msg),
        progress: (percent) => setProgress(percent)
      };
      
      const result = await analyzeAndCleanText(
        text, 
        options.language || 'ar',
        logger
      );
      
      setResults(result);
      setProgress(100);
      
      // حفظ في Cache
      await cacheManager.set('text_analysis', cacheKey, result, {
        persist: true,
        dbTTL: 24 * 60 * 60 * 1000 // 24 ساعة
      });
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setAnalyzing(false);
    setProgress(0);
    setResults(null);
    setError(null);
  }, []);
  
  return { 
    analyze, 
    analyzing, 
    progress,
    results, 
    error,
    reset
  };
}

export default useTextAnalysis;
