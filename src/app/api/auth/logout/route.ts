import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/config/environment'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    const response = await fetch(`${env.API_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    })

    const data = await response.json()

    // Create response with cleared cookies
    const nextResponse = NextResponse.json(data, {
      status: response.status,
    })

    // Clear cookies on the client side
    nextResponse.cookies.set('token', '', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    })

    nextResponse.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: 'strict',
      path: '/',
      expires: new Date(0), // Expire immediately
    })

    return nextResponse
  } catch (error) {
    console.error('Logout API error:', error)
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