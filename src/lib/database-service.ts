import connectDB from './mongodb'
import { User, Job, ResumeLog } from '../models'
import { UserProfile, Job as JobType } from '../types'
import { ValidationUtils } from './validation-utils'

export class DatabaseService {
  static async connectToDatabase() {
    try {
      await connectDB()
      return { success: true }
    } catch (error) {
      console.error('Database connection failed:', error)
      return { success: false, error }
    }
  }

  // User Profile Operations
  static async createNewUser(profileData: UserProfile): Promise<{ success: boolean; user?: any; error?: any }> {
    try {
      await connectDB()
      
      // Validate password
      if (!profileData.password) {
        return { success: false, error: 'Password is required' }
      }

      const passwordValidation = ValidationUtils.isValidPassword(profileData.password)
      if (!passwordValidation.valid) {
        return { success: false, error: passwordValidation.message }
      }

      // Double-check if user exists (race condition protection)
      const existingUser = await User.findOne({ email: profileData.email })
      if (existingUser) {
        return { success: false, error: 'Email already registered' }
      }

      // Hash the password
      const hashedPassword = await ValidationUtils.hashPassword(profileData.password)

      // Create new user with hashed password
      const { password, ...userDataWithoutPassword } = profileData
      const newUser = new User({
        ...userDataWithoutPassword,
        password: hashedPassword,
        isRegistered: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      const savedUser = await newUser.save()
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = savedUser.toObject()
      return { success: true, user: userWithoutPassword }
    } catch (error: any) {
      console.error('Error creating new user:', error)
      if (error.code === 11000) {
        // MongoDB duplicate key error
        return { success: false, error: 'Email already registered' }
      }
      return { success: false, error: 'Failed to create account' }
    }
  }

  // Authenticate user (for sign-in)
  static async authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: any; error?: any }> {
    try {
      await connectDB()
      
      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Verify password
      const isPasswordValid = await ValidationUtils.verifyPassword(password, user.password)
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password' }
      }

      // Return user without password
      const { password: _, ...userWithoutPassword } = user.toObject()
      return { success: true, user: userWithoutPassword }
    } catch (error) {
      console.error('Error authenticating user:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  static async updateUserPassword(email: string, hashedPassword: string): Promise<{ success: boolean; error?: any }> {
    try {
      console.log(`🔄 Attempting to update password for: ${email}`)
      await connectDB()
      console.log('✅ Database connected for password update')
      
      const updatedUser = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { 
          password: hashedPassword,
          updatedAt: new Date()
        },
        { new: true }
      )
      
      if (updatedUser) {
        console.log('✅ Password updated successfully for:', email)
        return { success: true }
      } else {
        console.log('❌ User not found for password update:', email)
        return { success: false, error: 'User not found' }
      }
    } catch (error) {
      console.error('❌ Error updating password:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }

  static async saveUserProfile(profileData: UserProfile): Promise<{ success: boolean; user?: any; error?: any }> {
    try {
      await connectDB()
      
      const existingUser = await User.findOne({ email: profileData.email })
      
      if (existingUser) {
        // Update existing user
        const updatedUser = await User.findOneAndUpdate(
          { email: profileData.email },
          {
            ...profileData,
            isRegistered: true,
            updatedAt: new Date()
          },
          { new: true, upsert: false }
        )
        return { success: true, user: updatedUser }
      } else {
        return { success: false, error: 'User not found. Please register first.' }
      }
    } catch (error) {
      console.error('Error saving user profile:', error)
      return { success: false, error }
    }
  }

  static async getUserProfile(email: string): Promise<{ success: boolean; user?: any; error?: any }> {
    try {
      await connectDB()
      
      const user = await User.findOne({ email })
      if (user) {
        return { success: true, user }
      } else {
        return { success: false, error: 'User not found' }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { success: false, error }
    }
  }

  static async getAllUsers(): Promise<{ success: boolean; users?: any[]; error?: any }> {
    try {
      await connectDB()
      
      const users = await User.find({}, { email: 1, name: 1, createdAt: 1, isRegistered: 1 })
      return { success: true, users }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { success: false, error }
    }
  }

  // Job Operations
  static async saveJobs(jobs: JobType[]): Promise<{ success: boolean; saved?: number; error?: any }> {
    try {
      await connectDB()
      
      let savedCount = 0
      
      for (const job of jobs) {
        try {
          await Job.findOneAndUpdate(
            { jobId: job.id.toString() },
            {
              jobId: job.id.toString(),
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              requirements: job.requirements,
              salary: job.salary || '',
              type: job.type,
              source: 'rapidapi', // Default source
              sourceUrl: '', // Will be added from API response if available
              postedDate: new Date(job.posted),
              isActive: true
            },
            { upsert: true, new: true }
          )
          savedCount++
        } catch (jobError) {
          console.error(`Error saving job ${job.id}:`, jobError)
        }
      }
      
      return { success: true, saved: savedCount }
    } catch (error) {
      console.error('Error saving jobs:', error)
      return { success: false, error }
    }
  }

  static async getJobs(filters?: { source?: string; location?: string; limit?: number }): Promise<{ success: boolean; jobs?: any[]; error?: any }> {
    try {
      await connectDB()
      
      const query: any = { isActive: true }
      
      if (filters?.source) {
        query.source = filters.source
      }
      
      if (filters?.location) {
        query.location = { $regex: filters.location, $options: 'i' }
      }
      
      const jobs = await Job.find(query)
        .sort({ createdAt: -1 })
        .limit(filters?.limit || 50)
      
      return { success: true, jobs }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return { success: false, error }
    }
  }

  static async getJobById(jobId: string): Promise<{ success: boolean; job?: any; error?: any }> {
    try {
      await connectDB()
      
      const job = await Job.findOne({ jobId })
      if (job) {
        return { success: true, job }
      } else {
        return { success: false, error: 'Job not found' }
      }
    } catch (error) {
      console.error('Error fetching job:', error)
      return { success: false, error }
    }
  }

  // Resume Log Operations
  static async logResumeGeneration(userId: string, jobId: string, jobTitle: string, company: string, resumeData: any): Promise<{ success: boolean; log?: any; error?: any }> {
    try {
      await connectDB()
      
      const resumeLog = new ResumeLog({
        userId,
        jobId,
        jobTitle,
        company,
        resumeData,
        generatedAt: new Date()
      })
      
      const savedLog = await resumeLog.save()
      return { success: true, log: savedLog }
    } catch (error) {
      console.error('Error logging resume generation:', error)
      return { success: false, error }
    }
  }

  static async getUserResumeHistory(userId: string): Promise<{ success: boolean; history?: any[]; error?: any }> {
    try {
      await connectDB()
      
      const history = await ResumeLog.find({ userId })
        .sort({ generatedAt: -1 })
        .limit(20)
      
      return { success: true, history }
    } catch (error) {
      console.error('Error fetching resume history:', error)
      return { success: false, error }
    }
  }

  // Utility Operations
  static async clearAllJobs(): Promise<{ success: boolean; deleted?: number; error?: any }> {
    try {
      await connectDB()
      
      const result = await Job.deleteMany({})
      return { success: true, deleted: result.deletedCount }
    } catch (error) {
      console.error('Error clearing jobs:', error)
      return { success: false, error }
    }
  }

  static async getStats(): Promise<{ success: boolean; stats?: any; error?: any }> {
    try {
      await connectDB()
      
      const userCount = await User.countDocuments()
      const jobCount = await Job.countDocuments({ isActive: true })
      const resumeCount = await ResumeLog.countDocuments()
      
      const stats = {
        users: userCount,
        activeJobs: jobCount,
        resumesGenerated: resumeCount,
        lastUpdated: new Date()
      }
      
      return { success: true, stats }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return { success: false, error }
    }
  }
}
