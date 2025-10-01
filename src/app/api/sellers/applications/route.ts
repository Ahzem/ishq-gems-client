import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/environment'

export async function GET(request: NextRequest) {
  try {
    // Get query parameters from the URL
    const { searchParams } = new URL(request.url)
    
    // Get the backend URL from centralized environment config
    const backendUrl = env.API_URL
    
    // Forward the query parameters to the backend
    const queryString = searchParams.toString()
    
    // Get authorization header from the request
    const authorization = request.headers.get('authorization')
    
    if (!authorization) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization header required',
          error: 'MISSING_AUTH_HEADER'
        },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(`${backendUrl}/api/v1/admin/sellers?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('Seller applications API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        details: [{ message: 'Failed to fetch seller applications. Please try again.' }]
      },
      { status: 500 }
    )
  }
} 