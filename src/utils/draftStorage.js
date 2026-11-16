/**
 * Offline Draft Storage for Form Inputs (Auto-Save)
 */

const DRAFT_PREFIX = 'tentcraft_draft_'

export const saveDraft = (data, id = 'create') => {
  try {
    const key = `${DRAFT_PREFIX}${id}`
    const payload = {
      id,
      data,
      savedAt: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(payload))
    return true
  } catch (err) {
    console.warn('[DraftStorage] Failed to save draft:', err)
    return false
  }
}

export const loadDraft = (id = 'create') => {
  try {
    const key = `${DRAFT_PREFIX}${id}`
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const hasDraft = (id = 'create') => {
  try {
    return Boolean(localStorage.getItem(`${DRAFT_PREFIX}${id}`))
  } catch {
    return false
  }
}

export const deleteDraft = (id = 'create') => {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${id}`)
    return true
  } catch {
    return false
  }
}

export const getAllDrafts = () => {
  const drafts = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(DRAFT_PREFIX)) {
        try {
          const item = JSON.parse(localStorage.getItem(key))
          if (item) drafts.push(item)
        } catch {
          // Ignore corrupted draft
        }
      }
    }
  } catch {
    // Ignore
  }
  return drafts.sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))
}

export const clearAllDrafts = () => {
  try {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(DRAFT_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
  } catch {
    // Ignore
  }
}

export const formatDraftTime = (timestamp) => {
  if (!timestamp) return 'Baru saja'
  const diff = Date.now() - timestamp
  if (diff < 60000) return 'Baru saja disimpan'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

