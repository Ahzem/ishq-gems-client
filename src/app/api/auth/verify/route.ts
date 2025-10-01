import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/environment'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization header required',
          error: 'MISSING_AUTH_HEADER'
        },
        { status: 401 }
      )
    }

    const response = await fetch(`${env.API_URL}/api/v1/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('Verify token API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    )
  }
} 