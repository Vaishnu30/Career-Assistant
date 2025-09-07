// Test forgot password with updated Gmail App Password
const http = require('http');

async function testEmailSending() {
  console.log('🚀 Testing Forgot Password with Updated Gmail App Password');
  console.log('=' .repeat(60));
  console.log('📧 SMTP User: lostfoundapp700@gmail.com');
  console.log('🔑 App Password: mymjaaahsunwuvtg (Updated)');
  console.log('🌐 Host: smtp.gmail.com:587');
  console.log('=' .repeat(60));
  
  try {
    console.log('\n1️⃣ Testing forgot password request...');
    
    const testEmail = 'test@example.com';
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
    
    console.log('📤 Sending forgot password request for:', testEmail);
    
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
    
    console.log('\n📊 Response Status:', response.statusCode);
    console.log('📋 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.statusCode === 200) {
      console.log('\n✅ API Request Successful!');
      console.log('📧 Check server logs for email sending status...');
      
      // Wait a moment for the email sending process
      console.log('\n⏳ Waiting for email sending process...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      console.log('\n2️⃣ Checking debug tokens...');
      
      const debugResponse = await new Promise((resolve, reject) => {
        const debugOptions = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/debug/tokens',
          method: 'GET'
        };
        
        const req = http.request(debugOptions, (res) => {
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
      
      console.log('🔍 Debug Tokens Response:', JSON.stringify(debugResponse.data, null, 2));
      
    } else {
      console.log('\n❌ API Request Failed');
    }
    
    console.log('\n📈 Expected Results:');
    console.log('✅ Token should be generated');
    console.log('✅ Reset URL should be created');
    console.log('✅ Email should be sent successfully (if App Password is correct)');
    console.log('❌ If email still fails, the App Password might need regeneration');
    
    console.log('\n📧 Email Delivery Status:');
    console.log('- Check server logs for "✅ Password reset email sent successfully"');
    console.log('- Or "❌ Failed to send password reset email" if still having issues');
    
  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  }
}

testEmailSending();
