import { NextRequest, NextResponse } from 'next/server'
import { JobSyncService } from '@/lib/job-sync-service'

// POST /api/test-job-sync - Test job synchronization with safe configuration
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing job sync with safe configuration...')
    
    const syncService = JobSyncService.getInstance()
    
    // Initialize with safe configuration (RapidAPI only)
    await syncService.initialize({
      sources: ['rapidapi'], // Only use RapidAPI
      searchQueries: ['software developer', 'web developer'],
      locations: ['remote', 'san francisco'],
      maxJobsPerSource: 10,
      useRapidAPIAsPrimary: true
    })
    
    console.log('✅ Job sync service initialized successfully')
    
    // Perform a test sync
    const syncResult = await syncService.performSync()
    
    console.log('🔄 Sync completed:', syncResult)
    
    // Get the synced jobs
    const jobs = syncService.getFilteredJobs({ limit: 20 })
    
    console.log(`📊 Retrieved ${jobs.length} jobs from sync`)
    
    return NextResponse.json({
      success: true,
      data: {
        syncStatus: syncResult,
        jobCount: jobs.length,
        sampleJobs: jobs.slice(0, 3), // Return first 3 jobs as samples
        configuration: syncService.getConfiguration(),
        message: 'Job sync test completed successfully'
      }
    })
  } catch (error) {
    console.error('❌ Job sync test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Job sync test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
