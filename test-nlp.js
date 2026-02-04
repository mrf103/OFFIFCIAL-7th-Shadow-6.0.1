// اختبار وحدات NLP
import { wordCount, getTextStats, detectLanguage } from './utils/nlp/arabicTokenizer.js'
import { quickAnalyze, extractChapters } from './utils/nlp/patternExtractor.js'
import { classifyParagraphs } from './utils/nlp/contentClassifier.js'
import { generateDuplicateReport } from './utils/nlp/duplicateDetector.js'
import { smartDivideChapters } from './utils/nlp/chapterDivider.js'

const testText = 'السلام عليكم ورحمة الله وبركاته. هذا نص تجريبي لاختبار نظام معالجة اللغة العربية.'

console.log('=== NLP MODULES TEST ===')
console.log('✓ arabicTokenizer imported')
console.log('✓ patternExtractor imported')
console.log('✓ contentClassifier imported')
console.log('✓ duplicateDetector imported')
console.log('✓ chapterDivider imported')
console.log('')
console.log('=== TESTING FUNCTIONS ===')
console.log('Word count:', wordCount(testText))
console.log('Text stats:', getTextStats(testText))
console.log('Detected language:', detectLanguage(testText))
console.log('Quick analyze:', quickAnalyze(testText))
