'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>

          <p className="text-gray-600 mb-2">
            You don't have permission to access this page.
          </p>

          <p className="text-sm text-gray-500 mb-8">
            This page is restricted to administrators only. Please contact your system administrator if you believe you should have access.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Home className="h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
