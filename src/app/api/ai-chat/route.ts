import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, message, context } = await request.json()

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.log('No OpenAI API key configured, using fallback response')
      return NextResponse.json({
        response: getIntelligentFallback(message, context),
        success: true,
        source: 'fallback'
      })
    }

    // Try OpenAI API with better error handling
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo', // Use gpt-3.5-turbo as it's more reliable and cheaper
          messages: [
            {
              role: 'system',
              content: buildSystemPrompt(context)
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`OpenAI API error ${response.status}:`, errorText)
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const aiResponse = data.choices[0].message.content

      return NextResponse.json({
        response: aiResponse,
        success: true,
        source: 'openai'
      })

    } catch (openaiError) {
      console.error('OpenAI API failed, using fallback:', openaiError)
      // If OpenAI fails, use intelligent fallback
      return NextResponse.json({
        response: getIntelligentFallback(message, context),
        success: true,
        source: 'fallback'
      })
    }

  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
        success: false 
      },
      { status: 500 }
    )
  }
}

function buildSystemPrompt(context: any): string {
  const { type, profile, skillGaps, jobTitle } = context || {}
  
  if (type === 'study_planner') {
    return `You are an AI Career Coach and Study Planner specializing in helping software developers advance their careers. 

Current context:
- User: ${profile?.name || 'User'}
- Target Role: ${jobTitle || 'Software Developer'}
- Skill Gaps: ${skillGaps?.join(', ') || 'None identified'}
- Experience Level: ${profile?.experience?.length ? 'Experienced' : 'Entry Level'}

Your role is to provide:
1. Personalized learning recommendations
2. Skill assessment guidance
3. Career development advice
4. Study plans and resource suggestions
5. Progress tracking strategies

Be encouraging, specific, and practical. Include concrete steps and resources when possible.`
  }

  return 'You are a helpful AI assistant specializing in career development and technical education.'
}

