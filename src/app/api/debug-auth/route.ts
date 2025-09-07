import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { ValidationUtils } from '@/lib/validation-utils'

// POST /api/debug-auth - Debug authentication with a specific user
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password required for debugging'
      }, { status: 400 })
    }
    
    console.log('🔍 Debug Authentication Test:')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    
    // Test password validation
    const passwordValidation = ValidationUtils.isValidPassword(password)
    console.log('✔️ Password validation:', passwordValidation)
    
    // Test authentication
    const authResult = await DatabaseService.authenticateUser(email, password)
    console.log('🔐 Authentication result:', {
      success: authResult.success,
      hasUser: !!authResult.user,
      userEmail: authResult.user?.email,
      userName: authResult.user?.name,
      error: authResult.error
    })
    
    // Test password hashing/verification separately
    if (password) {
      const hashedPassword = await ValidationUtils.hashPassword(password)
      const verifyResult = await ValidationUtils.verifyPassword(password, hashedPassword)
      console.log('🧪 Hash/Verify test:', {
        originalPassword: password,
        hashedPassword: hashedPassword.substring(0, 20) + '...',
        verificationPassed: verifyResult
      })
    }
    
    return NextResponse.json({
      success: true,
      debug: {
        email,
        passwordValidation,
        authenticationResult: {
          success: authResult.success,
          hasUser: !!authResult.user,
          userFields: authResult.user ? Object.keys(authResult.user) : [],
          error: authResult.error
        }
      }
    })
  } catch (error) {
    console.error('❌ Debug auth error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
