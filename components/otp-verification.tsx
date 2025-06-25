"use client"

import { useState } from "react"
import { verifyOTPAction } from "@/app/actions/auth"
import { LoadingButton } from "@/components/ui/loading-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, ArrowRight, Clock } from "lucide-react"

interface OTPVerificationProps {
  email: string
  isLogin?: boolean
}

export function OTPVerification({ email, isLogin = false }: OTPVerificationProps) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const result = await verifyOTPAction(formData)

    if (result?.error) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-600 p-4">
          <Shield className="w-full h-full text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isLogin ? "Verify Your Sign-In" : "Verify Your Account"}
        </h2>
        <p className="text-white/70">
          We've sent a 6-digit verification code to <span className="text-white font-medium">{email}</span>
        </p>
        {isLogin && <p className="text-white/50 text-sm mt-2">This extra step helps keep your account secure</p>}
      </div>

      <form action={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="isLogin" value={isLogin.toString()} />

        <div className="space-y-2">
          <Label htmlFor="code" className="text-white/90 font-medium">
            Verification Code
          </Label>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="input-modern text-center text-2xl tracking-widest text-[#9333ea] md:text-white/90"
            required
          />
          <p className="text-xs text-white/50 text-center">Check your email for the verification code</p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-amber-400 text-sm font-medium">Code expires in 5 minutes</p>
              <p className="text-amber-300/80 text-xs mt-1">
                Didn't receive the code? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>

        <LoadingButton type="submit" variant="crypto" className="w-full group" loading={loading}>
          {!loading && (
            <>
              Verify Code
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
          {loading && "Verifying..."}
        </LoadingButton>
      </form>
    </div>
  )
}
