"use client";

import { useState } from "react";
import { Modal } from "react-bootstrap";
import { apiClient } from "@/lib/api-client";
import { toast } from "react-toastify";
import {
  X,
  User,
  Phone,
  Users,
  MapPin,
  Calendar,
  Save,
  Plane,
  Plus,
} from "lucide-react";

interface CreateBookingModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateBookingFormData {
  passengerName: string;
  passengerPhone: string;
  numberOfPassengers: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDateTime: string;
  flightNumber: string;
}

export default function CreateBookingModal({
  show,
  onClose,
  onSuccess,
}: CreateBookingModalProps) {
  const [formData, setFormData] = useState<CreateBookingFormData>({
    passengerName: "",
    passengerPhone: "",
    numberOfPassengers: 1,
    pickupLocation: "",
    dropoffLocation: "",
    pickupDateTime: "",
    flightNumber: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      [name]: value ? parseInt(value, 10) : 1,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.passengerName.trim()) {
      toast.error("Passenger name is required");
      return;
    }
    if (!formData.pickupLocation.trim()) {
      toast.error("Pickup location is required");
      return;
    }
    if (!formData.dropoffLocation.trim()) {
      toast.error("Drop-off location is required");
      return;
    }
    if (!formData.pickupDateTime) {
      toast.error("Pickup date & time is required");
      return;
    }
    if (formData.numberOfPassengers < 1) {
      toast.error("Number of passengers must be at least 1");
      return;
    }

    setIsCreating(true);

    try {
      // Prepare payload
      const payload = {
        passengerName: formData.passengerName.trim(),
        passengerPhone: formData.passengerPhone.trim() || null,
        numberOfPassengers: formData.numberOfPassengers,
        pickupLocation: formData.pickupLocation.trim(),
        dropoffLocation: formData.dropoffLocation.trim(),
        pickupDateTime: new Date(formData.pickupDateTime).toISOString(),
        flightNumber: formData.flightNumber.trim() || null,
      };

      await apiClient.createBooking(payload);

      toast.success("Booking created successfully");

      // Reset form
      setFormData({
        passengerName: "",
        passengerPhone: "",
        numberOfPassengers: 1,
        pickupLocation: "",
        dropoffLocation: "",
        pickupDateTime: "",
        flightNumber: "",
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to create booking:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered className="fade-in">
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-light px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="h5 mb-0 font-semibold text-slate-800">Create New Booking</h2>
              <p className="text-xs text-slate-600 mt-1">
                Add a new passenger booking to the system
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200 disabled:opacity-50"
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
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-0">
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
                  value={formData.passengerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                  placeholder="Enter passenger name"
                  required
                  disabled={isCreating}
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
                    value={formData.passengerPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    placeholder="+44 20 1234 5678"
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
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
                    value={formData.numberOfPassengers}
                    onChange={handleNumberChange}
                    min="1"
                    max="50"
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    required
                    disabled={isCreating}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trip Details Card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <div className="bg-green-50 p-2 rounded-lg border border-green-100">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide mb-0">
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-green-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="pickupLocation"
                    name="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    placeholder="e.g., Heathrow Airport Terminal 5"
                    required
                    disabled={isCreating}
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
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-500">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    id="dropoffLocation"
                    name="dropoffLocation"
                    value={formData.dropoffLocation}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                    placeholder="e.g., Hilton London Paddington"
                    required
                    disabled={isCreating}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="pickupDateTime"
                    className="block text-xs font-semibold text-gray-700 mb-2"
                  >
                    Pickup Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <input
                      type="datetime-local"
                      id="pickupDateTime"
                      name="pickupDateTime"
                      value={formData.pickupDateTime}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                      required
                      disabled={isCreating}
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
                      value={formData.flightNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 hover:bg-white"
                      placeholder="e.g., BA123"
                      disabled={isCreating}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 -mx-6 -mb-6 rounded-b-xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
