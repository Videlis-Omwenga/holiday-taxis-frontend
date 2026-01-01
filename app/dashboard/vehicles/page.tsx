'use client'

import { useEffect, useState, useMemo } from 'react'
import { Vehicle } from '@/types'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import {
  RefreshCw,
  Car,
  Wifi,
  WifiOff,
  MapPin,
  Gauge,
  Users,
  Package,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  X,
} from 'lucide-react'

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'available' | 'allocated'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState<string>('registrationNumber')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchVehicles()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => fetchVehicles(false), 30000)
    return () => clearInterval(interval)
  }, [filter])

  const fetchVehicles = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
      setError(null)
    } else {
      setRefreshing(true)
    }

    try {
      const url =
        filter === 'available'
          ? '/api/vehicles?available=true'
          : filter === 'allocated'
          ? '/api/vehicles?status=ALLOCATED'
          : '/api/vehicles'

      const response = await fetchWithAuth(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setVehicles(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch vehicles')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred'
      toast.error(`Failed to fetch vehicles: ${errorMsg}`)
      setError(errorMsg)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Filter and sort vehicles
  const filteredAndSortedVehicles = useMemo(() => {
    let filtered = vehicles.filter((vehicle) => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        vehicle.registrationNumber?.toLowerCase().includes(query) ||
        vehicle.make?.toLowerCase().includes(query) ||
        vehicle.model?.toLowerCase().includes(query) ||
        vehicle.wialonUnitId?.toString().includes(query)
      )
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof Vehicle]
      let bValue: any = b[sortField as keyof Vehicle]

      if (typeof aValue === 'string') aValue = aValue.toLowerCase()
      if (typeof bValue === 'string') bValue = bValue.toLowerCase()

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [vehicles, searchQuery, sortField, sortOrder])

  const stats = useMemo(() => {
    const total = vehicles.length
    const online = vehicles.filter((v) => v.isOnline).length
    const available = vehicles.filter((v) => v.status?.toUpperCase() === 'AVAILABLE').length
    const onTransfer = vehicles.filter((v) => v.status?.toUpperCase() === 'ON_TRANSFER').length

    return { total, online, available, onTransfer }
  }, [vehicles])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  const getStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase()
    const styles = {
      AVAILABLE: 'bg-green-100 text-green-800',
      ON_TRANSFER: 'bg-blue-100 text-blue-800',
      ON_TRIP: 'bg-purple-100 text-purple-800',
      MAINTENANCE: 'bg-red-100 text-red-800',
      OFFLINE: 'bg-gray-100 text-gray-800',
    }
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          styles[statusUpper as keyof typeof styles] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status?.replace('_', ' ') || 'N/A'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mr-3" />
        <div className="text-gray-600">Loading vehicles...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Fleet Management</h1>
        <p className="text-sm text-gray-600">
          Monitor your entire vehicle fleet in real-time. View live GPS locations, speeds, connection status, and vehicle availability synced from Wialon.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => fetchVehicles()}
                className="text-sm font-medium text-red-700 hover:text-red-600 mt-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
            <button
              onClick={() => fetchVehicles(false)}
              disabled={refreshing}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {filteredAndSortedVehicles.length} of {vehicles.length} vehicles
            {refreshing && <span className="text-blue-600 ml-2">Updating...</span>}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600 mt-1">Total Vehicles</div>
        </button>

        <div className="p-4 rounded-lg border border-gray-200 bg-white">
          <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          <div className="text-sm text-gray-600 mt-1">Online</div>
        </div>

        <button
          onClick={() => setFilter('available')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'available'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-green-300'
          }`}
        >
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-gray-600 mt-1">Available</div>
        </button>

        <button
          onClick={() => setFilter('allocated')}
          className={`p-4 rounded-lg border-2 transition-all ${
            filter === 'allocated'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
          }`}
        >
          <div className="text-2xl font-bold text-blue-600">{stats.onTransfer}</div>
          <div className="text-sm text-gray-600 mt-1">On Transfer</div>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by registration, make, model, or Wialon ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('registrationNumber')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Registration
                    <SortIcon field="registrationNumber" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('make')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Vehicle
                    <SortIcon field="make" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th
                  onClick={() => handleSort('currentSpeed')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    Speed
                    <SortIcon field="currentSpeed" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Connection
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wialon ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">No vehicles found</p>
                    <p className="text-sm mt-2">
                      {vehicles.length === 0
                        ? 'Sync with Wialon to import your fleet data'
                        : 'Try adjusting your search criteria'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vehicle.registrationNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicle.make && vehicle.model
                          ? `${vehicle.make} ${vehicle.model}`
                          : vehicle.make || vehicle.model || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vehicle.vehicleType?.replace('_', ' ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(vehicle.status || 'offline')}
                      {vehicle.ignitionOn && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-xs text-gray-500">Ignition On</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {vehicle.currentLatitude && vehicle.currentLongitude ? (
                          <span className="text-xs">
                            {Number(vehicle.currentLatitude).toFixed(4)},{' '}
                            {Number(vehicle.currentLongitude).toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-gray-500">No GPS data</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm">
                        <Gauge className="h-4 w-4 text-gray-400" />
                        <span className={vehicle.currentSpeed > 0 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                          {vehicle.currentSpeed || 0} km/h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{vehicle.seatingCapacity || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Package className="h-3 w-3 text-gray-400" />
                        <span>{vehicle.luggageCapacity || 0} bags</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vehicle.isOnline ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Wifi className="h-4 w-4" />
                          <span className="text-xs font-medium">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <WifiOff className="h-4 w-4" />
                          <span className="text-xs">Offline</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-gray-600">
                        {vehicle.wialonUnitId || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-sm text-gray-500 text-center">
        Last updated: {format(new Date(), 'PPpp')} • Auto-refresh enabled (30s)
      </div>
    </div>
  )
}
