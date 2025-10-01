import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/environment';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
          error: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();

    const response = await fetch(`${env.API_URL}/api/user/avatar`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader
      },
      body: formData
    });

    const data = await response.json();
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Avatar update error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
} 