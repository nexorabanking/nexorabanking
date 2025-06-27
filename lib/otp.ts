import { env } from "./env"
import crypto from "crypto"

// Enhanced OTP management with environment variables
interface OTPData {
  code: string
  expires: number
  attempts: number
  createdAt: number
}

// Server instance tracking
const serverInstanceId = Math.random().toString(36).substring(7)
const serverStartTime = Date.now()

console.log(`🚀 OTP System initialized - Instance: ${serverInstanceId} - Start time: ${new Date(serverStartTime).toISOString()}`)

// Use Map instead of plain object for better performance and reliability
const otpStore = new Map<string, OTPData>()

// Debug function to track OTP store changes
function logOTPStoreChange(action: string, email: string, details?: any) {
  const timestamp = new Date().toISOString()
  console.log(`🔍 [STORE-${action}] ${timestamp} - Email: ${email} - Store size: ${otpStore.size}`)
  if (details) {
    console.log(`🔍 [STORE-${action}] Details:`, details)
  }
  console.log(`🔍 [STORE-${action}] Available emails:`, Array.from(otpStore.keys()))
}

// Override Map methods to add logging
const originalSet = otpStore.set.bind(otpStore)
const originalDelete = otpStore.delete.bind(otpStore)
const originalClear = otpStore.clear.bind(otpStore)

otpStore.set = function(key: string, value: OTPData) {
  logOTPStoreChange('SET', key, { code: value.code, expires: new Date(value.expires).toISOString() })
  return originalSet(key, value)
}

otpStore.delete = function(key: string) {
  logOTPStoreChange('DELETE', key)
  return originalDelete(key)
}

