import api from './api'

// Fetch a legal document content for editing or previewing
export const getLegalDoc = async (key) => {
  const res = await api.get(`/users/legal-docs/${key}`)
  return res.data
}

// Update/create legal document
export const updateLegalDoc = async (key, data) => {
  const res = await api.put(`/admin/legal-docs/${key}`, data)
  return res.data
}

// Fetch GDPR & Account Deletion requests
export const getGDPRRequests = async (filters = {}) => {
  const res = await api.get('/admin/gdpr-requests', {
    params: filters
  })
  return res.data
}

// Update GDPR & Account Deletion request (Approve, complete, cancel, add adminNote)
export const updateGDPRRequest = async (id, data) => {
  const res = await api.patch(`/admin/gdpr-requests/${id}`, data)
  return res.data
}
