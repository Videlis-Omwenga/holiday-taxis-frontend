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
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header className="bg-light border-0 pb-3">
        <Modal.Title className="d-flex align-items-center gap-2">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <span className="h5 mb-0 font-semibold text-slate-800">
            Create New Booking
          </span>
        </Modal.Title>
        <button
          onClick={handleClose}
          disabled={isCreating}
          className="btn-close"
          aria-label="Close"
        />
      </Modal.Header>

      <Modal.Body className="px-4 py-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Passenger Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  Passenger Name <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter passenger name"
                required
                disabled={isCreating}
              />
            </div>

            {/* Passenger Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500" />
                  Phone Number
                </div>
              </label>
              <input
                type="tel"
                name="passengerPhone"
                value={formData.passengerPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+44 20 1234 5678"
                disabled={isCreating}
              />
            </div>

            {/* Number of Passengers */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  Number of Passengers <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="number"
                name="numberOfPassengers"
                value={formData.numberOfPassengers}
                onChange={handleNumberChange}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isCreating}
              />
            </div>

            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  Pickup Location <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Heathrow Airport Terminal 5"
                required
                disabled={isCreating}
              />
            </div>

            {/* Pickup Date & Time */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Pickup Date & Time <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="datetime-local"
                name="pickupDateTime"
                value={formData.pickupDateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isCreating}
              />
            </div>

            {/* Dropoff Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  Drop-off Location <span className="text-red-500">*</span>
                </div>
              </label>
              <input
                type="text"
                name="dropoffLocation"
                value={formData.dropoffLocation}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Hilton London Paddington"
                required
                disabled={isCreating}
              />
            </div>

            {/* Flight Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-slate-500" />
                  Flight Number
                </div>
              </label>
              <input
                type="text"
                name="flightNumber"
                value={formData.flightNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., BA123"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Booking
                </>
              )}
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
