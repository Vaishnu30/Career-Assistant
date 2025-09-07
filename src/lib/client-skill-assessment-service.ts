// Client-side service for skill assessment (API wrapper)
// This replaces direct MongoDB calls in client components

export interface AssessmentQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'code' | 'short-answer'
  options?: string[]
  correctAnswer: string | number
  explanation: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  skill: string
  timeLimit?: number
}

export interface AssessmentConfig {
  skill: string
  targetLevel: 'beginner' | 'intermediate' | 'advanced'
  questionCount: number
  timeLimit: number
  adaptiveScoring: boolean
  categories: string[]
}

export interface AssessmentSession {
  id: string
  userId: string
  config: AssessmentConfig
  questions: AssessmentQuestion[]
  currentQuestionIndex: number
  responses: AssessmentResponse[]
  startTime: Date
  endTime?: Date
  status: 'active' | 'completed' | 'expired'
  score?: number
  report?: AssessmentReport
}

export interface AssessmentResponse {
  questionId: string
  answer: string | number
  timeSpent: number
  confidence: number
  isCorrect?: boolean
}

export interface AssessmentReport {
  overallScore: number
  categoryScores: Record<string, number>
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  nextSteps: string[]
  certificationsToConsider: string[]
  estimatedLevel: 'beginner' | 'intermediate' | 'advanced'
  improvementAreas: string[]
}

interface AssessmentSubmissionResult {
  assessmentComplete: boolean
  nextQuestion?: AssessmentQuestion
  currentScore?: number
  feedback?: string
}

class ClientAdvancedSkillAssessment {
  private baseUrl = '/api'

