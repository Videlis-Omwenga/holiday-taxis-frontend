import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'

// POST /api/sync/wialon - Proxy to backend sync endpoint
export async function POST(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    const headers: any = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Sync both vehicles and drivers from Wialon
    const vehiclesUrl = `${BACKEND_URL}/wialon/sync-vehicles`
    const driversUrl = `${BACKEND_URL}/wialon/sync-drivers`

    // Run both syncs in parallel
    const [vehiclesResponse, driversResponse] = await Promise.all([
      axios.post(vehiclesUrl, {}, { headers }),
      axios.post(driversUrl, {}, { headers })
    ])

    const vehiclesData = vehiclesResponse.data
    const driversData = driversResponse.data

    return NextResponse.json({
      success: true,
      message: `Synced ${vehiclesData.created + vehiclesData.updated} vehicles and ${driversData.created + driversData.updated} drivers successfully`,
      data: {
        vehicles: vehiclesData,
        drivers: driversData,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data?.message || 'Failed to sync from Wialon' },
      { status: error.response?.status || 500 }
    )
  }
}

// GET /api/sync/wialon - Proxy to get sync status from backend
export async function GET(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    const headers: any = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Get vehicle and driver counts from backend
    const vehiclesUrl = `${BACKEND_URL}/vehicles`
    const driversUrl = `${BACKEND_URL}/drivers`

    const [vehiclesResponse, driversResponse] = await Promise.all([
      axios.get(vehiclesUrl, { headers }),
      axios.get(driversUrl, { headers })
    ])

    const vehicles = vehiclesResponse.data
    const drivers = driversResponse.data

    const totalVehicles = vehicles.length
    const onlineVehicles = vehicles.filter((v: any) => v.isOnline).length
    const totalDrivers = drivers.length
    const availableDrivers = drivers.filter((d: any) => d.status === 'available' && !d.isAllocated).length

    return NextResponse.json({
      success: true,
      data: {
        totalVehicles,
        onlineVehicles,
        totalDrivers,
        availableDrivers,
        lastSyncSuccess: true,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to get sync status' },
      { status: error.response?.status || 500 }
    )
  }
}
