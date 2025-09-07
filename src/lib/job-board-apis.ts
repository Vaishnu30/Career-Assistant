// External Job Board API Integration Service
import { Job } from '@/types'

export interface JobAPIResponse {
  jobs: ExternalJob[]
  totalCount: number
  hasMore: boolean
  nextCursor?: string
}

export interface ExternalJob {
  id: string
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salary?: string
  description: string
  requirements: string[]
  posted: string
  source: 'indeed' | 'linkedin' | 'glassdoor' | 'stackoverflow'
  externalUrl: string
  companyLogo?: string
}

export class JobBoardAPIService {
  private static readonly API_ENDPOINTS = {
    indeed: 'https://api.indeed.com/ads/apisearch',
    linkedin: 'https://api.linkedin.com/v2/jobPostings',
    glassdoor: 'https://api.glassdoor.com/api/api.htm',
    stackoverflow: 'https://api.stackexchange.com/2.3/jobs'
  }

  private static readonly API_KEYS = {
    indeed: process.env.INDEED_API_KEY || '',
    linkedin: process.env.LINKEDIN_API_KEY || '',
    glassdoor: process.env.GLASSDOOR_API_KEY || '',
    stackoverflow: process.env.STACKOVERFLOW_API_KEY || ''
  }

  // Indeed API Integration
  static async fetchIndeedJobs(params: {
    query?: string
    location?: string
    jobType?: string
    limit?: number
    start?: number
  }): Promise<JobAPIResponse> {
    try {
      const { query = 'software developer', location = 'remote', limit = 25, start = 0 } = params
      
      const url = new URL(this.API_ENDPOINTS.indeed)
      url.searchParams.append('publisher', this.API_KEYS.indeed)
      url.searchParams.append('q', query)
      url.searchParams.append('l', location)
      url.searchParams.append('limit', limit.toString())
      url.searchParams.append('start', start.toString())
      url.searchParams.append('format', 'json')
      url.searchParams.append('v', '2')

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`Indeed API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        jobs: data.results?.map((job: any) => this.transformIndeedJob(job)) || [],
        totalCount: data.totalResults || 0,
        hasMore: (start + limit) < (data.totalResults || 0),
        nextCursor: ((start + limit) < (data.totalResults || 0)) ? (start + limit).toString() : undefined
      }
    } catch (error) {
      console.error('Indeed API error:', error)
      return this.getMockIndeedJobs(params)
    }
  }

  // LinkedIn API Integration (Currently disabled due to API restrictions)
  static async fetchLinkedInJobs(params: {
    keywords?: string
    locationId?: string
    jobType?: string
    limit?: number
    start?: number
  }): Promise<JobAPIResponse> {
    try {
      // LinkedIn API requires special approval and is very restrictive
      // For now, return mock data to prevent errors
      console.warn('LinkedIn API is currently disabled. Using mock data.')
      return this.getMockLinkedInJobs(params)
      
      /* Disabled LinkedIn API code:
      const { keywords = 'software engineer', limit = 25, start = 0 } = params
      
      const headers = {
        'Authorization': `Bearer ${this.API_KEYS.linkedin}`,
        'Content-Type': 'application/json'
      }

      const url = new URL(this.API_ENDPOINTS.linkedin)
      url.searchParams.append('keywords', keywords)
      url.searchParams.append('count', limit.toString())
      url.searchParams.append('start', start.toString())

      const response = await fetch(url.toString(), { headers })
      
      if (!response.ok) {
        throw new Error(`LinkedIn API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        jobs: data.elements?.map((job: any) => this.transformLinkedInJob(job)) || [],
        totalCount: data.paging?.total || 0,
        hasMore: data.paging?.links?.next ? true : false,
        nextCursor: data.paging?.start ? (data.paging.start + limit).toString() : undefined
      }
      */
    } catch (error) {
      console.error('LinkedIn API error:', error)
      return this.getMockLinkedInJobs(params)
    }
  }

  // StackOverflow Jobs API Integration
  static async fetchStackOverflowJobs(params: {
    tags?: string
    location?: string
    limit?: number
    page?: number
  }): Promise<JobAPIResponse> {
    try {
      const { tags = 'javascript;react', limit = 25, page = 1 } = params
      
      const url = new URL(this.API_ENDPOINTS.stackoverflow)
      url.searchParams.append('site', 'stackoverflow')
      url.searchParams.append('filter', 'default')
      url.searchParams.append('pagesize', limit.toString())
      url.searchParams.append('page', page.toString())
      if (tags) url.searchParams.append('tagged', tags)

      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`StackOverflow API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        jobs: data.items?.map((job: any) => this.transformStackOverflowJob(job)) || [],
        totalCount: data.total || 0,
        hasMore: data.has_more || false,
        nextCursor: data.has_more ? (page + 1).toString() : undefined
      }
    } catch (error) {
      console.error('StackOverflow API error:', error)
      return this.getMockStackOverflowJobs(params)
    }
  }

  // Aggregate jobs from multiple sources
  static async fetchAggregatedJobs(params: {
    query?: string
    location?: string
    jobType?: string
    sources?: ('indeed' | 'linkedin' | 'stackoverflow')[]
    limit?: number
  }): Promise<JobAPIResponse> {
    const { sources = ['indeed', 'linkedin', 'stackoverflow'], limit = 30 } = params
    const limitPerSource = Math.ceil(limit / sources.length)

    const promises = sources.map(source => {
      switch (source) {
        case 'indeed':
          return this.fetchIndeedJobs({ ...params, limit: limitPerSource })
        case 'linkedin':
          return this.fetchLinkedInJobs({ 
            keywords: params.query, 
            limit: limitPerSource 
          })
        case 'stackoverflow':
          return this.fetchStackOverflowJobs({ 
            tags: params.query?.replace(' ', ';'), 
            limit: limitPerSource 
          })
        default:
          return Promise.resolve({ jobs: [], totalCount: 0, hasMore: false })
      }
    })

    try {
      const results = await Promise.allSettled(promises)
      
      const allJobs: ExternalJob[] = []
      let totalCount = 0
      let hasMore = false

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allJobs.push(...result.value.jobs)
          totalCount += result.value.totalCount
          hasMore = hasMore || result.value.hasMore
        } else {
          console.error(`Failed to fetch from ${sources[index]}:`, result.reason)
        }
      })

      // Sort by posting date (most recent first)
      allJobs.sort((a, b) => new Date(b.posted).getTime() - new Date(a.posted).getTime())

      return {
        jobs: allJobs.slice(0, limit),
        totalCount,
        hasMore,
        nextCursor: hasMore ? 'next' : undefined
      }
    } catch (error) {
      console.error('Aggregated job fetch error:', error)
      return this.getMockAggregatedJobs(params)
    }
  }

  // Data transformation methods
  private static transformIndeedJob(job: any): ExternalJob {
    return {
      id: `indeed_${job.jobkey}`,
      title: job.jobtitle || 'Untitled Position',
      company: job.company || 'Unknown Company',
      location: job.formattedLocation || job.city + ', ' + job.state,
      type: this.mapJobType(job.formattedRelativeTime),
      salary: job.salary || undefined,
      description: job.snippet || '',
      requirements: this.extractRequirements(job.snippet || ''),
      posted: job.date || new Date().toISOString(),
      source: 'indeed',
      externalUrl: job.url || `https://www.indeed.com/viewjob?jk=${job.jobkey}`,
      companyLogo: undefined
    }
  }

  private static transformLinkedInJob(job: any): ExternalJob {
    return {
      id: `linkedin_${job.id}`,
      title: job.title || 'Untitled Position',
      company: job.companyDetails?.companyName || 'Unknown Company',
      location: job.locationDescription || 'Remote',
      type: this.mapJobType(job.employmentType),
      salary: job.salaryInsight?.salaryRange || undefined,
      description: job.description?.text || '',
      requirements: this.extractRequirements(job.description?.text || ''),
      posted: job.listedAt ? new Date(job.listedAt).toISOString() : new Date().toISOString(),
      source: 'linkedin',
      externalUrl: `https://www.linkedin.com/jobs/view/${job.id}`,
      companyLogo: job.companyDetails?.companyLogo
    }
  }

  private static transformStackOverflowJob(job: any): ExternalJob {
    return {
      id: `stackoverflow_${job.id}`,
      title: job.title || 'Untitled Position',
      company: job.company?.name || 'Unknown Company',
      location: job.location || 'Remote',
      type: this.mapJobType(job.job_type),
      salary: job.salary || undefined,
      description: job.description || '',
      requirements: job.tags || [],
      posted: job.creation_date ? new Date(job.creation_date * 1000).toISOString() : new Date().toISOString(),
      source: 'stackoverflow',
      externalUrl: job.link || `https://stackoverflow.com/jobs/${job.id}`,
      companyLogo: job.company?.logo
    }
  }

  // Helper methods
  private static mapJobType(typeStr: string): 'Full-time' | 'Part-time' | 'Contract' | 'Internship' {
    const str = typeStr?.toLowerCase() || ''
    if (str.includes('part') || str.includes('part-time')) return 'Part-time'
    if (str.includes('contract') || str.includes('freelance')) return 'Contract'
    if (str.includes('intern')) return 'Internship'
    return 'Full-time'
  }

  private static extractRequirements(description: string): string[] {
    const requirements: string[] = []
    const techKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#',
      'Angular', 'Vue.js', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS',
      'Docker', 'Kubernetes', 'Git', 'REST', 'GraphQL', 'Express', 'Django',
      'Spring', 'Laravel', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin'
    ]

    techKeywords.forEach(keyword => {
      if (description.toLowerCase().includes(keyword.toLowerCase())) {
        requirements.push(keyword)
      }
    })

    return requirements.slice(0, 8) // Limit to 8 requirements
  }

  // Mock data fallback methods
  private static getMockIndeedJobs(params: any): JobAPIResponse {
    return {
      jobs: [
        {
          id: 'indeed_mock_1',
          title: 'Senior Frontend Developer',
          company: 'Tech Innovators Inc',
          location: 'San Francisco, CA',
          type: 'Full-time',
          salary: '$120,000 - $150,000',
          description: 'Join our team building next-generation web applications using React, TypeScript, and modern development practices.',
          requirements: ['React', 'TypeScript', 'HTML5', 'CSS3', 'JavaScript'],
          posted: new Date(Date.now() - 86400000).toISOString(),
          source: 'indeed',
          externalUrl: 'https://indeed.com/mock-job-1'
        }
      ],
      totalCount: 100,
      hasMore: true,
      nextCursor: '25'
    }
  }

  private static getMockLinkedInJobs(params: any): JobAPIResponse {
    return {
      jobs: [
        {
          id: 'linkedin_mock_1',
          title: 'Full Stack Engineer',
          company: 'StartupXYZ',
          location: 'Remote',
          type: 'Full-time',
          salary: '$90,000 - $130,000',
          description: 'Build scalable web applications using modern technologies. Work with React, Node.js, and cloud platforms.',
          requirements: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
          posted: new Date(Date.now() - 172800000).toISOString(),
          source: 'linkedin',
          externalUrl: 'https://linkedin.com/mock-job-1'
        }
      ],
      totalCount: 75,
      hasMore: true,
      nextCursor: '25'
    }
  }

  private static getMockStackOverflowJobs(params: any): JobAPIResponse {
    return {
      jobs: [
        {
          id: 'stackoverflow_mock_1',
          title: 'Backend Developer',
          company: 'DataCorp Solutions',
          location: 'New York, NY',
          type: 'Full-time',
          salary: '$100,000 - $140,000',
          description: 'Design and implement robust backend systems using Python, Django, and PostgreSQL.',
          requirements: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
          posted: new Date(Date.now() - 259200000).toISOString(),
          source: 'stackoverflow',
          externalUrl: 'https://stackoverflow.com/mock-job-1'
        }
      ],
      totalCount: 50,
      hasMore: true,
      nextCursor: '2'
    }
  }

  private static getMockAggregatedJobs(params: any): JobAPIResponse {
    const mockJobs = [
      ...this.getMockIndeedJobs(params).jobs,
      ...this.getMockLinkedInJobs(params).jobs,
      ...this.getMockStackOverflowJobs(params).jobs
    ]

    return {
      jobs: mockJobs,
      totalCount: 225,
      hasMore: true,
      nextCursor: 'next'
    }
  }
}
