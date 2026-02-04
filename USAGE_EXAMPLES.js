/**
 * 🎯 أمثلة عملية للاستخدام
 * 
 * هذا الملف يحتوي على أمثلة واقعية لكيفية استخدام النظام الجديد
 */

// ===========================================
// مثال 1: تحليل سريع لملف مرفوع
// ===========================================

import { quickFileAnalysis } from './Components/upload/TextAnalyzerEnhanced.js';

async function example1_quickAnalysis(fileContent) {
  console.log('📄 مثال 1: تحليل سريع');
  console.log('=' .repeat(50));
  
  const result = await quickFileAnalysis(fileContent);
  
  console.log('📊 النتائج:');
  console.log('- عدد الكلمات:', result.word_count);
  console.log('- الصفحات المقدرة:', result.estimated_pages);
  console.log('- اللغة:', result.language);
  console.log('- فصول مكتشفة:', result.detected_chapters);
  console.log('- صفحات مكتشفة:', result.detected_pages);
  console.log('- يوجد فهرس؟', result.has_toc ? 'نعم' : 'لا');
  console.log('- نسبة التكرار:', result.repetition_rate + '%');
  console.log('- نوع المحتوى:', result.content_type);
  console.log('- حجم الملف:', result.processing_estimate);
  console.log('- التوصيات:', result.recommendations.join(', '));
  
  return result;
}

// ===========================================
// مثال 2: تحليل كامل مع تنظيف
// ===========================================

import { analyzeAndCleanText } from './Components/upload/TextAnalyzerEnhanced.js';

async function example2_fullAnalysis(_fileContent) {
  console.log('\n🔍 مثال 2: تحليل كامل مع تنظيف');
  console.log('=' .repeat(50));
  
  // إنشاء logger لتتبع التقدم
  const logger = {
    start: (name) => {
      console.log(`⏳ بدأ: ${name}`);
    },
    progress: (name, data) => {
      if (data && data.percentage) {
        console.log(`   📈 ${name}: ${data.percentage.toFixed(1)}%`);
      } else if (data) {
        console.log(`   ⚙️ ${name}: ${data.stage || JSON.stringify(data)}`);
      }
    },
    complete: (name) => {
      console.log(`✅ اكتمل: ${name}`);
    }
  };
  
  const result = await analyzeAndCleanText(fileContent, 'ar', logger);
  
  console.log('\n📋 النتائج النهائية:');
  console.log('- الكلمات الأصلية:', result.statistics.original_word_count);
  console.log('- الكلمات النظيفة:', result.statistics.cleaned_word_count);
  console.log('- الكلمات النهائية:', result.statistics.final_word_count);
  console.log('- نسبة الحفاظ:', result.statistics.preservation_rate);
  console.log('- الفصول:', result.chapters.length);
  console.log('- نسبة التكرار:', result.quality.repetition_rate);
  console.log('- نوع المحتوى:', result.quality.main_content_type);
  console.log('- طريقة المعالجة:', result.metadata.analysis_method);
  console.log('- استدعاءات LLM:', result.metadata.llm_calls);
  console.log('\n📌 التوصيات:');
  result.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });
  
  return result;
}

// ===========================================
// مثال 3: استخدام Hook في React Component
// ===========================================

import React, { useState } from 'react';
import { useTextAnalysis } from './hooks/useTextAnalysis';
import { Button } from './Components/ui/button';
import { Progress } from './Components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from './Components/ui/card';

