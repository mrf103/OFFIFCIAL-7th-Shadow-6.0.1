/**
 * Cache Manager
 * إدارة التخزين المؤقت - Memory + IndexedDB
 */

import { openDB } from 'idb';

class CacheManager {
  constructor() {
    this.memory = new Map();
    this.db = null;
    this.maxMemorySize = 100;
    this.initDB();
  }
  
  async initDB() {
    try {
      this.db = await openDB('seyadi-cache', 1, {
        upgrade(db) {
          // Store for text analysis
          if (!db.objectStoreNames.contains('analyses')) {
            db.createObjectStore('analyses');
          }
          
          // Store for LLM results
          if (!db.objectStoreNames.contains('llm-results')) {
            db.createObjectStore('llm-results');
          }
          
          // Store for manuscripts
          if (!db.objectStoreNames.contains('manuscripts')) {
            db.createObjectStore('manuscripts');
          }
        }
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
    }
  }
  
  // إنشاء مفتاح فريد
  createKey(operation, params) {
    const str = JSON.stringify({ operation, params });
    return this.simpleHash(str);
  }
  
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  
  // ===== Memory Cache (سريع جداً) =====
  
  getFromMemory(key) {
    const cached = this.memory.get(key);
    
    if (!cached) return null;
    
    // تحقق من انتهاء الصلاحية
    if (cached.expires && Date.now() > cached.expires) {
      this.memory.delete(key);
      return null;
    }
    
    return cached.value;
  }
  
  setInMemory(key, value, ttl = 300000) { // 5 دقائق افتراضياً
    this.memory.set(key, {
      value,
      expires: Date.now() + ttl,
      timestamp: Date.now()
    });
    
    // تنظيف تلقائي عند تجاوز الحد
    if (this.memory.size > this.maxMemorySize) {
      this.cleanOldestMemoryEntries();
    }
    
    // تنظيف مجدول
    setTimeout(() => {
      this.memory.delete(key);
    }, ttl);
  }
  
  cleanOldestMemoryEntries() {
    const entries = Array.from(this.memory.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // احذف أقدم 20%
    const toDelete = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toDelete; i++) {
      this.memory.delete(entries[i][0]);
    }
  }
  
  // ===== IndexedDB Cache (دائم) =====
  
  async getFromDB(store, key) {
    if (!this.db) await this.initDB();
    
    try {
      const result = await this.db.get(store, key);
      
      if (!result) return null;
      
      // تحقق من انتهاء الصلاحية
      if (result.expires && Date.now() > result.expires) {
        await this.db.delete(store, key);
        return null;
      }
      
      return result.value;
    } catch (error) {
      console.error('IndexedDB get error:', error);
      return null;
    }
  }
  
  async setInDB(store, key, value, ttl = null) {
    if (!this.db) await this.initDB();
    
    try {
      await this.db.put(store, {
        value,
        expires: ttl ? Date.now() + ttl : null,
        timestamp: Date.now()
      }, key);
    } catch (error) {
      console.error('IndexedDB set error:', error);
    }
  }
  
  async deleteFromDB(store, key) {
    if (!this.db) await this.initDB();
    
    try {
      await this.db.delete(store, key);
    } catch (error) {
      console.error('IndexedDB delete error:', error);
    }
  }
  
  async clearStore(store) {
    if (!this.db) await this.initDB();
    
    try {
      await this.db.clear(store);
    } catch (error) {
      console.error('IndexedDB clear error:', error);
    }
  }
  
  // ===== واجهة موحدة =====
  
  async get(operation, params, options = {}) {
    const key = this.createKey(operation, params);
    const store = options.store || 'analyses';
    
    // محاولة 1: Memory
    let cached = this.getFromMemory(key);
    if (cached !== null) {
      return { source: 'memory', data: cached };
    }
    
    // محاولة 2: IndexedDB
    cached = await this.getFromDB(store, key);
    if (cached !== null) {
      // رفع إلى Memory للاستخدامات القادمة
      this.setInMemory(key, cached, options.memoryTTL);
      return { source: 'db', data: cached };
    }
    
    return null;
  }
  
  async set(operation, params, value, options = {}) {
    const key = this.createKey(operation, params);
    const store = options.store || 'analyses';
    
    // حفظ في Memory
    this.setInMemory(key, value, options.memoryTTL || 300000);
    
    // حفظ في IndexedDB (اختياري)
    if (options.persist !== false) {
      await this.setInDB(store, key, value, options.dbTTL);
    }
  }
  
  async delete(operation, params, options = {}) {
    const key = this.createKey(operation, params);
    const store = options.store || 'analyses';
    
    this.memory.delete(key);
    await this.deleteFromDB(store, key);
  }
  
  // ===== إحصائيات =====
  
  getStats() {
    return {
      memory: {
        size: this.memory.size,
        maxSize: this.maxMemorySize,
        usage: (this.memory.size / this.maxMemorySize) * 100
      }
    };
  }
  
  // ===== تنظيف =====
  
  clearMemory() {
    this.memory.clear();
  }
  
  async clearAll() {
    this.clearMemory();
    if (this.db) {
      await this.clearStore('analyses');
      await this.clearStore('llm-results');
      await this.clearStore('manuscripts');
    }
  }
}

// Singleton instance
const cacheManager = new CacheManager();

export default cacheManager;
export { CacheManager };
