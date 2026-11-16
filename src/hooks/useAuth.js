import { useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'

export function useAuth() {
  const [user, setUser] = useState(() => authService.getCurrentUser())

  useEffect(() => {
    const handleAuthChange = (e) => {
      if (e.detail) {
        setUser(e.detail)
      } else {
        setUser(authService.getCurrentUser())
      }
    }

    window.addEventListener('tentcraft:auth-change', handleAuthChange)
    return () => window.removeEventListener('tentcraft:auth-change', handleAuthChange)
  }, [])

  const login = useCallback(async (credentials) => {
    return await authService.login(credentials)
  }, [])

  const logout = useCallback(() => {
    return authService.logout()
  }, [])

  return {
    user,
    isAdmin: user?.role === 'admin',
    customerGuid: user?.customerGuid || authService.getCurrentUser().customerGuid,
    login,
    logout,
  }
}

export default useAuth

