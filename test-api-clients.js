// اختبار API Clients
import { supabase, auth, storage } from './api/supabaseClient.js'
import { gemini, GeminiClient } from './api/geminiClient.js'
import { api, apiClient } from './api/index.js'

console.log('=== API CLIENTS TEST ===')
console.log('✓ Supabase imported:', typeof supabase)
console.log('✓ Auth imported:', typeof auth)
console.log('✓ Storage imported:', typeof storage)
console.log('✓ Gemini imported:', typeof gemini)
console.log('✓ GeminiClient imported:', typeof GeminiClient)
console.log('✓ API imported:', typeof api)
console.log('✓ APIClient imported:', typeof apiClient)
console.log('')
console.log('=== CHECKING METHODS ===')
console.log('✓ auth.signIn:', typeof auth.signIn)
console.log('✓ auth.signUp:', typeof auth.signUp)
console.log('✓ db.manuscripts.list:', typeof api.entities?.Manuscript)
console.log('✓ gemini.generateContent:', typeof gemini.generateContent)
console.log('✓ apiClient.getManuscripts:', typeof apiClient.getManuscripts)
