import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'

// GET /api/test-db - Test MongoDB connection
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing MongoDB connection...')
    
    await connectDB()
    
    console.log('✅ MongoDB connection successful!')
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful!',
      database: 'ai-career-assistant',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    return NextResponse.json({
      success: false,
      error: 'MongoDB connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
