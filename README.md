# Taxi Integration System

A comprehensive vehicle allocation system that integrates Wialon GPS tracking with HolidayTaxis booking platform. This Next.js application provides a user-friendly interface for transport managers to manually allocate vehicles to bookings.

## System Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   Wialon API    │─────▶│  NestJS Backend  │◀─────│  Next.js Frontend   │
│  (GPS Tracking) │      │  (Existing)      │      │  (This Project)     │
└─────────────────┘      └──────────────────┘      └─────────────────────┘
                                 │                           │
                                 │                           │
                                 ▼                           ▼
                         ┌────────────────┐        ┌─────────────────┐
                         │  HolidayTaxis  │        │   PostgreSQL    │
                         │      API       │        │    Database     │
                         └────────────────┘        └─────────────────┘
```

## Features

### Core Functionality
- **Real-time Vehicle Tracking**: Syncs GPS data from Wialon every 10-30 seconds
- **Smart Vehicle Suggestions**: Suggests nearest available vehicles based on distance and capacity
- **Manual Allocation**: Transport managers can assign vehicles to bookings with one click
- **Live Fleet Map**: View all vehicles on a map with real-time positions
- **Booking Management**: View and manage transfer bookings
- **Automatic HolidayTaxis Sync**: Sends allocation data to HolidayTaxis API automatically

### Smart Features
- Distance calculation to pickup location
- ETA estimation
- Vehicle capacity matching
- Driver availability tracking
- Sync logging and error tracking

## Database Schema

The system uses PostgreSQL with Prisma ORM. Key tables:

- **vehicles**: Stores vehicle data synced from Wialon
- **drivers**: Driver information and availability
- **bookings**: Transfer booking details
- **allocations**: Links bookings to vehicles/drivers
- **wialon_sync_logs**: Tracks Wialon data sync
- **holidaytaxis_sync_logs**: Tracks HolidayTaxis API calls

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Existing NestJS backend running (from `wialon-holidaytaxis-integration`)
- Wialon API access
- HolidayTaxis API credentials

### Step 1: Install Dependencies

```bash
cd /home/videlis/Desktop/taxi-integration
npm install
```

### Step 2: Configure Database

1. Create a PostgreSQL database:

```sql
CREATE DATABASE taxi_integration;
```

2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Update `.env` with your database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/taxi_integration"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
```

### Step 3: Run Database Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This will:
- Generate Prisma Client
- Create all database tables
- Set up enums and relationships

### Step 4: Start the Application

```bash
npm run dev
```

