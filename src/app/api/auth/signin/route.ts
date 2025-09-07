import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { ValidationUtils } from '@/lib/validation-utils'
import { AuditLogger } from '@/lib/audit-logger'

// Create rate limiter (10 sign-in attempts per minute per IP)
const signInLimiter = ValidationUtils.createRateLimiter(10, 60000)

// POST /api/auth/signin - Validate user sign-in
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!signInLimiter(clientIP)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Too many sign-in attempts. Please try again later.' 
      }, { 
        status: 429,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    const { email, password } = await request.json()

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email and password are required' 
      }, { 
        status: 400,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    // Validate email format
    if (!ValidationUtils.isValidEmail(email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      }, { 
        status: 400,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    // Sanitize inputs
    const sanitizedEmail = ValidationUtils.sanitizeString(email).toLowerCase()
    const sanitizedPassword = ValidationUtils.sanitizeString(password)

    // Authenticate user with email and password
    const result = await DatabaseService.authenticateUser(sanitizedEmail, sanitizedPassword)
    
    if (result.success) {
      AuditLogger.log('USER_SIGNIN', {
        email: sanitizedEmail,
        ip: clientIP,
        success: true
      })
      
      return NextResponse.json({ 
        success: true, 
        user: result.user,
        message: 'Sign-in successful!' 
      }, {
        headers: ValidationUtils.getSecurityHeaders()
      })
    } else {
      AuditLogger.log('USER_SIGNIN', {
        email: sanitizedEmail,
        ip: clientIP,
        success: false,
        error: 'Authentication failed'
      })
      
      return NextResponse.json({ 
        success: false, 
        error: result.error || 'Invalid email or password',
        code: 'AUTHENTICATION_FAILED'
      }, { 
        status: 401, // Changed from 404 to 401 for authentication failure
        headers: ValidationUtils.getSecurityHeaders()
      })
    }
  } catch (error) {
    console.error('Sign-in error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Sign-in failed. Please try again.' 
    }, { 
      status: 500,
      headers: ValidationUtils.getSecurityHeaders()
    })
  }
}
