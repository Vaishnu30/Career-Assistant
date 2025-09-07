import { NextRequest, NextResponse } from 'next/server'
import ResetTokenManager from '@/lib/reset-token-manager'

export async function GET(request: NextRequest) {
  try {
    const tokens = await ResetTokenManager.getAllTokens()
    const count = ResetTokenManager.getTokenCount()
    
    // Clean up expired tokens
    const cleaned = await ResetTokenManager.cleanupExpiredTokens()
    
    return NextResponse.json({
      success: true,
      tokenCount: count,
      tokensCleanedUp: cleaned,
      tokens: tokens
    })
  } catch (error) {
    console.error('❌ Debug tokens error:', error)
    return NextResponse.json(
      { error: 'Failed to get token information' },
      { status: 500 }
    )
  }
}
