import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileText,
  RotateCcw,
  Layers,
  Sparkles,
  Lock,
  LogIn,
  UploadCloud,
  Image as ImageIcon,
  ImagePlus,
} from 'lucide-react'
import tentService from '../services/tentService'
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  formatDraftTime,
} from '../utils/draftStorage'
import { processImageFile } from '../utils/imageUpload'
import { useAuth } from '../hooks/useAuth'
import LoginModal from '../components/modals/LoginModal'

const CATEGORY_OPTIONS = [
  'Tenda Dome',
  'Tenda Tunnel & Family',
  'Flysheet & Tarp',
  'Perlengkapan & Pasak',
  'Aksesoris & Comfort',
]

const IMAGE_PRESETS = [
  { label: 'Tenda Dome', src: '/tents/dome.svg' },
  { label: 'Tenda Tunnel', src: '/tents/tunnel.svg' },
  { label: 'Tenda Family Villa', src: '/tents/family.svg' },
  { label: 'Flysheet Kanopi', src: '/tents/flysheet.svg' },
  { label: 'Pasak & Palu', src: '/tents/pegs.svg' },
  { label: 'Lampu & Matras', src: '/tents/accessories.svg' },
]

export default function ProductFormPage({
  tent = null,
  isEdit = false,
  onBack,
  onSuccess,
}) {
  const { isAdmin } = useAuth()
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const draftKey = isEdit ? `edit_${tent?.id}` : 'create_product'

  const [formData, setFormData] = useState(() => {
    if (isEdit && tent) {
      return {
        name: tent.name || '',
        category: tent.category || 'Tenda Dome',
        capacity: tent.capacity || '2 Orang',
        waterproofRating: tent.waterproofRating || 'PU 3000mm',
        price: tent.price || 0,
        stock: tent.stock !== undefined ? tent.stock : 10,
        weight: tent.weight || '2.0 kg',
        description: tent.description || '',
        image: tent.image || '/tents/dome.svg',
      }
    }
    return {
      name: '',
      category: 'Tenda Dome',
      capacity: '2 Orang',
      waterproofRating: 'PU 3000mm',
      price: 500000,
      stock: 10,
      weight: '2.0 kg',
      description: '',
      image: '/tents/dome.svg',
    }
  })

  // Dynamic specifications array
  const [specs, setSpecs] = useState(() => {
    if (isEdit && tent?.specs && tent.specs.length > 0) {
      return tent.specs.map((s) => ({ name: s.name, quantity: s.quantity }))
    }
    return [
      { name: 'Bahan Outer', quantity: '210T Ripstop Polyester PU 3000mm' },
      { name: 'Bahan Inner', quantity: 'Breathable Nylon Mesh' },
      { name: 'Tiang Frame', quantity: 'Aluminium Alloy 7001' },
      { name: 'Ukuran Packing', quantity: '45 x 15 cm' },
    ]
  })

  // Dynamic features array
  const [features, setFeatures] = useState(() => {
    if (isEdit && tent?.features && tent.features.length > 0) {
      return [...tent.features]
    }
    return [
      'Waterproof seam-sealed di seluruh jahitan',
      'Pemasangan cepat dan mudah untuk pemula',
    ]
  })

  const [customImageUrl, setCustomImageUrl] = useState('')
  const [imageTab, setImageTab] = useState(() => {
    if (formData.image?.startsWith('data:image/')) return 'upload'
    if (formData.image?.startsWith('http')) return 'url'
    return 'upload'
  })
  const [uploadedImage, setUploadedImage] = useState(() => {
    return formData.image?.startsWith('data:image/') ? formData.image : ''
  })
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUploadError, setImageUploadError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploadError('')
    setUploadingImage(true)

    try {
      const res = await processImageFile(file)
      setUploadedImage(res.dataUrl)
      setUploadedFileName(`${res.name} (~${Math.round(res.size / 1024)} KB)`)
      setFormData((prev) => ({ ...prev, image: res.dataUrl }))
      setCustomImageUrl('')
    } catch (err) {
      setImageUploadError(err.message || 'Gagal memproses file gambar.')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleRemoveUploadedImage = () => {
    setUploadedImage('')
    setUploadedFileName('')
    const defaultImg =
      formData.category === 'Tenda Dome'
        ? '/tents/dome.svg'
        : formData.category === 'Tenda Tunnel & Family'
        ? '/tents/tunnel.svg'
        : formData.category === 'Flysheet & Tarp'
        ? '/tents/flysheet.svg'
        : formData.category === 'Perlengkapan & Pasak'
        ? '/tents/pegs.svg'
        : '/tents/accessories.svg'
    setFormData((prev) => ({ ...prev, image: defaultImg }))
  }

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [draftPrompt, setDraftPrompt] = useState(false)
  const [savedDraftTime, setSavedDraftTime] = useState('')

  // Check for saved draft on mount
  useEffect(() => {
    if (!isEdit && hasDraft(draftKey)) {
      const saved = loadDraft(draftKey)
      if (saved?.data) {
        setSavedDraftTime(formatDraftTime(saved.savedAt))
        setDraftPrompt(true)
      }
    }
  }, [draftKey, isEdit])

  // Auto-save draft on changes (debounced)
  const handleAutoSave = useCallback(() => {
    if (submitting) return
    const payload = { formData, specs, features }
    saveDraft(payload, draftKey)
  }, [formData, specs, features, draftKey, submitting])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 1200)
    return () => clearTimeout(timer)
  }, [handleAutoSave])

  const handleRestoreDraft = () => {
    const saved = loadDraft(draftKey)
    if (saved?.data) {
      if (saved.data.formData) setFormData(saved.data.formData)
      if (saved.data.specs) setSpecs(saved.data.specs)
      if (saved.data.features) setFeatures(saved.data.features)
      setDraftPrompt(false)
      setSuccessMsg('Draft berhasil dipulihkan!')
      setTimeout(() => setSuccessMsg(''), 2500)
    }
  }

  const handleDiscardDraft = () => {
    deleteDraft(draftKey)
    setDraftPrompt(false)
  }

  // Spec helpers
  const handleAddSpec = () => {
    setSpecs([...specs, { name: '', quantity: '' }])
  }

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs]
    updated[index][field] = value
    setSpecs(updated)
  }

  const handleRemoveSpec = (index) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  // Feature helpers
  const handleAddFeature = () => {
    setFeatures([...features, ''])
  }

  const handleFeatureChange = (index, value) => {
    const updated = [...features]
    updated[index] = value
    setFeatures(updated)
  }

  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Nama produk tenda wajib diisi.')
      return
    }

    if (Number(formData.price) <= 0) {
      setError('Harga harus lebih dari 0.')
      return
    }

    try {
      setSubmitting(true)
      const finalImage =
        imageTab === 'upload' && uploadedImage
          ? uploadedImage
          : imageTab === 'url' && customImageUrl.trim()
          ? customImageUrl.trim()
          : formData.image || '/tents/dome.svg'

      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        specs: specs.filter((s) => s.name.trim() !== ''),
        features: features.filter((f) => f.trim() !== ''),
        image: finalImage,
      }

      if (isEdit && tent?.id) {
        await tentService.updateTent(tent.id, payload)
        deleteDraft(draftKey)
        setSuccessMsg('Produk tenda berhasil diperbarui!')
      } else {
        await tentService.createTent(payload)
        deleteDraft(draftKey)
        setSuccessMsg('Produk tenda baru berhasil didaftarkan!')
      }

      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1000)
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data produk.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="product-form-page">
        <div
          className="state-box"
          style={{
            minHeight: '340px',
            textAlign: 'center',
            padding: '40px 20px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <Lock size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
            Akses Dibatasi: Khusus Admin
          </h3>
          <p style={{ color: '#64748b', margin: '8px 0 20px', fontSize: '0.92rem' }}>
            Formulir produk tenda hanya dapat diakses oleh Admin toko. Anda saat ini berada dalam
            Mode Pengunjung. Silakan login sebagai Admin untuk menambah atau mengubah produk.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button type="button" className="btn btn--outline" onClick={onBack}>
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setLoginModalOpen(true)}
            >
              <LogIn size={16} /> Login sebagai Admin
            </button>
          </div>
          <LoginModal
            isOpen={loginModalOpen}
            onClose={() => setLoginModalOpen(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="product-form-page">
      {/* Top Navigation */}
      <div className="form-header-row">
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="form-title-wrap">
          <h1 className="form-page-title">
            {isEdit ? 'Ubah Data Alat Tenda' : 'Tambah Produk Tenda Baru'}
          </h1>
          <p className="form-page-sub">
            {isEdit
              ? `Mengedit spesifikasi produk: ${tent?.name || ''}`
              : 'Daftarkan peralatan camping atau tenda baru ke dalam database katalog.'}
          </p>
        </div>
      </div>

      {/* Draft Notification Banner */}
      {draftPrompt && (
        <div className="draft-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} color="var(--emerald)" />
            <div>
              <strong>Draft Formulir Ditemukan ({savedDraftTime})</strong>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--steel)' }}>
                Terdapat perubahan formulir yang belum disimpan dari sesi sebelumnya. Apakah ingin memulihkannya?
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--primary btn--xs"
              onClick={handleRestoreDraft}
            >
              Pulihkan Draft
            </button>
            <button
              type="button"
              className="btn btn--outline btn--xs"
              onClick={handleDiscardDraft}
            >
              Abaikan
            </button>
          </div>
        </div>
      )}

      {/* Success & Error Toasts */}
      {successMsg && (
        <div className="toast toast--success">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {error && (
        <div className="toast toast--danger">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="crud-form">
        {/* Section 1: Basic Information */}
        <section className="form-card">
          <h2 className="form-section-title">Informasi Dasar Produk</h2>
          <div className="form-grid-2">
            <div className="form-group full-col">
              <label className="form-label" htmlFor="tent-name">
                Nama Produk Tenda / Alat <span className="req">*</span>
              </label>
              <input
                id="tent-name"
                type="text"
                className="form-input"
                placeholder="Contoh: Naturehike Cloud Up 2 Pro Ultralight"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tent-category">
                Kategori Alat <span className="req">*</span>
              </label>
              <select
                id="tent-category"
                className="form-select"
                value={formData.category}
                onChange={(e) => {
                  const cat = e.target.value
                  let defaultImg = formData.image
                  if (cat === 'Tenda Dome') defaultImg = '/tents/dome.svg'
                  if (cat === 'Tenda Tunnel & Family') defaultImg = '/tents/tunnel.svg'
                  if (cat === 'Flysheet & Tarp') defaultImg = '/tents/flysheet.svg'
                  if (cat === 'Perlengkapan & Pasak') defaultImg = '/tents/pegs.svg'
                  if (cat === 'Aksesoris & Comfort') defaultImg = '/tents/accessories.svg'
                  setFormData({ ...formData, category: cat, image: defaultImg })
                }}
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tent-capacity">
                Kapasitas / Ukuran
              </label>
              <input
                id="tent-capacity"
                type="text"
                className="form-input"
                placeholder="Contoh: 2 Orang, 4 Orang, 6-8 Orang"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tent-price">
                Harga Retail (IDR) <span className="req">*</span>
              </label>
              <input
                id="tent-price"
                type="number"
                min="0"
                step="5000"
                className="form-input"
                placeholder="Contoh: 1450000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tent-stock">
                Jumlah Stok Fisik <span className="req">*</span>
              </label>
              <input
                id="tent-stock"
                type="number"
                min="0"
                className="form-input"
                placeholder="Contoh: 15"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tent-waterproof">
                Tingkat Waterproof (PU Rating)
              </label>
              <input
                id="tent-waterproof"
                type="text"
                className="form-input"
                placeholder="Contoh: PU 4000mm, PU 3000mm, IPX6"
                value={formData.waterproofRating}
                onChange={(e) =>
                  setFormData({ ...formData, waterproofRating: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="tent-weight">
                Bobot Total / Berat Packing
              </label>
              <input
                id="tent-weight"
                type="text"
                className="form-input"
                placeholder="Contoh: 1.7 kg, 9.8 kg, 450 g"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>

            <div className="form-group full-col">
              <label className="form-label" htmlFor="tent-desc">
                Deskripsi Lengkap Produk
              </label>
              <textarea
                id="tent-desc"
                rows={3}
                className="form-textarea"
                placeholder="Jelaskan karakteristik, keunggulan tenda, penggunaan ideal (gunung tinggi, camping keluarga, atau bivak ultralight)..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        </section>

        {/* Section 2: Visual Image Selection & Upload */}
        <section className="form-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div>
              <h2 className="form-section-title" style={{ margin: 0 }}>
                Gambar &amp; Visual Produk
              </h2>
              <p className="form-card-sub" style={{ margin: '4px 0 0' }}>
                Unggah foto tenda (format <strong>PNG</strong> atau <strong>JPG/JPEG</strong>) atau gunakan ikon bawaan.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className={`btn btn--sm ${imageTab === 'upload' ? 'btn--primary' : 'btn--outline'}`}
                style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                onClick={() => setImageTab('upload')}
              >
                <UploadCloud size={14} /> Upload PNG / JPG
              </button>
              <button
                type="button"
                className={`btn btn--sm ${imageTab === 'preset' ? 'btn--primary' : 'btn--outline'}`}
                style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                onClick={() => setImageTab('preset')}
              >
                <ImageIcon size={14} /> Ikon Vektor
              </button>
              <button
                type="button"
                className={`btn btn--sm ${imageTab === 'url' ? 'btn--primary' : 'btn--outline'}`}
                style={{ fontSize: '0.8rem', padding: '5px 12px' }}
                onClick={() => setImageTab('url')}
              >
                URL Link
              </button>
            </div>
          </div>

          {/* TAB 1: UPLOAD PNG / JPG */}
          {imageTab === 'upload' && (
            <div style={{ marginTop: '12px' }}>
              {imageUploadError && (
                <div
                  className="toast toast--error"
                  style={{
                    marginBottom: '12px',
                    fontSize: '0.85rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                >
                  <AlertCircle size={16} /> {imageUploadError}
                </div>
              )}

              {uploadedImage ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: '110px',
                      height: '110px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={uploadedImage}
                      alt="Pratinjau Upload"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <CheckCircle size={16} color="var(--emerald)" />
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>
                        Gambar Siap Digunakan
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.84rem',
                        color: '#64748b',
                        wordBreak: 'break-all',
                      }}
                    >
                      {uploadedFileName || 'Format PNG / JPG teroptimasi'}
                    </p>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <label
                        htmlFor="tent-image-upload"
                        className="btn btn--outline btn--sm"
                        style={{ cursor: 'pointer', fontSize: '0.82rem' }}
                      >
                        <UploadCloud size={14} /> Ganti Gambar
                      </label>
                      <button
                        type="button"
                        className="btn btn--outline btn--sm"
                        style={{ fontSize: '0.82rem', color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={handleRemoveUploadedImage}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '14px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                  onClick={() => document.getElementById('tent-image-upload')?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = 'var(--emerald)'
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = '#cbd5e1'
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = '#cbd5e1'
                    const file = e.dataTransfer.files?.[0]
                    if (file) {
                      const input = document.getElementById('tent-image-upload')
                      if (input) {
                        const dt = new DataTransfer()
                        dt.items.add(file)
                        input.files = dt.files
                        input.dispatchEvent(new Event('change', { bubbles: true }))
                      }
                    }
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}
                  >
                    {uploadingImage ? (
                      <RotateCcw size={26} className="spin" />
                    ) : (
                      <UploadCloud size={28} />
                    )}
                  </div>

                  <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                    {uploadingImage ? 'Memproses dan Mengompres Gambar...' : 'Klik atau Seret Gambar ke Sini'}
                  </h4>
                  <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#64748b' }}>
                    Mendukung format <strong>PNG</strong>, <strong>JPG/JPEG</strong>, dan <strong>WEBP</strong> (Maksimal 10MB)
                  </p>

                  <span className="btn btn--primary btn--sm" style={{ pointerEvents: 'none' }}>
                    <ImagePlus size={15} /> Pilih File dari Komputer / HP
                  </span>
                </div>
              )}

              {/* Input File Tersembunyi */}
              <input
                id="tent-image-upload"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* TAB 2: PRESET SVGs */}
          {imageTab === 'preset' && (
            <div className="preset-images-grid" style={{ marginTop: '12px' }}>
              {IMAGE_PRESETS.map((preset) => (
                <div
                  key={preset.src}
                  className={`preset-card ${
                    formData.image === preset.src && !uploadedImage && !customImageUrl
                      ? 'preset-card--selected'
                      : ''
                  }`}
                  onClick={() => {
                    setUploadedImage('')
                    setCustomImageUrl('')
                    setFormData({ ...formData, image: preset.src })
                  }}
                >
                  <img src={preset.src} alt={preset.label} className="preset-thumb" />
                  <span className="preset-label">{preset.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {imageTab === 'url' && (
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label" htmlFor="custom-image-url">
                Tautan URL Gambar Eksternal
              </label>
              <input
                id="custom-image-url"
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/... atau tautan gambar langsung"
                value={customImageUrl}
                onChange={(e) => {
                  setCustomImageUrl(e.target.value)
                  if (e.target.value.trim()) {
                    setUploadedImage('')
                    setFormData({ ...formData, image: e.target.value.trim() })
                  }
                }}
              />
            </div>
          )}
        </section>

        {/* Section 3: Technical Specifications (Dynamic Array) */}
        <section className="form-card">
          <div className="form-card-header-flex">
            <div>
              <h2 className="form-section-title">Spesifikasi Material &amp; Teknis</h2>
              <p className="form-card-sub">
                Spesifikasi detail seperti material outer, inner mesh, rangka frame, dan ukuran.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleAddSpec}
            >
              <Plus size={14} /> Tambah Spesifikasi
            </button>
          </div>

          <div className="dynamic-rows">
            {specs.map((spec, idx) => (
              <div key={idx} className="dynamic-row">
                <input
                  type="text"
                  className="form-input dynamic-input-name"
                  placeholder="Nama (misal: Bahan Outer)"
                  value={spec.name}
                  onChange={(e) => handleSpecChange(idx, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className="form-input dynamic-input-val"
                  placeholder="Nilai (misal: 20D Nylon PU 4000mm)"
                  value={spec.quantity}
                  onChange={(e) => handleSpecChange(idx, 'quantity', e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn btn--danger-subtle"
                  onClick={() => handleRemoveSpec(idx)}
                  title="Hapus baris spesifikasi ini"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Key Features (Dynamic Array) */}
        <section className="form-card">
          <div className="form-card-header-flex">
            <div>
              <h2 className="form-section-title">Fitur &amp; Keunggulan Produk</h2>
              <p className="form-card-sub">
                Poin-poin keunggulan yang membedakan produk ini di alam bebas.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleAddFeature}
            >
              <Plus size={14} /> Tambah Fitur
            </button>
          </div>

          <div className="dynamic-rows">
            {features.map((feat, idx) => (
              <div key={idx} className="dynamic-row">
                <input
                  type="text"
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder={`Fitur #${idx + 1} (misal: Double layer anti kondensasi)`}
                  value={feat}
                  onChange={(e) => handleFeatureChange(idx, e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn btn--danger-subtle"
                  onClick={() => handleRemoveFeature(idx)}
                  title="Hapus fitur ini"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Form Actions Footer */}
        <div className="form-submit-bar">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onBack}
            disabled={submitting}
          >
            Batal
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting}
          >
            <Save size={16} />
            <span>
              {submitting
                ? 'Menyimpan ke Database…'
                : isEdit
                ? 'Simpan Perubahan'
                : 'Tambah ke Katalog'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}

