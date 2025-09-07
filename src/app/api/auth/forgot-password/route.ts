import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import { DatabaseService } from '@/lib/database-service'
import { ValidationUtils } from '@/lib/validation-utils'
import ResetTokenManager from '@/lib/reset-token-manager'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || !ValidationUtils.isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Connect to database and check if user exists
    await DatabaseService.connectToDatabase()
    const userResult = await DatabaseService.getUserProfile(email.toLowerCase())
    const user = userResult.success ? userResult.user : null

    // Always return success for security (don't reveal if email exists)
    // But only send email if user actually exists
    if (user) {
      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expires = Date.now() + 15 * 60 * 1000 // 15 minutes

      // Store token using shared token manager
      await ResetTokenManager.storeToken(resetToken, email.toLowerCase())
      console.log(`🔐 Reset token generated: ${resetToken.substring(0, 8)}... for ${email.toLowerCase()}`)

      // Create reset URL with dynamic port detection
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
      const baseUrl = process.env.NEXTAUTH_URL || 
                     process.env.VERCEL_URL || 
                     `${protocol}://localhost:${process.env.PORT || '3001'}`
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
      
      console.log(`🔗 Reset URL generated: ${resetUrl}`)

      // Only send email if SMTP is configured
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          console.log(`📧 Attempting to send email via ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`)
          
          // Configure nodemailer
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
            // Add timeout and retry options
            connectionTimeout: 60000, // 60 seconds
            greetingTimeout: 30000,   // 30 seconds
            socketTimeout: 60000,     // 60 seconds
          })

          // Email template with improved design
          const mailOptions = {
            from: `"AI Career Assistant" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Reset Your Password - AI Career Assistant',
            html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                  <div style="background: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 36px;">🚀</span>
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Password Reset</h1>
                  <p style="color: #E0E7FF; margin: 10px 0 0 0; font-size: 18px;">AI Career Assistant</p>
                </div>
                
                <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                  <h2 style="color: #1F2937; margin-top: 0; font-size: 24px;">Hi there! 👋</h2>
                  
                  <p style="font-size: 16px; color: #4B5563; margin-bottom: 25px;">
                    We received a request to reset your password for your AI Career Assistant account. 
                    Click the button below to create a new password:
                  </p>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${resetUrl}" style="background: #3B82F6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                      🔒 Reset My Password
                    </a>
                  </div>
                  
                  <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3B82F6;">
                    <p style="margin: 0; font-size: 14px; color: #6B7280;">
                      <strong>Or copy and paste this link:</strong><br>
                      <span style="word-break: break-all; font-family: monospace; background: white; padding: 8px; display: inline-block; margin-top: 8px; border-radius: 4px; border: 1px solid #E5E7EB;">${resetUrl}</span>
                    </p>
                  </div>
                  
                  <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #F59E0B;">
                    <p style="margin: 0; font-size: 14px; color: #92400E;">
                      <strong>⏰ This link expires in 15 minutes</strong> for your security.
                    </p>
                  </div>
                  
                  <p style="font-size: 14px; color: #6B7280; margin-bottom: 30px;">
                    If you didn't request this password reset, you can safely ignore this email. 
                    Your password won't be changed until you click the link above.
                  </p>
                  
                  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
                  
                  <div style="text-align: center;">
                    <p style="color: #9CA3AF; font-size: 13px; margin: 0;">
                      <strong>AI Career Assistant</strong><br>
                      Need help? Contact us at support@aicareerassistant.com<br>
                      This is an automated email, please don't reply to this address.
                    </p>
                  </div>
                </div>
              </div>
            `,
            text: `
              🚀 AI Career Assistant - Password Reset
              
              Hi there!
              
              We received a request to reset your password for your AI Career Assistant account.
              
              Click this link to create a new password:
              ${resetUrl}
              
              ⏰ This link will expire in 15 minutes for your security.
              
              If you didn't request this password reset, you can safely ignore this email.
              Your password won't be changed until you use the link above.
              
              ---
              AI Career Assistant
              Need help? Contact us at support@aicareerassistant.com
            `
          }

          // Send email with enhanced error handling
          await transporter.sendMail(mailOptions)
          console.log('✅ Password reset email sent successfully to:', email)
        } catch (emailError) {
          console.error('❌ Failed to send password reset email:', emailError)
          console.error('📧 SMTP Configuration:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            user: process.env.SMTP_USER,
            secure: process.env.SMTP_SECURE
          })
          // Don't throw error - still return success for security
        }
      } else {
        console.log('⚠️ SMTP not configured - password reset token generated but email not sent')
        console.log('📧 To enable email sending, configure these environment variables:')
        console.log('   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS')
        console.log(`🔗 Reset URL: ${resetUrl}`)
      }
    }

    // Always return success (security best practice)
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent you a password reset link.'
    })

  } catch (error) {
    console.error('❌ Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
