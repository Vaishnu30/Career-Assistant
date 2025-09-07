import { NextRequest, NextResponse } from 'next/server'

// Mock data for now - in production this would connect to MongoDB
// This provides the API endpoints that the client service calls

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Mock learning progress data
    const mockProgress = [
      {
        id: 'progress-1',
        userId,
        skillName: 'React',
        currentScore: 75,
        targetScore: 90,
        hoursSpent: 25.5,
        lastUpdated: new Date().toISOString(),
        milestones: [
          {
            id: 'milestone-1',
            title: 'Complete React Fundamentals',
            description: 'Master components, props, and state',
            targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            completed: true,
            completedDate: new Date().toISOString(),
            progress: 100,
            requirements: ['Components', 'Props', 'State', 'Events']
          },
          {
            id: 'milestone-2',
            title: 'Learn React Hooks',
            description: 'Understand useState, useEffect, and custom hooks',
            targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            completed: false,
            progress: 60,
            requirements: ['useState', 'useEffect', 'useContext', 'Custom Hooks']
          }
        ],
        resources: [
          {
            id: 'resource-1',
            title: 'React Official Documentation',
            url: 'https://react.dev',
            type: 'article',
            difficulty: 'beginner',
            estimatedHours: 8,
            completed: true,
            completedDate: new Date().toISOString(),
            rating: 5
          }
        ],
        assessmentResults: []
      },
      {
        id: 'progress-2',
        userId,
        skillName: 'TypeScript',
        currentScore: 60,
        targetScore: 85,
        hoursSpent: 18.2,
        lastUpdated: new Date().toISOString(),
        milestones: [],
        resources: [],
        assessmentResults: []
      }
    ]

    return NextResponse.json(mockProgress)
  } catch (error) {
    console.error('Error fetching learning progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, skillName, targetScore = 90 } = body

    if (!userId || !skillName) {
      return NextResponse.json({ 
        error: 'User ID and skill name are required' 
      }, { status: 400 })
    }

    // Mock creation of new progress entry
    const newProgress = {
      id: `progress-${Date.now()}`,
      userId,
      skillName,
      currentScore: 0,
      targetScore,
      hoursSpent: 0,
      lastUpdated: new Date().toISOString(),
      milestones: [],
      resources: [],
      assessmentResults: []
    }

    return NextResponse.json(newProgress, { status: 201 })
  } catch (error) {
    console.error('Error creating learning progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, skillName, ...updates } = body

    if (!userId || !skillName) {
      return NextResponse.json({ 
        error: 'User ID and skill name are required' 
      }, { status: 400 })
    }

    // Mock update of existing progress
    const updatedProgress = {
      id: `progress-${Date.now()}`,
      userId,
      skillName,
      lastUpdated: new Date().toISOString(),
      ...updates
    }

    return NextResponse.json(updatedProgress)
  } catch (error) {
    console.error('Error updating learning progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
