import { NextRequest, NextResponse } from 'next/server'

// GitHub OAuth callback handler
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('GitHub OAuth error:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=github_auth_failed`)
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=missing_code`)
    }

    // In a real implementation, Descope handles the token exchange
    // This is just a placeholder for the callback handling
    console.log('GitHub OAuth callback received:', { code, state })

    // Redirect back to the app with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?connected=github`)
  } catch (error) {
    console.error('GitHub callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}?error=callback_failed`)
  }
}
