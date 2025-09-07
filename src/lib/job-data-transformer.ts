// Data transformation service for external job data
import { Job, CompanyInfo } from '@/types'
import { ExternalJob } from './job-board-apis'

export interface JobTransformationOptions {
  includeCompanyInfo?: boolean
  standardizeSalary?: boolean
  extractTechStack?: boolean
  enhanceDescription?: boolean
  filterDuplicates?: boolean
}

export class JobDataTransformer {
  // Transform external job data to internal Job format
  static transformExternalJob(
    externalJob: ExternalJob, 
    options: JobTransformationOptions = {}
  ): Job {
    const {
      includeCompanyInfo = true,
      standardizeSalary = true,
      extractTechStack = true,
      enhanceDescription = true
    } = options

    const transformedJob: Job = {
      id: this.generateInternalId(externalJob),
      title: this.standardizeTitle(externalJob.title),
      company: this.standardizeCompanyName(externalJob.company),
      location: this.standardizeLocation(externalJob.location),
      type: externalJob.type,
      salary: standardizeSalary ? this.standardizeSalary(externalJob.salary) : (externalJob.salary || 'Competitive'),
      description: enhanceDescription ? this.enhanceDescription(externalJob.description) : externalJob.description,
      requirements: extractTechStack ? this.extractAndStandardizeRequirements(externalJob) : externalJob.requirements,
      posted: this.formatPostedDate(externalJob.posted)
    }

    if (includeCompanyInfo) {
      transformedJob.companyInfo = this.extractCompanyInfo(externalJob)
    }

    return transformedJob
  }

  // Transform multiple external jobs with deduplication
  static transformExternalJobs(
    externalJobs: ExternalJob[],
    options: JobTransformationOptions = {}
  ): Job[] {
    let transformedJobs = externalJobs.map(job => this.transformExternalJob(job, options))

    if (options.filterDuplicates) {
      transformedJobs = this.removeDuplicates(transformedJobs)
    }

    return transformedJobs
  }

