"use client"

import { useEffect, useRef } from 'react'

export function useInactivityTimeout(timeoutMinutes: number = 10) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())

  const resetTimer = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Update last activity time
    lastActivityRef.current = Date.now()

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('🕐 Session expired - logging out due to inactivity')
      // Simple redirect to logout
      window.location.href = '/api/logout'
    }, timeoutMinutes * 60 * 1000)
  }

  const handleActivity = () => {
    resetTimer()
  }

  useEffect(() => {
    console.log(`🚀 Setting up inactivity timeout for ${timeoutMinutes} minutes`)

    // Events to track
    const events = ['mousedown', 'mousemove', 'keypress', 'keydown', 'scroll', 'touchstart', 'click', 'focus']

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Start the timer
    resetTimer()

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [timeoutMinutes])

  return {
    resetTimer,
    getTimeRemaining: () => {
      const elapsed = Date.now() - lastActivityRef.current
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed
      return Math.max(0, remaining)
    },
    getTimeRemainingMinutes: () => {
      const elapsed = Date.now() - lastActivityRef.current
      const remaining = (timeoutMinutes * 60 * 1000) - elapsed
      return Math.ceil(Math.max(0, remaining) / (60 * 1000))
    }
  }
} 