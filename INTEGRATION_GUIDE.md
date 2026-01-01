# Frontend Integration Guide

## New Features Implemented

This guide documents the new features added to integrate with the enhanced backend API.

---

## 1. Auto-Allocate Booking

### What it does
Automatically assigns the nearest available vehicle and an available driver to a pending booking with a single click.

### Usage
```typescript
import { apiClient } from '@/lib/api-client'

// Auto-allocate a booking
const result = await apiClient.autoAllocateBooking(bookingId)
```

### UI Component
- **Location**: [BookingsList.tsx](./components/bookings/BookingsList.tsx)
- **Button**: Purple "Auto-Allocate" button with lightning bolt icon
- **Features**:
  - One-click allocation
  - Confirmation dialog
  - Loading state during allocation
  - Success/error feedback

### Algorithm
1. Finds nearest 5 available vehicles to pickup location
2. Filters by passenger capacity if specified
3. Selects first available driver
4. Automatically creates allocation

---

## 2. CSV Import for Bulk Bookings

### What it does
Import multiple bookings at once from a CSV file with validation and error reporting.

### CSV Format
```csv
passengerName,passengerPhone,passengerEmail,numberOfPassengers,numberOfLuggage,pickupLocation,pickupLatitude,pickupLongitude,pickupDateTime,dropoffLocation,dropoffLatitude,dropoffLongitude,bookingType,flightNumber,clientCompany
John Doe,+1234567890,john@example.com,2,3,Airport Terminal 1,51.4700,-0.4543,2025-11-25T14:30:00,Hotel Plaza,51.5074,-0.1278,airport_to_hotel,BA123,ABC Corp
```

### Usage
```typescript
import { apiClient } from '@/lib/api-client'

// Import bookings from CSV
const file = document.getElementById('fileInput').files[0]
const result = await apiClient.importBookingsCSV(file)

console.log(`Success: ${result.success}, Failed: ${result.failed}`)
result.errors.forEach(error => {
  console.log(`Row ${error.row}: ${error.error}`)
})
```

### UI Component
- **Location**: [CSVImportModal.tsx](./components/bookings/CSVImportModal.tsx)
- **Features**:
  - Drag & drop or click to upload
  - Template download with examples
  - File validation (CSV only)
  - Import progress indicator
  - Detailed error reporting per row
  - Success summary

### Booking Types
- `airport_to_hotel`
- `hotel_to_airport`
- `hotel_to_hotel`
- `hotel_to_event`
- `event_to_hotel`
- `custom`

---

## 3. Geofence-Based Status Updates

### What it does
Automatically updates booking status when vehicles enter/exit geofenced zones (runs server-side every 5 minutes).

### Status Flow
```
pending → allocated → driver_en_route → passenger_on_board → completed
```

### Geofence Rules
- **Geofence Radius**: 500 meters (0.5 km)
- **allocated → driver_en_route**: Vehicle leaves base (>500m from pickup)
- **driver_en_route → passenger_on_board**: Vehicle enters pickup zone (≤500m)
- **passenger_on_board → completed**: Vehicle enters dropoff zone (≤500m)

### UI Components

#### Status Badge
- **Location**: [BookingStatusBadge.tsx](./components/bookings/BookingStatusBadge.tsx)
- **Usage**:
```tsx
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge'

<BookingStatusBadge
  status={booking.status}
  showIcon={true}
  size="md"
/>
```

#### Status Timeline
```tsx
import { BookingStatusTimeline } from '@/components/bookings/BookingStatusBadge'

<BookingStatusTimeline currentStatus={booking.status} />
```

### Status Colors
- **Pending**: Gray
- **Allocated**: Blue
- **Driver En Route**: Purple (with Navigation icon)
- **Passenger On Board**: Indigo (with User icon)
- **Completed**: Green (with MapPin icon)
- **Cancelled**: Red
- **No Show**: Orange

---

## 4. Enhanced Bookings List

### What it does
Comprehensive booking management interface with all new features integrated.

### Component
- **Location**: [BookingsList.tsx](./components/bookings/BookingsList.tsx)

### Features
- Real-time status badges
- Auto-allocate button for pending bookings
- Manual allocate button
- CSV import button
- Vehicle and driver details for allocated bookings
- Passenger count, luggage count, and flight number display
- Pickup/dropoff locations with color-coded pins
- Click to view details

---

## 5. Updated TypeScript Types

### Location
[types/index.ts](./types/index.ts)

### Key Changes
```typescript
// Vehicle
interface Vehicle {
  id: string  // Changed from number
  registrationNumber: string  // Changed from name
  vehicleType: VehicleType  // New enum
  seatingCapacity: number
  currentLatitude: number | null
  currentLongitude: number | null
  currentSpeed: number | null
  isOnline: boolean
  lastGpsPing: Date | null
  // ... more fields
}

// Driver
interface Driver {
  id: string  // Changed from number
  firstName: string
  lastName: string
  status: DriverStatus  // New enum
  phoneNumber: string
  // ... more fields
}

// Booking
interface Booking {
  id: string  // Changed from number
  passengerName: string
  numberOfPassengers: number  // Changed from passengerCount
  numberOfLuggage: number  // Changed from luggageCount
  pickupDateTime: Date  // Changed from pickupTime
  status: BookingStatus  // Updated enum
  vehicleId: string | null
  driverId: string | null
  vehicle?: Vehicle
  driver?: Driver
  // ... more fields
}

// CSV Import Result
interface CSVImportResult {
  success: number
  failed: number
  errors: Array<{
    row: number
    error: string
    data: any
  }>
}
```

