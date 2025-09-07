'use client'

import React, { useState, useRef, useEffect } from 'react'
import { UserProfile } from '@/types'
import EnhancedAIService from '@/lib/enhanced-ai-service'
import SkillAssessor, { SkillAssessment } from '@/lib/skill-assessor'
import LearningPathGenerator, { LearningPath } from '@/lib/learning-path-generator'
import { 
  Send, BookOpen, Target, Award, TrendingUp, Brain, Lightbulb, 
  CheckCircle, Users, Globe, Play, Pause, RotateCcw, Zap, 
  Calendar, Clock, Trophy, Star, Gauge
} from 'lucide-react'

interface StudyPlannerProps {
  profile: UserProfile
  skillGaps?: string[]
  jobTitle?: string
  lastAnalysis?: any
  onAnalysisUpdate?: (analysis: { skillGaps: string[], jobTitle: string, company: string, analysis: any } | null) => void
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  assessment?: SkillAssessment
  learningPath?: LearningPath
  messageType?: 'normal' | 'assessment' | 'learning_path' | 'progress'
}

interface StudyProgress {
  currentSkill: string
  completedTasks: number
  totalTasks: number
  currentStreak: number
  weeklyGoal: number
  lastActiveDate: string
  skillAssessments: SkillAssessment[]
  learningPaths: LearningPath[]
  milestones: Array<{
    id: string
    title: string
    completed: boolean
    date?: Date
  }>
}

interface QuizSession {
  active: boolean
  skill: string
  questions: any[]
  currentQuestion: number
  answers: number[]
  startTime: Date
}

