# Descope Outbound Apps Setup Guide

## MCP Hackathon Compliance: External Service Integration

This guide sets up **Descope Outbound Apps** for the AI Career Assistant to comply with Global MCP Hackathon requirements.

## Required External Service Integrations

### 1. GitHub Integration (For Portfolio Analysis)
- **Purpose**: Analyze user's GitHub repositories for skill assessment
- **Descope Outbound App**: GitHub OAuth App
- **Permissions**: `user:email`, `repo:read`
- **Usage**: Fetch repositories, analyze code, suggest skills

### 2. Google Calendar Integration (For Interview Scheduling)
- **Purpose**: Schedule and manage job interviews
- **Descope Outbound App**: Google Calendar API
- **Permissions**: `calendar.readonly`, `calendar.events`
- **Usage**: Find available slots, schedule interviews

### 3. Slack Integration (For Career Notifications)
- **Purpose**: Send job alerts and career updates
- **Descope Outbound App**: Slack Bot
- **Permissions**: `chat:write`, `channels:read`
- **Usage**: Career coaching notifications, job alerts

## Descope Configuration Steps

### 1. Create Descope Project
```bash
# Project ID: ai-career-assistant-mcp
# Management Key: Required for outbound apps
```

### 2. Configure Outbound Apps

#### GitHub OAuth App
1. Go to Descope Console → Outbound Apps
2. Create new app: "GitHub Portfolio Analyzer"
3. Set OAuth endpoints:
   - Authorization URL: https://github.com/login/oauth/authorize
   - Token URL: https://github.com/login/oauth/access_token
   - Scopes: user:email,repo:read
4. Configure redirect URI: https://your-app.vercel.app/api/auth/github/callback

#### Google Calendar API
1. Create new app: "Career Interview Scheduler"
2. Set OAuth endpoints:
   - Authorization URL: https://accounts.google.com/o/oauth2/v2/auth
   - Token URL: https://oauth2.googleapis.com/token
   - Scopes: https://www.googleapis.com/auth/calendar.readonly
3. Configure redirect URI: https://your-app.vercel.app/api/auth/google/callback

#### Slack Bot
1. Create new app: "Career Assistant Bot"
2. Set OAuth endpoints:
   - Authorization URL: https://slack.com/oauth/v2/authorize
   - Token URL: https://slack.com/api/oauth.v2.access
   - Scopes: chat:write,channels:read
3. Configure redirect URI: https://your-app.vercel.app/api/auth/slack/callback

### 3. Flow Configuration

Create a Descope Flow that:
1. Authenticates users
2. Connects to external services
3. Manages tokens securely
4. Handles token refresh

## Environment Variables

```env
# Descope Configuration
DESCOPE_PROJECT_ID=your_descope_project_id
DESCOPE_MANAGEMENT_KEY=your_management_key
DESCOPE_ACCESS_KEY=your_access_key

# Outbound App IDs (from Descope Console)
DESCOPE_GITHUB_APP_ID=github_app_id
DESCOPE_GOOGLE_APP_ID=google_app_id
DESCOPE_SLACK_APP_ID=slack_app_id

# App URLs
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
DESCOPE_FLOW_URL=https://your-descope-flow.vercel.app
```

## Implementation Architecture

```
User → Descope Flow → External Services
  ↓
AI Career Assistant
  ↓
- GitHub: Portfolio analysis
- Google Calendar: Interview scheduling  
- Slack: Career notifications
```

## Compliance Checklist

- ✅ **Descope Outbound Apps**: GitHub, Google Calendar, Slack
- ✅ **Token Management**: Handled by Descope (no hardcoded tokens)
- ✅ **External Service Integration**: At least 3 services
- ✅ **Hosted Flow**: Accessible for demo/testing
- ✅ **Real-world Problem**: Career assistance automation
- ✅ **Minimal User Effort**: One-time setup, automated afterwards

## Next Steps

1. Set up Descope project and outbound apps
2. Implement token-based service integrations
3. Create hosted flow for demo
4. Test end-to-end functionality
5. Deploy to production for hackathon submission
