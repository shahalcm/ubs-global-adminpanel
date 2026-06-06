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

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState('') // empty string for 'All'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 10

  // Keystroke Debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const loadSellers = async (page = currentPage, search = debouncedSearch, sellerStatus = status) => {
    try {
      setLoading(true)
      const data = await getSellers({ page, limit, search, status: sellerStatus })
      setSellers(data.sellers || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load sellers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSellers(currentPage, debouncedSearch, status)
  }, [currentPage, debouncedSearch, status])

  const handleAction = async (id, action) => {
    try {
      if (action === 'approve') {
        const note = window.prompt('Add an approval note? (Optional)')
        await approveSeller(id, note || undefined)
        toast.success('Seller approved')
      } else if (action === 'suspend') {
        await suspendSeller(id)
        toast.success('Seller suspended')
      } else if (action === 'reject') {
        const reason = window.prompt('Reason for rejecting this seller?')
        if (reason === null) return // Cancel clicked
        if (!reason.trim()) {
          toast.error('Rejection reason is required')
          return
        }
        await rejectSeller(id, reason)
        toast.success('Seller rejected')
      }
      loadSellers(currentPage, debouncedSearch, status)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    }
  }

  const renderPageNumbers = () => {
    const pages = []
    const startPage = Math.max(1, currentPage - 2)
    const endPage = Math.min(totalPages, startPage + 4)
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
            i === currentPage
              ? 'z-10 bg-[#0A0F2C] text-white focus-visible:outline-2 focus-visible:outline-offset-2'
              : 'text-gray-900 dark:text-gray-250 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Seller Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review and moderate seller accounts.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm">
          {['All', 'Pending', 'Approved', 'Suspended', 'Rejected'].map((tab) => {
            const val = tab === 'All' ? '' : tab.toLowerCase()
            const isTabActive = status === val
            return (
              <button
                key={tab}
                onClick={() => { setStatus(val); setCurrentPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  isTabActive
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>
        <div className="w-full lg:w-80 relative">
          <input
            type="text"
            placeholder="Search shop, owner, business type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-slate-850">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Seller</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Applied</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              Array(limit).fill(0).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4">
                    <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16"></div>
                  </td>
                  <td className="px-4 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-14"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-16"></div></td>
                  <td className="px-4 py-4 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-44 ml-auto"></div></td>
                </tr>
              ))
            ) : sellers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 bg-slate-50/50 dark:bg-slate-850/50">No sellers found.</td>
              </tr>
            ) : (
              sellers.map((seller) => (
                <tr key={seller._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{seller.shopName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{seller.businessType || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                      seller.status === 'approved' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                        : seller.status === 'suspended' 
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' 
                        : seller.status === 'rejected' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {seller.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-750 dark:text-gray-300">{seller.ownerName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-350">
                    {seller.userId?.location?.city ? `${seller.userId.location.city}, ${seller.userId.location.country || ''}`.replace(/,\s*,/, ',').trim() : (seller.address?.street || '—')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(seller.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {seller.status !== 'approved' && (
                      <button 
                        onClick={() => handleAction(seller._id, 'approve')} 
                        className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-755 text-white font-semibold transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {seller.status === 'approved' && (
                      <button 
                        onClick={() => handleAction(seller._id, 'suspend')} 
                        className="px-3 py-1.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors"
                      >
                        Suspend
                      </button>
                    )}
                    {seller.status !== 'approved' && seller.status !== 'rejected' && (
                      <button 
                        onClick={() => handleAction(seller._id, 'reject')} 
                        className="px-3 py-1.5 rounded-lg bg-red-650 hover:bg-red-755 text-white font-semibold transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white dark:bg-slate-900 px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm border dark:border-slate-800">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-750 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <span>&larr;</span>
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <span>&rarr;</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerManagement
