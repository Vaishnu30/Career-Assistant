import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, config } = body

    if (!userId || !config) {
      return NextResponse.json({ 
        error: 'User ID and config are required' 
      }, { status: 400 })
    }

    // Mock assessment creation
    const mockAssessment = {
      id: `assessment-${Date.now()}`,
      userId,
      config,
      questions: getMockQuestions(config.skill, config.questionCount),
      currentQuestionIndex: 0,
      responses: [],
      startTime: new Date().toISOString(),
      status: 'active'
    }

    return NextResponse.json(mockAssessment, { status: 201 })
  } catch (error) {
    console.error('Error creating skill assessment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const skill = searchParams.get('skill')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Mock assessment history
    const mockHistory = [
      {
        id: 'assessment-1',
        userId,
        config: { skill: 'react', targetLevel: 'intermediate', questionCount: 10 },
        status: 'completed',
        score: 85,
        completedAt: new Date().toISOString()
      }
    ]

    return NextResponse.json(mockHistory)
  } catch (error) {
    console.error('Error fetching assessment history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getMockQuestions(skill: string, count: number) {
  const allQuestions = [
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
    }
  ]

  return allQuestions.slice(0, Math.min(count, allQuestions.length))
}
