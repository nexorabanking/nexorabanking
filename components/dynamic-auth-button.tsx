"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, User } from "lucide-react"
import Link from "next/link"

interface DynamicAuthButtonProps {
  user?: {
    id: number
    email: string
    role: string
  } | null
}

export function DynamicAuthButton({ user }: DynamicAuthButtonProps) {
  if (user) {
    // User is logged in - show dashboard link and user info
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden md:flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 flex items-center justify-center text-white font-medium">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">{user.email.split("@")[0]}</p>
            <p className="text-white/50 text-xs capitalize">{user.role}</p>
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
