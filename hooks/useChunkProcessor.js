/**
 * Custom Hook لمعالجة النصوص الكبيرة
 */

import { useState, useCallback, useRef } from 'react';
import { ChunkProcessor } from '@/utils/ChunkProcessor';
import { useWorker } from './useWorker';

export function useChunkProcessor(options = {}) {
  const { maxChunkSize = 10000, useWebWorker = true } = options;
  
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const processorRef = useRef(new ChunkProcessor(maxChunkSize));
  const { postMessage: workerPostMessage, isReady: workerReady } = useWorker(
    new URL('../workers/nlpProcessor.worker.js', import.meta.url)
  );
  
  const processText = useCallback(async (text, processor) => {
    setProcessing(true);
    setError(null);
    setProgress({ completed: 0, total: 0, percentage: 0 });
    
    try {
      const chunks = processorRef.current.chunkText(text);
      
      const processChunk = async (chunk, index) => {
        if (useWebWorker && workerReady) {
          // معالجة عبر Worker
          return await workerPostMessage('PROCESS_CHUNK', chunk, index);
        } else {
          // معالجة مباشرة
          return await processor(chunk, index);
        }
      };
      
      const result = await processorRef.current.processParallel(
        chunks,
        processChunk,
        {
          concurrency: 3,
          onProgress: (prog) => setProgress(prog),
          onChunkComplete: (res, idx) => {
            console.log(`Chunk ${idx} completed`);
          },
          onChunkError: (err, idx) => {
            console.error(`Chunk ${idx} error:`, err);
          }
        }
      );
      
      const merged = processorRef.current.mergeResults(result.results, 'analysis');
      setResults(merged);
      
      return merged;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setProcessing(false);
    }
  }, [useWebWorker, workerReady, workerPostMessage]);
  
  const reset = useCallback(() => {
    setProcessing(false);
    setProgress({ completed: 0, total: 0, percentage: 0 });
    setResults(null);
    setError(null);
  }, []);
  
  return {
    processText,
    processing,
    progress,
    results,
    error,
    reset
  };
}

export default useChunkProcessor;
