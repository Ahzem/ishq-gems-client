import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/environment'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    
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

    const response = await fetch(`${env.API_URL}/api/v1/auth/create-seller`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('Create seller API error:', error)
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