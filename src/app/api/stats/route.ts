import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { ValidationUtils } from '@/lib/validation-utils'
import { AuditLogger } from '@/lib/audit-logger'

// GET /api/stats - Get application statistics and audit logs
export async function GET(request: NextRequest) {
  try {
    // Get database stats
    const dbResult = await DatabaseService.getStats()
    
    // Get audit information
    const recentLogs = AuditLogger.getRecentLogs(20)
    const suspiciousActivity = AuditLogger.getSuspiciousActivity(30)
    
    const enhancedStats = {
      timestamp: new Date().toISOString(),
      database: dbResult.success ? dbResult.stats : { error: dbResult.error },
      security: {
        recentActivity: recentLogs,
        suspiciousIPs: suspiciousActivity,
        recentFailures: recentLogs.filter(log => !log.success).length,
        recentSuccesses: recentLogs.filter(log => log.success).length
      },
      system: {
        status: dbResult.success ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString()
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      stats: enhancedStats 
    }, {
      headers: ValidationUtils.getSecurityHeaders()
    })
  } catch (error) {
    console.error('Stats API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve statistics' 
    }, { 
      status: 500,
      headers: ValidationUtils.getSecurityHeaders()
    })
  }
}
