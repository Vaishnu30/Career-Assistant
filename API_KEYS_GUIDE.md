# 🔑 How to Get API Keys from Job Boards - Complete Guide

## Overview

To use the job board API integration in your AI Career Assistant, you'll need to obtain API keys from the various job platforms. This guide provides step-by-step instructions for each supported job board.

---

## 🎯 Indeed API Key

### Step 1: Publisher Account Setup
1. **Visit Indeed Publishers**: https://ads.indeed.com/jobroll/xmlfeed
2. **Click "Get Started"** or "Sign Up"
3. **Fill out the application form**:
   - Business name: "AI Career Assistant"
   - Website URL: Your deployment URL (e.g., `https://yourapp.vercel.app`)
   - Business type: "Technology/Software"
   - Description: "AI-powered career assistant helping students find relevant job opportunities"

### Step 2: Account Verification
1. **Submit your application**
2. **Wait for approval** (usually 24-48 hours)
3. **Check your email** for approval notification
4. **Verify your website** if requested

### Step 3: Get Your Publisher ID
1. **Log into your Indeed Publisher account**
2. **Navigate to "Account Settings"**
3. **Find your "Publisher ID"** - this is your API key
4. **Copy the Publisher ID**

### Step 4: Test Your Access
```bash
# Test your Indeed API access
curl "https://api.indeed.com/ads/apisearch?publisher=YOUR_PUBLISHER_ID&q=developer&l=remote&format=json&v=2&limit=10"
```

**API Key Format**: Usually a long alphanumeric string
**Rate Limits**: 1000 requests per day (free tier)
**Cost**: Free for basic usage

---

## 💼 LinkedIn API Key

### Step 1: LinkedIn Developer Account
1. **Visit LinkedIn Developers**: https://www.linkedin.com/developers/
2. **Sign in** with your LinkedIn account
3. **Click "Create App"**
4. **Fill out the application**:
   - App name: "AI Career Assistant"
   - LinkedIn Page: Create or use existing company page
   - Privacy policy URL: Your privacy policy URL
   - App logo: Upload your app logo

### Step 2: App Configuration
1. **Select "Jobs API"** in products section
2. **Add authorized redirect URLs**:
   - `http://localhost:3000/auth/linkedin/callback` (development)
   - `https://yourapp.vercel.app/auth/linkedin/callback` (production)
3. **Request access to Jobs API**
4. **Fill out use case form**:
   - Purpose: "Help students discover relevant job opportunities"
   - Data usage: "Display job listings and help with career matching"

### Step 3: API Credentials
1. **Go to "Auth" tab**
2. **Copy your "Client ID"** 
3. **Copy your "Client Secret"**
4. **Note your "Redirect URLs"**

### Step 4: API Access Request
1. **Submit for "Jobs API" review**
2. **Provide additional documentation** if requested
3. **Wait for approval** (can take 7-14 days)

### Step 5: Authentication Setup
```javascript
// LinkedIn uses OAuth 2.0
const linkedinAuth = {
  client_id: 'your_client_id',
  client_secret: 'your_client_secret',
  redirect_uri: 'your_redirect_uri',
  scope: 'r_liteprofile r_emailaddress rw_jobs'
}
```

**API Key Format**: Client ID + Client Secret
**Rate Limits**: Varies by plan (typically 500-2000 requests/day)
**Cost**: Free tier available, paid plans for higher limits

---

## 🔧 StackOverflow API Key

### Step 1: StackApps Registration
1. **Visit StackApps**: https://stackapps.com/
2. **Click "Register your application"**
3. **Fill out the form**:
   - Application Name: "AI Career Assistant"
   - Description: "Career assistant helping developers find relevant job opportunities"
   - OAuth Domain: Your domain (e.g., `yourapp.vercel.app`)
   - Application Website: Your app URL

### Step 2: Get Application Key
1. **Submit your application**
2. **Get your "Client ID"**
3. **Get your "Client Secret"**
4. **Get your "Key"** (this is your API key)

### Step 3: API Configuration
```javascript
// StackOverflow API configuration
const stackoverflowConfig = {
  key: 'your_api_key',
  client_id: 'your_client_id',
  client_secret: 'your_client_secret'
}
```

### Step 4: Test API Access
```bash
# Test StackOverflow API
curl "https://api.stackexchange.com/2.3/jobs?site=stackoverflow&key=YOUR_API_KEY"
```

**API Key Format**: Alphanumeric string
**Rate Limits**: 10,000 requests per day (with key), 300 per day (without key)
**Cost**: Free

---

## 🌟 Glassdoor API Key (Optional)

### Step 1: Partner Application
1. **Visit Glassdoor Developers**: https://www.glassdoor.com/developer/index.htm
2. **Click "Apply for API Access"**
3. **Fill out partner application**:
   - Company: Your company/project name
   - Use case: "Student career assistance platform"
   - Expected volume: Your estimated usage

### Step 2: Business Requirements
1. **Provide business registration** (if applicable)
2. **Describe your use case** in detail
3. **Submit application**
4. **Wait for review** (can take several weeks)

**Note**: Glassdoor API access is limited and primarily for enterprise partners.

---

## 🚀 Alternative Job Data Sources

If getting API keys proves challenging, consider these alternatives:

### 1. GitHub Jobs API (Free)
```bash
# No API key required
curl "https://jobs.github.com/positions.json?description=developer&location=remote"
```

