/**
 * NLP Processor Web Worker
 * معالج النصوص في الخلفية - يمنع تجميد الواجهة
 */

// استيراد وحدات NLP - استخدام ES modules
import { wordCount, getTextStats } from '../utils/nlp/arabicTokenizer.js';
import { extractChapters, extractPageNumbers, quickAnalyze } from '../utils/nlp/patternExtractor.js';
import { classifyContent } from '../utils/nlp/contentClassifier.js';
import { detectDuplicates, generateDuplicateReport } from '../utils/nlp/duplicateDetector.js';

self.addEventListener('message', async (e) => {
  const { type, data, chunkIndex } = e.data;
  
  try {
    switch (type) {
      case 'PROCESS_CHUNK': {
        const result = await processChunk(data, chunkIndex);
        self.postMessage({ 
          type: 'CHUNK_COMPLETE', 
          result, 
          chunkIndex 
        });
        break;
      }
      
      case 'QUICK_ANALYZE': {
        const result = quickAnalyze(data.text);
        self.postMessage({ 
          type: 'ANALYSIS_COMPLETE', 
          result 
        });
        break;
      }
      
      case 'DETECT_DUPLICATES': {
        const result = generateDuplicateReport(data.text);
        self.postMessage({ 
          type: 'DUPLICATES_COMPLETE', 
          result 
        });
        break;
      }
      
      case 'CLASSIFY_CONTENT': {
        const result = classifyContent(data.text);
        self.postMessage({ 
          type: 'CLASSIFICATION_COMPLETE', 
          result 
        });
        break;
      }
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: error.message,
      chunkIndex 
    });
  }
});

/**
 * معالجة chunk واحد
 */
async function processChunk(chunk, index) {
  const text = chunk.text || chunk;
  
  return {
    chunkIndex: index,
    words: wordCount(text),
    chapters: extractChapters(text),
    pages: extractPageNumbers(text),
    duplicates: detectDuplicates(text),
    classification: classifyContent(text),
    stats: getTextStats(text)
  };
}

// إشارة جاهزية
self.postMessage({ type: 'READY' });
