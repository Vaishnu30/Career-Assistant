import { NextRequest, NextResponse } from 'next/server'
import { JobSyncService } from '@/lib/job-sync-service'
import { DatabaseService } from '@/lib/database-service'

// GET /api/jobs - Get synchronized jobs with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      query: searchParams.get('q') || undefined,
      location: searchParams.get('location') || undefined,
      type: searchParams.get('type') || undefined,
      company: searchParams.get('company') || undefined,
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    }

    // Try to get jobs from database first
    const dbResult = await DatabaseService.getJobs({
      location: filters.location,
      limit: filters.limit
    })

    if (dbResult.success && dbResult.jobs && dbResult.jobs.length > 0) {
      // Return jobs from database
      return NextResponse.json({
        success: true,
        data: {
          jobs: dbResult.jobs,
          totalCount: dbResult.jobs.length,
          source: 'database',
          message: 'Jobs loaded from database'
        }
      })
    } else {
      // Fallback to in-memory jobs from sync service
      const syncService = JobSyncService.getInstance()
      
      // Only initialize if not already initialized to prevent repeated syncing
      if (!syncService.isServiceInitialized()) {
        console.log('🔄 Initializing sync service for the first time...')
        await syncService.initialize({
          sources: ['rapidapi'], // Only use RapidAPI to avoid authentication issues
          useRapidAPIAsPrimary: true
        })
      } else {
        console.log('✅ Sync service already initialized, skipping initialization')
      }
      
      const jobs = syncService.getFilteredJobs(filters)
      const status = syncService.getSyncStatus()
      const stats = syncService.getJobStatistics()

      return NextResponse.json({
        success: true,
        data: {
          jobs,
          totalCount: jobs.length,
          syncStatus: status,
          statistics: stats,
          source: 'memory',
          message: 'Jobs loaded from memory (database empty)'
        }
      })
    }
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Trigger manual sync or update configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    const syncService = JobSyncService.getInstance()

    switch (action) {
      case 'sync':
        const syncResult = await syncService.performSync()
        
        // Get synced jobs and save to database
        const jobs = syncService.getFilteredJobs({ limit: 1000 }) // Get all jobs
        if (jobs.length > 0) {
          const saveResult = await DatabaseService.saveJobs(jobs)
          console.log(`💾 Saved ${saveResult.saved || 0} jobs to database`)
        }
        
        return NextResponse.json({
          success: true,
          data: {
            syncStatus: syncResult,
            jobsSaved: jobs.length,
            message: `Sync completed successfully. ${jobs.length} jobs saved to database.`
          }
        })

      case 'configure':
        if (config) {
          syncService.updateConfiguration(config)
          return NextResponse.json({
            success: true,
            data: {
              configuration: syncService.getConfiguration(),
              message: 'Configuration updated successfully'
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            error: 'Configuration data required'
          }, { status: 400 })
        }

      case 'initialize':
        await syncService.initialize(config)
        return NextResponse.json({
          success: true,
          data: {
            syncStatus: syncService.getSyncStatus(),
            configuration: syncService.getConfiguration(),
            message: 'Job sync service initialized successfully'
          }
        })

      case 'refresh':
        const source = body.source
        if (source && ['rapidapi', 'indeed', 'linkedin', 'stackoverflow'].includes(source)) {
          const jobs = await syncService.refreshFromSource(source)
          return NextResponse.json({
            success: true,
            data: {
              jobs,
              count: jobs.length,
              message: `Refreshed ${jobs.length} jobs from ${source}`
            }
          })
        } else {
          return NextResponse.json({
            success: false,
            error: 'Valid source required for refresh action. Options: rapidapi, indeed, linkedin, stackoverflow'
          }, { status: 400 })
        }

      case 'status':
        return NextResponse.json({
          success: true,
          data: {
            syncStatus: syncService.getSyncStatus(),
            configuration: syncService.getConfiguration(),
            statistics: syncService.getJobStatistics()
          }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Valid actions: sync, configure, initialize, refresh, status'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in jobs API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
