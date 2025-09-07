// AI and utility functions for the Career Assistant

export class AIService {
  private static readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY
  private static readonly OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4'

  // Analyze job description and extract key information
  static async analyzeJobDescription(jobDescription: string, requirements: string[]) {
    try {
      // Try real OpenAI API if available, otherwise use intelligent mock
      if (this.OPENAI_API_KEY) {
        return await this.callOpenAI(jobDescription, requirements)
      } else {
        return await this.intelligentMockAnalysis(jobDescription, requirements)
      }
    } catch (error) {
      console.error('Job analysis error:', error)
      // Fallback to mock analysis
      return await this.intelligentMockAnalysis(jobDescription, requirements)
    }
  }

  private static async callOpenAI(jobDescription: string, requirements: string[]) {
    const prompt = `
    Analyze this job description and requirements to help a student customize their resume:
    
    Job Description: ${jobDescription}
    Requirements: ${requirements.join(', ')}
    
    Please provide a JSON response with:
    1. focus_area: Primary technology focus (Frontend, Backend, Full-stack, Data Science, etc.)
    2. key_technologies: Array of most important technologies mentioned
    3. experience_level: Required experience level (Entry, Junior, Mid, Senior)
    4. culture_indicators: Array of company culture signals
    5. skill_match_percentage: Estimated match if user has modern web dev skills
    6. missing_skills: Skills that would improve candidacy
    7. recommended_skills: Top 3 skills to learn for this role
    8. study_suggestions: Learning resources and timeline recommendations
    `

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert career coach and technical recruiter. Analyze job descriptions to help students optimize their resumes and career development.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const analysis = JSON.parse(data.choices[0].message.content)
      
      return {
        job_focus: analysis.focus_area,
        skill_match_percentage: analysis.skill_match_percentage,
        missing_skills: analysis.missing_skills,
        recommended_skills: analysis.recommended_skills,
        study_suggestions: analysis.study_suggestions,
        key_technologies: analysis.key_technologies,
        experience_level: analysis.experience_level,
        culture_indicators: analysis.culture_indicators
      }
    } catch (error) {
      console.error('OpenAI API call failed:', error)
      throw error
    }
  }

  private static async intelligentMockAnalysis(jobDescription: string, requirements: string[]) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const analysisData = {
      focus_area: this.determineFocusArea(requirements),
      key_technologies: this.extractTechnologies(requirements),
      experience_level: this.determineExperienceLevel(jobDescription),
      culture_indicators: this.extractCultureIndicators(jobDescription),
      skill_match_percentage: this.calculateSkillMatch(requirements),
      missing_skills: this.identifyMissingSkills(requirements),
      recommended_skills: this.getTopRecommendations(requirements),
      study_suggestions: this.generateDetailedStudySuggestions(requirements)
    }

    return {
      job_focus: analysisData.focus_area,
      skill_match_percentage: analysisData.skill_match_percentage,
      missing_skills: analysisData.missing_skills,
      recommended_skills: analysisData.recommended_skills,
      study_suggestions: analysisData.study_suggestions,
      key_technologies: analysisData.key_technologies,
      experience_level: analysisData.experience_level,
      culture_indicators: analysisData.culture_indicators
    }
  }

  private static calculateSkillMatch(requirements: string[]): number {
    // Simulate intelligent skill matching
    const commonSkills = ['javascript', 'html', 'css', 'git', 'react']
    const matches = requirements.filter(req => 
      commonSkills.some(skill => req.toLowerCase().includes(skill))
    )
    return Math.round((matches.length / requirements.length) * 100)
  }

  private static identifyMissingSkills(requirements: string[]): string[] {
    const userSkills = ['javascript', 'html', 'css', 'git'] // Mock user skills
    return requirements.filter(req => 
      !userSkills.some(skill => req.toLowerCase().includes(skill.toLowerCase()))
    ).slice(0, 3)
  }

  private static getTopRecommendations(requirements: string[]): string[] {
    const prioritySkills = ['typescript', 'react', 'node.js', 'python', 'aws']
    return requirements.filter(req => 
      prioritySkills.some(skill => req.toLowerCase().includes(skill.toLowerCase()))
    ).slice(0, 3)
  }

  private static generateDetailedStudySuggestions(requirements: string[]): Array<{
    skill: string
    priority: string
    timeline: string
    resources: string[]
  }> {
    return requirements.slice(0, 3).map(skill => ({
      skill,
      priority: ['typescript', 'react', 'node.js'].some(priority => 
        skill.toLowerCase().includes(priority)
      ) ? 'High' : 'Medium',
      timeline: '2-4 weeks',
      resources: [
        `${skill} Official Documentation`,
        `${skill} Course on Udemy/Coursera`,
        `Build a project using ${skill}`
      ]
    }))
  }

  // Generate skill gap analysis
  static analyzeSkillGap(userSkills: string[], jobRequirements: string[]) {
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase())
    const normalizedJobReqs = jobRequirements.map(req => req.toLowerCase())

    const matchedSkills = normalizedJobReqs.filter(req =>
      normalizedUserSkills.some(skill => 
        skill.includes(req) || req.includes(skill)
      )
    )

    const missingSkills = normalizedJobReqs.filter(req =>
      !normalizedUserSkills.some(skill => 
        skill.includes(req) || req.includes(skill)
      )
    )

    const matchPercentage = Math.round((matchedSkills.length / normalizedJobReqs.length) * 100)

    return {
      matched_skills: matchedSkills,
      missing_skills: missingSkills,
      match_percentage: matchPercentage,
      suggestions: this.generateSkillSuggestions(missingSkills)
    }
  }

  // Generate personalized study recommendations
  static generateStudyPlan(missingSkills: string[], userLevel: string = 'intermediate') {
    return missingSkills.map(skill => ({
      skill,
      priority: this.getSkillPriority(skill),
      estimated_time: this.getEstimatedLearningTime(skill, userLevel),
      resources: this.getRecommendedResources(skill),
      learning_path: this.generateLearningPath(skill)
    }))
  }

  // Public method to get skill priority
  static getPublicSkillPriority(skill: string): 'High' | 'Medium' | 'Low' {
    return this.getSkillPriority(skill)
  }

  // Public method to get learning time estimate
  static getPublicLearningTime(skill: string, userLevel: string = 'intermediate'): string {
    return this.getEstimatedLearningTime(skill, userLevel)
  }

  // Public method to get recommended resources
  static getPublicResources(skill: string) {
    return this.getRecommendedResources(skill)
  }

  // Helper methods
  private static determineFocusArea(requirements: string[]): string {
    const reqString = requirements.join(' ').toLowerCase()
    
    if (reqString.includes('react') || reqString.includes('vue') || reqString.includes('angular')) {
      return 'Frontend Development'
    } else if (reqString.includes('node') || reqString.includes('python') || reqString.includes('api')) {
      return 'Backend Development'
    } else if (reqString.includes('fullstack') || reqString.includes('full-stack')) {
      return 'Full-Stack Development'
    } else if (reqString.includes('data') || reqString.includes('analytics')) {
      return 'Data Science'
    } else if (reqString.includes('mobile') || reqString.includes('ios') || reqString.includes('android')) {
      return 'Mobile Development'
    }
    return 'Software Development'
  }

  private static extractTechnologies(requirements: string[]): string[] {
    const techKeywords = [
      'react', 'vue', 'angular', 'node', 'python', 'java', 'javascript', 'typescript',
      'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'docker', 'kubernetes',
      'git', 'html', 'css', 'sass', 'tailwind', 'bootstrap'
    ]
    
    const found = new Set<string>()
    requirements.forEach(req => {
      techKeywords.forEach(tech => {
        if (req.toLowerCase().includes(tech)) {
          found.add(tech)
        }
      })
    })
    
    return Array.from(found)
  }

  private static determineExperienceLevel(jobDescription: string): string {
    const desc = jobDescription.toLowerCase()
    if (desc.includes('senior') || desc.includes('lead') || desc.includes('architect')) {
      return 'Senior'
    } else if (desc.includes('junior') || desc.includes('entry') || desc.includes('intern')) {
      return 'Junior'
    }
    return 'Mid-level'
  }

  private static extractCultureIndicators(jobDescription: string): string[] {
    const indicators = []
    const desc = jobDescription.toLowerCase()
    
    if (desc.includes('agile') || desc.includes('scrum')) indicators.push('Agile methodology')
    if (desc.includes('remote') || desc.includes('flexible')) indicators.push('Remote-friendly')
    if (desc.includes('startup') || desc.includes('fast-paced')) indicators.push('Startup culture')
    if (desc.includes('collaborative') || desc.includes('team')) indicators.push('Collaborative environment')
    if (desc.includes('innovation') || desc.includes('cutting-edge')) indicators.push('Innovation-focused')
    
    return indicators
  }

  private static assessGrowthPotential(jobDescription: string): string {
    const desc = jobDescription.toLowerCase()
    if (desc.includes('growth') || desc.includes('career development') || desc.includes('mentorship')) {
      return 'High'
    } else if (desc.includes('learning') || desc.includes('training')) {
      return 'Medium'
    }
    return 'Standard'
  }

  private static generateSkillSuggestions(missingSkills: string[]): string[] {
    return missingSkills.map(skill => 
      `Consider learning ${skill} to improve your match for this role`
    )
  }

  private static getSkillPriority(skill: string): 'High' | 'Medium' | 'Low' {
    const highPrioritySkills = ['react', 'node', 'python', 'javascript', 'typescript', 'aws']
    const mediumPrioritySkills = ['docker', 'kubernetes', 'mongodb', 'postgresql']
    
    if (highPrioritySkills.includes(skill.toLowerCase())) return 'High'
    if (mediumPrioritySkills.includes(skill.toLowerCase())) return 'Medium'
    return 'Low'
  }

  private static getEstimatedLearningTime(skill: string, userLevel: string): string {
    const timeEstimates = {
      beginner: { High: '4-6 weeks', Medium: '2-4 weeks', Low: '1-2 weeks' },
      intermediate: { High: '2-4 weeks', Medium: '1-2 weeks', Low: '1 week' },
      advanced: { High: '1-2 weeks', Medium: '1 week', Low: '2-3 days' }
    }
    
    const priority = this.getSkillPriority(skill)
    return timeEstimates[userLevel as keyof typeof timeEstimates]?.[priority] || '2-3 weeks'
  }

  private static getRecommendedResources(skill: string) {
    // Enhanced resource curation with real, verified links
    const skillLower = skill.toLowerCase()
    
    const verifiedResources = {
      react: [
        {
          name: 'React Official Tutorial',
          type: 'Documentation' as const,
          url: 'https://react.dev/tutorial',
          free: true,
          duration: '6 hours',
          rating: 4.8,
          level: 'beginner'
        },
        {
          name: 'React - The Complete Guide (Udemy)',
          type: 'Course' as const,
          url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/',
          free: false,
          duration: '48 hours',
          rating: 4.6,
          level: 'intermediate'
        },
        {
          name: 'React Crash Course (YouTube)',
          type: 'Tutorial' as const,
          url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
          free: true,
          duration: '1.5 hours',
          rating: 4.7,
          level: 'beginner'
        }
      ],
      javascript: [
        {
          name: 'JavaScript.info',
          type: 'Documentation' as const,
          url: 'https://javascript.info/',
          free: true,
          duration: '50+ hours',
          rating: 4.9,
          level: 'beginner'
        },
        {
          name: 'JavaScript: Understanding the Weird Parts (Udemy)',
          type: 'Course' as const,
          url: 'https://www.udemy.com/course/understand-javascript/',
          free: false,
          duration: '11.5 hours',
          rating: 4.6,
          level: 'intermediate'
        }
      ],
      typescript: [
        {
          name: 'TypeScript Official Handbook',
          type: 'Documentation' as const,
          url: 'https://www.typescriptlang.org/docs/',
          free: true,
          duration: '20+ hours',
          rating: 4.8,
          level: 'intermediate'
        },
        {
          name: 'Understanding TypeScript (Udemy)',
          type: 'Course' as const,
          url: 'https://www.udemy.com/course/understanding-typescript/',
          free: false,
          duration: '15 hours',
          rating: 4.7,
          level: 'beginner'
        }
      ],
      nodejs: [
        {
          name: 'Node.js Official Learning Center',
          type: 'Documentation' as const,
          url: 'https://nodejs.org/en/learn/',
          free: true,
          duration: '30+ hours',
          rating: 4.7,
          level: 'beginner'
        },
        {
          name: 'The Complete Node.js Developer Course (Udemy)',
          type: 'Course' as const,
          url: 'https://www.udemy.com/course/the-complete-nodejs-developer-course-2/',
          free: false,
          duration: '35 hours',
          rating: 4.7,
          level: 'intermediate'
        }
      ]
    }
    
    // Get skill-specific resources or return generic programming resources
    const skillResources = verifiedResources[skillLower as keyof typeof verifiedResources]
    
    if (skillResources) {
      return skillResources
    }
    
    // Fallback for skills not in our curated list
    return [
      {
        name: `${skill} Official Documentation`,
        type: 'Documentation' as const,
        url: `https://www.google.com/search?q=${encodeURIComponent(skill)}+official+documentation`,
        free: true,
        duration: 'Variable',
        rating: 4.5,
        level: 'beginner'
      },
      {
        name: `Learn ${skill} - Coursera`,
        type: 'Course' as const,
        url: `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`,
        free: false,
        duration: '4-8 hours',
        rating: 4.4,
        level: 'beginner'
      },
      {
        name: `${skill} Tutorial - YouTube`,
        type: 'Tutorial' as const,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill)}+tutorial`,
        free: true,
        duration: '2-4 hours',
        rating: 4.3,
        level: 'beginner'
      }
    ]
  }

  private static generateLearningPath(skill: string): string[] {
    return [
      `Start with ${skill} basics and core concepts`,
      `Build a simple project using ${skill}`,
      `Learn advanced ${skill} features and best practices`,
      `Contribute to open source projects using ${skill}`
    ]
  }
}

export class ResumeGenerator {
  // Generate PDF resume (mock implementation)
  static async generatePDF(resumeContent: any, jobTitle: string): Promise<string> {
    // In production, this would use a PDF generation library like jsPDF or Puppeteer
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock PDF generation
    const fileName = `resume_${jobTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`
    const mockPdfUrl = `/generated-resumes/${fileName}`
    
    return mockPdfUrl
  }

  // Format resume content for specific job
  static formatForJob(userProfile: any, job: any, analysis: any) {
    return {
      personal_info: {
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        location: userProfile.location
      },
      professional_summary: this.generateTailoredSummary(userProfile, job, analysis),
      skills: this.prioritizeSkills(userProfile.skills, job.requirements),
      experience: this.formatExperience(userProfile.experience, job),
      projects: this.selectRelevantProjects(userProfile.projects, job),
      education: userProfile.education
    }
  }

  private static generateTailoredSummary(userProfile: any, job: any, analysis: any): string {
    return `${analysis.focus_area} specialist with expertise in ${job.requirements.slice(0, 3).join(', ')}. 
    Proven track record in building scalable applications and delivering high-quality solutions. 
    Passionate about ${job.company}'s mission and excited to contribute to innovative projects.`
  }

  private static prioritizeSkills(userSkills: string[], jobRequirements: string[]): string[] {
    const prioritized = []
    const remaining = [...userSkills]
    
    // First, add skills that match job requirements
    jobRequirements.forEach(req => {
      const matchIndex = remaining.findIndex(skill => 
        skill.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(skill.toLowerCase())
      )
      if (matchIndex !== -1) {
        prioritized.push(remaining.splice(matchIndex, 1)[0])
      }
    })
    
    // Then add remaining skills
    prioritized.push(...remaining)
    
    return prioritized
  }

  private static formatExperience(experience: any[], job: any) {
    return experience.map(exp => ({
      ...exp,
      relevance_score: this.calculateRelevanceScore(exp, job)
    })).sort((a, b) => b.relevance_score - a.relevance_score)
  }

  private static selectRelevantProjects(projects: any[], job: any) {
    return projects
      .map(project => ({
        ...project,
        relevance_score: this.calculateProjectRelevance(project, job)
      }))
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, 3) // Top 3 most relevant projects
  }

  private static calculateRelevanceScore(experience: any, job: any): number {
    let score = 0
    const expText = `${experience.title} ${experience.description}`.toLowerCase()
    
    job.requirements.forEach((req: string) => {
      if (expText.includes(req.toLowerCase())) {
        score += 1
      }
    })
    
    return score
  }

  private static calculateProjectRelevance(project: any, job: any): number {
    let score = 0
    const projectText = `${project.technologies} ${project.description}`.toLowerCase()
    
    job.requirements.forEach((req: string) => {
      if (projectText.includes(req.toLowerCase())) {
        score += 1
      }
    })
    
    return score
  }
}
