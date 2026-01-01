// Type definitions for the taxi integration system

export interface Vehicle {
  id: string
  wialonUnitId: string
  registrationNumber: string
  make: string
  model: string
  vehicleType: VehicleType
  seatingCapacity: number
  luggageCapacity: number
  status: VehicleStatus
  currentDriverId: string | null
  currentLatitude: number | null
  currentLongitude: number | null
  currentSpeed: number | null
  isOnline: boolean
  lastGpsPing: Date | null
  ignitionOn: boolean
  mileage: number | null
  fuelType: string | null
  lastMaintenanceDate: Date | null
  nextMaintenanceDate: Date | null
  createdAt: Date
  updatedAt: Date
  currentDriver?: Driver | null
}

export enum VehicleType {
  sedan = 'sedan',
  van = 'van',
  bus = 'bus',
  minibus = 'minibus',
  luxury = 'luxury',
}

export enum VehicleStatus {
  available = 'available',
  on_transfer = 'on_transfer',
  returning = 'returning',
  maintenance = 'maintenance',
  unavailable = 'unavailable',
}

export interface Driver {
  id: string
  firstName: string
  lastName: string
  licenseNumber: string
  phoneNumber: string
  email: string | null
  status: DriverStatus
  assignedVehicleId: string | null
  licenseExpiryDate: Date | null
  psvBadgeNumber: string | null
  psvBadgeExpiryDate: Date | null
  shiftStartTime: string | null
  shiftEndTime: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export enum DriverStatus {
  available = 'available',
  on_duty = 'on_duty',
  off_duty = 'off_duty',
  on_break = 'on_break',
}

export interface Booking {
  id: string
  passengerName: string
  passengerPhone: string | null
  passengerEmail: string | null
  numberOfPassengers: number
  numberOfLuggage: number
  pickupLocation: string
  pickupLatitude: number | null
  pickupLongitude: number | null
  pickupDateTime: Date
  dropoffLocation: string
  dropoffLatitude: number | null
  dropoffLongitude: number | null
  bookingType: BookingType
  flightNumber: string | null
  clientCompany: string | null
  status: BookingStatus
  vehicleId: string | null
  vehicle?: Vehicle | null
  driverId: string | null
  driver?: Driver | null
  holidayTaxisBookingId: string | null
  sentToHolidayTaxis: boolean
  sentToHolidayTaxisAt: Date | null
  holidayTaxisResponse: any | null
  actualPickupTime: Date | null
  actualDropoffTime: Date | null
  distanceTravelled: number | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export enum BookingType {
  airport_to_hotel = 'airport_to_hotel',
  hotel_to_airport = 'hotel_to_airport',
  hotel_to_hotel = 'hotel_to_hotel',
  hotel_to_event = 'hotel_to_event',
  event_to_hotel = 'event_to_hotel',
  custom = 'custom',
}

export enum BookingStatus {
  pending = 'pending',
  allocated = 'allocated',
  driver_en_route = 'driver_en_route',
  passenger_on_board = 'passenger_on_board',
  completed = 'completed',
  no_show = 'no_show',
  cancelled = 'cancelled',
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Vehicle suggestion for allocation
export interface VehicleSuggestion extends Vehicle {
  distance: number
  eta: number
}

// CSV Import Result
export interface CSVImportResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    error: string
    data: any
  }>
}

// Wialon sync data
export interface WialonVehicleData {
  id: number
  nm: string
  pos?: {
    x: number
    y: number
    s: number
    c: number
    t: number
  }
  lmsg?: {
    pos: {
      x: number
      y: number
      s: number
      c: number
      t: number
    }
    t: number
  }
}

// HolidayTaxis assignment payload
export interface HolidayTaxisAssignment {
  bookingReference: string
  vehicleIdentifier: string
  driver: {
    name: string
    phoneNumber: string
    preferredContactMethod: 'VOICE' | 'SMS' | 'WHATSAPP' | 'VIBER'
  }
  vehicle: {
    brand: string
    model: string
    color: string
    registration: string
  }
}
