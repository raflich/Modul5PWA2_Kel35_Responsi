/**
 * Review & Rating Service for TentCraft PWA
 * Menyimpan ulasan, bintang 1-5, komentar, dan reaksi helpful/like secara offline di localStorage.
 */

const REVIEWS_PREFIX = 'tentcraft_reviews_'
const VOTES_PREFIX = 'tentcraft_votes_'

const DEFAULT_SAMPLE_REVIEWS = {
  'tent-1': [
    {
      id: 'rev-101',
      userName: 'Fajar Kurniawan',
      rating: 5,
      comment: 'Sudah dites badai angin kencang di Pos 4 Gunung Merbabu. Frame aluminium 7001 sangat kokoh dan tidak tembus air sama sekali. Sangat ringan untuk tas carrier 50L!',
      createdAt: '2026-11-10T14:20:00.000Z',
      likes: 12,
    },
    {
      id: 'rev-102',
      userName: 'Dian Safitri',
      rating: 5,
      comment: 'Pemasangan sangat cepat cuma butuh 4 menit. Ventilasi mesh-nya bagus, di dalam tidak terjadi kondensasi basah.',
      createdAt: '2026-11-12T09:15:00.000Z',
      likes: 7,
    },
  ],
  'tent-2': [
    {
      id: 'rev-201',
      userName: 'Budi Santoso',
      rating: 5,
      comment: 'Teknologi Fresh & Black-nya juara! Di siang bolong camping di pantai suhunya tetap sejuk dan gelap banget, anak-anak bisa tidur siang nyenyak.',
      createdAt: '2026-11-08T11:00:00.000Z',
      likes: 15,
    },
  ],
  'tent-3': [
    {
      id: 'rev-301',
      userName: 'Keluarga Outdoor ID',
      rating: 5,
      comment: 'Tenda villa paling mewah untuk glamping keluarga. Ruang tamunya bisa muat 4 kursi lipat dan meja camping.',
      createdAt: '2026-11-05T16:45:00.000Z',
      likes: 9,
    },
  ],
  'tent-4': [
    {
      id: 'rev-401',
      userName: 'Rian Pendaki',
      rating: 5,
      comment: 'Flysheet lebar dengan jahitan seam-sealed rapat. Dipasang A-frame saat hujan deras tetap kering total.',
      createdAt: '2026-11-14T08:30:00.000Z',
      likes: 5,
    },
  ],
}

class ReviewService {
  _getStorageKey(tentId) {
    return `${REVIEWS_PREFIX}${tentId}`
  }

  getReviews(tentId) {
    try {
      const key = this._getStorageKey(tentId)
      const raw = localStorage.getItem(key)
      if (raw) {
        return JSON.parse(raw)
      }
      // Seed default reviews if available
      const sample = DEFAULT_SAMPLE_REVIEWS[tentId] || []
      if (sample.length > 0) {
        localStorage.setItem(key, JSON.stringify(sample))
        return sample
      }
    } catch (e) {
      console.warn('[ReviewService] Error getting reviews:', e)
    }
    return DEFAULT_SAMPLE_REVIEWS[tentId] || []
  }

  addReview(tentId, { userName, rating, comment, userId }) {
    if (!comment || !comment.trim()) {
      throw new Error('Komentar ulasan wajib diisi.')
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating harus antara 1 sampai 5 bintang.')
    }

    const reviews = this.getReviews(tentId)
    const newRev = {
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      userName: userName || 'Pendaki Sahabat TentCraft',
      userId: userId || 'anon',
      rating: Number(rating),
      comment: comment.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    }

    const updated = [newRev, ...reviews]
    try {
      localStorage.setItem(this._getStorageKey(tentId), JSON.stringify(updated))
    } catch (e) {
      console.error('[ReviewService] Error saving review:', e)
    }
    return newRev
  }

  deleteReview(tentId, reviewId) {
    const reviews = this.getReviews(tentId)
    const filtered = reviews.filter((r) => r.id !== reviewId)
    try {
      localStorage.setItem(this._getStorageKey(tentId), JSON.stringify(filtered))
      return true
    } catch {
      return false
    }
  }

  toggleLike(tentId, reviewId, userId) {
    const voteKey = `${VOTES_PREFIX}${userId || 'anon'}_${reviewId}`
    const alreadyLiked = Boolean(localStorage.getItem(voteKey))

    const reviews = this.getReviews(tentId)
    const rev = reviews.find((r) => r.id === reviewId)
    if (!rev) return false

    if (alreadyLiked) {
      rev.likes = Math.max(0, (rev.likes || 1) - 1)
      localStorage.removeItem(voteKey)
    } else {
      rev.likes = (rev.likes || 0) + 1
      localStorage.setItem(voteKey, '1')
    }

    try {
      localStorage.setItem(this._getStorageKey(tentId), JSON.stringify(reviews))
      return !alreadyLiked
    } catch {
      return false
    }
  }

  hasLiked(reviewId, userId) {
    try {
      return Boolean(localStorage.getItem(`${VOTES_PREFIX}${userId || 'anon'}_${reviewId}`))
    } catch {
      return false
    }
  }
}

export default new ReviewService()

