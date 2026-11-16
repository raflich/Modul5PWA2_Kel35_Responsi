import axios from 'axios'
import { INITIAL_TENTS } from '../data/tents'
import queryCache from '../utils/queryCache'
import { generateId, matchesSearch, matchesCategory, sortItems } from '../utils/helpers'
import { BASE_URL, SUPABASE_KEY, IS_SUPABASE } from '../config/api'

const STORAGE_KEY = 'tentcraft_products_db'

/**
 * Normalizes item properties to ensure consistent schema.
 */
export const normalizeTent = (item) => {
  if (!item) return null

  let specsList = []
  if (Array.isArray(item.specs)) {
    specsList = item.specs.map((s, idx) => {
      if (typeof s === 'string') {
        const colonIndex = s.indexOf(':')
        if (colonIndex > -1) {
          return {
            id: `spec-${idx}`,
            name: s.substring(0, colonIndex).trim(),
            quantity: s.substring(colonIndex + 1).trim(),
          }
        }
        return {
          id: `spec-${idx}`,
          name: 'Spesifikasi',
          quantity: s.trim(),
        }
      }
      return {
        id: s.id || `spec-${idx}`,
        name: s.name || 'Fitur',
        quantity: s.quantity || s.val || '',
      }
    })
  }

  const defaultImg =
    item.category === 'Tenda Dome'
      ? '/tents/dome.svg'
      : item.category === 'Tenda Tunnel & Family'
      ? '/tents/tunnel.svg'
      : item.category === 'Flysheet & Tarp'
      ? '/tents/flysheet.svg'
      : item.category === 'Perlengkapan & Pasak'
      ? '/tents/pegs.svg'
      : '/tents/accessories.svg'

  const img = item.image || item.image_url || defaultImg

  return {
    id: String(item.id || generateId()),
    name: item.name || 'Alat Tenda Outdoor',
    category: item.category || item.type || 'Tenda Dome',
    type: item.category || item.type || 'Tenda Dome',
    capacity: item.capacity || '2-4 Orang',
    waterproofRating: item.waterproofRating || item.waterproof_rating || 'PU 3000mm',
    price: Number(item.price || 0),
    stock: item.stock !== undefined ? Number(item.stock) : 10,
    weight: item.weight || '2.0 kg',
    rating: Number(item.rating || 0),
    description: item.description || '',
    specs: specsList,
    features: Array.isArray(item.features) ? item.features : [],
    image: img,
    image_url: img,
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
  }
}

/**
 * Konversi objek Supabase DB row ke format Frontend
 */
