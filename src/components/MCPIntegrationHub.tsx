'use client'

import { useState, useEffect } from 'react'
import { descopeService } from '@/lib/descope-external-service'

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  isConnected: boolean
  features: string[]
}

interface IntegrationHubProps {
  userId: string
}

export default function IntegrationHub({ userId }: IntegrationHubProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Analyze your repositories for skill assessment and portfolio optimization',
      icon: '🐱',
      isConnected: false,
      features: ['Portfolio Analysis', 'Skill Detection', 'Project Recommendations']
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Schedule and manage job interviews automatically',
      icon: '📅',
      isConnected: false,
      features: ['Interview Scheduling', 'Availability Checking', 'Reminder Management']
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Receive career updates and job notifications in your workspace',
      icon: '💬',
      isConnected: false,
      features: ['Job Alerts', 'Career Coaching', 'Interview Reminders']
    }
  ])

  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([])

  useEffect(() => {
    if (userId) {
      loadConnectedServices()
    }
  }, [userId])

  const loadConnectedServices = async () => {
    try {
      const connectedServices = await descopeService.getUserConnectedServices(userId)
      setIntegrations(prev => 
        prev.map(integration => ({
          ...integration,
          isConnected: connectedServices.includes(integration.id)
        }))
      )
    } catch (error) {
      console.error('Failed to load connected services:', error)
    }
  }

  const handleConnect = (serviceId: string) => {
    const connectionUrl = descopeService.getConnectionUrl(serviceId, userId)
    window.open(connectionUrl, '_blank', 'width=600,height=700')
    
    // Listen for connection completion
    const checkConnection = setInterval(async () => {
      const connectedServices = await descopeService.getUserConnectedServices(userId)
      if (connectedServices.includes(serviceId)) {
        setIntegrations(prev => 
          prev.map(integration => 
            integration.id === serviceId 
              ? { ...integration, isConnected: true }
              : integration
          )
        )
        clearInterval(checkConnection)
      }
    }, 2000)

    // Stop checking after 5 minutes
    setTimeout(() => clearInterval(checkConnection), 300000)
  }

  const handleDisconnect = async (serviceId: string) => {
    // In a real implementation, you would call Descope API to revoke the token
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === serviceId 
          ? { ...integration, isConnected: false }
          : integration
      )
    )
  }

  const analyzeGitHubPortfolio = async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await descopeService.analyzeGitHubPortfolio(userId)
      setPortfolioAnalysis(analysis)
      
      // Send Slack notification about analysis completion
      await descopeService.sendCareerNotification(userId, {
        title: '🎯 Portfolio Analysis Complete!',
        message: `Your GitHub portfolio has been analyzed. Found ${analysis.totalRepos} repositories with ${analysis.languages.length} programming languages. Check out your personalized skill suggestions!`
      })
    } catch (error) {
      console.error('Portfolio analysis failed:', error)
      alert('Portfolio analysis failed. Please ensure your GitHub account is connected.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const scheduleInterview = async (jobData: any) => {
    try {
      const interviewData = {
        jobTitle: jobData.title,
        company: jobData.company,
        jobDescription: jobData.description,
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // 1 hour duration
        userEmail: 'user@example.com', // In real app, get from user profile
        interviewerEmail: 'hr@company.com' // In real app, get from job posting
      }

      const event = await descopeService.scheduleInterview(userId, interviewData)
      
      setUpcomingInterviews(prev => [...prev, {
        ...interviewData,
        eventId: event.eventId,
        htmlLink: event.htmlLink
      }])

      // Send Slack notification
      await descopeService.sendCareerNotification(userId, {
        title: '📅 Interview Scheduled!',
        message: `Your interview for ${jobData.title} at ${jobData.company} has been scheduled. Check your calendar for details.`
      })

      alert('Interview scheduled successfully! Check your Google Calendar.')
    } catch (error) {
      console.error('Interview scheduling failed:', error)
      alert('Interview scheduling failed. Please ensure your Google Calendar is connected.')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">🔗</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Integration Hub</h2>
          <p className="text-gray-600">Connect external services to supercharge your career assistant</p>
        </div>
      </div>

      {/* MCP Hackathon Compliance Notice */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600">🏆</span>
          <span className="font-semibold text-green-800">MCP Hackathon Compliant</span>
        </div>
        <p className="text-sm text-green-700">
          All external service integrations are managed through <strong>Descope Outbound Apps</strong> 
          with secure token management and no hardcoded API keys.
        </p>
      </div>

      {/* Integration Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {integrations.map((integration) => (
          <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <h3 className="font-semibold text-gray-900">{integration.name}</h3>
              </div>
              <div className={`w-3 h-3 rounded-full ${integration.isConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            
            <p className="text-sm text-gray-600 mb-3">{integration.description}</p>
            
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Features:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {integration.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {integration.isConnected ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleDisconnect(integration.id)}
                  className="w-full px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"
                >
                  Disconnect
                </button>
                
                {integration.id === 'github' && (
                  <button
                    onClick={analyzeGitHubPortfolio}
                    disabled={isAnalyzing}
                    className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Portfolio'}
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleConnect(integration.id)}
                className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Connect {integration.name}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Portfolio Analysis Results */}
      {portfolioAnalysis && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 GitHub Portfolio Analysis</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Programming Languages</h4>
              <div className="space-y-2">
                {portfolioAnalysis.languages.slice(0, 5).map(([lang, bytes]: [string, number], index: number) => (
                  <div key={lang} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{lang}</span>
                    <span className="text-xs text-gray-500">{Math.round(bytes / 1000)}KB</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Skill Suggestions</h4>
              <div className="space-y-1">
                {portfolioAnalysis.skillSuggestions.map((skill: string) => (
                  <span key={skill} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold text-gray-700 mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {portfolioAnalysis.recentActivity.slice(0, 3).map((repo: any) => (
                <div key={repo.name} className="flex items-center justify-between bg-white p-3 rounded">
                  <div>
                    <span className="font-medium text-gray-900">{repo.name}</span>
                    <p className="text-sm text-gray-600">{repo.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">{repo.language}</span>
                    <div className="text-xs text-gray-400">{repo.stars} ⭐</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Demo Actions */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Demo Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => scheduleInterview({
              title: 'Senior Frontend Developer',
              company: 'TechCorp Inc',
              description: 'Full-time position building React applications'
            })}
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
          >
            <div className="text-green-600 text-lg mb-2">📅</div>
            <h4 className="font-semibold text-gray-900">Schedule Demo Interview</h4>
            <p className="text-sm text-gray-600">Test Google Calendar integration</p>
          </button>

          <button
            onClick={() => descopeService.sendCareerNotification(userId, {
              title: '🎉 New Job Match Found!',
              message: 'A Frontend Developer position at TechCorp matches your skills. Apply now!'
            })}
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
          >
            <div className="text-purple-600 text-lg mb-2">💬</div>
            <h4 className="font-semibold text-gray-900">Send Demo Notification</h4>
            <p className="text-sm text-gray-600">Test Slack integration</p>
          </button>

          <button
            onClick={analyzeGitHubPortfolio}
            disabled={isAnalyzing}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50"
          >
            <div className="text-blue-600 text-lg mb-2">🐱</div>
            <h4 className="font-semibold text-gray-900">Analyze GitHub Portfolio</h4>
            <p className="text-sm text-gray-600">Test GitHub integration</p>
          </button>
        </div>
      </div>
    </div>
  )
}
