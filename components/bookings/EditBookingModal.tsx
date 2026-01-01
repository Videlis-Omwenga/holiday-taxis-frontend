"use client";

import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { Booking, BookingType, BookingStatus } from "@/types";
import { apiClient } from "@/lib/api-client";
import { toast } from "react-toastify";
import {
  X,
  User,
  Phone,
  Mail,
  Users,
  MapPin,
  Clock,
  Briefcase,
  Calendar,
  Luggage,
  FileText,
  Save,
  Plane,
} from "lucide-react";

// Create a type for the form data that uses strings for date fields
type BookingFormData = Omit<
  Partial<Booking>,
  "pickupDateTime" | "actualPickupTime" | "actualDropoffTime"
> & {
  pickupDateTime: string;
  actualPickupTime: string;
  actualDropoffTime: string;
};

interface EditBookingModalProps {
  show: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSave: (updatedBooking: Booking) => void;
}

export default function EditBookingModal({
  show,
  onClose,
  booking,
  onSave,
}: EditBookingModalProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    pickupDateTime: "",
    actualPickupTime: "",
    actualDropoffTime: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (booking) {
      // Format dates for the datetime-local input
      const formattedBooking = {
        ...booking,
        pickupDateTime: formatForDateTimeInput(booking.pickupDateTime),
        actualPickupTime: booking.actualPickupTime
          ? formatForDateTimeInput(booking.actualPickupTime)
          : "",
        actualDropoffTime: booking.actualDropoffTime
          ? formatForDateTimeInput(booking.actualDropoffTime)
          : "",
      };
      setFormData(formattedBooking);
    }
  }, [booking]);

  const formatForDateTimeInput = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ? parseInt(value, 10) : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setIsSaving(true);
    try {
      // Convert string dates back to Date objects
      const updatedBooking: Partial<Booking> = {
        ...formData,
        pickupDateTime: new Date(formData.pickupDateTime),
        actualPickupTime: formData.actualPickupTime
          ? new Date(formData.actualPickupTime)
          : null,
        actualDropoffTime: formData.actualDropoffTime
          ? new Date(formData.actualDropoffTime)
          : null,
      };

      const response = await apiClient.updateBooking(
        booking.id,
        updatedBooking
      );
      onSave(response);
      onClose();
    } catch (error: any) {
      console.error("Failed to update booking:", error);
      toast.error(`Failed to update booking: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal show={show} onHide={onClose} size="xl" centered className="fade-in">
      <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header with Gradient */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-gainsboro-600 to-silver-700 px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <FileText className="h-5 w-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">Edit Booking</h2>
              <p className="text-xs text-dark-600">
                Update booking details for {booking.passengerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 rounded-lg hover:bg-white/20 text-white transition-all duration-200 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto"
        >
          {/* Passenger Information Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <div className="bg-blue-100 p-2 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Passenger Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="passengerName"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="passengerName"
                  name="passengerName"
                  value={formData.passengerName || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="passengerPhone"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    id="passengerPhone"
                    name="passengerPhone"
                    value={formData.passengerPhone || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="passengerEmail"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    id="passengerEmail"
                    name="passengerEmail"
                    value={formData.passengerEmail || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="numberOfPassengers"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Number of Passengers <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Users className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    id="numberOfPassengers"
                    name="numberOfPassengers"
                    min="1"
                    value={formData.numberOfPassengers || ""}
                    onChange={handleNumberChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="numberOfLuggage"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Number of Luggage
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Luggage className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    id="numberOfLuggage"
                    name="numberOfLuggage"
                    min="0"
                    value={formData.numberOfLuggage || ""}
                    onChange={handleNumberChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="flightNumber"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Flight Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Plane className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="flightNumber"
                    name="flightNumber"
                    value={formData.flightNumber || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    placeholder="e.g., AA123"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Trip Details
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pickupLocation"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Pickup Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    id="pickupLocation"
                    name="pickupLocation"
                    rows={2}
                    value={formData.pickupLocation || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white resize-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="pickupDateTime"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Pickup Date & Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <input
                    type="datetime-local"
                    id="pickupDateTime"
                    name="pickupDateTime"
                    value={formData.pickupDateTime?.toString() || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="dropoffLocation"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Drop-off Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 text-gray-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <textarea
                    id="dropoffLocation"
                    name="dropoffLocation"
                    rows={2}
                    value={formData.dropoffLocation || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white resize-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                Booking Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bookingType"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Booking Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="bookingType"
                  name="bookingType"
                  value={formData.bookingType || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all"
                  required
                >
                  <option value="">Select booking type</option>
                  {Object.values(BookingType).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 hover:bg-white transition-all capitalize"
                  required
                >
                  {(() => {
                    const hasDriver = booking?.driver || booking?.driverId;
                    const hasVehicle = booking?.vehicle || booking?.vehicleId;
                    const hasBoth = hasDriver && hasVehicle;

                    // If no driver or vehicle assigned, only show pending and cancelled
                    if (!hasBoth) {
                      return [BookingStatus.pending, BookingStatus.cancelled].map((status) => (
                        <option key={status} value={status} className="capitalize">
                          {status.replace(/_/g, " ")}
                        </option>
                      ));
                    }

                    // If both driver and vehicle assigned, show all statuses
                    return Object.values(BookingStatus).map((status) => (
                      <option key={status} value={status} className="capitalize">
                        {status.replace(/_/g, " ")}
                      </option>
                    ));
                  })()}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="clientCompany"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Client Company
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="clientCompany"
                    name="clientCompany"
                    value={formData.clientCompany || ""}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white resize-none"
                  placeholder="Any special instructions or notes..."
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
