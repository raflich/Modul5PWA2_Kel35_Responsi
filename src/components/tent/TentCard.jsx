import { Users, Droplets, Star, Package, Edit, Trash2 } from 'lucide-react'
import { formatRupiah } from '../../utils/helpers'
import FavoriteButton from '../common/FavoriteButton'
import ShareButton from '../common/ShareButton'

export default function TentCard({
  tent,
  onSelect,
  onEdit,
  onDelete,
  showManageActions = false,
}) {
  return (
    <article
      className="tent-card"
      onClick={() => onSelect && onSelect(tent)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect && onSelect(tent)
        }
      }}
    >
      {/* Card Header with Badges & Action Buttons */}
      <div className="tent-card-header">
        <span className="badge badge--category">{tent.category}</span>
        <div className="tent-card-quick-actions" onClick={(e) => e.stopPropagation()}>
          <ShareButton tent={tent} size={15} />
          <FavoriteButton tent={tent} size={16} />
        </div>
      </div>

      {/* Visual Image Preview */}
      <div className="tent-card-image-wrap">
        <img
          src={tent.image || '/tents/dome.svg'}
          alt={tent.name}
          className="tent-card-img"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = '/tents/dome.svg'
          }}
        />
        {tent.stock <= 3 && tent.stock > 0 && (
          <span className="tent-stock-tag tent-stock-tag--low">Sisa {tent.stock} unit!</span>
        )}
        {tent.stock === 0 && (
          <span className="tent-stock-tag tent-stock-tag--empty">Stok Habis</span>
        )}
      </div>

      {/* Card Body */}
      <div className="tent-card-body">
        <div className="tent-card-meta-row">
          <span className="tent-meta-item" title="Kapasitas Tenda">
            <Users size={14} /> {tent.capacity}
          </span>
          <span className="tent-meta-item" title="Tingkat Ketahanan Air">
            <Droplets size={14} /> {tent.waterproofRating}
          </span>
          <span className="tent-meta-item tent-rating" title="Rating Pengguna">
            <Star size={13} fill="var(--amber)" stroke="var(--amber)" /> {tent.rating}
          </span>
        </div>

        <h3 className="tent-card-title">{tent.name}</h3>

        <p className="tent-card-desc">{tent.description}</p>

        {/* Card Footer */}
        <div className="tent-card-footer">
          <div className="tent-card-price-box">
            <span className="price-label">Harga Retail</span>
            <span className="price-value">{formatRupiah(tent.price)}</span>
          </div>

          {showManageActions ? (
            <div className="tent-card-manage-btns" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => onEdit && onEdit(tent)}
                title="Edit data alat tenda"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                type="button"
                className="btn btn--outline btn--danger-subtle btn--sm"
                onClick={() => onDelete && onDelete(tent)}
                title="Hapus data alat tenda"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn--outline btn--sm card-detail-btn"
              onClick={(e) => {
                e.stopPropagation()
                onSelect && onSelect(tent)
              }}
            >
              Lihat Detail
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
