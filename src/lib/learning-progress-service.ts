// Enhanced Learning Progress System with MongoDB persistence
import { MongoClient, Db, Collection } from 'mongodb'
import { UserProfile } from '@/types'

export interface LearningProgress {
  userId: string
  skillName: string
  level: 'beginner' | 'intermediate' | 'advanced'
  currentScore: number
  targetScore: number
  hoursSpent: number
  lastStudied: Date
  milestones: LearningMilestone[]
  resources: LearningResource[]
  assessments: SkillAssessmentResult[]
  createdAt: Date
  updatedAt: Date
}

export interface LearningMilestone {
  id: string
  title: string
  description: string
  targetDate: Date
  completed: boolean
  completedDate?: Date
  weight: number // 1-10, importance
  dependencies: string[] // other milestone IDs
  resources: string[]
  estimatedHours: number
  actualHours?: number
}

export interface LearningResource {
  id: string
  title: string
  type: 'course' | 'book' | 'video' | 'article' | 'project' | 'exercise'
  url: string
  provider: string
  duration: number // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  rating: number
  completed: boolean
  completedDate?: Date
  notes: string[]
  timeSpent: number
}

export interface SkillAssessmentResult {
  id: string
  skill: string
  score: number
  maxScore: number
  date: Date
  timeSpent: number
  questionsAnswered: number
  correctAnswers: number
  weakAreas: string[]
  strongAreas: string[]
  recommendations: string[]
}

export interface StudySession {
  id: string
  userId: string
  skill: string
  startTime: Date
  endTime?: Date
  resourceId?: string
  focusAreas: string[]
  productivity: number // 1-10 self-rated
  notes: string
  achievements: string[]
}

export class LearningProgressService {
  private static db: Db | null = null
  private static progressCollection: Collection<LearningProgress> | null = null
  private static sessionCollection: Collection<StudySession> | null = null

  static async initialize() {
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB URI not configured')
    }

    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    this.db = client.db('career-assistant')
    this.progressCollection = this.db.collection('learning-progress')
    this.sessionCollection = this.db.collection('study-sessions')

