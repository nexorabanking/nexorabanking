export const env = {
  app: {
    isDevelopment: process.env.NODE_ENV === "development",
    isProduction: process.env.NODE_ENV === "production",
    url: process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://nexorabanking.com"),
  },
  email: {
    // Resend configuration
    resendApiKey: process.env.RESEND_API_KEY || "",
    fromEmail: process.env.RESEND_FROM_EMAIL || "noreply@nexorabanking.com",
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  },
}

// Warn about missing production configuration
if (env.app.isProduction && (!process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL.includes('localhost'))) {
  console.warn('⚠️  WARNING: NEXT_PUBLIC_APP_URL is not set or contains localhost. This may cause redirect issues in production.')
} 