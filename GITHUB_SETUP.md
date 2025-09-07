# GitHub Repository Setup Guide

## Option 1: Create Repository via GitHub CLI (Recommended)

If you have GitHub CLI installed:
```bash
# Create the repository on GitHub
gh repo create career-assistant --description "AI-powered career development platform for students and professionals" --public

# Add the remote origin
git remote add origin https://github.com/YOUR_USERNAME/career-assistant.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Option 2: Create Repository via GitHub Web Interface

1. Go to https://github.com/new
2. Repository name: `career-assistant`
3. Description: `AI-powered career development platform for students and professionals`
4. Choose Public or Private
5. DO NOT initialize with README (we already have one)
6. Click "Create repository"

Then run these commands:
```bash
# Add the remote origin (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/career-assistant.git

# Rename main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## Option 3: Manual Commands (if you prefer step-by-step)

```bash
# Check current status
git status

# Rename master to main (GitHub standard)
git branch -M main

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/career-assistant.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

## After Pushing to GitHub

Your repository will be available at:
```
https://github.com/YOUR_USERNAME/career-assistant
```

## Repository Features to Enable

1. **Issues**: For bug tracking and feature requests
2. **Wiki**: For expanded documentation
3. **Actions**: For CI/CD (already configured)
4. **Security**: Enable security alerts
5. **Insights**: Monitor repository analytics

## Next Steps

1. Create the repository using one of the methods above
2. Set up repository settings and description
3. Add repository topics: `ai`, `career`, `resume`, `nextjs`, `typescript`, `hackathon`
4. Configure branch protection rules
5. Set up deployment with Vercel integration

## Vercel Deployment

After pushing to GitHub, you can deploy to Vercel:

1. Go to https://vercel.com/new
2. Select your GitHub repository: `career-assistant`
3. Configure environment variables from `.env.vercel`
4. Deploy!

Your live application will be available at: `https://career-assistant.vercel.app`
