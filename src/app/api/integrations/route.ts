import { NextRequest, NextResponse } from 'next/server'
import { descopeService } from '@/lib/descope-external-service'

// GET /api/integrations - Get user's connected services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const connectedServices = await descopeService.getUserConnectedServices(userId)
    
    return NextResponse.json({
      success: true,
      data: {
        connectedServices,
        availableServices: ['github', 'google-calendar', 'slack'],
        message: `Found ${connectedServices.length} connected services`
      }
    })
  } catch (error) {
    console.error('Error fetching integrations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch integrations' },
      { status: 500 }
    )
  }
}

// POST /api/integrations - Trigger integration actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, serviceId, data } = body

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'analyze-github':
        result = await descopeService.analyzeGitHubPortfolio(userId)
        
        // Send notification about analysis completion
        await descopeService.sendCareerNotification(userId, {
          title: '🎯 Portfolio Analysis Complete!',
          message: `Your GitHub portfolio has been analyzed. Found ${result.totalRepos} repositories with ${result.languages.length} programming languages.`
        })
        
        return NextResponse.json({
          success: true,
          data: result,
          message: 'GitHub portfolio analysis completed successfully'
        })

      case 'schedule-interview':
        if (!data.jobTitle || !data.company) {
          return NextResponse.json(
            { success: false, error: 'Job title and company are required' },
            { status: 400 }
          )
        }

        const interviewData = {
          jobTitle: data.jobTitle,
          company: data.company,
          jobDescription: data.jobDescription || '',
          startTime: data.startTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endTime: data.endTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          userEmail: data.userEmail || 'user@example.com',
          interviewerEmail: data.interviewerEmail || 'hr@company.com'
        }

        result = await descopeService.scheduleInterview(userId, interviewData)
        
        // Send notification about scheduled interview
        await descopeService.sendCareerNotification(userId, {
          title: '📅 Interview Scheduled!',
          message: `Your interview for ${data.jobTitle} at ${data.company} has been scheduled. Check your calendar for details.`
        })
        
        return NextResponse.json({
          success: true,
          data: result,
          message: 'Interview scheduled successfully'
        })

      case 'send-notification':
        if (!data.title || !data.message) {
          return NextResponse.json(
            { success: false, error: 'Title and message are required' },
            { status: 400 }
          )
        }

        const notificationSent = await descopeService.sendCareerNotification(userId, {
          title: data.title,
          message: data.message,
          channel: data.channel
        })
        
        return NextResponse.json({
          success: true,
          data: { sent: notificationSent },
          message: notificationSent ? 'Notification sent successfully' : 'Failed to send notification'
        })

      case 'get-connection-url':
        if (!serviceId) {
          return NextResponse.json(
            { success: false, error: 'Service ID is required' },
            { status: 400 }
          )
        }

        const connectionUrl = descopeService.getConnectionUrl(serviceId, userId)
        
        return NextResponse.json({
          success: true,
          data: { connectionUrl },
          message: `Connection URL generated for ${serviceId}`
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error processing integration action:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
