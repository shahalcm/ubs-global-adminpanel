import React, { useEffect, useState } from 'react'
import { getUsers, blockUser, unblockUser } from '../services/adminService'
import toast from 'react-hot-toast'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers({ page: 1, limit: 50 })
      setUsers(data.users || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleBlock = async (id, blocked) => {
    try {
      if (blocked) {
        await unblockUser(id)
        toast.success('User unblocked')
      } else {
        await blockUser(id)
        toast.success('User blocked')
      }
      loadUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white mb-6">User Management</h1>
        <p className="text-gray-500 mt-1">Monitor user accounts and perform actions.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">No users found.</td>
              </tr>
            ) : users.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || 'Unknown'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{user.email || user.phone || '—'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {user.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => toggleBlock(user._id, user.isBlocked)}
                    className={`px-3 py-1 rounded-lg text-white ${user.isBlocked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UserManagement;
