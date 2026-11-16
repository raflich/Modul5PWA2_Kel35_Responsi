/**
 * Multi-tier Query Cache (In-Memory + persistent localStorage fallback).
 * Provides instantaneous 0ms responses and offline-first persistence.
 */

const CACHE_PREFIX = 'tentcraft_qc_'
const DEFAULT_TTL = 1000 * 60 * 60 * 24 // 24 hours

class QueryCache {
  constructor() {
    this.memoryCache = new Map()
    this.listeners = new Set()
  }

  _getKey(key) {
    if (Array.isArray(key)) {
      return CACHE_PREFIX + key.map(String).join(':')
    }
    return CACHE_PREFIX + String(key)
  }

  get(key) {
    const serializedKey = this._getKey(key)

    // Tier 1: In-memory Map
    if (this.memoryCache.has(serializedKey)) {
      const entry = this.memoryCache.get(serializedKey)
      if (Date.now() < entry.expiry) {
        return entry.data
      }
      this.memoryCache.delete(serializedKey)
    }

    // Tier 2: localStorage fallback
    try {
      const item = localStorage.getItem(serializedKey)
      if (item) {
        const parsed = JSON.parse(item)
        if (Date.now() < parsed.expiry) {
          // Promote to Tier 1
          this.memoryCache.set(serializedKey, parsed)
          return parsed.data
        }
        localStorage.removeItem(serializedKey)
      }
    } catch {
      // LocalStorage access issues
    }

    return null
  }

  set(key, data, ttl = DEFAULT_TTL) {
    const serializedKey = this._getKey(key)
    const entry = {
      data,
      expiry: Date.now() + ttl,
      updatedAt: Date.now(),
    }

    this.memoryCache.set(serializedKey, entry)

    try {
      localStorage.setItem(serializedKey, JSON.stringify(entry))
    } catch (e) {
      console.warn('[QueryCache] Failed to persist to localStorage:', e)
    }

    this._notify(key)
  }

  invalidateQueries(keyPrefix) {
    const prefix = this._getKey(keyPrefix)

    // Clear matching in-memory keys
    for (const k of this.memoryCache.keys()) {
      if (k.startsWith(prefix)) {
        this.memoryCache.delete(k)
      }
    }

    // Clear matching localStorage keys
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(prefix)) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch {
      // Ignore
    }

    this._notify(keyPrefix)
  }

  clear() {
    this.memoryCache.clear()
    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch {
      // Ignore
    }
    this._notify('*')
  }

  getCount() {
    try {
      let count = 0
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(CACHE_PREFIX)) {
          count++
        }
      }
      return count
    } catch {
      return 0
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  _notify(key) {
    this.listeners.forEach((fn) => {
      try {
        fn(key)
      } catch (err) {
        console.error('[QueryCache] Listener error:', err)
      }
    })
  }
}

export default new QueryCache()
