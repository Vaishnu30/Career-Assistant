import { NextRequest, NextResponse } from 'next/server'

// Enhanced AI service with better mock responses
class AIResumeService {
  static async analyzeJob(jobDescription: string, requirements: string[]): Promise<any> {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const analysis = {
      job_focus: this.determineJobFocus(requirements),
      skill_match_percentage: this.calculateSkillMatch(requirements),
      missing_skills: this.findMissingSkills(requirements),
      recommended_skills: this.getRecommendedSkills(requirements),
      resume_highlights: this.generateHighlights(requirements),
      study_suggestions: this.generateStudySuggestions(requirements),
      company_alignment: {
        culture_fit: Math.floor(Math.random() * 20) + 75,
        tech_stack_match: Math.floor(Math.random() * 25) + 70,
        role_suitability: Math.floor(Math.random() * 15) + 80,
        growth_potential: Math.floor(Math.random() * 20) + 75,
        suggestions: [
          `Your background aligns well with this ${this.determineJobFocus(requirements).toLowerCase()} role`,
          'Consider highlighting your project experience in your cover letter',
          'Your educational background demonstrates strong foundational knowledge'
        ]
      }
    }
    
    return analysis
  }

  static determineJobFocus(requirements: string[]): string {
    const reqStr = requirements.join(' ').toLowerCase()
    
    if (reqStr.includes('react') || reqStr.includes('vue') || reqStr.includes('angular') || reqStr.includes('frontend')) {
      return 'Frontend Development'
    } else if (reqStr.includes('node') || reqStr.includes('python') || reqStr.includes('api') || reqStr.includes('backend')) {
      return 'Backend Development'
    } else if (reqStr.includes('fullstack') || reqStr.includes('full-stack') || reqStr.includes('full stack')) {
      return 'Full-Stack Development'
    } else if (reqStr.includes('data') || reqStr.includes('analytics') || reqStr.includes('machine learning')) {
      return 'Data Science'
    }
    return 'Software Development'
  }

  static calculateSkillMatch(requirements: string[]): number {
    // Simulate realistic skill matching
    const baseMatch = 60
    const randomVariation = Math.floor(Math.random() * 30)
    return Math.min(95, baseMatch + randomVariation)
  }

  static findMissingSkills(requirements: string[]): string[] {
    const allPossibleSkills = ['Docker', 'Kubernetes', 'CI/CD', 'System Design', 'GraphQL', 'Redis', 'Microservices']
    const numMissing = Math.floor(Math.random() * 3) + 1
    return allPossibleSkills.slice(0, numMissing)
  }

  static getRecommendedSkills(requirements: string[]): string[] {
    const focus = this.determineJobFocus(requirements)
    
    const recommendations: { [key: string]: string[] } = {
      'Frontend Development': ['Next.js', 'TypeScript', 'Tailwind CSS', 'Testing (Jest/Cypress)'],
      'Backend Development': ['Docker', 'Database Design', 'API Security', 'Cloud Platforms'],
      'Full-Stack Development': ['DevOps', 'System Architecture', 'Performance Optimization', 'Security'],
      'Data Science': ['Machine Learning', 'Data Visualization', 'Statistical Analysis', 'Big Data'],
      'Software Development': ['Clean Code', 'Design Patterns', 'Agile Methodologies', 'Version Control']
    }
    
    return recommendations[focus] || recommendations['Software Development']
  }

  static generateHighlights(requirements: string[]): string[] {
    const focus = this.determineJobFocus(requirements)
    
    return [
      `Emphasized ${focus.toLowerCase()} skills matching job requirements`,
      `Highlighted relevant project experience with ${requirements.slice(0, 2).join(' and ')}`,
      'Tailored professional summary for the target role',
      'Reorganized experience section to prioritize most relevant achievements',
      'Added technical keywords for ATS optimization'
    ]
  }

  static generateStudySuggestions(requirements: string[]): any[] {
    const missingSkills = this.findMissingSkills(requirements)
    
    return missingSkills.map(skill => ({
      skill,
      priority: Math.random() > 0.5 ? 'High' : 'Medium',
      estimated_time: ['1-2 weeks', '2-4 weeks', '1 month', '2-3 weeks'][Math.floor(Math.random() * 4)],
      resources: [
        {
          name: `Learn ${skill} - Complete Course`,
          type: 'Course',
          url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
          free: false,
          duration: '4-8 hours'
        },
        {
          name: `${skill} Documentation`,
          type: 'Documentation',
          url: '#',
          free: true
        }
      ]
    }))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_profile, job, customization_preferences } = body

    // Validate input
    if (!user_profile || !job) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Step 1: Analyze the job description
    const aiAnalysis = await AIResumeService.analyzeJob(
      job.description,
      job.requirements
    )

    // Step 2: Generate customized resume content
    const customizedContent = {
      personal_info: user_profile,
      tailored_summary: `${aiAnalysis.job_focus} specialist with expertise in ${job.requirements.slice(0, 3).join(', ')}. Passionate about building scalable solutions and contributing to innovative projects at ${job.company}.`,
      highlighted_skills: job.requirements.filter((req: string) => 
        user_profile.skills.some((skill: string) => 
          skill.toLowerCase().includes(req.toLowerCase()) || 
          req.toLowerCase().includes(skill.toLowerCase())
        )
      ).slice(0, 8),
      relevant_experience: user_profile.experience,
      relevant_projects: user_profile.projects.filter((project: any) => 
        job.requirements.some((req: string) => 
          project.technologies.toLowerCase().includes(req.toLowerCase())
        )
      ),
      relevant_education: user_profile.education
    }

    // Step 3: Create final resume object
    const customResume = {
      user_id: user_profile.email,
      job_id: job.id,
      content: customizedContent,
      ai_analysis: aiAnalysis,
      created_at: new Date()
    }

    return NextResponse.json({
      success: true,
      data: customResume,
      message: 'Resume generated successfully'
    })

  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}
