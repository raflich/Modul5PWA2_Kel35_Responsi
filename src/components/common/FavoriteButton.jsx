import { Heart } from 'lucide-react'
import { useFavorites } from '../../hooks/useFavorites'

export default function FavoriteButton({ tent, size = 18, showLabel = false, className = '' }) {
  const { isFav, toggle } = useFavorites()
  const active = isFav(tent?.id)

  const handleClick = (e) => {
    e.stopPropagation()
    toggle(tent)
  }

  return (
    <button
      type="button"
      className={`fav-btn ${active ? 'fav-btn--active' : ''} ${className}`}
      onClick={handleClick}
      aria-label={active ? 'Hapus dari favorit' : 'Tambah ke favorit'}
      title={active ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}
    >
      <Heart
        size={size}
        fill={active ? 'var(--emerald)' : 'none'}
        stroke={active ? 'var(--emerald)' : 'currentColor'}
      />
      {showLabel && <span>{active ? 'Favorit' : 'Simpan'}</span>}
    </button>
  )
}
