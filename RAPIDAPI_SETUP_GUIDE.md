# 🚀 RapidAPI Job Integration Setup Guide

## Overview

RapidAPI provides access to multiple job board APIs through a single platform, making it an excellent choice for job data integration. This guide shows you how to set up RapidAPI as your primary job data source.

---

## 🎯 Why RapidAPI?

### ✅ **Advantages**
- **Single API Key** - Access multiple job boards with one key
- **Instant Access** - No approval process needed
- **Comprehensive Data** - Jobs from Indeed, ZipRecruiter, Glassdoor, and more
- **Reliable Service** - Professional API management
- **Good Documentation** - Well-documented endpoints
- **Free Tier Available** - Start for free, scale as needed

### 📊 **Available Job APIs on RapidAPI**
1. **JSearch** - Most comprehensive (recommended)
2. **Jobs API** - Alternative option
3. **Jobicy API** - Remote jobs focused
4. **Indeed Jobs API** - Indeed-specific
5. **LinkedIn Jobs API** - Professional networking jobs

---

## 🔑 Getting Your RapidAPI Key

### Step 1: Create RapidAPI Account
1. **Visit RapidAPI**: https://rapidapi.com/
2. **Click "Sign Up"** (free account)
3. **Choose signup method**:
   - Email + Password
   - GitHub account
   - Google account
4. **Verify your email** if required

### Step 2: Find Job Search APIs
1. **Search for "jsearch"** in the API marketplace
2. **Click on "JSearch"** (by LetscrapeAPI)
3. **Review the API documentation** and pricing

### Step 3: Subscribe to the API
1. **Click "Subscribe to Test"**
2. **Choose a plan**:
   - **Basic Plan**: Free (100 requests/month)
   - **Pro Plan**: $9.99/month (1,000 requests/month)
   - **Ultra Plan**: $49.99/month (10,000 requests/month)
   - **Mega Plan**: $199.99/month (100,000 requests/month)

### Step 4: Get Your API Key
1. **Go to "My Apps"** in your dashboard
2. **Select your app** (or create one)
3. **Copy your "X-RapidAPI-Key"**
4. **Note the API Host**: `jsearch.p.rapidapi.com`

---

## 🔧 Environment Setup

### Add to your `.env.local` file:
```bash
# RapidAPI Configuration
RAPIDAPI_KEY=your_rapidapi_key_here
```

### Test your API key:
```bash
curl --request GET \
  --url 'https://jsearch.p.rapidapi.com/search?query=software%20developer&page=1&num_pages=1' \
  --header 'X-RapidAPI-Host: jsearch.p.rapidapi.com' \
  --header 'X-RapidAPI-Key: YOUR_RAPIDAPI_KEY'
```

---

## 📚 JSearch API Features

### 🔍 **Job Search**
```javascript
// Search for jobs
GET /search?query=software%20developer&page=1&num_pages=1&date_posted=all&remote_jobs_only=false
```

### 📋 **Job Details**
```javascript
// Get detailed job information
GET /job-details?job_id=example_job_id
```

### 🏢 **Search by Company**
```javascript
// Find jobs at specific companies
GET /search?query=jobs%20at%20google&page=1&num_pages=1
```

### 🌍 **Location-based Search**
```javascript
// Search jobs by location
GET /search?query=developer&geo=San%20Francisco%2C%20CA&page=1
```

### 🏠 **Remote Jobs Only**
```javascript
// Filter for remote positions
GET /search?query=developer&remote_jobs_only=true&page=1
```

---

## 💻 Implementation in Your App

### Your app is already set up! Just add your API key:

1. **Get your RapidAPI key** (follow steps above)
2. **Add to `.env.local`**:
   ```bash
   RAPIDAPI_KEY=your_actual_rapidapi_key_here
   ```
3. **Restart your development server**:
   ```bash
   npm run dev
   ```
4. **Test the integration** - jobs will now come from RapidAPI!

---

## 🎛️ Configuration Options

### Your RapidAPI service supports these parameters:

```javascript
// Available search parameters
{
  query: 'software developer',           // Job search keywords
  page: 1,                              // Page number
  num_pages: 1,                         // Number of pages to fetch
  date_posted: 'week',                  // 'all', 'today', '3days', 'week', 'month'
  remote_jobs_only: false,              // true/false
  employment_types: 'FULLTIME',         // 'FULLTIME', 'PARTTIME', 'CONTRACTOR', 'INTERN'
  job_requirements: 'no_experience',    // Experience level filter
  geo: 'United States',                 // Location filter
  categories: 'Computer and IT',        // Job category filter
}
```

