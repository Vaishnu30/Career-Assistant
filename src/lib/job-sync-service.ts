// Scheduled job synchronization service
import { Job } from '@/types'
import { JobBoardAPIService, JobAPIResponse, ExternalJob } from './job-board-apis'
import { RapidAPIJobService } from './rapidapi-job-service'
import { JobDataTransformer } from './job-data-transformer'

export interface SyncConfiguration {
  sources: ('rapidapi' | 'indeed' | 'linkedin' | 'stackoverflow')[]
  searchQueries: string[]
  locations: string[]
  syncInterval: number // in minutes
  maxJobsPerSource: number
  enableDeduplication: boolean
  autoRefresh: boolean
  useRapidAPIAsPrimary: boolean
}

export interface SyncStatus {
  lastSyncTime: Date
  totalJobsSynced: number
  successfulSources: string[]
  failedSources: string[]
  nextSyncTime: Date
  isRunning: boolean
  errors: string[]
}

export class JobSyncService {
  private static instance: JobSyncService
  private syncInterval: NodeJS.Timeout | null = null
  private currentSyncStatus: SyncStatus
  private configuration: SyncConfiguration
  private jobCache: Map<string, Job> = new Map()
  private subscribers: ((jobs: Job[]) => void)[] = []
  private isInitialized: boolean = false

  private constructor() {
    this.configuration = {
      sources: ['rapidapi'], // Only use RapidAPI to avoid authentication issues
      searchQueries: [
        'software developer',
        'frontend developer',
        'backend developer',
        'full stack developer',
        'web developer',
        'react developer',
        'javascript developer',
        'python developer',
        'java developer',
        'data scientist'
      ],
      locations: ['remote', 'san francisco', 'new york', 'seattle', 'austin', 'boston'],
      syncInterval: 60, // 1 hour
      maxJobsPerSource: 50,
      enableDeduplication: true,
      autoRefresh: false, // Disabled to prevent RapidAPI rate limit flooding
      useRapidAPIAsPrimary: true
    }

    this.currentSyncStatus = {
      lastSyncTime: new Date(0),
      totalJobsSynced: 0,
      successfulSources: [],
      failedSources: [],
      nextSyncTime: new Date(),
      isRunning: false,
      errors: []
    }
  }

  static getInstance(): JobSyncService {
    if (!JobSyncService.instance) {
      JobSyncService.instance = new JobSyncService()
    }
    return JobSyncService.instance
  }

  // Initialize and start the sync service
  async initialize(config?: Partial<SyncConfiguration>): Promise<void> {
    if (config) {
      this.configuration = { ...this.configuration, ...config }
    }

    // Perform initial sync
    await this.performSync()

    // Start scheduled sync if auto-refresh is enabled
    if (this.configuration.autoRefresh) {
      this.startScheduledSync()
    }

    this.isInitialized = true
    console.log('Job sync service initialized successfully')
  }

  // Start scheduled synchronization
  startScheduledSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    const intervalMs = this.configuration.syncInterval * 60 * 1000
    this.syncInterval = setInterval(async () => {
      await this.performSync()
    }, intervalMs)

