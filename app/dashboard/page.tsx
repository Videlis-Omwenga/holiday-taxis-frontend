'use client'

import { useEffect, useState, useMemo } from 'react'
import { Booking, VehicleSuggestion, Driver } from '@/types'
import { apiClient } from '@/lib/api-client'
import BookingsList from '@/components/bookings/BookingsList'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
  Search,
  Filter,
  Calendar,
  RefreshCw,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'

type SortField = 'pickupDateTime' | 'passengerName' | 'status' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [suggestions, setSuggestions] = useState<VehicleSuggestion[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [showAllocationModal, setShowAllocationModal] = useState(false)
  const [allocating, setAllocating] = useState(false)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(true)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Sorting states
  const [sortField, setSortField] = useState<SortField>('pickupDateTime')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  useEffect(() => {
    fetchBookings()
    fetchDrivers()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getBookings()
      setBookings(data as Booking[])
    } catch (error) {
      toast.error('Failed to fetch bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchDrivers = async () => {
    try {
      const data = await apiClient.getAvailableDrivers()
      setDrivers(data as Driver[])
    } catch (error) {
      toast.error('Failed to fetch drivers. Please try again.')
    }
  }

  const handleSelectBooking = async (booking: Booking) => {
    setSelectedBooking(booking)
    setShowAllocationModal(true)

    // Fetch vehicle suggestions
    try {
      const data = await apiClient.getSuggestedVehicles(booking.id)
      setSuggestions(data as VehicleSuggestion[])
    } catch (error) {
      toast.error('Failed to fetch vehicle suggestions. Please try again.')
    }
  }

  const handleAllocate = async (vehicleId: string, driverId: string) => {
    if (!selectedBooking) return

    setAllocating(true)
    try {
      await apiClient.allocateBooking(selectedBooking.id, {
        vehicleId,
        driverId,
      })
      toast.success('Vehicle allocated successfully!')
      setShowAllocationModal(false)
      fetchBookings()
    } catch (error: any) {
      toast.error('Failed to allocate: ' + (error.response?.data?.message || error.message))
    } finally {
      setAllocating(false)
    }
  }

  // Filtering and sorting logic
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = [...bookings]

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((b) => b.status === statusFilter)
    }

    // Search filter (passenger name, phone, flight number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (b) =>
          b.passengerName?.toLowerCase().includes(query) ||
          b.passengerPhone?.toLowerCase().includes(query) ||
          b.flightNumber?.toLowerCase().includes(query) ||
          b.pickupLocation?.toLowerCase().includes(query) ||
          b.dropoffLocation?.toLowerCase().includes(query)
      )
    }

    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(
        (b) => new Date(b.pickupDateTime) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      filtered = filtered.filter(
        (b) => new Date(b.pickupDateTime) <= new Date(dateTo + 'T23:59:59')
      )
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'pickupDateTime':
          aValue = new Date(a.pickupDateTime).getTime()
          bValue = new Date(b.pickupDateTime).getTime()
          break
        case 'passengerName':
          aValue = a.passengerName?.toLowerCase() || ''
          bValue = b.passengerName?.toLowerCase() || ''
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [bookings, statusFilter, searchQuery, dateFrom, dateTo, sortField, sortOrder])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedBookings = filteredAndSortedBookings.slice(startIndex, endIndex)

  // Statistics
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      allocated: bookings.filter((b) => b.status === 'allocated').length,
      completed: bookings.filter((b) => b.status === 'completed').length,
      cancelled: bookings.filter((b) => b.status === 'cancelled').length,
    }
  }, [bookings])

  const handleClearFilters = () => {
    setStatusFilter('all')
    setSearchQuery('')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const handleExportCSV = () => {
    const headers = [
      'Passenger Name',
      'Phone',
      'Pickup Location',
      'Dropoff Location',
      'Pickup Date/Time',
      'Passengers',
      'Luggage',
      'Flight Number',
      'Status',
    ]

    const rows = filteredAndSortedBookings.map((b) => [
      b.passengerName,
      b.passengerPhone || '',
      b.pickupLocation,
      b.dropoffLocation,
      format(new Date(b.pickupDateTime), 'yyyy-MM-dd HH:mm'),
      b.numberOfPassengers,
      b.numberOfLuggage,
      b.flightNumber || '',
      b.status,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Bookings exported successfully!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
        <div className="text-gray-600">Loading bookings...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 w-full">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Bookings Management</h1>
          <p className="text-sm text-gray-600">
            View and manage all passenger bookings. Filter by status, search by passenger details, allocate vehicles and drivers, or export booking data.
          </p>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-3 min-[1536px]:grid-cols-5 gap-3 sm:gap-4">
          <button
            onClick={() => {
              setStatusFilter('all')
              setCurrentPage(1)
            }}
            className={`group relative p-2 sm:p-5 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              statusFilter === 'all'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/20'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="text-xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-[9px] sm:text-xs font-medium text-gray-600 mt-0.5 sm:mt-1">Total Bookings</div>
            </div>
            {statusFilter === 'all' && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
            )}
          </button>

          <button
            onClick={() => {
              setStatusFilter('pending')
              setCurrentPage(1)
            }}
            className={`group relative p-2 sm:p-5 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              statusFilter === 'pending'
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100/50 shadow-lg shadow-yellow-500/20'
                : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="text-xl sm:text-3xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-[9px] sm:text-xs font-medium text-gray-600 mt-0.5 sm:mt-1">Pending</div>
            </div>
            {statusFilter === 'pending' && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent"></div>
            )}
          </button>

          <button
            onClick={() => {
              setStatusFilter('allocated')
              setCurrentPage(1)
            }}
            className={`group relative p-2 sm:p-5 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              statusFilter === 'allocated'
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/20'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="text-xl sm:text-3xl font-bold text-blue-600">{stats.allocated}</div>
              <div className="text-[9px] sm:text-xs font-medium text-gray-600 mt-0.5 sm:mt-1">Allocated</div>
            </div>
            {statusFilter === 'allocated' && (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
            )}
          </button>

          <button
            onClick={() => {
              setStatusFilter('completed')
              setCurrentPage(1)
            }}
            className={`group relative p-2 sm:p-5 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              statusFilter === 'completed'
                ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg shadow-green-500/20'
                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="text-xl sm:text-3xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-[9px] sm:text-xs font-medium text-gray-600 mt-0.5 sm:mt-1">Completed</div>
            </div>
            {statusFilter === 'completed' && (
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent"></div>
            )}
          </button>

          <button
            onClick={() => {
              setStatusFilter('cancelled')
              setCurrentPage(1)
            }}
            className={`group relative p-2 sm:p-5 rounded-xl border-2 transition-all duration-200 overflow-hidden ${
              statusFilter === 'cancelled'
                ? 'border-red-500 bg-gradient-to-br from-red-50 to-red-100/50 shadow-lg shadow-red-500/20'
                : 'border-gray-200 bg-white hover:border-red-300 hover:shadow-md'
            }`}
          >
            <div className="relative z-10">
              <div className="text-xl sm:text-3xl font-bold text-red-600">{stats.cancelled}</div>
              <div className="text-[9px] sm:text-xs font-medium text-gray-600 mt-0.5 sm:mt-1">Cancelled</div>
            </div>
            {statusFilter === 'cancelled' && (
              <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 to-transparent"></div>
            )}
          </button>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 font-semibold transition-colors duration-200"
            >
              <Filter className="h-5 w-5" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchBookings}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 hover:border-gray-300 font-medium"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Search Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Passenger, phone, flight, location..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || dateFrom || dateTo || statusFilter !== 'all') && (
                <div className="md:col-span-4 flex justify-end">
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-sm text-gray-600">
          <div className="text-xs sm:text-sm">
            Showing {startIndex + 1} - {Math.min(endIndex, filteredAndSortedBookings.length)} of{' '}
            {filteredAndSortedBookings.length} bookings
            {filteredAndSortedBookings.length !== bookings.length && (
              <span className="ml-2 text-blue-600">(filtered from {bookings.length} total)</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <label className="flex items-center gap-2">
              <span className="text-xs sm:text-sm whitespace-nowrap">Sort by:</span>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value="pickupDateTime">Pickup Date</option>
                <option value="passengerName">Passenger Name</option>
                <option value="status">Status</option>
                <option value="createdAt">Created Date</option>
              </select>
            </label>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>

            <label className="flex items-center gap-2">
              <span className="text-xs sm:text-sm whitespace-nowrap">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-lg px-2 sm:px-3 py-1.5 text-xs sm:text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        </div>

        {/* Bookings List */}
        <BookingsList
          bookings={paginatedBookings}
          onRefresh={fetchBookings}
          onSelectBooking={handleSelectBooking}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Manual Allocation Modal */}
      {showAllocationModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Manual Vehicle Allocation
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedBooking.passengerName} - {selectedBooking.numberOfPassengers} passengers
                  </p>
                </div>
                <button
                  onClick={() => setShowAllocationModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">
                Available Vehicles (sorted by distance)
              </h4>

              {suggestions.length === 0 ? (
                <div className="text-center py-12 text-gray-600">
                  No available vehicles found near pickup location
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-semibold text-gray-900">
                              {vehicle.registrationNumber} ({vehicle.make} {vehicle.model})
                            </h5>
                            {vehicle.isOnline && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Online
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Type:</span>{' '}
                              <span className="capitalize">{vehicle.vehicleType}</span>
                            </div>
                            <div>
                              <span className="font-medium">Capacity:</span>{' '}
                              {vehicle.seatingCapacity} passengers
                            </div>
                            <div>
                              <span className="font-medium">Distance:</span>{' '}
                              {vehicle.distance.toFixed(1)} km
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">ETA to pickup:</span>{' '}
                            {vehicle.eta} minutes
                          </div>
                        </div>

                        <div className="ml-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Driver
                          </label>
                          <select
                            className="border rounded-lg px-3 py-2 text-sm"
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAllocate(vehicle.id, e.target.value)
                              }
                            }}
                            disabled={allocating}
                          >
                            <option value="">Choose driver...</option>
                            {drivers.map((driver) => (
                              <option key={driver.id} value={driver.id}>
                                {driver.firstName} {driver.lastName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
