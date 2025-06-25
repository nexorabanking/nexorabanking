"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: React.ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "crypto"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

export function LoadingButton({
  loading = false,
  children,
  className,
  disabled,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn(variant === "crypto" && "crypto-button", className)}
      disabled={disabled || loading}
      variant={variant === "crypto" ? "default" : variant}
      size={size}
      asChild={asChild && !loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
