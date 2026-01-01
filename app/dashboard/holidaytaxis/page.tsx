"use client";

import { useEffect, useState, useMemo } from "react";
import { Booking } from "@/types";
import { apiClient } from "@/lib/api-client";
import { format } from "date-fns";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  User,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  ExternalLink,
  Search,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Package,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toast } from "react-toastify";

interface SubmissionLog {
  id: string;
  bookingId: string;
  passengerName: string;
  holidayTaxisRef: string;
  status: "success" | "error";
  message: string;
  timestamp: Date;
}

export default function HolidayTaxisPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [bookingRefs, setBookingRefs] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bookingToSend, setBookingToSend] = useState<Booking | null>(null);

  // Submission logs
  const [submissionLogs, setSubmissionLogs] = useState<SubmissionLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [logsCount, setLogsCount] = useState<number>(0);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [minPassengers, setMinPassengers] = useState<string>("");
  const [maxPassengers, setMaxPassengers] = useState<string>("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sorting state
  const [sortBy, setSortBy] = useState<
    "passenger" | "pickup" | "dropoff" | "date" | "passengers"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchAllocatedBookings();
    fetchLogsCount();
  }, []);

  const fetchLogsCount = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000';
      const token = localStorage.getItem('taxisToken');
      const response = await fetch(`${API_URL}/logs/holidaytaxis/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setLogsCount(data.total || 0);
    } catch (error) {
      toast.error('Failed to fetch logs count');
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    bookingTypeFilter,
    dateFilter,
    minPassengers,
    maxPassengers,
  ]);

  const fetchAllocatedBookings = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const data = await apiClient.getBookings({ status: "allocated" });
      const allocated = (data as Booking[]).filter(
        (b) => b.vehicleId && b.driverId && !b.sentToHolidayTaxis
      );
      setBookings(allocated);
    } catch (error) {
      toast.error("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let filtered = bookings.filter((booking) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          booking.passengerName.toLowerCase().includes(query) ||
          booking.pickupLocation.toLowerCase().includes(query) ||
          booking.dropoffLocation.toLowerCase().includes(query) ||
          (booking.passengerPhone &&
            booking.passengerPhone.toLowerCase().includes(query)) ||
          (booking.flightNumber &&
            booking.flightNumber.toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // Booking type filter
      if (
        bookingTypeFilter !== "all" &&
        booking.bookingType !== bookingTypeFilter
      ) {
        return false;
      }

      // Date filter
      if (dateFilter !== "all") {
        const bookingDate = new Date(booking.pickupDateTime);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (dateFilter) {
          case "today":
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            if (bookingDate < today || bookingDate > todayEnd) return false;
            break;
          case "tomorrow":
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowEnd = new Date(tomorrow);
            tomorrowEnd.setHours(23, 59, 59, 999);
            if (bookingDate < tomorrow || bookingDate > tomorrowEnd)
              return false;
            break;
          case "week":
            const weekEnd = new Date(today);
            weekEnd.setDate(weekEnd.getDate() + 7);
            if (bookingDate < today || bookingDate > weekEnd) return false;
            break;
        }
      }

      // Passenger count filter
      if (minPassengers && booking.numberOfPassengers < parseInt(minPassengers))
        return false;
      if (maxPassengers && booking.numberOfPassengers > parseInt(maxPassengers))
        return false;

      return true;
    });

    // Sort bookings
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "passenger":
          comparison = a.passengerName.localeCompare(b.passengerName);
          break;
        case "pickup":
          comparison = a.pickupLocation.localeCompare(b.pickupLocation);
          break;
        case "dropoff":
          comparison = a.dropoffLocation.localeCompare(b.dropoffLocation);
          break;
        case "date":
          comparison =
            new Date(a.pickupDateTime).getTime() -
            new Date(b.pickupDateTime).getTime();
          break;
        case "passengers":
          comparison = a.numberOfPassengers - b.numberOfPassengers;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    bookings,
    searchQuery,
    bookingTypeFilter,
    dateFilter,
    minPassengers,
    maxPassengers,
    sortBy,
    sortOrder,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedBookings.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedBookings, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = bookings.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayBookings = bookings.filter((b) => {
      const pickupDate = new Date(b.pickupDateTime);
      return pickupDate >= today && pickupDate <= todayEnd;
    }).length;

    const totalPassengers = bookings.reduce(
      (sum, b) => sum + b.numberOfPassengers,
      0
    );
    const totalLuggage = bookings.reduce(
      (sum, b) => sum + b.numberOfLuggage,
      0
    );

    return { total, todayBookings, totalPassengers, totalLuggage };
  }, [bookings]);

  const handleBookingRefChange = (bookingId: string, value: string) => {
    setBookingRefs((prev) => ({
      ...prev,
      [bookingId]: value,
    }));
  };

  const validateBookingRef = (ref: string): boolean => {
    // Format: BAHOL-26783177 (5 uppercase letters, hyphen, 8 digits)
    const pattern = /^[A-Z]{5}-\d{8}$/;
    if (!pattern.test(ref)) {
      return false;
    }

    // Additional validation: ensure it's actually uppercase
    if (ref !== ref.toUpperCase()) {
      return false;
    }

    // Validate the structure more strictly
    const parts = ref.split('-');
    if (parts.length !== 2) {
      return false;
    }

    const [letters, digits] = parts;
    if (letters.length !== 5 || digits.length !== 8) {
      return false;
    }

    // Ensure letters are actually letters
    if (!/^[A-Z]+$/.test(letters)) {
      return false;
    }

    // Ensure digits are actually digits
    if (!/^\d+$/.test(digits)) {
      return false;
    }

    return true;
  };

  const handleSendToHolidayTaxis = async (booking: Booking) => {
    const rawRef = bookingRefs[booking.id]?.trim();

    if (!rawRef) {
      toast.error("Please enter the HolidayTaxis Booking Reference");
      return;
    }

    // Convert to uppercase for validation
    const holidayTaxisBookingRef = rawRef.toUpperCase();

    // Validate format
    if (!validateBookingRef(holidayTaxisBookingRef)) {
      toast.error(
        "Invalid format! Reference must be: BAHOL-26783177 (exactly 5 uppercase letters, hyphen, exactly 8 digits)"
      );
      return;
    }

    // Validate booking has all required data
    if (!booking.vehicle || !booking.driver) {
      toast.error("Booking must have both vehicle and driver assigned");
      return;
    }

    // Update the ref in state with uppercase version
    setBookingRefs(prev => ({
      ...prev,
      [booking.id]: holidayTaxisBookingRef
    }));

    // Show confirmation modal
    setBookingToSend(booking);
    setShowConfirmModal(true);
  };

  const confirmSendToHolidayTaxis = async () => {
    if (!bookingToSend) return;

    const holidayTaxisBookingRef = bookingRefs[bookingToSend.id]?.trim().toUpperCase();

    if (!holidayTaxisBookingRef) {
      toast.error("Booking reference is missing");
      setShowConfirmModal(false);
      return;
    }

    // Final validation before sending
    if (!validateBookingRef(holidayTaxisBookingRef)) {
      toast.error("Invalid booking reference format");
      setShowConfirmModal(false);
      return;
    }

    setShowConfirmModal(false);
    setSending(bookingToSend.id);

    try {
      await apiClient.sendToHolidayTaxis(bookingToSend.id, {
        holidayTaxisBookingRef,
      });

      // Add success log
      const successLog: SubmissionLog = {
        id: Date.now().toString(),
        bookingId: bookingToSend.id,
        passengerName: bookingToSend.passengerName,
        holidayTaxisRef: holidayTaxisBookingRef,
        status: "success",
        message: "Successfully sent to HolidayTaxis",
        timestamp: new Date(),
      };
      setSubmissionLogs((prev) => [successLog, ...prev]);

      toast.success("Successfully sent to HolidayTaxis!");

      // Clear the booking ref for this booking
      setBookingRefs(prev => {
        const newRefs = { ...prev };
        delete newRefs[bookingToSend.id];
        return newRefs;
      });

      fetchAllocatedBookings();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send to HolidayTaxis";

      // Add error log
      const errorLog: SubmissionLog = {
        id: Date.now().toString(),
        bookingId: bookingToSend.id,
        passengerName: bookingToSend.passengerName,
        holidayTaxisRef: holidayTaxisBookingRef,
        status: "error",
        message: errorMessage,
        timestamp: new Date(),
      };
      setSubmissionLogs((prev) => [errorLog, ...prev]);

      toast.error(`Error: ${errorMessage}`);
    } finally {
      // Always refresh logs count after any response (success or error)
      fetchLogsCount();
      setSending(null);
      setBookingToSend(null);
    }
  };

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
        <div className="text-gray-600">Loading allocated bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-1">HolidayTaxis Integration</h1>
        <p className="text-sm text-gray-600">
          Submit allocated bookings to HolidayTaxis. Enter booking references and send vehicle/driver assignments to their system.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && bookingToSend && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ease-out scale-100 opacity-100 border border-gray-100 overflow-hidden">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V19a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Confirm Booking</h3>
                    <p className="text-blue-100 text-sm">
                      Send to HolidayTaxis
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setBookingToSend(null);
                  }}
                  className="text-white/80 hover:text-white transition-colors p-1 -mt-2 -mr-2"
                  aria-label="Close"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Passenger Info Card */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100 transform hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Passenger</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {bookingToSend.passengerName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reference Card */}
              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        HOLIDAYTAXIS REFERENCE
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        #{bookingRefs[bookingToSend.id] || "NEW"}
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    {bookingRefs[bookingToSend.id] ? "EXISTING" : "NEW"}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setBookingToSend(null);
                  }}
                  className="px-5 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold text-sm flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendToHolidayTaxis}
                  className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 flex-1 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Send className="h-5 w-5" />
                  <span>Confirm & Send</span>
                </button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center mt-4">
                This action cannot be undone. A confirmation email will be sent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ExternalLink className="h-6 w-6 mr-2 text-blue-600" />
              Send to HolidayTaxis
            </h2>
            <button
              onClick={() => fetchAllocatedBookings(false)}
              disabled={refreshing}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Refresh data"
            >
              <RefreshCw
                className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {filteredAndSortedBookings.length} of {bookings.length} booking
            {bookings.length !== 1 ? "s" : ""} ready to send
            {refreshing && (
              <span className="text-blue-600 ml-2">Updating...</span>
            )}
          </p>
        </div>

        {/* View Logs Button */}
        <Link
          href="/dashboard/logs"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Activity className="h-5 w-5" />
          View Submission Logs ({logsCount})
        </Link>
      </div>

      {/* Submission Logs Table */}
      {showLogs && submissionLogs.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Submission Logs
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    HT Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissionLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(log.timestamp, "MMM d, yyyy h:mm:ss a")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.passengerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      #{log.holidayTaxisRef}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.status === "success" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Error
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </p>
            </div>
            <ExternalLink className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.todayBookings}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Passengers</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.totalPassengers}
              </p>
            </div>
            <User className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Luggage</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {stats.totalLuggage}
              </p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by passenger name, location, phone, or flight..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              showAdvancedFilters
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Type
              </label>
              <select
                value={bookingTypeFilter}
                onChange={(e) => setBookingTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="airport_to_hotel">Airport to Hotel</option>
                <option value="hotel_to_airport">Hotel to Airport</option>
                <option value="hotel_to_hotel">Hotel to Hotel</option>
                <option value="hotel_to_event">Hotel to Event</option>
                <option value="event_to_hotel">Event to Hotel</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">Next 7 Days</option>
              </select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Pax
                </label>
                <input
                  type="number"
                  min="1"
                  value={minPassengers}
                  onChange={(e) => setMinPassengers(e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Pax
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxPassengers}
                  onChange={(e) => setMaxPassengers(e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setBookingTypeFilter("all");
                  setDateFilter("all");
                  setMinPassengers("");
                  setMaxPassengers("");
                }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {filteredAndSortedBookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {bookings.length === 0 ? "All caught up!" : "No matching bookings"}
          </h3>
          <p className="text-gray-600">
            {bookings.length === 0
              ? "No allocated bookings pending HolidayTaxis submission."
              : "Try adjusting your search or filter criteria."}
          </p>
        </div>
      ) : (
        <>
          {/* Table View */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("passenger")}
                    >
                      <div className="flex items-center gap-2">
                        Passenger
                        <SortIcon column="passenger" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("pickup")}
                    >
                      <div className="flex items-center gap-2">
                        Pickup
                        <SortIcon column="pickup" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("dropoff")}
                    >
                      <div className="flex items-center gap-2">
                        Drop-off
                        <SortIcon column="dropoff" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("date")}
                    >
                      <div className="flex items-center gap-2">
                        Pickup Date & Time
                        <SortIcon column="date" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort("passengers")}
                    >
                      <div className="flex items-center gap-2">
                        Pax/Bags
                        <SortIcon column="passengers" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HT Reference & Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.passengerName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.passengerPhone || "No phone"}
                          </div>
                          {booking.flightNumber && (
                            <div className="text-xs text-blue-600 mt-1">
                              Flight: {booking.flightNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-900 max-w-xs truncate"
                          title={booking.pickupLocation}
                        >
                          {booking.pickupLocation}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm text-gray-900 max-w-xs truncate"
                          title={booking.dropoffLocation}
                        >
                          {booking.dropoffLocation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(
                            new Date(booking.pickupDateTime),
                            "MMM d, yyyy"
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(booking.pickupDateTime), "h:mm a")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {booking.numberOfPassengers} Pax
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {booking.numberOfLuggage} Bags
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                              <span className="text-gray-400 text-xs">#</span>
                            </div>
                            <input
                              type="text"
                              placeholder="BAHOL-26783177"
                              className="block w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 uppercase"
                              value={bookingRefs[booking.id] || ""}
                              onChange={(e) => {
                                const value = e.target.value.toUpperCase();
                                handleBookingRefChange(booking.id, value);
                              }}
                              disabled={sending === booking.id}
                              maxLength={14}
                              pattern="[A-Z]{5}-\d{8}"
                              title="Format: BAHOL-26783177 (5 letters, hyphen, 8 digits)"
                            />
                          </div>
                          <button
                            onClick={() => handleSendToHolidayTaxis(booking)}
                            disabled={
                              !bookingRefs[booking.id]?.trim() ||
                              sending === booking.id
                            }
                            className={`px-3 py-1.5 rounded font-medium text-xs flex items-center gap-1.5 transition-all whitespace-nowrap ${
                              !bookingRefs[booking.id]?.trim() ||
                              sending === booking.id
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {sending === booking.id ? (
                              <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Sending
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3" />
                                Send
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Items per page selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>

                {/* Page info */}
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredAndSortedBookings.length
                  )}{" "}
                  of {filteredAndSortedBookings.length} bookings
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