    // Create indexes for better performance
    await this.progressCollection.createIndex({ userId: 1, skillName: 1 }, { unique: true })
    await this.progressCollection.createIndex({ 'milestones.targetDate': 1 })
    await this.sessionCollection.createIndex({ userId: 1, startTime: -1 })
  }

  // Get user's learning progress for all skills
  static async getUserProgress(userId: string): Promise<LearningProgress[]> {
    if (!this.progressCollection) await this.initialize()
    
    return await this.progressCollection!.find({ userId }).toArray()
  }

  // Get progress for specific skill
  static async getSkillProgress(userId: string, skillName: string): Promise<LearningProgress | null> {
    if (!this.progressCollection) await this.initialize()
    
    return await this.progressCollection!.findOne({ userId, skillName })
  }

  // Create or update learning progress
  static async updateProgress(userId: string, skillName: string, updates: Partial<LearningProgress>): Promise<LearningProgress> {
    if (!this.progressCollection) await this.initialize()

    const now = new Date()
    const existingProgress = await this.getSkillProgress(userId, skillName)

    if (existingProgress) {
      const updatedProgress = {
        ...existingProgress,
        ...updates,
        updatedAt: now
      }

      await this.progressCollection!.updateOne(
        { userId, skillName },
        { $set: updatedProgress }
      )

      return updatedProgress
    } else {
      const newProgress: LearningProgress = {
        userId,
        skillName,
        level: 'beginner',
        currentScore: 0,
        targetScore: 100,
        hoursSpent: 0,
        lastStudied: now,
        milestones: [],
        resources: [],
        assessments: [],
        createdAt: now,
        updatedAt: now,
        ...updates
      }

      await this.progressCollection!.insertOne(newProgress)
      return newProgress
    }
  }

  // Add a new milestone
  static async addMilestone(userId: string, skillName: string, milestone: Omit<LearningMilestone, 'id'>): Promise<void> {
    if (!this.progressCollection) await this.initialize()

    const milestoneWithId: LearningMilestone = {
      ...milestone,
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    await this.progressCollection!.updateOne(
      { userId, skillName },
      { 
        $push: { milestones: milestoneWithId },
        $set: { updatedAt: new Date() }
      }
    )
  }

  // Complete a milestone
  static async completeMilestone(userId: string, skillName: string, milestoneId: string, actualHours?: number): Promise<void> {
    if (!this.progressCollection) await this.initialize()

    const updateObj: any = {
      'milestones.$.completed': true,
      'milestones.$.completedDate': new Date(),
      updatedAt: new Date()
    }

    if (actualHours) {
      updateObj['milestones.$.actualHours'] = actualHours
    }

    await this.progressCollection!.updateOne(
      { userId, skillName, 'milestones.id': milestoneId },
      { $set: updateObj }
    )
  }

  // Add learning resource
  static async addResource(userId: string, skillName: string, resource: Omit<LearningResource, 'id'>): Promise<void> {
    if (!this.progressCollection) await this.initialize()

    const resourceWithId: LearningResource = {
      ...resource,
      id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    await this.progressCollection!.updateOne(
      { userId, skillName },
      { 
        $push: { resources: resourceWithId },
        $set: { updatedAt: new Date() }
      }
    )
  }

  // Mark resource as completed
  static async completeResource(userId: string, skillName: string, resourceId: string, timeSpent: number, notes?: string): Promise<void> {
    if (!this.progressCollection) await this.initialize()

    const updateObj: any = {
      'resources.$.completed': true,
      'resources.$.completedDate': new Date(),
      'resources.$.timeSpent': timeSpent,
      updatedAt: new Date()
    }

    if (notes) {
      updateObj['resources.$.notes'] = notes
    }

    await this.progressCollection!.updateOne(
      { userId, skillName, 'resources.id': resourceId },
      { $set: updateObj }
    )

    // Also update total hours spent
    await this.progressCollection!.updateOne(
      { userId, skillName },
      { $inc: { hoursSpent: timeSpent / 60 } } // Convert minutes to hours
    )
  }

  // Add assessment result
  static async addAssessment(userId: string, skillName: string, assessment: Omit<SkillAssessmentResult, 'id'>): Promise<void> {
    if (!this.progressCollection) await this.initialize()

    const assessmentWithId: SkillAssessmentResult = {
      ...assessment,
      id: `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Update current score if this assessment is better
    const currentProgress = await this.getSkillProgress(userId, skillName)
    const newScore = (assessment.score / assessment.maxScore) * 100

    await this.progressCollection!.updateOne(
      { userId, skillName },
      { 
        $push: { assessments: assessmentWithId },
        $set: { 
          currentScore: Math.max(currentProgress?.currentScore || 0, newScore),
          lastStudied: new Date(),
          updatedAt: new Date()
        }
      }
    )
  }

  // Start a study session
  static async startStudySession(userId: string, skill: string, focusAreas: string[], resourceId?: string): Promise<StudySession> {
    if (!this.sessionCollection) await this.initialize()

    const session: StudySession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      skill,
      startTime: new Date(),
      resourceId,
      focusAreas,
      productivity: 0,
      notes: '',
      achievements: []
    }

    await this.sessionCollection!.insertOne(session)
    return session
  }

  // End a study session
  static async endStudySession(sessionId: string, productivity: number, notes: string, achievements: string[] = []): Promise<void> {
    if (!this.sessionCollection) await this.initialize()

    await this.sessionCollection!.updateOne(
      { id: sessionId },
      { 
        $set: { 
          endTime: new Date(),
          productivity,
          notes,
          achievements
        }
      }
    )
  }

  // Get study analytics
  static async getStudyAnalytics(userId: string, days: number = 30): Promise<{
    totalHours: number
    averageProductivity: number
    skillsStudied: string[]
    streakDays: number
    weeklyGoalProgress: number
    topAchievements: string[]
  }> {
    if (!this.sessionCollection) await this.initialize()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const sessions = await this.sessionCollection!.find({
      userId,
      startTime: { $gte: startDate },
      endTime: { $exists: true }
    }).toArray()

    const totalMinutes = sessions.reduce((sum, session) => {
      if (session.endTime) {
        return sum + (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
      }
      return sum
    }, 0)

    const averageProductivity = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.productivity, 0) / sessions.length 
      : 0

    const skillsStudied = Array.from(new Set(sessions.map(s => s.skill)))

    // Calculate streak (consecutive days with study sessions)
    const streakDays = this.calculateStreakDays(sessions)

    // Weekly goal progress (assume 10 hours per week goal)
    const weeklyGoalProgress = Math.min((totalMinutes / 60) / 10 * 100, 100)

    const topAchievements = sessions
      .flatMap(s => s.achievements)
      .reduce((acc: {[key: string]: number}, achievement) => {
        acc[achievement] = (acc[achievement] || 0) + 1
        return acc
      }, {})

    return {
      totalHours: totalMinutes / 60,
      averageProductivity,
      skillsStudied,
      streakDays,
      weeklyGoalProgress,
      topAchievements: Object.entries(topAchievements)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([achievement]) => achievement)
    }
  }

  private static calculateStreakDays(sessions: StudySession[]): number {
    const studyDates = Array.from(new Set(sessions.map(s => 
      s.startTime.toISOString().split('T')[0]
    ))).sort().reverse()

    let streak = 0
    let currentDate = new Date()
    
    for (const dateStr of studyDates) {
      const studyDate = new Date(dateStr)
      const daysDiff = Math.floor((currentDate.getTime() - studyDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
        currentDate = studyDate
      } else {
        break
      }
    }

    return streak
  }

  // Get upcoming milestones
  static async getUpcomingMilestones(userId: string, days: number = 7): Promise<{
    skill: string
    milestone: LearningMilestone
  }[]> {
    if (!this.progressCollection) await this.initialize()

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    const progressRecords = await this.progressCollection!.find({ userId }).toArray()
    
    const upcomingMilestones: { skill: string; milestone: LearningMilestone }[] = []

    progressRecords.forEach(progress => {
      progress.milestones
        .filter(m => !m.completed && m.targetDate <= endDate)
        .forEach(milestone => {
          upcomingMilestones.push({ skill: progress.skillName, milestone })
        })
    })

    return upcomingMilestones.sort((a, b) => 
      a.milestone.targetDate.getTime() - b.milestone.targetDate.getTime()
    )
  }
}

export default LearningProgressService
