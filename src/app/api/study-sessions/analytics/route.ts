import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for analytics route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

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
      weeklyProgress: [2, 3, 4, 2, 5, 3, 4],
      monthlyGoal: 40,
      monthlyProgress: 35.5,
      totalSessions: 23,
      averageSessionLength: 1.8,
      productivityTrend: [7, 8, 7, 9, 8, 8, 9],
      skillProgression: {
        'React': [60, 65, 70, 75],
        'TypeScript': [45, 50, 55, 60],
        'JavaScript': [70, 72, 75, 78]
      },
      recentMilestones: [
        {
          title: 'React Hooks Mastery',
          completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          skill: 'React'
        },
        {
          title: 'TypeScript Basics',
          completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          skill: 'TypeScript'
        }
      ],
      upcomingDeadlines: [
        {
          title: 'Complete React Project',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          skill: 'React',
          priority: 'high'
        }
      ]
    }

    return NextResponse.json(mockAnalytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
