// Test script for forgot password functionality with email sending
const https = require('https');
const querystring = require('querystring');

async function testForgotPasswordWithEmail() {
  console.log('🧪 Testing Forgot Password with Email Sending...\n');
  
  try {
    // Test 1: Valid email request
    console.log('1️⃣ Testing forgot password with valid email...');
    const testEmail = 'testuser@example.com';
    
    const postData = JSON.stringify({ email: testEmail });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const response = await new Promise((resolve, reject) => {
      const req = require('http').request(options, (res) => {
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
      console.log('✅ Forgot password request successful!');
      
      // Test 2: Check debug tokens
      console.log('\n2️⃣ Checking debug tokens...');
      const debugResponse = await new Promise((resolve, reject) => {
        const debugOptions = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/debug/tokens',
          method: 'GET'
        };
        
        const req = require('http').request(debugOptions, (res) => {
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
        req.end();
      });
      
      console.log('🔍 Debug Tokens:', JSON.stringify(debugResponse.data, null, 2));
      
      // Test 3: Invalid email format
      console.log('\n3️⃣ Testing with invalid email format...');
      const invalidPostData = JSON.stringify({ email: 'invalid-email' });
      
      const invalidResponse = await new Promise((resolve, reject) => {
        const req = require('http').request(options, (res) => {
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
        req.write(invalidPostData);
        req.end();
      });
      
      console.log('❌ Invalid Email Status:', invalidResponse.statusCode);
      console.log('❌ Invalid Email Response:', JSON.stringify(invalidResponse.data, null, 2));
      
    } else {
      console.log('❌ Forgot password request failed');
    }
    
    console.log('\n✅ All tests completed!');
    console.log('\n📧 Check the configured email (lostfoundapp700@gmail.com) for password reset emails.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testForgotPasswordWithEmail();
