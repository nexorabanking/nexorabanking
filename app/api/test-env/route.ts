import { NextResponse } from 'next/server'
import { env } from '@/lib/env'
import { sendOTP, verifyOTP, getOTPStatus, testOTPSystem } from '@/lib/otp'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const email = searchParams.get('email')
  const code = searchParams.get('code')
  const secret = searchParams.get('secret')

  // Security check for production
  const isProduction = process.env.NODE_ENV === 'production'
  const hasValidSecret = secret === process.env.DEBUG_SECRET
  const isTestEmail = email && (email.includes('test') || email.includes('debug') || email.endsWith('.test'))
  
  // Allow OTP testing in production if:
  // 1. Has valid secret key, OR
  // 2. Is a test email (contains 'test', 'debug', or ends with '.test')
  const allowOTPTesting = !isProduction || hasValidSecret || isTestEmail

  // OTP testing actions
  if (action && action.startsWith('otp') && email) {
    if (!allowOTPTesting) {
      return NextResponse.json({ 
        error: 'OTP testing not allowed in production without valid secret or test email',
        hint: 'Use a test email (contains "test" or ends with ".test") or provide DEBUG_SECRET'
      }, { status: 403 })
    }

    if (action === 'send-otp') {
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

    if (action === 'verify-otp' && code) {
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

    if (action === 'otp-status') {
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

    if (action === 'test-otp') {
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
  }

  // Default environment info - only allow in development or with secret
  if (isProduction && !hasValidSecret) {
    return NextResponse.json({ 
      error: 'Environment info not available in production without DEBUG_SECRET',
      hint: 'Add ?secret=your_debug_secret to access environment info'
    }, { status: 403 })
  }

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
      ],
      productionAccess: 'Use test emails (contains "test" or ends with ".test") or provide DEBUG_SECRET'
    },
    timestamp: new Date().toISOString(),
  })
} 