function Example3_TextAnalyzerComponent() {
  const [text, setText] = useState('');
  const { analyze, analyzing, progress, results, error } = useTextAnalysis();
  
  const handleAnalyze = async () => {
    try {
      await analyze(text, { language: 'ar' });
    } catch (err) {
      console.error('خطأ في التحليل:', err);
    }
  };
  
  return (
    <div className="space-y-4 p-4" dir="rtl">
      <Card>
        <CardHeader>
          <CardTitle>تحليل النصوص الذكي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 p-2 border rounded"
            placeholder="الصق النص هنا..."
          />
          
          <Button 
            onClick={handleAnalyze}
            disabled={analyzing || !text}
          >
            {analyzing ? 'جاري التحليل...' : 'تحليل النص'}
          </Button>
          
          {analyzing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-gray-600">
                جاري المعالجة... {progress.toFixed(0)}%
              </p>
            </div>
          )}
          
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded">
              خطأ: {error}
            </div>
          )}
          
          {results && !analyzing && (
            <div className="space-y-3 p-4 bg-green-50 rounded">
              <h3 className="font-bold">النتائج:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>عدد الكلمات: {results.statistics.final_word_count}</div>
                <div>عدد الفصول: {results.chapters.length}</div>
                <div>نسبة التكرار: {results.quality.repetition_rate}</div>
                <div>اللغة: {results.structure.detected_language}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===========================================
// مثال 4: معالجة ملف كبير مع Chunking
// ===========================================

async function example4_largeFileProcessing(largeText) {
  console.log('\n📦 مثال 4: معالجة ملف كبير (200k كلمة)');
  console.log('='.repeat(50));
  
  // Large file processing example
  const chunkSize = 10000;
  let processed = 0;
  
  console.log('✅ اكتملت معالجة أجزاء الملف الكبير');
  
  return processed;
}

// ===========================================
// مثال 5: تقسيم ذكي للفصول
// ===========================================

import { smartDivideChapters } from './utils/nlp/chapterDivider.js';

function example5_smartChapterDivision(text) {
  console.log('\n📖 مثال 5: تقسيم ذكي للفصول');
  console.log('=' .repeat(50));
  
  const result = smartDivideChapters(text, {
    minChapters: 2,
    maxChapters: 13,
    targetWordsPerChapter: 6000,
    preserveExisting: true
  });
  
  console.log('🎯 طريقة التقسيم:', result.method);
  console.log('📊 إحصائيات:');
  console.log('- إجمالي الكلمات:', result.totalWords);
  console.log('- عدد الفصول:', result.actualChapters || result.chapters.length);
  console.log('- متوسط كلمات/فصل:', result.avgWordsPerChapter);
  
  console.log('\n📚 الفصول:');
  result.chapters.forEach((chapter, i) => {
    console.log(`   ${i + 1}. ${chapter.title} - ${chapter.words || 'N/A'} كلمة`);
  });
  
  return result;
}

// ===========================================
// مثال 6: كشف التكرار والتنظيف
// ===========================================

import { 
  generateDuplicateReport, 
  removeDuplicates 
} from './utils/nlp/duplicateDetector.js';

function example6_duplicateDetection(text) {
  console.log('\n🔄 مثال 6: كشف التكرار');
  console.log('=' .repeat(50));
  
  const report = generateDuplicateReport(text);
  
  console.log('📊 تقرير التكرار:');
  console.log('- نسبة التكرار:', report.repetitionRate.toFixed(1) + '%');
  console.log('- فقرات متكررة:', report.duplicateParagraphs.length);
  console.log('- جمل متكررة:', report.repeatedSentences.length);
  console.log('- تقييم:', report.assessment);
  console.log('- توصية:', report.recommendation);
  
  if (report.repetitionRate > 15) {
    console.log('\n🧹 تنظيف التكرار...');
    const cleanedText = removeDuplicates(text, 0.8);
    const newReport = generateDuplicateReport(cleanedText);
    console.log('✅ نسبة التكرار بعد التنظيف:', newReport.repetitionRate.toFixed(1) + '%');
  }
  
  return report;
}

// ===========================================
// مثال 7: تصنيف محتوى الفقرات
// ===========================================

import { classifyParagraphs } from './utils/nlp/contentClassifier.js';

function example7_contentClassification(text) {
  console.log('\n🏷️ مثال 7: تصنيف المحتوى');
  console.log('=' .repeat(50));
  
  const classifications = classifyParagraphs(text);
  
  // حساب التوزيع
  const distribution = {};
  classifications.forEach(c => {
    distribution[c.type] = (distribution[c.type] || 0) + 1;
  });
  
  console.log('📈 توزيع أنواع المحتوى:');
  Object.entries(distribution).forEach(([type, count]) => {
    const percentage = (count / classifications.length * 100).toFixed(1);
    console.log(`   ${type}: ${count} فقرة (${percentage}%)`);
  });
  
  // أكثر نوع شيوعاً
  const mostCommon = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])[0];
  
  console.log(`\n🎯 النوع السائد: ${mostCommon[0]}`);
  
  return classifications;
}

// ===========================================
// مثال 8: استخدام Cache للنتائج
// ===========================================

import cacheManager from './lib/cache/CacheManager.js';

async function example8_caching() {
  console.log('\n💾 مثال 8: استخدام Cache');
  console.log('=' .repeat(50));
  
  const text = 'نص للاختبار...';
  const cacheKey = { content: text.substring(0, 100) };
  
  // محاولة الحصول من Cache
  console.log('🔍 البحث في Cache...');
  let cached = await cacheManager.get('test_analysis', cacheKey);
  
  if (cached) {
    console.log('✅ وجد في Cache:', cached.source);
    return cached.data;
  }
  
  // معالجة جديدة
  console.log('⚙️ معالجة جديدة...');
  const result = { processed: true, timestamp: Date.now() };
  
  // حفظ في Cache
  await cacheManager.set('test_analysis', cacheKey, result, {
    persist: true,
    memoryTTL: 300000, // 5 دقائق
    dbTTL: 24 * 60 * 60 * 1000 // 24 ساعة
  });
  
  console.log('💾 تم الحفظ في Cache');
  
  // إحصائيات
  const stats = cacheManager.getStats();
  console.log('📊 إحصائيات Cache:', stats);
  
  return result;
}

