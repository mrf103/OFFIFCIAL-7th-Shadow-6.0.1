/**
 * Google Gemini AI Client
 * يستبدل base44.integrations.Core.InvokeLLM
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY

if (!apiKey) {
  console.warn('⚠️ Google AI API key not found in environment variables')
}

const genAI = new GoogleGenerativeAI(apiKey)

// نماذج مختلفة حسب الحاجة
const models = {
  pro: 'gemini-pro',
  proVision: 'gemini-pro-vision',
  flash: 'gemini-1.5-flash',
  proLatest: 'gemini-1.5-pro-latest'
}

export class GeminiClient {
  constructor(modelName = models.flash) {
    this.model = genAI.getGenerativeModel({ model: modelName })
    this.chat = null
  }

  /**
   * استدعاء LLM مع رسائل متعددة (محاكاة base44.integrations.Core.InvokeLLM)
   */
  async invokeLLM({ messages, temperature = 0.7, max_tokens = 4000 }) {
    try {
      // تحويل الرسائل من صيغة OpenAI إلى Gemini
      const geminiMessages = this.convertMessages(messages)
      
      // إنشاء chat session
      const chat = this.model.startChat({
        generationConfig: {
          temperature,
          maxOutputTokens: max_tokens,
        },
        history: geminiMessages.history
      })

      // إرسال الرسالة الأخيرة
      const result = await chat.sendMessage(geminiMessages.lastMessage)
      const response = await result.response
      const text = response.text()

      return {
        status: 'success',
        output: text,
        usage: {
          prompt_tokens: result.response.promptFeedback?.tokenCount || 0,
          completion_tokens: text.split(' ').length, // تقريبي
          total_tokens: result.response.promptFeedback?.tokenCount + text.split(' ').length || 0
        }
      }
    } catch (error) {
      console.error('Gemini API Error:', error)
      throw new Error(`فشل استدعاء Gemini: ${error.message}`)
    }
  }

  /**
   * تحويل الرسائل من صيغة OpenAI إلى Gemini
   */
  convertMessages(messages) {
    const history = []
    let lastMessage = ''

    messages.forEach((msg, index) => {
      const isLast = index === messages.length - 1

      if (msg.role === 'system') {
        // System message تضاف كـ user message في Gemini
        if (!isLast) {
          history.push({
            role: 'user',
            parts: [{ text: msg.content }]
          })
        } else {
          lastMessage = msg.content
        }
      } else if (msg.role === 'user') {
        if (!isLast) {
          history.push({
            role: 'user',
            parts: [{ text: msg.content }]
          })
        } else {
          lastMessage = msg.content
        }
      } else if (msg.role === 'assistant') {
        history.push({
          role: 'model',
          parts: [{ text: msg.content }]
        })
      }
    })

    return { history, lastMessage }
  }

  /**
   * توليد نص مباشر (بدون تاريخ)
   */
  async generateContent(prompt, config = {}) {
    try {
      const result = await this.model.generateContent(prompt, {
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.max_tokens || 4000,
        }
      })

      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini Generation Error:', error)
      throw new Error(`فشل التوليد: ${error.message}`)
    }
  }

  /**
   * محادثة تفاعلية (streaming)
   */
  async streamGenerate(prompt, onChunk) {
    try {
      const result = await this.model.generateContentStream(prompt)

      let fullText = ''
      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        fullText += chunkText
        if (onChunk) onChunk(chunkText)
      }

      return fullText
    } catch (error) {
      console.error('Gemini Stream Error:', error)
      throw error
    }
  }

  /**
   * تحليل صورة (Gemini Pro Vision)
   */
  async analyzeImage(imageData, prompt) {
    try {
      const visionModel = genAI.getGenerativeModel({ model: models.proVision })
      
      const imageParts = [{
        inlineData: {
          data: imageData.split(',')[1], // إزالة data:image/jpeg;base64,
          mimeType: 'image/jpeg'
        }
      }]

      const result = await visionModel.generateContent([prompt, ...imageParts])
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini Vision Error:', error)
      throw error
    }
  }
}

// Instance افتراضي يستخدم gemini-1.5-flash (أسرع وأرخص)
export const gemini = new GeminiClient(models.flash)

// Instance للمهام المعقدة
export const geminiPro = new GeminiClient(models.proLatest)

export default gemini
