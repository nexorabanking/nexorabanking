import { NextRequest, NextResponse } from 'next/server'
import { clearUserToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  return handleLogout()
}

export async function POST(request: NextRequest) {
  return handleLogout()
}

async function handleLogout() {
  try {
    await clearUserToken()
    
    // Redirect to home page instead of returning JSON
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('❌ API Logout error:', error)
    // Even if there's an error, redirect to home page
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }
} 