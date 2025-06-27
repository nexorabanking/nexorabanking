import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

export async function GET() {
  // Only allow this in development or with a secret key
  if (process.env.NODE_ENV === 'production' && !process.env.DEBUG_SECRET) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
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
    timestamp: new Date().toISOString(),
  })
} 