"use client";

import { useState, useEffect } from "react";
import { Booking, VehicleSuggestion, Driver } from "@/types";
import { apiClient } from "@/lib/api-client";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";
import EditBookingModal from "./EditBookingModal";
import {
  Calendar,
  User,
  MapPin,
  Luggage,
  Users,
  Clock,
  Zap,
  Upload,
  UserPlus,
  Building2,
  Car,
  Plane,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import BookingStatusBadge from "./BookingStatusBadge";
import CSVImportModal from "./CSVImportModal";

interface BookingsListProps {
  bookings: Booking[];
  onRefresh: () => void;
  onSelectBooking: (booking: Booking) => void;
}

export default function BookingsList({
  bookings,
  onRefresh,
}: BookingsListProps) {
  const [autoAllocating, setAutoAllocating] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAutoAllocateConfirm, setShowAutoAllocateConfirm] = useState(false);
  const [showManualAllocate, setShowManualAllocate] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [vehicleSuggestions, setVehicleSuggestions] = useState<VehicleSuggestion[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [manualAllocating, setManualAllocating] = useState(false);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState("");
  const [driverSearchQuery, setDriverSearchQuery] = useState("");

  const handleDeleteClick = (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBookingId(bookingId);
    setShowDeleteConfirm(true);
    setShowAutoAllocateConfirm(false);
    setShowManualAllocate(false);
  };

  const handleDelete = async () => {
    if (!selectedBookingId) return;

    setDeletingId(selectedBookingId);
    try {
      await apiClient.delete(`/bookings/${selectedBookingId}`);
      toast.success("Booking deleted successfully!");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete booking. Please try again.");
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setSelectedBookingId(null);
      setShowManualAllocate(false);
      setShowAutoAllocateConfirm(false);
    }
  };

  const handleSaveBooking = (updatedBooking: Booking) => {
    toast.success('Booking updated successfully!');
    onRefresh();
    setEditingBooking(null);
  };

  const handleAutoAllocateClick = (
    bookingId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setSelectedBookingId(bookingId);
    setShowAutoAllocateConfirm(true);
    setShowDeleteConfirm(false);
    setShowManualAllocate(false);
  };

  const handleAutoAllocate = async (bookingId: string) => {
    if (!bookingId) return;

    setAutoAllocating(bookingId);
    try {
      await apiClient.autoAllocateBooking(bookingId);
      toast.success("Booking auto-allocated successfully!");
      onRefresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to auto-allocate booking"
      );
    } finally {
      setAutoAllocating(null);
      setShowAutoAllocateConfirm(false);
      setSelectedBookingId(null);
      setShowManualAllocate(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleManualAllocate = async () => {
    if (!selectedBookingId || !selectedVehicleId || !selectedDriverId) {
      toast.error("Please select both vehicle and driver");
      return;
    }

    setManualAllocating(true);
    try {
      await apiClient.allocateBooking(selectedBookingId, {
        vehicleId: selectedVehicleId,
        driverId: selectedDriverId,
      });
      toast.success("Booking manually allocated successfully!");
      setShowManualAllocate(false);
      setSelectedBookingId(null);
      setSelectedVehicleId(null);
      setSelectedDriverId(null);
      onRefresh();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to allocate booking"
      );
    } finally {
      setManualAllocating(false);
    }
  };

  // Fetch vehicles and drivers when manual allocate modal opens
  useEffect(() => {
    if (showManualAllocate && selectedBookingId) {
      setLoadingData(true);
      setVehicleSuggestions([]);
      setDrivers([]);
      setSelectedVehicleId(null);
      setSelectedDriverId(null);
      setVehicleSearchQuery("");
      setDriverSearchQuery("");

      Promise.all([
        apiClient.getSuggestedVehicles(selectedBookingId),
        apiClient.getAvailableDrivers(),
      ])
        .then(([vehiclesData, driversData]) => {
          setVehicleSuggestions(vehiclesData as VehicleSuggestion[]);
          setDrivers(driversData as Driver[]);
        })
        .catch((error) => {
          toast.error("Failed to load vehicles and drivers");
          console.error(error);
        })
        .finally(() => {
          setLoadingData(false);
        });
    }
  }, [showManualAllocate, selectedBookingId]);

  const filteredVehicles = vehicleSuggestions.filter(v =>
    v.registrationNumber.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
    v.vehicleType.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d =>
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
    d.phoneNumber.toLowerCase().includes(driverSearchQuery.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(driverSearchQuery.toLowerCase())
  );

  return (
    <>
      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => !deletingId && setShowDeleteConfirm(false)}

        size="lg"
        className="fade-in"
      >
        <Modal.Header
          className="border-b border-gray-200 px-6 py-4"
          closeButton={!deletingId}
          onHide={() => !deletingId && setShowDeleteConfirm(false)}
          closeVariant={deletingId ? "white" : undefined}
          closeLabel="Close"
        >
          <Modal.Title className="d-flex align-items-center gap-3 text-gray-800">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-0">Delete Booking</h4>
              <p className="text-sm text-gray-500 mb-0 mt-1">
                This action cannot be undone
              </p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-6 py-4">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Are you sure you want to delete this booking? This will
                  permanently remove all booking details and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          {deletingId && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-3"></div>
              <p className="text-gray-600 font-medium">Deleting booking...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={!!deletingId}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              deletingId
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!!deletingId}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
              deletingId
                ? "bg-red-400 text-white cursor-wait"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {deletingId ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Booking
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Manual Allocation Modal */}
      <Modal
        show={showManualAllocate}
        onHide={() => {
          setShowManualAllocate(false);
          setSelectedBookingId(null);
        }}
        size="xl"
        className="fade-in"
      >
        <Modal.Header
          className="border-b border-gray-200 px-6 py-4"
          closeButton
          closeLabel="Close"
        >
          <Modal.Title className="d-flex align-items-center gap-3 text-gray-800">
            <div className="bg-blue-100 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-0">
                Manual Vehicle Allocation
              </h4>
              <p className="text-sm text-gray-500 mb-0 mt-1">
                Select a vehicle and driver for this booking
              </p>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-6 py-4 p-3">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <Info className="h-5 w-5 text-blue-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Please select a vehicle and driver from the available options below.
                  The system will show you the most suitable matches based on the booking details.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Vehicles Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Vehicles ({filteredVehicles.length})
              </label>
              {loadingData ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading vehicles...</p>
                </div>
              ) : vehicleSuggestions.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No vehicles available</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Search Input */}
                  <div className="bg-gray-50 p-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search vehicles by registration or type..."
                        value={vehicleSearchQuery}
                        onChange={(e) => setVehicleSearchQuery(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {vehicleSearchQuery && (
                        <button
                          onClick={() => setVehicleSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  {filteredVehicles.length === 0 ? (
                    <div className="bg-gray-50 p-8 text-center">
                      <Car className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600 mb-1">No vehicles found</p>
                      <p className="text-xs text-gray-500">
                        Try adjusting your search query
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredVehicles.map((vehicle) => (
                            <tr
                              key={vehicle.id}
                              onClick={() => setSelectedVehicleId(vehicle.id)}
                              className={`cursor-pointer transition-colors ${
                                selectedVehicleId === vehicle.id
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {selectedVehicleId === vehicle.id && (
                                    <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                      <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  <Car className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-900">{vehicle.registrationNumber}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="text-xs text-gray-600">{vehicle.vehicleType}</span>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="text-xs text-gray-600">{vehicle.seatingCapacity} seats</span>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <div className="text-xs">
                                  <div className="text-gray-900">{vehicle.distance.toFixed(1)} km</div>
                                  <div className="text-gray-500">{vehicle.eta} min</div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                {vehicle.isOnline && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    Online
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drivers Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Drivers ({filteredDrivers.length})
              </label>
              {loadingData ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Loading drivers...</p>
                </div>
              ) : drivers.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                  <p className="text-sm text-gray-500">No drivers available</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Search Input */}
                  <div className="bg-gray-50 p-2 border-b border-gray-200">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search drivers by name, phone, or license..."
                        value={driverSearchQuery}
                        onChange={(e) => setDriverSearchQuery(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {driverSearchQuery && (
                        <button
                          onClick={() => setDriverSearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs px-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  {filteredDrivers.length === 0 ? (
                    <div className="bg-gray-50 p-8 text-center">
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-600 mb-1">No drivers found</p>
                      <p className="text-xs text-gray-500">
                        Try adjusting your search query
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver Name</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredDrivers.map((driver) => (
                            <tr
                              key={driver.id}
                              onClick={() => setSelectedDriverId(driver.id)}
                              className={`cursor-pointer transition-colors ${
                                selectedDriverId === driver.id
                                  ? "bg-blue-50"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {selectedDriverId === driver.id && (
                                    <div className="h-4 w-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                      <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {driver.firstName} {driver.lastName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="text-xs text-gray-600">{driver.phoneNumber}</span>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="text-xs text-gray-600">{driver.licenseNumber}</span>
                              </td>
                              <td className="px-3 py-2.5 whitespace-nowrap">
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full capitalize">
                                  {driver.status.replace(/_/g, " ")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
          <button
            type="button"
            onClick={() => {
              setShowManualAllocate(false);
              setSelectedBookingId(null);
              setSelectedVehicleId(null);
              setSelectedDriverId(null);
            }}
            disabled={manualAllocating}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              manualAllocating
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleManualAllocate}
            disabled={!selectedVehicleId || !selectedDriverId || manualAllocating}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
              !selectedVehicleId || !selectedDriverId || manualAllocating
                ? "bg-blue-400 text-white cursor-not-allowed opacity-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {manualAllocating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Allocating...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Allocate Selection
              </>
            )}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Remainder of the file unchanged... */}
    </>
  );
}
