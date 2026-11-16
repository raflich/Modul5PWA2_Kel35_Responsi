import { useState } from 'react'
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import authService from '../../services/authService'

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [identifier, setIdentifier] = useState('rafli')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!isOpen) return null

  const handleFillDemo = () => {
    setIdentifier('rafli')
    setPassword('AdminRafli123!')
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const session = await authService.login({ identifier, password })
      setSuccessMsg(`Selamat datang kembali, ${session.name}! Mode Admin aktif.`)
      setTimeout(() => {
        setLoading(false)
        if (onSuccess) onSuccess(session)
        if (onClose) onClose()
      }, 900)
    } catch (err) {
      setLoading(false)
      setErrorMsg(err.message || 'Gagal masuk. Periksa username dan password Anda.')
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '440px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="icon-btn"
          style={{ position: 'absolute', top: '16px', right: '16px', color: '#64748b' }}
          aria-label="Tutup modal login"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              color: '#059669',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
            Masuk sebagai Admin
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
            Login khusus pengelola toko untuk mengakses menu CRUD dan mengedit inventaris tenda.
          </p>
        </div>

        {/* Quick Autofill Helper for Examiner / Demo */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '0.82rem', color: '#475569' }}>
            <strong>Demo Akun:</strong> <br />
            User: <code>rafli</code> | Pass: <code>AdminRafli123!</code>
          </div>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            style={{ fontSize: '0.78rem', padding: '4px 10px', whiteSpace: 'nowrap' }}
            onClick={handleFillDemo}
          >
            <Sparkles size={13} /> Isi Otomatis
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#047857',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="login-identifier"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}
            >
              Username atau Email:
            </label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                id="login-identifier"
                type="text"
                className="form-input"
                style={{ paddingLeft: '38px', width: '100%' }}
                placeholder="rafli atau rafli@tentcraft.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="login-password"
              style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}
            >
              Password:
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound
                size={16}
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingLeft: '38px', paddingRight: '40px', width: '100%' }}
                placeholder="Masukkan kata sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="icon-btn"
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="submit"
              className="btn btn--primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading}
            >
              <LogIn size={16} />
              <span>{loading ? 'Memvalidasi...' : 'Masuk sebagai Admin'}</span>
            </button>
            <button
              type="button"
              className="btn btn--outline"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={onClose}
              disabled={loading}
            >
              Tetap sebagai Pengunjung
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

