'use client'

import { useState, useEffect } from 'react'
import { UserProfile, Job, CompanyAnalysis } from '@/types'
import TemplateSelector from './TemplateSelector'
import { CompanyIntelligenceService } from '@/lib/company-intelligence'
import { generateAndDownloadResume } from '@/lib/enhanced-pdf-generator'
import { JobSyncService } from '@/lib/job-sync-service'

interface JobBoardProps {
  profile: UserProfile
  onJobAnalysis?: (analysis: { skillGaps: string[], jobTitle: string, company: string, analysis: any }) => void
}

interface JobFilters {
  query: string
  location: string
  type: string
  company: string
}

// Mock job data - in real app, this would come from an API
const mockJobs: Job[] = [
  {
    id: 999001,
    title: 'Frontend Developer',
    company: 'TechCorp Inc',
    location: 'Remote',
    type: 'Full-time',
    salary: '$60,000 - $80,000',
    description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user interfaces using React, TypeScript, and modern CSS frameworks.',
    requirements: [
      'React.js and TypeScript',
      'HTML5, CSS3, JavaScript', 
      'Responsive web design',
      'Git version control',
      'REST API integration'
    ],
    posted: '2 days ago'
  },
  {
    id: 999002,
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'New York, NY', 
    type: 'Full-time',
    salary: '$70,000 - $90,000',
    description: 'Join our dynamic startup as a Full Stack Developer. Work with cutting-edge technologies including Node.js, React, and cloud services.',
    requirements: [
      'Node.js and Express',
      'React or Vue.js',
      'Database design (MongoDB/PostgreSQL)',
      'AWS/Azure cloud services',
      'Agile development'
    ],
    posted: '1 week ago'
  },
  {
    id: 999003,
    title: 'Backend Developer',
    company: 'DataSolutions Ltd',
    location: 'San Francisco, CA',
    type: 'Contract',
    salary: '$50/hour',
    description: 'We need an experienced Backend Developer to build scalable APIs and microservices. Experience with Python and cloud platforms required.',
    requirements: [
      'Python and Django/FastAPI',
      'RESTful API design',
      'Docker and Kubernetes',
      'PostgreSQL or MySQL',
      'Cloud platforms (AWS/GCP)'
    ],
    posted: '3 days ago'
  }
]

