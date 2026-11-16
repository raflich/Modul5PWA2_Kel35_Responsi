import { useState } from 'react'
import {
  Compass,
  Tent,
  Heart,
  User,
  Plus,
  BookOpen,
  Menu,
  X,
  Settings2,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Katalog', icon: Tent },
  { id: 'Manage', label: 'Kelola CRUD', icon: Settings2 },
  { id: 'Favorites', label: 'Favorit', icon: Heart, badgeKey: 'fav' },
  { id: 'Profile', label: 'Profil Mahasiswa', icon: User },
  { id: 'Guide', label: 'Panduan & Info', icon: BookOpen },
]

export default function Header({ activeTab, onTab, onNavigateCreate }) {
  const { count: favCount } = useFavorites()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (tabId) => {
    onTab(tabId)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="header">
      <div className="header-inner">
        {/* Brand & Logo */}
        <div
          className="header-brand"
          onClick={() => handleNavClick('Catalog')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleNavClick('Catalog')
          }}
        >
          <div className="header-logo-icon">
            <img src="/icon.svg" alt="TentCraft Logo" className="logo-img" />
          </div>
          <div className="header-brand-text">
            <span className="brand-name">TentCraft</span>
            <span className="brand-sub">Toko &amp; Rental Tenda Outdoor</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Navigasi Utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badgeKey === 'fav' && favCount > 0 && (
                  <span className="nav-badge">{favCount}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* Action Header Button & Mobile Toggle */}
        <div className="header-actions">
          {onNavigateCreate && (
            <button
              type="button"
              className="btn btn--primary btn--sm header-cta"
              onClick={() => {
                onNavigateCreate()
                setMobileMenuOpen(false)
              }}
              title="Tambah alat tenda baru (CRUD Create)"
            >
              <Plus size={16} />
              <span>Tambah Tenda</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="icon-btn mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer" role="dialog" aria-modal="true">
          <div className="mobile-drawer-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mobile-nav-link ${isActive ? 'mobile-nav-link--active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                  {item.badgeKey === 'fav' && favCount > 0 && (
                    <span className="nav-badge">{favCount}</span>
                  )}
                </button>
              )
            })}
            {onNavigateCreate && (
              <button
                type="button"
                className="btn btn--primary mobile-drawer-cta"
                onClick={() => {
                  onNavigateCreate()
                  setMobileMenuOpen(false)
                }}
              >
                <Plus size={16} /> Tambah Produk Baru
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
