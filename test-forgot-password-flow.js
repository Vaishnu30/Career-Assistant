const fetch = require('node-fetch');

async function testForgotPasswordFlow() {
  try {
    console.log('🧪 Testing Forgot Password Flow...\n');
    
    // Test 1: Valid email request
    console.log('1️⃣ Testing valid email request...');
    const response1 = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com' })
    });
    
    const result1 = await response1.json();
    console.log('✅ Response:', result1);
    console.log('📊 Status:', response1.status);
    
    // Test 2: Check debug tokens endpoint
    console.log('\n2️⃣ Checking debug tokens...');
    const response2 = await fetch('http://localhost:3000/api/debug/tokens');
    const result2 = await response2.json();
    console.log('🔍 Debug Tokens:', JSON.stringify(result2, null, 2));
    
    // Test 3: Invalid email
    console.log('\n3️⃣ Testing invalid email...');
    const response3 = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' })
    });
    
    const result3 = await response3.json();
    console.log('❌ Invalid Email Response:', result3);
    console.log('📊 Status:', response3.status);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testForgotPasswordFlow();