export default function StudyPlanner({ profile, skillGaps = [], jobTitle, lastAnalysis, onAnalysisUpdate }: StudyPlannerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null)
  const [studyProgress, setStudyProgress] = useState<StudyProgress>({
    currentSkill: 'general',
    completedTasks: 0,
    totalTasks: 10,
    currentStreak: 0,
    weeklyGoal: 5,
    lastActiveDate: new Date().toISOString(),
    skillAssessments: [],
    learningPaths: [],
    milestones: []
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: `Welcome to your AI-powered Study Planner! 🚀

I'm your personal career mentor, equipped with:
• **Skill Assessment**: Intelligent testing to identify your level
• **Adaptive Learning Paths**: Personalized roadmaps based on your goals
• **Progress Analytics**: Track your growth and optimize your journey
• **Market Intelligence**: Real-time insights on industry demands

**Quick Start Options:**
• "Assess my React skills" → Get intelligent skill evaluation
• "Create learning path for Python" → Build personalized roadmap
• "Show my progress" → Track your learning journey
• "What should I learn for 2025?" → Get market-informed advice

${skillGaps.length > 0 ? `\n🎯 **Based on your job analysis**, I see gaps in: ${skillGaps.slice(0, 3).join(', ')}. Ready to tackle these strategically?` : ''}

What would you like to focus on today?`,
      timestamp: new Date(),
      messageType: 'normal'
    }
    
    setMessages([welcomeMessage])
  }, [skillGaps])

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Check if this is a quiz response
      if (quizSession && quizSession.active) {
        handleQuizResponse(userMessage.content)
        return
      }

      // Generate AI response using enhanced service
      const context = {
        user: profile,
        currentSkill: studyProgress.currentSkill,
        skillGaps,
        jobTitle,
        lastAnalysis
      }

      const aiResponse = await EnhancedAIService.generateStudyPlannerResponse(
        userMessage.content,
        context,
        studyProgress
      )

      // Check if response should trigger special actions
      const messageType = detectMessageType(userMessage.content)
      let specialData = {}

      if (messageType === 'assessment') {
        const skill = extractSkillFromMessage(userMessage.content)
        if (skill) {
          const assessment = await EnhancedAIService.createSkillAssessment(skill)
          specialData = { assessment }
          // Start quiz session
          setQuizSession({
            active: true,
            skill,
            questions: assessment.questions,
            currentQuestion: 0,
            answers: [],
            startTime: new Date()
          })
        }
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        messageType,
        ...specialData
      }

      setMessages(prev => [...prev, aiMessage])

      // Update progress tracking
      updateProgress(userMessage.content, messageType)

    } catch (error) {
      console.error('Error generating AI response:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or rephrase your question. I'm here to help with your learning journey! 🚀",
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle quiz responses
  const handleQuizResponse = async (response: string) => {
    if (!quizSession) return

    const answerIndex = parseInt(response) - 1
    if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= 4) {
      const invalidMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "Please respond with a number (1-4) corresponding to your answer choice.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, invalidMessage])
      setIsLoading(false)
      return
    }

    const newAnswers = [...quizSession.answers, answerIndex]
    const nextQuestion = quizSession.currentQuestion + 1

    if (nextQuestion < quizSession.questions.length) {
      // Continue with next question
      setQuizSession({
        ...quizSession,
        currentQuestion: nextQuestion,
        answers: newAnswers
      })

      const nextQuestionMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: `**Question ${nextQuestion + 1}/${quizSession.questions.length}:**

${quizSession.questions[nextQuestion].question}

1. ${quizSession.questions[nextQuestion].options[0]}
2. ${quizSession.questions[nextQuestion].options[1]}
3. ${quizSession.questions[nextQuestion].options[2]}
4. ${quizSession.questions[nextQuestion].options[3]}

Type the number of your answer (1-4):`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, nextQuestionMessage])
    } else {
      // Quiz completed - process results
      try {
        const assessment = await EnhancedAIService.processSkillAssessment(quizSession.skill, newAnswers)
        
        // Generate learning path based on assessment
        const learningPath = await EnhancedAIService.generateLearningPath(assessment, 'intermediate')

        const resultsMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: generateAssessmentResults(assessment, learningPath),
          timestamp: new Date(),
          assessment,
          learningPath,
          messageType: 'assessment'
        }

        setMessages(prev => [...prev, resultsMessage])

        // Update progress with assessment
        setStudyProgress(prev => ({
          ...prev,
          skillAssessments: [...prev.skillAssessments, assessment],
          learningPaths: [...prev.learningPaths, learningPath],
          currentSkill: quizSession.skill
        }))

        // End quiz session
        setQuizSession(null)

      } catch (error) {
        console.error('Error processing assessment:', error)
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: "I had trouble processing your assessment results. Let's try again or feel free to ask me anything else!",
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
        setQuizSession(null)
      }
    }

    setIsLoading(false)
  }

  // Quick action handlers
  const handleQuickAction = async (action: string) => {
    setInputMessage(action)
    // Auto-send after a brief delay to show the message
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  // Helper functions
  const detectMessageType = (message: string): 'normal' | 'assessment' | 'learning_path' | 'progress' => {
    const lower = message.toLowerCase()
    if (lower.includes('assess') || lower.includes('test') || lower.includes('quiz')) return 'assessment'
    if (lower.includes('learning path') || lower.includes('roadmap') || lower.includes('study plan')) return 'learning_path'
    if (lower.includes('progress') || lower.includes('track') || lower.includes('stats')) return 'progress'
    return 'normal'
  }

  const extractSkillFromMessage = (message: string): string | null => {
    const skills = ['react', 'javascript', 'typescript', 'python', 'node', 'css', 'html', 'vue', 'angular', 'nextjs']
    const lower = message.toLowerCase()
    return skills.find(skill => lower.includes(skill)) || null
  }

  const updateProgress = (message: string, messageType: string) => {
    const today = new Date().toISOString().split('T')[0]
    const lastActiveDay = studyProgress.lastActiveDate.split('T')[0]
    
    setStudyProgress(prev => ({
      ...prev,
      completedTasks: prev.completedTasks + 1,
      currentStreak: today === lastActiveDay ? prev.currentStreak : prev.currentStreak + 1,
      lastActiveDate: new Date().toISOString()
    }))
  }

  const generateAssessmentResults = (assessment: SkillAssessment, learningPath: LearningPath): string => {
    return `🎯 **${assessment.skill.toUpperCase()} Skill Assessment Results**

**Your Level**: ${assessment.level.charAt(0).toUpperCase() + assessment.level.slice(1)} (${assessment.confidence}% confidence)

**💪 Strengths:**
${assessment.strengths.map(s => `• ${s}`).join('\n')}

**🎯 Growth Areas:**
${assessment.gaps.map(g => `• ${g}`).join('\n')}

**📈 Recommended Next Steps:**
${assessment.recommendedStartPoint}

**⏱️ Estimated Time to Next Level:** ${assessment.estimatedTimeToNextLevel}

**🚀 I've created a personalized learning path for you!**

**${learningPath.title}**
📊 **Total Time**: ${learningPath.totalEstimatedTime}
🎯 **Goal**: ${learningPath.currentLevel} → ${learningPath.targetLevel}
📚 **Steps**: ${learningPath.steps.length} structured learning phases
🏆 **Milestones**: ${learningPath.milestones.length} achievement checkpoints

Would you like me to show you the detailed week-by-week roadmap?`
  }

  // Calculate progress percentages
  const overallProgress = Math.round((studyProgress.completedTasks / studyProgress.totalTasks) * 100)
  const weeklyProgress = Math.round((studyProgress.completedTasks / studyProgress.weeklyGoal) * 100)

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Study Planner</h2>
              <p className="text-blue-100">Your intelligent learning companion</p>
            </div>
          </div>
          
          {/* Progress Dashboard */}
          <div className="hidden md:flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <div className="text-sm text-blue-100">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{studyProgress.currentStreak}</div>
              <div className="text-sm text-blue-100">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{studyProgress.skillAssessments.length}</div>
              <div className="text-sm text-blue-100">Skills Assessed</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => handleQuickAction('Assess my React skills')}
            className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            🧠 Skill Assessment
          </button>
          <button
            onClick={() => handleQuickAction('Create learning path for JavaScript')}
            className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            🗺️ Learning Path
          </button>
          <button
            onClick={() => handleQuickAction('Show my progress')}
            className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            📊 Progress Check
          </button>
          <button
            onClick={() => handleQuickAction('What should I learn for 2025?')}
            className="px-3 py-1 bg-white/20 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            🎯 Career Advice
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">AI Study Coach</span>
                  {message.messageType && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      message.messageType === 'assessment' ? 'bg-green-100 text-green-700' :
                      message.messageType === 'learning_path' ? 'bg-purple-100 text-purple-700' :
                      message.messageType === 'progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {message.messageType.replace('_', ' ')}
                    </span>
                  )}
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Quiz Question Interface */}
              {quizSession && quizSession.active && message.type === 'ai' && 
               message.content.includes('Question') && message.id === messages[messages.length - 1]?.id && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center mb-2">
                    <div className="text-sm text-gray-600">
                      Question {quizSession.currentQuestion + 1} of {quizSession.questions.length}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((quizSession.currentQuestion + 1) / quizSession.questions.length) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-xs opacity-70 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-sm">AI is thinking...</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              quizSession?.active 
                ? "Type your answer (1-4)..." 
                : "Ask me about learning paths, skill assessment, career advice..."
            }
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Smart Suggestions */}
        {!quizSession?.active && messages.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => handleQuickAction('What should I focus on next?')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              What's next?
            </button>
            <button
              onClick={() => handleQuickAction('Show me resources for React')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Need resources
            </button>
            <button
              onClick={() => handleQuickAction('How am I progressing?')}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              Check progress
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
