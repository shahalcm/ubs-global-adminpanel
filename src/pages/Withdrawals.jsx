import React, { useState, useEffect } from 'react'
import { Landmark, Check, X, Search, RefreshCw, DollarSign, Clock, ArrowUpRight } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

const statusConfig = {
  'pending': { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-300', label: 'PENDING' },
  'processing': { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-300', label: 'PROCESSING' },
  'completed': { bg: 'bg-green-50 dark:bg-green-500/10', text: 'text-green-700 dark:text-green-300', label: 'COMPLETED' },
  'rejected': { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-700 dark:text-red-300', label: 'REJECTED' }
}

export default function Withdrawals() {
  const [requests, setRequests] = useState([])
  const [totalCommissions, setTotalCommissions] = useState('0.00')
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState(null)
  
  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await api.get('/payments/admin/commissions')
      if (res.data.success) {
        setRequests(res.data.withdrawalRequests || [])
        setTotalCommissions(res.data.totalCommissions || '0.00')
      }
    } catch (err) {
      toast.error('Failed to load withdrawal requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleAction = async (id, status) => {
    let adminNote = ''
    if (status === 'rejected') {
      const reason = window.prompt('Enter rejection reason (optional):')
      if (reason === null) return // Cancelled
      adminNote = reason
    } else {
      const confirmApprove = window.confirm('Are you sure you want to approve this withdrawal request?')
      if (!confirmApprove) return
    }

    setActioningId(id)
    try {
      const res = await api.patch(`/payments/admin/withdrawals/${id}`, { status, adminNote })
      if (res.data.success) {
        toast.success(`Withdrawal request ${status === 'completed' ? 'approved' : 'rejected'} successfully`)
        fetchRequests()
      } else {
        toast.error(res.data.message || 'Operation failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update withdrawal status')
    } finally {
      setActioningId(null)
    }
  }

  // Analytics helper calculations
  const pendingRequests = requests.filter(r => r.status === 'pending')
  const totalPendingAmount = pendingRequests.reduce((sum, r) => sum + (r.amount || 0), 0)
  
  const completedRequests = requests.filter(r => r.status === 'completed')
  const totalCompletedAmount = completedRequests.reduce((sum, r) => sum + (r.amount || 0), 0)

  // Filter lists
  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'All' || req.status?.toLowerCase() === statusFilter.toLowerCase()
    const shopName = req.sellerId?.shopName || ''
    const matchesSearch = shopName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-[#2B3674] dark:text-white flex items-center gap-2">
            <Landmark className="text-primary dark:text-accent" /> Withdrawal Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and process balance withdrawal requests from sellers, and track platform commissions.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-accent hover:bg-primary/20 dark:hover:bg-primary/30 px-4 py-2.5 rounded-xl font-semibold transition cursor-pointer"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-primary/10 group-hover:scale-150 transition duration-500 pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <DollarSign size={20} className="text-primary dark:text-accent" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-150 text-green-800 dark:bg-green-950/30 dark:text-green-400">
              Lifetime Earnings
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Platform Commissions</p>
          <h2 className="text-3xl font-extrabold text-[#2B3674] dark:text-white mt-2">${Number(totalCommissions).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-yellow-500/10 group-hover:scale-150 transition duration-500 pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center">
              <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400">
              {pendingRequests.length} Pending
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Pending Withdrawals</p>
          <h2 className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 mt-2">${totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-green-500/10 group-hover:scale-150 transition duration-500 pointer-events-none" />
          <div className="flex justify-between items-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
              <ArrowUpRight size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-150 text-green-800 dark:bg-green-950/30 dark:text-green-400">
              Processed
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Paid to Sellers</p>
          <h2 className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">${totalCompletedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by seller shop name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mr-2 hidden sm:inline-block">Filter Status:</span>
          {['All', 'Pending', 'Processing', 'Completed', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === status
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-750'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-700 uppercase">
              <tr>
                <th className="p-4 text-xs">Seller Shop</th>
                <th className="p-4 text-xs">Amount Requested</th>
                <th className="p-4 text-xs">Bank Details</th>
                <th className="p-4 text-xs">Request Date</th>
                <th className="p-4 text-xs">Status</th>
                <th className="p-4 text-right text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Loading withdrawal requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="p-4 font-bold text-primary dark:text-accent">
                      {req.sellerId?.shopName || 'Unknown Shop'}
                    </td>
                    <td className="p-4 font-extrabold text-gray-900 dark:text-white text-base">
                      ${req.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      {req.bankDetails ? (
                        <div className="text-xs space-y-0.5 bg-gray-50 dark:bg-gray-900 p-2.5 rounded-xl border border-gray-150 dark:border-gray-800 inline-block font-mono">
                          <p><span className="text-gray-400">Account:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{req.bankDetails.accountNumber}</span></p>
                          <p><span className="text-gray-400">IFSC Code:</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{req.bankDetails.ifscCode}</span></p>
                          {req.bankDetails.bankName && <p><span className="text-gray-400">Bank:</span> <span className="text-gray-600 dark:text-gray-300">{req.bankDetails.bankName}</span></p>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {new Date(req.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      {(() => {
                        const status = req.status?.toLowerCase() || 'pending';
                        const config = statusConfig[status] || { bg: 'bg-gray-50 dark:bg-gray-500/10', text: 'text-gray-700 dark:text-gray-300', label: status.toUpperCase() };
                        return (
                          <div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block ${config.bg} ${config.text}`}>
                              {config.label}
                            </span>
                            {req.adminNote && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-37.5 truncate" title={req.adminNote}>
                                Note: {req.adminNote}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-4 text-right">
                      {['pending', 'processing'].includes(req.status?.toLowerCase()) ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleAction(req._id, 'completed')}
                            disabled={actioningId === req._id}
                            className="px-3 py-1.5 bg-green-500/15 hover:bg-green-500/25 text-green-600 dark:text-green-400 rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer disabled:opacity-50"
                            title="Approve & Release Funds"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleAction(req._id, 'rejected')}
                            disabled={actioningId === req._id}
                            className="px-3 py-1.5 bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 rounded-xl transition flex items-center gap-1 text-xs font-bold cursor-pointer disabled:opacity-50"
                            title="Reject Request"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-semibold uppercase">
                          {req.status === 'completed' ? 'Processed' : 'Archived'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
