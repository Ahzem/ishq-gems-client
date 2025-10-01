import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/environment';

const API_BASE_URL = env.API_BASE_URL;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required', error: 'MISSING_TOKEN' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/email-verification/verify/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Email verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
} 