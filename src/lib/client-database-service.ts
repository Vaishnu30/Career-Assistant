// Client-side API service for database operations
import { UserProfile } from '@/types'

export class ClientDatabaseService {
  private static BASE_URL = '/api'

  // User Profile Operations
  static async saveUserProfile(profile: UserProfile): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error saving user profile:', error)
      return { success: false, error: 'Failed to save profile' }
    }
  }

  static async getUserProfile(email: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/users?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { success: false, error: 'Failed to fetch profile' }
    }
  }

  static async updateUserProfile(profile: UserProfile): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error: 'Failed to update profile' }
    }
  }

  // Job Operations
  static async getJobs(filters?: { location?: string; limit?: number }): Promise<{ success: boolean; jobs?: any[]; error?: string }> {
    try {
      const params = new URLSearchParams()
      if (filters?.location) params.append('location', filters.location)
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`${this.BASE_URL}/jobs?${params.toString()}`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return { success: false, error: 'Failed to fetch jobs' }
    }
  }

  static async syncJobs(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'sync' }),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error syncing jobs:', error)
      return { success: false, error: 'Failed to sync jobs' }
    }
  }

  // Stats and Monitoring
  static async getStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      const response = await fetch(`${this.BASE_URL}/stats`)
      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error fetching stats:', error)
      return { success: false, error: 'Failed to fetch stats' }
    }
  }

  // Hybrid approach - save to both localStorage and database
  static async saveProfileHybrid(profile: UserProfile): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Save to localStorage first (immediate)
      localStorage.setItem('userProfile', JSON.stringify(profile))
      localStorage.setItem('isRegistered', 'true')

      // Then save to database (persistent)
      const dbResult = await this.saveUserProfile(profile)
      
      if (dbResult.success) {
        console.log('✅ Profile saved to both localStorage and database')
        return dbResult
      } else {
        console.warn('⚠️ Profile saved to localStorage, but database save failed:', dbResult.error)
        return { success: true, user: profile, error: 'Saved locally only' }
      }
    } catch (error) {
      console.error('Error in hybrid save:', error)
      return { success: false, error: 'Failed to save profile' }
    }
  }

  static async loadProfileHybrid(email: string): Promise<{ success: boolean; user?: any; source?: string; error?: string }> {
    try {
      // Try database first
      const dbResult = await this.getUserProfile(email)
      
      if (dbResult.success && dbResult.user) {
        console.log('✅ Profile loaded from database')
        return { ...dbResult, source: 'database' }
      }

      // Fallback to localStorage
      const savedProfile = localStorage.getItem('userProfile')
      const savedRegistered = localStorage.getItem('isRegistered')
      
      if (savedProfile && savedRegistered === 'true') {
        const profile = JSON.parse(savedProfile)
        if (profile.email === email) {
          console.log('✅ Profile loaded from localStorage')
          return { success: true, user: profile, source: 'localStorage' }
        }
      }

      return { success: false, error: 'Profile not found in database or localStorage' }
    } catch (error) {
      console.error('Error in hybrid load:', error)
      return { success: false, error: 'Failed to load profile' }
    }
  }
}
