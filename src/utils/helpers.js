/**
 * Format number to Indonesian Rupiah currency string.
 * @param {number|string} amount
 * @returns {string} e.g. "Rp 1.450.000"
 */
export const formatRupiah = (amount) => {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Filter item matching search query across name, description, category, and capacity.
 */
export const matchesSearch = (item, query) => {
  if (!query || !query.trim()) return true
  const q = query.toLowerCase().trim()
  const name = (item.name || '').toLowerCase()
  const desc = (item.description || '').toLowerCase()
  const category = (item.category || item.type || '').toLowerCase()
  const capacity = (item.capacity || '').toLowerCase()
  const rating = (item.waterproofRating || '').toLowerCase()

  return (
    name.includes(q) ||
    desc.includes(q) ||
    category.includes(q) ||
    capacity.includes(q) ||
    rating.includes(q)
  )
}

/**
 * Filter item matching category.
 */
export const matchesCategory = (item, category) => {
  if (!category || category === 'All') return true
  const itemCategory = item.category || item.type || ''
  return itemCategory.toLowerCase() === category.toLowerCase()
}

/**
 * Sort list of items by key and direction.
 */
export const sortItems = (items, sortKey, sortOrder = 'asc') => {
  return [...items].sort((a, b) => {
    let aVal = a[sortKey]
    let bVal = b[sortKey]

    if (sortKey === 'price') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    if (sortKey === 'rating') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    if (sortKey === 'stock') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    // Default string comparison
    const aStr = String(aVal || '').toLowerCase()
    const bStr = String(bVal || '').toLowerCase()
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
  })
}

/**
 * Generate a unique ID (RFC4122 v4 or fallback timestamp).
 */
export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'tent-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
}
