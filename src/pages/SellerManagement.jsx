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
  const [selectedSeller, setSelectedSeller] = useState(null)

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
      
      // Reload sellers
      await loadSellers(currentPage, debouncedSearch, status)
      
      // Update selectedSeller state if it's currently open
      if (selectedSeller && selectedSeller._id === id) {
        const refreshedSellers = await getSellers({ page: currentPage, limit, search: debouncedSearch, status })
        const updatedSeller = refreshedSellers.sellers?.find(s => s._id === id)
        if (updatedSeller) {
          setSelectedSeller(updatedSeller)
        } else {
          setSelectedSeller(null)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    }
  }

  const getStatusBadge = (sellerStatus) => {
    switch (sellerStatus) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Suspended
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            Pending
          </span>
        )
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
          className={`relative inline-flex items-center px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all focus:outline-none ${
            i === currentPage
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-bg/40'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#2B3674] dark:text-white tracking-tight">Seller Management</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Review, approve, and moderate business merchant profiles.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-6">
        <div className="flex flex-wrap bg-gray-100/70 dark:bg-dark-bg/60 p-1.5 rounded-[15px] border border-gray-200/50 dark:border-gray-800/30 gap-1 shadow-inner">
          {['All', 'Pending', 'Approved', 'Suspended', 'Rejected'].map((tab) => {
            const val = tab === 'All' ? '' : tab.toLowerCase()
            const isTabActive = status === val
            return (
              <button
                key={tab}
                onClick={() => { setStatus(val); setCurrentPage(1); }}
                className={`px-4 py-2 text-xs font-bold rounded-[10px] transition-all duration-200 cursor-pointer ${
                  isTabActive
                    ? 'bg-white dark:bg-dark-card text-primary dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-dark-card/30'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </div>
        
        <div className="w-full lg:w-80 relative flex items-center">
          <input
            type="text"
            placeholder="Search shop, owner, business..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[15px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs font-semibold shadow-soft dark:shadow-none"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-dark-card rounded-[20px] shadow-soft dark:shadow-none border border-gray-150 dark:border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800/40">
            <thead className="bg-gray-50/70 dark:bg-dark-bg/20">
              <tr>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Shop / Merchant</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">City / Location</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Applied Date</th>
                <th className="px-6 py-4.5 text-right text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/30">
              {loading ? (
                Array(limit).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 dark:bg-dark-bg rounded w-28 mb-2"></div><div className="h-3 bg-gray-100 dark:bg-dark-bg/60 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 dark:bg-dark-bg/60 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-150 dark:bg-dark-bg/85 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-bg/60 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-bg/60 rounded w-16"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 dark:bg-dark-bg rounded-lg w-32 ml-auto"></div></td>
                  </tr>
                ))
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm font-semibold text-gray-400 dark:text-gray-500 bg-gray-50/20 dark:bg-dark-bg/10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                      </svg>
                      No sellers found matching the filters.
                    </div>
                  </td>
                </tr>
              ) : (
                sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/15 transition-colors duration-150">
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span onClick={() => setSelectedSeller(seller)} className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary dark:hover:text-accent transition-colors">
                        {seller.shopName}
                      </span>
                      <div className="text-[11px] font-semibold text-gray-450 dark:text-gray-400 uppercase tracking-wider mt-0.5">{seller.businessType || 'General Store'}</div>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      {getStatusBadge(seller.status)}
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-gray-300">{seller.ownerName}</td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                      {seller.userId?.location?.city 
                        ? `${seller.userId.location.city}, ${seller.userId.location.country || ''}`.replace(/,\s*,/, ',').trim() 
                        : (seller.address?.city || '—')}
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-gray-400">
                      {new Date(seller.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-right text-xs font-bold space-x-1.5">
                      <button 
                        onClick={() => setSelectedSeller(seller)}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-dark-bg/60 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                      
                      {seller.status !== 'approved' && (
                        <button 
                          onClick={() => handleAction(seller._id, 'approve')} 
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/10 transition-all cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {seller.status === 'approved' && (
                        <button 
                          onClick={() => handleAction(seller._id, 'suspend')} 
                          className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-500/10 transition-all cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                      {seller.status !== 'approved' && seller.status !== 'rejected' && (
                        <button 
                          onClick={() => handleAction(seller._id, 'reject')} 
                          className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/10 transition-all cursor-pointer"
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
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-dark-card px-6 py-4 rounded-[15px] border border-gray-150 dark:border-gray-800/50 shadow-soft dark:shadow-none mt-4">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg/40 disabled:opacity-50 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg/40 disabled:opacity-50 transition-all"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Showing page <span className="text-gray-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="text-gray-900 dark:text-white">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg p-2 text-gray-450 ring-1 ring-inset ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-dark-bg/40 focus:outline-none disabled:opacity-30 cursor-pointer transition-all"
                >
                  <span className="sr-only">Previous</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                {renderPageNumbers()}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-lg p-2 text-gray-450 ring-1 ring-inset ring-gray-200 dark:ring-gray-800 hover:bg-gray-50 dark:hover:bg-dark-bg/40 focus:outline-none disabled:opacity-30 cursor-pointer transition-all"
                >
                  <span className="sr-only">Next</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path>
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Seller Details Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-white dark:bg-dark-card rounded-[24px] shadow-2xl border border-gray-150 dark:border-gray-800/80 w-full max-w-lg overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-center bg-gray-50/70 dark:bg-dark-bg/20">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Merchant Profile</h3>
                <p className="text-xs text-gray-500 dark:text-gray-450 mt-0.5 font-medium">Full business verification application details.</p>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-lg font-bold p-1 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center gap-4.5">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-[#868CFF] flex items-center justify-center text-white text-xl font-bold shadow-md shadow-primary/10">
                  {selectedSeller.shopName?.charAt(0).toUpperCase() || 'M'}
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{selectedSeller.shopName}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider">{selectedSeller.businessType || 'General Retail'}</span>
                    <span className="text-gray-300 dark:text-gray-700 text-xs">•</span>
                    {getStatusBadge(selectedSeller.status)}
                  </div>
                </div>
              </div>

              {selectedSeller.status === 'rejected' && selectedSeller.rejectionReason && (
                <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-450 block uppercase tracking-wide">Rejection Reason</span>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-300 mt-1">{selectedSeller.rejectionReason}</p>
                </div>
              )}

              {/* General Info Grid */}
              <div className="grid grid-cols-2 gap-4.5 border-t border-gray-100 dark:border-gray-800/40 pt-4.5">
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Owner Name</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedSeller.ownerName || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Owner Email</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white break-all">{selectedSeller.userId?.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Owner Phone</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedSeller.userId?.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Application Date</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {new Date(selectedSeller.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t border-gray-100 dark:border-gray-800/40 pt-4.5 space-y-3">
                <h5 className="text-xs font-extrabold text-[#2B3674] dark:text-indigo-400 uppercase tracking-wider">Location Details</h5>
                
                {selectedSeller.userId?.location || selectedSeller.address ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Street Address</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {selectedSeller.address?.street || selectedSeller.userId?.location?.fullAddress || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">City</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {selectedSeller.address?.city || selectedSeller.userId?.location?.city || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Country</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">
                        {selectedSeller.address?.country || selectedSeller.userId?.location?.country || '—'}
                      </span>
                    </div>
                    {selectedSeller.userId?.location?.latitude !== undefined && selectedSeller.userId?.location?.longitude !== undefined && (
                      <div className="col-span-2 pt-2">
                        <a
                          href={`https://maps.google.com/?q=${selectedSeller.userId.location.latitude},${selectedSeller.userId.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs transition-all shadow-md shadow-primary/10"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          View Map Pin
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 italic">No business address specified.</p>
                )}
              </div>

              {/* Payment Details Section */}
              <div className="border-t border-gray-100 dark:border-gray-800/40 pt-4.5 space-y-3">
                <h5 className="text-xs font-extrabold text-[#2B3674] dark:text-indigo-400 uppercase tracking-wider">Payment Details</h5>
                {selectedSeller.bankDetails ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Bank Name</span>
                      <span className="text-sm font-bold text-gray-850 dark:text-white">{selectedSeller.bankDetails.bankName || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Account Number</span>
                      <span className="text-sm font-bold text-gray-850 dark:text-white">{selectedSeller.bankDetails.accountNumber || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">IFSC Code</span>
                      <span className="text-sm font-bold text-gray-855 dark:text-white">{selectedSeller.bankDetails.ifscCode || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">UPI ID</span>
                      <span className="text-sm font-bold text-gray-850 dark:text-white">{selectedSeller.bankDetails.upiId || '—'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 italic">No payment details specified.</p>
                )}
              </div>
            </div>
            
            {/* Modal Footer (with moderation controls) */}
            <div className="px-6 py-4.5 bg-gray-50/70 dark:bg-dark-bg/20 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center">
              <button
                onClick={() => setSelectedSeller(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              
              <div className="flex gap-2">
                {selectedSeller.status !== 'approved' && (
                  <button
                    onClick={() => handleAction(selectedSeller._id, 'approve')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Approve
                  </button>
                )}
                {selectedSeller.status === 'approved' && (
                  <button
                    onClick={() => handleAction(selectedSeller._id, 'suspend')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Suspend
                  </button>
                )}
                {selectedSeller.status !== 'approved' && selectedSeller.status !== 'rejected' && (
                  <button
                    onClick={() => handleAction(selectedSeller._id, 'reject')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerManagement
