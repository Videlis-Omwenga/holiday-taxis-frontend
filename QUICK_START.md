# Quick Start Guide

Get the taxi integration system up and running in 5 minutes.

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`psql --version`)
- [ ] Existing NestJS backend running at `http://localhost:3000`
- [ ] Wialon API credentials configured in backend

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
cd /home/videlis/Desktop/taxi-integration
npm install
```

This installs:
- Next.js and React
- Prisma (database ORM)
- Tailwind CSS (styling)
- Axios (API calls)
- Date utilities and icons

### 2. Configure Database (1 minute)

Create a PostgreSQL database:

```bash
# Option A: Using psql command line
psql -U postgres
CREATE DATABASE taxi_integration;
\q

# Option B: Using pgAdmin GUI
# Right-click Databases → Create → Database → "taxi_integration"
```

Copy environment file:

```bash
cp .env.example .env
```

Edit `.env` and update:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/taxi_integration"
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
```

### 3. Initialize Database (1 minute)

Run Prisma migrations:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

This creates all tables:
- ✅ vehicles
- ✅ drivers
- ✅ bookings
- ✅ allocations
- ✅ wialon_sync_logs
- ✅ holidaytaxis_sync_logs

### 4. Start the Application (1 minute)

```bash
npm run dev
```

Open browser: [http://localhost:3001](http://localhost:3001)

You should see the dashboard!

## First Use

### Sync Vehicles from Wialon

1. Make sure your NestJS backend is running
2. In the dashboard, click **"Sync Wialon"** button (top right)
3. Wait 5-10 seconds
4. You should see success message
5. Go to "Vehicles" tab to see your fleet

### Create a Test Booking

Option A: Use Prisma Studio (GUI)

```bash
npx prisma studio
```

- Go to `bookings` table
- Click "Add record"
- Fill in details
- Save

Option B: Use API

```bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "bookingReference": "TEST-12345",
    "passengerName": "John Doe",
    "passengerPhone": "+254712345678",
    "passengerCount": 2,
    "luggageCount": 3,
    "pickupLocation": "JKIA Airport",
    "pickupLat": -1.319167,
    "pickupLng": 36.927778,
    "pickupTime": "2025-11-20T14:00:00Z",
    "dropoffLocation": "Serena Hotel",
    "vehicleTypeRequired": "sedan"
  }'
```

### Allocate a Vehicle

1. Go to "Bookings" tab
2. You'll see your test booking
3. Click "Allocate Vehicle"
4. See suggested vehicles sorted by:
   - Distance to pickup
   - Match score
   - ETA
5. Click "Assign" on a vehicle
6. Done! Data sent to HolidayTaxis automatically

## Verify Everything Works

### Check Database

```bash
npx prisma studio
```

You should see:
- ✅ Vehicles with GPS positions
- ✅ Your test booking
- ✅ Allocation linking booking to vehicle
- ✅ Sync logs

### Check Logs

In Prisma Studio:

**wialon_sync_logs:**
- Should show recent sync
- `success` = true
- `data_snapshot` contains vehicle data

**holidaytaxis_sync_logs:**
- Should show allocation sent
- `success` = true
- `request_payload` and `response_data` populated

## Common Issues

### "Connection refused" to PostgreSQL

**Fix:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql
```

### "Cannot find module @prisma/client"

**Fix:**
```bash
npx prisma generate
```

### "Backend API not responding"

**Fix:**
1. Check NestJS backend is running: `http://localhost:3000`
2. Check `.env` has correct `NEXT_PUBLIC_BACKEND_URL`
3. Test backend: `curl http://localhost:3000/wialon/vehicles/locations`

### "No vehicles showing after sync"

**Fix:**
1. Check backend Wialon credentials
2. Check backend logs for errors
3. Check `wialon_sync_logs` table for error messages
4. Verify vehicles exist in Wialon

## Development Commands

```bash
# Start dev server
npm run dev

# View database
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name description_of_changes

# Check database sync status
# (Open Prisma Studio → wialon_sync_logs → check latest entry)
```

## Next Steps

Now that everything is working:

1. **Import your fleet**: Sync all vehicles from Wialon
2. **Add drivers**: Use Prisma Studio to add driver records
3. **Link drivers to vehicles**: Update `currentDriverId` in vehicles table
4. **Import real bookings**: Use the API or manual entry
5. **Set up auto-sync**: Add cron job to sync every 30 seconds (optional)

## Auto-Sync Setup (Optional)

To automatically sync Wialon data every 30 seconds:

Create a new file `lib/sync-scheduler.ts`:

```typescript
// Auto-sync every 30 seconds
setInterval(async () => {
  try {
    const response = await fetch('http://localhost:3001/api/sync/wialon', {
      method: 'POST'
    })
    const data = await response.json()
    console.log('Auto-sync:', data.message)
  } catch (error) {
    console.error('Auto-sync failed:', error)
  }
}, 30000) // 30 seconds
```

Or use a separate cron job:

```bash
# Add to crontab
*/1 * * * * curl -X POST http://localhost:3001/api/sync/wialon
```

## Production Checklist

Before deploying to production:

- [ ] Set up proper PostgreSQL user (not postgres)
- [ ] Use strong database password
- [ ] Set `NODE_ENV=production`
- [ ] Add authentication (NextAuth.js)
- [ ] Add user roles (ADMIN, MANAGER, VIEWER)
- [ ] Set up SSL for database connection
- [ ] Configure proper CORS for backend
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Add rate limiting on API routes
- [ ] Set up automated backups
- [ ] Document your specific vehicle types
- [ ] Train staff on the system

## Support

If you encounter issues:

1. Check the logs in `wialon_sync_logs` and `holidaytaxis_sync_logs`
2. Review the [README.md](README.md) for detailed explanations
3. Read [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for architecture details
4. Check your NestJS backend logs

## Success!

You now have a working taxi integration system!

Key features:
- ✅ Real-time vehicle tracking from Wialon
- ✅ Smart vehicle suggestions based on distance
- ✅ Manual allocation interface for managers
- ✅ Automatic sync to HolidayTaxis
- ✅ Full audit trail and logging
- ✅ Database-backed for reliability

Happy allocating! 🚗
