import { NextRequest, NextResponse } from 'next/server'

// GET /api/debug-auth-state - Debug current authentication state
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      debug: {
        timestamp: new Date().toISOString(),
        message: 'This endpoint helps debug authentication flow',
        instructions: [
          '1. Open browser console',
          '2. Try to sign in',
          '3. Check console logs for authentication flow',
          '4. Check localStorage for saved data',
          '5. Compare Descope auth state vs custom auth state'
        ],
        checkpoints: {
          localStorage: {
            userProfile: 'localStorage.getItem("userProfile")',
            isRegistered: 'localStorage.getItem("isRegistered")',
            mockUser: 'localStorage.getItem("mockUser")'
          },
          consoleCommands: {
            clearAuth: 'localStorage.clear(); window.location.reload()',
            checkAuth: 'console.log({userProfile: localStorage.getItem("userProfile"), isRegistered: localStorage.getItem("isRegistered"), mockUser: localStorage.getItem("mockUser")})'
          }
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