  // Generate internal job ID
  private static generateInternalId(externalJob: ExternalJob): number {
    // Create a hash-based ID from external job details
    const str = `${externalJob.source}_${externalJob.id}_${externalJob.title}_${externalJob.company}`
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Standardize job title
  private static standardizeTitle(title: string): string {
    const titleMappings: Record<string, string> = {
      'software engineer': 'Software Engineer',
      'software developer': 'Software Developer',
      'frontend developer': 'Frontend Developer',
      'front-end developer': 'Frontend Developer',
      'backend developer': 'Backend Developer',
      'back-end developer': 'Backend Developer',
      'fullstack developer': 'Full Stack Developer',
      'full-stack developer': 'Full Stack Developer',
      'web developer': 'Web Developer',
      'mobile developer': 'Mobile Developer',
      'ios developer': 'iOS Developer',
      'android developer': 'Android Developer',
      'devops engineer': 'DevOps Engineer',
      'data scientist': 'Data Scientist',
      'data engineer': 'Data Engineer',
      'machine learning engineer': 'Machine Learning Engineer',
      'ui/ux designer': 'UI/UX Designer',
      'product manager': 'Product Manager'
    }

    const normalizedTitle = title.toLowerCase().trim()
    return titleMappings[normalizedTitle] || this.capitalizeWords(title)
  }

  // Standardize company name
  private static standardizeCompanyName(company: string): string {
    // Remove common suffixes for cleaner display
    return company
      .replace(/\s+(Inc\.?|LLC\.?|Corp\.?|Corporation|Limited|Ltd\.?)$/i, '')
      .trim()
  }

  // Standardize location
  private static standardizeLocation(location: string): string {
    const locationMappings: Record<string, string> = {
      'san francisco, ca': 'San Francisco, CA',
      'new york, ny': 'New York, NY',
      'los angeles, ca': 'Los Angeles, CA',
      'seattle, wa': 'Seattle, WA',
      'austin, tx': 'Austin, TX',
      'boston, ma': 'Boston, MA',
      'chicago, il': 'Chicago, IL',
      'denver, co': 'Denver, CO',
      'remote work': 'Remote',
      'work from home': 'Remote',
      'anywhere': 'Remote',
      'telecommute': 'Remote'
    }

    const normalizedLocation = location.toLowerCase().trim()
    return locationMappings[normalizedLocation] || this.capitalizeWords(location)
  }

  // Standardize salary format
  private static standardizeSalary(salary?: string): string {
    if (!salary) return 'Competitive'

    // Extract numbers from salary string
    const numbers = salary.match(/[\d,]+/g)
    if (!numbers || numbers.length === 0) return 'Competitive'

    // Handle different salary formats
    if (numbers.length === 1) {
      const amount = parseInt(numbers[0].replace(/,/g, ''))
      if (amount > 500) { // Assume annual salary
        return `$${this.formatNumber(amount)}/year`
      } else { // Assume hourly rate
        return `$${amount}/hour`
      }
    } else if (numbers.length >= 2) {
      const min = parseInt(numbers[0].replace(/,/g, ''))
      const max = parseInt(numbers[1].replace(/,/g, ''))
      
      if (max > 500) { // Annual salary range
        return `$${this.formatNumber(min)} - $${this.formatNumber(max)}`
      } else { // Hourly rate range
        return `$${min} - $${max}/hour`
      }
    }

    return salary
  }

  // Enhanced description with better formatting
  private static enhanceDescription(description: string): string {
    if (!description) return 'No description available.'

    // Clean up common formatting issues
    let enhanced = description
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()

    // Add professional touch if description is too short
    if (enhanced.length < 100) {
      enhanced += ' This is an excellent opportunity to work with modern technologies and contribute to innovative projects.'
    }

    return enhanced
  }

  // Extract and standardize requirements
  private static extractAndStandardizeRequirements(externalJob: ExternalJob): string[] {
    const requirements = new Set<string>()

    // Add existing requirements
    externalJob.requirements.forEach(req => {
      const standardized = this.standardizeRequirement(req)
      if (standardized) requirements.add(standardized)
    })

    // Extract additional requirements from description
    const additionalReqs = this.extractRequirementsFromDescription(externalJob.description)
    additionalReqs.forEach(req => requirements.add(req))

    // Convert to array and limit to reasonable number
    return Array.from(requirements).slice(0, 10)
  }

  // Standardize individual requirement
  private static standardizeRequirement(requirement: string): string | null {
    const reqMappings: Record<string, string> = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'ts': 'TypeScript',
      'typescript': 'TypeScript',
      'reactjs': 'React.js',
      'react': 'React.js',
      'vuejs': 'Vue.js',
      'vue': 'Vue.js',
      'angular': 'Angular',
      'nodejs': 'Node.js',
      'node': 'Node.js',
      'express': 'Express.js',
      'mongodb': 'MongoDB',
      'postgresql': 'PostgreSQL',
      'postgres': 'PostgreSQL',
      'mysql': 'MySQL',
      'html5': 'HTML5',
      'css3': 'CSS3',
      'sass': 'SASS/SCSS',
      'scss': 'SASS/SCSS',
      'git': 'Git version control',
      'github': 'GitHub',
      'docker': 'Docker',
      'kubernetes': 'Kubernetes',
      'aws': 'AWS',
      'azure': 'Microsoft Azure',
      'gcp': 'Google Cloud Platform',
      'rest': 'REST APIs',
      'graphql': 'GraphQL',
      'python': 'Python',
      'django': 'Django',
      'flask': 'Flask',
      'java': 'Java',
      'spring': 'Spring Framework',
      'c#': 'C#',
      '.net': '.NET Framework',
      'php': 'PHP',
      'laravel': 'Laravel',
      'ruby': 'Ruby',
      'rails': 'Ruby on Rails'
    }

    const normalized = requirement.toLowerCase().trim()
    return reqMappings[normalized] || (requirement.length > 1 ? this.capitalizeWords(requirement) : null)
  }

