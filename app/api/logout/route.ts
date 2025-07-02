import { NextRequest, NextResponse } from 'next/server'
import { clearUserToken } from '@/lib/auth'
import { env } from '@/lib/env'

export async function GET(request: NextRequest) {
  return handleLogout()
}

export async function POST(request: NextRequest) {
  return handleLogout()
}

async function handleLogout() {
  try {
    await clearUserToken()
    
    // Redirect to home page using the configured app URL
    return NextResponse.redirect(new URL('/', env.app.url))
  } catch (error) {
    console.error('❌ API Logout error:', error)
    // Even if there's an error, redirect to home page
    return NextResponse.redirect(new URL('/', env.app.url))
  }
} 