export const fromSupabaseTent = (row) => {
  if (!row) return null
  return normalizeTent({
    id: row.id,
    name: row.name,
    category: row.category,
    type: row.type || row.category,
    capacity: row.capacity,
    waterproofRating: row.waterproof_rating || 'PU 3000mm',
    price: Number(row.price),
    stock: Number(row.stock),
    weight: row.weight,
    rating: Number(row.rating || 0),
    image: row.image || '/tents/dome.svg',
    description: row.description || '',
    specs: row.specs || [],
    features: row.features || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

/**
 * Konversi objek Frontend ke format Supabase DB row
 */
export const toSupabaseTent = (item) => {
  return {
    id: String(item.id),
    name: item.name,
    category: item.category,
    type: item.category,
    capacity: item.capacity,
    waterproof_rating: item.waterproofRating || 'PU 3000mm',
    price: Number(item.price),
    stock: Number(item.stock),
    weight: item.weight || '',
    rating: Number(item.rating || 0),
    image: item.image || '/tents/dome.svg',
    description: item.description || '',
    specs: item.specs || [],
    features: item.features || [],
    updated_at: new Date().toISOString(),
  }
}

class TentService {
  /**
   * Mengambil token auth admin jika sedang login
   */
  _getAuthToken() {
    try {
      const raw = localStorage.getItem('tentcraft_auth_session')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed?.token && parsed.token !== 'offline-admin-jwt-token') {
          return parsed.token
        }
      }
    } catch {
      // Abaikan
    }
    return null
  }

  /**
   * Internal helper to load current inventory from localStorage or seed initial data.
   */
  _loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeTent)
        }
      }
    } catch (e) {
      console.warn('[TentService] Error reading storage, initializing with seed data:', e)
    }

    // Seed initial data
    const initial = INITIAL_TENTS.map(normalizeTent)
    this._saveAll(initial)
    return initial
  }

  _saveAll(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.error('[TentService] Failed to save products to storage:', e)
    }
  }

  /**
   * Fetch a paginated, filterable, and sortable list of tent products.
   * Sinkron otomatis dengan Supabase Database (Cloud) agar tampil di semua device!
   */
  async getTents(params = {}) {
    let all = []
    let isCloudLoaded = false

    // 1. Ambil data realtime dari Supabase Cloud DB
    if (IS_SUPABASE && BASE_URL && SUPABASE_KEY) {
      try {
        const res = await axios.get(`${BASE_URL}/rest/v1/tents?select=*&order=created_at.desc`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          timeout: 4500,
        })

        if (Array.isArray(res.data) && res.data.length > 0) {
          all = res.data.map(fromSupabaseTent)
          this._saveAll(all) // Perbarui mirror lokal di device ini
          isCloudLoaded = true
        }
      } catch (cloudErr) {
        console.info('[TentService] Koneksi cloud offline, menggunakan penyimpanan lokal:', cloudErr.message)
      }
    }

    // 2. Jika offline atau cloud gagal, gunakan data lokal (Offline-First PWA)
    if (!isCloudLoaded || all.length === 0) {
      all = this._loadAll()
    }

    let filtered = all.filter(
      (item) =>
        matchesSearch(item, params.search) &&
        matchesCategory(item, params.category),
    )

    const sortKey = params.sort_by || 'name'
    const sortOrder = params.order || 'asc'
    filtered = sortItems(filtered, sortKey, sortOrder)

    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 50
    const total = filtered.length
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + limit)

    const result = {
      success: true,
      data: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    }

    return result
  }

  /**
   * Fetch a single tent product by ID.
   */
  async getTentById(id) {
    const all = this._loadAll()
    const found = all.find((item) => String(item.id) === String(id))
    if (!found) {
      throw new Error(`Alat tenda dengan ID "${id}" tidak ditemukan.`)
    }
    return {
      success: true,
      data: normalizeTent(found),
    }
  }

  /**
   * Create a new tent product.
   * Menyimpan ke LocalStorage DAN menyinkronkan ke Supabase Cloud DB agar tampil di device lain.
   */
  async createTent(data) {
    if (!data.name || !data.name.trim()) {
      throw new Error('Nama produk tenda wajib diisi.')
    }
    if (data.price === undefined || data.price === null || isNaN(Number(data.price)) || Number(data.price) < 0) {
      throw new Error('Harga produk harus berupa angka valid.')
    }

    const all = this._loadAll()
    const newTent = normalizeTent({
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 1. Simpan segera ke LocalStorage
    all.unshift(newTent)
    this._saveAll(all)

    // 2. Sinkronkan ke Supabase Cloud (agar device lain dapat melihatnya)
    if (IS_SUPABASE && BASE_URL && SUPABASE_KEY) {
      try {
        const token = this._getAuthToken()
        await axios.post(
          `${BASE_URL}/rest/v1/tents`,
          toSupabaseTent(newTent),
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${token || SUPABASE_KEY}`,
              Prefer: 'return=representation',
              'Content-Type': 'application/json',
            },
            timeout: 6000,
          },
        )
        console.log('[TentService] Produk tenda berhasil disinkronkan ke Supabase!')
      } catch (err) {
        console.warn('[TentService] Gagal kirim ke Supabase (tersimpan di lokal):', err.response?.data || err.message)
      }
    }

    // Invalidate caches
    queryCache.invalidateQueries('tents')

    return {
      success: true,
      data: newTent,
      message: 'Produk tenda berhasil ditambahkan dan disinkronkan!',
    }
  }

  /**
   * Update an existing tent product.
   */
  async updateTent(id, data) {
    const all = this._loadAll()
    const index = all.findIndex((item) => String(item.id) === String(id))
    if (index === -1) {
      throw new Error(`Alat tenda dengan ID "${id}" tidak ditemukan.`)
    }

    const updated = normalizeTent({
      ...all[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    })

    all[index] = updated
    this._saveAll(all)

    // Sync perubahan ke Supabase
    if (IS_SUPABASE && BASE_URL && SUPABASE_KEY) {
      try {
        const token = this._getAuthToken()
        await axios.patch(
          `${BASE_URL}/rest/v1/tents?id=eq.${id}`,
          toSupabaseTent(updated),
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${token || SUPABASE_KEY}`,
              Prefer: 'return=representation',
              'Content-Type': 'application/json',
            },
            timeout: 6000,
          },
        )
      } catch (err) {
        console.warn('[TentService] Gagal update ke Supabase:', err.response?.data || err.message)
      }
    }

    // Invalidate caches
    queryCache.invalidateQueries('tents')
    queryCache.invalidateQueries(['tent', id])

    return {
      success: true,
      data: updated,
      message: 'Data produk tenda berhasil diperbarui!',
    }
  }

  /**
   * Delete a tent product.
   */
  async deleteTent(id) {
    const all = this._loadAll()
    const initialLen = all.length
    const filtered = all.filter((item) => String(item.id) !== String(id))

    if (filtered.length === initialLen) {
      throw new Error(`Alat tenda dengan ID "${id}" tidak ditemukan.`)
    }

    this._saveAll(filtered)

    // Sync penghapusan ke Supabase
    if (IS_SUPABASE && BASE_URL && SUPABASE_KEY) {
      try {
        const token = this._getAuthToken()
        await axios.delete(`${BASE_URL}/rest/v1/tents?id=eq.${id}`, {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${token || SUPABASE_KEY}`,
          },
          timeout: 6000,
        })
      } catch (err) {
        console.warn('[TentService] Gagal delete di Supabase:', err.response?.data || err.message)
      }
    }

    // Invalidate caches
    queryCache.invalidateQueries('tents')
    queryCache.invalidateQueries(['tent', id])

    return {
      success: true,
      message: 'Produk tenda berhasil dihapus.',
    }
  }

  /**
   * Reset database back to default initial items.
   */
  async resetInventory() {
    const initial = INITIAL_TENTS.map(normalizeTent)
    this._saveAll(initial)
    queryCache.clear()
    return {
      success: true,
      data: initial,
      message: 'Inventaris berhasil di-reset ke data bawaan.',
    }
  }
}

export default new TentService()
