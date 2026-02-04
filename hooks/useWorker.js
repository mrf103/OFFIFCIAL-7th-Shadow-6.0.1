/**
 * Custom Hook لإدارة Web Workers
 */

import { useEffect, useRef, useState, useCallback } from 'react';

export function useWorker(workerPath) {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const callbacksRef = useRef({});
  
  useEffect(() => {
    // إنشاء Worker
    const worker = new Worker(workerPath, { type: 'module' });
    workerRef.current = worker;
    
    // معالجة الرسائل
    worker.onmessage = (e) => {
      const { type, result, error: workerError, chunkIndex } = e.data;
      
      if (type === 'READY') {
        setIsReady(true);
        return;
      }
      
      if (type === 'ERROR') {
        setError(workerError);
        const callback = callbacksRef.current[chunkIndex];
        if (callback) {
          callback.reject(new Error(workerError));
          delete callbacksRef.current[chunkIndex];
        }
        return;
      }
      
      // نجاح العملية
      const callback = callbacksRef.current[chunkIndex || 'default'];
      if (callback) {
        callback.resolve(result);
        delete callbacksRef.current[chunkIndex || 'default'];
      }
    };
    
    // معالجة الأخطاء
    worker.onerror = (err) => {
      setError(err.message);
    };
    
    // تنظيف
    return () => {
      worker.terminate();
    };
  }, [workerPath]);
  
  // إرسال رسالة للـ Worker
  const postMessage = useCallback((type, data, chunkIndex) => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }
      
      const id = chunkIndex || 'default';
      callbacksRef.current[id] = { resolve, reject };
      
      workerRef.current.postMessage({ type, data, chunkIndex });
      
      // timeout بعد 30 ثانية
      setTimeout(() => {
        if (callbacksRef.current[id]) {
          reject(new Error('Worker timeout'));
          delete callbacksRef.current[id];
        }
      }, 30000);
    });
  }, []);
  
  return { isReady, error, postMessage };
}

export default useWorker;
