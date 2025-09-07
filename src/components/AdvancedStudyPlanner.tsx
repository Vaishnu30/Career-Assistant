'use client'

import React, { useState, useRef, useEffect } from 'react'
import { UserProfile } from '@/types'
import clientLearningProgressService, { 
  LearningProgress, 
  StudySession, 
  StudyAnalytics 
} from '@/lib/client-learning-progress-service'
import clientAdvancedSkillAssessment, { 
  AssessmentConfig, 
  AssessmentSession, 
  AssessmentReport 
} from '@/lib/client-skill-assessment-service'

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
  type: 'text' | 'assessment' | 'progress' | 'recommendation' | 'milestone'
  data?: any
}

interface DashboardData {
  totalHours: number
  currentStreak: number
  skillsInProgress: number
  weeklyGoal: number
  weeklyProgress: number
  recentAchievements: string[]
  upcomingMilestones: any[]
  skillProgress: LearningProgress[]
}

export default function AdvancedStudyPlanner({ profile, skillGaps = [], jobTitle, lastAnalysis, onAnalysisUpdate }: StudyPlannerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeSession, setActiveSession] = useState<StudySession | null>(null)
  const [currentAssessment, setCurrentAssessment] = useState<AssessmentSession | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState<'chat' | 'progress' | 'assessment' | 'resources'>('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initializeStudyPlanner()
  }, [profile])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initializeStudyPlanner = async () => {
    try {
      // Load dashboard data
      const analytics = await clientLearningProgressService.getStudyAnalytics(profile.id!, 30)
      const skillProgress = await clientLearningProgressService.getUserProgress(profile.id!)
      const upcomingMilestones = await clientLearningProgressService.getUpcomingMilestones(profile.id!, 7)

      setDashboardData({
        totalHours: analytics.totalHours,
        currentStreak: analytics.streakDays,
        skillsInProgress: skillProgress.length,
        weeklyGoal: 10, // Default weekly goal
        weeklyProgress: analytics.weeklyGoalProgress,
        recentAchievements: analytics.topAchievements,
        upcomingMilestones,
        skillProgress
      })

      // Initialize with welcome message
      const welcomeMessage: Message = {
        role: 'assistant',
        content: generateWelcomeMessage(analytics, skillProgress),
        timestamp: new Date(),
        type: 'text'
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Failed to initialize study planner:', error)
      setMessages([{
        role: 'assistant',
        content: 'Welcome to your AI Study Planner! I\'m here to help you develop your skills and advance your career. How can I assist you today?',
        timestamp: new Date(),
        type: 'text'
      }])
    }
  }

  const generateWelcomeMessage = (analytics: any, skillProgress: LearningProgress[]): string => {
    return `🎓 **Welcome back, ${profile.name}!**

📊 **Your Learning Dashboard:**
• Total Study Time: ${analytics.totalHours.toFixed(1)} hours
• Current Streak: ${analytics.streakDays} days 🔥
• Skills in Progress: ${skillProgress.length}
• Weekly Goal Progress: ${analytics.weeklyGoalProgress.toFixed(0)}%

🎯 **Target Role:** ${jobTitle || 'Software Developer'}
${skillGaps.length > 0 ? `🎯 **Focus Areas:** ${skillGaps.slice(0, 3).join(', ')}` : ''}

**What would you like to do today?**
• Take a skill assessment
• Continue learning progress
• Review study recommendations
• Set new learning goals
• Track your achievements`
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
      await processUserMessage(inputMessage)
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const processUserMessage = async (message: string) => {
    const lowerMessage = message.toLowerCase()

    // Assessment requests
    if (lowerMessage.includes('assess') || lowerMessage.includes('test') || lowerMessage.includes('quiz')) {
      await handleAssessmentRequest(message)
    }
    // Progress tracking
    else if (lowerMessage.includes('progress') || lowerMessage.includes('status') || lowerMessage.includes('track')) {
      await handleProgressRequest()
    }
    // Learning path requests
    else if (lowerMessage.includes('learn') || lowerMessage.includes('study') || lowerMessage.includes('plan')) {
      await handleLearningPathRequest(message)
    }
    // Resource requests
    else if (lowerMessage.includes('resource') || lowerMessage.includes('course') || lowerMessage.includes('tutorial')) {
      await handleResourceRequest(message)
    }
    // General AI response
    else {
      await handleGeneralQuery(message)
    }
  }

  const handleAssessmentRequest = async (message: string) => {
    const skillMatch = message.match(/(react|javascript|typescript|python|java|css|html|node|angular|vue)/i)
    const skill = skillMatch ? skillMatch[1].toLowerCase() : 'javascript'

    const config: AssessmentConfig = {
      skill,
      targetLevel: 'intermediate',
      questionCount: 10,
      timeLimit: 600, // 10 minutes
      adaptiveScoring: true,
      categories: []
    }

    try {
      const assessment = await clientAdvancedSkillAssessment.createAssessment(profile.id!, config)
      setCurrentAssessment(assessment)
      setActiveTab('assessment')

      const assessmentMessage: Message = {
        role: 'assistant',
        content: `🎯 **${skill.toUpperCase()} Skill Assessment Started**

I've prepared a comprehensive assessment to evaluate your ${skill} skills. This adaptive test will:

• Assess your current skill level
• Identify strengths and areas for improvement
• Provide personalized learning recommendations
• Track your progress over time

**Assessment Details:**
• Questions: ${config.questionCount}
• Time Limit: ${config.timeLimit / 60} minutes
• Adaptive scoring based on your performance

The assessment is now active in the Assessment tab. Good luck! 🚀`,
        timestamp: new Date(),
        type: 'assessment',
        data: { assessment }
      }

      setMessages(prev => [...prev, assessmentMessage])
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Unable to start ${skill} assessment. Please try again or choose a different skill.`,
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleProgressRequest = async () => {
    try {
      const skillProgress = await clientLearningProgressService.getUserProgress(profile.id!)
      const analytics = await clientLearningProgressService.getStudyAnalytics(profile.id!, 30)

      const progressMessage: Message = {
        role: 'assistant',
        content: generateProgressReport(skillProgress, analytics),
        timestamp: new Date(),
        type: 'progress',
        data: { skillProgress, analytics }
      }

      setMessages(prev => [...prev, progressMessage])
      setActiveTab('progress')
    } catch (error) {
      console.error('Error fetching progress:', error)
    }
  }

  const generateProgressReport = (skillProgress: LearningProgress[], analytics: any): string => {
    const totalSkills = skillProgress.length
    const completedMilestones = skillProgress.reduce((sum, skill) => 
      sum + skill.milestones.filter(m => m.completed).length, 0)
    const totalMilestones = skillProgress.reduce((sum, skill) => sum + skill.milestones.length, 0)

    return `📈 **Your Learning Progress Report**

**Overall Statistics:**
• Active Skills: ${totalSkills}
• Total Study Hours: ${analytics.totalHours.toFixed(1)}
• Current Streak: ${analytics.streakDays} days 🔥
• Milestones Completed: ${completedMilestones}/${totalMilestones}
• Average Productivity: ${analytics.averageProductivity.toFixed(1)}/10

**Skill Progress:**
${skillProgress.map(skill => 
  `• **${skill.skillName}**: ${skill.currentScore}% (${skill.hoursSpent.toFixed(1)}h)`
).join('\n') || '• No skills being tracked yet'}

**Recent Achievements:**
${analytics.topAchievements.map((achievement: string) => `🏆 ${achievement}`).join('\n') || '• Complete your first study session to earn achievements!'}

Keep up the great work! 🌟`
  }

  const handleLearningPathRequest = async (message: string) => {
    const aiResponse = await getAIResponse(message, {
      type: 'learning_path',
      profile,
      skillGaps,
      jobTitle,
      dashboardData
    })

    const pathMessage: Message = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      type: 'recommendation'
    }

    setMessages(prev => [...prev, pathMessage])
  }

  const handleResourceRequest = async (message: string) => {
    const response = await getAIResponse(message, {
      type: 'resources',
      profile,
      skillGaps,
      jobTitle
    })

    const resourceMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      type: 'recommendation'
    }

    setMessages(prev => [...prev, resourceMessage])
    setActiveTab('resources')
  }

  const handleGeneralQuery = async (message: string) => {
    const response = await getAIResponse(message, {
      type: 'general',
      profile,
      skillGaps,
      jobTitle,
      dashboardData
    })

    const generalMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, generalMessage])
  }

  const getAIResponse = async (message: string, context: any): Promise<string> => {
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context })
      })

      if (!response.ok) throw new Error('AI API error')

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('AI Response Error:', error)
      return getIntelligentFallback(message, context)
    }
  }

  const getIntelligentFallback = (message: string, context: any): string => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('learn') || lowerMessage.includes('plan')) {
      return `📚 **Personalized Learning Plan for ${context.jobTitle || 'Software Developer'}**

Based on your profile and progress, here's your recommended learning path:

**Immediate Focus (Next 2-4 weeks):**
${context.skillGaps?.slice(0, 3).map((gap: string) => `• ${gap} - Foundation building`).join('\n') || '• Core programming fundamentals\n• Data structures and algorithms\n• Web development basics'}

**Medium-term Goals (1-3 months):**
• Build 3-5 portfolio projects
• Complete relevant online courses
• Contribute to open-source projects
• Practice coding challenges daily

**Advanced Objectives (3-6 months):**
• System design and architecture
• Advanced frameworks and tools
• Technical interview preparation
• Professional networking and mentorship

**Recommended Resources:**
• Free: freeCodeCamp, MDN Web Docs, official documentation
• Paid: Udemy, Pluralsight, Frontend Masters
• Practice: LeetCode, HackerRank, CodePen

Would you like me to create specific milestones for any of these areas?`
    }

    return `I understand you're asking about: "${message}". While I'm having connectivity issues, I can still help you with learning plans, skill assessments, progress tracking, and resource recommendations. Please try asking a more specific question!`
  }

  const startStudySession = async (skill: string, focusAreas: string[]) => {
    try {
      const session = await clientLearningProgressService.startStudySession(profile.id!, skill, focusAreas)
      setActiveSession(session)
      
      const sessionMessage: Message = {
        role: 'assistant',
        content: `⏱️ **Study Session Started**\n\nSkill: ${skill}\nFocus Areas: ${focusAreas.join(', ')}\n\nGood luck with your study session! Remember to take breaks and stay focused. 🎯`,
        timestamp: new Date(),
        type: 'text'
      }
      
      setMessages(prev => [...prev, sessionMessage])
    } catch (error) {
      console.error('Error starting study session:', error)
    }
  }

  const endStudySession = async (productivity: number, notes: string) => {
    if (!activeSession) return

    try {
      await clientLearningProgressService.endStudySession(activeSession.id, productivity, notes, ['Completed study session'])
      setActiveSession(null)
      
      const endMessage: Message = {
        role: 'assistant',
        content: `✅ **Study Session Completed**\n\nGreat job! Your session has been recorded. Productivity: ${productivity}/10\n\nNotes: ${notes}\n\n🏆 Achievement unlocked: Consistent Learner`,
        timestamp: new Date(),
        type: 'text'
      }
      
      setMessages(prev => [...prev, endMessage])
      
      // Refresh dashboard data
      await initializeStudyPlanner()
    } catch (error) {
      console.error('Error ending study session:', error)
    }
  }

  const quickActions = [
    { 
      label: 'Assess React Skills', 
      action: () => setInputMessage('Assess my React skills'),
      icon: '🎯'
    },
    { 
      label: 'Show My Progress', 
      action: () => setInputMessage('Show my learning progress'),
      icon: '📈'
    },
    { 
      label: 'Create Study Plan', 
      action: () => setInputMessage('Create a study plan for JavaScript'),
      icon: '📚'
    },
    { 
      label: 'Find Resources', 
      action: () => setInputMessage('Show me TypeScript learning resources'),
      icon: '📖'
    },
    { 
      label: 'Start Study Session', 
      action: () => startStudySession('React', ['Components', 'Hooks']),
      icon: '⏱️'
    },
    { 
      label: 'Set Weekly Goal', 
      action: () => setInputMessage('Help me set a weekly learning goal'),
      icon: '🎯'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🎓 AI Study Planner Pro</h2>
            <p className="text-blue-100">Personalized learning for {profile.name}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{dashboardData?.currentStreak || 0}</div>
            <div className="text-blue-100">Day Streak 🔥</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'chat', label: 'Chat', icon: '💬' },
          { key: 'progress', label: 'Progress', icon: '📈' },
          { key: 'assessment', label: 'Assessment', icon: '🎯' },
          { key: 'resources', label: 'Resources', icon: '📚' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3 px-4 text-center transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="h-96 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Quick Actions */}
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600 mb-3">Quick actions:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="px-3 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors border shadow-sm"
                  >
                    <span className="mr-1">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                >
                  <div
                    className={`inline-block max-w-[85%] p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900 border'
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
                  <div className="inline-block bg-gray-100 text-gray-900 border p-3 rounded-lg">
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
            <div className="p-4 border-t bg-gray-50">
              <div className="flex space-x-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask about assessments, progress, study plans, or resources..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="p-6 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">📈 Learning Progress</h3>
            {dashboardData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{dashboardData.totalHours.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Total Hours</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.currentStreak}</div>
                    <div className="text-sm text-gray-600">Day Streak</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{dashboardData.skillsInProgress}</div>
                    <div className="text-sm text-gray-600">Skills Learning</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600">{dashboardData.weeklyProgress.toFixed(0)}%</div>
                    <div className="text-sm text-gray-600">Weekly Goal</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Skill Progress</h4>
                  <div className="space-y-2">
                    {dashboardData.skillProgress.map((skill, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{skill.skillName}</span>
                          <span className="text-sm text-gray-600">{skill.currentScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${skill.currentScore}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {skill.hoursSpent.toFixed(1)} hours • {skill.milestones.filter(m => m.completed).length}/{skill.milestones.length} milestones
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">Loading progress data...</div>
            )}
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="p-6 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">🎯 Skill Assessment</h3>
            {currentAssessment ? (
              <AssessmentInterface assessment={currentAssessment} onComplete={() => setCurrentAssessment(null)} />
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">No active assessment. Start one by asking for a skill assessment in the chat!</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['React', 'JavaScript', 'TypeScript', 'Python', 'CSS', 'Node.js'].map(skill => (
                    <button
                      key={skill}
                      onClick={() => setInputMessage(`Assess my ${skill} skills`)}
                      className="p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      Test {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="p-6 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">📚 Learning Resources</h3>
            <ResourcesPanel skillGaps={skillGaps} targetRole={jobTitle || 'Software Developer'} />
          </div>
        )}
      </div>

      {/* Active Study Session Indicator */}
      {activeSession && (
        <div className="bg-green-50 border-t border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-700 font-medium">
                Active Session: {activeSession.skill}
              </span>
            </div>
            <button
              onClick={() => {
                const productivity = 8 // Could be from a form
                const notes = 'Productive study session'
                endStudySession(productivity, notes)
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              End Session
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Assessment Interface Component
function AssessmentInterface({ assessment, onComplete }: { assessment: AssessmentSession, onComplete: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>('')
  const [timeLeft, setTimeLeft] = useState(assessment.config.timeLimit)

  useEffect(() => {
    loadCurrentQuestion()
  }, [assessment])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onComplete])

  const loadCurrentQuestion = async () => {
    const question = await clientAdvancedSkillAssessment.getCurrentQuestion(assessment.id)
    setCurrentQuestion(question)
    setSelectedAnswer('')
  }

  const submitAnswer = async () => {
    if (!currentQuestion || !selectedAnswer) return

    const result = await clientAdvancedSkillAssessment.submitAnswer(
      assessment.id,
      currentQuestion.id,
      selectedAnswer,
      30, // timeSpent
      3   // confidence
    )

    if (result.assessmentComplete) {
      onComplete()
    } else {
      setCurrentQuestion(result.nextQuestion)
      setSelectedAnswer('')
    }
  }

  if (!currentQuestion) {
    return <div className="text-center">Assessment completed! Check your results in the chat.</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Question {assessment.currentQuestionIndex + 1} of {assessment.questions.length}
        </span>
        <span className="text-sm text-gray-600">
          Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">{currentQuestion.question}</h4>
        
        {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option: string, index: number) => (
              <label key={index} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value={index}
                  checked={selectedAnswer === index}
                  onChange={(e) => setSelectedAnswer(Number(e.target.value))}
                  className="text-blue-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.type !== 'multiple-choice' && (
          <textarea
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            placeholder="Enter your answer..."
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={3}
          />
        )}
      </div>

      <button
        onClick={submitAnswer}
        disabled={!selectedAnswer}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Submit Answer
      </button>
    </div>
  )
}

// Resources Panel Component
function ResourcesPanel({ skillGaps, targetRole }: { skillGaps: string[], targetRole: string }) {
  const resources = [
    {
      category: 'Free Courses',
      items: [
        { name: 'freeCodeCamp', url: 'https://freecodecamp.org', description: 'Full-stack web development' },
        { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', description: 'Web technologies reference' },
        { name: 'JavaScript.info', url: 'https://javascript.info', description: 'Modern JavaScript tutorial' }
      ]
    },
    {
      category: 'Premium Platforms',
      items: [
        { name: 'Udemy', url: 'https://udemy.com', description: 'Project-based learning' },
        { name: 'Pluralsight', url: 'https://pluralsight.com', description: 'Technology skills platform' },
        { name: 'Frontend Masters', url: 'https://frontendmasters.com', description: 'Advanced frontend topics' }
      ]
    },
    {
      category: 'Practice Platforms',
      items: [
        { name: 'LeetCode', url: 'https://leetcode.com', description: 'Algorithm practice' },
        { name: 'HackerRank', url: 'https://hackerrank.com', description: 'Coding challenges' },
        { name: 'CodePen', url: 'https://codepen.io', description: 'Frontend experimentation' }
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900">Recommended for {targetRole}</h4>
        <p className="text-blue-700 text-sm">Focus areas: {skillGaps.join(', ') || 'General development skills'}</p>
      </div>

      {resources.map((category, index) => (
        <div key={index}>
          <h4 className="font-medium mb-3">{category.category}</h4>
          <div className="space-y-2">
            {category.items.map((item, itemIndex) => (
              <div key={itemIndex} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{item.name}</h5>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Visit
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
