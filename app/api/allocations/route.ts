import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'

// POST /api/allocations - Proxy to backend allocation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, vehicleId, driverId } = body

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    const headers: any = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Call backend allocate endpoint
    const url = `${BACKEND_URL}/bookings/${bookingId}/allocate`
    const response = await axios.post(url, { vehicleId, driverId }, { headers })

    return NextResponse.json({
      success: true,
      data: response.data,
      message: 'Vehicle allocated successfully'
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.response?.data?.message || 'Failed to allocate booking' },
      { status: error.response?.status || 500 }
    )
  }
}

// GET /api/allocations - Proxy to backend bookings endpoint
export async function GET(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    const headers: any = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Get allocated bookings from backend
    const url = `${BACKEND_URL}/bookings?status=allocated`
    const response = await axios.get(url, { headers })

    return NextResponse.json({ success: true, data: response.data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch allocations' },
      { status: error.response?.status || 500 }
    )
  }
}
