import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'

// GET /api/debug-users - Debug endpoint to check users in database
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    // Get all users (without passwords for security)
    const users = await User.find({}, {
      email: 1,
      name: 1,
      isRegistered: 1,
      createdAt: 1,
      updatedAt: 1,
      password: 1 // Include for debugging purposes only
    }).limit(10)
    
    const userDebugInfo = users.map(user => ({
      email: user.email,
      name: user.name,
      isRegistered: user.isRegistered,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
      passwordPreview: user.password ? `${user.password.substring(0, 10)}...` : 'N/A',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))
    
    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users: userDebugInfo
    })
  } catch (error) {
    console.error('❌ Debug users error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