export default function JobBoard({ profile, onJobAnalysis }: JobBoardProps) {
  console.log('🎯 JobBoard component mounted with profile:', profile?.name || 'No name')
  
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isGeneratingResume, setIsGeneratingResume] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('modern-blue')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [companyAnalysis, setCompanyAnalysis] = useState<CompanyAnalysis | null>(null)
  
  // New state for API integration  
  const [jobs, setJobs] = useState<Job[]>(mockJobs) // Start with mock jobs as fallback
  const [isLoadingJobs, setIsLoadingJobs] = useState(false)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false) // Prevent multiple initializations
  const [filters, setFilters] = useState<JobFilters>({
    query: '',
    location: '',
    type: '',
    company: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  // Initialize job sync service on component mount
  useEffect(() => {
    if (!isInitialized) {
      initializeJobSync()
      // Only fetch jobs on initial mount, not when filters change
      fetchJobs()
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Remove the automatic filter-based fetching to prevent constant syncing
  // Users can manually refresh using the buttons if needed

  const initializeJobSync = async () => {
    if (isInitialized) {
      console.log('Job sync already initialized, skipping...')
      return
    }
    
    try {
      console.log('Initializing job sync service...')
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'initialize',
          config: {
            syncInterval: 60, // 1 hour
            maxJobsPerSource: 25,
            autoRefresh: false // Disable auto-refresh to prevent constant syncing
          }
        })
      })

      const result = await response.json()
      if (result.success) {
        setSyncStatus(result.data.syncStatus)
        console.log('Job sync service initialized successfully')
      }
    } catch (error) {
      console.error('Failed to initialize job sync:', error)
    }
  }

  const fetchJobs = async () => {
    console.log('🔍 Fetching jobs with filters:', filters)
    setIsLoadingJobs(true)
    try {
      const params = new URLSearchParams()
      if (filters.query) params.append('q', filters.query)
      if (filters.location) params.append('location', filters.location)
      if (filters.type) params.append('type', filters.type)
      if (filters.company) params.append('company', filters.company)
      params.append('limit', '50')

      const url = `/api/jobs?${params.toString()}`
      console.log('📡 API Request URL:', url)
      
      const response = await fetch(url)
      const result = await response.json()
      
      console.log('📥 API Response:', result)

      if (result.success) {
        const apiJobs = result.data.jobs || []
        console.log(`✅ Successfully fetched ${apiJobs.length} jobs from API`)
        console.log('📋 Sample job:', apiJobs[0])
        
        // Use API jobs if available, otherwise keep current jobs (which start with mockJobs)
        if (apiJobs.length > 0) {
          setJobs(apiJobs)
        } else {
          console.log('⚠️ No jobs returned from API - keeping current jobs and triggering manual sync')
          // If no jobs, try to trigger a sync but keep current jobs displayed
          triggerManualSync()
        }
        setSyncStatus(result.data.syncStatus)
      } else {
        console.error('❌ Failed to fetch jobs:', result.error)
        // Keep current jobs (mock jobs) as fallback
        console.log('🔄 API failed - keeping current jobs and trying manual sync')
        triggerManualSync()
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error)
      // Keep current jobs (mock jobs) as fallback and try manual sync
      console.log('🔄 Fetch error - keeping current jobs and triggering manual sync')
      triggerManualSync()
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const triggerManualSync = async () => {
    setIsLoadingJobs(true)
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      })

      const result = await response.json()
      if (result.success) {
        setSyncStatus(result.data.syncStatus)
        // Don't call fetchJobs() here as it triggers another sync initialization
        // Instead, refresh the current view with a simple API call
        const refreshResponse = await fetch(`/api/jobs?${new URLSearchParams({
          ...(filters.type && { type: filters.type }),
          ...(filters.location && { location: filters.location }),
          ...(filters.query && { q: filters.query }),
          ...(filters.company && { company: filters.company }),
          limit: '50'
        })}`)
        
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setJobs(refreshResult.data.jobs)
        }
      }
    } catch (error) {
      console.error('Failed to trigger sync:', error)
    } finally {
      setIsLoadingJobs(false)
    }
  }

  const handleFilterChange = (filterType: keyof JobFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      location: '',
      type: '',
      company: ''
    })
  }

  const handleCustomizeResume = async (job: Job) => {
    // First, analyze the company
    const analysis = CompanyIntelligenceService.analyzeCompany(job.company, job.description)
    setCompanyAnalysis(analysis)
    
    // Show template selector
    setShowTemplateSelector(true)
  }

  const handleGenerateWithTemplate = async (job: Job) => {
    setIsGeneratingResume(true)
    
    try {
      // Use the actual user profile passed as prop
      
      // Call the API to generate the resume
      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_profile: profile,
          job: job,
          customization_preferences: {
            format: 'modern',
            color_scheme: 'blue',
            include_photo: false,
            template: selectedTemplate,
            company_analysis: companyAnalysis
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        // Get the AI analysis and generated content
        const analysis = result.data.ai_analysis
        const content = result.data.content
        
        // Pass analysis data to parent component for AI career coach
        if (onJobAnalysis) {
          onJobAnalysis({
            skillGaps: analysis.missing_skills || [],
            jobTitle: job.title,
            company: job.company,
            analysis: analysis
          })
        }
        
        // Show enhanced analysis results
        alert(`🤖 AI Resume Analysis Complete!

📊 Analysis Results:
• Job Focus: ${analysis.job_focus}
• Skill Match: ${analysis.skill_match_percentage}%
• Missing Skills: ${analysis.missing_skills?.join(', ') || 'None identified'}

🏢 Company Insights:
• Culture: ${companyAnalysis?.culture?.values?.slice(0, 3).join(', ') || 'Professional environment'}
• Tech Stack: ${companyAnalysis?.techStack?.frontend?.slice(0, 3).join(', ') || 'Modern technologies'}

💡 Recommendations: ${analysis.recommended_skills?.join(', ') || 'Continue current path'}

📄 Generating PDF resume with ${selectedTemplate} template...

💡 Tip: Check the Study Planner tab for personalized learning recommendations!`)

        // Generate and download PDF with selected template
        await generateEnhancedPDFResume(content, job, analysis)
        
      } else {
        alert('❌ Failed to generate resume: ' + result.error)
      }
    } catch (error) {
      console.error('Resume generation error:', error)
      alert('❌ Failed to generate resume. Please check your connection and try again.')
    } finally {
      setIsGeneratingResume(false)
      setShowTemplateSelector(false)
    }
  }

  // Function to generate enhanced PDF resume
  const generateEnhancedPDFResume = async (content: any, job: any, analysis: any) => {
    try {
      // Dynamic import to avoid SSR issues
      const { generateAndDownloadResume } = await import('@/lib/enhanced-pdf-generator')
      
      const resumeData = {
        personal_info: content.personal_info,
        tailored_summary: content.tailored_summary,
        highlighted_skills: content.highlighted_skills,
        relevant_experience: content.relevant_experience,
        relevant_projects: content.relevant_projects,
        relevant_education: content.relevant_education
      }

      const jobInfo = {
        title: job.title,
        company: job.company,
        id: job.id
      }

      // Generate and download the PDF with enhanced options
      await generateAndDownloadResume({
        template: selectedTemplate,
        userProfile: resumeData.personal_info,
        jobInfo: jobInfo,
        aiAnalysis: analysis,
        customizations: {
          includePhoto: false,
          fontSize: 'medium',
          pageMargins: 'normal'
        }
      })
      
      alert(`✅ Success! Your customized resume for ${job.title} at ${job.company} has been downloaded!

📊 Final Stats:
• Match Score: ${analysis.skill_match_percentage}%
• Skills Highlighted: ${content.highlighted_skills?.length || 0}
• Projects Featured: ${content.relevant_projects?.length || 0}

The PDF includes:
✓ Tailored professional summary
✓ Highlighted relevant skills
✓ Prioritized experience
✓ Best-matching projects
✓ ATS-optimized formatting`)

    } catch (error) {
      console.error('PDF generation error:', error)
      alert('❌ Failed to generate PDF. Showing resume data instead:\n\n' + JSON.stringify(content, null, 2))
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Job Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Job Opportunities</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
            <button
              onClick={triggerManualSync}
              disabled={isLoadingJobs}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isLoadingJobs ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Sync Jobs
            </button>
            <button
              onClick={fetchJobs}
              disabled={isLoadingJobs}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
            >
              {isLoadingJobs ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              Refresh
            </button>
            <button
              onClick={async () => {
                console.log('🧪 Testing RapidAPI directly...')
                try {
                  const response = await fetch('/api/test-job-sync', { method: 'POST' })
                  const result = await response.json()
                  console.log('🧪 RapidAPI Test Result:', result)
                  alert(`RapidAPI Test: ${result.success ? 'SUCCESS' : 'FAILED'}\nJobs found: ${result.data?.jobCount || 0}`)
                } catch (error) {
                  console.error('🧪 RapidAPI Test Failed:', error)
                  alert('RapidAPI Test Failed - Check console')
                }
              }}
              className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
            >
              Test API
            </button>
          </div>
        </div>

        {/* Sync Status */}
        {syncStatus && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${syncStatus.isRunning ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span className="text-gray-600">
                  Last sync: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
                </span>
              </div>
              <span className="text-gray-500">
                {syncStatus.totalJobsSynced} jobs from {syncStatus.successfulSources?.length || 0} sources
              </span>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filter Jobs</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Search keywords..."
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Job Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
              <input
                type="text"
                placeholder="Company..."
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={fetchJobs}
                disabled={isLoadingJobs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingJobs ? 'Searching...' : 'Search Jobs'}
              </button>
              <button
                onClick={triggerManualSync}
                disabled={isLoadingJobs}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sync New Jobs
              </button>
            </div>
          </div>
        )}

        {/* Job Cards */}
        <div className="space-y-3">
          {isLoadingJobs && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                Loading fresh job opportunities...
              </div>
            </div>
          )}
          
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`p-6 rounded-lg border cursor-pointer transition-all ${
                selectedJob?.id === job.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedJob(job)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{job.posted}</span>
                  {String(job.id).startsWith('indeed_') && (
                    <div className="text-xs text-blue-600 mt-1">via Indeed</div>
                  )}
                  {String(job.id).startsWith('linkedin_') && (
                    <div className="text-xs text-blue-600 mt-1">via LinkedIn</div>
                  )}
                  {String(job.id).startsWith('stackoverflow_') && (
                    <div className="text-xs text-orange-600 mt-1">via StackOverflow</div>
                  )}
                  {(job.id >= 1000 && job.id <= 999999) && (
                    <div className="text-xs text-green-600 mt-1 font-semibold">via RapidAPI</div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">{job.type}</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{job.location}</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">{job.salary}</span>
              </div>
              
              <p className="text-gray-700 text-sm line-clamp-2">{job.description}</p>
            </div>
          ))}

          {!isLoadingJobs && jobs.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or sync jobs from external sources</p>
              <button
                onClick={triggerManualSync}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Sync Job Boards
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {selectedJob ? (
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedJob.title}</h3>
              <p className="text-gray-600 mb-4">{selectedJob.company} • {selectedJob.location}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">{selectedJob.type}</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">{selectedJob.salary}</span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Job Description</h4>
              <p className="text-gray-700">{selectedJob.description}</p>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
              <ul className="space-y-2">
                {selectedJob.requirements.map((req, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Resume Customization Button */}
            <div className="border-t pt-6">
              <h4 className="font-semibold text-gray-900 mb-3">AI-Powered Application</h4>
              <button
                onClick={() => handleCustomizeResume(selectedJob)}
                disabled={isGeneratingResume}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isGeneratingResume
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                {isGeneratingResume ? (
                  <div className="flex items-center justify-center">
                    <div className="loading-spinner mr-2"></div>
                    Generating Custom Resume...
                  </div>
                ) : (
                  'Customize Resume with AI'
                )}
              </button>
              
              <p className="text-sm text-gray-600 mt-2">
                AI will analyze this job description and create a tailored resume highlighting your most relevant skills and experience.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Job</h3>
            <p className="text-gray-600">Choose a job posting to view details and customize your resume</p>
          </div>
        )}
      </div>

      {/* Template Selection Modal */}
      {showTemplateSelector && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Customize Resume for {selectedJob.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Choose a template and we'll generate your AI-optimized resume
                  </p>
                </div>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Company Analysis Preview */}
              {companyAnalysis && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-900 mb-2">🏢 Company Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-800">Culture Values:</span>
                      <p className="text-blue-700">{companyAnalysis.culture?.values?.slice(0, 3).join(', ')}</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Tech Stack:</span>
                      <p className="text-blue-700">{[...companyAnalysis.techStack?.frontend || [], ...companyAnalysis.techStack?.backend || []].slice(0, 4).join(', ')}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Selector */}
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                onTemplateSelect={setSelectedTemplate}
                onGenerate={() => handleGenerateWithTemplate(selectedJob)}
                isGenerating={isGeneratingResume}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
