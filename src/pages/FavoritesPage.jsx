import { useState } from 'react'
import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Tent,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { formatRupiah } from '../utils/helpers'
import ConfirmModal from '../components/modals/ConfirmModal'

export default function FavoritesPage({ onSelectTent, onNavigateCatalog }) {
  const { favorites, toggle, clear } = useFavorites()
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  const totalPrice = favorites.reduce((acc, item) => acc + (Number(item.price) || 0), 0)

  const handleSimulateCheckout = () => {
    setCheckoutModalOpen(false)
    setCheckoutSuccess(true)
    setTimeout(() => {
      setCheckoutSuccess(false)
    }, 4000)
  }

  return (
    <div className="favorites-page">
      {/* Header Banner */}
      <section className="favorites-masthead">
        <div>
          <div className="badge badge--emerald">
            <Heart size={14} fill="var(--emerald)" /> Wishlist &amp; Persewaan
          </div>
          <h1 className="hero-title" style={{ marginTop: '8px' }}>
            Daftar Favorit &amp; Rencana Sewa
          </h1>
          <p className="hero-subtitle">
            Simpan perlengkapan tenda yang Anda minati untuk pendakian berikutnya. Data favorit tersimpan otomatis di perangkat secara offline.
          </p>
        </div>

        {favorites.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => setClearConfirmOpen(true)}
            >
              <Trash2 size={14} /> Bersihkan Semua
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setCheckoutModalOpen(true)}
            >
              <ShoppingCart size={14} /> Simulasi Reservasi
            </button>
          </div>
        )}
      </section>

      {/* Checkout Success Feedback */}
      {checkoutSuccess && (
        <div className="toast toast--success" role="alert">
          <CheckCircle2 size={18} />
          <span>
            Simulasi reservasi tenda berhasil dikonfirmasi! Tim TentCraft siap menyiapkan perlengkapan outdoor Anda.
          </span>
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="state-box state-empty" style={{ minHeight: '340px' }}>
          <Heart size={48} stroke="var(--steel)" />
          <h3>Belum Ada Alat Tenda yang Difavoritkan</h3>
          <p className="lede">
            Jelajahi katalog dan klik ikon hati pada tenda atau aksesoris camping yang Anda sukai untuk menyimpannya di sini.
          </p>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={onNavigateCatalog}
            style={{ marginTop: '14px' }}
          >
            <Tent size={14} /> Buka Katalog Alat Tenda
          </button>
        </div>
      ) : (
        <div className="favorites-layout">
          {/* List of favorited cards */}
          <div className="favorites-list">
            {favorites.map((tent) => (
              <div key={tent.id} className="fav-item-card">
                <img
                  src={tent.image || '/tents/dome.svg'}
                  alt={tent.name}
                  className="fav-item-thumb"
                  onError={(e) => {
                    e.currentTarget.src = '/tents/dome.svg'
                  }}
                />

                <div className="fav-item-info">
                  <span className="badge badge--category">{tent.category}</span>
                  <h3 className="fav-item-title">{tent.name}</h3>
                  <div className="fav-item-meta">
                    <span>Kapasitas: {tent.capacity || 'Standard'}</span>
                    <span>•</span>
                    <span>{tent.waterproofRating || 'PU 3000mm'}</span>
                  </div>
                  <div className="fav-item-price">
                    {formatRupiah(tent.price)}
                  </div>
                </div>

                <div className="fav-item-actions">
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={() => onSelectTent && onSelectTent(tent)}
                  >
                    Lihat Detail
                  </button>
                  <button
                    type="button"
                    className="icon-btn btn--danger-subtle"
                    onClick={() => toggle(tent)}
                    title="Hapus dari favorit"
                    aria-label="Hapus dari favorit"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar Card */}
          <aside className="favorites-summary-card">
            <h3 className="summary-title">Ringkasan Estimasi</h3>

            <div className="summary-row">
              <span>Jumlah Item</span>
              <strong>{favorites.length} produk</strong>
            </div>

            <div className="summary-row">
              <span>Estimasi Pembelian</span>
              <strong>{formatRupiah(totalPrice)}</strong>
            </div>

            <div className="summary-row">
              <span>Estimasi Sewa / Hari (15%)</span>
              <strong style={{ color: 'var(--emerald)' }}>
                {formatRupiah(Math.round(totalPrice * 0.15))} / hari
              </strong>
            </div>

            <hr className="summary-sep" />

            <div className="summary-total-row">
              <span>Total Estimasi</span>
              <span className="summary-total-val">{formatRupiah(totalPrice)}</span>
            </div>

            <p className="summary-note">
              <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Dapat diambil langsung di outlet TentCraft atau dikirim ke posko basecamp pendakian.
            </p>

            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={() => setCheckoutModalOpen(true)}
            >
              <ShoppingCart size={16} /> Lanjutkan Reservasi
            </button>
          </aside>
        </div>
      )}

      {/* Checkout Simulation Modal */}
      {checkoutModalOpen && (
        <div className="modal-backdrop" onClick={() => setCheckoutModalOpen(false)}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="checkout-dialog-title" className="modal-title">
                Konfirmasi Reservasi Tenda
              </h3>
            </div>
            <div className="modal-body">
              <p>
                Anda akan melakukan simulasi reservasi untuk <strong>{favorites.length} unit</strong> alat tenda dengan total nilai <strong>{formatRupiah(totalPrice)}</strong>.
              </p>
              <div className="checkout-summary-box">
                {favorites.map((f) => (
                  <div key={f.id} className="checkout-row">
                    <span>{f.name}</span>
                    <span>{formatRupiah(f.price)}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--steel)', marginTop: '12px' }}>
                * Ini adalah simulasi transaksi PWA. Tidak ada kartu kredit atau pembayaran riil yang ditagihkan.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => setCheckoutModalOpen(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={handleSimulateCheckout}
              >
                Konfirmasi Reservasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        open={clearConfirmOpen}
        title="Kosongkan Daftar Favorit"
        message="Apakah Anda yakin ingin menghapus seluruh alat tenda dari daftar favorit Anda?"
        confirmLabel="Kosongkan"
        danger
        onConfirm={() => {
          clear()
          setClearConfirmOpen(false)
        }}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </div>
  )
}

