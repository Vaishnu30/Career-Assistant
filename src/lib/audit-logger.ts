// Audit logging utility for tracking user actions
export class AuditLogger {
  private static logs: Array<{
    timestamp: Date
    action: string
    email?: string
    ip?: string
    success: boolean
    error?: string
  }> = []

  static log(action: string, data: {
    email?: string
    ip?: string
    success: boolean
    error?: string
  }) {
    const logEntry = {
      timestamp: new Date(),
      action,
      ...data
    }
    
    // Keep only last 1000 entries in memory
    if (this.logs.length >= 1000) {
      this.logs.shift()
    }
    
    this.logs.push(logEntry)
    
    // Console log for development
    const status = data.success ? '✅' : '❌'
    const errorMsg = data.error ? ` - ${data.error}` : ''
    console.log(`${status} [${action}] ${data.email || 'Unknown'} (${data.ip || 'Unknown IP'})${errorMsg}`)
  }

  static getRecentLogs(limit: number = 50) {
    return this.logs.slice(-limit).reverse()
  }

  static getFailedAttempts(email: string, minutes: number = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    return this.logs.filter(log => 
      log.email === email && 
      !log.success && 
      log.timestamp > cutoff
    ).length
  }

  static getSuspiciousActivity(minutes: number = 10) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000)
    const recentFails = this.logs.filter(log => 
      !log.success && 
      log.timestamp > cutoff
    )
    
    // Group by IP
    const ipCounts = new Map<string, number>()
    recentFails.forEach(log => {
      const ip = log.ip || 'unknown'
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1)
    })
    
    // Return IPs with more than 5 failed attempts
    return Array.from(ipCounts.entries())
      .filter(([_, count]) => count > 5)
      .map(([ip, count]) => ({ ip, failedAttempts: count }))
  }
}
