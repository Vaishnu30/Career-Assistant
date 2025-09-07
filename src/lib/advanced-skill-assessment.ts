// Advanced Skill Assessment Engine with adaptive questioning and real-time evaluation
import LearningProgressService, { SkillAssessmentResult } from './learning-progress-service'

export interface AssessmentQuestion {
  id: string
  skill: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  type: 'multiple-choice' | 'code-completion' | 'code-review' | 'scenario' | 'practical'
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  points: number
  timeLimit: number // seconds
  tags: string[]
  prerequisites: string[]
  learningObjectives: string[]
}

export interface AssessmentConfig {
  skill: string
  targetLevel: 'beginner' | 'intermediate' | 'advanced'
  questionCount: number
  timeLimit: number
  adaptiveScoring: boolean
  categories: string[]
  focusAreas?: string[]
}

export interface AssessmentSession {
  id: string
  userId: string
  config: AssessmentConfig
  questions: AssessmentQuestion[]
  answers: AssessmentAnswer[]
  startTime: Date
  endTime?: Date
  currentQuestionIndex: number
  score: number
  maxScore: number
  completed: boolean
  adaptiveLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface AssessmentAnswer {
  questionId: string
  answer: string | number
  isCorrect: boolean
  timeSpent: number
  attempts: number
  confidence: number // 1-5 scale
}

export interface AssessmentReport {
  session: AssessmentSession
  overallScore: number
  levelAchieved: 'beginner' | 'intermediate' | 'advanced'
  categoryScores: { [category: string]: number }
  strengths: string[]
  weaknesses: string[]
  recommendations: LearningRecommendation[]
  nextSteps: string[]
  estimatedStudyTime: number
  skillGaps: string[]
  certificationsRecommended: string[]
}

export interface LearningRecommendation {
  type: 'course' | 'book' | 'video' | 'project' | 'practice'
  title: string
  provider: string
  url: string
  duration: number
  difficulty: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  prerequisites: string[]
}

class AdvancedSkillAssessment {
  private static questionBank: { [skill: string]: AssessmentQuestion[] } = {}
  private static sessions: Map<string, AssessmentSession> = new Map()

