import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { ValidationUtils } from '@/lib/validation-utils'
import ResetTokenManager from '@/lib/reset-token-manager'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    // Validate inputs
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = ValidationUtils.isValidPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      )
    }

    // Verify reset token
    const tokenVerification = await ResetTokenManager.verifyToken(token)
    if (!tokenVerification.valid || !tokenVerification.email) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    // Connect to database
    await DatabaseService.connectToDatabase()

    // Get user profile
    const userResult = await DatabaseService.getUserProfile(tokenVerification.email)
    if (!userResult.success || !userResult.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Hash new password
    const hashedPassword = await ValidationUtils.hashPassword(password)

    // Update user password only
    const updateResult = await DatabaseService.updateUserPassword(tokenVerification.email, hashedPassword)
    if (!updateResult.success) {
      throw new Error(`Failed to update password: ${updateResult.error}`)
    }

    // Invalidate the reset token
    await ResetTokenManager.invalidateToken(token)

    console.log('✅ Password reset successful for user:', tokenVerification.email)

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully reset'
    })

  } catch (error) {
    console.error('❌ Password reset error:', error)
    return NextResponse.json(
      { error: 'An error occurred while resetting password. Please try again.' },
      { status: 500 }
    )
  }
}
