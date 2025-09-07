// Type definitions for AI Career Assistant

export interface Job {
  id: number
  title: string
  company: string
  location: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  salary: string
  description: string
  requirements: string[]
  posted: string
  companyInfo?: CompanyInfo
}

export interface CompanyInfo {
  name: string
  industry: string
  size: string
  culture: string[]
  techStack: string[]
  website?: string
  description?: string
}

export interface UserProfile {
  id?: string
  name: string
  email: string
  password?: string  // Optional for updates, required for registration
  phone: string
  location: string
  summary: string
  skills: string[]
  education: Education[]
  experience: Experience[]
  projects: Project[]
  certifications?: Certification[]
  languages?: Language[]
}

export interface Education {
  degree: string
  school: string
  year: string
  gpa?: string
  major?: string
  relevant_courses?: string[]
}

export interface Experience {
  title: string
  company: string
  duration: string
  description: string
  skills_used?: string[]
  achievements?: string[]
}

export interface Project {
  name: string
  technologies: string
  description: string
  github_url?: string
  live_url?: string
  achievements?: string[]
}

export interface Certification {
  name: string
  issuer: string
  date: string
  expiry?: string
  credential_id?: string
}

export interface Language {
  name: string
  proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native'
}

export interface AIAnalysis {
  job_focus: string
  skill_match_percentage: number
  missing_skills: string[]
  recommended_skills: string[]
  study_suggestions: StudySuggestion[]
  resume_highlights: string[]
  company_alignment: CompanyAlignment
}

export interface StudySuggestion {
  skill: string
  priority: 'High' | 'Medium' | 'Low'
  estimated_time: string
  resources: LearningResource[]
}

export interface LearningResource {
  name: string
  type: 'Course' | 'Tutorial' | 'Documentation' | 'Practice'
  url: string
  free: boolean
  duration?: string
}

export interface CompanyAlignment {
  culture_fit: number
  tech_stack_match: number
  role_suitability: number
  growth_potential: number
  suggestions: string[]
}

export interface CustomResume {
  id?: string
  user_id: string
  job_id: number
  content: ResumeContent
  ai_analysis: AIAnalysis
  created_at: Date
  pdf_url?: string
}

export interface ResumeContent {
  personal_info: UserProfile
  tailored_summary: string
  highlighted_skills: string[]
  relevant_experience: Experience[]
  relevant_projects: Project[]
  relevant_education: Education[]
  additional_sections?: any
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface GenerateResumeRequest {
  user_profile: UserProfile
  job: Job
  customization_preferences?: {
    format: 'modern' | 'classic' | 'creative'
    color_scheme: 'blue' | 'green' | 'purple' | 'monochrome'
    include_photo: boolean
  }
}

export interface SkillGapAnalysis {
  required_skills: string[]
  user_skills: string[]
  matched_skills: string[]
  missing_skills: string[]
  skill_gaps: SkillGap[]
  overall_match_percentage: number
}

export interface SkillGap {
  skill: string
  importance: 'Critical' | 'Important' | 'Nice-to-have'
  current_level: 'None' | 'Beginner' | 'Intermediate' | 'Advanced'
  required_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  learning_path: StudySuggestion
}

export interface CompanyAnalysis {
  name: string
  culture: {
    values: string[]
    workStyle: string[]
    benefits: string[]
    environment: string
  }
  techStack: {
    frontend: string[]
    backend: string[]
    databases: string[]
    cloud: string[]
    tools: string[]
  }
  insights: {
    teamSize: string
    growthStage: string
    fundingStatus: string
    industryFocus: string[]
  }
  keywordOptimization: string[]
}
