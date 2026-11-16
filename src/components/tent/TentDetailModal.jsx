import { useEffect } from 'react'
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
} from 'lucide-react'
import { formatRupiah } from '../../utils/helpers'
import FavoriteButton from '../common/FavoriteButton'
import ShareButton from '../common/ShareButton'

export default function TentDetailModal({
  tent,
  onClose,
  onEdit,
  onDelete,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!tent) return null

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
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer detail-modal-footer">
          <div className="detail-footer-left">
            <FavoriteButton tent={tent} size={18} showLabel className="btn btn--outline btn--sm" />
            <ShareButton tent={tent} size={16} className="btn btn--outline btn--sm" />
          </div>

          <div className="detail-footer-right">
            {onEdit && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => {
                  onClose()
                  onEdit(tent)
                }}
              >
                <Edit size={14} /> Edit Produk
              </button>
            )}
            {onDelete && (
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
