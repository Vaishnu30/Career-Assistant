// Skill Assessment System for Study Planner
// Provides intelligent skill level detection and personalized recommendations

export interface SkillAssessment {
  skill: string
  level: 'beginner' | 'intermediate' | 'advanced'
  confidence: number
  strengths: string[]
  gaps: string[]
  recommendedStartPoint: string
  estimatedTimeToNextLevel: string
}

export interface AssessmentQuestion {
  id: string
  skill: string
  level: 'beginner' | 'intermediate' | 'advanced'
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  weight: number
}

export class SkillAssessor {
  // Comprehensive skill assessment database
  private static readonly assessmentQuestions: { [skill: string]: AssessmentQuestion[] } = {
    react: [
      {
        id: 'react-1',
        skill: 'react',
        level: 'beginner',
        question: 'What is JSX in React?',
        options: [
          'A syntax extension for JavaScript',
          'A CSS framework',
          'A database query language',
          'A testing framework'
        ],
        correctAnswer: 0,
        explanation: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.',
        weight: 1.0
      },
      {
        id: 'react-2',
        skill: 'react',
        level: 'beginner',
        question: 'How do you create a functional component in React?',
        options: [
          'function MyComponent() { return <div>Hello</div>; }',
          'class MyComponent extends Component { render() { return <div>Hello</div>; } }',
          'const MyComponent = new Component()',
          'React.createComponent("MyComponent")'
        ],
        correctAnswer: 0,
        explanation: 'Functional components are defined as JavaScript functions that return JSX.',
        weight: 1.2
      },
      {
        id: 'react-3',
        skill: 'react',
        level: 'intermediate',
        question: 'What is the purpose of useEffect hook?',
        options: [
          'To manage component state',
          'To handle side effects in functional components',
          'To create new components',
          'To style components'
        ],
        correctAnswer: 1,
        explanation: 'useEffect is used to perform side effects like data fetching, subscriptions, or DOM manipulation.',
        weight: 1.5
      },
      {
        id: 'react-4',
        skill: 'react',
        level: 'advanced',
        question: 'What is the difference between useMemo and useCallback?',
        options: [
          'No difference, they are identical',
          'useMemo memoizes values, useCallback memoizes functions',
          'useMemo is for state, useCallback is for effects',
          'useMemo is deprecated, useCallback is the new version'
        ],
        correctAnswer: 1,
        explanation: 'useMemo memoizes computed values to avoid expensive recalculations, while useCallback memoizes function instances.',
        weight: 2.0
      }
    ],
    javascript: [
      {
        id: 'js-1',
        skill: 'javascript',
        level: 'beginner',
        question: 'What is the difference between let and var?',
        options: [
          'No difference',
          'let has block scope, var has function scope',
          'var is newer than let',
          'let is only for numbers'
        ],
        correctAnswer: 1,
        explanation: 'let has block scope and cannot be redeclared, while var has function scope and can be redeclared.',
        weight: 1.0
      },
      {
        id: 'js-2',
        skill: 'javascript',
        level: 'intermediate',
        question: 'What does the following code return? [1,2,3].map(x => x * 2)',
        options: [
          '[1,2,3]',
          '[2,4,6]',
          '[1,4,9]',
          'Error'
        ],
        correctAnswer: 1,
        explanation: 'The map function applies the transformation (x * 2) to each element, resulting in [2,4,6].',
        weight: 1.3
      },
      {
        id: 'js-3',
        skill: 'javascript',
        level: 'advanced',
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that returns another function',
          'A function that has access to variables in its outer scope',
          'A way to close the browser',
          'A type of loop'
        ],
        correctAnswer: 1,
        explanation: 'A closure gives you access to an outer function\'s scope from an inner function.',
        weight: 2.0
      }
    ],
    typescript: [
      {
        id: 'ts-1',
        skill: 'typescript',
        level: 'beginner',
        question: 'What is TypeScript?',
        options: [
          'A superset of JavaScript that adds static typing',
          'A completely different language from JavaScript',
          'A JavaScript framework',
          'A database'
        ],
        correctAnswer: 0,
        explanation: 'TypeScript is a superset of JavaScript that adds optional static type checking.',
        weight: 1.0
      },
      {
        id: 'ts-2',
        skill: 'typescript',
        level: 'intermediate',
        question: 'How do you define an interface in TypeScript?',
        options: [
          'class MyInterface {}',
          'interface MyInterface {}',
          'type MyInterface = {}',
          'function MyInterface() {}'
        ],
        correctAnswer: 1,
        explanation: 'Interfaces in TypeScript are defined using the interface keyword.',
        weight: 1.2
      }
    ]
  }

  // Assess user's skill level based on quiz responses
  static async assessSkillLevel(skill: string, answers: number[]): Promise<SkillAssessment> {
    const questions = this.assessmentQuestions[skill.toLowerCase()]
    if (!questions) {
      return this.createBasicAssessment(skill, 'beginner')
    }

    const relevantQuestions = questions.slice(0, answers.length)
    let totalScore = 0
    let maxScore = 0
    const correctAnswers: string[] = []
    const incorrectAreas: string[] = []

    relevantQuestions.forEach((question, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === question.correctAnswer
      const questionScore = isCorrect ? question.weight : 0
      
      totalScore += questionScore
      maxScore += question.weight

      if (isCorrect) {
        correctAnswers.push(question.explanation)
      } else {
        incorrectAreas.push(question.question)
      }
    })

    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const level = this.determineLevel(scorePercentage)
    const confidence = Math.min(scorePercentage, 95) // Cap confidence at 95%

    return {
      skill,
      level,
      confidence,
      strengths: correctAnswers.slice(0, 3),
      gaps: incorrectAreas.slice(0, 3),
      recommendedStartPoint: this.getRecommendedStartPoint(level, confidence),
      estimatedTimeToNextLevel: this.estimateTimeToNextLevel(level, confidence)
    }
  }

  private static determineLevel(scorePercentage: number): 'beginner' | 'intermediate' | 'advanced' {
    if (scorePercentage >= 80) return 'advanced'
    if (scorePercentage >= 60) return 'intermediate'
    return 'beginner'
  }

  private static getRecommendedStartPoint(level: string, confidence: number): string {
    const recommendations = {
      beginner: confidence > 40 
        ? 'Start with intermediate basics to solidify fundamentals'
        : 'Begin with core fundamentals and basic concepts',
      intermediate: confidence > 70
        ? 'Focus on advanced patterns and real-world applications'
        : 'Review intermediate concepts and practice more',
      advanced: 'Work on complex projects and contribute to open source'
    }
    return recommendations[level as keyof typeof recommendations]
  }

  private static estimateTimeToNextLevel(level: string, confidence: number): string {
    const timeEstimates = {
      beginner: confidence > 40 ? '4-6 weeks' : '6-8 weeks',
      intermediate: confidence > 70 ? '6-8 weeks' : '8-12 weeks',
      advanced: '12+ weeks for mastery'
    }
    return timeEstimates[level as keyof typeof timeEstimates]
  }

  private static createBasicAssessment(skill: string, level: 'beginner' | 'intermediate' | 'advanced'): SkillAssessment {
    return {
      skill,
      level,
      confidence: 50,
      strengths: ['Self-motivated to learn'],
      gaps: ['Needs structured learning path'],
      recommendedStartPoint: 'Start with fundamentals and build up gradually',
      estimatedTimeToNextLevel: '6-8 weeks'
    }
  }

  // Get questions for skill assessment
  static getAssessmentQuestions(skill: string, count: number = 5): AssessmentQuestion[] {
    const questions = this.assessmentQuestions[skill.toLowerCase()]
    if (!questions) return []
    
    // Mix questions from different levels
    const beginnerQuestions = questions.filter(q => q.level === 'beginner').slice(0, 2)
    const intermediateQuestions = questions.filter(q => q.level === 'intermediate').slice(0, 2)
    const advancedQuestions = questions.filter(q => q.level === 'advanced').slice(0, 1)
    
    return [...beginnerQuestions, ...intermediateQuestions, ...advancedQuestions].slice(0, count)
  }

  // Portfolio analysis for skill assessment
  static async analyzePortfolio(portfolioData: any, skill: string): Promise<Partial<SkillAssessment>> {
    // This would integrate with GitHub API or portfolio analysis
    // For now, return basic assessment
    const hasProjects = portfolioData?.projects?.some((p: any) => 
      p.technologies?.toLowerCase().includes(skill.toLowerCase())
    )

    if (hasProjects) {
      return {
        level: 'intermediate',
        confidence: 70,
        strengths: ['Practical project experience'],
        recommendedStartPoint: 'Focus on advanced patterns and best practices'
      }
    }

    return {
      level: 'beginner',
      confidence: 30,
      gaps: ['Lacks practical project experience'],
      recommendedStartPoint: 'Start with guided projects and tutorials'
    }
  }
}

export default SkillAssessor