The application will run on [http://localhost:3001](http://localhost:3001)

### Step 5: Sync Wialon Data

1. Ensure your NestJS backend is running at `http://localhost:3000`
2. Open the dashboard
3. Click "Sync Wialon" button in the header
4. Vehicles will be imported into the database

## Usage Guide

### 1. Initial Setup

**Import Vehicles:**
- Click "Sync Wialon" to import your fleet from Wialon
- Vehicles will appear in the "Vehicles" tab
- Check that GPS positions are being updated

**Add Drivers (Optional):**
```sql
-- Add drivers manually in database or via Prisma Studio
INSERT INTO drivers (name, phone, is_available)
VALUES ('John Doe', '+254712345678', true);
```

**Create Bookings:**
Use the API or database to create bookings:

```bash
POST /api/bookings
{
  "bookingReference": "BAHOL-12345678",
  "passengerName": "Jane Smith",
  "passengerPhone": "+254798765432",
  "passengerCount": 2,
  "luggageCount": 3,
  "pickupLocation": "JKIA Airport",
  "pickupLat": -1.319167,
  "pickupLng": 36.927778,
  "pickupTime": "2025-11-20T14:00:00Z",
  "dropoffLocation": "Serena Hotel, Nairobi",
  "vehicleTypeRequired": "sedan"
}
```

### 2. Daily Operations

**Allocating Vehicles:**

1. Go to "Bookings" tab
2. View pending bookings sorted by pickup time
3. Click "Allocate Vehicle" on a booking
4. System shows suggested vehicles with:
   - Distance to pickup location
   - ETA
   - Match score
   - Driver assignment
5. Click "Assign" on chosen vehicle
6. Data is sent to HolidayTaxis automatically

**Monitoring Fleet:**

1. Go to "Vehicles" tab
2. Filter by: All | Available | Allocated
3. View real-time status:
   - Online/Offline
   - Current speed
   - Last GPS update
   - Assigned driver

**Live Tracking:**

1. Go to "Live Map" tab (to be implemented)
2. See all vehicles on map
3. Click vehicle for details
4. View ongoing trips

### 3. Integration with Existing Backend

The frontend communicates with your existing NestJS backend:

**Wialon Sync:**
```
GET /wialon/vehicles/locations → Get all vehicles with GPS data
```

**HolidayTaxis Assignment:**
```
POST /integration/assign/:vehicleId → Send allocation to HolidayTaxis
```

The existing logic in your NestJS backend is **NOT changed**. This frontend just:
1. Pulls data from Wialon (via your backend)
2. Saves to database
3. Provides UI for allocation
4. Sends allocation to HolidayTaxis (via your backend)

## API Endpoints

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings?status=PENDING` - Filter by status
- `POST /api/bookings` - Create booking

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles?available=true` - Get available vehicles
- `GET /api/vehicles/suggest?bookingId=123` - Get vehicle suggestions
- `POST /api/vehicles` - Upsert vehicle (from Wialon sync)

### Allocations
- `GET /api/allocations` - Get all allocations
- `POST /api/allocations` - Create allocation

### Sync
- `GET /api/sync/wialon` - Get sync status
- `POST /api/sync/wialon` - Trigger Wialon sync

## Data Flow Example

```
1. Wialon API sends vehicle data to NestJS backend
   └─▶ Vehicle ID: 29613190
       Position: -1.2921, 36.8219
       Speed: 45 km/h
       Online: true

2. Frontend calls: POST /api/sync/wialon
   └─▶ Fetches from NestJS: GET /wialon/vehicles/locations
   └─▶ Saves to PostgreSQL database
   └─▶ Vehicle record created/updated

3. Manager creates booking:
   └─▶ POST /api/bookings
   └─▶ Booking saved: "BAHOL-26775108"
   └─▶ Pickup: JKIA Airport at 14:00

4. Manager clicks "Allocate Vehicle":
   └─▶ GET /api/vehicles/suggest?bookingId=123
   └─▶ System calculates:
       - Distance: Vehicle is 12.5 km from pickup
       - ETA: 18 minutes
       - Match score: 95%

5. Manager selects vehicle:
   └─▶ POST /api/allocations
   └─▶ Creates allocation in database
   └─▶ Calls NestJS: POST /integration/assign/29613190
   └─▶ NestJS sends to HolidayTaxis with existing format (unchanged)
   └─▶ Booking marked as ALLOCATED
```

## Troubleshooting

### Vehicles not syncing
- Check NestJS backend is running
- Verify `NEXT_PUBLIC_BACKEND_URL` in `.env`
- Check Wialon API credentials in backend
- View sync logs in database: `wialon_sync_logs` table

### HolidayTaxis errors
- Check `holidaytaxis_sync_logs` table
- Verify API key in backend `.env`
- Ensure driver/vehicle details exist in `vehicle-details.json`

### Database connection issues
- Verify PostgreSQL is running
- Check `DATABASE_URL` format
- Run `npx prisma studio` to inspect database

## Development Tools

**Prisma Studio** (Database GUI):
```bash
npx prisma studio
```

**View Logs:**
```sql
-- Wialon sync logs
SELECT * FROM wialon_sync_logs ORDER BY synced_at DESC LIMIT 10;

-- HolidayTaxis logs
SELECT * FROM holidaytaxis_sync_logs ORDER BY synced_at DESC LIMIT 10;
```

**Reset Database:**
```bash
npx prisma migrate reset
```

## Next Steps / Enhancements

- [ ] Add live map view with Leaflet/Mapbox
- [ ] Implement WebSocket for real-time vehicle updates
- [ ] Add driver mobile app
- [ ] Implement geofencing alerts
- [ ] Add reporting dashboard
- [ ] Bulk booking import (CSV/Excel)
- [ ] User authentication and roles
- [ ] Booking timeline view
- [ ] SMS/WhatsApp notifications

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Maps**: Leaflet (ready to integrate)
- **State**: React Query, Zustand
- **Backend Integration**: Axios (connects to existing NestJS)

## License

Proprietary - Internal use only

## Support

For issues or questions, contact the development team.