---

## 📊 Pricing & Limits

### **Free Tier (Basic Plan)**
- ✅ 100 requests per month
- ✅ All API features
- ✅ No approval required
- ❌ Limited for production use

### **Pro Plan ($9.99/month)**
- ✅ 1,000 requests per month
- ✅ Good for small applications
- ✅ ~33 requests per day

### **Ultra Plan ($49.99/month)**
- ✅ 10,000 requests per month
- ✅ Suitable for production apps
- ✅ ~333 requests per day

### **Rate Limiting**
- Requests are limited by your plan
- No specific rate per second limits
- Usage resets monthly

---

## 🔍 Alternative RapidAPI Job Services

### If JSearch doesn't meet your needs:

#### 1. **Jobs API** (jobs-api14.p.rapidapi.com)
- Alternative job search service
- Similar features to JSearch
- Different data sources

#### 2. **Jobicy API** (jobicy-api.p.rapidapi.com)
- Focused on remote jobs
- Good for remote-first companies
- Simpler API structure

#### 3. **Reed Jobs API** (reed-jobs-api.p.rapidapi.com)
- UK-focused job board
- Professional positions
- Good for international apps

---

## 🛠️ Troubleshooting

### **Common Issues:**

#### ❌ "Invalid API Key"
```bash
# Check your API key is correct
# Ensure no extra spaces or characters
RAPIDAPI_KEY=your_key_here_no_spaces
```

#### ❌ "Rate Limit Exceeded"
```bash
# You've exceeded your monthly quota
# Upgrade your plan or wait for reset
# Check usage in RapidAPI dashboard
```

#### ❌ "API Host Mismatch"
```bash
# Ensure correct host header
X-RapidAPI-Host: jsearch.p.rapidapi.com
```

#### ❌ "No Results Found"
```bash
# Try broader search terms
# Check location spelling
# Verify date_posted parameter
```

---

## 📈 Testing Your Integration

### 1. **Basic Test**
```bash
# Test in browser or terminal
https://jsearch.p.rapidapi.com/search?query=developer&page=1
```

### 2. **In Your App**
1. Add your API key to `.env.local`
2. Start development server: `npm run dev`
3. Go to the Jobs tab
4. Click "Sync Jobs" button
5. Look for "via RapidAPI" labels on job cards

### 3. **Check Console**
```javascript
// Look for these success messages in browser console:
"Successfully synced X jobs from rapidapi"
"Job sync service initialized successfully"
```

---

## 🚀 Production Deployment

### **Before Going Live:**

1. **Upgrade Plan** - Free tier insufficient for production
2. **Monitor Usage** - Track API calls in RapidAPI dashboard
3. **Set Up Alerts** - Get notified before hitting limits
4. **Cache Results** - Store jobs locally to reduce API calls
5. **Error Handling** - Graceful fallbacks when API unavailable

### **Recommended Production Plan:**
- **Ultra Plan ($49.99/month)** for most applications
- 10,000 requests/month = ~333 per day
- Sufficient for most job board applications

---

## 📋 Quick Start Checklist

- [ ] Create RapidAPI account at https://rapidapi.com/
- [ ] Subscribe to JSearch API (start with free plan)
- [ ] Copy your X-RapidAPI-Key
- [ ] Add `RAPIDAPI_KEY=your_key` to `.env.local`
- [ ] Restart your development server
- [ ] Test by clicking "Sync Jobs" in your app
- [ ] Verify jobs show "via RapidAPI" labels
- [ ] Plan for production usage and upgrade as needed

---

## 💡 Pro Tips

### **Optimize API Usage:**
1. **Cache Results** - Store jobs locally for 1-4 hours
2. **Batch Requests** - Combine multiple search terms
3. **Smart Filtering** - Use API filters instead of client-side filtering
4. **Monitor Usage** - Check RapidAPI dashboard regularly

### **Best Practices:**
1. **Start Small** - Begin with free tier and scale up
2. **Test Thoroughly** - Validate all search parameters
3. **Handle Errors** - Always have fallback data
4. **User Experience** - Show loading states and clear error messages

---

## 🎯 Success!

Once set up, your AI Career Assistant will:
- ✅ Fetch real jobs from multiple sources via RapidAPI
- ✅ Display fresh job postings with "via RapidAPI" attribution
- ✅ Provide comprehensive job search across multiple boards
- ✅ Work seamlessly with your existing AI resume generation

**Your job board is now powered by RapidAPI! 🚀**