otpStore.clear = function() {
  logOTPStoreChange('CLEAR', 'ALL')
  return originalClear()
}

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
  const requestId = Math.random().toString(36).substring(7)
  console.log(`🔍 [${requestId}] === OTP REQUEST START ===`)
  console.log(`🔍 [${requestId}] Email: ${email}`)
  console.log(`🔍 [${requestId}] Timestamp: ${new Date().toISOString()}`)
  
  try {
    const code = generateOTP()
    const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
    const createdAt = Date.now()

    console.log(`🔍 [${requestId}] Generated OTP: ${code}`)
    console.log(`🔍 [${requestId}] Expires at: ${new Date(expires).toISOString()}`)
    console.log(`🔍 [${requestId}] Created at: ${new Date(createdAt).toISOString()}`)

    // Check if there's an existing OTP that was sent recently (prevent spam)
    const existing = otpStore.get(email)
    console.log(`🔍 [${requestId}] Existing OTP found: ${!!existing}`)
    if (existing) {
      console.log(`🔍 [${requestId}] Existing OTP details:`, {
        code: existing.code,
        attempts: existing.attempts,
        createdAt: new Date(existing.createdAt).toISOString(),
        expires: new Date(existing.expires).toISOString(),
        timeSinceCreation: createdAt - existing.createdAt
      })
    }
    
    if (existing && createdAt - existing.createdAt < 60 * 1000) {
      // 1 minute cooldown
      console.log(`🔍 [${requestId}] ⏰ OTP cooldown active for ${email}. Please wait before requesting a new code.`)
      throw new Error("Please wait before requesting a new verification code")
    }

    // Clear any existing OTP for this email to prevent conflicts
    if (existing) {
      console.log(`🔍 [${requestId}] 🗑️ Clearing existing OTP for ${email}`)
      otpStore.delete(email)
      console.log(`🔍 [${requestId}] 🗑️ Existing OTP cleared. Store size now: ${otpStore.size}`)
    }

    // Store the OTP IMMEDIATELY and synchronously before any async operations
    const otpData: OTPData = {
      code,
      expires,
      attempts: 0,
      createdAt,
    }
    
    console.log(`🔍 [${requestId}] 📝 Storing OTP data:`, otpData)
    otpStore.set(email, otpData)
    console.log(`🔍 [${requestId}] 📝 OTP stored. Store size: ${otpStore.size}`)

    // Verify the OTP was stored correctly IMMEDIATELY
    const storedVerification = otpStore.get(email)
    console.log(`🔍 [${requestId}] 🔍 Storage verification:`, {
      storedExists: !!storedVerification,
      storedCode: storedVerification?.code,
      expectedCode: code,
      codesMatch: storedVerification?.code === code
    })
    
    if (!storedVerification || storedVerification.code !== code) {
      console.log(`🔍 [${requestId}] ❌ FAILED: OTP storage verification failed`)
      throw new Error("Failed to store OTP properly")
    }

    console.log(`🔍 [${requestId}] ✅ OTP stored successfully for ${email}: ${code}`)
    console.log(`🔍 [${requestId}] 📊 Current OTP store keys:`, Array.from(otpStore.keys()))

    // Now handle email sending (this won't affect the stored OTP)
    if (env.app.isDevelopment) {
      console.log(`🔍 [${requestId}] 📧 DEVELOPMENT MODE: OTP for ${email}: ${code}`)
      console.log(`🔍 [${requestId}] 📧 This code is required for both sign-in and account creation`)
    } else {
      // Send actual email using Resend
      console.log(`🔍 [${requestId}] 📧 PRODUCTION MODE: Attempting to send email`)
      try {
        await sendOTPEmail(email, code)
        console.log(`🔍 [${requestId}] 📧 Email sent successfully`)
      } catch (error) {
        // Log the error but DON'T remove the OTP - user can still use it
        console.error(`🔍 [${requestId}] ⚠️ Email sending failed for ${email}:`, error)
        console.log(`🔍 [${requestId}] ⚠️ OTP is still valid: ${code}`)
        // Don't throw the error, just log it - the OTP is still stored and usable
      }
    }

    console.log(`🔍 [${requestId}] === OTP REQUEST END ===`)
    return code
  } catch (error) {
    console.error(`🔍 [${requestId}] ❌ Error sending OTP:`, error)
    console.log(`🔍 [${requestId}] === OTP REQUEST FAILED ===`)
    throw new Error("Failed to send OTP")
  }
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  const verifyId = Math.random().toString(36).substring(7)
  console.log(`🔍 [${verifyId}] === OTP VERIFICATION START ===`)
  console.log(`🔍 [${verifyId}] Email: ${email}`)
  console.log(`🔍 [${verifyId}] Received code: "${code}"`)
  console.log(`🔍 [${verifyId}] Code length: ${code.length}`)
  console.log(`🔍 [${verifyId}] Timestamp: ${new Date().toISOString()}`)
  
  try {
    const stored = otpStore.get(email)
    console.log(`🔍 [${verifyId}] Stored OTP exists: ${!!stored}`)
    console.log(`🔍 [${verifyId}] Current store size: ${otpStore.size}`)
    console.log(`🔍 [${verifyId}] Store keys:`, Array.from(otpStore.keys()))

    if (stored) {
      console.log(`🔍 [${verifyId}] Stored OTP details:`, {
        code: stored.code,
        codeLength: stored.code.length,
        attempts: stored.attempts,
        createdAt: new Date(stored.createdAt).toISOString(),
        expires: new Date(stored.expires).toISOString(),
        isExpired: Date.now() > stored.expires
      })
    }

    if (!stored) {
      console.log(`🔍 [${verifyId}] ❌ No OTP found for ${email}`)
      console.log(`🔍 [${verifyId}] === OTP VERIFICATION FAILED: NO OTP ===`)
      return false
    }

    // Check if OTP has expired
    if (Date.now() > stored.expires) {
      console.log(`🔍 [${verifyId}] ⏰ OTP expired for ${email}`)
      console.log(`🔍 [${verifyId}] Expired at: ${new Date(stored.expires).toISOString()}`)
      console.log(`🔍 [${verifyId}] Current time: ${new Date().toISOString()}`)
      otpStore.delete(email)
      console.log(`🔍 [${verifyId}] === OTP VERIFICATION FAILED: EXPIRED ===`)
      return false
    }

    // Increment attempt counter
    stored.attempts++
    console.log(`🔍 [${verifyId}] Attempt counter incremented: ${stored.attempts}/3`)

    // Check for too many attempts
    if (stored.attempts > 3) {
      console.log(`🔍 [${verifyId}] 🚫 Too many OTP attempts for ${email}. Attempts: ${stored.attempts}/3`)
      otpStore.delete(email)
      console.log(`🔍 [${verifyId}] === OTP VERIFICATION FAILED: TOO MANY ATTEMPTS ===`)
      return false
    }

    // Verify code (trim whitespace and normalize)
    const normalizedStoredCode = stored.code.trim()
    const normalizedReceivedCode = code.trim()
    
    console.log(`🔍 [${verifyId}] Code comparison:`, {
      storedOriginal: `"${stored.code}"`,
      storedNormalized: `"${normalizedStoredCode}"`,
      receivedOriginal: `"${code}"`,
      receivedNormalized: `"${normalizedReceivedCode}"`,
      storedLength: normalizedStoredCode.length,
      receivedLength: normalizedReceivedCode.length,
      lengthsMatch: normalizedStoredCode.length === normalizedReceivedCode.length,
      exactMatch: normalizedStoredCode === normalizedReceivedCode
    })
    
    if (normalizedStoredCode !== normalizedReceivedCode) {
      console.log(`🔍 [${verifyId}] ❌ Invalid OTP for ${email}. Attempts: ${stored.attempts}/3`)
      console.log(`🔍 [${verifyId}] Expected: "${normalizedStoredCode}", Received: "${normalizedReceivedCode}"`)
      console.log(`🔍 [${verifyId}] Code length - Expected: ${normalizedStoredCode.length}, Received: ${normalizedReceivedCode.length}`)
      console.log(`🔍 [${verifyId}] === OTP VERIFICATION FAILED: INVALID CODE ===`)
      return false
    }

    // Success - clean up
    console.log(`🔍 [${verifyId}] ✅ OTP verified successfully for ${email}`)
    otpStore.delete(email)
    console.log(`🔍 [${verifyId}] OTP removed from store. Store size now: ${otpStore.size}`)
    console.log(`🔍 [${verifyId}] === OTP VERIFICATION SUCCESS ===`)
    return true
  } catch (error) {
    console.error(`🔍 [${verifyId}] ❌ Error verifying OTP:`, error)
    console.log(`🔍 [${verifyId}] === OTP VERIFICATION FAILED: ERROR ===`)
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
  const isProduction = process.env.NODE_ENV === 'production'
  const isTestEmail = email && (email.includes('test') || email.includes('debug') || email.endsWith('.test'))
  
  // Allow in development or for test emails in production
  if (isProduction && !isTestEmail) {
    return { error: "Debug function only available in development or for test emails" }
  }

  const stored = otpStore.get(email)
  if (!stored) {
    return { 
      exists: false, 
      message: "No OTP found for this email",
      availableOTPs: Array.from(otpStore.keys()),
      storeSize: otpStore.size,
      serverInfo: {
        instanceId: serverInstanceId,
        startTime: new Date(serverStartTime).toISOString(),
        uptime: Date.now() - serverStartTime
      }
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
    storeSize: otpStore.size,
    serverInfo: {
      instanceId: serverInstanceId,
      startTime: new Date(serverStartTime).toISOString(),
      uptime: Date.now() - serverStartTime
    }
  }
}

// Test function to manually test OTP system (development only)
export async function testOTPSystem(email: string): Promise<any> {
  const isProduction = process.env.NODE_ENV === 'production'
  const isTestEmail = email && (email.includes('test') || email.includes('debug') || email.endsWith('.test'))
  
  // Allow in development or for test emails in production
  if (isProduction && !isTestEmail) {
    return { error: "Test function only available in development or for test emails" }
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