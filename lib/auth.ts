import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { env } from "./env"
import { sign, verify } from "jsonwebtoken"

export interface User {
  id: number
  username: string
  email: string
  role: "customer" | "admin"
  isVerified: boolean
}

export interface JWTPayload extends User {
  iat: number
  exp: number
}

// JWT token management with environment variables
export function generateToken(user: User): string {
  try {
    return sign(user, env.jwt.secret as any, {
      expiresIn: "24h", // Set to 24 hours
      issuer: "nexora-banking",
      audience: "nexora-banking-users",
    })
  } catch (error) {
    console.error("❌ Error generating JWT token:", error)
    throw new Error("Failed to generate authentication token")
  }
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return verify(token, env.jwt.secret as any, {
      issuer: "nexora-banking",
      audience: "nexora-banking-users",
    }) as JWTPayload
  } catch (error) {
    if (env.app.isDevelopment) {
      console.log("🔒 Invalid or expired token")
    }
    return null
  }
}

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get("auth-token")

    if (!tokenCookie) {
      return null
    }

    const payload = verifyToken(tokenCookie.value)
    if (!payload) {
      return null
    }

    return {
      id: payload.id,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      isVerified: payload.isVerified,
    }
  } catch (error) {
    console.error("❌ Error getting user from token:", error)
    return null
  }
}

export async function requireAuth(role?: "customer" | "admin"): Promise<User> {
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  if (role && user.role !== role) {
    redirect("/")
  }

  return user
}

export async function setUserToken(user: User): Promise<void> {
  try {
    const token = generateToken(user)
    const cookieStore = await cookies()

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: env.app.isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    if (env.app.isDevelopment) {
      console.log(`🔐 Set authentication token for user: ${user.email}`)
    }
  } catch (error) {
    console.error("❌ Error setting user token:", error)
    throw new Error("Failed to set authentication token")
  }
}

export async function clearUserToken(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")

    if (env.app.isDevelopment) {
      console.log("🔓 Cleared authentication token")
    }
  } catch (error) {
    console.error("❌ Error clearing user token:", error)
    throw new Error("Failed to clear authentication token")
  }
}

// Session management with enhanced security
export async function createSecureSession(user: User): Promise<string> {
  try {
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    // In production, store this in Redis or database
    const sessionId = generateToken(user)

    if (env.app.isDevelopment) {
      console.log(`🔒 Created secure session for user: ${user.email}`)
    }

    return sessionId
  } catch (error) {
    console.error("❌ Error creating secure session:", error)
    throw new Error("Failed to create secure session")
  }
}

// Rate limiting helper
export function createRateLimiter() {
  const requests = new Map<string, { count: number; resetTime: number }>()

  return {
    isAllowed: (identifier: string): boolean => {
      const now = Date.now()
      const windowStart = now - env.rateLimit.windowMs

      const userRequests = requests.get(identifier)

      if (!userRequests || userRequests.resetTime < now) {
        requests.set(identifier, { count: 1, resetTime: now + env.rateLimit.windowMs })
        return true
      }

      if (userRequests.count >= env.rateLimit.maxRequests) {
        return false
      }

      userRequests.count++
      return true
    },

    getRemainingRequests: (identifier: string): number => {
      const userRequests = requests.get(identifier)
      if (!userRequests) return env.rateLimit.maxRequests

      return Math.max(0, env.rateLimit.maxRequests - userRequests.count)
    },
  }
}

export const rateLimiter = createRateLimiter()
