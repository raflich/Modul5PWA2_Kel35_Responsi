import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import { CATEGORIES } from '../../data/tents'

export default function AdvancedFilter({
  search,
  onSearch,
  category,
  onCategory,
  sortKey,
  sortOrder,
  onSort,
  totalResults,
}) {
  const isFiltered = search.trim() !== '' || category !== 'All'

  const handleClearFilters = () => {
    onSearch('')
    onCategory('All')
    onSort({ key: 'name', order: 'asc' })
  }

  const sortValue = `${sortKey}-${sortOrder}`

  const handleSortChange = (e) => {
    const val = e.target.value
    const [key, order] = val.split('-')
    onSort({ key, order })
  }

  return (
    <div className="filter-panel">
      {/* Search Bar & Sort Row */}
      <div className="filter-top-row">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Cari tenda, kapasitas (misal: 4 orang), flysheet, pasak..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearch('')}
              aria-label="Hapus pencarian"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="sort-box">
          <ArrowUpDown size={16} className="sort-icon" />
          <select
            className="sort-select"
            value={sortValue}
            onChange={handleSortChange}
            aria-label="Urutkan produk"
          >
            <option value="name-asc">Nama (A - Z)</option>
            <option value="name-desc">Nama (Z - A)</option>
            <option value="price-asc">Harga: Termurah</option>
            <option value="price-desc">Harga: Tertinggi</option>
            <option value="rating-desc">Rating: Tertinggi</option>
            <option value="stock-desc">Stok: Terbanyak</option>
          </select>
        </div>
      </div>

      {/* Category Pills Row */}
      <div className="filter-bottom-row">
        <div className="category-pills">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${category === cat ? 'category-pill--active' : ''}`}
              onClick={() => onCategory(cat)}
            >
              {cat === 'All' ? 'Semua Produk' : cat}
            </button>
          ))}
        </div>

        <div className="filter-summary">
          <span className="filter-count">
            Ditemukan <strong>{totalResults}</strong> alat tenda
          </span>
          {isFiltered && (
            <button
              type="button"
              className="btn-link"
              onClick={handleClearFilters}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
