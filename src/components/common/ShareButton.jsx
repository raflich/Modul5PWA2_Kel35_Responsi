import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton({ tent, size = 16, className = '' }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (e) => {
    e.stopPropagation()
    const url = `${window.location.origin}/?tab=Catalog&tent=${encodeURIComponent(tent.id)}`
    const shareData = {
      title: `${tent.name} — TentCraft PWA`,
      text: `Lihat spesifikasi ${tent.name} di TentCraft Outdoor Equipment!`,
      url,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('[ShareButton] Web Share API failed, fallback to copy:', err)
        }
      }
    }

    // Fallback: Clipboard copy
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Legacy copy fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <button
      type="button"
      className={`share-btn ${className}`}
      onClick={handleShare}
      title={copied ? 'Tautan disalin ke clipboard!' : 'Bagikan produk ini'}
      aria-label="Bagikan produk"
    >
      {copied ? <Check size={size} color="var(--emerald)" /> : <Share2 size={size} />}
      {copied && <span className="share-tooltip">Tautan disalin!</span>}
    </button>
  )
}
