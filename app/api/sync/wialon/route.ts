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

    // Call backend Wialon sync endpoint
    const url = `${BACKEND_URL}/wialon/sync-vehicles`
    const response = await axios.post(url, {}, { headers })

    return NextResponse.json({
      success: true,
      message: 'Vehicles synced successfully',
      data: response.data,
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

    // Get vehicle count from backend
    const vehiclesUrl = `${BACKEND_URL}/vehicles`
    const vehiclesResponse = await axios.get(vehiclesUrl, { headers })
    const vehicles = vehiclesResponse.data

    const totalVehicles = vehicles.length
    const onlineVehicles = vehicles.filter((v: any) => v.isOnline).length

    return NextResponse.json({
      success: true,
      data: {
        totalVehicles,
        onlineVehicles,
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
