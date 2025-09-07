// RapidAPI Job Services Integration
import { Job } from '@/types'

export interface RapidAPIJobResponse {
  status: string
  request_id: string
  parameters: any
  data: RapidAPIJob[]
  total_count?: number
  has_next_page?: boolean
}

export interface RapidAPIJob {
  job_id: string
  employer_name: string
  employer_logo?: string
  employer_website?: string
  employer_company_type?: string
  job_publisher: string
  job_employment_type: string
  job_title: string
  job_apply_link: string
  job_apply_is_direct: boolean
  job_apply_quality_score: number
  job_description: string
  job_is_remote: boolean
  job_posted_at_timestamp: number
  job_posted_at_datetime_utc: string
  job_city: string
  job_state: string
  job_country: string
  job_latitude?: number
  job_longitude?: number
  job_benefits?: string[]
  job_google_link?: string
  job_offer_expiration_datetime_utc?: string
  job_offer_expiration_timestamp?: number
  job_required_experience?: {
    no_experience_required: boolean
    required_experience_in_months: number
    experience_mentioned: boolean
    experience_preferred: boolean
  }
  job_required_skills?: string[]
  job_required_education?: {
    postgraduate_degree: boolean
    professional_certification: boolean
    high_school: boolean
    associates_degree: boolean
    bachelors_degree: boolean
    degree_mentioned: boolean
    degree_preferred: boolean
    professional_certification_mentioned: boolean
  }
  job_experience_in_place_of_education: boolean
  job_min_salary?: number
  job_max_salary?: number
  job_salary_currency?: string
  job_salary_period?: string
  job_highlights?: {
    Qualifications?: string[]
    Responsibilities?: string[]
    Benefits?: string[]
  }
  job_job_title?: string
  job_posting_language?: string
  job_onet_soc?: string
  job_onet_job_zone?: string
  job_naics_code?: string
  job_naics_name?: string
}

export class RapidAPIJobService {
  private static readonly BASE_URL = 'https://jsearch.p.rapidapi.com'
  private static readonly API_KEY = process.env.RAPIDAPI_KEY || ''
  private static readonly API_HOST = 'jsearch.p.rapidapi.com'
  
  // Rate limiting
  private static lastApiCall = 0
  private static readonly MIN_INTERVAL = 2000 // 2 seconds between calls
  private static rateLimitedUntil = 0

  // Available RapidAPI Job Services
  private static readonly SERVICES = {
    jsearch: 'jsearch.p.rapidapi.com',
    jobsapi: 'jobs-api14.p.rapidapi.com', 
    jobicy: 'jobicy-api.p.rapidapi.com',
    workday: 'workday-jobs-api.p.rapidapi.com'
  }

  private static getHeaders() {
    return {
      'X-RapidAPI-Key': this.API_KEY,
      'X-RapidAPI-Host': this.API_HOST,
      'Content-Type': 'application/json'
    }
  }

