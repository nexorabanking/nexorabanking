import { env } from "./env"
import crypto from "crypto"
import nodemailer from "nodemailer"

// Enhanced OTP management with environment variables
interface OTPData {
  code: string
  expires: number
  attempts: number
  createdAt: number
}

const otpStore: { [email: string]: OTPData } = {}

export function generateOTP(): string {
  // Use crypto for secure random number generation
  const buffer = crypto.randomBytes(3)
  const code = ((Number.parseInt(buffer.toString("hex"), 16) % 900000) + 100000).toString()
  return code
}

export async function sendOTP(email: string): Promise<string> {
  try {
    const code = generateOTP()
    const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
    const createdAt = Date.now()

    // Check if there's an existing OTP that was sent recently (prevent spam)
    const existing = otpStore[email]
    if (existing && createdAt - existing.createdAt < 60 * 1000) {
      // 1 minute cooldown
      if (env.app.isDevelopment) {
        console.log(`⏰ OTP cooldown active for ${email}. Please wait before requesting a new code.`)
      }
      throw new Error("Please wait before requesting a new verification code")
    }

    otpStore[email] = {
      code,
      expires,
      attempts: 0,
      createdAt,
    }

    // In production, send email using SMTP configuration
    if (env.app.isDevelopment) {
      console.log(`📧 OTP for ${email}: ${code}`)
      console.log(`📧 SMTP Config: ${env.email.host}:${env.email.port}`)
      console.log(`🔐 This code is required for both sign-in and account creation`)
    } else {
      // Send actual email using configured SMTP settings
      await sendOTPEmail(email, code)
    }

    return code
  } catch (error) {
    console.error("❌ Error sending OTP:", error)
    throw new Error("Failed to send OTP")
  }
}

export async function verifyOTP(email: string, code: string): Promise<boolean> {
  try {
    const stored = otpStore[email]

    if (!stored) {
      if (env.app.isDevelopment) {
        console.log(`❌ No OTP found for ${email}`)
        console.log(`📊 Current OTP store:`, Object.keys(otpStore))
      }
      return false
    }

    // Check if OTP has expired
    if (Date.now() > stored.expires) {
      delete otpStore[email]
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
      delete otpStore[email]
      if (env.app.isDevelopment) {
        console.log(`🚫 Too many OTP attempts for ${email}. Attempts: ${stored.attempts}/3`)
      }
      return false
    }

    // Verify code
    if (stored.code !== code) {
      if (env.app.isDevelopment) {
        console.log(`❌ Invalid OTP for ${email}. Attempts: ${stored.attempts}/3`)
        console.log(`❌ Expected: ${stored.code}, Received: ${code}`)
        console.log(`❌ Code length - Expected: ${stored.code.length}, Received: ${code.length}`)
      }
      return false
    }

    // Success - clean up
    delete otpStore[email]
    if (env.app.isDevelopment) {
      console.log(`✅ OTP verified successfully for ${email}`)
    }
    return true
  } catch (error) {
    console.error("❌ Error verifying OTP:", error)
    return false
  }
}

// Enhanced email template for both login and signup
async function sendOTPEmail(email: string, code: string): Promise<void> {
  try {
    // For production, you have several options:
    
    // Option 1: Use a service like Resend (recommended)
    // You'll need to set up RESEND_API_KEY in your environment variables
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.email.from,
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

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`);
      }
      
      console.log(`📧 OTP email sent successfully to ${email}`);
      return;
    }

    // Option 2: Use SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: env.email.from },
          subject: "Your Nexora Banking Security Code",
          content: [{
            type: 'text/html',
            value: `
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
          }],
        }),
      });

      if (!response.ok) {
        throw new Error(`SendGrid error: ${response.statusText}`);
      }
      
      console.log(`📧 OTP email sent successfully to ${email}`);
      return;
    }

    // Option 3: Use Nodemailer with SMTP (if SMTP credentials are configured)
    if (env.email.host && env.email.user && env.email.password) {
      const transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
        secure: env.email.port === 465, // true for 465, false for other ports
      auth: {
        user: env.email.user,
        pass: env.email.password,
      },
      });

    const mailOptions = {
      from: env.email.from,
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
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 OTP email sent successfully to ${email} via SMTP`);
      return;
    }

    // Fallback: Log the code (for development/testing)
    console.log(`📧 OTP for ${email}: ${code}`)
    console.log(`📧 Email service not configured. Please set up RESEND_API_KEY, SENDGRID_API_KEY, or SMTP credentials`)
    console.log(`🔐 This code is required for both sign-in and account creation`)
    
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

  const stored = otpStore[email]
  if (!stored) {
    return { 
      exists: false, 
      message: "No OTP found for this email",
      availableOTPs: Object.keys(otpStore)
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
    attemptsRemaining: Math.max(0, 3 - stored.attempts)
  }
}

// Clean up expired OTPs periodically
export function cleanupExpiredOTPs(): void {
  const now = Date.now()
  for (const [email, data] of Object.entries(otpStore)) {
    if (data.expires < now) {
      delete otpStore[email]
    }
  }
}

// Run cleanup every 5 minutes
if (env.app.isProduction) {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
}
