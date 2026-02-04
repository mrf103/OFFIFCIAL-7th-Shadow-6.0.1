/**
 * Chunk Processor
 * معالجة متوازية للنصوص الكبيرة
 */

import { paragraphSplit, wordCount } from './nlp/arabicTokenizer.js';

export class ChunkProcessor {
  constructor(maxChunkSize = 10000) {
    this.maxChunkSize = maxChunkSize; // كلمات
  }
  
  // تقسيم ذكي يحافظ على الفقرات
  chunkText(text) {
    const paragraphs = paragraphSplit(text);
    const chunks = [];
    let currentChunk = [];
    let currentSize = 0;
    
    for (const para of paragraphs) {
      const paraWords = wordCount(para);
      
      // إذا تجاوز الحد، ابدأ chunk جديد
      if (currentSize + paraWords > this.maxChunkSize && currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.join('\n\n'),
          words: currentSize,
          paragraphs: currentChunk.length,
          index: chunks.length
        });
        currentChunk = [para];
        currentSize = paraWords;
      } else {
        currentChunk.push(para);
        currentSize += paraWords;
      }
    }
    
    // إضافة الـ chunk الأخير
    if (currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.join('\n\n'),
        words: currentSize,
        paragraphs: currentChunk.length,
        index: chunks.length
      });
    }
    
    return chunks;
  }
  
  // معالجة متوازية مع تتبع التقدم
  async processParallel(chunks, processor, options = {}) {
    const {
      concurrency = 3,
      onProgress = () => {},
      onChunkComplete = () => {},
      onChunkError = () => {}
    } = options;
    
    const results = [];
    let completed = 0;
    let failed = 0;
    
    for (let i = 0; i < chunks.length; i += concurrency) {
      const batch = chunks.slice(i, i + concurrency);
      
      const batchResults = await Promise.allSettled(
        batch.map(async (chunk, batchIndex) => {
          const globalIndex = i + batchIndex;
          
          try {
            const result = await processor(chunk, globalIndex);
            completed++;
            onProgress({
              completed,
              total: chunks.length,
              failed,
              percentage: (completed / chunks.length) * 100
            });
            onChunkComplete(result, globalIndex);
            return result;
          } catch (error) {
            failed++;
            onChunkError(error, globalIndex);
            throw error;
          }
        })
      );
      
      results.push(...batchResults.map(r => 
        r.status === 'fulfilled' ? r.value : null
      ));
    }
    
    return {
      results: results.filter(Boolean),
      summary: {
        total: chunks.length,
        completed,
        failed,
        successRate: (completed / chunks.length) * 100
      }
    };
  }
  
  // معالجة تدريجية للملفات الكبيرة جداً
  async *streamProcess(file, processor) {
    const reader = file.stream().getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    let chunkIndex = 0;
    
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // معالجة كل X كلمات
      const words = buffer.split(/\s+/);
      if (words.length >= this.maxChunkSize) {
        const toProcess = words.slice(0, this.maxChunkSize).join(' ');
        buffer = words.slice(this.maxChunkSize).join(' ');
        
        const result = await processor({
          text: toProcess,
          index: chunkIndex,
          words: this.maxChunkSize
        }, chunkIndex);
        
        yield result;
        chunkIndex++;
      }
    }
    
    // معالجة الباقي
    if (buffer.trim()) {
      const result = await processor({
        text: buffer,
        index: chunkIndex,
        words: wordCount(buffer)
      }, chunkIndex);
      
      yield result;
    }
  }
  
  // دمج نتائج الـ chunks
  mergeResults(results, type = 'analysis') {
    if (type === 'analysis') {
      return this.mergeAnalysisResults(results);
    } else if (type === 'text') {
      return this.mergeTextResults(results);
    }
    
    return results;
  }
  
  mergeAnalysisResults(results) {
    const merged = {
      totalWords: 0,
      totalSentences: 0,
      totalParagraphs: 0,
      issues: [],
      warnings: [],
      chapters: [],
      pages: [],
      classifications: []
    };
    
    results.forEach((result, index) => {
      if (!result) return;
      
      merged.totalWords += result.words || 0;
      merged.totalSentences += result.sentences || 0;
      merged.totalParagraphs += result.paragraphs || 0;
      
      if (result.issues) merged.issues.push(...result.issues.map(i => ({ ...i, chunk: index })));
      if (result.warnings) merged.warnings.push(...result.warnings.map(w => ({ ...w, chunk: index })));
      if (result.chapters) merged.chapters.push(...result.chapters);
      if (result.pages) merged.pages.push(...result.pages);
      if (result.classification) merged.classifications.push(result.classification);
    });
    
    // حساب التصنيف الإجمالي
    if (merged.classifications.length > 0) {
      const typeCount = {};
      merged.classifications.forEach(c => {
        typeCount[c.type] = (typeCount[c.type] || 0) + 1;
      });
      
      const dominantType = Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])[0];
      
      merged.overallType = dominantType[0];
      merged.typeConfidence = dominantType[1] / merged.classifications.length;
    }
    
    return merged;
  }
  
  mergeTextResults(results) {
    return results
      .filter(Boolean)
      .map(r => r.text || r)
      .join('\n\n');
  }
}

export default ChunkProcessor;
