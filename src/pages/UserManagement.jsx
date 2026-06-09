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
      
      // Reload users
      await loadUsers(currentPage, debouncedSearch, role)
      
      // Sync selectedUser state if details modal is open
      if (selectedUser && selectedUser._id === id) {
        const refreshedUsers = await getUsers({ page: currentPage, limit, search: debouncedSearch, role })
        const updatedUser = refreshedUsers.users?.find(u => u._id === id)
        if (updatedUser) {
          setSelectedUser(updatedUser)
        } else {
          setSelectedUser(null)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user')
    }
  }

  const getInitialsAvatar = (name, sizeClass = "w-9 h-9 text-[10px]") => {
    const initials = name
      ? name.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase()
      : 'U'
    return (
      <div className={`${sizeClass} rounded-full bg-linear-to-br from-primary to-[#868CFF] flex items-center justify-center text-white font-extrabold shadow-sm shadow-primary/10`}>
        {initials}
      </div>
    )
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
          <h1 className="text-2xl font-extrabold text-[#2B3674] dark:text-white tracking-tight">User Management</h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Monitor user accounts, details, and permissions.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-[15px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs font-semibold shadow-soft dark:shadow-none"
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2.5 rounded-[15px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs font-bold shadow-soft dark:shadow-none cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-dark-card rounded-[20px] shadow-soft dark:shadow-none border border-gray-150 dark:border-gray-800/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800/40">
            <thead className="bg-gray-50/70 dark:bg-dark-bg/20">
              <tr>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">User</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">City / Location</th>
                <th className="px-6 py-4.5 text-left text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4.5 text-right text-xs font-bold text-gray-500 dark:text-gray-450 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/30">
              {loading ? (
                Array(limit).fill(0).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-dark-bg"></div><div className="h-4 bg-gray-200 dark:bg-dark-bg rounded w-20"></div></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-150 dark:bg-dark-bg rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-dark-bg rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-100 dark:bg-dark-bg rounded-full w-14"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 dark:bg-dark-bg rounded-lg w-28 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm font-semibold text-gray-400 dark:text-gray-500 bg-gray-50/20 dark:bg-dark-bg/10">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      No users found matching the search.
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-bg/15 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-150 dark:border-gray-800"
                          />
                        ) : (
                          getInitialsAvatar(user.name, "w-9 h-9 text-[10px]")
                        )}
                        <span onClick={() => setSelectedUser(user)} className="text-sm font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary dark:hover:text-accent transition-colors">
                          {user.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">{user.email || '—'}</td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">{user.phone || '—'}</td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'admin' 
                          ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400'
                          : user.role === 'seller'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                      {user.location?.city ? `${user.location.city}, ${user.location.country || ''}`.replace(/,\s*,/, ',').trim() : '—'}
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                        user.isBlocked 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' 
                          : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                      }`}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-right text-xs font-bold space-x-1.5">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-dark-bg/60 text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => toggleBlock(user._id, user.isBlocked)}
                        className={`px-3.5 py-2 rounded-xl text-white shadow-sm transition-all cursor-pointer ${
                          user.isBlocked 
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10' 
                            : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                        }`}
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 animate-fade-in">
          <div className="bg-white dark:bg-dark-card rounded-[24px] shadow-2xl border border-gray-150 dark:border-gray-800/80 w-full max-w-lg overflow-hidden animate-slide-up">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800/50 flex justify-between items-center bg-gray-50/70 dark:bg-dark-bg/20">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">User Account Details</h3>
                <p className="text-xs text-gray-500 dark:text-gray-450 mt-0.5 font-medium">Verify user role, location, and account status.</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
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
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 dark:border-indigo-900/30 shadow-sm"
                  />
                ) : (
                  getInitialsAvatar(selectedUser.name, "w-16 h-16 text-lg")
                )}
                <div>
                  <h4 className="text-lg font-extrabold text-gray-900 dark:text-white leading-tight">{selectedUser.name || 'Unknown'}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-bold text-gray-450 dark:text-gray-400 uppercase tracking-wider">{selectedUser.role}</span>
                    <span className="text-gray-300 dark:text-gray-700 text-xs">•</span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      selectedUser.isBlocked 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400' 
                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                    }`}>
                      {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* General Info Grid */}
              <div className="grid grid-cols-2 gap-4.5 border-t border-gray-100 dark:border-gray-800/40 pt-4.5">
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Email Address</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white break-all">{selectedUser.email || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Phone Number</span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedUser.phone || '—'}</span>
                </div>
              </div>

              {/* Location Section */}
              <div className="border-t border-gray-100 dark:border-gray-800/40 pt-4.5 space-y-3">
                <h5 className="text-xs font-extrabold text-[#2B3674] dark:text-indigo-400 uppercase tracking-wider">Location Information</h5>
                
                {selectedUser.location ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Full Address</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedUser.location.fullAddress || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">City</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedUser.location.city || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">State</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedUser.location.state || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Country</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedUser.location.country || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Latitude</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedUser.location.latitude || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 block uppercase font-bold tracking-wider">Longitude</span>
                      <span className="text-sm font-bold text-gray-800 dark:text-white">{selectedUser.location.longitude || '—'}</span>
                    </div>
                    {selectedUser.location.latitude !== undefined && selectedUser.location.longitude !== undefined && (
                      <div className="col-span-2 pt-2">
                        <a
                          href={`https://maps.google.com/?q=${selectedUser.location.latitude},${selectedUser.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs transition-all shadow-md shadow-primary/10"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          View on Map
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 italic">Location information not available</p>
                )}
              </div>
            </div>
            
            {/* Modal Footer (with moderation controls) */}
            <div className="px-6 py-4.5 bg-gray-50/70 dark:bg-dark-bg/20 border-t border-gray-100 dark:border-gray-800/50 flex justify-between items-center">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
              
              <button
                onClick={() => toggleBlock(selectedUser._id, selectedUser.isBlocked)}
                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm transition-all cursor-pointer ${
                  selectedUser.isBlocked 
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10' 
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                }`}
              >
                {selectedUser.isBlocked ? 'Unblock Account' : 'Block Account'}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  )
}

export default UserManagement;
