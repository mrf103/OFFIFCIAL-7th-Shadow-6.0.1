/**
 * Supabase Client - قاعدة البيانات والمصادقة
 * يستبدل base44.entities و base44.auth
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database Helpers
export const db = {
  manuscripts: {
    list: async (orderBy = '-created_at', limit) => {
      let query = supabase
        .from('manuscripts')
        .select('*')
        
      if (orderBy.startsWith('-')) {
        query = query.order(orderBy.substring(1), { ascending: false })
      } else {
        query = query.order(orderBy, { ascending: true })
      }
      
      if (limit) {
        query = query.limit(limit)
      }
      
      const { data, error } = await query
      if (error) throw error
      return data
    },
    
    get: async (id) => {
      const { data, error } = await supabase
        .from('manuscripts')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    filter: async (filters) => {
      let query = supabase.from('manuscripts').select('*')
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data, error } = await query
      if (error) throw error
      return data
    },
    
    create: async (data) => {
      const { data: manuscript, error } = await supabase
        .from('manuscripts')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return manuscript
    },
    
    update: async (id, data) => {
      const { data: manuscript, error } = await supabase
        .from('manuscripts')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return manuscript
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('manuscripts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    }
  },
  
  complianceRules: {
    list: async () => {
      const { data, error } = await supabase
        .from('compliance_rules')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    create: async (data) => {
      const { data: rule, error } = await supabase
        .from('compliance_rules')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return rule
    },
    
    update: async (id, data) => {
      const { data: rule, error } = await supabase
        .from('compliance_rules')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return rule
    },
    
    delete: async (id) => {
      const { error } = await supabase
        .from('compliance_rules')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    }
  },
  
  coverDesigns: {
    create: async (data) => {
      const { data: design, error } = await supabase
        .from('cover_designs')
        .insert(data)
        .select()
        .single()
      
      if (error) throw error
      return design
    }
  },
  
  processingJobs: {
    filter: async (filters) => {
      let query = supabase.from('processing_jobs').select('*')
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
      
      const { data, error } = await query
      if (error) throw error
      return data
    }
  }
}

// Auth Helpers
export const auth = {
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },
  
  signUp: async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    if (error) throw error
    return data
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  updateUser: async (updates) => {
    const { data, error } = await supabase.auth.updateUser(updates)
    if (error) throw error
    return data
  }
}

// Storage Helpers
export const storage = {
  uploadFile: async (bucket, path, file) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)
    
    return { file_url: publicUrl, path: data.path }
  },
  
  deleteFile: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  },
  
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }
}

export default { supabase, db, auth, storage }
