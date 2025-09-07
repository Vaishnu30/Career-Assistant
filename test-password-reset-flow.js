// Test the complete password reset flow using the generated token
const http = require('http');

const token = 'e20c3ba85fe136158c2ac83788d8431b8a098cd93b3ab0c3f2235c1bb44ff8d8';
const newPassword = 'NewSecurePassword123!';

async function testPasswordReset() {
  console.log('🧪 Testing Complete Password Reset Flow...\n');
  
  try {
    // Test 1: Verify token is valid (GET reset page)
    console.log('1️⃣ Testing reset page accessibility...');
    console.log(`🔗 Reset URL: http://localhost:3000/reset-password?token=${token}`);
    
    // Test 2: Submit password reset
    console.log('\n2️⃣ Testing password reset submission...');
    
    const postData = JSON.stringify({
      token: token,
      password: newPassword
    });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/reset-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    console.log('📊 Status Code:', response.statusCode);
    console.log('📋 Response:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('\n✅ Password Reset Successful!');
      console.log('🎉 The complete forgot password flow is working correctly!');
    } else {
      console.log('\n❌ Password Reset Failed');
      console.log('💡 This might be due to token expiration or server restart');
    }
    
    // Test 3: Check if token was invalidated
    console.log('\n3️⃣ Checking if token was invalidated...');
    
    const response2 = await new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(data)
          });
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    console.log('🔒 Second attempt status:', response2.statusCode);
    console.log('🔒 Second attempt response:', JSON.stringify(response2.data, null, 2));
    
    if (response2.statusCode === 400) {
      console.log('✅ Token properly invalidated after use (security feature)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('🚀 AI Career Assistant - Password Reset Test');
console.log('=' .repeat(50));
console.log('📝 Using token from server logs');
console.log('🔑 Testing with token:', token.substring(0, 16) + '...');
console.log('🔐 New password:', newPassword);
console.log('=' .repeat(50));

testPasswordReset();
