"use server"

import { redirect } from "next/navigation"
import { findUserByEmail, findUserByUsername, createUser, verifyUser } from "@/lib/db"
import { sendOTP, verifyOTP } from "@/lib/otp"
import { setUserToken, clearUserToken, rateLimiter } from "@/lib/auth"
import { env } from "@/lib/env"
import bcrypt from "bcryptjs"

export async function signup(formData: FormData) {
  try {
    const username = formData.get("username") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Rate limiting
    if (!rateLimiter.isAllowed(`signup:${email}`)) {
      return { error: "Too many signup attempts. Please try again later." }
    }

    if (!username || !email || !password) {
      return { error: "Username, email and password are required" }
    }

    // Username validation
    if (username.length < 3 || username.length > 20) {
      return { error: "Username must be between 3 and 20 characters" }
    }

    // Username format validation (alphanumeric and underscores only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/
    if (!usernameRegex.test(username)) {
      return { error: "Username can only contain letters, numbers, and underscores" }
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

    const existingUserByEmail = await findUserByEmail(email)
    if (existingUserByEmail) {
      return { error: "User already exists with this email" }
    }

    const existingUserByUsername = await findUserByUsername(username)
    if (existingUserByUsername) {
      return { error: "Username is already taken" }
    }

    // Hash password with configured rounds
    const passwordHash = await bcrypt.hash(password, env.security.bcryptRounds)

    await createUser(username, email, passwordHash)
    await sendOTP(email)

    if (env.app.isDevelopment) {
      console.log(`✅ User created successfully: ${username} (${email})`)
    }

    return { success: true, email, isLogin: false }
  } catch (error) {
    console.error("❌ Signup error:", error)
    return { error: "An error occurred during signup. Please try again." }
  }
}

export async function login(formData: FormData) {
  try {
    const identifier = formData.get("identifier") as string
    const password = formData.get("password") as string

    // Rate limiting
    if (!rateLimiter.isAllowed(`login:${identifier}`)) {
      return { error: "Too many login attempts. Please try again later." }
    }

    if (!identifier || !password) {
      return { error: "Identifier and password are required" }
    }

    // Determine if identifier is email or username
    const isEmail = identifier.includes('@')
    let user: any = null

    if (isEmail) {
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(identifier)) {
        return { error: "Please enter a valid email address" }
      }
      user = await findUserByEmail(identifier)
    } else {
      // Username validation
      if (identifier.length < 3 || identifier.length > 20) {
        return { error: "Username must be between 3 and 20 characters" }
      }
      user = await findUserByUsername(identifier)
    }

    if (!user) {
      return { error: "Invalid credentials" }
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return { error: "Invalid credentials" }
    }

    // Always require OTP for sign-in (enhanced security)
    await sendOTP(user.email)

    if (env.app.isDevelopment) {
      console.log(`🔐 OTP sent for login verification: ${user.username} (${user.email})`)
    }

    return { requiresOTP: true, email: user.email, isLogin: true }
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
        username: user.username,
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
