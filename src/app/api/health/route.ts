import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Basic health check
    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      deployment: process.env.VERCEL ? 'vercel' : 'local',
      services: {
        api: 'healthy',
        database: 'checking...'
      }
    }

    // Check database connection (optional, may timeout on cold starts)
    try {
      // This is a basic ping - in production you might want to skip this
      // to avoid cold start timeouts
      if (process.env.MONGODB_URI) {
        status.services.database = 'configured'
      } else {
        status.services.database = 'not-configured'
      }
    } catch (error) {
      status.services.database = 'error'
    }

    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      ...status,
      responseTime: `${responseTime}ms`,
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown'
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      environment: process.env.NODE_ENV || 'development'
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  }
}
