import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:9000'

// GET /api/vehicles/suggest?bookingId=123 - Proxy to backend
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'bookingId is required' },
        { status: 400 }
      )
    }

    // Get authorization header from the request
    const authHeader = request.headers.get('authorization')
    const headers: any = {}
    if (authHeader) {
      headers.Authorization = authHeader
    }

    // Call backend suggested vehicles endpoint
    const url = `${BACKEND_URL}/bookings/${bookingId}/suggested-vehicles`
    const response = await axios.get(url, { headers })

    return NextResponse.json({ success: true, data: response.data })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to suggest vehicles' },
      { status: error.response?.status || 500 }
    )
  }
}
