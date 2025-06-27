import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { sendOTP, verifyOTP, getOTPStatus, testOTPSystem } from '@/lib/otp'

export async function GET(request: Request) {
  // Only allow this in development or with a secret key
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG_SECRET) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const email = searchParams.get('email')
  const code = searchParams.get('code')

  // OTP testing actions
  if (action === 'send-otp' && email) {
    try {
      const otpCode = await sendOTP(email)
      return NextResponse.json({
        success: true,
        action: 'send-otp',
        email,
        code: otpCode,
        status: getOTPStatus(email),
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        action: 'send-otp',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }
  }

  if (action === 'verify-otp' && email && code) {
    try {
      const isValid = await verifyOTP(email, code)
      return NextResponse.json({
        success: true,
        action: 'verify-otp',
        email,
        code,
        isValid,
        status: getOTPStatus(email),
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        action: 'verify-otp',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }
  }

  if (action === 'otp-status' && email) {
    try {
      const status = getOTPStatus(email)
      return NextResponse.json({
        success: true,
        action: 'otp-status',
        email,
        status,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        action: 'otp-status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }
  }

  if (action === 'test-otp' && email) {
    try {
      const result = await testOTPSystem(email)
      return NextResponse.json({
        success: true,
        action: 'test-otp',
        email,
        result,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        action: 'test-otp',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }
  }

  // Default environment info
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      isDevelopment: env.app.isDevelopment,
      isProduction: env.app.isProduction,
    },
    email: {
      resendApiKeyExists: !!env.email.resendApiKey,
      resendApiKeyLength: env.email.resendApiKey?.length || 0,
      fromEmail: env.email.fromEmail,
      rawResendApiKey: process.env.RESEND_API_KEY ? 'EXISTS' : 'MISSING',
      rawResendFromEmail: process.env.RESEND_FROM_EMAIL || 'NOT_SET',
    },
    otp: {
      availableActions: [
        'send-otp?email=test@example.com',
        'verify-otp?email=test@example.com&code=123456',
        'otp-status?email=test@example.com',
        'test-otp?email=test@example.com'
      ]
    },
    timestamp: new Date().toISOString(),
  })
} 