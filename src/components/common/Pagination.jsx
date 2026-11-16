import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }

  return (
    <nav className="pagination" aria-label="Navigasi Halaman">
      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft size={16} /> Sebelumnya
      </button>

      <div className="pagination-pages">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`pagination-num ${currentPage === p ? 'pagination-num--active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={currentPage === p ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        className="pagination-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Halaman berikutnya"
      >
        Berikutnya <ChevronRight size={16} />
      </button>
    </nav>
  )
}

