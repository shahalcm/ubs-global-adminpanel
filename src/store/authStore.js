import { create } from 'zustand'
import api from '../services/api'

const useAuthStore = create((set) => ({
  admin: JSON.parse(localStorage.getItem('admin') || 'null'),
  token: localStorage.getItem('adminToken'),
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await api.post('/auth/admin/login', {
        email,
        password
      })
      localStorage.setItem('adminToken', res.data.token)
      localStorage.setItem(
        'admin',
        JSON.stringify(res.data.admin)
      )
      set({
        admin: res.data.admin,
        token: res.data.token,
        loading: false
      })
      return res.data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('admin')
    set({ admin: null, token: null })
  }
}))

export default useAuthStore
