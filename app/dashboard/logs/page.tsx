'use client'

import React, { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react'
import { getToken } from '@/lib/auth-token'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'

interface SubmissionLog {
  id: string
  bookingId: string
  holidayTaxisBookingRef: string
  status: 'success' | 'failed' | 'pending'
  requestPayload?: any
  responseData?: any
  errorMessage?: string
  httpStatusCode?: number
  attemptedAt: string
  driverName?: string
  vehicleReg?: string
  passengerName?: string
  booking?: {
    id: string
    passengerName: string
    pickupLocation: string
    dropoffLocation: string
    pickupDateTime: string
  }
}

interface Stats {
  total: number
  success: number
  failed: number
  pending: number
}

export default function LogsPage() {
  const [logs, setLogs] = useState<SubmissionLog[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, success: 0, failed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [statusFilter])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      const token = getToken()
      const response = await axios.get(`${API_URL}/logs/holidaytaxis?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setLogs(response.data)
    } catch (error) {
      toast.error('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = getToken()
      const response = await axios.get(`${API_URL}/logs/holidaytaxis/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setStats(response.data)
    } catch (error) {
      toast.error('Failed to fetch statistics')
    }
  }

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      log.passengerName?.toLowerCase().includes(query) ||
      log.holidayTaxisBookingRef.toLowerCase().includes(query) ||
      log.driverName?.toLowerCase().includes(query) ||
      log.vehicleReg?.toLowerCase().includes(query) ||
      log.errorMessage?.toLowerCase().includes(query)
    )
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Success
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </span>
        )
      default:
        return null
    }
  }

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mr-3" />
        <div className="text-gray-600">Loading logs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">HolidayTaxis Submission Logs</h1>
        <p className="text-sm text-gray-600">
          Track all booking submissions to HolidayTaxis. Monitor success/failure status, view detailed request/response data, and troubleshoot integration issues.
        </p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">All submission attempts to HolidayTaxis API</p>
        </div>
        <button
          onClick={() => {
            fetchLogs()
            fetchStats()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Submissions</div>
        </button>

        <button
          onClick={() => setStatusFilter('success')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'success'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-green-300'
          }`}
        >
          <div className="text-2xl font-bold text-green-600">{stats.success}</div>
          <div className="text-sm text-gray-600 mt-1">Successful</div>
        </button>

        <button
          onClick={() => setStatusFilter('failed')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'failed'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-white hover:border-red-300'
          }`}
        >
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600 mt-1">Failed</div>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-4 rounded-lg border-2 transition-all ${
            statusFilter === 'pending'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-yellow-300'
          }`}
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600 mt-1">Pending</div>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by passenger, booking ref, driver, vehicle, or error..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passenger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HT Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver / Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Attempted At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(log.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {log.passengerName || log.booking?.passengerName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {log.holidayTaxisBookingRef}
                        </div>
                        {log.httpStatusCode && (
                          <div className="text-xs text-gray-500 mt-1">
                            HTTP {log.httpStatusCode}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{log.driverName || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{log.vehicleReg || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(log.attemptedAt), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(log.attemptedAt), 'h:mm:ss a')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            setExpandedLog(expandedLog === log.id ? null : log.id)
                          }
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          {expandedLog === log.id ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Show
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedLog === log.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="space-y-4">
                            {log.errorMessage && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                  <div>
                                    <h4 className="text-sm font-semibold text-red-900">
                                      Error Message
                                    </h4>
                                    <p className="text-sm text-red-700 mt-1">
                                      {log.errorMessage}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                              {log.requestPayload && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                    Request Payload
                                  </h4>
                                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.requestPayload, null, 2)}
                                  </pre>
                                </div>
                              )}

                              {log.responseData && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                    Response Data
                                  </h4>
                                  <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                                    {JSON.stringify(log.responseData, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
