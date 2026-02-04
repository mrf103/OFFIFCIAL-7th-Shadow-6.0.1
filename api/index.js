/**
 * API Client - توحيد الوصول إلى Supabase و Gemini
 * يسهّل الانتقال من base44
 */

// استيراد Supabase
export { supabase, db, auth, storage } from './supabaseClient'

// استيراد Gemini
export { gemini, geminiPro, GeminiClient } from './geminiClient'

// استيراد File Service
export { default as fileService } from './fileService'

// Backward compatibility wrapper (لتسهيل الانتقال)
import { db } from './supabaseClient'
import { gemini } from './geminiClient'
import FileService from './fileService'

export const api = {
  // Database entities
  entities: {
    Manuscript: db.manuscripts,
    ComplianceRule: db.complianceRules,
    CoverDesign: db.coverDesigns,
    ProcessingJob: db.processingJobs
  },
  
  // Core integrations
  integrations: {
    Core: {
      // LLM invocation
      InvokeLLM: async ({ prompt, messages, temperature, max_tokens }) => {
        if (prompt) {
          // Simple prompt
          const result = await gemini.generateContent(prompt, { temperature, max_tokens })
          return { output: result }
        } else if (messages) {
          // Multi-turn conversation
          return await gemini.invokeLLM({ messages, temperature, max_tokens })
        }
      },
      
      // File upload
      UploadFile: async ({ file }) => {
        return await FileService.uploadFile(file)
      },
      
      // Extract data from file
      ExtractDataFromUploadedFile: async ({ file_url, file }) => {
        if (file) {
          return await FileService.extractDataFromFile(file)
        }
        throw new Error('File extraction from URL not yet implemented')
      }
    }
  }
}

// API Client للـ Dashboard
export const apiClient = {
  // Manuscripts CRUD
  async getManuscripts(params = {}) {
    const { orderBy = '-created_at', limit, filters } = params
    if (filters && Object.keys(filters).length > 0) {
      return await db.manuscripts.filter(filters)
    }
    return await db.manuscripts.list(orderBy, limit)
  },

  async getManuscript(id) {
    return await db.manuscripts.get(id)
  },

  async createManuscript(data) {
    return await db.manuscripts.create(data)
  },

  async updateManuscript(id, data) {
    return await db.manuscripts.update(id, data)
  },

  async deleteManuscript(id) {
    return await db.manuscripts.delete(id)
  },

  async uploadFile(file, onProgress) {
    // onProgress غير مدعوم مباشرة هنا؛ FileService لا يدعم progress events حالياً
    return await FileService.uploadFile(file)
  },

  getDashboardStats: async () => {
    try {
      const manuscripts = await db.manuscripts.list()
      
      return {
        totalManuscripts: manuscripts.length,
        processing: manuscripts.filter(m => m.status === 'processing').length,
        completed: manuscripts.filter(m => m.status === 'completed').length,
        needsReview: manuscripts.filter(m => m.status === 'needs_review').length
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      // Return default stats if error
      return {
        totalManuscripts: 0,
        processing: 0,
        completed: 0,
        needsReview: 0
      }
    }
  }
}

export default api
