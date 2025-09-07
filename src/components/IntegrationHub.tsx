'use client'

import React, { useState } from 'react'
import { UserProfile } from '@/types'

interface IntegrationHubProps {
  profile: UserProfile
  onProfileUpdate: (profile: UserProfile) => void
}

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  status: 'connected' | 'available' | 'coming_soon'
  category: 'productivity' | 'development' | 'social' | 'learning'
}

export default function IntegrationHub({ profile, onProfileUpdate }: IntegrationHubProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'github',
      name: 'GitHub',
      description: 'Import repositories, save resumes, showcase projects',
      icon: '🐙',
      status: 'available',
      category: 'development'
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Save study plans, track progress, manage notes',
      icon: '📝',
      status: 'available',
      category: 'productivity'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      description: 'Import profile data, sync experience and skills',
      icon: '💼',
      status: 'available',
      category: 'social'
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Schedule study sessions, interview reminders',
      icon: '📅',
      status: 'available',
      category: 'productivity'
    },
    {
      id: 'coursera',
      name: 'Coursera',
      description: 'Track completed courses, import certificates',
      icon: '🎓',
      status: 'available',
      category: 'learning'
    },
    {
      id: 'udemy',
      name: 'Udemy',
      description: 'Sync course progress, add certifications',
      icon: '📚',
      status: 'coming_soon',
      category: 'learning'
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Join study groups, networking communities',
      icon: '🎮',
      status: 'coming_soon',
      category: 'social'
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Professional networking, company research',
      icon: '💬',
      status: 'coming_soon',
      category: 'social'
    }
  ])

  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([])
  const [showModal, setShowModal] = useState<string | null>(null)

  const handleConnect = (integrationId: string) => {
    setShowModal(integrationId)
  }

  const confirmConnection = (integrationId: string) => {
    setConnectedIntegrations(prev => [...prev, integrationId])
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'connected' as const }
          : integration
      )
    )
    setShowModal(null)

    // Simulate data import for demonstration
    if (integrationId === 'github') {
      simulateGitHubImport()
    } else if (integrationId === 'linkedin') {
      simulateLinkedInImport()
    } else if (integrationId === 'coursera') {
      simulateCourseraImport()
    }
  }

  const simulateGitHubImport = () => {
    const newProjects = [
      {
        name: 'E-commerce Platform',
        technologies: 'React, Node.js, MongoDB, Stripe',
        description: 'Full-stack e-commerce platform with payment processing and admin dashboard.'
      },
      {
        name: 'Task Management App',
        technologies: 'Vue.js, Express, PostgreSQL',
        description: 'Collaborative task management application with real-time updates.'
      }
    ]

    onProfileUpdate({
      ...profile,
      projects: [...profile.projects, ...newProjects]
    })

    alert('🎉 GitHub integration successful! Imported 2 repositories to your projects.')
  }

  const simulateLinkedInImport = () => {
    const newSkills = ['Team Leadership', 'Project Management', 'Communication', 'Problem Solving']
    const combinedSkills = [...profile.skills, ...newSkills]
    const uniqueSkills = Array.from(new Set(combinedSkills))

    const updatedProfile = {
      ...profile,
      summary: profile.summary || 'Passionate software developer with experience in modern web technologies. Skilled in building scalable applications and collaborating with cross-functional teams.',
      skills: uniqueSkills
    }

    onProfileUpdate(updatedProfile)
    alert('🎉 LinkedIn integration successful! Imported professional summary and soft skills.')
  }

  const simulateCourseraImport = () => {
    const newEducation = {
      degree: 'Machine Learning Specialization',
      school: 'Coursera - Stanford University',
      year: '2024',
      gpa: 'Certificate'
    }

    const newSkills = ['Machine Learning', 'Data Analysis', 'Python for Data Science']
    const combinedSkills = [...profile.skills, ...newSkills]
    const uniqueSkills = Array.from(new Set(combinedSkills))

    onProfileUpdate({
      ...profile,
      education: [...profile.education, newEducation],
      skills: uniqueSkills
    })

    alert('🎉 Coursera integration successful! Added completed specialization and new skills.')
  }

  const handleDisconnect = (integrationId: string) => {
    setConnectedIntegrations(prev => prev.filter(id => id !== integrationId))
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: 'available' as const }
          : integration
      )
    )
  }

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200'
      case 'available': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'coming_soon': return 'bg-gray-100 text-gray-500 border-gray-200'
    }
  }

  const getStatusText = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'Connected'
      case 'available': return 'Connect'
      case 'coming_soon': return 'Coming Soon'
    }
  }

  const getCategoryIcon = (category: Integration['category']) => {
    switch (category) {
      case 'productivity': return '⚡'
      case 'development': return '💻'
      case 'social': return '👥'
      case 'learning': return '📖'
    }
  }

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) acc[integration.category] = []
    acc[integration.category].push(integration)
    return acc
  }, {} as Record<string, Integration[]>)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Integration Hub</h2>
        <p className="text-gray-600">
          Connect your favorite tools to enhance your career development experience
        </p>
      </div>

      {/* Connected Integrations Summary */}
      {connectedIntegrations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🎉 Connected Integrations ({connectedIntegrations.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {connectedIntegrations.map(id => {
              const integration = integrations.find(i => i.id === id)
              return integration ? (
                <span key={id} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {integration.icon} {integration.name}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            {getCategoryIcon(category as Integration['category'])}
            <span className="ml-2 capitalize">{category.replace('_', ' ')}</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryIntegrations.map((integration) => (
              <div
                key={integration.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{integration.icon}</span>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{integration.name}</h4>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                        {getStatusText(integration.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{integration.description}</p>
                
                <div className="flex space-x-2">
                  {integration.status === 'available' && (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Connect
                    </button>
                  )}
                  
                  {integration.status === 'connected' && (
                    <>
                      <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium">
                        ✓ Connected
                      </button>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                  
                  {integration.status === 'coming_soon' && (
                    <button
                      disabled
                      className="flex-1 bg-gray-300 text-gray-500 py-2 px-4 rounded-lg cursor-not-allowed text-sm font-medium"
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Connection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            {(() => {
              const integration = integrations.find(i => i.id === showModal)
              if (!integration) return null
              
              return (
                <>
                  <div className="text-center mb-6">
                    <span className="text-4xl">{integration.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-900 mt-2">
                      Connect {integration.name}
                    </h3>
                    <p className="text-gray-600 mt-2">{integration.description}</p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-900 mb-2">What we'll access:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {integration.id === 'github' && (
                        <>
                          <li>• Public repository information</li>
                          <li>• Project descriptions and technologies</li>
                          <li>• Contribution activity</li>
                        </>
                      )}
                      {integration.id === 'linkedin' && (
                        <>
                          <li>• Professional headline and summary</li>
                          <li>• Work experience and skills</li>
                          <li>• Education and certifications</li>
                        </>
                      )}
                      {integration.id === 'notion' && (
                        <>
                          <li>• Create study plan pages</li>
                          <li>• Save resume versions</li>
                          <li>• Track learning progress</li>
                        </>
                      )}
                      {integration.id === 'google-calendar' && (
                        <>
                          <li>• Create study session events</li>
                          <li>• Set interview reminders</li>
                          <li>• Schedule learning goals</li>
                        </>
                      )}
                      {integration.id === 'coursera' && (
                        <>
                          <li>• Completed course information</li>
                          <li>• Earned certificates</li>
                          <li>• Skill assessments</li>
                        </>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowModal(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => confirmConnection(integration.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Connect {integration.name}
                    </button>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
