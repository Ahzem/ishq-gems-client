import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/environment'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get the backend URL from centralized environment config
    const backendUrl = env.API_URL
    
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
    const response = await fetch(`${backendUrl}/api/v1/admin/sellers/${id}/verify-video-call`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify({ completed: true })
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
    })
  } catch (error) {
    console.error('Video call verification API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        details: [{ message: 'Failed to update video call status. Please try again.' }]
      },
      { status: 500 }
    )
  }
} 