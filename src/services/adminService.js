import api from './api'

// Dashboard
export const getDashboardStats = async () => {
  const res = await api.get('/admin/dashboard-stats')
  return res.data
}

// Sellers
export const getSellers = async (filters = {}) => {
  const res = await api.get('/admin/sellers', {
    params: filters
  })
  return res.data
}

export const approveSeller = async (id, note) => {
  const res = await api.patch(
    `/admin/sellers/${id}/approve`,
    { note }
  )
  return res.data
}

export const rejectSeller = async (id, reason) => {
  const res = await api.patch(
    `/admin/sellers/${id}/reject`,
    { reason }
  )
  return res.data
}

export const suspendSeller = async (id) => {
  const res = await api.patch(
    `/admin/sellers/${id}/suspend`
  )
  return res.data
}

// Users
export const getUsers = async (filters = {}) => {
  const res = await api.get('/admin/users', {
    params: filters
  })
  return res.data
}

export const blockUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/block`)
  return res.data
}

export const unblockUser = async (id) => {
  const res = await api.patch(
    `/admin/users/${id}/unblock`
  )
  return res.data
}

// Products
export const getAdminProducts = async (filters = {}) => {
  const res = await api.get('/admin/products', {
    params: filters
  })
  return res.data
}

export const approveProduct = async (id) => {
  const res = await api.patch(
    `/admin/products/${id}/approve`
  )
  return res.data
}

export const rejectProduct = async (id, reason) => {
  const res = await api.patch(
    `/admin/products/${id}/reject`,
    { reason }
  )
  return res.data
}

// Orders
export const getAdminOrders = async (filters = {}) => {
  const res = await api.get('/admin/orders', {
    params: filters
  })
  return res.data
}

// Analytics
export const getAnalytics = async (period = 'month') => {
  const res = await api.get('/admin/analytics/revenue', {
    params: { period }
  })
  return res.data
}

// Contact Requests
export const getContactRequests = async (
  filters = {}
) => {
  const res = await api.get('/admin/contact-requests', {
    params: filters
  })
  return res.data
}

export const approveContactRequest = async (
  id,
  adminNote
) => {
  const res = await api.patch(
    `/admin/contact-requests/${id}/approve`,
    { adminNote }
  )
  return res.data
}

export const rejectContactRequest = async (id, reason) => {
  const res = await api.patch(
    `/admin/contact-requests/${id}/reject`,
    { reason }
  )
  return res.data
}

export const getChatRooms = async () => {
  const res = await api.get('/admin/chat-rooms')
  return res.data
}

export const getAdminChatMessages = async (roomId) => {
  const res = await api.get(`/admin/chat/${roomId}/messages`)
  return res.data
}

export const sendAdminChatMessage = async (roomId, message) => {
  const res = await api.post(`/admin/chat/${roomId}/messages`, { text: message })
  return res.data
}

// Send notification
export const sendNotification = async (data) => {
  const res = await api.post(
    '/admin/notifications/send',
    data
  )
  return res.data
}

// Categories
export const getAdminCategories = async () => {
  const res = await api.get('/admin/categories')
  return res.data
}

export const createCategory = async (data) => {
  const res = await api.post('/admin/categories', data)
  return res.data
}

export const updateCategory = async (id, data) => {
  const res = await api.put(
    `/admin/categories/${id}`,
    data
  )
  return res.data
}

export const deleteCategory = async (id) => {
  const res = await api.delete(`/admin/categories/${id}`)
  return res.data
}

// Banners
export const getBanners = async () => {
  const res = await api.get('/admin/banners')
  return res.data
}

export const createBanner = async (data) => {
  const res = await api.post('/admin/banners', data)
  return res.data
}

// Transactions
export const getTransactions = async (filters = {}) => {
  const res = await api.get('/admin/transactions', {
    params: filters
  })
  return res.data
}

// System settings
export const getSettings = async () => {
  const res = await api.get('/admin/settings')
  return res.data
}

export const updateSettings = async (data) => {
  const res = await api.put('/admin/settings', data)
  return res.data
}

export const updateAdminProduct = async (id, data) => {
  const res = await api.put(`/admin/products/${id}`, data)
  return res.data
}

// Reviews Moderation
export const getAdminReviews = async (filters = {}) => {
  const res = await api.get('/admin/reviews', { params: filters })
  return res.data
}

export const approveReview = async (id) => {
  const res = await api.patch(`/admin/reviews/${id}/approve`)
  return res.data
}

export const deleteReview = async (id) => {
  const res = await api.delete(`/admin/reviews/${id}`)
  return res.data
}



