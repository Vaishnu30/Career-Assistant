// API Test Script - Test all our improvements
console.log('🧪 Testing API Validations...\n');

// Test 1: Try to create a new user
async function testNewUser() {
  console.log('1️⃣ Testing new user creation...');
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@test.com',
        name: 'New Test User',
        role: 'student'
      })
    });
    
    const result = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Message: ${result.message || result.error}\n`);
    return result.success;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Test 2: Try to create duplicate user
async function testDuplicateUser() {
  console.log('2️⃣ Testing duplicate email prevention...');
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@test.com', // Same email as test 1
        name: 'Another User',
        role: 'student'
      })
    });
    
    const result = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Result: ${result.success ? '❌ FAILED (should prevent duplicate)' : '✅ SUCCESS (correctly prevented)'}`);
    console.log(`   Message: ${result.message || result.error}\n`);
    return !result.success; // Success if it failed to create duplicate
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Test 3: Try to sign in with non-existent user
async function testNonExistentSignIn() {
  console.log('3️⃣ Testing sign-in with non-existent user...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@test.com'
      })
    });
    
    const result = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Result: ${result.success ? '❌ FAILED (should reject non-existent user)' : '✅ SUCCESS (correctly rejected)'}`);
    console.log(`   Message: ${result.message || result.error}\n`);
    return !result.success; // Success if it failed to sign in
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Test 4: Try to sign in with existing user
async function testExistingSignIn() {
  console.log('4️⃣ Testing sign-in with existing user...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@test.com' // User created in test 1
      })
    });
    
    const result = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Message: ${result.message || result.error}\n`);
    return result.success;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Test 5: Try invalid email format
async function testInvalidEmail() {
  console.log('5️⃣ Testing invalid email format...');
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        name: 'Test User',
        role: 'student'
      })
    });
    
    const result = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Result: ${result.success ? '❌ FAILED (should reject invalid email)' : '✅ SUCCESS (correctly rejected)'}`);
    console.log(`   Message: ${result.message || result.error}\n`);
    return !result.success; // Success if it failed validation
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}\n`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Validation Tests...\n');
  
  const results = [
    await testNewUser(),
    await testDuplicateUser(),
    await testNonExistentSignIn(),
    await testExistingSignIn(),
    await testInvalidEmail()
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('📊 Test Results:');
  console.log(`   Passed: ${passed}/${total}`);
  console.log(`   Success Rate: ${(passed/total*100).toFixed(0)}%`);
  
  if (passed === total) {
    console.log('   🎉 All tests passed! API validations are working correctly.');
  } else {
    console.log('   ⚠️  Some tests failed. Check the API implementation.');
  }
}

// Run the tests
runAllTests();
