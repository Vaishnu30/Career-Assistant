// Complete Password Reset Test Flow
// This script tests the entire forgot password → email → reset password flow

console.log('🔧 Testing Complete Password Reset Flow...\n')

const testEmail = 'yvs303@gmail.com'
const newPassword = 'TestPassword123!'

// Step 1: Generate forgot password token
async function testForgotPassword() {
  console.log('📧 Step 1: Requesting password reset...')
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail
      })
    })
    
    const result = await response.json()
    console.log('✅ Forgot password response:', response.status, result)
    
    if (response.ok) {
      console.log('✅ Reset email should be sent to:', testEmail)
      return true
    } else {
      console.log('❌ Failed to send reset email')
      return false
    }
  } catch (error) {
    console.error('❌ Error in forgot password:', error)
    return false
  }
}

// Step 2: Check token storage
async function checkTokenStorage() {
  console.log('\n🔍 Step 2: Checking token storage...')
  
  try {
    const response = await fetch('http://localhost:3000/api/debug/tokens')
    const result = await response.json()
    
    console.log('📊 Token storage status:', result)
    
    if (result.tokens && result.tokens.length > 0) {
      console.log('✅ Token found in storage')
      return result.tokens[0].token.replace('...', '') // Get token prefix
    } else {
      console.log('❌ No tokens found in storage')
      return null
    }
  } catch (error) {
    console.error('❌ Error checking tokens:', error)
    return null
  }
}

// Step 3: Test password reset (you'll need the actual token from email)
async function testPasswordReset(tokenFromEmail) {
  console.log('\n🔑 Step 3: Testing password reset...')
  console.log('🔗 Use the token from the email you received')
  
  if (!tokenFromEmail) {
    console.log('⚠️  No token provided - check your email for the reset link')
    console.log('📧 The token will be in a URL like: http://localhost:3000/reset-password?token=XXXXX')
    return false
  }
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: tokenFromEmail,
        password: newPassword
      })
    })
    
    const result = await response.json()
    console.log('🔄 Password reset response:', response.status, result)
    
    if (response.ok) {
      console.log('✅ Password reset successful!')
      return true
    } else {
      console.log('❌ Password reset failed:', result.error)
      return false
    }
  } catch (error) {
    console.error('❌ Error in password reset:', error)
    return false
  }
}

// Run the test flow
async function runCompleteTest() {
  console.log('🚀 Starting Complete Password Reset Test Flow\n')
  
  // Step 1: Request password reset
  const forgotSuccess = await testForgotPassword()
  
  // Step 2: Check token storage
  const tokenPrefix = await checkTokenStorage()
  
  // Step 3: Instructions for manual test
  console.log('\n📧 MANUAL STEP REQUIRED:')
  console.log('1. Check your email for the reset link')
  console.log('2. Copy the token from the URL')
  console.log('3. Use it to test the password reset')
  
  console.log('\n🔧 To test password reset with your token:')
  console.log(`curl -X POST http://localhost:3000/api/auth/reset-password \\`)
  console.log(`  -H "Content-Type: application/json" \\`)
  console.log(`  -d '{"token":"YOUR_TOKEN_FROM_EMAIL","password":"${newPassword}"}'`)
  
  console.log('\n✅ Test setup complete!')
  console.log('📊 Summary:')
  console.log(`   • Email request: ${forgotSuccess ? '✅ Success' : '❌ Failed'}`)
  console.log(`   • Token storage: ${tokenPrefix ? '✅ Found' : '❌ Empty'}`)
  console.log('   • Password reset: ⏳ Manual test required')
}

// Run the test
runCompleteTest().catch(console.error)