### 2. Reed.co.uk Jobs API
1. **Visit**: https://www.reed.co.uk/developers
2. **Sign up for free account**
3. **Get API key immediately**
4. **UK-focused jobs**

### 3. Adzuna API
1. **Visit**: https://developer.adzuna.com/
2. **Register for free account**
3. **Get API key and App ID**
4. **Global job coverage**

### 4. JSearch API (RapidAPI)
1. **Visit**: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch/
2. **Subscribe to free plan**
3. **Get RapidAPI key**
4. **Access multiple job boards**

---

## 📝 Environment Variables Setup

Once you have your API keys, add them to your `.env.local` file:

```bash
# Job Board API Keys
INDEED_API_KEY=your_indeed_publisher_id_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
STACKOVERFLOW_API_KEY=your_stackoverflow_key_here
GLASSDOOR_PARTNER_ID=your_glassdoor_partner_id_here
GLASSDOOR_API_KEY=your_glassdoor_api_key_here

# Alternative APIs
GITHUB_JOBS_API=no_key_required
REED_API_KEY=your_reed_api_key_here
ADZUNA_APP_ID=your_adzuna_app_id_here
ADZUNA_API_KEY=your_adzuna_api_key_here
JSEARCH_RAPIDAPI_KEY=your_rapidapi_key_here
```

---

## ⚡ Quick Start Options

### Option 1: Start with Free APIs
Begin with APIs that don't require approval:
1. **StackOverflow** (immediate access)
2. **GitHub Jobs** (no key required)
3. **Adzuna** (quick approval)

### Option 2: Mock Data Development
Use the built-in mock data while waiting for API approvals:
```javascript
// The system automatically falls back to mock data
// if API keys are not available
```

### Option 3: Gradual Integration
1. Start with one API (e.g., StackOverflow)
2. Add others as approvals come in
3. The system supports partial API integration

---

## 🔍 Testing Your API Keys

### Test Script
Create a test script to verify your API keys:

```javascript
// test-apis.js
const testAPIs = async () => {
  // Test Indeed
  if (process.env.INDEED_API_KEY) {
    const indeedResponse = await fetch(`https://api.indeed.com/ads/apisearch?publisher=${process.env.INDEED_API_KEY}&q=developer&format=json&v=2&limit=1`)
    console.log('Indeed API:', indeedResponse.ok ? '✅ Working' : '❌ Failed')
  }
  
  // Test StackOverflow
  if (process.env.STACKOVERFLOW_API_KEY) {
    const soResponse = await fetch(`https://api.stackexchange.com/2.3/jobs?site=stackoverflow&key=${process.env.STACKOVERFLOW_API_KEY}&pagesize=1`)
    console.log('StackOverflow API:', soResponse.ok ? '✅ Working' : '❌ Failed')
  }
  
  // Add other API tests...
}

testAPIs()
```

---

## 📊 API Comparison Table

| API | Approval Time | Rate Limits | Cost | Job Quality | Coverage |
|-----|---------------|-------------|------|-------------|----------|
| Indeed | 1-2 days | 1000/day | Free | High | Global |
| LinkedIn | 7-14 days | 500-2000/day | Free/Paid | Very High | Global |
| StackOverflow | Immediate | 10,000/day | Free | High (Tech) | Global |
| Glassdoor | Weeks | Varies | Enterprise | High | US/EU |
| GitHub Jobs | Immediate | No limit | Free | High (Tech) | Global |
| Adzuna | 1 day | 1000/month | Free | Medium | Global |

---

## 🎯 Recommended Strategy

### Phase 1: Immediate Setup (Day 1)
1. **StackOverflow API** - Get key immediately
2. **GitHub Jobs** - No key required
3. **Test with mock data fallback**

### Phase 2: Medium Term (Week 1)
1. **Apply for Indeed Publisher account**
2. **Apply for LinkedIn Developer access**
3. **Sign up for Adzuna API**

### Phase 3: Long Term (Month 1)
1. **Consider Glassdoor partnership** (if needed)
2. **Evaluate other premium APIs**
3. **Optimize based on usage patterns**

---

## 🛠️ Implementation Tips

### 1. Graceful Degradation
```javascript
// Always have fallbacks
const getJobs = async () => {
  try {
    return await fetchFromAPIs()
  } catch (error) {
    return getMockJobs() // Fallback to mock data
  }
}
```

### 2. Rate Limit Handling
```javascript
// Implement delays between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
await delay(100) // Wait 100ms between requests
```

### 3. API Key Rotation
```javascript
// Use multiple keys if available
const API_KEYS = [key1, key2, key3]
const currentKey = API_KEYS[requestCount % API_KEYS.length]
```

---

## 📞 Support Contacts

### If You Need Help:
- **Indeed Support**: publishers@indeed.com
- **LinkedIn Developer**: https://www.linkedin.com/help/linkedin/answer/94947
- **StackOverflow**: team@stackoverflow.com
- **General API Issues**: Check platform-specific documentation

---

## ✅ Checklist

- [ ] Choose which APIs to pursue first
- [ ] Apply for API access with required information
- [ ] Set up development environment with mock data
- [ ] Test API integration as keys become available
- [ ] Monitor rate limits and usage
- [ ] Plan for production scaling

---

*Remember: Start with the easiest APIs first (StackOverflow, GitHub) while waiting for approval from others. Your system is designed to work with any combination of available APIs!*