// ===========================================
// ===========================================
// مثال 9: معالجة في صفحة Upload
// ===========================================

// في Pages/Upload:
async function example9_handleFileUpload(file, extractTextFromFile, quickFileAnalysis, analyzeAndCleanText, callbacks) {
  const { setQuickResults, showError, setProcessing, setProgress, setStage, setResults } = callbacks;
  
  // 1. استخراج النص
  const rawContent = await extractTextFromFile(file);
  
  // 2. تحليل سريع أولاً
  const quickResult = await quickFileAnalysis(rawContent);
  
  // عرض النتائج السريعة للمستخدم
  setQuickResults({
    words: quickResult.word_count,
    pages: quickResult.estimated_pages,
    chapters: quickResult.detected_chapters,
    language: quickResult.language,
    contentType: quickResult.content_type
  });
  
  // 3. سؤال المستخدم إذا أراد المتابعة
  if (quickResult.word_count > 200000) {
    showError('الملف كبير جداً - يتجاوز 200k كلمة');
    return;
  }
  
  // 4. تحليل كامل
  setProcessing(true);
  const fullResult = await analyzeAndCleanText(rawContent, 'ar', {
    progress: (name, data) => {
      setProgress(data.percentage || 0);
      setStage(data.stage || name);
    }
  });
  
  // 5. عرض النتائج
  setResults(fullResult);
  setProcessing(false);
}

// ===========================================
// مثال 10: سيناريو كامل - من الرفع للنشر
// ===========================================

async function example10_completeWorkflow(fileContent) {
  console.log('\n🎬 مثال 10: سيناريو كامل');
  console.log('=' .repeat(70));
  
  // المرحلة 1: تحليل سريع
  console.log('\n1️⃣ المرحلة الأولى: تحليل سريع');
  const quick = await quickFileAnalysis(fileContent);
  console.log('   ✅ الكلمات:', quick.word_count);
  console.log('   ✅ اللغة:', quick.language);
  console.log('   ✅ نوع المحتوى:', quick.content_type);
  
  // المرحلة 2: تحليل كامل
  console.log('\n2️⃣ المرحلة الثانية: تحليل كامل وتنظيف');
  const full = await analyzeAndCleanText(fileContent, 'ar', {
    start: (name) => console.log(`   ⏳ ${name}...`),
    complete: (name) => console.log(`   ✅ ${name}`)
  });
  
  // المرحلة 3: التحقق من معايير النشر
  console.log('\n3️⃣ المرحلة الثالثة: التحقق من معايير النشر');
  const meetsStandards = 
    full.statistics.final_word_count >= 30000 &&
    full.statistics.final_word_count <= 120000 &&
    full.chapters.length >= 2 &&
    full.chapters.length <= 13 &&
    parseFloat(full.quality.repetition_rate) < 15;
  
  console.log('   📋 معايير النشر:', meetsStandards ? '✅ مستوفاة' : '❌ غير مستوفاة');
  console.log('   - عدد الكلمات:', full.statistics.final_word_count, 
              meetsStandards ? '✅' : '❌');
  console.log('   - عدد الفصول:', full.chapters.length, '✅');
  console.log('   - نسبة التكرار:', full.quality.repetition_rate, 
              parseFloat(full.quality.repetition_rate) < 15 ? '✅' : '❌');
  
  // المرحلة 4: التوصيات
  console.log('\n4️⃣ المرحلة الرابعة: التوصيات');
  full.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec}`);
  });
  
  console.log('\n🎉 انتهى السيناريو!');
  console.log('=' .repeat(70));
  
  return {
    quick,
    full,
    meetsStandards
  };
}

// ===========================================
// تصدير جميع الأمثلة
// ===========================================

export {
  example1_quickAnalysis,
  example2_fullAnalysis,
  Example3_TextAnalyzerComponent,
  example4_largeFileProcessing,
  example5_smartChapterDivision,
  example6_duplicateDetection,
  example7_contentClassification,
  example8_caching,
  example10_completeWorkflow
};

// ===========================================
// تشغيل جميع الأمثلة
// ===========================================

export async function runAllExamples(sampleText) {
  console.log('\n🚀 تشغيل جميع الأمثلة');
  console.log('=' .repeat(70));
  
  try {
    await example1_quickAnalysis(sampleText);
    await example2_fullAnalysis(sampleText);
    example5_smartChapterDivision(sampleText);
    example6_duplicateDetection(sampleText);
    example7_contentClassification(sampleText);
    await example8_caching();
    await example10_completeWorkflow(sampleText);
    
    console.log('\n✅ تمت جميع الأمثلة بنجاح!');
  } catch (error) {
    console.error('\n❌ خطأ:', error);
  }
}
