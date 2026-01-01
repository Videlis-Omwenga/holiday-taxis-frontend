import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'

// GET /api/bookings - Proxy to backend
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    const url = `${BACKEND_URL}/bookings${queryString ? `?${queryString}` : ''}`

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    const headers: any = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const response = await axios.get(url, { headers })

    return NextResponse.json({ success: true, data: response.data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: error.response?.status || 500 }
    )
  }
}

// POST /api/bookings - Proxy to backend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = `${BACKEND_URL}/bookings`

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    const headers: any = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    const response = await axios.post(url, body, { headers })

    return NextResponse.json({ success: true, data: response.data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: error.response?.status || 500 }
    )
  }
}
