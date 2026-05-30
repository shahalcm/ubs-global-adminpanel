import React, { useState, useEffect } from 'react'
import {
  getContactRequests,
  approveContactRequest,
  rejectContactRequest
} from '../services/adminService'
import toast from 'react-hot-toast'

const ContactRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [page, setPage] = useState(1)

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await getContactRequests({
        status: statusFilter || undefined,
        page,
        limit: 15
      })
      setRequests(data.requests || [])
      setPagination(data.pagination || { page: 1, pages: 1, total: 0 })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load contact requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [statusFilter, page])

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        const note = window.prompt('Enter an optional message or note to include for the buyer and seller:')
        if (note === null) return // Cancel clicked
        
        await approveContactRequest(id, note)
        toast.success('Request approved and chat room connected successfully!')
      } else if (action === 'reject') {
        const reason = window.prompt('Enter the reason for rejecting this contact request (required):')
        if (!reason || !reason.trim()) {
          toast.error('Rejection reason is required')
          return
        }
        await rejectContactRequest(id, reason.trim())
        toast.success('Request rejected successfully')
      }
      loadRequests()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request action')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white mb-2">Buyer Support & Contact Requests</h1>
        <p className="text-gray-500 mt-1 dark:text-gray-400">
          Approve incoming connection requests from buyers to start secure direct chats with sellers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-4">
        {[
          { label: 'Pending Review', value: 'pending' },
          { label: 'Connected', value: 'connected' },
          { label: 'Rejected', value: 'rejected' },
          { label: 'All Requests', value: '' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatusFilter(tab.value)
              setPage(1)
            }}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
              statusFilter === tab.value
                ? 'border-blue-600 text-blue-600 dark:text-blue-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-bg rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Buyer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product / Seller</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Inquiry details</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-850">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  Loading requests...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No contact requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req._id}>
                  {/* Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString()}
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Buyer */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {req.buyerName || req.buyerId?.name || 'Unknown Buyer'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {req.buyerId?.email}
                    </div>
                    {req.buyerId?.phone && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        📞 {req.buyerId?.phone}
                      </div>
                    )}
                  </td>

                  {/* Product / Seller */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {req.productId?.images && req.productId.images[0] && (
                        <img
                          src={req.productId.images[0]}
                          alt={req.productName}
                          className="w-10 h-10 rounded object-cover bg-gray-100"
                        />
                      )}
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {req.productName || req.productId?.title || 'Unknown Product'}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          Store: {req.sellerShop || req.sellerId?.shopName || 'Unknown Store'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Subject / Message */}
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                    <div className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {req.subject || 'No Subject'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                      {req.message || 'No message contents.'}
                    </div>
                    {req.adminNote && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 bg-yellow-50 dark:bg-yellow-950 p-1.5 rounded">
                        Note: {req.adminNote}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      req.status === 'connected'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : req.status === 'rejected'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    }`}>
                      {req.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(req._id, 'approve')}
                          className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                        >
                          Connect
                        </button>
                        <button
                          onClick={() => handleAction(req._id, 'reject')}
                          className="px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600 text-xs">
                        Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 dark:border-gray-700 dark:text-white"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Page {page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 dark:border-gray-700 dark:text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default ContactRequests