function getIntelligentFallback(message: string, context: any): string {
  const lowerMessage = message.toLowerCase()
  const { profile, skillGaps, jobTitle } = context || {}
  
  // Skill Assessment Responses
  if (lowerMessage.includes('assess') || lowerMessage.includes('skill') || lowerMessage.includes('level')) {
    return `🎯 **Skill Assessment for ${jobTitle || 'Software Developer'}**

Based on your profile and current market demands, here's my assessment:

**Your Strong Areas:**
${(profile?.skills as string[])?.slice(0, 3).map((skill: string) => `• ${skill} - Good foundation`).join('\n') || '• Core programming concepts\n• Problem-solving abilities\n• Technical communication'}

**Areas for Development:**
${(skillGaps as string[])?.slice(0, 3).map((gap: string) => `• ${gap} - High priority for ${jobTitle}`).join('\n') || '• Advanced algorithms and data structures\n• System design patterns\n• Cloud technologies'}

**Next Steps:**
1. Take coding assessments on HackerRank or LeetCode
2. Build projects demonstrating your skills
3. Consider relevant certifications
4. Practice technical interviews

Would you like me to create a detailed learning path for any specific technology?`
  }

  // Learning Path Responses
  if (lowerMessage.includes('learn') || lowerMessage.includes('path') || lowerMessage.includes('plan') || lowerMessage.includes('study')) {
    return `📚 **Personalized Learning Path for ${jobTitle || 'Software Developer'}**

**Phase 1: Foundation Building (2-4 weeks)**
• Master fundamentals in your weak areas
• Complete hands-on tutorials and documentation
• Build small practice projects to reinforce learning

**Phase 2: Practical Application (4-6 weeks)**
• Work on intermediate projects
• Contribute to open source repositories
• Join developer communities and forums

**Phase 3: Advanced Mastery (6-8 weeks)**
• Build comprehensive portfolio projects
• Practice system design and architecture
• Prepare for technical interviews and assessments

**Recommended Resources:**
• **Free:** freeCodeCamp, MDN Web Docs, official documentation
• **Paid:** Udemy courses, Pluralsight, Frontend Masters
• **Practice:** LeetCode, HackerRank, CodePen
• **Community:** GitHub, Stack Overflow, Discord servers

Focus on: ${skillGaps?.slice(0, 2).join(' and ') || 'core technologies relevant to your target role'}`
  }

  // Resource Recommendations
  if (lowerMessage.includes('resource') || lowerMessage.includes('course') || lowerMessage.includes('tutorial') || lowerMessage.includes('material')) {
    return `📖 **Top Learning Resources for ${jobTitle || 'Software Developer'}**

**Free Resources:**
• **freeCodeCamp** - Comprehensive full-stack bootcamp
• **MDN Web Docs** - Excellent for web technologies
• **YouTube Channels:** Traversy Media, The Net Ninja, Programming with Mosh
• **Official Documentation** - Always the most up-to-date source

**Premium Courses:**
• **Udemy** - Project-based learning with lifetime access
• **Pluralsight** - In-depth technical content and assessments
• **Coursera** - University-level courses with certificates
• **Frontend Masters** - Advanced frontend development topics

**Practice Platforms:**
• **LeetCode** - Algorithm and data structure practice
• **HackerRank** - Coding challenges and assessments
• **CodePen** - Frontend experimentation and demos
• **GitHub** - Version control and portfolio building

**For your skill gaps:** ${skillGaps?.slice(0, 2).join(' and ') || 'Focus on modern frameworks and cloud technologies'}

Would you like specific course recommendations for any technology?`
  }

  // Progress Tracking
  if (lowerMessage.includes('progress') || lowerMessage.includes('track') || lowerMessage.includes('measure')) {
    return `📈 **Progress Tracking Strategy**

**Your Current Status:**
• Profile: ${profile?.name || 'Developer'}
• Target Role: ${jobTitle || 'Software Developer'}
• Identified Gaps: ${skillGaps?.length || 0} skills to develop

**Tracking Methods:**
1. **Weekly Goals** - Set specific, measurable learning targets
2. **Project Milestones** - Complete projects to demonstrate progress
3. **Skill Assessments** - Regular quizzes and coding challenges
4. **Portfolio Updates** - Document your learning journey

**Key Metrics to Monitor:**
• Hours spent learning each week (aim for 10-15 hours)
• Projects completed and deployed
• Certifications or courses finished
• GitHub commit frequency
• Interview performance improvements

**Recommended Tools:**
• **GitHub** - Track code commits and project progress
• **Learning Platforms** - Use built-in progress tracking
• **Personal Journal** - Document insights and breakthroughs
• **Calendar Blocking** - Schedule dedicated learning time

**Weekly Review Questions:**
- What new concepts did I master?
- Which projects did I complete or advance?
- What challenges did I overcome?
- What should I focus on next week?`
  }

  // Career Guidance
  if (lowerMessage.includes('career') || lowerMessage.includes('job') || lowerMessage.includes('interview') || lowerMessage.includes('resume')) {
    return `🚀 **Career Development Guidance for ${jobTitle || 'Software Developer'}**

**Market Insights (2025):**
• High demand skills: React, TypeScript, Cloud (AWS/Azure), Python
• Remote work: 70% of tech positions offer remote options
• Salary ranges: Entry $65-85k, Mid $85-120k, Senior $120-180k+

**Job Preparation Strategy:**
1. **Portfolio Development** - 3-5 strong projects showcasing different skills
2. **Resume Optimization** - Highlight relevant technologies and achievements
3. **Interview Practice** - Technical questions, system design, behavioral
4. **Networking** - LinkedIn, tech meetups, online communities

**For your profile:**
• Strengthen: ${skillGaps?.slice(0, 2).join(' and ') || 'core technical skills'}
• Timeline: 3-6 months of focused preparation
• Next step: Build a project using ${skillGaps?.[0] || 'your target technology'}

**Interview Preparation:**
• Practice coding problems daily (30-60 minutes)
• Study system design fundamentals
• Prepare behavioral stories using STAR method
• Mock interviews with peers or platforms like Pramp

Would you like help with any specific aspect of job preparation?`
  }

  // Default helpful response
  return `I understand you're asking about: "${message}"

I'm here to help you with your software development career! I can assist with:

🎯 **Skill Assessment** - Evaluate your current technical level
📚 **Learning Plans** - Create personalized study roadmaps  
📖 **Resources** - Recommend courses, tutorials, and practice platforms
📈 **Progress Tracking** - Monitor your learning journey
🚀 **Career Guidance** - Job preparation and market insights

**Quick Suggestions for ${jobTitle || 'your career'}:**
• Focus on: ${skillGaps?.slice(0, 2).join(' and ') || 'high-demand technologies'}
• Build projects to demonstrate your skills
• Practice coding challenges regularly
• Stay updated with industry trends

Try asking me something like:
• "Assess my React skills"
• "Create a learning path for Python"
• "What resources do you recommend for TypeScript?"
• "How can I track my progress?"

What would you like to explore first?`
}
