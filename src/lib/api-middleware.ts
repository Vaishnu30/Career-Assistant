import { NextRequest, NextResponse } from 'next/server'

export interface ExtendedNextRequest extends NextRequest {
  userId?: string
  rateLimit?: {
    limit: number
    remaining: number
    reset: Date
  }
}

// Rate limiting configuration by endpoint
const RATE_LIMITS: Record<string, { requests: number; window: string }> = {
  '/api/ai-chat': { requests: 30, window: '1m' },
  '/api/generate-resume': { requests: 5, window: '1m' },
  '/api/skill-assessment': { requests: 10, window: '1m' },
  '/api/learning-progress': { requests: 100, window: '1m' },
  '/api/jobs': { requests: 50, window: '1m' },
  default: { requests: 100, window: '1m' }
}

// Authentication middleware
export async function authMiddleware(request: ExtendedNextRequest): Promise<NextResponse | null> {
  // Skip auth for public endpoints
  const publicEndpoints = ['/api/health', '/api/auth/verify']
  if (publicEndpoints.some(endpoint => request.nextUrl.pathname.startsWith(endpoint))) {
    return null
  }

  try {
    // Extract user ID from Descope session token
    const authHeader = request.headers.get('authorization')
    const sessionToken = authHeader?.replace('Bearer ', '') || 
                        request.cookies.get('DS')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTH_REQUIRED' },
        { status: 401 }
      )
    }

    // Verify session with Descope (simplified - in production use Descope SDK)
    const userId = await verifyDescopeSession(sessionToken)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid session', code: 'INVALID_SESSION' },
        { status: 401 }
      )
    }

    // Add user ID to request
    request.userId = userId
    return null // Continue to next middleware

  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', code: 'AUTH_FAILED' },
      { status: 401 }
    )
  }
}

// Rate limiting middleware
export async function rateLimitMiddleware(request: ExtendedNextRequest): Promise<NextResponse | null> {
  try {
    const pathname = request.nextUrl.pathname
    const config = RATE_LIMITS[pathname] || RATE_LIMITS.default
    
    // Use IP and user ID for rate limiting key
    const identifier = request.userId || 
                      request.ip || 
                      request.headers.get('x-forwarded-for') || 
                      'anonymous'
    
    const key = `ratelimit:${pathname}:${identifier}`
    
    // Check rate limit (implement this based on your rate limiting solution)
    const { success, limit, remaining, reset } = await checkRateLimit(key, config)
    
    if (!success) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          code: 'RATE_LIMIT_EXCEEDED',
          limit,
          remaining: 0,
          reset: reset.toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.getTime().toString(),
            'Retry-After': Math.ceil((reset.getTime() - Date.now()) / 1000).toString()
          }
        }
      )
    }

    // Add rate limit info to request
    request.rateLimit = { limit, remaining, reset }
    return null // Continue to next middleware

  } catch (error) {
    console.error('Rate limit middleware error:', error)
    // Don't block requests on rate limit errors
    return null
  }
}

// Error handling middleware
export function errorMiddleware(error: any, request: NextRequest): NextResponse {
  console.error('API Error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString()
  })

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        code: 'VALIDATION_ERROR',
        details: isDevelopment ? error.details : undefined
      },
      { status: 400 }
    )
  }

  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    return NextResponse.json(
      { 
        error: 'Database error', 
        code: 'DATABASE_ERROR',
        details: isDevelopment ? error.message : undefined
      },
      { status: 500 }
    )
  }

  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return NextResponse.json(
      { 
        error: 'External service unavailable', 
        code: 'SERVICE_UNAVAILABLE'
      },
      { status: 503 }
    )
  }

  // Generic error response
  return NextResponse.json(
    { 
      error: isDevelopment ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
      requestId: generateRequestId()
    },
    { status: 500 }
  )
}

// Logging middleware
export function loggingMiddleware(request: NextRequest, response: NextResponse) {
  const startTime = Date.now()
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`, {
    headers: Object.fromEntries(request.headers.entries()),
    userAgent: request.headers.get('user-agent'),
    ip: request.ip || request.headers.get('x-forwarded-for')
  })

  // Log response (this would be called after response is ready)
  const duration = Date.now() - startTime
  console.log(`[${new Date().toISOString()}] ${response.status} ${request.method} ${request.url} - ${duration}ms`)
}

// Security headers middleware
export function securityMiddleware(response: NextResponse): NextResponse {
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CORS headers for API routes
  response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

// Validation middleware factory
export function createValidationMiddleware<T>(schema: any) {
  return async (request: NextRequest): Promise<{ data: T } | NextResponse> => {
    try {
      const body = await request.json()
      const validatedData = schema.parse(body) as T
      return { data: validatedData }
    } catch (error: any) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          code: 'VALIDATION_ERROR',
          details: error?.errors || error?.message
        },
        { status: 400 }
      )
    }
  }
}

// Health check endpoint
export async function healthCheck(): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Check database connection
    const dbStatus = await checkDatabaseHealth()
    
    // Check external services
    const externalServices = await Promise.allSettled([
      checkOpenAIHealth(),
      checkRapidAPIHealth(),
      checkDescopeHealth()
    ])

    const responseTime = Date.now() - startTime

    const status = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbStatus,
        openai: externalServices[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        rapidapi: externalServices[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
        descope: externalServices[2].status === 'fulfilled' ? 'healthy' : 'unhealthy'
      }
    }

    const httpStatus = Object.values(status.services).some(s => s === 'unhealthy') ? 503 : 200

    return NextResponse.json(status, { status: httpStatus })

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error?.message || 'Unknown error'
      },
      { status: 503 }
    )
  }
}

// Helper functions
async function verifyDescopeSession(sessionToken: string): Promise<string | null> {
  try {
    // In production, use Descope SDK to verify session
    // This is a simplified version
    const response = await fetch(`${process.env.DESCOPE_BASE_URL}/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.user?.id || null
  } catch {
    return null
  }
}

async function checkRateLimit(key: string, config: any): Promise<{
  success: boolean
  limit: number
  remaining: number
  reset: Date
}> {
  // Implement rate limiting logic using Redis, memory store, or database
  // This is a simplified version
  const limit = config.requests
  const windowMs = parseTimeWindow(config.window)
  const reset = new Date(Date.now() + windowMs)
  
  // In production, implement proper rate limiting
  return {
    success: true,
    limit,
    remaining: limit - 1,
    reset
  }
}

function parseTimeWindow(window: string): number {
  const unit = window.slice(-1)
  const value = parseInt(window.slice(0, -1))
  
  switch (unit) {
    case 's': return value * 1000
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    default: return 60 * 1000 // Default to 1 minute
  }
}

async function checkDatabaseHealth(): Promise<string> {
  try {
    // Implement database health check
    return 'healthy'
  } catch {
    return 'unhealthy'
  }
}

async function checkOpenAIHealth(): Promise<void> {
  // Implement OpenAI health check
}

async function checkRapidAPIHealth(): Promise<void> {
  // Implement RapidAPI health check
}

async function checkDescopeHealth(): Promise<void> {
  // Implement Descope health check
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// Module exports - functions are already exported above
