import { useState, useMemo, useEffect } from 'react'
import { Plus, RefreshCw, AlertCircle, Sparkles, Compass, Tent } from 'lucide-react'
import { useTents } from '../hooks/useTents'
import TentCard from '../components/tent/TentCard'
import AdvancedFilter from '../components/common/AdvancedFilter'
import Pagination from '../components/common/Pagination'
import TentDetailModal from '../components/tent/TentDetailModal'
import ConfirmModal from '../components/modals/ConfirmModal'
import tentService from '../services/tentService'

export default function Catalog({ onNavigate, initialTentId }) {
  const { tents, loading, error, refetch } = useTents()

  // Filters & Sorting state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  // Pagination
  const ITEMS_PER_PAGE = 6
  const [currentPage, setCurrentPage] = useState(1)

  // Selected tent for Detail Modal
  const [selectedTent, setSelectedTent] = useState(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  // Handle deep-linked tent from URL query (?tent=...)
  useEffect(() => {
    if (initialTentId && tents.length > 0) {
      const match = tents.find((t) => String(t.id) === String(initialTentId))
      if (match) setSelectedTent(match)
    }
  }, [initialTentId, tents])

  const handleSearch = (val) => {
    setSearch(val)
    setCurrentPage(1)
  }

  const handleCategory = (val) => {
    setCategory(val)
    setCurrentPage(1)
  }

  const handleSort = ({ key, order }) => {
    setSortKey(key)
    setSortOrder(order)
    setCurrentPage(1)
  }

  // Filtered & Sorted items
  const filteredTents = useMemo(() => {
    let result = tents.filter((t) => {
      const matchesText =
        !search ||
        (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.capacity || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.waterproofRating || '').toLowerCase().includes(search.toLowerCase())

      const matchesCat = category === 'All' || t.category === category
      return matchesText && matchesCat
    })

    return result.sort((a, b) => {
      let aVal = a[sortKey]
      let bVal = b[sortKey]

      if (sortKey === 'price' || sortKey === 'rating' || sortKey === 'stock') {
        aVal = Number(aVal) || 0
        bVal = Number(bVal) || 0
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal || '').toLowerCase()
      const bStr = String(bVal || '').toLowerCase()
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [tents, search, category, sortKey, sortOrder])

  // Pagination slice
  const totalPages = Math.ceil(filteredTents.length / ITEMS_PER_PAGE) || 1
  const validPage = Math.min(Math.max(1, currentPage), totalPages)
  const paginatedTents = useMemo(() => {
    const startIndex = (validPage - 1) * ITEMS_PER_PAGE
    return filteredTents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredTents, validPage])

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await tentService.deleteTent(deleteTarget.id)
      setToastMsg(`Produk "${deleteTarget.name}" berhasil dihapus.`)
      setTimeout(() => setToastMsg(''), 3000)
      setDeleteTarget(null)
      if (selectedTent?.id === deleteTarget.id) {
        setSelectedTent(null)
      }
    } catch (err) {
      alert(err.message || 'Gagal menghapus produk.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="catalog-page">
      {/* Hero Masthead */}
      <section className="catalog-hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} /> PWA Storefront — Alat Tenda &amp; Camping
          </div>
          <h1 className="hero-title">
            Jelajahi Alat Tenda Terbaik untuk Petualangan Anda
          </h1>
          <p className="hero-subtitle">
            Katalog lengkap tenda dome ultralight, tunnel family tent, flysheet anti-badai, pasak titanium, dan perlengkapan camping berstandar pendakian gunung.
          </p>

          <div className="hero-stats-row">
            <div className="hero-stat">
              <span className="hero-stat-num">{tents.length}</span>
              <span className="hero-stat-lbl">Pilihan Alat</span>
            </div>
            <div className="hero-stat-sep">/</div>
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-lbl">Bekerja Offline</span>
            </div>
            <div className="hero-stat-sep">/</div>
            <div className="hero-stat">
              <span className="hero-stat-num">PU 5000</span>
              <span className="hero-stat-lbl">Max Waterproof</span>
            </div>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="toast toast--success" role="alert">
          {toastMsg}
        </div>
      )}

      {/* Advanced Filter Toolbar */}
      <AdvancedFilter
        search={search}
        onSearch={handleSearch}
        category={category}
        onCategory={handleCategory}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        totalResults={filteredTents.length}
      />

      {/* Product Grid Area */}
      {loading ? (
        <div className="state-box" style={{ minHeight: '300px' }} role="status">
          <RefreshCw size={32} className="spin" />
          <p style={{ marginTop: '12px' }}>Memuat katalog alat tenda…</p>
        </div>
      ) : error ? (
        <div className="state-box state-box--error" role="alert">
          <AlertCircle size={36} color="var(--rose)" />
          <h3>Terjadi Kesalahan</h3>
          <p>{error}</p>
          <button type="button" className="btn btn--outline btn--sm" onClick={refetch}>
            Coba Lagi
          </button>
        </div>
      ) : filteredTents.length === 0 ? (
        <div className="state-box state-empty" style={{ minHeight: '320px' }}>
          <Tent size={48} stroke="var(--emerald)" opacity={0.6} />
          <h3>Tidak Ada Alat Tenda yang Cocok</h3>
          <p className="lede">
            Tidak ditemukan produk dengan kata kunci &ldquo;{search}&rdquo; pada kategori &ldquo;{category}&rdquo;.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                setSearch('')
                setCategory('All')
              }}
            >
              Reset Filter Pencarian
            </button>
            {onNavigate && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={() => onNavigate('Create')}
              >
                <Plus size={14} /> Tambah Produk Baru
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="tents-grid">
            {paginatedTents.map((tent) => (
              <TentCard
                key={tent.id}
                tent={tent}
                onSelect={(t) => setSelectedTent(t)}
                onEdit={(t) => onNavigate && onNavigate('Edit', t)}
                onDelete={(t) => setDeleteTarget(t)}
                showManageActions={false}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={validPage}
            totalPages={totalPages}
            onPageChange={(p) => {
              setCurrentPage(p)
              window.scrollTo({ top: 350, behavior: 'smooth' })
            }}
          />
        </>
      )}

      {/* Tent Detail Modal */}
      {selectedTent && (
        <TentDetailModal
          tent={selectedTent}
          onClose={() => setSelectedTent(null)}
          onEdit={(t) => onNavigate && onNavigate('Edit', t)}
          onDelete={(t) => setDeleteTarget(t)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Produk Alat Tenda"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}" dari katalog? Tindakan ini dapat dibatalkan melalui reset data.`}
        confirmLabel="Hapus Produk"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
