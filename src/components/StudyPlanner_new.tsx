'use client'

import React, { useState, useRef, useEffect } from 'react'
import { UserProfile } from '@/types'

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
}

interface StudyPlan {
  skill: string
  priority: 'High' | 'Medium' | 'Low'
  estimatedTime: string
  resources: {
    courses: string[]
    projects: string[]
    documentation: string[]
  }
  milestones: string[]
}

export default function StudyPlanner({ profile, skillGaps = [], jobTitle, lastAnalysis, onAnalysisUpdate }: StudyPlannerProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi ${profile.name || 'there'}! 👋 I'm your AI Career Coach. ${
        skillGaps.length > 0 
          ? `I see you've analyzed a position for ${jobTitle} and identified ${skillGaps.length} skill gaps. Let me help you create a focused study plan!`
          : "I can help you create personalized study plans. Analyze a job posting first to get targeted recommendations, or tell me about your career goals!"
      }`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [studyPlan, setStudyPlan] = useState<StudyPlan[]>([])
  const [showStudyPlan, setShowStudyPlan] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Auto-generate study plan if skill gaps are provided
  useEffect(() => {
    if (skillGaps.length > 0 && !showStudyPlan) {
      const plan = generateStudyPlan(skillGaps)
      setStudyPlan(plan)
      setShowStudyPlan(true)
    }
  }, [skillGaps, showStudyPlan])

  const generateStudyPlan = (skills: string[]): StudyPlan[] => {
    return skills.map(skill => {
      const resources = {
        courses: [
          `Complete ${skill} Course on Coursera`,
          `${skill} Bootcamp on Udemy`,
          `Advanced ${skill} on Pluralsight`
        ],
        projects: [
          `Build a project using ${skill}`,
          `Contribute to ${skill} open source`,
          `Create ${skill} tutorial blog post`
        ],
        documentation: [
          `Official ${skill} documentation`,
          `${skill} best practices guide`,
          `${skill} community resources`
        ]
      }

      return {
        skill,
        priority: Math.random() > 0.5 ? 'High' : 'Medium',
        estimatedTime: ['2-3 weeks', '1 month', '3-4 weeks', '1-2 months'][Math.floor(Math.random() * 4)],
        resources,
        milestones: [
          `Understand ${skill} fundamentals`,
          `Complete first ${skill} project`,
          `Build portfolio project with ${skill}`,
          `Apply ${skill} in real-world scenario`
        ]
      }
    })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Enhanced AI response with real data
    setTimeout(() => {
      let aiResponse = ''

      if (inputMessage.toLowerCase().includes('study plan') || inputMessage.toLowerCase().includes('learn')) {
        if (skillGaps.length > 0) {
          const plan = generateStudyPlan(skillGaps)
          setStudyPlan(plan)
          setShowStudyPlan(true)
          aiResponse = `Perfect! I've created a personalized study plan for you based on your analysis of the ${jobTitle} position. The key skills to focus on are: ${skillGaps.join(', ')}. I estimate about ${Math.ceil(skillGaps.length * 3)} weeks of focused study should significantly improve your candidacy! 📚`
        } else {
          aiResponse = `I'd love to help you create a study plan! First, analyze a job posting in the Jobs tab to identify specific skill gaps, or tell me what role you're targeting and I can suggest a general learning path. 🎯`
        }
      } else if (inputMessage.toLowerCase().includes('time') || inputMessage.toLowerCase().includes('how long')) {
        if (skillGaps.length > 0) {
          aiResponse = `Based on your analysis of the ${jobTitle} role and the ${skillGaps.length} skills gaps identified, I estimate ${Math.ceil(skillGaps.length * 3)}-${Math.ceil(skillGaps.length * 4)} weeks of focused study. We can break this down: ${skillGaps.slice(0, 2).join(' (3-4 weeks), ')} (3-4 weeks). Would you like me to create a detailed timeline? 📅`
        } else {
          aiResponse = `Study timelines depend on your target role and current skills. Generally, 8-12 weeks of focused learning can make a significant difference. Analyze a job posting first so I can give you a more precise estimate! ⏱️`
        }
      } else if (inputMessage.toLowerCase().includes('priority') || inputMessage.toLowerCase().includes('first')) {
        if (skillGaps.length > 0) {
          aiResponse = `Great question! For the ${jobTitle} role, I recommend starting with: **${skillGaps[0]}** as your top priority. This skill appeared prominently in the job requirements and will give you the biggest impact. Then focus on: ${skillGaps.slice(1, 3).join(' and ')}. Would you like specific learning resources for ${skillGaps[0]}? 🎯`
        } else {
          aiResponse = `Priority depends on your target role! Common high-impact skills are: React/TypeScript for frontend, Node.js/Python for backend, or AWS/Docker for cloud/DevOps. What type of role interests you most? 🤔`
        }
      } else if (inputMessage.toLowerCase().includes('project') || inputMessage.toLowerCase().includes('portfolio')) {
        if (skillGaps.length > 0 && jobTitle) {
          aiResponse = `Excellent idea! For the ${jobTitle} position, I suggest building a project that demonstrates: ${skillGaps.slice(0, 2).join(' and ')}. For example: a full-stack application using ${skillGaps[0]} that solves a real problem. This will show employers you can apply these skills practically! 💼`
        } else {
          aiResponse = `Portfolio projects are crucial! I recommend building 2-3 projects that showcase different skills. Consider: a responsive web app, an API backend, and maybe a data visualization or mobile app. What type of development interests you most? 🚀`
        }
      } else if (inputMessage.toLowerCase().includes('resource') || inputMessage.toLowerCase().includes('course')) {
        if (skillGaps.length > 0) {
          aiResponse = `Here are my recommended resources for ${skillGaps[0]}: 
          
📚 **Courses:** Coursera, Udemy, Pluralsight 
🎮 **Interactive:** Codecademy, FreeCodeCamp
📖 **Documentation:** Official docs + MDN Web Docs
🎥 **YouTube:** Tech channels + tutorials
💻 **Practice:** LeetCode, HackerRank

Would you like specific links for any of these? I can also suggest free vs paid options!`
        } else {
          aiResponse = `I can recommend great learning resources! Popular platforms include: Coursera (university courses), Udemy (practical skills), FreeCodeCamp (free & comprehensive), and YouTube (tutorials). What skill are you most interested in learning? 📚`
        }
      } else {
        aiResponse = `That's a great point! I'm here to help with study planning, skill development, and career guidance. I can help you with:

🎯 **Skill Gap Analysis** - From job requirements
📚 **Study Plans** - Personalized learning paths  
⏱️ **Timeline Planning** - Realistic schedules
💼 **Project Ideas** - Portfolio building
📖 **Resource Recommendations** - Courses & tutorials

What would you like to explore first? If you haven't already, try analyzing a job in the Jobs tab for personalized recommendations!`
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const generateQuickPlan = () => {
    if (skillGaps.length === 0) {
      // Generate a general plan if no job analysis exists
      const generalSkills = ['React', 'TypeScript', 'Node.js', 'Database Design']
      const plan = generateStudyPlan(generalSkills)
      setStudyPlan(plan)
      setShowStudyPlan(true)
      
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I've created a general study plan focusing on high-demand web development skills. For more targeted recommendations, analyze a specific job posting in the Jobs tab! 🎯",
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, aiMessage])
    } else {
      const plan = generateStudyPlan(skillGaps)
      setStudyPlan(plan)
      setShowStudyPlan(true)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🤖 AI Career Coach</h2>
        
        {skillGaps.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">📊 Latest Analysis: {jobTitle}</h3>
            <p className="text-blue-700 text-sm mb-2">Skill gaps identified: {skillGaps.join(', ')}</p>
            {lastAnalysis && (
              <p className="text-blue-600 text-sm">Match score: {lastAnalysis.skill_match_percentage}%</p>
            )}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            onClick={generateQuickPlan}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📚 Generate Study Plan
          </button>
          {skillGaps.length === 0 && (
            <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
              💡 Analyze a job posting first for personalized recommendations
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Career Guidance Chat</h3>
          
          <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 space-y-3">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about study plans, skills, or career advice..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
        </div>

        {/* Study Plan */}
        {showStudyPlan && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Personalized Study Plan</h3>
            
            <div className="space-y-4">
              {studyPlan.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{item.skill}</h4>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority} Priority
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {item.estimatedTime}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">📚 Top Resources:</span>
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {item.resources.courses.slice(0, 2).map((course, i) => (
                          <li key={i}>{course}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">🎯 Key Milestones:</span>
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {item.milestones.slice(0, 2).map((milestone, i) => (
                          <li key={i}>{milestone}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>🎯 Success Tip:</strong> Focus on one skill at a time for maximum retention. 
                Build projects as you learn to reinforce concepts!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
