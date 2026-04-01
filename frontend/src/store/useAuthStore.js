import { create } from 'zustand'
import { authAPI } from '../services/api'

const useAuthStore = create((set, get) => ({
  // State
  user: null,
  token: localStorage.getItem('medchain_token') || null,
  isAuthenticated: !!localStorage.getItem('medchain_token'),
  loading: false,
  error: null,

  // Actions
  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.login({ email, password })
      const { token, user } = data.data

      localStorage.setItem('medchain_token', token)
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      })
      return user
    } catch (err) {
      const error = err.response?.data?.error || 'Login failed. Please try again.'
      set({ loading: false, error })
      throw new Error(error)
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null })
    try {
      const { data } = await authAPI.register({ name, email, password, role })
      const { token, user } = data.data

      localStorage.setItem('medchain_token', token)
      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      })
      return user
    } catch (err) {
      const error = err.response?.data?.error || 'Registration failed. Please try again.'
      set({ loading: false, error })
      throw new Error(error)
    }
  },

  logout: () => {
    localStorage.removeItem('medchain_token')
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    })
  },

  // Fetch current user profile (on app load if token exists)
  fetchUser: async () => {
    const token = get().token
    if (!token) return

    try {
      const { data } = await authAPI.getProfile()
      set({ user: data.data, isAuthenticated: true })
    } catch {
      // Token expired or invalid
      localStorage.removeItem('medchain_token')
      set({ user: null, token: null, isAuthenticated: false })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
