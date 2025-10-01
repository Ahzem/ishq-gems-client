import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/config/environment';

const API_BASE_URL = env.API_BASE_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required', error: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Forward request to backend
    const response = await fetch(`${API_BASE_URL}/email-verification/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Resend verification API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
} 