  static initializeQuestionBank() {
    // React Questions
    this.questionBank['react'] = [
      // Beginner Level
      {
        id: 'react_001',
        skill: 'react',
        category: 'Components',
        difficulty: 'beginner',
        type: 'multiple-choice',
        question: 'What is the correct way to create a functional component in React?',
        options: [
          'function MyComponent() { return <div>Hello</div>; }',
          'const MyComponent = () => { return <div>Hello</div>; }',
          'class MyComponent extends Component { render() { return <div>Hello</div>; } }',
          'Both A and B'
        ],
        correctAnswer: 3,
        explanation: 'Both function declarations and arrow functions are valid ways to create functional components.',
        points: 10,
        timeLimit: 60,
        tags: ['components', 'functional', 'syntax'],
        prerequisites: ['javascript'],
        learningObjectives: ['understand component syntax', 'differentiate component types']
      },
      {
        id: 'react_002',
        skill: 'react',
        category: 'State Management',
        difficulty: 'beginner',
        type: 'code-completion',
        question: 'Complete the useState hook to manage a counter state:\nconst [count, setCount] = _____(0);',
        correctAnswer: 'useState',
        explanation: 'useState is the React hook for managing state in functional components.',
        points: 15,
        timeLimit: 45,
        tags: ['hooks', 'state', 'useState'],
        prerequisites: ['react-basics'],
        learningObjectives: ['use useState hook', 'manage component state']
      },
      // Intermediate Level
      {
        id: 'react_003',
        skill: 'react',
        category: 'Hooks',
        difficulty: 'intermediate',
        type: 'scenario',
        question: 'You have a component that needs to fetch data when it mounts and clean up when it unmounts. Which hook combination would you use and why?',
        correctAnswer: 'useEffect with dependency array and cleanup function',
        explanation: 'useEffect with empty dependency array runs on mount, and returning a cleanup function handles unmounting.',
        points: 20,
        timeLimit: 120,
        tags: ['useEffect', 'lifecycle', 'cleanup'],
        prerequisites: ['react-hooks-basics'],
        learningObjectives: ['implement side effects', 'manage component lifecycle', 'prevent memory leaks']
      },
      // Advanced Level
      {
        id: 'react_004',
        skill: 'react',
        category: 'Performance',
        difficulty: 'advanced',
        type: 'code-review',
        question: 'Review this code and identify performance issues:\n\nconst ExpensiveComponent = ({ items }) => {\n  const expensiveValue = items.map(item => item.value * 2).reduce((a, b) => a + b, 0);\n  return <div>{expensiveValue}</div>;\n};\n\nWhat optimization would you apply?',
        correctAnswer: 'useMemo',
        explanation: 'useMemo should be used to memoize expensive calculations that depend on props.',
        points: 30,
        timeLimit: 180,
        tags: ['performance', 'useMemo', 'optimization'],
        prerequisites: ['react-hooks-advanced'],
        learningObjectives: ['optimize expensive calculations', 'understand React performance', 'apply memoization']
      }
    ]

    // JavaScript Questions
    this.questionBank['javascript'] = [
      {
        id: 'js_001',
        skill: 'javascript',
        category: 'Fundamentals',
        difficulty: 'beginner',
        type: 'multiple-choice',
        question: 'What is the difference between let, const, and var?',
        options: [
          'No difference, they are interchangeable',
          'let and const have block scope, var has function scope',
          'const cannot be reassigned, let and var can be',
          'Both B and C'
        ],
        correctAnswer: 3,
        explanation: 'let and const have block scope and const cannot be reassigned after declaration.',
        points: 10,
        timeLimit: 60,
        tags: ['variables', 'scope', 'es6'],
        prerequisites: [],
        learningObjectives: ['understand variable declarations', 'apply proper scoping']
      },
      {
        id: 'js_002',
        skill: 'javascript',
        category: 'Async Programming',
        difficulty: 'intermediate',
        type: 'code-completion',
        question: 'Complete the async function to handle errors properly:\n\nasync function fetchData() {\n  try {\n    const response = await fetch(\'/api/data\');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    _____(error);\n  }\n}',
        correctAnswer: 'console.error',
        explanation: 'Error handling in async functions should log or handle the error appropriately.',
        points: 20,
        timeLimit: 90,
        tags: ['async-await', 'error-handling', 'promises'],
        prerequisites: ['promises'],
        learningObjectives: ['handle async errors', 'use try-catch with async-await']
      }
    ]

    // TypeScript Questions
    this.questionBank['typescript'] = [
      {
        id: 'ts_001',
        skill: 'typescript',
        category: 'Types',
        difficulty: 'beginner',
        type: 'code-completion',
        question: 'Define a type for a user object with name (string) and age (number):\ntype User = _____;',
        correctAnswer: '{ name: string; age: number }',
        explanation: 'Object types in TypeScript are defined using curly braces with property names and types.',
        points: 15,
        timeLimit: 60,
        tags: ['types', 'objects', 'type-definitions'],
        prerequisites: ['javascript'],
        learningObjectives: ['define object types', 'understand TypeScript syntax']
      }
    ]
  }

  // Create a new assessment session
  static async createAssessment(userId: string, config: AssessmentConfig): Promise<AssessmentSession> {
    if (!this.questionBank[config.skill]) {
      this.initializeQuestionBank()
    }

    const questions = this.selectAdaptiveQuestions(config)
    const sessionId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const session: AssessmentSession = {
      id: sessionId,
      userId,
      config,
      questions,
      answers: [],
      startTime: new Date(),
      currentQuestionIndex: 0,
      score: 0,
      maxScore: questions.reduce((sum, q) => sum + q.points, 0),
      completed: false,
      adaptiveLevel: config.targetLevel
    }

    this.sessions.set(sessionId, session)
    return session
  }

  // Get current question for assessment
  static getCurrentQuestion(sessionId: string): AssessmentQuestion | null {
    const session = this.sessions.get(sessionId)
    if (!session || session.completed) return null

    return session.questions[session.currentQuestionIndex] || null
  }

