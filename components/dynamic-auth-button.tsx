"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, User } from "lucide-react"
import Link from "next/link"

interface DynamicAuthButtonProps {
  user?: {
    id: number
    email: string
    role: string
    username?: string
  } | null
}

export function DynamicAuthButton({ user }: DynamicAuthButtonProps) {
  if (user) {
    // User is logged in - show dashboard link and user info
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {(user.username || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-white text-sm font-medium">{user.username || 'User'}</p>
            <p className="text-white/60 text-xs">{user.email}</p>
          </div>
        </div>
        <Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
          <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Go to Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    )
  }

  // User is not logged in - show create account button
  return (
    <Link href="/login">
    <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
      Account Login
      <ArrowRight className="h-4 w-4 ml-2" />
    </Button>
    </Link>
  )
}
