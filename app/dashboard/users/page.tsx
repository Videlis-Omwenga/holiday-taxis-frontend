'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { isAdmin } from '@/lib/auth-token'
import {
  UserPlus,
  Trash2,
  Mail,
  User,
  Calendar,
  AlertCircle,
  X,
  Check,
  Edit2,
  Shield,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Key,
  Clock,
} from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
  status: 'active' | 'suspended' | 'deactivated' | 'locked'
  hasTempPassword?: boolean
  tempPasswordExpiresAt?: string | null
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '1234', isAdmin: false })
  const [editFormData, setEditFormData] = useState({ id: '', name: '', isAdmin: false, status: 'active' as 'active' | 'suspended' | 'deactivated' | 'locked' })
  const [tempPasswordData, setTempPasswordData] = useState({ userId: '', userName: '', tempPassword: '' })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)
  const [settingTempPassword, setSettingTempPassword] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Check if user is admin on mount
  useEffect(() => {
    if (!isAdmin()) {
      router.push('/unauthorized')
    }
  }, [router])

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers()
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'
      const token = localStorage.getItem('taxisToken')

      const response = await fetch(`${API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred'
      toast.error(`Failed to fetch users: ${errorMsg}`)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'
      const token = localStorage.getItem('taxisToken')

      const response = await fetch(`${API_URL}/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user')
      }

      setShowCreateModal(false)
      setFormData({ name: '', email: '', password: '1234', isAdmin: false })
      toast.success('User created successfully!')
      fetchUsers()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create user'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setCreating(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditing(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'
      const token = localStorage.getItem('taxisToken')

      const response = await fetch(`${API_URL}/auth/users/${editFormData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editFormData.name,
          isAdmin: editFormData.isAdmin,
          status: editFormData.status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user')
      }

      setShowEditModal(false)
      toast.success('User updated successfully!')
      fetchUsers()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update user'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setEditing(false)
    }
  }

  const handleSetTempPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingTempPassword(true)
    setError(null)

    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'
      const token = localStorage.getItem('taxisToken')

      const response = await fetch(`${API_URL}/auth/users/${tempPasswordData.userId}/temp-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tempPassword: tempPasswordData.tempPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to set temporary password')
      }

      setShowTempPasswordModal(false)
      setTempPasswordData({ userId: '', userName: '', tempPassword: '' })
      toast.success(`Temporary password set for ${tempPasswordData.userName}. Expires in 2 hours.`)
      fetchUsers()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to set temporary password'
      toast.error(errorMsg)
      setError(errorMsg)
    } finally {
      setSettingTempPassword(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'
      const token = localStorage.getItem('taxisToken')

      const response = await fetch(`${API_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete user')
      }

      setDeleteConfirm(null)
      toast.success('User deleted successfully!')
      fetchUsers()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete user'
      toast.error(errorMsg)
      setError(errorMsg)
    }
  }

  const openTempPasswordModal = (user: User) => {
    setTempPasswordData({
      userId: user.id,
      userName: user.name,
      tempPassword: Math.random().toString(36).slice(-8), // Generate random password
    })
    setShowTempPasswordModal(true)
  }

  const openEditModal = (user: User) => {
    setEditFormData({
      id: user.id,
      name: user.name,
      isAdmin: user.isAdmin,
      status: user.status,
    })
    setShowEditModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </span>
        )
      case 'suspended':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspended
          </span>
        )
      case 'deactivated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Deactivated
          </span>
        )
      case 'locked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Lock className="h-3 w-3 mr-1" />
            Locked
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">User Management</h1>
        <p className="text-sm text-gray-600">
          Create and manage system users. Default password for new users is "1234"
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Users</h2>
          <p className="text-sm text-gray-500 mt-1">{users.length} total users</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <UserPlus className="h-5 w-5" />
          Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No users found</p>
                    <p className="text-sm mt-2">Create your first user to get started</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <User className="h-3 w-3 mr-1" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {deleteConfirm === user.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-600">Confirm delete?</span>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Confirm delete"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openTempPasswordModal(user)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Set temporary password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
              <button
                onClick={() => !creating && setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={creating}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  disabled={creating}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john@example.com"
                  disabled={creating}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password (optional)
                </label>
                <input
                  id="password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Default: 1234"
                  disabled={creating}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default password "1234"
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <input
                  id="isAdmin"
                  type="checkbox"
                  checked={formData.isAdmin}
                  onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={creating}
                />
                <label htmlFor="isAdmin" className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Grant admin privileges
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => !editing && setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={editing}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  disabled={editing}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <input
                  id="edit-isAdmin"
                  type="checkbox"
                  checked={editFormData.isAdmin}
                  onChange={(e) => setEditFormData({ ...editFormData, isAdmin: e.target.checked })}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={editing}
                />
                <label htmlFor="edit-isAdmin" className="flex items-center gap-2 text-sm font-medium text-gray-900 cursor-pointer">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Admin privileges
                </label>
              </div>

              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <select
                  id="edit-status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'suspended' | 'deactivated' | 'locked' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={editing}
                >
                  <option value="active">Active - Can access system</option>
                  <option value="suspended">Suspended - Temporarily blocked</option>
                  <option value="deactivated">Deactivated - Account disabled</option>
                  <option value="locked">Locked - Account locked</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Only active users can log in to the system
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={editing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editing ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Temp Password Modal */}
      {showTempPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Set Temporary Password</h3>
              <button
                onClick={() => !settingTempPassword && setShowTempPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={settingTempPassword}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-orange-900">Temporary Password Policy</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    User <strong>{tempPasswordData.userName}</strong> must change this password within 2 hours or their account will be locked.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSetTempPassword} className="space-y-4">
              <div>
                <label htmlFor="temp-password" className="block text-sm font-medium text-gray-700 mb-2">
                  Temporary Password
                </label>
                <input
                  id="temp-password"
                  type="text"
                  value={tempPasswordData.tempPassword}
                  onChange={(e) => setTempPasswordData({ ...tempPasswordData, tempPassword: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                  placeholder="Enter temporary password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Share this password securely with the user
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTempPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={settingTempPassword}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={settingTempPassword}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {settingTempPassword ? 'Setting...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