  // Submit answer and get next question
  static async submitAnswer(
    sessionId: string, 
    questionId: string, 
    answer: string | number, 
    timeSpent: number,
    confidence: number = 3
  ): Promise<{
    isCorrect: boolean
    nextQuestion: AssessmentQuestion | null
    currentScore: number
    assessmentComplete: boolean
  }> {
    const session = this.sessions.get(sessionId)
    if (!session) throw new Error('Assessment session not found')

    const question = session.questions.find(q => q.id === questionId)
    if (!question) throw new Error('Question not found')

    const isCorrect = this.evaluateAnswer(question, answer)
    const assessmentAnswer: AssessmentAnswer = {
      questionId,
      answer,
      isCorrect,
      timeSpent,
      attempts: 1,
      confidence
    }

    session.answers.push(assessmentAnswer)
    
    if (isCorrect) {
      session.score += question.points
    }

    // Adaptive logic: adjust difficulty based on recent performance
    if (session.config.adaptiveScoring) {
      this.adjustAdaptiveLevel(session)
    }

    session.currentQuestionIndex++
    
    const assessmentComplete = session.currentQuestionIndex >= session.questions.length
    if (assessmentComplete) {
      session.completed = true
      session.endTime = new Date()
      
      // Save assessment result to database
      await this.saveAssessmentResult(session)
    }

    const nextQuestion = assessmentComplete ? null : this.getCurrentQuestion(sessionId)

    return {
      isCorrect,
      nextQuestion,
      currentScore: session.score,
      assessmentComplete
    }
  }

  // Generate comprehensive assessment report
  static async generateReport(sessionId: string): Promise<AssessmentReport> {
    const session = this.sessions.get(sessionId)
    if (!session || !session.completed) {
      throw new Error('Assessment not completed')
    }

    const overallScore = (session.score / session.maxScore) * 100
    const levelAchieved = this.determineLevelAchieved(overallScore)
    const categoryScores = this.calculateCategoryScores(session)
    const { strengths, weaknesses } = this.analyzePerformance(session, categoryScores)
    const recommendations = await this.generateRecommendations(session, weaknesses)
    const nextSteps = this.generateNextSteps(levelAchieved, weaknesses)
    const estimatedStudyTime = this.estimateStudyTime(weaknesses, levelAchieved)
    const skillGaps = this.identifySkillGaps(session, categoryScores)
    const certificationsRecommended = this.recommendCertifications(session.config.skill, levelAchieved)

    return {
      session,
      overallScore,
      levelAchieved,
      categoryScores,
      strengths,
      weaknesses,
      recommendations,
      nextSteps,
      estimatedStudyTime,
      skillGaps,
      certificationsRecommended
    }
  }

  // Private helper methods
  private static selectAdaptiveQuestions(config: AssessmentConfig): AssessmentQuestion[] {
    const allQuestions = this.questionBank[config.skill] || []
    
    // Filter by categories if specified
    let filteredQuestions = config.categories.length > 0 
      ? allQuestions.filter(q => config.categories.includes(q.category))
      : allQuestions

    // Distribute questions across difficulty levels
    const distribution = {
      beginner: Math.ceil(config.questionCount * 0.4),
      intermediate: Math.ceil(config.questionCount * 0.4),
      advanced: Math.floor(config.questionCount * 0.2)
    }

    const selectedQuestions: AssessmentQuestion[] = []
    
    Object.entries(distribution).forEach(([difficulty, count]) => {
      const questionsOfDifficulty = filteredQuestions.filter(q => q.difficulty === difficulty)
      const selected = this.shuffleArray(questionsOfDifficulty).slice(0, count)
      selectedQuestions.push(...selected)
    })

    return this.shuffleArray(selectedQuestions).slice(0, config.questionCount)
  }

  private static evaluateAnswer(question: AssessmentQuestion, answer: string | number): boolean {
    if (question.type === 'multiple-choice') {
      return Number(answer) === question.correctAnswer
    } else {
      // For text-based answers, use fuzzy matching
      const correctAnswer = String(question.correctAnswer).toLowerCase().trim()
      const userAnswer = String(answer).toLowerCase().trim()
      
      // Simple fuzzy matching - can be enhanced with more sophisticated algorithms
      return correctAnswer === userAnswer || 
             correctAnswer.includes(userAnswer) || 
             userAnswer.includes(correctAnswer)
    }
  }

