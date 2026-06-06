import React, { useEffect, useState } from 'react'
import { getUsers, blockUser, unblockUser } from '../services/adminService'
import toast from 'react-hot-toast'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [role, setRole] = useState('')
  
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

  const loadUsers = async (page = currentPage, search = debouncedSearch, userRole = role) => {
    try {
      setLoading(true)
      const data = await getUsers({ page, limit, search, role: userRole })
      setUsers(data.users || [])
      setTotalPages(data.pagination?.pages || 1)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers(currentPage, debouncedSearch, role)
  }, [currentPage, debouncedSearch, role])

  const toggleBlock = async (id, blocked) => {
    try {
      if (blocked) {
        await unblockUser(id)
        toast.success('User unblocked')
      } else {
        await blockUser(id)
        toast.success('User blocked')
      }
      loadUsers(currentPage, debouncedSearch, role)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user')
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
              ? 'z-10 bg-[#0A0F2C] text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
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
        <h1 className="text-2xl font-bold dark:text-white">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor user accounts and perform actions.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-850 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
          />
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-855 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm shadow-sm"
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-slate-850">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-800">
            {loading ? (
              Array(limit).fill(0).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-4"><div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-12"></div></td>
                  <td className="px-4 py-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20"></div></td>
                  <td className="px-4 py-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-14"></div></td>
                  <td className="px-4 py-4 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-28 ml-auto"></div></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 bg-slate-50/50 dark:bg-slate-850/50">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:underline" onClick={() => setSelectedUser(user)}>{user.name || 'Unknown'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{user.email || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{user.phone || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-350 capitalize">{user.role}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {user.location?.city ? `${user.location.city}, ${user.location.country || ''}`.replace(/,\s*,/, ',').trim() : '—'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${user.isBlocked ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
                      {user.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-200 mr-2 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => toggleBlock(user._id, user.isBlocked)}
                      className={`px-3 py-1 rounded-lg text-white font-medium transition-colors ${user.isBlocked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}
                    >
                      {user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-850">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar || 'https://via.placeholder.com/150'}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/30"
                />
                <div>
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedUser.name || 'Unknown'}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-450 uppercase tracking-wide font-semibold">{selectedUser.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">Email</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white break-all">{selectedUser.email || '—'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">Phone</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.phone || '—'}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-4">
                <h5 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-wider">Location Information</h5>
                
                {selectedUser.location ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">Full Address</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.location.fullAddress || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">City</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.location.city || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">State</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.location.state || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">Country</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.location.country || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">Latitude</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.location.latitude || '—'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 dark:text-gray-500 block uppercase font-bold">Longitude</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.location.longitude || '—'}</span>
                    </div>
                    {selectedUser.location.latitude !== undefined && selectedUser.location.longitude !== undefined && (
                      <div className="col-span-2 pt-2">
                        <a
                          href={`https://maps.google.com/?q=${selectedUser.location.latitude},${selectedUser.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-100 dark:shadow-none"
                        >
                          📍 View on Map
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">Location not available</p>
                )}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-850 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white text-sm font-semibold transition-colors"
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

export default UserManagement;
