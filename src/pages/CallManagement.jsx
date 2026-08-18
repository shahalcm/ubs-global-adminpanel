import React, { useState, useEffect } from 'react'
import api from '../services/api'
import {
  Phone, PhoneCall, PhoneOff, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Search, Filter, Calendar, Clock, RefreshCw, UserCheck, ShieldAlert
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CallManagement() {
  const [activeCalls, setActiveCalls] = useState([])
  const [callHistory, setCallHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Initiate Call Modal
  const [showCallModal, setShowCallModal] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchingUsers, setSearchingUsers] = useState(false)

  const fetchCalls = async () => {
    setLoading(true)
    try {
      // 1. Active calls
      const activeRes = await api.get('/calls/active')
      if (activeRes.data && activeRes.data.success) {
        setActiveCalls(activeRes.data.calls || [])
      }

      // 2. Call history
      const params = {
        page: pagination.page,
        limit: 20,
        search,
        status: statusFilter,
        callerType: typeFilter,
        startDate,
        endDate
      }
      const historyRes = await api.get('/calls/history', { params })
      if (historyRes.data && historyRes.data.success) {
        setCallHistory(historyRes.data.calls || [])
        setPagination(historyRes.data.pagination || { page: 1, pages: 1, total: 0 })
      }
    } catch (err) {
      console.error('Fetch calls error:', err)
      toast.error('Failed to load call logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCalls()
    const interval = setInterval(fetchCalls, 10000) // Poll active calls every 10s
    return () => clearInterval(interval)
  }, [pagination.page, statusFilter, typeFilter, startDate, endDate])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchCalls()
  }

  // Search users/sellers for call modal
  const handleUserSearch = async (e) => {
    const query = e.target.value
    setUserQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearchingUsers(true)
    try {
      const res = await api.get('/admin/users', { params: { search: query, limit: 5 } })
      if (res.data && res.data.success) {
        setSearchResults(res.data.users || res.data.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSearchingUsers(false)
    }
  }

  // Initiate call trigger
  const triggerCall = (user) => {
    setShowCallModal(false)
    window.dispatchEvent(new CustomEvent('admin:initiate-call', { detail: { user } }))
  }

  // Format seconds to mm:ss
  const formatDuration = (secs) => {
    if (!secs) return '00:00'
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">Completed</span>
      case 'missed':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400">Missed</span>
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">Rejected</span>
      case 'cancelled':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Cancelled</span>
      case 'ringing':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 animate-pulse">Ringing...</span>
      case 'accepted':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 animate-pulse">In Progress</span>
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <PhoneCall className="text-primary" size={28} />
            Call Management & Logs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor live WebRTC audio calls and review complete call records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCalls}
            className="p-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors shadow-xs"
            title="Refresh Logs"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setShowCallModal(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2.5 rounded-xl shadow-md transition-colors"
          >
            <Phone size={18} /> Initiate Outgoing Call
          </button>
        </div>
      </div>

      {/* Active Calls Live Monitoring Cards */}
      {activeCalls.length > 0 && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            Live Ongoing Calls ({activeCalls.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCalls.map((call) => (
              <div key={call._id} className="bg-white dark:bg-dark-card p-4 rounded-xl shadow-xs border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {call.callerName} → {call.receiverName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {call.callerType} to {call.receiverType}
                  </p>
                </div>
                {getStatusBadge(call.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-60">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by caller or receiver name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-sm outline-none focus:border-primary text-gray-900 dark:text-white"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 font-bold text-xs rounded-xl transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-xs font-bold text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-xs font-bold text-gray-700 dark:text-gray-300 outline-none"
          >
            <option value="">All Caller Types</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
          </select>
        </div>
      </div>

      {/* Call History Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-bg/50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Caller</th>
                <th className="py-4 px-6">Receiver</th>
                <th className="py-4 px-6">Call Type</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date & Time</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">Loading call history logs...</td>
                </tr>
              ) : callHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">No call history records found.</td>
                </tr>
              ) : (
                callHistory.map((call) => (
                  <tr key={call._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 dark:text-white">{call.callerName}</div>
                      <div className="text-xs text-gray-400 capitalize">{call.callerType}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 dark:text-white">{call.receiverName}</div>
                      <div className="text-xs text-gray-400 capitalize">{call.receiverType}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-600 dark:text-gray-300">
                      AUDIO
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-gray-800 dark:text-gray-200">
                      {formatDuration(call.duration)}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(call.status)}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {new Date(call.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => triggerCall({ _id: call.receiverId, name: call.receiverName, role: call.receiverType })}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                        title="Call User Again"
                      >
                        <Phone size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total calls)</span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 font-bold"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Outgoing Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-dark-card rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PhoneCall className="text-primary" size={20} /> Initiate Outgoing Call
            </h3>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userQuery}
                onChange={handleUserSearch}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-sm outline-none focus:border-primary"
              />

              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                {searchingUsers ? (
                  <p className="text-xs text-center py-4 text-gray-400">Searching users...</p>
                ) : searchResults.length === 0 ? (
                  <p className="text-xs text-center py-4 text-gray-400">Type at least 2 letters to search</p>
                ) : (
                  searchResults.map((usr) => (
                    <div key={usr._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{usr.name}</p>
                        <p className="text-xs text-gray-500">{usr.email || usr.phone} • {usr.role}</p>
                      </div>
                      <button
                        onClick={() => triggerCall(usr)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone size={14} /> Call
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCallModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