  // JSearch API - Most comprehensive job search
  static async searchJobs(params: {
    query?: string
    page?: number
    num_pages?: number
    date_posted?: 'all' | 'today' | '3days' | 'week' | 'month'
    remote_jobs_only?: boolean
    employment_types?: string
    job_requirements?: string
    job_titles?: string
    company_types?: string
    employer?: string
    radius?: number
    categories?: string
    location?: string
  }): Promise<{ jobs: Job[], totalCount: number, hasMore: boolean }> {
    
    // Check if we're rate limited
    const now = Date.now()
    if (now < this.rateLimitedUntil) {
      console.log('🚫 RapidAPI rate limited, using mock data until:', new Date(this.rateLimitedUntil))
      return this.getMockJobs(params)
    }

    // Rate limiting between calls
    const timeSinceLastCall = now - this.lastApiCall
    if (timeSinceLastCall < this.MIN_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, this.MIN_INTERVAL - timeSinceLastCall))
    }

    try {
      const {
        query = 'software developer',
        page = 1,
        num_pages = 1,
        date_posted = 'week',
        remote_jobs_only = false,
        location = 'United States'
      } = params

      this.lastApiCall = Date.now()

      const url = new URL(`${this.BASE_URL}/search`)
      url.searchParams.append('query', query)
      url.searchParams.append('page', page.toString())
      url.searchParams.append('num_pages', num_pages.toString())
      url.searchParams.append('date_posted', date_posted)
      url.searchParams.append('remote_jobs_only', remote_jobs_only.toString())
      if (location) url.searchParams.append('geo', location)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (response.status === 429) {
        // Rate limited - block API calls for 5 minutes
        this.rateLimitedUntil = Date.now() + (5 * 60 * 1000)
        console.log('⚠️ RapidAPI rate limit hit. Switching to mock data for 5 minutes.')
        return this.getMockJobs(params)
      }

      if (!response.ok) {
        throw new Error(`RapidAPI JSearch error: ${response.status} ${response.statusText}`)
      }

      const data: RapidAPIJobResponse = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(`JSearch API error: ${data.status}`)
      }

      console.log(`✅ Successfully fetched ${data.data.length} jobs from RapidAPI`)
      const transformedJobs = data.data.map(job => this.transformJSearchJob(job))
      
      return {
        jobs: transformedJobs,
        totalCount: data.total_count || transformedJobs.length,
        hasMore: data.has_next_page || false
      }
    } catch (error) {
      console.error('RapidAPI JSearch error:', error)
      // On error, also implement temporary rate limiting to prevent spam
      if (error instanceof Error && error.message.includes('429')) {
        this.rateLimitedUntil = Date.now() + (5 * 60 * 1000)
      }
      return this.getMockJobs(params)
    }
  }

  // Get job details by ID
  static async getJobDetails(jobId: string): Promise<RapidAPIJob | null> {
    try {
      const url = new URL(`${this.BASE_URL}/job-details`)
      url.searchParams.append('job_id', jobId)

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Job details error: ${response.status}`)
      }

      const data = await response.json()
      return data.data?.[0] || null
    } catch (error) {
      console.error('Error fetching job details:', error)
      return null
    }
  }

  // Search by filters
  static async searchByFilters(filters: {
    keywords?: string[]
    location?: string
    employmentType?: 'FULLTIME' | 'PARTTIME' | 'CONTRACTOR' | 'INTERN'
    experienceLevel?: 'INTERNSHIP' | 'ENTRY_LEVEL' | 'ASSOCIATE' | 'MID_SENIOR_LEVEL' | 'DIRECTOR' | 'EXECUTIVE'
    remoteOnly?: boolean
    datePosted?: 'all' | 'today' | '3days' | 'week' | 'month'
    salaryMin?: number
    companies?: string[]
    pageSize?: number
    page?: number
  }): Promise<{ jobs: Job[], totalCount: number, hasMore: boolean }> {
    const {
      keywords = ['software', 'developer'],
      location = 'United States',
      employmentType,
      experienceLevel,
      remoteOnly = false,
      datePosted = 'week',
      pageSize = 20,
      page = 1
    } = filters

    const query = keywords.join(' ')
    
    return await this.searchJobs({
      query,
      location,
      remote_jobs_only: remoteOnly,
      date_posted: datePosted,
      page,
      num_pages: 1,
      employment_types: employmentType,
      job_requirements: experienceLevel
    })
  }

  // Get trending/popular jobs
  static async getTrendingJobs(location: string = 'United States'): Promise<Job[]> {
    const trendingQueries = [
      'software engineer',
      'frontend developer', 
      'backend developer',
      'full stack developer',
      'data scientist',
      'product manager',
      'ui ux designer',
      'devops engineer'
    ]

    const allJobs: Job[] = []

    for (const query of trendingQueries.slice(0, 4)) { // Limit to avoid rate limits
      try {
        const result = await this.searchJobs({
          query,
          location,
          date_posted: '3days',
          num_pages: 1
        })
        allJobs.push(...result.jobs.slice(0, 3)) // Top 3 from each query
      } catch (error) {
        console.error(`Error fetching trending jobs for ${query}:`, error)
      }
    }

    // Remove duplicates and return top 15
    const uniqueJobs = this.removeDuplicates(allJobs)
    return uniqueJobs.slice(0, 15)
  }

  // Search jobs by company
  static async searchByCompany(companyName: string, limit: number = 10): Promise<Job[]> {
    try {
      const result = await this.searchJobs({
        query: `jobs at ${companyName}`,
        employer: companyName,
        num_pages: 1
      })
      return result.jobs.slice(0, limit)
    } catch (error) {
      console.error(`Error searching jobs at ${companyName}:`, error)
      return []
    }
  }

  // Get remote jobs specifically
  static async getRemoteJobs(query: string = 'software developer', limit: number = 20): Promise<Job[]> {
    try {
      const result = await this.searchJobs({
        query,
        remote_jobs_only: true,
        date_posted: 'week',
        num_pages: Math.ceil(limit / 10)
      })
      return result.jobs.slice(0, limit)
    } catch (error) {
      console.error('Error fetching remote jobs:', error)
      return []
    }
  }

  // Transform RapidAPI job to internal format
  private static transformJSearchJob(apiJob: RapidAPIJob): Job {
    const salary = this.formatSalary(apiJob.job_min_salary, apiJob.job_max_salary, apiJob.job_salary_currency)
    const location = this.formatLocation(apiJob.job_city, apiJob.job_state, apiJob.job_country, apiJob.job_is_remote)
    const requirements = this.extractRequirements(apiJob)
    const employmentType = this.mapEmploymentType(apiJob.job_employment_type)

    return {
      id: parseInt(apiJob.job_id.replace(/[^0-9]/g, '')) || Math.floor(Math.random() * 1000000),
      title: apiJob.job_title || 'Untitled Position',
      company: apiJob.employer_name || 'Unknown Company',
      location,
      type: employmentType,
      salary,
      description: apiJob.job_description || 'No description available',
      requirements,
      posted: this.formatPostedDate(apiJob.job_posted_at_datetime_utc),
      companyInfo: {
        name: apiJob.employer_name || 'Unknown Company',
        industry: this.inferIndustry(apiJob.job_description, requirements),
        size: this.inferCompanySize(apiJob.employer_company_type),
        culture: this.extractCultureKeywords(apiJob.job_description),
        techStack: requirements.slice(0, 6),
        website: apiJob.employer_website,
        description: this.generateCompanyDescription(apiJob.employer_name, apiJob.job_description)
      }
    }
  }

  // Helper methods for data transformation
  private static formatSalary(minSalary?: number, maxSalary?: number, currency?: string): string {
    if (!minSalary && !maxSalary) return 'Competitive'
    
    const curr = currency || 'USD'
    const symbol = curr === 'USD' ? '$' : curr
    
    if (minSalary && maxSalary) {
      return `${symbol}${this.formatNumber(minSalary)} - ${symbol}${this.formatNumber(maxSalary)}`
    } else if (minSalary) {
      return `${symbol}${this.formatNumber(minSalary)}+`
    } else if (maxSalary) {
      return `Up to ${symbol}${this.formatNumber(maxSalary)}`
    }
    
    return 'Competitive'
  }

  private static formatLocation(city?: string, state?: string, country?: string, isRemote?: boolean): string {
    if (isRemote) return 'Remote'
    
    const parts = [city, state, country].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : 'Location not specified'
  }

  private static extractRequirements(apiJob: RapidAPIJob): string[] {
    const requirements: string[] = []
    
    // Add from required skills
    if (apiJob.job_required_skills) {
      requirements.push(...apiJob.job_required_skills.slice(0, 8))
    }
    
    // Extract from job highlights
    if (apiJob.job_highlights?.Qualifications) {
      const techSkills = this.extractTechFromText(apiJob.job_highlights.Qualifications.join(' '))
      requirements.push(...techSkills)
    }
    
    // Extract from description
    if (apiJob.job_description) {
      const descriptionTech = this.extractTechFromText(apiJob.job_description)
      requirements.push(...descriptionTech.slice(0, 5))
    }
    
    // Remove duplicates and limit
    return Array.from(new Set(requirements)).slice(0, 10)
  }

  private static extractTechFromText(text: string): string[] {
    const techKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java',
      'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'HTML', 'CSS',
      'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'Git', 'REST', 'GraphQL', 'Express', 'Django',
      'Spring', 'Laravel', 'Rails', 'Flask', 'Next.js', 'Nuxt.js'
    ]
    
    const found: string[] = []
    const lowerText = text.toLowerCase()
    
    techKeywords.forEach(tech => {
      if (lowerText.includes(tech.toLowerCase())) {
        found.push(tech)
      }
    })
    
    return found
  }

  private static mapEmploymentType(type: string): 'Full-time' | 'Part-time' | 'Contract' | 'Internship' {
    const lowerType = type?.toLowerCase() || ''
    
    if (lowerType.includes('part')) return 'Part-time'
    if (lowerType.includes('contract') || lowerType.includes('freelance')) return 'Contract'
    if (lowerType.includes('intern')) return 'Internship'
    return 'Full-time'
  }

  private static formatPostedDate(dateString?: string): string {
    if (!dateString) return 'Recently posted'
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return '1 day ago'
      if (diffDays <= 7) return `${diffDays} days ago`
      if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'Recently posted'
    }
  }

  private static formatNumber(num: number): string {
    return num.toLocaleString()
  }

  private static removeDuplicates(jobs: Job[]): Job[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Helper methods for company information
  private static inferIndustry(description: string, requirements: string[]): string {
    const desc = description?.toLowerCase() || ''
    const reqs = requirements.join(' ').toLowerCase()

    if (desc.includes('fintech') || desc.includes('financial')) return 'Financial Technology'
    if (desc.includes('healthcare') || desc.includes('medical')) return 'Healthcare Technology'
    if (desc.includes('e-commerce') || desc.includes('retail')) return 'E-commerce'
    if (desc.includes('gaming') || desc.includes('game')) return 'Gaming & Entertainment'
    if (desc.includes('education') || desc.includes('edtech')) return 'Education Technology'
    if (reqs.includes('ai') || reqs.includes('machine learning')) return 'Artificial Intelligence'
    if (desc.includes('startup')) return 'Startup'
    
    return 'Technology'
  }

  private static inferCompanySize(companyType?: string): string {
    const type = companyType?.toLowerCase() || ''
    
    if (type.includes('startup') || type.includes('small')) return '1-50 employees'
    if (type.includes('medium') || type.includes('growing')) return '51-200 employees'
    if (type.includes('large') || type.includes('enterprise')) return '201-1000 employees'
    if (type.includes('corporation') || type.includes('multinational')) return '1000+ employees'
    
    return '51-200 employees'
  }

  private static extractCultureKeywords(description: string): string[] {
    const keywords = [
      'collaborative', 'innovative', 'fast-paced', 'agile', 'remote-friendly',
      'work-life balance', 'flexible', 'inclusive', 'diverse', 'learning'
    ]
    
    const desc = description?.toLowerCase() || ''
    return keywords.filter(keyword => desc.includes(keyword))
  }

  private static generateCompanyDescription(company?: string, jobDescription?: string): string {
    if (!company) return 'Technology company focused on innovation.'
    
    const sentences = jobDescription?.split('.').filter(s => s.length > 20) || []
    const companySentence = sentences.find(s => 
      s.toLowerCase().includes(company.toLowerCase())
    )
    
    if (companySentence) {
      return companySentence.trim() + '.'
    }
    
    return `${company} is a technology company focused on building innovative solutions.`
  }

  // Mock data fallback
  private static getMockJobs(params: any): { jobs: Job[], totalCount: number, hasMore: boolean } {
    const mockJobs: Job[] = [
      {
        id: 1001,
        title: 'Senior React Developer',
        company: 'TechCorp (via RapidAPI)',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$120,000 - $160,000',
        description: 'Join our team building next-generation web applications using React, TypeScript, and modern development practices.',
        requirements: ['React.js', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
        posted: '2 days ago',
        companyInfo: {
          name: 'TechCorp',
          industry: 'Technology',
          size: '201-1000 employees',
          culture: ['innovative', 'collaborative', 'fast-paced'],
          techStack: ['React.js', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
          website: 'https://techcorp.com'
        }
      }
    ]

    return {
      jobs: mockJobs,
      totalCount: 100,
      hasMore: true
    }
  }
}
