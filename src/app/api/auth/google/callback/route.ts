import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic'

// Google Calendar OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Google OAuth error:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=google_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=missing_code`)
    }

    // In a real implementation, Descope handles the token exchange
    console.log('Google Calendar OAuth callback received:', { code, state })

    // Redirect back to the app with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=google-calendar`)
  } catch (error) {
    console.error('Google callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=callback_failed`)
  }
}
