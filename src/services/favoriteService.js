/**
 * Favorite & Wishlist Service
 * Handles user favorited / shortlisted equipment with offline localStorage persistence.
 */

const FAVORITES_KEY = 'tentcraft_favorites'
const listeners = new Set()

export const getFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch {
    // Fallback
  }
  return []
}

export const isFavorite = (tentId) => {
  const list = getFavorites()
  return list.some((item) => String(item.id || item) === String(tentId))
}

export const toggleFavorite = (tent) => {
  const list = getFavorites()
  const id = String(tent.id || tent)
  const existingIndex = list.findIndex((item) => String(item.id || item) === id)

  let updated
  let isNowFav
  if (existingIndex > -1) {
    updated = list.filter((item) => String(item.id || item) !== id)
    isNowFav = false
  } else {
    // Store lightweight object
    const favItem = typeof tent === 'object' ? {
      id: String(tent.id),
      name: tent.name,
      category: tent.category,
      price: tent.price,
      image: tent.image || tent.image_url,
      capacity: tent.capacity,
      waterproofRating: tent.waterproofRating,
      addedAt: new Date().toISOString(),
    } : { id }
    updated = [favItem, ...list]
    isNowFav = true
  }

  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
  } catch (e) {
    console.warn('[FavoriteService] Failed to save favorites:', e)
  }

  notifyListeners()
  return isNowFav
}

export const clearFavorites = () => {
  try {
    localStorage.removeItem(FAVORITES_KEY)
  } catch {
    // Ignore
  }
  notifyListeners()
}

export const subscribeFavorites = (callback) => {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

const notifyListeners = () => {
  const current = getFavorites()
  listeners.forEach((fn) => {
    try {
      fn(current)
    } catch (e) {
      console.error('[FavoriteService] Listener error:', e)
    }
  })
}

export default {
  getFavorites,
  isFavorite,
  toggleFavorite,
  clearFavorites,
  subscribeFavorites,
}
