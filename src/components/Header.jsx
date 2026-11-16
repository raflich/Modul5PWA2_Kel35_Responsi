import { useState } from 'react'
import {
  Tent,
  Heart,
  User,
  Plus,
  BookOpen,
  Menu,
  X,
  Settings2,
  LogIn,
  LogOut,
  ShieldCheck,
  Lock,
} from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useAuth } from '../hooks/useAuth'
import LoginModal from './modals/LoginModal'

export default function Header({ activeTab, onTab, onNavigateCreate }) {
  const { count: favCount } = useFavorites()
  const { user, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const navItems = [
    { id: 'Catalog', label: 'Katalog', icon: Tent },
    {
      id: 'Manage',
      label: 'Kelola CRUD',
      icon: Settings2,
      adminOnly: true,
    },
    { id: 'Favorites', label: 'Favorit', icon: Heart, badgeKey: 'fav' },
    { id: 'Profile', label: 'Profil Mahasiswa', icon: User },
    { id: 'Guide', label: 'Panduan & Info', icon: BookOpen },
  ]

  const handleNavClick = (tabId, itemAdminOnly) => {
    if (itemAdminOnly && !isAdmin) {
      // Jika pengunjung mengklik tab Kelola CRUD, buka dialog Login Admin
      setLoginModalOpen(true)
      setMobileMenuOpen(false)
      return
    }
    onTab(tabId)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
    // Jika sedang di halaman admin (Manage), kembalikan ke Katalog
    if (activeTab === 'Manage') {
      onTab('Catalog')
    }
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          {/* Brand & Logo */}
          <div
            className="header-brand"
            onClick={() => handleNavClick('Catalog', false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleNavClick('Catalog', false)
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
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              const isLocked = item.adminOnly && !isAdmin

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-link ${isActive ? 'nav-link--active' : ''}`}
                  onClick={() => handleNavClick(item.id, item.adminOnly)}
                  title={isLocked ? 'Khusus Admin (Klik untuk Login)' : item.label}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {isLocked && <Lock size={12} style={{ opacity: 0.6, marginLeft: '2px' }} />}
                  {item.badgeKey === 'fav' && favCount > 0 && (
                    <span className="nav-badge">{favCount}</span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Action Header Button & Auth Status */}
          <div className="header-actions">
            {isAdmin ? (
              <>
                <span className="role-pill role-pill--admin" title="Role Admin aktif">
                  <ShieldCheck size={14} />
                  <span>Admin (@{user.username || 'rafli'})</span>
                </span>

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

                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={handleLogout}
                  title="Keluar dari akun Admin"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <span className="role-pill role-pill--customer" title="Mode Pengunjung">
                  <User size={13} />
                  <span>Pengunjung</span>
                </span>

                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  onClick={() => setLoginModalOpen(true)}
                  title="Masuk sebagai Admin Toko"
                >
                  <LogIn size={15} />
                  <span>Login Admin</span>
                </button>
              </>
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
              {/* Role Status on Mobile */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  marginBottom: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
                  {isAdmin ? (
                    <>
                      <ShieldCheck size={16} color="var(--emerald)" />
                      <span style={{ fontWeight: 600, color: '#047857' }}>
                        Admin (@{user.username || 'rafli'})
                      </span>
                    </>
                  ) : (
                    <>
                      <User size={16} color="#64748b" />
                      <span style={{ fontWeight: 600, color: '#475569' }}>Mode Pengunjung</span>
                    </>
                  )}
                </div>

                {isAdmin ? (
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                    onClick={handleLogout}
                  >
                    <LogOut size={12} /> Logout
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    style={{ fontSize: '0.78rem', padding: '3px 8px' }}
                    onClick={() => {
                      setMobileMenuOpen(false)
                      setLoginModalOpen(true)
                    }}
                  >
                    <LogIn size={12} /> Login
                  </button>
                )}
              </div>

              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                const isLocked = item.adminOnly && !isAdmin

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`mobile-nav-link ${isActive ? 'mobile-nav-link--active' : ''}`}
                    onClick={() => handleNavClick(item.id, item.adminOnly)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} />
                      <span>{item.label}</span>
                      {isLocked && <Lock size={13} style={{ opacity: 0.6 }} />}
                    </div>
                    {item.badgeKey === 'fav' && favCount > 0 && (
                      <span className="nav-badge">{favCount}</span>
                    )}
                  </button>
                )
              })}

              {isAdmin && onNavigateCreate && (
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

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          onTab('Manage')
        }}
      />
    </>
  )
}
