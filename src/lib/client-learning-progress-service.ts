// Client-side service for learning progress (API wrapper)
// This replaces direct MongoDB calls in client components

export interface LearningProgress {
  id?: string
  userId: string
  skillName: string
  currentScore: number
  targetScore: number
  hoursSpent: number
  lastUpdated: Date
  milestones: LearningMilestone[]
  resources: LearningResource[]
  assessmentResults: SkillAssessmentResult[]
}

export interface LearningMilestone {
  id: string
  title: string
  description: string
  targetDate: Date
  completed: boolean
  completedDate?: Date
  progress: number
  requirements: string[]
}

export interface LearningResource {
  id: string
  title: string
  url: string
  type: 'video' | 'article' | 'course' | 'book' | 'exercise'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedHours: number
  completed: boolean
  completedDate?: Date
  rating?: number
  notes?: string
}

export interface SkillAssessmentResult {
  id: string
  assessmentId: string
  score: number
  maxScore: number
  completedAt: Date
  timeSpent: number
  categoryScores: Record<string, number>
  recommendations: string[]
}

export interface StudySession {
  id: string
  userId: string
  skill: string
  focusAreas: string[]
  startTime: Date
  endTime?: Date
  duration?: number
  productivity: number
  notes: string
  achievements: string[]
}

export interface StudyAnalytics {
  totalHours: number
  streakDays: number
  weeklyGoalProgress: number
  averageProductivity: number
  topAchievements: string[]
  skillDistribution: Record<string, number>
  weeklyProgress: number[]
}

class ClientLearningProgressService {
  private baseUrl = '/api'

