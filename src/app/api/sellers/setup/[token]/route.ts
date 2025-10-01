import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/environment'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    
    // Get the backend URL from centralized environment config
    const backendUrl = env.API_URL
    
    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/v1/sellers/setup/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('Verify setup token API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        details: [{ message: 'Failed to verify setup token. Please try again.' }]
      },
      { status: 500 }
    )
  }
} 