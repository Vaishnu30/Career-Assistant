'use client'

import React, { useState, useRef, useEffect } from 'react'
import { UserProfile } from '@/types'

interface StudyPlannerProps {
  profile: UserProfile
  skillGaps?: string[]
  jobTitle?: string
  lastAnalysis?: string
  onAnalysisUpdate?: (analysis: any) => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  type?: 'text' | 'assessment' | 'learning-path'
}

export default function StudyPlanner({ profile, skillGaps = [], jobTitle, lastAnalysis, onAnalysisUpdate }: StudyPlannerProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `🎓 Welcome to your AI Study Planner! I'm here to help you develop the skills you need for your career as a ${jobTitle || 'Software Developer'}.\n\n📊 **Your Current Skill Gaps:**\n${skillGaps.length > 0 ? skillGaps.map(gap => `• ${gap}`).join('\n') : '• No specific gaps identified yet'}\n\n**How can I help you today?**\n• Assess your current skill level\n• Create a personalized learning path\n• Find the best resources for specific technologies\n• Track your learning progress`,
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAIResponse = async (message: string, context: any): Promise<string> => {
    try {
      // Call the AI chat API endpoint
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            type: 'study_planner',
            profile: context.profile,
            skillGaps: context.skillGaps,
            jobTitle: context.jobTitle,
            lastAnalysis: context.lastAnalysis
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      return data.response || 'Sorry, I could not process your request at the moment.'
    } catch (error) {
      console.error('AI API Error:', error)
      
      // Intelligent fallback responses based on message content
      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('assess') || lowerMessage.includes('skill')) {
        return `🎯 **Skill Assessment for ${jobTitle}**\n\nBased on your profile and current market demands, here's what I recommend:\n\n**Your Strong Areas:**\n• ${profile.skills.slice(0, 3).join('\n• ')}\n\n**Areas to Develop:**\n• ${skillGaps.slice(0, 3).join('\n• ')}\n\n**Next Steps:**\n1. Take online assessments for specific technologies\n2. Build projects to demonstrate skills\n3. Consider certification programs\n\nWould you like me to create a detailed learning path for any specific skill?`
      }
      
      if (lowerMessage.includes('learn') || lowerMessage.includes('path') || lowerMessage.includes('plan')) {
        return `📚 **Personalized Learning Path**\n\nFor ${jobTitle}, I recommend this progression:\n\n**Phase 1: Foundation (2-4 weeks)**\n• Master core concepts in your weak areas\n• Complete hands-on tutorials\n• Build small practice projects\n\n**Phase 2: Application (4-6 weeks)**\n• Work on intermediate projects\n• Contribute to open source\n• Join developer communities\n\n**Phase 3: Mastery (6-8 weeks)**\n• Build portfolio projects\n• Practice system design\n• Prepare for technical interviews\n\n**Recommended Resources:**\n• Official documentation and tutorials\n• Udemy/Coursera courses\n• GitHub projects for practice\n• LeetCode for coding practice`
      }
      
      if (lowerMessage.includes('resource') || lowerMessage.includes('course') || lowerMessage.includes('tutorial')) {
        return `📖 **Top Learning Resources**\n\n**Free Resources:**\n• freeCodeCamp - Comprehensive coding bootcamp\n• MDN Web Docs - Excellent for web technologies\n• YouTube channels (Traversy Media, The Net Ninja)\n• Official documentation for frameworks\n\n**Paid Courses:**\n• Udemy - Practical project-based learning\n• Pluralsight - In-depth technical content\n• Coursera - University-level courses\n• Frontend Masters - Advanced frontend topics\n\n**Practice Platforms:**\n• CodePen - For frontend experiments\n• GitHub - Version control and collaboration\n• LeetCode - Algorithm practice\n• HackerRank - Coding challenges\n\nWould you like specific recommendations for any technology?`
      }
      
      if (lowerMessage.includes('progress') || lowerMessage.includes('track')) {
        return `📈 **Progress Tracking Strategy**\n\n**Current Status:**\n• Profile: ${profile.name}\n• Target Role: ${jobTitle}\n• Identified Gaps: ${skillGaps.length} skills\n\n**Tracking Methods:**\n1. **Weekly Goals** - Set specific, measurable targets\n2. **Project Milestones** - Complete projects to demonstrate progress\n3. **Skill Assessments** - Regular quizzes and coding challenges\n4. **Portfolio Updates** - Document your learning journey\n\n**Metrics to Track:**\n• Hours spent learning each week\n• Projects completed\n• Certifications earned\n• Interview performance\n\n**Tools:**\n• GitHub for code commits\n• Learning platforms with progress tracking\n• Personal learning journal\n• Regular self-assessments`
      }
      
      return `I understand you're asking about: "${message}"\n\nWhile I'm having trouble accessing my full knowledge base right now, I can still help you with:\n\n• Creating study plans for specific technologies\n• Recommending learning resources\n• Assessing your current skill level\n• Tracking your progress\n\nPlease try asking a more specific question, or use one of the quick action buttons below!`
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const context = {
        profile,
        skillGaps,
        jobTitle,
        lastAnalysis
      }
      
      const aiResponse = await getAIResponse(inputMessage, context)
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text'
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: 'Assess my React skills', action: () => setInputMessage('Assess my React skills') },
    { label: 'Create learning path', action: () => setInputMessage('Create a learning path for me') },
    { label: 'Show resources', action: () => setInputMessage('Show me learning resources') },
    { label: 'Track progress', action: () => setInputMessage('How can I track my learning progress?') }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🎓 AI Study Planner</h2>
        <div className="text-sm text-gray-500">
          For: {profile.name} | Target: {jobTitle || 'Software Developer'}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow-sm border'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-white text-gray-900 shadow-sm border p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about learning plans, skill assessments, or career advice..."
          className="flex-1 p-3 border border-gray-300 rounded-lg resize-none"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>

      {/* Info Panel */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">📈 Learning Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Skill Gaps:</span>
            <span className="ml-2 font-medium">{skillGaps.length} identified</span>
          </div>
          <div>
            <span className="text-gray-600">Target Role:</span>
            <span className="ml-2 font-medium">{jobTitle || 'Software Developer'}</span>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="ml-2 font-medium text-green-600">Active Learning</span>
          </div>
        </div>
      </div>
    </div>
  )
}
