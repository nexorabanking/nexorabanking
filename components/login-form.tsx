"use client"

import { useState } from "react"
import { login } from "@/app/actions/auth"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OTPVerification } from "./otp-verification"
import { Mail, Lock, ArrowRight, Shield } from "lucide-react"

export function LoginForm() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [email, setEmail] = useState("")
  const [isLogin, setIsLogin] = useState(true)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.requiresOTP) {
      setEmail(result.email)
      setIsLogin(result.isLogin || true)
      setShowOTP(true)
    }

    setLoading(false)
  }

  if (showOTP) {
    return <OTPVerification email={email} isLogin={isLogin} />
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-200">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90 font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="input-modern pl-12 text-[#9333ea] md:text-white"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90 font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              className="input-modern pl-12 text-[#9333ea] md:text-white"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-400 text-sm font-medium">Enhanced Security</p>
            <p className="text-blue-300/80 text-xs mt-1">
              For your security, we'll send a verification code to your email after validating your credentials.
            </p>
          </div>
        </div>
      </div>

      <LoadingButton type="submit" variant="crypto" className="w-full group" loading={loading}>
        {!loading && (
          <>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
        {loading && "Verifying credentials..."}
      </LoadingButton>
    </form>
  )
}
