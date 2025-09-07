// Descope service for managing external integrations via Outbound Apps
// This service handles token-based API calls to external services

interface DescopeToken {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  scope: string[]
}

interface ExternalServiceConfig {
  serviceId: string
  appId: string
  baseUrl: string
  requiredScopes: string[]
}

export class DescopeExternalService {
  private static instance: DescopeExternalService
  private projectId: string
  private managementKey: string

  private constructor() {
    this.projectId = process.env.DESCOPE_PROJECT_ID || ''
    this.managementKey = process.env.DESCOPE_MANAGEMENT_KEY || ''
  }

  static getInstance(): DescopeExternalService {
    if (!DescopeExternalService.instance) {
      DescopeExternalService.instance = new DescopeExternalService()
    }
    return DescopeExternalService.instance
  }

  // Get external service token via Descope
  async getServiceToken(userId: string, serviceId: string): Promise<DescopeToken | null> {
    try {
      const response = await fetch(`https://api.descope.com/v1/mgmt/user/${userId}/outbound-apps/${serviceId}/token`, {
        headers: {
          'Authorization': `Bearer ${this.managementKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error(`Failed to get ${serviceId} token:`, response.statusText)
        return null
      }

      const tokenData = await response.json()
      return {
        accessToken: tokenData.accessToken,
        refreshToken: tokenData.refreshToken,
        expiresAt: tokenData.expiresAt,
        scope: tokenData.scope || []
      }
    } catch (error) {
      console.error(`Error getting ${serviceId} token:`, error)
      return null
    }
  }

  // GitHub Integration - Portfolio Analysis
  async analyzeGitHubPortfolio(userId: string): Promise<any> {
    const token = await this.getServiceToken(userId, 'github')
    if (!token) {
      throw new Error('GitHub token not available. Please connect your GitHub account.')
    }

    try {
      // Get user repositories
      const reposResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (!reposResponse.ok) {
        throw new Error('Failed to fetch GitHub repositories')
      }

      const repos = await reposResponse.json()

      // Analyze languages and technologies
      const analysis = await this.analyzeRepositories(repos, token.accessToken)
      
      return {
        totalRepos: repos.length,
        languages: analysis.languages,
        technologies: analysis.technologies,
        recentActivity: analysis.recentActivity,
        skillSuggestions: analysis.skillSuggestions
      }
    } catch (error) {
      console.error('GitHub portfolio analysis failed:', error)
      throw error
    }
  }

  private async analyzeRepositories(repos: any[], token: string) {
    const languages = new Map<string, number>()
    const technologies = new Set<string>()
    const recentActivity = []

    for (const repo of repos.slice(0, 10)) { // Analyze top 10 repos
      // Get repository languages
      try {
        const langResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/languages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        })

        if (langResponse.ok) {
          const repoLanguages = await langResponse.json()
          Object.entries(repoLanguages).forEach(([lang, bytes]: [string, any]) => {
            languages.set(lang, (languages.get(lang) || 0) + bytes)
          })
        }

        // Detect technologies from README and package files
        const techPatterns = [
          'react', 'vue', 'angular', 'node', 'express', 'typescript', 'javascript',
          'python', 'django', 'flask', 'java', 'spring', 'docker', 'kubernetes',
          'aws', 'azure', 'mongodb', 'postgresql', 'redis', 'next.js', 'tailwind'
        ]

        const repoName = repo.name.toLowerCase()
        const repoDescription = (repo.description || '').toLowerCase()
        
        techPatterns.forEach(tech => {
          if (repoName.includes(tech) || repoDescription.includes(tech)) {
            technologies.add(tech)
          }
        })

        recentActivity.push({
          name: repo.name,
          description: repo.description,
          updatedAt: repo.updated_at,
          language: repo.language,
          stars: repo.stargazers_count
        })
      } catch (error) {
        console.error(`Error analyzing repo ${repo.name}:`, error)
      }
    }

    return {
      languages: Array.from(languages.entries()).sort((a, b) => b[1] - a[1]),
      technologies: Array.from(technologies),
      recentActivity: recentActivity.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
      skillSuggestions: this.generateSkillSuggestions(languages, technologies)
    }
  }

  private generateSkillSuggestions(languages: Map<string, number>, technologies: Set<string>) {
    const suggestions = []

    // Language-based suggestions
    if (languages.has('JavaScript') || languages.has('TypeScript')) {
      if (!technologies.has('react')) suggestions.push('React.js')
      if (!technologies.has('node')) suggestions.push('Node.js')
      if (!technologies.has('express')) suggestions.push('Express.js')
    }

    if (languages.has('Python')) {
      if (!technologies.has('django')) suggestions.push('Django')
      if (!technologies.has('flask')) suggestions.push('Flask')
    }

    // Missing modern tools
    if (!technologies.has('docker')) suggestions.push('Docker')
    if (!technologies.has('typescript')) suggestions.push('TypeScript')
    if (!technologies.has('tailwind')) suggestions.push('Tailwind CSS')

    return suggestions.slice(0, 5) // Top 5 suggestions
  }

  // Google Calendar Integration - Interview Scheduling
  async scheduleInterview(userId: string, interviewData: any): Promise<any> {
    const token = await this.getServiceToken(userId, 'google-calendar')
    if (!token) {
      throw new Error('Google Calendar token not available. Please connect your Google account.')
    }

    try {
      const event = {
        summary: `Interview: ${interviewData.jobTitle} at ${interviewData.company}`,
        description: `Job interview for ${interviewData.jobTitle} position.\n\nJob Details:\n${interviewData.jobDescription}`,
        start: {
          dateTime: interviewData.startTime,
          timeZone: 'America/New_York'
        },
        end: {
          dateTime: interviewData.endTime,
          timeZone: 'America/New_York'
        },
        attendees: [
          { email: interviewData.userEmail },
          { email: interviewData.interviewerEmail }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }       // 1 hour before
          ]
        }
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      if (!response.ok) {
        throw new Error('Failed to create calendar event')
      }

      const createdEvent = await response.json()
      return {
        eventId: createdEvent.id,
        htmlLink: createdEvent.htmlLink,
        startTime: createdEvent.start.dateTime,
        endTime: createdEvent.end.dateTime
      }
    } catch (error) {
      console.error('Calendar event creation failed:', error)
      throw error
    }
  }

  // Slack Integration - Career Notifications
  async sendCareerNotification(userId: string, notification: any): Promise<boolean> {
    const token = await this.getServiceToken(userId, 'slack')
    if (!token) {
      console.warn('Slack token not available. Notification not sent.')
      return false
    }

    try {
      const message = {
        channel: notification.channel || '#career-updates',
        text: notification.title,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${notification.title}*\n${notification.message}`
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `🤖 AI Career Assistant • ${new Date().toLocaleDateString()}`
              }
            ]
          }
        ]
      }

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      })

      const result = await response.json()
      return result.ok
    } catch (error) {
      console.error('Slack notification failed:', error)
      return false
    }
  }

  // Get available external services for user
  async getUserConnectedServices(userId: string): Promise<string[]> {
    const services = ['github', 'google-calendar', 'slack']
    const connectedServices = []

    for (const service of services) {
      const token = await this.getServiceToken(userId, service)
      if (token && token.accessToken) {
        connectedServices.push(service)
      }
    }

    return connectedServices
  }

  // Initialize connection to external service
  getConnectionUrl(serviceId: string, userId: string): string {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${serviceId}/callback`
    return `https://api.descope.com/v1/auth/outbound-apps/${serviceId}/authorize?project_id=${this.projectId}&user_id=${userId}&redirect_uri=${redirectUri}`
  }
}

export const descopeService = DescopeExternalService.getInstance()
