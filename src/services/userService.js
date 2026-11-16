/**
 * User Profile Service
 * Menyimpan data profil pengembang dan identitas mahasiswa praktikum di localStorage.
 */

const USER_PROFILE_KEY = 'tentcraft_user_profile'
const USER_ID_KEY = 'tentcraft_user_id'

const DEFAULT_PROFILE = {
  name: 'Muhammad Rafli Buchori',
  nim: '21120124130095',
  kelompok: 'Kelompok 35',
  prodi: 'Teknik Komputer',
  universitas: 'Universitas Diponegoro',
  mataKuliah: 'Praktikum Pemrograman Perangkat Bergerak (PPB)',
  modul: 'Modul 5 — Progressive Web App (PWA) II',
  role: 'Fullstack & PWA Developer',
  email: 'muhammadrafli@students.undip.ac.id',
  bio: 'Mahasiswa Teknik Komputer Universitas Diponegoro dengan minat pada mobile development, Progressive Web Apps, dan sistem terdistribusi. Menyenangi kegiatan outdoor, trekking gunung, dan riset teknologi web modern.',
  avatar: null,
  joinDate: 'November 2026',
}

export const getUserIdentifier = () => {
  try {
    let uid = localStorage.getItem(USER_ID_KEY)
    if (!uid) {
      uid = 'usr-' + (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2))
      localStorage.setItem(USER_ID_KEY, uid)
    }
    return uid
  } catch {
    return 'usr-anon-offline'
  }
}

export const getUserProfile = () => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY)
    if (raw) {
      return {
        ...DEFAULT_PROFILE,
        ...JSON.parse(raw),
        userId: getUserIdentifier(),
      }
    }
  } catch {
    // Fallback to default
  }
  return {
    ...DEFAULT_PROFILE,
    userId: getUserIdentifier(),
  }
}

export const saveUserProfile = (profile) => {
  try {
    const data = {
      ...DEFAULT_PROFILE,
      ...profile,
      userId: getUserIdentifier(),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(data))
    return { success: true, data }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export const resetUserProfile = () => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY)
    return getUserProfile()
  } catch {
    return DEFAULT_PROFILE
  }
}

export default {
  getUserIdentifier,
  getUserProfile,
  saveUserProfile,
  resetUserProfile,
  DEFAULT_PROFILE,
}
