import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { ValidationUtils } from '@/lib/validation-utils'
import { AuditLogger } from '@/lib/audit-logger'

// Create rate limiter (5 requests per minute per IP)
const createUserLimiter = ValidationUtils.createRateLimiter(5, 60000)
const updateUserLimiter = ValidationUtils.createRateLimiter(10, 60000)

// GET /api/users - Get all users or specific user by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      // Get specific user by email
      const result = await DatabaseService.getUserProfile(email)
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          user: result.user 
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: result.error 
        }, { status: 404 })
      }
    } else {
      // Get all users
      const result = await DatabaseService.getAllUsers()
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          users: result.users 
        })
      } else {
        return NextResponse.json({ 
          success: false, 
          error: result.error 
        }, { status: 500 })
      }
    }
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST /api/users - Create new user (registration only)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    if (!createUserLimiter(clientIP)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Too many registration attempts. Please try again later.' 
      }, { 
        status: 429,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    const profileData = await request.json()

    // Validate and sanitize required fields
    if (!profileData.email || !profileData.name || !profileData.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email, name, and password are required' 
      }, { 
        status: 400,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    // Validate email format
    if (!ValidationUtils.isValidEmail(profileData.email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      }, { 
        status: 400,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    // Validate name
    const nameValidation = ValidationUtils.isValidName(profileData.name)
    if (!nameValidation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: nameValidation.message 
      }, { 
        status: 400,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    // Validate password
    const passwordValidation = ValidationUtils.isValidPassword(profileData.password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: passwordValidation.message 
      }, { 
        status: 400,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    // Sanitize inputs
    const sanitizedData = {
      ...profileData,
      email: ValidationUtils.sanitizeString(profileData.email).toLowerCase(),
      name: ValidationUtils.sanitizeString(profileData.name),
      phone: ValidationUtils.sanitizeString(profileData.phone || ''),
      location: ValidationUtils.sanitizeString(profileData.location || ''),
      summary: ValidationUtils.sanitizeString(profileData.summary || '')
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserProfile(sanitizedData.email)
    if (existingUser.success) {
      return NextResponse.json({ 
        success: false, 
        error: 'An account with this email already exists. Please sign in instead.' 
      }, { 
        status: 409,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }

    // Create new user
    const result = await DatabaseService.createNewUser(sanitizedData)
    
    if (result.success) {
      AuditLogger.log('USER_REGISTRATION', {
        email: sanitizedData.email,
        ip: clientIP,
        success: true
      })
      
      return NextResponse.json({ 
        success: true, 
        user: result.user,
        message: 'Account created successfully!' 
      }, {
        headers: ValidationUtils.getSecurityHeaders()
      })
    } else {
      AuditLogger.log('USER_REGISTRATION', {
        email: sanitizedData.email,
        ip: clientIP,
        success: false,
        error: result.error
      })
      
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { 
        status: 500,
        headers: ValidationUtils.getSecurityHeaders()
      })
    }
  } catch (error) {
    console.error('User registration error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create account. Please try again.' 
    }, { 
      status: 500,
      headers: ValidationUtils.getSecurityHeaders()
    })
  }
}

// PUT /api/users - Update existing user profile
export async function PUT(request: NextRequest) {
  try {
    const profileData = await request.json()

    if (!profileData.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required for updates' 
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(profileData.email)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter a valid email address' 
      }, { status: 400 })
    }

    const result = await DatabaseService.saveUserProfile(profileData)
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        user: result.user,
        message: 'Profile updated successfully' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 404 })
    }
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update user profile' 
    }, { status: 500 })
  }
}