  // Extract requirements from job description
  private static extractRequirementsFromDescription(description: string): string[] {
    const requirements: string[] = []
    const techPattern = /\b(JavaScript|TypeScript|React|Angular|Vue|Node\.js|Python|Java|C#|PHP|Ruby|SQL|MongoDB|PostgreSQL|AWS|Docker|Kubernetes|Git|HTML|CSS|SASS|SCSS|Express|Django|Flask|Spring|Laravel|Rails|GraphQL|REST|API|Agile|Scrum)\b/gi

    const matches = description.match(techPattern)
    if (matches) {
      const standardizedMatches = matches
        .map(match => this.standardizeRequirement(match))
        .filter((req): req is string => req !== null)
      const uniqueMatches = Array.from(new Set(standardizedMatches))
      requirements.push(...uniqueMatches)
    }

    return requirements
  }

  // Extract company information
  private static extractCompanyInfo(externalJob: ExternalJob): CompanyInfo {
    return {
      name: externalJob.company,
      industry: this.inferIndustry(externalJob.description, externalJob.requirements),
      size: this.inferCompanySize(externalJob.company, externalJob.description),
      culture: this.extractCultureKeywords(externalJob.description),
      techStack: externalJob.requirements.slice(0, 6),
      website: this.inferWebsite(externalJob.company),
      description: this.generateCompanyDescription(externalJob.company, externalJob.description)
    }
  }

  // Remove duplicate jobs
  private static removeDuplicates(jobs: Job[]): Job[] {
    const seen = new Set<string>()
    return jobs.filter(job => {
      const key = `${job.title.toLowerCase()}_${job.company.toLowerCase()}_${job.location.toLowerCase()}`
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }

  // Format posted date
  private static formatPostedDate(posted: string): string {
    try {
      const date = new Date(posted)
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

  // Helper methods
  private static capitalizeWords(str: string): string {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
  }

  private static formatNumber(num: number): string {
    return num.toLocaleString()
  }

  private static inferIndustry(description: string, requirements: string[]): string {
    const desc = description.toLowerCase()
    const reqs = requirements.join(' ').toLowerCase()

    if (desc.includes('fintech') || desc.includes('financial') || desc.includes('banking')) return 'Financial Technology'
    if (desc.includes('healthcare') || desc.includes('medical') || desc.includes('health')) return 'Healthcare Technology'
    if (desc.includes('e-commerce') || desc.includes('retail') || desc.includes('shopping')) return 'E-commerce'
    if (desc.includes('gaming') || desc.includes('game') || desc.includes('entertainment')) return 'Gaming & Entertainment'
    if (desc.includes('education') || desc.includes('learning') || desc.includes('edtech')) return 'Education Technology'
    if (reqs.includes('ai') || reqs.includes('machine learning') || reqs.includes('data science')) return 'Artificial Intelligence'
    if (desc.includes('startup') || desc.includes('early stage')) return 'Startup'
    
    return 'Technology'
  }

  private static inferCompanySize(company: string, description: string): string {
    const desc = description.toLowerCase()
    
    if (desc.includes('startup') || desc.includes('small team')) return '1-50 employees'
    if (desc.includes('growing') || desc.includes('expanding')) return '51-200 employees'
    if (desc.includes('established') || desc.includes('mid-size')) return '201-1000 employees'
    if (desc.includes('large') || desc.includes('enterprise') || desc.includes('fortune')) return '1000+ employees'
    
    // Infer from well-known companies
    const largeCompanies = ['google', 'microsoft', 'amazon', 'facebook', 'apple', 'netflix', 'uber', 'airbnb']
    if (largeCompanies.some(large => company.toLowerCase().includes(large))) return '1000+ employees'
    
    return '51-200 employees'
  }

  private static extractCultureKeywords(description: string): string[] {
    const cultureKeywords = [
      'collaborative', 'innovative', 'fast-paced', 'agile', 'remote-friendly',
      'work-life balance', 'flexible', 'inclusive', 'diverse', 'learning',
      'growth', 'mentorship', 'team-oriented', 'dynamic', 'creative'
    ]

    const desc = description.toLowerCase()
    return cultureKeywords.filter(keyword => desc.includes(keyword))
  }

  private static inferWebsite(company: string): string {
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '')
    return `https://www.${cleanCompany}.com`
  }

  private static generateCompanyDescription(company: string, jobDescription: string): string {
    const sentences = jobDescription.split('.').filter(s => s.length > 20)
    const companySentence = sentences.find(s => s.toLowerCase().includes(company.toLowerCase()))
    
    if (companySentence) {
      return companySentence.trim() + '.'
    }
    
    return `${company} is a technology company focused on building innovative solutions and fostering professional growth.`
  }
}
