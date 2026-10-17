import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          const { data } = await api.get('/auth/me')
          setUser(data.user)
        } catch {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Login failed'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [])

  const register = useCallback(async (name, email, password, phone) => {
    setError('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setToken(data.token)
      setUser(data.user)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Registration failed'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData)
      const updatedUser = { ...user, ...data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Update failed'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [user])

  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      const { data } = await api.put('/auth/password', { currentPassword, newPassword })
      localStorage.setItem('token', data.token)
      setToken(data.token)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Password update failed'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [])

  const deleteAccount = useCallback(async () => {
    try {
      await api.delete('/auth/account')
      logout()
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Delete failed'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [logout])

  const updateFavorites = useCallback(async (favoriteCategories) => {
    try {
      const { data } = await api.put('/auth/favorites', { favoriteCategories })
      const updatedUser = { ...user, ...data.user }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.msg || 'Update failed'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [user])

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    deleteAccount,
    updateFavorites,
    clearError: () => setError(''),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
