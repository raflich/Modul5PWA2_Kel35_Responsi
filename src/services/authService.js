import axios from 'axios'
import { BASE_URL, SUPABASE_KEY, IS_SUPABASE } from '../config/api'

const AUTH_SESSION_KEY = 'tentcraft_auth_session'
const CUSTOMER_GUID_KEY = 'tentcraft_customer_guid'

/**
 * Mengambil atau membuat GUID unik untuk customer pengunjung (tanpa login).
 * Tersimpan secara persisten di localStorage.
 */
export const getCustomerGuid = () => {
  try {
    let guid = localStorage.getItem(CUSTOMER_GUID_KEY)
    if (!guid) {
      guid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'cust-' + Math.random().toString(36).substring(2, 12)
      localStorage.setItem(CUSTOMER_GUID_KEY, guid)
    }
    return guid
  } catch {
    return 'cust-offline-guid'
  }
}

/**
 * Data sesi bawaan untuk Pengunjung (Customer / Guest Mode).
 */
const getCustomerSession = () => ({
  isAuthenticated: false,
  role: 'customer',
  username: 'pengunjung',
  email: null,
  name: 'Pengunjung',
  customerGuid: getCustomerGuid(),
})

class AuthService {
  /**
   * Mengambil sesi user saat ini. Jika belum login, mengembalikan profil Customer.
   */
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY)
      if (raw) {
        const session = JSON.parse(raw)
        if (session && session.isAuthenticated && session.role === 'admin') {
          return session
        }
      }
    } catch (e) {
      console.warn('[AuthService] Gagal membaca session dari storage:', e)
    }
    return getCustomerSession()
  }

  /**
   * Cek cepat apakah user saat ini memiliki role Admin.
   */
  isAdmin() {
    return this.getCurrentUser().role === 'admin'
  }

  /**
   * Login Admin:
   * 1. Mencoba otentikasi online ke Supabase Auth (jika server terjangkau).
   * 2. Otomatis fallback ke kredensial offline lokal jika sedang tidak ada koneksi / demo praktikum.
   */
  async login({ identifier, password }) {
    const cleanId = (identifier || '').trim()
    const cleanPass = (password || '').trim()

    if (!cleanId || !cleanPass) {
      throw new Error('Username/Email dan Password wajib diisi.')
    }

    // Resolusi email (jika user memasukkan username 'rafli', map ke 'rafli@tentcraft.com')
    let email = cleanId
    if (!cleanId.includes('@')) {
      if (cleanId.toLowerCase() === 'rafli') {
        email = 'rafli@tentcraft.com'
      } else {
        email = `${cleanId}@tentcraft.com`
      }
    }

    let isOnlineSuccess = false
    let adminSession = null

    // 1. Coba koneksi ke Supabase Auth API jika konfigurasi tersedia
    if (IS_SUPABASE && BASE_URL && SUPABASE_KEY) {
      try {
        const tokenRes = await axios.post(
          `${BASE_URL}/auth/v1/token?grant_type=password`,
          { email, password: cleanPass },
          {
            headers: {
              apikey: SUPABASE_KEY,
              'Content-Type': 'application/json',
            },
            timeout: 5000,
          },
        )

        const { access_token, user } = tokenRes.data

        // Ambil profil dari tabel public.profiles untuk cek role di DB
        let dbRole = 'admin'
        let dbName = user?.user_metadata?.full_name || 'Muhammad Rafli Buchori'
        let dbUsername = user?.user_metadata?.username || cleanId

        try {
          const profileRes = await axios.get(
            `${BASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=*`,
            {
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${access_token}`,
              },
              timeout: 4000,
            },
          )

          if (profileRes.data && profileRes.data.length > 0) {
            const p = profileRes.data[0]
            dbRole = p.role || 'admin'
            dbName = p.name || dbName
            dbUsername = p.username || dbUsername
          }
        } catch (profErr) {
          console.warn('[AuthService] Gagal membaca tabel profiles, fallback ke user metadata:', profErr)
        }

        if (dbRole !== 'admin') {
          throw new Error('Akses Ditolak: Akun ini terdaftar sebagai Customer, bukan Admin.')
        }

        adminSession = {
          isAuthenticated: true,
          role: 'admin',
          username: dbUsername,
          email: user.email || email,
          name: dbName,
          token: access_token,
          userId: user.id,
          loginMethod: 'supabase_cloud',
          loginTime: new Date().toISOString(),
        }

        isOnlineSuccess = true
      } catch (err) {
        // Jika error adalah Akses Ditolak role bukan admin, lempar error langsung
        if (err.message && err.message.includes('Akses Ditolak')) {
          throw err
        }
        console.info('[AuthService] Supabase server belum terjangkau / offline, mencoba validasi offline credential...', err.message)
      }
    }

    // 2. Offline / Local Fallback Validation (PWA Offline First)
    // Memungkinkan penguji/dosen login tanpa koneksi internet saat presentasi praktikum
    if (!isOnlineSuccess) {
      const isRafliUser =
        cleanId.toLowerCase() === 'rafli' ||
        cleanId.toLowerCase() === 'rafli@tentcraft.com' ||
        cleanId.toLowerCase() === 'muhammadrafli@students.undip.ac.id'

      const isAllowedPassword =
        cleanPass === 'AdminRafli123!' ||
        cleanPass === 'admin123' ||
        cleanPass === 'rafli'

      if (isRafliUser && isAllowedPassword) {
        adminSession = {
          isAuthenticated: true,
          role: 'admin',
          username: 'rafli',
          email: 'rafli@tentcraft.com',
          name: 'Muhammad Rafli Buchori',
          token: 'offline-admin-jwt-token',
          userId: 'usr-admin-rafli-undip',
          loginMethod: 'offline_verified',
          loginTime: new Date().toISOString(),
        }
      } else {
        throw new Error(
          'Username atau Password salah. Gunakan username "rafli" dan password "AdminRafli123!"',
        )
      }
    }

    // Simpan session admin ke LocalStorage
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(adminSession))

    // Broadcast event ke seluruh komponen aplikasi
    this._broadcastChange(adminSession)

    return adminSession
  }

  /**
   * Logout Admin:
   * Mengembalikan role menjadi Customer (Pengunjung) tanpa login.
   */
  logout() {
    try {
      localStorage.removeItem(AUTH_SESSION_KEY)
    } catch (e) {
      console.warn('[AuthService] Gagal menghapus session:', e)
    }

    const customerSession = getCustomerSession()
    this._broadcastChange(customerSession)
    return customerSession
  }

  /**
   * Internal helper untuk broadcast event pergantian auth/role.
   */
  _broadcastChange(session) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tentcraft:auth-change', {
          detail: session,
        }),
      )
    }
  }
}

export default new AuthService()