  private static adjustAdaptiveLevel(session: AssessmentSession): void {
    const recentAnswers = session.answers.slice(-3) // Last 3 answers
    const recentScore = recentAnswers.filter(a => a.isCorrect).length / recentAnswers.length

    if (recentScore >= 0.8 && session.adaptiveLevel === 'beginner') {
      session.adaptiveLevel = 'intermediate'
    } else if (recentScore >= 0.8 && session.adaptiveLevel === 'intermediate') {
      session.adaptiveLevel = 'advanced'
    } else if (recentScore <= 0.4 && session.adaptiveLevel === 'advanced') {
      session.adaptiveLevel = 'intermediate'
    } else if (recentScore <= 0.4 && session.adaptiveLevel === 'intermediate') {
      session.adaptiveLevel = 'beginner'
    }
  }

  private static async saveAssessmentResult(session: AssessmentSession): Promise<void> {
    const result: Omit<SkillAssessmentResult, 'id'> = {
      skill: session.config.skill,
      score: session.score,
      maxScore: session.maxScore,
      date: session.endTime!,
      timeSpent: (session.endTime!.getTime() - session.startTime.getTime()) / 1000,
      questionsAnswered: session.answers.length,
      correctAnswers: session.answers.filter(a => a.isCorrect).length,
      weakAreas: this.identifyWeakAreas(session),
      strongAreas: this.identifyStrongAreas(session),
      recommendations: this.generateQuickRecommendations(session)
    }

    await LearningProgressService.addAssessment(session.userId, session.config.skill, result)
  }

  private static determineLevelAchieved(score: number): 'beginner' | 'intermediate' | 'advanced' {
    if (score >= 80) return 'advanced'
    if (score >= 60) return 'intermediate'
    return 'beginner'
  }

