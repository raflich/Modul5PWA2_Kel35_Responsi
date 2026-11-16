import { useState, useEffect } from 'react'
import {
  X,
  Users,
  Droplets,
  Scale,
  Star,
  CheckCircle,
  Share2,
  Edit,
  Trash2,
  Package,
  Layers,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  Send,
} from 'lucide-react'
import { formatRupiah } from '../../utils/helpers'
import FavoriteButton from '../common/FavoriteButton'
import ShareButton from '../common/ShareButton'
import reviewService from '../../services/reviewService'
import userService from '../../services/userService'
import { useAuth } from '../../hooks/useAuth'

export default function TentDetailModal({
  tent,
  onClose,
  onEdit,
  onDelete,
}) {
  const { isAdmin } = useAuth()
  const profile = userService.getUserProfile()
  const [reviewerName, setReviewerName] = useState(() => profile.name || 'Pengunjung')
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    if (tent?.id) {
      setReviews(reviewService.getReviews(tent.id))
    }
  }, [tent?.id])

  if (!tent) return null

  const handleAddReview = (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setSubmittingReview(true)
      const newRev = reviewService.addReview(tent.id, {
        userName: reviewerName.trim() || profile.name || 'Pengunjung',
        userId: profile.userId,
        rating,
        comment: comment.trim(),
      })
      setReviews([newRev, ...reviews])
      setComment('')
      setRating(5)
      setReviewMsg('Ulasan dan rating Anda berhasil dipublikasikan!')
      setTimeout(() => setReviewMsg(''), 3000)
    } catch (err) {
      alert(err.message || 'Gagal mengirim ulasan.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleToggleLike = (reviewId) => {
    reviewService.toggleLike(tent.id, reviewId, profile.userId)
    setReviews(reviewService.getReviews(tent.id))
  }

  const handleDeleteReview = (reviewId) => {
    reviewService.deleteReview(tent.id, reviewId)
    setReviews(reviewService.getReviews(tent.id))
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-box modal-box--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tent-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge--category">{tent.category}</span>
            <span className="tent-modal-id">ID: {tent.id}</span>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Tutup detail produk"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="modal-body detail-modal-body">
          <div className="detail-hero-grid">
            {/* Visual Image */}
            <div className="detail-img-box">
              <img
                src={tent.image || '/tents/dome.svg'}
                alt={tent.name}
                className="detail-img"
              />
              <div className="detail-stock-row">
                <span className="detail-stock-badge">
                  <Package size={14} /> Stok Tersedia: <strong>{tent.stock} unit</strong>
                </span>
                <span className="detail-rating-badge">
                  <Star size={14} fill="var(--amber)" stroke="var(--amber)" /> {tent.rating} / 5.0
                </span>
              </div>
            </div>

            {/* Title & Core Price */}
            <div className="detail-header-info">
              <h2 id="tent-detail-title" className="detail-title">
                {tent.name}
              </h2>

              <div className="detail-price-box">
                <span className="detail-price-label">Harga Penjualan</span>
                <span className="detail-price-val">{formatRupiah(tent.price)}</span>
                <span className="detail-guarantee">
                  <ShieldCheck size={14} /> Garansi Resmi Distributor &amp; Pemasangan Aman
                </span>
              </div>

              {/* Quick Specs 4-Grid */}
              <div className="detail-quick-specs">
                <div className="quick-spec-item">
                  <Users size={18} className="quick-spec-icon" />
                  <div>
                    <span className="quick-spec-lbl">Kapasitas</span>
                    <strong>{tent.capacity}</strong>
                  </div>
                </div>

                <div className="quick-spec-item">
                  <Droplets size={18} className="quick-spec-icon" />
                  <div>
                    <span className="quick-spec-lbl">Waterproof</span>
                    <strong>{tent.waterproofRating}</strong>
                  </div>
                </div>

                <div className="quick-spec-item">
                  <Scale size={18} className="quick-spec-icon" />
                  <div>
                    <span className="quick-spec-lbl">Bobot Total</span>
                    <strong>{tent.weight}</strong>
                  </div>
                </div>

                <div className="quick-spec-item">
                  <Layers size={18} className="quick-spec-icon" />
                  <div>
                    <span className="quick-spec-lbl">Kategori</span>
                    <strong>{tent.category}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="detail-section">
            <h4 className="detail-section-title">Deskripsi Alat Tenda</h4>
            <p className="detail-desc-text">{tent.description}</p>
          </div>

          {/* Specifications Table */}
          {tent.specs && tent.specs.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title">Spesifikasi Material &amp; Teknis</h4>
              <div className="specs-table">
                {tent.specs.map((spec, idx) => (
                  <div key={spec.id || idx} className="spec-row">
                    <span className="spec-name">{spec.name}</span>
                    <span className="spec-value">{spec.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Features */}
          {tent.features && tent.features.length > 0 && (
            <div className="detail-section">
              <h4 className="detail-section-title">Keunggulan &amp; Fitur Utama</h4>
              <ul className="features-list">
                {tent.features.map((feat, idx) => (
                  <li key={idx} className="feature-item">
                    <CheckCircle size={15} className="feature-icon" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ===================================================================
           * REVIEWS & RATINGS SECTION
           * =================================================================== */}
          <div className="detail-section reviews-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--emerald)" />
                <h4 className="detail-section-title" style={{ margin: 0 }}>
                  Ulasan &amp; Rating Pembeli ({reviews.length})
                </h4>
              </div>
            </div>

            {/* Review Success Toast */}
            {reviewMsg && (
              <div className="toast toast--success" style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: '14px' }}>
                <CheckCircle size={16} /> {reviewMsg}
              </div>
            )}

            {/* Add Review Form */}
            <form onSubmit={handleAddReview} className="add-review-box">
              <div className="add-review-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
                  <label htmlFor="reviewer-name-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap' }}>
                    Nama Pengunjung / Pengulas:
                  </label>
                  <input
                    id="reviewer-name-input"
                    type="text"
                    className="form-input"
                    style={{ padding: '6px 12px', fontSize: '0.88rem', flex: 1, maxWidth: '240px' }}
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="Nama Pengunjung..."
                  />
                </div>

                {/* 5-Star Interactive Rating Picker */}
                <div className="star-picker" role="radiogroup" aria-label="Pilih Bintang">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-pick-btn"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      title={`Beri ${star} bintang`}
                      aria-label={`${star} Bintang`}
                    >
                      <Star
                        size={20}
                        fill={(hoverRating || rating) >= star ? '#d97706' : 'none'}
                        stroke={(hoverRating || rating) >= star ? '#d97706' : '#94a3b8'}
                      />
                    </button>
                  ))}
                  <span className="star-rating-count">({rating} / 5)</span>
                </div>
              </div>

              <textarea
                className="form-textarea review-textarea"
                rows={3}
                placeholder="Bagikan pengalaman pemakaian tenda ini (contoh: ketahanan hujan badai, kekuatan pasak tanah, sirkulasi udara, atau kemudahan pasang)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={submittingReview || !comment.trim()}
                >
                  <Send size={14} />
                  <span>{submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}</span>
                </button>
              </div>
            </form>

            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--steel)', background: '#f8fafc', borderRadius: '8px' }}>
                  Belum ada ulasan untuk alat tenda ini. Jadilah yang pertama memberikan penilaian!
                </div>
              ) : (
                reviews.map((rev) => {
                  const isAuthor = rev.userId === profile.userId
                  const hasLiked = reviewService.hasLiked(rev.id, profile.userId)

                  return (
                    <div key={rev.id} className="review-item-card">
                      <div className="review-top-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="review-avatar">
                            {(rev.userName || 'P')[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="review-author">{rev.userName}</span>
                            <div className="review-stars">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  fill={s <= rev.rating ? '#d97706' : 'none'}
                                  stroke={s <= rev.rating ? '#d97706' : '#cbd5e1'}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span className="review-date">
                            {new Date(rev.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {isAuthor && (
                            <button
                              type="button"
                              className="icon-btn btn--danger-subtle btn--xs"
                              onClick={() => handleDeleteReview(rev.id)}
                              title="Hapus ulasan Anda"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="review-comment">{rev.comment}</p>

                      <div className="review-footer-row">
                        <button
                          type="button"
                          className={`review-like-btn ${hasLiked ? 'review-like-btn--active' : ''}`}
                          onClick={() => handleToggleLike(rev.id)}
                          title="Tandai ulasan ini bermanfaat"
                        >
                          <ThumbsUp size={13} />
                          <span>Membantu ({rev.likes || 0})</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer detail-modal-footer">
          <div className="detail-footer-left">
            <FavoriteButton tent={tent} size={18} showLabel className="btn btn--outline btn--sm" />
            <ShareButton tent={tent} size={16} className="btn btn--outline btn--sm" />
          </div>

          <div className="detail-footer-right">
            {isAdmin && onEdit && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => {
                  onClose()
                  onEdit(tent)
                }}
                title="Edit spesifikasi produk alat tenda ini"
              >
                <Edit size={14} /> Edit Produk
              </button>
            )}
            {isAdmin && onDelete && (
              <button
                type="button"
                className="btn btn--outline btn--danger-subtle btn--sm"
                onClick={() => {
                  onClose()
                  onDelete(tent)
                }}
              >
                <Trash2 size={14} /> Hapus
              </button>
            )}
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={onClose}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
