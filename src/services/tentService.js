import { INITIAL_TENTS } from '../data/tents'
import queryCache from '../utils/queryCache'
import { generateId, matchesSearch, matchesCategory, sortItems } from '../utils/helpers'

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
    waterproofRating: item.waterproofRating || 'PU 3000mm',
    price: Number(item.price || 0),
    stock: item.stock !== undefined ? Number(item.stock) : 10,
    weight: item.weight || '2.0 kg',
    rating: Number(item.rating || 4.8),
    description: item.description || '',
    specs: specsList,
    features: Array.isArray(item.features) ? item.features : [],
    image: img,
    image_url: img,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  }
}

class TentService {
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
   */
  async getTents(params = {}) {
    // SWR Cache Lookup
    const cacheKey = ['tents', JSON.stringify(params)]
    const cached = queryCache.get(cacheKey)

    // Load data
    const all = this._loadAll()

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

    queryCache.set(cacheKey, result)
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

    all.unshift(newTent)
    this._saveAll(all)

    // Invalidate caches
    queryCache.invalidateQueries('tents')

    return {
      success: true,
      data: newTent,
      message: 'Produk tenda berhasil ditambahkan ke katalog!',
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

    // Invalidate caches
    queryCache.invalidateQueries('tents')
    queryCache.invalidateQueries(['tent', id])

    return {
      success: true,
      message: 'Produk tenda berhasil dihapus dari katalog.',
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

