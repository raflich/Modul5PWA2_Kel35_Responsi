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
} from 'lucide-react'
import tentService from '../services/tentService'
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  formatDraftTime,
} from '../utils/draftStorage'

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
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        specs: specs.filter((s) => s.name.trim() !== ''),
        features: features.filter((f) => f.trim() !== ''),
        image: customImageUrl.trim() || formData.image,
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

        {/* Section 2: Visual Image Selection */}
        <section className="form-card">
          <h2 className="form-section-title">Pilihan Ikon &amp; Gambar Visual</h2>
          <p className="form-card-sub">
            Pilih ikon vektor outdoor yang sesuai atau masukkan tautan URL gambar khusus Anda.
          </p>

          <div className="preset-images-grid">
            {IMAGE_PRESETS.map((preset) => (
              <div
                key={preset.src}
                className={`preset-card ${
                  formData.image === preset.src && !customImageUrl
                    ? 'preset-card--selected'
                    : ''
                }`}
                onClick={() => {
                  setCustomImageUrl('')
                  setFormData({ ...formData, image: preset.src })
                }}
              >
                <img src={preset.src} alt={preset.label} className="preset-thumb" />
                <span className="preset-label">{preset.label}</span>
              </div>
            ))}
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label className="form-label" htmlFor="custom-image-url">
              Atau Gunakan Tautan URL Gambar Eksternal (Opsional)
            </label>
            <input
              id="custom-image-url"
              type="url"
              className="form-input"
              placeholder="https://images.unsplash.com/... atau tautan gambar langsung"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
            />
          </div>
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
