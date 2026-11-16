import { useState } from 'react'
import {
  User,
  GraduationCap,
  Copy,
  Check,
  Edit3,
  Shield,
  Layers,
  Heart,
  FileText,
  Database,
  RotateCcw,
  Sparkles,
  Wifi,
  X,
  Camera,
  Trash2,
  ArrowRight,
  BookOpen,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import { useTents } from '../hooks/useTents'
import { useAuth } from '../hooks/useAuth'
import LoginModal from '../components/modals/LoginModal'
import queryCache from '../utils/queryCache'
import {
  getAllDrafts,
  deleteDraft,
  clearAllDrafts,
  formatDraftTime,
} from '../utils/draftStorage'

export default function ProfilePage({ onNavigate }) {
  const [profile, setProfile] = useState(() => userService.getUserProfile())
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [drafts, setDrafts] = useState(() => getAllDrafts())

  const { tents } = useTents()
  const { count: favCount } = useFavorites()
  const { user: authUser, isAdmin, logout } = useAuth()
  const [cacheCount, setCacheCount] = useState(() => queryCache.getCount())
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editName, setEditName] = useState(profile.name)
  const [editNim, setEditNim] = useState(profile.nim)
  const [editKelompok, setEditKelompok] = useState(profile.kelompok)
  const [editProdi, setEditProdi] = useState(profile.prodi)
  const [editBio, setEditBio] = useState(profile.bio)

  const handleCopyNim = () => {
    navigator.clipboard.writeText(profile.nim)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenEdit = () => {
    setEditName(profile.name)
    setEditNim(profile.nim)
    setEditKelompok(profile.kelompok)
    setEditProdi(profile.prodi)
    setEditBio(profile.bio)
    setIsEditOpen(true)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    const updated = {
      ...profile,
      name: editName.trim() || 'Muhammad Rafli Buchori',
      nim: editNim.trim() || '21120124130095',
      kelompok: editKelompok.trim() || 'Kelompok 35',
      prodi: editProdi.trim() || 'Teknik Komputer',
      bio: editBio.trim(),
    }
    const res = userService.saveUserProfile(updated)
    if (res.success) {
      setProfile(res.data)
      setIsEditOpen(false)
      setFeedback('Profil identitas berhasil diperbarui.')
      setTimeout(() => setFeedback(''), 3000)
    }
  }

  const handleResetProfile = () => {
    const res = userService.resetUserProfile()
    setProfile(res)
    setFeedback('Profil dikembalikan ke data identitas bawaan.')
    setTimeout(() => setFeedback(''), 3000)
  }

  const handleClearCache = () => {
    queryCache.clear()
    setCacheCount(0)
    setFeedback('Cache penyimpanan lokal berhasil dikosongkan.')
    setTimeout(() => setFeedback(''), 3000)
  }

  const handleDeleteDraft = (id) => {
    deleteDraft(id)
    setDrafts(getAllDrafts())
    setFeedback('Draft formulir dihapus.')
    setTimeout(() => setFeedback(''), 2000)
  }

  const handleClearAllDrafts = () => {
    clearAllDrafts()
    setDrafts([])
    setFeedback('Seluruh draft formulir dihapus.')
    setTimeout(() => setFeedback(''), 2000)
  }

  return (
    <div className="profile-page">
      {/* Page Header */}
      <section className="profile-masthead">
        <div>
          <div className="badge badge--emerald">
            <GraduationCap size={14} /> Identitas Praktikan &amp; Sistem
          </div>
          <h1 className="hero-title" style={{ marginTop: '8px' }}>
            Profil Mahasiswa &amp; Pengembang PWA
          </h1>
          <p className="hero-subtitle">
            Halaman profil terverifikasi praktikum Pemrograman Perangkat Bergerak (PPB) Modul 5 dengan spesifikasi PWA lengkap.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isAdmin ? (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => {
                logout()
                setFeedback('Berhasil keluar dari mode Admin.')
                setTimeout(() => setFeedback(''), 3000)
              }}
              title="Keluar dari mode admin"
            >
              <LogOut size={14} /> Logout Admin
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setLoginModalOpen(true)}
              title="Masuk sebagai Admin Toko"
            >
              <LogIn size={14} /> Login Admin
            </button>
          )}
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handleOpenEdit}
          >
            <Edit3 size={14} /> Ubah Profil
          </button>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={handleResetProfile}
            title="Reset ke data mahasiswa awal"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </section>

      {/* Feedback Toast */}
      {feedback && (
        <div className="toast toast--success" role="alert">
          <Check size={18} /> {feedback}
        </div>
      )}

      {/* Main Student Identity Card */}
      <div className="student-profile-card">
        <div className="profile-top-flex">
          {/* Avatar Graphic */}
          <div className="student-avatar-wrap">
            <div className="student-avatar-circle">
              <span className="avatar-initials">MRB</span>
            </div>
            <span className="verified-badge" title="Identitas Praktikan Terverifikasi">
              <Check size={14} />
            </span>
          </div>

          {/* Student Info Details */}
          <div className="student-info-main">
            <div className="student-name-row" style={{ flexWrap: 'wrap', gap: '8px' }}>
              <h2 className="student-display-name">{profile.name}</h2>
              <span className="badge badge--kelompok">{profile.kelompok}</span>
              {isAdmin ? (
                <span className="badge badge--emerald" style={{ fontWeight: 700 }}>
                  🛡️ Role: Admin (@{authUser.username || 'rafli'})
                </span>
              ) : (
                <span
                  className="badge"
                  style={{
                    fontWeight: 600,
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  👤 Role: Mode Pengunjung
                </span>
              )}
            </div>

            <div className="student-nim-row">
              <span className="nim-label">NIM:</span>
              <span className="nim-value">{profile.nim}</span>
              <button
                type="button"
                className="icon-btn"
                onClick={handleCopyNim}
                title="Salin NIM ke clipboard"
                aria-label="Salin NIM"
              >
                {copied ? <Check size={14} color="var(--emerald)" /> : <Copy size={14} />}
              </button>
              {copied && <span className="copied-tooltip">NIM Disalin!</span>}
            </div>

            <div className="student-meta-list">
              <div className="meta-badge-item">
                <GraduationCap size={15} />
                <span>{profile.prodi} — {profile.universitas}</span>
              </div>
              <div className="meta-badge-item">
                <BookOpen size={15} />
                <span>{profile.mataKuliah} ({profile.modul})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio / Armorer Notes */}
        <div className="student-bio-box">
          <span className="bio-label">Catatan Pengembang &amp; Minat Teknis</span>
          <p className="bio-text">{profile.bio}</p>
        </div>

        {/* Stats Grid */}
        <div className="profile-stats-grid">
          <div
            className="profile-stat-box"
            onClick={() => onNavigate && onNavigate('Catalog')}
            style={{ cursor: 'pointer' }}
          >
            <Layers size={22} className="profile-stat-icon" />
            <div className="profile-stat-val">{tents.length}</div>
            <div className="profile-stat-lbl">Katalog Alat Tenda</div>
          </div>

          <div
            className="profile-stat-box"
            onClick={() => onNavigate && onNavigate('Favorites')}
            style={{ cursor: 'pointer' }}
          >
            <Heart size={22} className="profile-stat-icon" />
            <div className="profile-stat-val">{favCount}</div>
            <div className="profile-stat-lbl">Daftar Favorit</div>
          </div>

          <div className="profile-stat-box">
            <FileText size={22} className="profile-stat-icon" />
            <div className="profile-stat-val">{drafts.length}</div>
            <div className="profile-stat-lbl">Draft Offline Form</div>
          </div>

          <div className="profile-stat-box">
            <Database size={22} className="profile-stat-icon" />
            <div className="profile-stat-val">{cacheCount}</div>
            <div className="profile-stat-lbl">Kueri Ter-cache</div>
          </div>
        </div>
      </div>

      {/* Section 2: Saved Offline Drafts */}
      <section className="profile-section">
        <div className="section-header-flex">
          <div>
            <h2 className="section-title">Draft Formulir Tersimpan (Offline Auto-Save)</h2>
            <p className="section-subtitle">
              Setiap kali Anda mengisi atau mengedit produk tenda, formulir disimpan otomatis di localStorage agar tidak hilang saat koneksi terputus.
            </p>
          </div>
          {drafts.length > 0 && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleClearAllDrafts}
            >
              Hapus Semua Draft
            </button>
          )}
        </div>

        {drafts.length === 0 ? (
          <div className="state-box" style={{ minHeight: '160px', padding: '24px' }}>
            <FileText size={32} stroke="var(--steel)" />
            <p style={{ margin: '8px 0 0', color: 'var(--steel)' }}>
              Tidak ada draft tertunda. Seluruh formulir tersimpan rapi.
            </p>
          </div>
        ) : (
          <div className="drafts-grid">
            {drafts.map((draft) => {
              const d = draft.data?.formData || {}
              const isCreate = draft.id === 'create_product'
              return (
                <div key={draft.id} className="draft-card">
                  <div className="draft-card-header">
                    <span className="badge badge--category">
                      {isCreate ? 'DRAFT TAMBAH BARU' : 'DRAFT UBAH PRODUK'}
                    </span>
                    <span className="draft-time">{formatDraftTime(draft.savedAt)}</span>
                  </div>
                  <h4 className="draft-title">{d.name || 'Alat Tenda Tanpa Judul'}</h4>
                  <p className="draft-category">
                    {d.category || 'Tenda'} • {d.capacity || 'Kapasitas'}
                  </p>
                  <div className="draft-actions">
                    <button
                      type="button"
                      className="btn btn--primary btn--xs"
                      onClick={() => onNavigate && onNavigate(isCreate ? 'Create' : 'Manage')}
                    >
                      <ArrowRight size={13} /> Lanjutkan Draft
                    </button>
                    <button
                      type="button"
                      className="icon-btn btn--danger-subtle"
                      onClick={() => handleDeleteDraft(draft.id)}
                      title="Hapus draft"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Section 3: Technical & PWA Specifications */}
      <section className="profile-section">
        <h2 className="section-title">Informasi Arsitektur Teknis PWA</h2>
        <div className="tech-specs-grid">
          <div className="tech-spec-card">
            <h4>Progressive Web App</h4>
            <p>Mendukung instalasi standalone (Add to Home Screen) pada Android, iOS, Windows, dan MacOS.</p>
            <span className="badge badge--emerald">Service Worker Active</span>
          </div>

          <div className="tech-spec-card">
            <h4>Caching Strategy</h4>
            <p>Workbox runtime caching: NetworkFirst untuk query API dan CacheFirst untuk seluruh aset gambar dan vektor.</p>
            <span className="badge badge--neutral">Offline Precaching</span>
          </div>

          <div className="tech-spec-card">
            <h4>Penyimpanan Data</h4>
            <p>Dual-tier architecture menggunakan In-Memory Cache dan persistent LocalStorage dengan validasi schema.</p>
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={handleClearCache}
              style={{ marginTop: '8px' }}
            >
              <RotateCcw size={12} /> Bersihkan Cache
            </button>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditOpen(false)}>
          <div
            className="modal-box modal-box--profile"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="edit-profile-title" className="modal-title">
                Ubah Profil Identitas Praktikan
              </h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsEditOpen(false)}
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">Nama Mahasiswa</label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-nim">NIM Mahasiswa</label>
                <input
                  id="edit-nim"
                  type="text"
                  className="form-input"
                  value={editNim}
                  onChange={(e) => setEditNim(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-kelompok">Kelompok Praktikum</label>
                <input
                  id="edit-kelompok"
                  type="text"
                  className="form-input"
                  value={editKelompok}
                  onChange={(e) => setEditKelompok(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-prodi">Program Studi</label>
                <input
                  id="edit-prodi"
                  type="text"
                  className="form-input"
                  value={editProdi}
                  onChange={(e) => setEditProdi(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-bio">Catatan Bio Pengembang</label>
                <textarea
                  id="edit-bio"
                  rows={3}
                  className="form-textarea"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setIsEditOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  )
}

