import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, skill, focusAreas, startTime } = body

    if (!userId || !skill || !focusAreas) {
      return NextResponse.json({ 
        error: 'User ID, skill, and focus areas are required' 
      }, { status: 400 })
    }

    // Mock study session creation
    const newSession = {
      id: `session-${Date.now()}`,
      userId,
      skill,
      focusAreas,
      startTime: startTime || new Date().toISOString(),
      productivity: 0,
      notes: '',
      achievements: []
    }

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error('Error creating study session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if this is a request for analytics
    if (request.url.includes('/analytics')) {
      // Mock analytics data
      const mockAnalytics = {
        totalHours: 45.5,
        streakDays: 7,
        weeklyGoalProgress: 75,
        averageProductivity: 8.2,
        topAchievements: [
          'First Week Complete',
          'React Master',
          'Consistent Learner'
        ],
        skillDistribution: {
          'React': 40,
          'TypeScript': 35,
          'JavaScript': 25
        },
        weeklyProgress: [2, 3, 4, 2, 5, 3, 4]
      }

      return NextResponse.json(mockAnalytics)
    }

    // Mock study sessions list
    const mockSessions = [
      {
        id: 'session-1',
        userId,
        skill: 'React',
        focusAreas: ['Hooks', 'State Management'],
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        duration: 3600, // 1 hour in seconds
        productivity: 8,
        notes: 'Worked on useState and useEffect',
        achievements: ['Consistent Learner']
      }
    ]

    return NextResponse.json(mockSessions)
  } catch (error) {
    console.error('Error fetching study sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
