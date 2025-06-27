import { env } from "./env"
import crypto from "crypto"

// Enhanced OTP management with environment variables
interface OTPData {
  code: string
  expires: number
  attempts: number
  createdAt: number
}

// Use Map instead of plain object for better performance and reliability
const otpStore = new Map<string, OTPData>()

export function generateOTP(): string {
  // Use crypto for secure random number generation
  const buffer = crypto.randomBytes(3)
  // Ensure we get a 6-digit number between 100000 and 999999
  const code = ((Number.parseInt(buffer.toString("hex"), 16) % 900000) + 100000).toString()
  
  // Double-check the code is exactly 6 digits
  if (code.length !== 6) {
    // Fallback: generate a simple 6-digit code
    return Math.floor(100000 + Math.random() * 900000).toString()
  }
  
  return code
}

export async function sendOTP(email: string): Promise<string> {
  try {
    const code = generateOTP()
    const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
    const createdAt = Date.now()

    if (env.app.isDevelopment) {
      console.log(`🚀 Starting OTP process for ${email}`)
      console.log(`📧 Generated code: ${code}`)
    }

    // Check if there's an existing OTP that was sent recently (prevent spam)
    const existing = otpStore.get(email)
    if (existing && createdAt - existing.createdAt < 60 * 1000) {
      // 1 minute cooldown
      if (env.app.isDevelopment) {
        console.log(`⏰ OTP cooldown active for ${email}. Please wait before requesting a new code.`)
      }
      throw new Error("Please wait before requesting a new verification code")
    }

    // Clear any existing OTP for this email to prevent conflicts
    if (existing) {
      otpStore.delete(email)
      if (env.app.isDevelopment) {
        console.log(`🗑️ Cleared existing OTP for ${email}`)
      }
    }

    // Store the OTP IMMEDIATELY and synchronously before any async operations
    const otpData: OTPData = {
      code,
      expires,
      attempts: 0,
      createdAt,
    }
    
    otpStore.set(email, otpData)

    // Verify the OTP was stored correctly IMMEDIATELY
    const storedVerification = otpStore.get(email)
    if (!storedVerification || storedVerification.code !== code) {
      throw new Error("Failed to store OTP properly")
    }

    if (env.app.isDevelopment) {
      console.log(`📧 OTP stored successfully for ${email}: ${code}`)
      console.log(`📧 OTP expires at: ${new Date(expires).toLocaleString()}`)
      console.log(`📧 Current OTP store size: ${otpStore.size}`)
      console.log(`📧 Store keys:`, Array.from(otpStore.keys()))
    }

    // Now handle email sending (this won't affect the stored OTP)
    if (env.app.isDevelopment) {
      console.log(`📧 OTP for ${email}: ${code}`)
      console.log(`🔐 This code is required for both sign-in and account creation`)
    } else {
      // Send actual email using Resend
      try {
        await sendOTPEmail(email, code)
      } catch (error) {
        // Log the error but DON'T remove the OTP - user can still use it
        console.error(`⚠️ Email sending failed for ${email}:`, error)
        console.log(`⚠️ OTP is still valid: ${code}`)
        // Don't throw the error, just log it - the OTP is still stored and usable
      }
    }

    return code
  } catch (error) {
    console.error("❌ Error sending OTP:", error)
    throw new Error("Failed to send OTP")
  }
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  try {
    const stored = otpStore.get(email)

    if (env.app.isDevelopment) {
      console.log(`🔍 Verifying OTP for ${email}`)
      console.log(`🔍 Received code: ${code}`)
      console.log(`🔍 Stored OTP exists: ${!!stored}`)
      if (stored) {
        console.log(`🔍 Stored code: ${stored.code}`)
        console.log(`🔍 Attempts: ${stored.attempts}/3`)
        console.log(`🔍 Expires at: ${new Date(stored.expires).toLocaleString()}`)
      }
    }

    if (!stored) {
      if (env.app.isDevelopment) {
        console.log(`❌ No OTP found for ${email}`)
        console.log(`📊 Current OTP store:`, Array.from(otpStore.keys()))
        console.log(`📊 Store size: ${otpStore.size}`)
      }
      return false
    }

    // Check if OTP has expired
    if (Date.now() > stored.expires) {
      otpStore.delete(email)
      if (env.app.isDevelopment) {
        console.log(`⏰ OTP expired for ${email}`)
        console.log(`⏰ Expired at: ${new Date(stored.expires).toLocaleString()}`)
        console.log(`⏰ Current time: ${new Date().toLocaleString()}`)
      }
      return false
    }

    // Increment attempt counter
    stored.attempts++

    // Check for too many attempts
    if (stored.attempts > 3) {
      otpStore.delete(email)
      if (env.app.isDevelopment) {
        console.log(`🚫 Too many OTP attempts for ${email}. Attempts: ${stored.attempts}/3`)
      }
      return false
    }

    // Verify code (trim whitespace and normalize)
    const normalizedStoredCode = stored.code.trim()
    const normalizedReceivedCode = code.trim()
    
    if (env.app.isDevelopment) {
      console.log(`🔍 Comparing codes:`)
      console.log(`🔍 Stored (normalized): "${normalizedStoredCode}"`)
      console.log(`🔍 Received (normalized): "${normalizedReceivedCode}"`)
      console.log(`🔍 Length match: ${normalizedStoredCode.length === normalizedReceivedCode.length}`)
      console.log(`🔍 Exact match: ${normalizedStoredCode === normalizedReceivedCode}`)
    }
    
    if (normalizedStoredCode !== normalizedReceivedCode) {
      if (env.app.isDevelopment) {
        console.log(`❌ Invalid OTP for ${email}. Attempts: ${stored.attempts}/3`)
        console.log(`❌ Expected: "${normalizedStoredCode}", Received: "${normalizedReceivedCode}"`)
        console.log(`❌ Code length - Expected: ${normalizedStoredCode.length}, Received: ${normalizedReceivedCode.length}`)
      }
      return false
    }

    // Success - clean up
    otpStore.delete(email)
    if (env.app.isDevelopment) {
      console.log(`✅ OTP verified successfully for ${email}`)
    }
    return true
  } catch (error) {
    console.error("❌ Error verifying OTP:", error)
    return false
  }
}