    this.updateNextSyncTime()
    console.log(`Scheduled sync started with ${this.configuration.syncInterval} minute intervals`)
  }

  // Stop scheduled synchronization
  stopScheduledSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('Scheduled sync stopped')
    }
  }

  // Perform manual synchronization
  async performSync(): Promise<SyncStatus> {
    if (this.currentSyncStatus.isRunning) {
      console.log('Sync already in progress')
      return this.currentSyncStatus
    }

    console.log('Starting job synchronization...')
    this.currentSyncStatus.isRunning = true
    this.currentSyncStatus.errors = []
    this.currentSyncStatus.successfulSources = []
    this.currentSyncStatus.failedSources = []

    const allJobs: Job[] = []

    try {
      // Sync from each configured source
      for (const source of this.configuration.sources) {
        try {
          const sourceJobs = await this.syncFromSource(source)
          allJobs.push(...sourceJobs)
          this.currentSyncStatus.successfulSources.push(source)
          console.log(`Successfully synced ${sourceJobs.length} jobs from ${source}`)
        } catch (error) {
          this.currentSyncStatus.failedSources.push(source)
          this.currentSyncStatus.errors.push(`${source}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          console.error(`Failed to sync from ${source}:`, error)
        }
      }

      // Apply deduplication if enabled
      const finalJobs = this.configuration.enableDeduplication 
        ? this.removeDuplicateJobs(allJobs)
        : allJobs

      // Update cache
      this.updateJobCache(finalJobs)

      // Update sync status
      this.currentSyncStatus.totalJobsSynced = finalJobs.length
      this.currentSyncStatus.lastSyncTime = new Date()
      this.updateNextSyncTime()

      // Notify subscribers
      this.notifySubscribers(finalJobs)

      console.log(`Sync completed successfully. Total jobs: ${finalJobs.length}`)
    } catch (error) {
      this.currentSyncStatus.errors.push(`General sync error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.error('Sync failed:', error)
    } finally {
      this.currentSyncStatus.isRunning = false
    }

    return this.currentSyncStatus
  }

  // Sync jobs from a specific source
  private async syncFromSource(source: 'rapidapi' | 'indeed' | 'linkedin' | 'stackoverflow'): Promise<Job[]> {
    const allJobs: Job[] = []
    const jobsPerQuery = Math.ceil(this.configuration.maxJobsPerSource / this.configuration.searchQueries.length)

    // If RapidAPI is the primary source, use it for most queries
    if (source === 'rapidapi') {
      for (const query of this.configuration.searchQueries) {
        for (const location of this.configuration.locations.slice(0, 3)) { // Limit locations for API efficiency
          try {
            const response = await RapidAPIJobService.searchJobs({
              query,
              location,
              num_pages: 1,
              date_posted: 'week',
              remote_jobs_only: location === 'remote'
            })

            allJobs.push(...response.jobs.slice(0, jobsPerQuery))

            // Add delay to respect API rate limits
            await this.delay(200)
          } catch (error) {
            console.error(`Error syncing ${query} in ${location} from RapidAPI:`, error)
          }
        }
      }
      return allJobs.slice(0, this.configuration.maxJobsPerSource)
    }

    // Original logic for other sources
    for (const query of this.configuration.searchQueries) {
      for (const location of this.configuration.locations) {
        try {
          let response: JobAPIResponse

          switch (source) {
            case 'indeed':
              response = await JobBoardAPIService.fetchIndeedJobs({
                query,
                location,
                limit: jobsPerQuery
              })
              break
            case 'linkedin':
              response = await JobBoardAPIService.fetchLinkedInJobs({
                keywords: query,
                limit: jobsPerQuery
              })
              break
            case 'stackoverflow':
              response = await JobBoardAPIService.fetchStackOverflowJobs({
                tags: query.replace(' ', ';'),
                limit: jobsPerQuery
              })
              break
            default:
              continue
          }

          // Transform external jobs to internal format
          const transformedJobs = JobDataTransformer.transformExternalJobs(
            response.jobs,
            {
              includeCompanyInfo: true,
              standardizeSalary: true,
              extractTechStack: true,
              enhanceDescription: true,
              filterDuplicates: false // We'll deduplicate later
            }
          )

          allJobs.push(...transformedJobs)

          // Add delay to respect API rate limits
          await this.delay(100)
        } catch (error) {
          console.error(`Error syncing ${query} in ${location} from ${source}:`, error)
        }
      }
    }

    return allJobs.slice(0, this.configuration.maxJobsPerSource)
  }

  // Remove duplicate jobs across all sources
  private removeDuplicateJobs(jobs: Job[]): Job[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase().trim()}_${job.company.toLowerCase().trim()}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  // Update job cache
  private updateJobCache(jobs: Job[]): void {
    this.jobCache.clear()
    jobs.forEach(job => {
      this.jobCache.set(job.id.toString(), job)
    })
  }

  // Get cached jobs
  getCachedJobs(): Job[] {
    return Array.from(this.jobCache.values())
  }

  // Get jobs by filters
  getFilteredJobs(filters: {
    query?: string
    location?: string
    type?: string
    company?: string
    salaryMin?: number
    limit?: number
  }): Job[] {
    let jobs = this.getCachedJobs()

    if (filters.query) {
      const query = filters.query.toLowerCase()
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.requirements.some(req => req.toLowerCase().includes(query))
      )
    }

    if (filters.location) {
      const location = filters.location.toLowerCase()
      jobs = jobs.filter(job => 
        job.location.toLowerCase().includes(location)
      )
    }

    if (filters.type) {
      jobs = jobs.filter(job => job.type === filters.type)
    }

    if (filters.company) {
      const company = filters.company.toLowerCase()
      jobs = jobs.filter(job => 
        job.company.toLowerCase().includes(company)
      )
    }

    if (filters.salaryMin) {
      jobs = jobs.filter(job => {
        const salaryNumbers = job.salary.match(/[\d,]+/g)
        if (salaryNumbers && salaryNumbers.length > 0) {
          const minSalary = parseInt(salaryNumbers[0].replace(/,/g, ''))
          return minSalary >= filters.salaryMin!
        }
        return false
      })
    }

    return jobs.slice(0, filters.limit || 50)
  }

  // Subscribe to job updates
  subscribe(callback: (jobs: Job[]) => void): () => void {
    this.subscribers.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback)
      if (index > -1) {
        this.subscribers.splice(index, 1)
      }
    }
  }

  // Notify all subscribers of job updates
  private notifySubscribers(jobs: Job[]): void {
    this.subscribers.forEach(callback => {
      try {
        callback(jobs)
      } catch (error) {
        console.error('Error notifying subscriber:', error)
      }
    })
  }

  // Get current sync status
  getSyncStatus(): SyncStatus {
    return { ...this.currentSyncStatus }
  }

  // Check if service is initialized
  isServiceInitialized(): boolean {
    return this.isInitialized
  }

  // Update configuration
  updateConfiguration(config: Partial<SyncConfiguration>): void {
    this.configuration = { ...this.configuration, ...config }
    
    if (config.autoRefresh !== undefined) {
      if (config.autoRefresh) {
        this.startScheduledSync()
      } else {
        this.stopScheduledSync()
      }
    } else if (config.syncInterval && this.syncInterval) {
      this.startScheduledSync() // Restart with new interval
    }
  }

  // Get current configuration
  getConfiguration(): SyncConfiguration {
    return { ...this.configuration }
  }

  // Force refresh from specific source
  async refreshFromSource(source: 'rapidapi' | 'indeed' | 'linkedin' | 'stackoverflow'): Promise<Job[]> {
    console.log(`Force refreshing from ${source}...`)
    return await this.syncFromSource(source)
  }

  // Get job statistics
  getJobStatistics(): {
    totalJobs: number
    jobsByType: Record<string, number>
    jobsByLocation: Record<string, number>
    jobsByCompany: Record<string, number>
    averageSalary: number
    topRequirements: Record<string, number>
  } {
    const jobs = this.getCachedJobs()
    
    const stats = {
      totalJobs: jobs.length,
      jobsByType: {} as Record<string, number>,
      jobsByLocation: {} as Record<string, number>,
      jobsByCompany: {} as Record<string, number>,
      averageSalary: 0,
      topRequirements: {} as Record<string, number>
    }

    let salarySum = 0
    let salaryCount = 0

    jobs.forEach(job => {
      // Count by type
      stats.jobsByType[job.type] = (stats.jobsByType[job.type] || 0) + 1
      
      // Count by location
      stats.jobsByLocation[job.location] = (stats.jobsByLocation[job.location] || 0) + 1
      
      // Count by company
      stats.jobsByCompany[job.company] = (stats.jobsByCompany[job.company] || 0) + 1
      
      // Calculate average salary
      const salaryNumbers = job.salary.match(/[\d,]+/g)
      if (salaryNumbers && salaryNumbers.length > 0) {
        const salary = parseInt(salaryNumbers[0].replace(/,/g, ''))
        if (salary > 1000) { // Reasonable salary check
          salarySum += salary
          salaryCount++
        }
      }
      
      // Count requirements
      job.requirements.forEach(req => {
        stats.topRequirements[req] = (stats.topRequirements[req] || 0) + 1
      })
    })

    stats.averageSalary = salaryCount > 0 ? Math.round(salarySum / salaryCount) : 0

    return stats
  }

  // Helper methods
  private updateNextSyncTime(): void {
    const nextTime = new Date()
    nextTime.setMinutes(nextTime.getMinutes() + this.configuration.syncInterval)
    this.currentSyncStatus.nextSyncTime = nextTime
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Cleanup method
  cleanup(): void {
    this.stopScheduledSync()
    this.jobCache.clear()
    this.subscribers = []
    console.log('Job sync service cleaned up')
  }
}
