"use server"

import { redirect } from "next/navigation"
import { findUserByEmail, createUser, verifyUser } from "@/lib/db"
import { sendOTP, verifyOTP } from "@/lib/otp"
import { setUserToken, clearUserToken, rateLimiter } from "@/lib/auth"
import { env } from "@/lib/env"
import bcrypt from "bcryptjs"

export async function signup(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Rate limiting
    if (!rateLimiter.isAllowed(`signup:${email}`)) {
      return { error: "Too many signup attempts. Please try again later." }
    }

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: "Please enter a valid email address" }
    }

    // Password validation
    if (password.length < 8) {
      return { error: "Password must be at least 8 characters long" }
    }

    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return { error: "User already exists with this email" }
    }

    // Hash password with configured rounds
    const passwordHash = await bcrypt.hash(password, env.security.bcryptRounds)

    await createUser(email, passwordHash)
    await sendOTP(email)

    if (env.app.isDevelopment) {
      console.log(`✅ User created successfully: ${email}`)
    }

    return { success: true, email, isLogin: false }
  } catch (error) {
    console.error("❌ Signup error:", error)
    return { error: "An error occurred during signup. Please try again." }
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Rate limiting
    if (!rateLimiter.isAllowed(`login:${email}`)) {
      return { error: "Too many login attempts. Please try again later." }
    }

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    const user = await findUserByEmail(email)
    if (!user) {
      return { error: "Invalid email or password" }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return { error: "Invalid email or password" }
    }

    // Always require OTP for sign-in (enhanced security)
    await sendOTP(email)

    if (env.app.isDevelopment) {
      console.log(`🔐 OTP sent for login verification: ${email}`)
    }

    return { requiresOTP: true, email, isLogin: true }
  } catch (error) {
    console.error("❌ Login error:", error)
    return { error: "An error occurred during login. Please try again." }
  }
}

export async function verifyOTPAction(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const code = formData.get("code") as string
    const isLogin = formData.get("isLogin") === "true"

    // Rate limiting
    if (!rateLimiter.isAllowed(`otp:${email}`)) {
      return { error: "Too many verification attempts. Please try again later." }
    }

    if (!email || !code) {
      return { error: "Email and OTP code are required" }
    }

    const isValid = await verifyOTP(email, code)
    if (!isValid) {
      return { error: "Invalid or expired OTP code" }
    }

    // If this is a signup flow, verify the user
    if (!isLogin) {
      await verifyUser(email)
    }

    const user = await findUserByEmail(email)

    if (user) {
      await setUserToken({
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: true,
      })

      if (env.app.isDevelopment) {
        console.log(`✅ OTP verified successfully for ${isLogin ? "login" : "signup"}: ${email}`)
      }

      // Redirect based on user role
      redirect(user.role === "admin" ? "/admin" : "/dashboard")
    }

    return { error: "User not found" }
  } catch (error: any) {
    // Check if this is a Next.js redirect (which is not a real error)
    if (error?.digest?.includes('NEXT_REDIRECT')) {
      throw error // Re-throw redirect errors to let Next.js handle them
    }
    
    console.error("❌ OTP verification error:", error)
    return { error: "An error occurred during verification. Please try again." }
  }
}

export async function logout() {
  try {
    await clearUserToken()

    if (env.app.isDevelopment) {
      console.log("✅ User logged out successfully")
    }

    redirect("/")
  } catch (error) {
    console.error("❌ Logout error:", error)
    redirect("/")
  }
}