// Enhanced email template using Resend
async function sendOTPEmail(email: string, code: string): Promise<void> {
  try {
    // Debug environment variables
    console.log(`🔧 Environment Debug:`)
    console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`🔧 RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`)
    console.log(`🔧 RESEND_API_KEY length: ${process.env.RESEND_API_KEY?.length || 0}`)
    console.log(`🔧 env.email.resendApiKey exists: ${!!env.email.resendApiKey}`)
    console.log(`🔧 env.email.resendApiKey length: ${env.email.resendApiKey?.length || 0}`)
    console.log(`🔧 env.email.fromEmail: ${env.email.fromEmail}`)

    // Check if Resend API key is configured
    if (!env.email.resendApiKey) {
      console.error(`❌ RESEND_API_KEY is missing or empty`)
      console.error(`❌ process.env.RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'EXISTS' : 'MISSING'}`)
      throw new Error("RESEND_API_KEY is not configured. Please set it in your environment variables.");
    }

    // Get sender email from environment configuration
    const senderEmail = env.email.fromEmail;
    
    console.log(`📧 Attempting to send email to ${email} from ${senderEmail}`)
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.email.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: senderEmail,
        to: email,
        subject: "Your Nexora Banking Security Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 10px;">
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
              <div style="background: #7c3aed; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 24px; font-weight: bold;">🛡️</span>
              </div>
              <h2 style="color: #1f2937; margin-bottom: 10px;">Security Verification</h2>
              <p style="color: #6b7280; margin-bottom: 30px;">Your verification code for Nexora Banking:</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px dashed #7c3aed;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; font-family: monospace;">${code}</span>
              </div>
              <p style="color: #ef4444; font-size: 14px; margin: 20px 0;">This code expires in 5 minutes</p>
              <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin-top: 20px;">
                <p style="color: #92400e; font-size: 12px; margin: 0;">
                  🔒 For your security, never share this code with anyone. Nexora Banking will never ask for this code via phone or email.
                </p>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                If you didn't request this code, please ignore this email or contact our support team.
              </p>
            </div>
          </div>
        `,
      }),
    });

    console.log(`📧 Resend API response status: ${response.status}`)

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Resend API error response: ${errorData}`)
      throw new Error(`Resend API error: ${response.status} - ${errorData}`);
    }
    
    console.log(`📧 OTP email sent successfully to ${email} via Resend`);
    
  } catch (error) {
    console.error("❌ Error sending OTP email:", error)
    throw new Error("Failed to send OTP email")
  }
}

// Debug function to check OTP status (development only)
export function getOTPStatus(email: string): any {
  if (!env.app.isDevelopment) {
    return { error: "Debug function only available in development" }
  }

  const stored = otpStore.get(email)
  if (!stored) {
    return { 
      exists: false, 
      message: "No OTP found for this email",
      availableOTPs: Array.from(otpStore.keys()),
      storeSize: otpStore.size
    }
  }

  const now = Date.now()
  const timeLeft = Math.max(0, stored.expires - now)
  const minutesLeft = Math.floor(timeLeft / 60000)
  const secondsLeft = Math.floor((timeLeft % 60000) / 1000)

  return {
    exists: true,
    code: stored.code,
    attempts: stored.attempts,
    maxAttempts: 3,
    createdAt: new Date(stored.createdAt).toLocaleString(),
    expiresAt: new Date(stored.expires).toLocaleString(),
    timeLeft: `${minutesLeft}m ${secondsLeft}s`,
    isExpired: now > stored.expires,
    attemptsRemaining: Math.max(0, 3 - stored.attempts),
    storeSize: otpStore.size
  }
}

// Test function to manually test OTP system (development only)
export async function testOTPSystem(email: string): Promise<any> {
  if (!env.app.isDevelopment) {
    return { error: "Test function only available in development" }
  }

  try {
    console.log(`🧪 Testing OTP system for ${email}`)
    
    // Clear any existing OTP
    otpStore.delete(email)
    console.log(`🧪 Cleared existing OTP`)
    
    // Send new OTP
    const code = await sendOTP(email)
    console.log(`🧪 Sent OTP: ${code}`)
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Try to verify
    const isValid = await verifyOTP(email, code)
    console.log(`🧪 Verification result: ${isValid}`)
    
    return {
      success: true,
      code,
      verificationResult: isValid,
      finalStatus: getOTPStatus(email)
    }
  } catch (error) {
    console.error(`🧪 Test failed:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Clean up expired OTPs periodically
export function cleanupExpiredOTPs(): void {
  const now = Date.now()
  for (const [email, data] of otpStore) {
    if (data.expires < now) {
      otpStore.delete(email)
    }
  }
}

// Run cleanup every 5 minutes
if (env.app.isProduction) {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
}