---

## 6. Enhanced API Client

### Location
[lib/api-client.ts](./lib/api-client.ts)

### New Methods

```typescript
// Auto-allocate booking
await apiClient.autoAllocateBooking(bookingId: string)

// Import bookings from CSV
await apiClient.importBookingsCSV(file: File)

// Integration sync endpoints
await apiClient.syncVehiclePositions()
await apiClient.fullSync()
await apiClient.healthCheck()
```

---

## Setup Instructions

### 1. Install Dependencies
```bash
cd "/home/videlis/Desktop/Bookings app/frontEnd"
npm install
```

All required dependencies are already in package.json:
- `@tanstack/react-query` - Data fetching
- `axios` - HTTP client
- `date-fns` - Date formatting
- `lucide-react` - Icons
- `leaflet` & `react-leaflet` - Maps

### 2. Environment Variables
Update `.env.local`:
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:9000"
```

### 3. Start Development Server
```bash
npm run dev
```

The app will run on http://localhost:3000

---

## API Endpoints Reference

### Bookings
- `GET /bookings` - Get all bookings
- `GET /bookings?status=pending` - Filter by status
- `POST /bookings` - Create booking
- `POST /bookings/:id/auto-allocate` - Auto-allocate (NEW)
- `POST /bookings/:id/allocate` - Manual allocate
- `POST /bookings/import/csv` - Import from CSV (NEW)

### Vehicles
- `GET /vehicles` - Get all vehicles
- `GET /vehicles/available` - Get available vehicles
- `GET /vehicles/nearest?lat=X&lng=Y&limit=N` - Get nearest vehicles

### Drivers
- `GET /drivers` - Get all drivers
- `GET /drivers/available` - Get available drivers

### Integration
- `POST /integration/sync/vehicle-positions` - Sync positions (NEW)
- `POST /integration/sync/full` - Full sync (NEW)
- `GET /integration/health` - Health check (NEW)

---

## Testing the Features

### Test Auto-Allocate
1. Go to Dashboard (http://localhost:3000/dashboard)
2. Find a pending booking
3. Click "Auto-Allocate" button
4. Confirm the action
5. Check that vehicle and driver are assigned

### Test CSV Import
1. Click "Import CSV" button
2. Download the template
3. Fill in booking data
4. Upload the file
5. Review import results

### Test Geofence Updates
1. Create a booking with pickup/dropoff coordinates
2. Allocate a vehicle
3. Wait for vehicle position sync (runs every 5 minutes)
4. Watch status automatically update as vehicle moves
5. Check logs: `cd "/home/videlis/Desktop/Bookings app/backEnd" && npm run dev`

---

## Common Issues & Solutions

### Issue: Types mismatch
**Solution**: Run `npm run dev` to recompile TypeScript

### Issue: CORS errors
**Solution**: Backend must be running on port 9000 with CORS enabled

### Issue: Import fails
**Solution**: Check CSV format matches template exactly

### Issue: Auto-allocate fails
**Solution**: Ensure:
- Booking has pickup coordinates
- At least one vehicle is available and online
- At least one driver is available

---

## File Structure

```
frontEnd/
├── app/
│   └── dashboard/
│       └── page.tsx              # Main dashboard (updated)
├── components/
│   ├── bookings/
│   │   ├── BookingsList.tsx      # List component (NEW)
│   │   ├── BookingStatusBadge.tsx # Status badges (NEW)
│   │   └── CSVImportModal.tsx    # CSV import (NEW)
│   └── ui/                       # Shared UI components
├── lib/
│   └── api-client.ts             # API client (updated)
└── types/
    └── index.ts                  # Type definitions (updated)
```

---

## Next Steps

### Recommended Enhancements
1. **Real-time Updates**: Add WebSocket for live status updates
2. **Notifications**: Alert managers when bookings need attention
3. **Analytics Dashboard**: Show booking statistics and trends
4. **Map View**: Display vehicles and bookings on map
5. **Driver App**: Mobile app for drivers to update status
6. **Advanced Filters**: Filter bookings by date, status, company
7. **Export Reports**: Export booking data to PDF/Excel

### Performance Optimizations
1. Implement React Query for caching
2. Add pagination for large booking lists
3. Lazy load components
4. Add service worker for offline support

---

## Support

For issues or questions:
1. Check backend logs: `cd backEnd && npm run dev`
2. Check browser console for errors
3. Verify API endpoints are responding
4. Check network tab for failed requests

---

## Summary

✅ **Auto-Allocate** - One-click booking allocation
✅ **CSV Import** - Bulk booking import with validation
✅ **Geofence Automation** - Automatic status updates
✅ **Status Badges** - Visual status indicators
✅ **Enhanced UI** - Better user experience
✅ **Type Safety** - Full TypeScript support