  private static calculateCategoryScores(session: AssessmentSession): { [category: string]: number } {
    const categoryScores: { [category: string]: { correct: number; total: number } } = {}

    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId)
      if (question) {
        if (!categoryScores[question.category]) {
          categoryScores[question.category] = { correct: 0, total: 0 }
        }
        categoryScores[question.category].total++
        if (answer.isCorrect) {
          categoryScores[question.category].correct++
        }
      }
    })

    const scores: { [category: string]: number } = {}
    Object.entries(categoryScores).forEach(([category, data]) => {
      scores[category] = (data.correct / data.total) * 100
    })

    return scores
  }

  private static analyzePerformance(session: AssessmentSession, categoryScores: { [category: string]: number }): {
    strengths: string[]
    weaknesses: string[]
  } {
    const strengths: string[] = []
    const weaknesses: string[] = []

    Object.entries(categoryScores).forEach(([category, score]) => {
      if (score >= 75) {
        strengths.push(category)
      } else if (score < 50) {
        weaknesses.push(category)
      }
    })

    return { strengths, weaknesses }
  }

  private static async generateRecommendations(session: AssessmentSession, weaknesses: string[]): Promise<LearningRecommendation[]> {
    const recommendations: LearningRecommendation[] = []
    
    // Generate recommendations based on weak areas
    weaknesses.forEach(weakness => {
      recommendations.push(...this.getRecommendationsForCategory(session.config.skill, weakness))
    })

    return recommendations.slice(0, 10) // Limit to top 10 recommendations
  }

  private static getRecommendationsForCategory(skill: string, category: string): LearningRecommendation[] {
    // This would ideally be populated from a database or external API
    const recommendationMap: { [key: string]: { [category: string]: LearningRecommendation[] } } = {
      react: {
        'Components': [
          {
            type: 'course',
            title: 'React Components Masterclass',
            provider: 'Udemy',
            url: 'https://udemy.com/react-components',
            duration: 480,
            difficulty: 'intermediate',
            priority: 'high',
            reason: 'Strengthen component fundamentals',
            prerequisites: ['JavaScript ES6']
          }
        ],
        'State Management': [
          {
            type: 'course',
            title: 'Redux Complete Guide',
            provider: 'Pluralsight',
            url: 'https://pluralsight.com/redux-guide',
            duration: 360,
            difficulty: 'intermediate',
            priority: 'high',
            reason: 'Master state management patterns',
            prerequisites: ['React Basics']
          }
        ]
      }
    }

    return recommendationMap[skill]?.[category] || []
  }

  private static generateNextSteps(level: 'beginner' | 'intermediate' | 'advanced', weaknesses: string[]): string[] {
    const steps: string[] = []
    
    if (level === 'beginner') {
      steps.push('Focus on fundamental concepts and hands-on practice')
      steps.push('Complete beginner-level tutorials and exercises')
      steps.push('Build simple projects to reinforce learning')
    } else if (level === 'intermediate') {
      steps.push('Work on intermediate projects and real-world applications')
      steps.push('Contribute to open-source projects')
      steps.push('Study advanced patterns and best practices')
    } else {
      steps.push('Lead complex projects and mentor others')
      steps.push('Stay updated with latest industry trends')
      steps.push('Consider specialized certifications')
    }

    if (weaknesses.length > 0) {
      steps.push(`Focus especially on: ${weaknesses.join(', ')}`)
    }

    return steps
  }

  private static estimateStudyTime(weaknesses: string[], level: 'beginner' | 'intermediate' | 'advanced'): number {
    const baseHours = { beginner: 40, intermediate: 60, advanced: 80 }
    const weaknessMultiplier = weaknesses.length * 10
    
    return baseHours[level] + weaknessMultiplier
  }

  private static identifySkillGaps(session: AssessmentSession, categoryScores: { [category: string]: number }): string[] {
    return Object.entries(categoryScores)
      .filter(([, score]) => score < 60)
      .map(([category]) => category)
  }

  private static recommendCertifications(skill: string, level: 'beginner' | 'intermediate' | 'advanced'): string[] {
    const certificationMap: { [skill: string]: { [level: string]: string[] } } = {
      react: {
        beginner: ['Meta React Developer Certificate'],
        intermediate: ['React Native Certification', 'Frontend Masters Certificate'],
        advanced: ['Meta Advanced React Certificate', 'Vercel Frontend Expert']
      },
      javascript: {
        beginner: ['JavaScript Institute Certificate'],
        intermediate: ['Mozilla Developer Certificate'],
        advanced: ['Google JavaScript Expert Certification']
      }
    }

    return certificationMap[skill]?.[level] || []
  }

  private static identifyWeakAreas(session: AssessmentSession): string[] {
    const categoryPerformance: { [category: string]: number } = {}
    
    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId)
      if (question) {
        if (!categoryPerformance[question.category]) {
          categoryPerformance[question.category] = 0
        }
        if (!answer.isCorrect) {
          categoryPerformance[question.category]++
        }
      }
    })

    return Object.entries(categoryPerformance)
      .filter(([, incorrectCount]) => incorrectCount >= 2)
      .map(([category]) => category)
  }

  private static identifyStrongAreas(session: AssessmentSession): string[] {
    const categoryPerformance: { [category: string]: { correct: number; total: number } } = {}
    
    session.answers.forEach(answer => {
      const question = session.questions.find(q => q.id === answer.questionId)
      if (question) {
        if (!categoryPerformance[question.category]) {
          categoryPerformance[question.category] = { correct: 0, total: 0 }
        }
        categoryPerformance[question.category].total++
        if (answer.isCorrect) {
          categoryPerformance[question.category].correct++
        }
      }
    })

    return Object.entries(categoryPerformance)
      .filter(([, performance]) => performance.correct / performance.total >= 0.8)
      .map(([category]) => category)
  }

  private static generateQuickRecommendations(session: AssessmentSession): string[] {
    const weakAreas = this.identifyWeakAreas(session)
    return weakAreas.map(area => `Focus on improving ${area} skills`)
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }
}

export default AdvancedSkillAssessment
