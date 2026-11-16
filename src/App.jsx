import { useState, useEffect, lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PWABadge from './components/PWABadge.jsx'
import { RefreshCw } from 'lucide-react'
import './App.css'

// ---------------------------------------------------------------------------
// Lazy-Loaded Page Components (Code Splitting / Dynamic Chunking)
// ---------------------------------------------------------------------------
const Catalog = lazy(() => import('./pages/Catalog.jsx'))
const ManagePage = lazy(() => import('./pages/ManagePage.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const GuidePage = lazy(() => import('./pages/GuidePage.jsx'))
const ProductFormPage = lazy(() => import('./pages/ProductFormPage.jsx'))
const TentDetailModal = lazy(() => import('./components/tent/TentDetailModal.jsx'))

function PageFallback() {
  return (
    <div className="state-box" style={{ minHeight: '360px', margin: '2rem 0' }} role="status" aria-live="polite">
      <RefreshCw size={32} className="spin" color="var(--emerald)" />
      <p style={{ marginTop: '1rem', color: 'var(--steel)' }}>Memuat halaman TentCraft…</p>
    </div>
  )
}

function App() {
  // Read initial query params (?tab=..., ?tent=...)
  const [initialParams] = useState(() => {
    if (typeof window === 'undefined') return { tab: 'Catalog', tentId: null }
    const urlParams = new URLSearchParams(window.location.search)
    return {
      tab: urlParams.get('tab') || 'Catalog',
      tentId: urlParams.get('tent') || null,
    }
  })

  const [tab, setTab] = useState(() => initialParams.tab || 'Catalog')
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit'
  const [editingTent, setEditingTent] = useState(null)
  const [deepLinkedTentId, setDeepLinkedTentId] = useState(() => initialParams.tentId)

  // Listen for browser back / forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search)
      const tabParam = p.get('tab') || 'Catalog'
      const tentParam = p.get('tent')
      setTab(tabParam)
      setDeepLinkedTentId(tentParam)
      setMode('list')
      setEditingTent(null)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Centralized navigation handler
  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      setEditingTent(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingTent(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Tab change
      setTab(target)
      setMode('list')
      setEditingTent(null)

      const url = new URL(window.location.href)
      url.searchParams.set('tab', target)
      url.searchParams.delete('tent')
      window.history.pushState(null, '', url.toString())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setMode('list')
    setEditingTent(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="shell">
      <Header
        activeTab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
      />

      <main className="main-content">
        <Suspense fallback={<PageFallback />}>
          {/* Sub-page view: CREATE */}
          {mode === 'create' && (
            <ProductFormPage
              isEdit={false}
              onBack={handleBackToList}
              onSuccess={() => {
                handleBackToList()
                handleNavigate('Manage')
              }}
            />
          )}

          {/* Sub-page view: EDIT */}
          {mode === 'edit' && editingTent && (
            <ProductFormPage
              tent={editingTent}
              isEdit={true}
              onBack={handleBackToList}
              onSuccess={() => {
                handleBackToList()
                handleNavigate('Manage')
              }}
            />
          )}

          {/* Top-Level Tabs */}
          {mode === 'list' && (
            <>
              {tab === 'Catalog' && (
                <Catalog
                  onNavigate={handleNavigate}
                  initialTentId={deepLinkedTentId}
                />
              )}

              {tab === 'Manage' && (
                <ManagePage
                  onNavigate={handleNavigate}
                />
              )}

              {tab === 'Favorites' && (
                <FavoritesPage
                  onSelectTent={(tent) => {
                    handleNavigate('Catalog')
                    setDeepLinkedTentId(tent.id)
                  }}
                  onNavigateCatalog={() => handleNavigate('Catalog')}
                />
              )}

              {tab === 'Profile' && (
                <ProfilePage
                  onNavigate={handleNavigate}
                />
              )}

              {tab === 'Guide' && (
                <GuidePage />
              )}
            </>
          )}
        </Suspense>
      </main>

      {/* PWA Installation & Offline State Prompt */}
      <PWABadge />

      {/* Footer */}
      <Footer onNavigateTab={(targetTab) => handleNavigate(targetTab)} />
    </div>
  )
}

export default App
