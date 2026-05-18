import React, { useEffect, useState } from 'react'
import {
  getSellers,
  approveSeller,
  rejectSeller,
  suspendSeller
} from '../services/adminService'
import toast from 'react-hot-toast'

const SellerManagement = () => {
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSellers = async () => {
    try {
      setLoading(true)
      const data = await getSellers({ page: 1, limit: 50 })
      setSellers(data.sellers || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSellers()
  }, [])

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        await approveSeller(id)
        toast.success('Seller approved')
      } else if (action === 'suspend') {
        await suspendSeller(id)
        toast.success('Seller suspended')
      } else if (action === 'reject') {
        const reason = window.prompt('Reason for rejecting this seller?')
        if (!reason) return
        await rejectSeller(id, reason)
        toast.success('Seller rejected')
      }
      loadSellers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold dark:text-white mb-6">Seller Management</h1>
          <p className="text-gray-500 mt-1">Review and moderate seller accounts.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading sellers...</td>
              </tr>
            ) : sellers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No sellers found.</td>
              </tr>
            ) : sellers.map((seller) => (
              <tr key={seller._id}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">{seller.shopName}</div>
                  <div className="text-xs text-gray-500">{seller.businessType || 'N/A'}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${seller.status === 'approved' ? 'bg-green-100 text-green-700' : seller.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' : seller.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {seller.status || 'pending'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{seller.ownerName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(seller.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleAction(seller._id, 'approve')} className="px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600">Approve</button>
                  <button onClick={() => handleAction(seller._id, 'suspend')} className="px-3 py-1 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600">Suspend</button>
                  <button onClick={() => handleAction(seller._id, 'reject')} className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SellerManagement;
