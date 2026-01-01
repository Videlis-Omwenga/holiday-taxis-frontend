'use client'

import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="bg-white rounded-lg shadow p-12 text-center">
        <SettingsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Settings Coming Soon
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Configure system preferences, API connections, user roles, and more.
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p>Planned settings:</p>
          <ul className="mt-2 space-y-1">
            <li>• Wialon API configuration</li>
            <li>• HolidayTaxis API settings</li>
            <li>• User management and roles</li>
            <li>• Notification preferences</li>
            <li>• Sync intervals</li>
            <li>• Default allocation rules</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