  async createAssessment(userId: string, config: AssessmentConfig): Promise<AssessmentSession> {
    try {
      const response = await fetch(`${this.baseUrl}/skill-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, config })
      })
      if (!response.ok) throw new Error('Failed to create assessment')
      return await response.json()
    } catch (error) {
      console.error('Error creating assessment:', error)
      return this.getMockAssessmentSession(userId, config)
    }
  }

  async getCurrentQuestion(assessmentId: string): Promise<AssessmentQuestion | null> {
    try {
      const response = await fetch(`${this.baseUrl}/skill-assessment/${assessmentId}/current`)
      if (!response.ok) throw new Error('Failed to get current question')
      return await response.json()
    } catch (error) {
      console.error('Error getting current question:', error)
      return this.getMockQuestion()
    }
  }

  async submitAnswer(
    assessmentId: string, 
    questionId: string, 
    answer: string | number, 
    timeSpent: number, 
    confidence: number
  ): Promise<AssessmentSubmissionResult> {
    try {
      const response = await fetch(`${this.baseUrl}/skill-assessment/${assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, answer, timeSpent, confidence })
      })
      if (!response.ok) throw new Error('Failed to submit answer')
      return await response.json()
    } catch (error) {
      console.error('Error submitting answer:', error)
      return this.getMockSubmissionResult()
    }
  }

  async getAssessmentReport(assessmentId: string): Promise<AssessmentReport> {
    try {
      const response = await fetch(`${this.baseUrl}/skill-assessment/${assessmentId}/report`)
      if (!response.ok) throw new Error('Failed to get assessment report')
      return await response.json()
    } catch (error) {
      console.error('Error getting assessment report:', error)
      return this.getMockAssessmentReport()
    }
  }

  async getUserAssessmentHistory(userId: string, skill?: string): Promise<AssessmentSession[]> {
    try {
      const url = skill 
        ? `${this.baseUrl}/skill-assessment/history?userId=${userId}&skill=${skill}`
        : `${this.baseUrl}/skill-assessment/history?userId=${userId}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to get assessment history')
      return await response.json()
    } catch (error) {
      console.error('Error getting assessment history:', error)
      return []
    }
  }

  async getAvailableSkills(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/skill-assessment/skills`)
      if (!response.ok) throw new Error('Failed to get available skills')
      return await response.json()
    } catch (error) {
      console.error('Error getting available skills:', error)
      return this.getMockAvailableSkills()
    }
  }

  async pauseAssessment(assessmentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/skill-assessment/${assessmentId}/pause`, {
        method: 'POST'
      })
      return response.ok
    } catch (error) {
      console.error('Error pausing assessment:', error)
      return false
    }
  }

  async resumeAssessment(assessmentId: string): Promise<AssessmentSession | null> {
    try {
      const response = await fetch(`${this.baseUrl}/skill-assessment/${assessmentId}/resume`, {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to resume assessment')
      return await response.json()
    } catch (error) {
      console.error('Error resuming assessment:', error)
      return null
    }
  }

  // Mock data methods for fallback when API is unavailable
  private getMockAssessmentSession(userId: string, config: AssessmentConfig): AssessmentSession {
    return {
      id: `assessment-${Date.now()}`,
      userId,
      config,
      questions: this.getMockQuestions(config.skill, config.questionCount),
      currentQuestionIndex: 0,
      responses: [],
      startTime: new Date(),
      status: 'active'
    }
  }

  private getMockQuestions(skill: string, count: number): AssessmentQuestion[] {
    const questions: AssessmentQuestion[] = [
      {
        id: 'q1',
        question: 'What is the primary purpose of React hooks?',
        type: 'multiple-choice',
        options: [
          'To replace class components entirely',
          'To add state and lifecycle methods to functional components',
          'To improve performance only',
          'To handle routing in React applications'
        ],
        correctAnswer: 1,
        explanation: 'React hooks allow you to use state and other React features in functional components.',
        difficulty: 'beginner',
        category: 'React Fundamentals',
        skill: 'react',
        timeLimit: 60
      },
      {
        id: 'q2',
        question: 'Which hook would you use to perform side effects in a functional component?',
        type: 'multiple-choice',
        options: [
          'useState',
          'useEffect',
          'useContext',
          'useReducer'
        ],
        correctAnswer: 1,
        explanation: 'useEffect is used for side effects like data fetching, subscriptions, or DOM manipulation.',
        difficulty: 'beginner',
        category: 'React Hooks',
        skill: 'react',
        timeLimit: 60
      },
      {
        id: 'q3',
        question: 'What does the following TypeScript code do?\n\ntype User = {\n  name: string;\n  age?: number;\n}',
        type: 'multiple-choice',
        options: [
          'Defines a User type with required name and age properties',
          'Defines a User type with required name and optional age properties',
          'Creates a User class with name and age properties',
          'Defines an interface for User objects'
        ],
        correctAnswer: 1,
        explanation: 'The ? makes the age property optional in the User type definition.',
        difficulty: 'intermediate',
        category: 'TypeScript Types',
        skill: 'typescript',
        timeLimit: 90
      }
    ]

    return questions.slice(0, Math.min(count, questions.length))
  }

  private getMockQuestion(): AssessmentQuestion {
    return {
      id: 'mock-q1',
      question: 'What is the correct way to handle state in a functional React component?',
      type: 'multiple-choice',
      options: [
        'this.setState()',
        'useState() hook',
        'this.state = {}',
        'useClass() hook'
      ],
      correctAnswer: 1,
      explanation: 'useState() is the correct hook for managing state in functional components.',
      difficulty: 'beginner',
      category: 'React Hooks',
      skill: 'react',
      timeLimit: 60
    }
  }

  private getMockSubmissionResult(): AssessmentSubmissionResult {
    return {
      assessmentComplete: false,
      nextQuestion: {
        id: 'mock-q2',
        question: 'Which method is used to update component state in React?',
        type: 'multiple-choice',
        options: [
          'updateState()',
          'setState()',
          'changeState()',
          'modifyState()'
        ],
        correctAnswer: 1,
        explanation: 'setState() is the standard method for updating component state.',
        difficulty: 'beginner',
        category: 'React Fundamentals',
        skill: 'react',
        timeLimit: 60
      },
      currentScore: 85,
      feedback: 'Correct! Great understanding of React hooks.'
    }
  }

  private getMockAssessmentReport(): AssessmentReport {
    return {
      overallScore: 78,
      categoryScores: {
        'React Fundamentals': 85,
        'React Hooks': 75,
        'State Management': 70,
        'Component Lifecycle': 80
      },
      strengths: [
        'Strong understanding of React fundamentals',
        'Good grasp of component lifecycle',
        'Solid knowledge of JSX syntax'
      ],
      weaknesses: [
        'State management patterns need improvement',
        'Advanced hooks usage could be better',
        'Performance optimization techniques'
      ],
      recommendations: [
        'Practice with useReducer and useContext',
        'Learn about React.memo and useMemo',
        'Study advanced state management patterns',
        'Practice building larger React applications'
      ],
      nextSteps: [
        'Complete advanced React course',
        'Build a project using Context API',
        'Learn about React performance optimization',
        'Practice with React testing'
      ],
      certificationsToConsider: [
        'React Developer Certification',
        'Frontend Development Certificate',
        'Modern JavaScript Certification'
      ],
      estimatedLevel: 'intermediate',
      improvementAreas: [
        'State Management',
        'Performance Optimization',
        'Testing',
        'Advanced Hooks'
      ]
    }
  }

  private getMockAvailableSkills(): string[] {
    return [
      'javascript',
      'typescript',
      'react',
      'vue',
      'angular',
      'nodejs',
      'python',
      'java',
      'css',
      'html'
    ]
  }
}

// Export singleton instance
const clientAdvancedSkillAssessment = new ClientAdvancedSkillAssessment()
export default clientAdvancedSkillAssessment
