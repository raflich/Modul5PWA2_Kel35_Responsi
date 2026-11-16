import axios from 'axios'

// ---------------------------------------------------------------------------
// Base URL & Supabase Key Configuration
// Read from environment variables (.env) or fallback to offline store
// ---------------------------------------------------------------------------
const RAW_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim()
const BASE_URL = RAW_BASE_URL.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
const SUPABASE_KEY = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''
).trim()

const IS_SUPABASE = BASE_URL.includes('supabase.co') || Boolean(SUPABASE_KEY)

const apiClient = axios.create({
  baseURL: BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
})

apiClient.interceptors.request.use(
  (config) => {
    if (IS_SUPABASE && SUPABASE_KEY) {
      config.headers['apikey'] = SUPABASE_KEY
      if (!config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${SUPABASE_KEY}`
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Terjadi kesalahan pada koneksi server.'
    let status = null

    if (error.response) {
      status = error.response.status
      message =
        error.response.data?.message ||
        error.response.data?.error ||
        `Kesalahan Server (${status})`
    } else if (error.request) {
      message = 'Tidak dapat menghubungi server. Beralih ke mode offline lokal.'
    } else {
      message = error.message || message
    }

    return Promise.reject({
      message,
      status,
      code: error.response?.data?.code,
      raw: error.response?.data,
    })
  },
)

export { apiClient, BASE_URL, SUPABASE_KEY, IS_SUPABASE }
