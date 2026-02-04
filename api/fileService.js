/**
 * File Upload & Processing Service
 * يستبدل base44.integrations.Core.UploadFile و ExtractDataFromUploadedFile
 */

import { storage } from './supabaseClient'
import { gemini } from './geminiClient'
import mammoth from 'mammoth'

export class FileService {
  /**
   * رفع ملف إلى Supabase Storage
   */
  static async uploadFile(file) {
    try {
      // توليد اسم فريد للملف
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const extension = file.name.split('.').pop()
      const fileName = `${timestamp}-${random}.${extension}`
      const filePath = `manuscripts/${fileName}`

      // رفع الملف
      const result = await storage.uploadFile('manuscripts', filePath, file)

      return {
        file_url: result.file_url,
        file_path: result.path,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type
      }
    } catch (error) {
      console.error('File Upload Error:', error)
      throw new Error(`فشل رفع الملف: ${error.message}`)
    }
  }

  /**
   * استخراج النص من الملف المرفوع
   */
  static async extractDataFromFile(file) {
    try {
      let rawContent = ''
      const fileType = file.type || file.name.split('.').pop()

      // استخراج النص حسب نوع الملف
      if (fileType.includes('text/plain') || file.name.endsWith('.txt')) {
        rawContent = await this.extractTextFromTxt(file)
      } else if (fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') || file.name.endsWith('.docx')) {
        rawContent = await this.extractTextFromDocx(file)
      } else if (file.name.endsWith('.html') || fileType.includes('text/html')) {
        rawContent = await this.extractTextFromHtml(file)
      } else {
        throw new Error('نوع الملف غير مدعوم. الرجاء استخدام TXT أو DOCX أو HTML')
      }

      // استخراج العنوان والمؤلف باستخدام Gemini
      const metadata = await this.extractMetadata(rawContent)

      return {
        status: 'success',
        output: {
          raw_content: rawContent,
          title: metadata.title || '',
          author: metadata.author || ''
        }
      }
    } catch (error) {
      console.error('Text Extraction Error:', error)
      return {
        status: 'error',
        error: error.message
      }
    }
  }

  /**
   * استخراج نص من ملف TXT
   */
  static async extractTextFromTxt(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(new Error('فشل قراءة الملف'))
      reader.readAsText(file, 'UTF-8')
    })
  }

  /**
   * استخراج نص من ملف DOCX
   */
  static async extractTextFromDocx(file) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      throw new Error(`فشل استخراج النص من DOCX: ${error.message}`)
    }
  }

  /**
   * استخراج نص من ملف HTML
   */
  static async extractTextFromHtml(file) {
    const htmlContent = await this.extractTextFromTxt(file)
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent, 'text/html')
    
    // إزالة scripts و styles
    doc.querySelectorAll('script, style').forEach(el => el.remove())
    
    return doc.body.textContent || doc.body.innerText || ''
  }

  /**
   * استخراج العنوان والمؤلف من النص باستخدام AI
   */
  static async extractMetadata(text) {
    try {
      // أخذ أول 2000 حرف للتحليل
      const sample = text.substring(0, 2000)

      const prompt = `قم بتحليل هذا النص واستخرج العنوان واسم المؤلف إن وجدا.
أعطني الإجابة بصيغة JSON فقط، بدون أي نص إضافي:
{
  "title": "عنوان الكتاب",
  "author": "اسم المؤلف"
}

إذا لم تجد العنوان أو المؤلف، اترك القيمة فارغة "".

النص:
${sample}`

      const response = await gemini.generateContent(prompt, { temperature: 0.3 })
      
      // استخراج JSON من الرد
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return { title: '', author: '' }
    } catch (error) {
      console.error('Metadata Extraction Error:', error)
      return { title: '', author: '' }
    }
  }

  /**
   * حذف ملف من Storage
   */
  static async deleteFile(filePath) {
    try {
      await storage.deleteFile('manuscripts', filePath)
      return { success: true }
    } catch (error) {
      console.error('File Delete Error:', error)
      throw error
    }
  }
}

export default FileService
