import { useState, useMemo } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Layers,
  Search,
  Eye,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { useTents } from '../hooks/useTents'
import { formatRupiah } from '../utils/helpers'
import ConfirmModal from '../components/modals/ConfirmModal'
import TentDetailModal from '../components/tent/TentDetailModal'
import tentService from '../services/tentService'

export default function ManagePage({ onNavigate }) {
  const { tents, loading, refetch } = useTents()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedTent, setSelectedTent] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [resetModalOpen, setResetModalOpen] = useState(false)

  // Calculations
  const stats = useMemo(() => {
    const totalItems = tents.length
    const totalUnits = tents.reduce((acc, t) => acc + (Number(t.stock) || 0), 0)
    const lowStockCount = tents.filter((t) => Number(t.stock) <= 3).length
    const totalValue = tents.reduce(
      (acc, t) => acc + (Number(t.price) || 0) * (Number(t.stock) || 0),
      0,
    )
    return { totalItems, totalUnits, lowStockCount, totalValue }
  }, [tents])

  const filtered = useMemo(() => {
    return tents.filter((item) => {
      const matchQuery =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.capacity.toLowerCase().includes(search.toLowerCase())
      const matchCat =
        selectedCategory === 'All' || item.category === selectedCategory
      return matchQuery && matchCat
    })
  }, [tents, search, selectedCategory])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await tentService.deleteTent(deleteTarget.id)
      setFeedback(`Produk "${deleteTarget.name}" berhasil dihapus.`)
      setTimeout(() => setFeedback(''), 3000)
      setDeleteTarget(null)
    } catch (err) {
      alert(err.message || 'Gagal menghapus produk.')
    } finally {
      setDeleting(false)
    }
  }

  const handleResetInventory = async () => {
    try {
      await tentService.resetInventory()
      setResetModalOpen(false)
      setFeedback('Inventaris alat tenda berhasil di-reset ke data bawaan.')
      setTimeout(() => setFeedback(''), 3000)
      refetch()
    } catch (err) {
      alert(err.message || 'Gagal reset data.')
    }
  }

  return (
    <div className="manage-page">
      {/* Header Banner */}
      <section className="manage-masthead">
        <div className="manage-masthead-info">
          <div className="badge badge--emerald">
            <Sparkles size={13} /> CRUD Functional Dashboard
          </div>
          <h1 className="hero-title" style={{ marginTop: '6px' }}>
            Manajemen Inventaris Alat Tenda
          </h1>
          <p className="hero-subtitle">
            Halaman fungsional CRUD (Create, Read, Update, Delete) untuk mengelola katalog alat tenda, stok ketersediaan, spesifikasi teknis, dan penetapan harga.
          </p>
        </div>

        <div className="manage-masthead-actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate && onNavigate('Create')}
            title="Tambah data tenda baru (Create)"
          >
            <Plus size={16} /> Tambah Produk Baru
          </button>
          <button
            type="button"
            className="btn btn--outline"
            onClick={() => setResetModalOpen(true)}
            title="Kembalikan inventaris ke 8 produk bawaan"
          >
            <RotateCcw size={15} /> Reset Bawaan
          </button>
        </div>
      </section>

      {/* Feedback Toast */}
      {feedback && (
        <div className="toast toast--success" role="alert">
          <CheckCircle size={18} /> {feedback}
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="manage-stats-grid">
        <div className="manage-stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald)' }}>
            <Layers size={22} />
          </div>
          <div>
            <div className="stat-card-value">{stats.totalItems} Produk</div>
            <div className="stat-card-label">Total Katalog Terdaftar</div>
          </div>
        </div>

        <div className="manage-stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#38bdf8' }}>
            <Package size={22} />
          </div>
          <div>
            <div className="stat-card-value">{stats.totalUnits} Unit</div>
            <div className="stat-card-label">Total Unit Fisik Tersedia</div>
          </div>
        </div>

        <div className="manage-stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--amber)' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="stat-card-value">{stats.lowStockCount} Item</div>
            <div className="stat-card-label">Peringatan Stok Rendah (&le;3)</div>
          </div>
        </div>

        <div className="manage-stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(147, 51, 234, 0.15)', color: '#c084fc' }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div className="stat-card-value">{formatRupiah(stats.totalValue)}</div>
            <div className="stat-card-label">Estimasi Valuasi Stok</div>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="manage-toolbar">
        <div className="search-box" style={{ maxWidth: '380px' }}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari berdasarkan nama, kategori, kapasitas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="manage-toolbar-right">
          <select
            className="sort-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">Semua Kategori</option>
            <option value="Tenda Dome">Tenda Dome</option>
            <option value="Tenda Tunnel & Family">Tenda Tunnel &amp; Family</option>
            <option value="Flysheet & Tarp">Flysheet &amp; Tarp</option>
            <option value="Perlengkapan & Pasak">Perlengkapan &amp; Pasak</option>
            <option value="Aksesoris & Comfort">Aksesoris &amp; Comfort</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-responsive">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Produk Alat Tenda</th>
              <th>Kategori</th>
              <th>Kapasitas</th>
              <th>Waterproof</th>
              <th>Harga</th>
              <th>Stok</th>
              <th style={{ textAlign: 'right' }}>Aksi CRUD</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px' }}>
                  Tidak ada data yang sesuai dengan pencarian Anda.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="table-product-cell">
                      <img
                        src={item.image || '/tents/dome.svg'}
                        alt={item.name}
                        className="table-product-thumb"
                        onError={(e) => {
                          e.currentTarget.src = '/tents/dome.svg'
                        }}
                      />
                      <div>
                        <div className="table-product-name">{item.name}</div>
                        <div className="table-product-id">ID: {item.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--category">{item.category}</span>
                  </td>
                  <td>{item.capacity}</td>
                  <td>
                    <span className="waterproof-pill">{item.waterproofRating}</span>
                  </td>
                  <td>
                    <strong>{formatRupiah(item.price)}</strong>
                  </td>
                  <td>
                    <span
                      className={`stock-badge ${
                        item.stock <= 3
                          ? 'stock-badge--low'
                          : item.stock === 0
                          ? 'stock-badge--empty'
                          : 'stock-badge--good'
                      }`}
                    >
                      {item.stock} unit
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn btn--outline btn--xs"
                        onClick={() => setSelectedTent(item)}
                        title="Lihat Detail (Read)"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--xs"
                        onClick={() => onNavigate && onNavigate('Edit', item)}
                        title="Edit Data (Update)"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn--outline btn--danger-subtle btn--xs"
                        onClick={() => setDeleteTarget(item)}
                        title="Hapus Produk (Delete)"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedTent && (
        <TentDetailModal
          tent={selectedTent}
          onClose={() => setSelectedTent(null)}
          onEdit={(t) => onNavigate && onNavigate('Edit', t)}
          onDelete={(t) => setDeleteTarget(t)}
        />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Produk dari Database"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}"? Tindakan ini langsung menghapus data dari penyimpanan lokal perangkat.`}
        confirmLabel="Hapus Permanen"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        open={resetModalOpen}
        title="Reset Seluruh Inventaris ke Bawaan"
        message="Tindakan ini akan mengembalikan data alat tenda ke 8 produk bawaan awal. Seluruh data kustom yang Anda tambahkan akan diatur ulang."
        confirmLabel="Reset Sekarang"
        danger
        onConfirm={handleResetInventory}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  )
}
