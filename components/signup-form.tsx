"use client"

import { useState } from "react"
import { signup } from "@/app/actions/auth"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OTPVerification } from "./otp-verification"
import { Mail, Lock, UserPlus, ArrowRight, Shield } from "lucide-react"

export function SignupForm() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [email, setEmail] = useState("")
  const [isLogin, setIsLogin] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const result = await signup(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setEmail(result.email)
      setIsLogin(result.isLogin || false)
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
          <Label htmlFor="signup-username" className="text-white/90 font-medium">
            Username
          </Label>
          <div className="relative">
            <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/90" />
            <Input
              id="signup-username"
              name="username"
              type="text"
              placeholder="Choose a username"
              className="input-modern pl-12 text-[#9333ea] md:text-white/90"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-email" className="text-white/90 font-medium">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/90" />
            <Input
              id="signup-email"
              name="email"
              type="email"
              placeholder="Enter your email"
              className="input-modern pl-12 text-[#9333ea] md:text-white/90"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password" className="text-white/90 font-medium">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/90" />
            <Input
              id="signup-password"
              name="password"
              type="password"
              placeholder="Create a secure password"
              className="input-modern pl-12 text-[#9333ea] md:text-white/90"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-white/90 font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/90" />
            <Input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="input-modern pl-12 text-[#9333ea] md:text-white/90"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-green-400 text-sm font-medium">Account Verification</p>
            <p className="text-green-300/80 text-xs mt-1">
              We'll send a verification code to your email to activate your account securely.
            </p>
          </div>
        </div>
      </div>

      <LoadingButton type="submit" variant="crypto" className="w-full group" loading={loading}>
        {!loading && (
          <>
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
        {loading && "Creating account..."}
      </LoadingButton>
    </form>
  )
}
