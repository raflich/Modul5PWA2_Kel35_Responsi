import { useState, useEffect } from 'react'
import { Download, WifiOff, CheckCircle2, X } from 'lucide-react'

export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [onlineAlert, setOnlineAlert] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setOnlineAlert(true)
      setTimeout(() => setOnlineAlert(false), 3500)
    }

    const handleOffline = () => {
      setIsOffline(true)
      setOnlineAlert(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallPrompt(null)
  }

  // Back online toast alert
  if (onlineAlert) {
    return (
      <aside className="pwa-toast pwa-toast--online" role="status" aria-live="polite">
        <CheckCircle2 size={18} />
        <span>Koneksi pulih. Aplikasi kembali online.</span>
      </aside>
    )
  }

  // Offline status banner
  if (isOffline) {
    return (
      <aside className="pwa-toast pwa-toast--offline" role="status" aria-live="polite">
        <WifiOff size={18} />
        <div>
          <strong>Mode Offline Aktif.</strong> Seluruh katalog dan data CRUD tersimpan lokal dan tetap dapat diakses tanpa internet.
        </div>
      </aside>
    )
  }

  // Install PWA prompt banner
  if (installPrompt && !installed && !dismissed) {
    return (
      <aside className="pwa-install-banner" role="region" aria-label="Install Aplikasi PWA">
        <div className="pwa-install-body">
          <div className="pwa-install-icon">
            <Download size={20} />
          </div>
          <div className="pwa-install-text">
            <strong>Install TentCraft App</strong>
            <p>Jalankan aplikasi secara mandiri di layar utama Anda, cepat, hemat kuota, dan bekerja offline.</p>
          </div>
        </div>
        <div className="pwa-install-actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleInstallClick}
          >
            Install Sekarang
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Tutup saran instalasi"
          >
            <X size={16} />
          </button>
        </div>
      </aside>
    )
  }

  return null
}
