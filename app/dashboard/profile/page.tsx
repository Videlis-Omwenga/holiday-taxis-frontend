'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getUser, getToken } from '@/lib/auth-token'
import { User, Lock, Save, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'

export default function ProfilePage() {
  const [user, setUser] = useState(getUser())
  const [name, setName] = useState(user?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    setName(currentUser?.name || '')
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdatingProfile(true)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to update profile')
      }

      toast.success('Profile updated successfully!')

      // Reload to get new token with updated name
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(errorMsg)
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 4) {
      toast.error('Password must be at least 4 characters')
      return
    }

    setChangingPassword(true)

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password')
      }

      toast.success('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      // Reload to get new token without temp password flag
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to change password'
      toast.error(errorMsg)
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-sm text-gray-600">
          Update your personal information and change your password
        </p>
      </div>

      {/* Temporary Password Warning */}
      {user?.hasTempPassword && user?.tempPasswordExpiresAt && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-900">Temporary Password Active</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You are using a temporary password. Please change it before{' '}
                <strong>{new Date(user.tempPasswordExpiresAt).toLocaleString()}</strong> or your account will be locked.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update Profile Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your full name"
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile || name === user?.name}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {updatingProfile ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="h-4 w-4" />
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