  async getUserProgress(userId: string): Promise<LearningProgress[]> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress?userId=${userId}`)
      if (!response.ok) throw new Error('Failed to fetch progress')
      return await response.json()
    } catch (error) {
      console.error('Error fetching user progress:', error)
      return this.getMockProgress(userId)
    }
  }

  async updateProgress(userId: string, skillName: string, progress: Partial<LearningProgress>): Promise<LearningProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skillName, ...progress })
      })
      if (!response.ok) throw new Error('Failed to update progress')
      return await response.json()
    } catch (error) {
      console.error('Error updating progress:', error)
      return this.getMockProgressItem(userId, skillName)
    }
  }

  async createProgress(userId: string, skillName: string, targetScore: number = 90): Promise<LearningProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skillName, targetScore })
      })
      if (!response.ok) throw new Error('Failed to create progress')
      return await response.json()
    } catch (error) {
      console.error('Error creating progress:', error)
      return this.getMockProgressItem(userId, skillName)
    }
  }

  async addMilestone(userId: string, skillName: string, milestone: Omit<LearningMilestone, 'id'>): Promise<LearningMilestone> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skillName, milestone })
      })
      if (!response.ok) throw new Error('Failed to add milestone')
      return await response.json()
    } catch (error) {
      console.error('Error adding milestone:', error)
      return { ...milestone, id: `mock-${Date.now()}` }
    }
  }

  async updateMilestone(userId: string, milestoneId: string, updates: Partial<LearningMilestone>): Promise<LearningMilestone> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates })
      })
      if (!response.ok) throw new Error('Failed to update milestone')
      return await response.json()
    } catch (error) {
      console.error('Error updating milestone:', error)
      return { id: milestoneId, ...updates } as LearningMilestone
    }
  }

  async getUpcomingMilestones(userId: string, days: number = 7): Promise<LearningMilestone[]> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress/milestones/upcoming?userId=${userId}&days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch milestones')
      return await response.json()
    } catch (error) {
      console.error('Error fetching milestones:', error)
      return this.getMockUpcomingMilestones()
    }
  }

  async startStudySession(userId: string, skill: string, focusAreas: string[]): Promise<StudySession> {
    try {
      const response = await fetch(`${this.baseUrl}/study-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skill, focusAreas, startTime: new Date() })
      })
      if (!response.ok) throw new Error('Failed to start session')
      return await response.json()
    } catch (error) {
      console.error('Error starting session:', error)
      return this.getMockStudySession(userId, skill, focusAreas)
    }
  }

  async endStudySession(sessionId: string, productivity: number, notes: string, achievements: string[]): Promise<StudySession> {
    try {
      const response = await fetch(`${this.baseUrl}/study-sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endTime: new Date(), 
          productivity, 
          notes, 
          achievements 
        })
      })
      if (!response.ok) throw new Error('Failed to end session')
      return await response.json()
    } catch (error) {
      console.error('Error ending session:', error)
      return {} as StudySession
    }
  }

  async getStudyAnalytics(userId: string, days: number = 30): Promise<StudyAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/study-sessions/analytics?userId=${userId}&days=${days}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      return await response.json()
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return this.getMockAnalytics()
    }
  }

  async addResource(userId: string, skillName: string, resource: Omit<LearningResource, 'id'>): Promise<LearningResource> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skillName, resource })
      })
      if (!response.ok) throw new Error('Failed to add resource')
      return await response.json()
    } catch (error) {
      console.error('Error adding resource:', error)
      return { ...resource, id: `mock-${Date.now()}` }
    }
  }

  async updateResource(userId: string, resourceId: string, updates: Partial<LearningResource>): Promise<LearningResource> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress/resources/${resourceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates })
      })
      if (!response.ok) throw new Error('Failed to update resource')
      return await response.json()
    } catch (error) {
      console.error('Error updating resource:', error)
      return { id: resourceId, ...updates } as LearningResource
    }
  }

  async recordAssessmentResult(userId: string, skillName: string, result: Omit<SkillAssessmentResult, 'id'>): Promise<SkillAssessmentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/learning-progress/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, skillName, result })
      })
      if (!response.ok) throw new Error('Failed to record assessment')
      return await response.json()
    } catch (error) {
      console.error('Error recording assessment:', error)
      return { ...result, id: `mock-${Date.now()}` }
    }
  }

  // Mock data methods for fallback when API is unavailable
  private getMockProgress(userId: string): LearningProgress[] {
    return [
      {
        id: 'mock-1',
        userId,
        skillName: 'React',
        currentScore: 75,
        targetScore: 90,
        hoursSpent: 25.5,
        lastUpdated: new Date(),
        milestones: this.getMockMilestones(),
        resources: this.getMockResources(),
        assessmentResults: []
      },
      {
        id: 'mock-2',
        userId,
        skillName: 'TypeScript',
        currentScore: 60,
        targetScore: 85,
        hoursSpent: 18.2,
        lastUpdated: new Date(),
        milestones: this.getMockMilestones(),
        resources: this.getMockResources(),
        assessmentResults: []
      }
    ]
  }

  private getMockProgressItem(userId: string, skillName: string): LearningProgress {
    return {
      id: `mock-${Date.now()}`,
      userId,
      skillName,
      currentScore: 50,
      targetScore: 90,
      hoursSpent: 0,
      lastUpdated: new Date(),
      milestones: [],
      resources: [],
      assessmentResults: []
    }
  }

  private getMockMilestones(): LearningMilestone[] {
    return [
      {
        id: 'milestone-1',
        title: 'Complete React Fundamentals',
        description: 'Master components, props, and state',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: true,
        completedDate: new Date(),
        progress: 100,
        requirements: ['Components', 'Props', 'State', 'Events']
      },
      {
        id: 'milestone-2',
        title: 'Learn React Hooks',
        description: 'Understand useState, useEffect, and custom hooks',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 60,
        requirements: ['useState', 'useEffect', 'useContext', 'Custom Hooks']
      }
    ]
  }

  private getMockResources(): LearningResource[] {
    return [
      {
        id: 'resource-1',
        title: 'React Official Documentation',
        url: 'https://react.dev',
        type: 'article',
        difficulty: 'beginner',
        estimatedHours: 8,
        completed: true,
        completedDate: new Date(),
        rating: 5
      },
      {
        id: 'resource-2',
        title: 'React Course - Scrimba',
        url: 'https://scrimba.com/learn/learnreact',
        type: 'course',
        difficulty: 'intermediate',
        estimatedHours: 12,
        completed: false,
        rating: 4
      }
    ]
  }

  private getMockUpcomingMilestones(): LearningMilestone[] {
    return [
      {
        id: 'upcoming-1',
        title: 'Complete JavaScript Arrays Module',
        description: 'Master array methods and manipulation',
        targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        completed: false,
        progress: 80,
        requirements: ['map', 'filter', 'reduce', 'forEach']
      }
    ]
  }

  private getMockStudySession(userId: string, skill: string, focusAreas: string[]): StudySession {
    return {
      id: `session-${Date.now()}`,
      userId,
      skill,
      focusAreas,
      startTime: new Date(),
      productivity: 0,
      notes: '',
      achievements: []
    }
  }

  private getMockAnalytics(): StudyAnalytics {
    return {
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
  }
}

// Export singleton instance
const clientLearningProgressService = new ClientLearningProgressService()
export default clientLearningProgressService
