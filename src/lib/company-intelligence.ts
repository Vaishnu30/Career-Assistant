// Enhanced company analysis and intelligence service

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

export class CompanyIntelligenceService {
  private static companyDatabase: Record<string, CompanyAnalysis> = {
    'techcorp inc': {
      name: 'TechCorp Inc',
      culture: {
        values: ['Innovation', 'Collaboration', 'Customer-first', 'Quality'],
        workStyle: ['Agile', 'Remote-friendly', 'Fast-paced', 'Results-driven'],
        benefits: ['Health insurance', 'Flexible PTO', 'Learning stipend', 'Stock options'],
        environment: 'Modern tech company with emphasis on work-life balance and continuous learning'
      },
      techStack: {
        frontend: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
        backend: ['Node.js', 'Express', 'Python', 'FastAPI'],
        databases: ['PostgreSQL', 'Redis', 'MongoDB'],
        cloud: ['AWS', 'Docker', 'Kubernetes'],
        tools: ['Git', 'Jira', 'Slack', 'Figma']
      },
      insights: {
        teamSize: '50-200 employees',
        growthStage: 'Scale-up',
        fundingStatus: 'Series B funded',
        industryFocus: ['SaaS', 'B2B Software', 'Enterprise Solutions']
      },
      keywordOptimization: ['scalable solutions', 'user experience', 'agile development', 'cloud-native', 'customer success']
    },
    'startupxyz': {
      name: 'StartupXYZ',
      culture: {
        values: ['Move fast', 'Break things', 'User-centric', 'Transparency'],
        workStyle: ['Startup hustle', 'Lean methodology', 'Ownership mindset', 'Rapid iteration'],
        benefits: ['Equity package', 'Unlimited PTO', 'Remote work', 'Learning budget'],
        environment: 'High-energy startup environment with opportunity for rapid growth and impact'
      },
      techStack: {
        frontend: ['Vue.js', 'React', 'JavaScript', 'CSS3'],
        backend: ['Node.js', 'Python', 'Django', 'REST APIs'],
        databases: ['MongoDB', 'PostgreSQL', 'Redis'],
        cloud: ['AWS', 'Heroku', 'Netlify'],
        tools: ['GitHub', 'Slack', 'Notion', 'Linear']
      },
      insights: {
        teamSize: '10-50 employees',
        growthStage: 'Early-stage',
        fundingStatus: 'Seed funded',
        industryFocus: ['Consumer Apps', 'Mobile-first', 'Social Technology']
      },
      keywordOptimization: ['mvp development', 'rapid prototyping', 'user acquisition', 'product-market fit', 'growth hacking']
    },
    'datasolutions ltd': {
      name: 'DataSolutions Ltd',
      culture: {
        values: ['Data-driven decisions', 'Scientific rigor', 'Continuous improvement', 'Ethics in AI'],
        workStyle: ['Research-oriented', 'Collaborative', 'Detail-focused', 'Evidence-based'],
        benefits: ['Research time', 'Conference attendance', 'Publications support', 'Advanced tooling'],
        environment: 'Research-focused company emphasizing data science and machine learning innovation'
      },
      techStack: {
        frontend: ['React', 'D3.js', 'Plotly', 'Jupyter'],
        backend: ['Python', 'FastAPI', 'Django', 'Scala'],
        databases: ['PostgreSQL', 'ClickHouse', 'Apache Kafka', 'Elasticsearch'],
        cloud: ['AWS', 'GCP', 'Apache Spark', 'Kubernetes'],
        tools: ['Git', 'MLflow', 'Apache Airflow', 'Terraform']
      },
      insights: {
        teamSize: '100-500 employees',
        growthStage: 'Established',
        fundingStatus: 'Profitable',
        industryFocus: ['Data Analytics', 'Machine Learning', 'Enterprise AI']
      },
      keywordOptimization: ['data pipeline', 'machine learning models', 'scalable architecture', 'data visualization', 'predictive analytics']
    }
  }

  static analyzeCompany(companyName: string, jobDescription?: string): CompanyAnalysis {
    const normalizedName = companyName.toLowerCase().trim()
    
    // Check if we have specific company data
    if (this.companyDatabase[normalizedName]) {
      return this.companyDatabase[normalizedName]
    }

    // Generate analysis based on job description if available
    if (jobDescription) {
      return this.generateAnalysisFromJobDescription(companyName, jobDescription)
    }

    // Return generic analysis
    return this.generateGenericAnalysis(companyName)
  }

  private static generateAnalysisFromJobDescription(companyName: string, jobDescription: string): CompanyAnalysis {
    const desc = jobDescription.toLowerCase()
    
    // Analyze culture indicators
    const culture = {
      values: this.extractValues(desc),
      workStyle: this.extractWorkStyle(desc),
      benefits: this.extractBenefits(desc),
      environment: this.determineEnvironment(desc)
    }

    // Analyze tech stack
    const techStack = {
      frontend: this.extractFrontendTech(desc),
      backend: this.extractBackendTech(desc),
      databases: this.extractDatabases(desc),
      cloud: this.extractCloudTech(desc),
      tools: this.extractTools(desc)
    }

    // Generate insights
    const insights = {
      teamSize: this.estimateTeamSize(desc),
      growthStage: this.determineGrowthStage(desc),
      fundingStatus: this.estimateFundingStatus(desc),
      industryFocus: this.extractIndustryFocus(desc)
    }

    return {
      name: companyName,
      culture,
      techStack,
      insights,
      keywordOptimization: this.generateKeywords(desc)
    }
  }

  private static generateGenericAnalysis(companyName: string): CompanyAnalysis {
    return {
      name: companyName,
      culture: {
        values: ['Innovation', 'Quality', 'Teamwork', 'Growth'],
        workStyle: ['Collaborative', 'Professional', 'Results-oriented'],
        benefits: ['Competitive salary', 'Health benefits', 'Professional development'],
        environment: 'Professional work environment focused on delivering quality results'
      },
      techStack: {
        frontend: ['JavaScript', 'HTML', 'CSS'],
        backend: ['Various technologies'],
        databases: ['SQL databases'],
        cloud: ['Cloud platforms'],
        tools: ['Standard development tools']
      },
      insights: {
        teamSize: 'Medium-sized team',
        growthStage: 'Established',
        fundingStatus: 'Stable',
        industryFocus: ['Technology', 'Software Development']
      },
      keywordOptimization: ['quality software', 'team collaboration', 'professional development', 'technical excellence']
    }
  }

  // Helper methods for analysis
  private static extractValues(desc: string): string[] {
    const valueKeywords = {
      'innovation': 'Innovation',
      'quality': 'Quality',
      'customer': 'Customer-first',
      'team': 'Teamwork',
      'agile': 'Agility',
      'transparency': 'Transparency',
      'excellence': 'Excellence'
    }

    return Object.entries(valueKeywords)
      .filter(([keyword]) => desc.includes(keyword))
      .map(([_, value]) => value)
  }

  private static extractWorkStyle(desc: string): string[] {
    const styles = []
    if (desc.includes('agile') || desc.includes('scrum')) styles.push('Agile methodology')
    if (desc.includes('remote') || desc.includes('hybrid')) styles.push('Remote-friendly')
    if (desc.includes('fast-paced') || desc.includes('startup')) styles.push('Fast-paced')
    if (desc.includes('collaborative') || desc.includes('team')) styles.push('Collaborative')
    return styles
  }

  private static extractBenefits(desc: string): string[] {
    const benefits = []
    if (desc.includes('health') || desc.includes('medical')) benefits.push('Health insurance')
    if (desc.includes('pto') || desc.includes('vacation')) benefits.push('Paid time off')
    if (desc.includes('equity') || desc.includes('stock')) benefits.push('Equity package')
    if (desc.includes('learning') || desc.includes('training')) benefits.push('Learning stipend')
    return benefits
  }

  private static determineEnvironment(desc: string): string {
    if (desc.includes('startup') || desc.includes('fast-paced')) {
      return 'Dynamic startup environment with rapid growth opportunities'
    }
    if (desc.includes('enterprise') || desc.includes('established')) {
      return 'Established enterprise environment with structured processes'
    }
    return 'Professional work environment focused on collaboration and innovation'
  }

  private static extractFrontendTech(desc: string): string[] {
    const frontendTech = ['react', 'vue', 'angular', 'javascript', 'typescript', 'html', 'css']
    return frontendTech.filter(tech => desc.includes(tech))
  }

  private static extractBackendTech(desc: string): string[] {
    const backendTech = ['node.js', 'python', 'java', 'c#', 'go', 'ruby', 'php']
    return backendTech.filter(tech => desc.includes(tech))
  }

  private static extractDatabases(desc: string): string[] {
    const databases = ['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch']
    return databases.filter(db => desc.includes(db))
  }

  private static extractCloudTech(desc: string): string[] {
    const cloudTech = ['aws', 'azure', 'gcp', 'docker', 'kubernetes']
    return cloudTech.filter(tech => desc.includes(tech))
  }

  private static extractTools(desc: string): string[] {
    const tools = ['git', 'jira', 'slack', 'jenkins', 'terraform']
    return tools.filter(tool => desc.includes(tool))
  }

  private static estimateTeamSize(desc: string): string {
    if (desc.includes('startup') || desc.includes('small team')) return '10-50 employees'
    if (desc.includes('enterprise') || desc.includes('large')) return '500+ employees'
    return '50-200 employees'
  }

  private static determineGrowthStage(desc: string): string {
    if (desc.includes('startup') || desc.includes('early stage')) return 'Early-stage'
    if (desc.includes('scale') || desc.includes('growth')) return 'Scale-up'
    return 'Established'
  }

  private static estimateFundingStatus(desc: string): string {
    if (desc.includes('funded') || desc.includes('series')) return 'VC funded'
    if (desc.includes('profitable') || desc.includes('established')) return 'Profitable'
    return 'Stable'
  }

  private static extractIndustryFocus(desc: string): string[] {
    const industries = []
    if (desc.includes('saas') || desc.includes('software')) industries.push('SaaS')
    if (desc.includes('fintech') || desc.includes('financial')) industries.push('FinTech')
    if (desc.includes('healthcare') || desc.includes('medical')) industries.push('HealthTech')
    if (desc.includes('ecommerce') || desc.includes('retail')) industries.push('E-commerce')
    if (desc.includes('data') || desc.includes('analytics')) industries.push('Data & Analytics')
    return industries.length > 0 ? industries : ['Technology']
  }

  private static generateKeywords(desc: string): string[] {
    const keywords = []
    if (desc.includes('scale')) keywords.push('scalable solutions')
    if (desc.includes('user') || desc.includes('customer')) keywords.push('user experience')
    if (desc.includes('performance')) keywords.push('high performance')
    if (desc.includes('security')) keywords.push('secure development')
    if (desc.includes('api')) keywords.push('API development')
    return keywords.length > 0 ? keywords : ['software development', 'technical excellence']
  }

  static generateCompanySpecificContent(analysis: CompanyAnalysis, userProfile: any): {
    tailoredSummary: string
    keywordOptimizedSkills: string[]
    cultureAlignedExperience: string[]
  } {
    const { culture, techStack, keywordOptimization } = analysis

    // Generate company-specific summary
    const tailoredSummary = `Passionate ${userProfile.title || 'developer'} with expertise in ${techStack.frontend.slice(0, 3).join(', ')}. Experienced in building ${keywordOptimization.slice(0, 2).join(' and ')} with strong focus on ${culture.values.slice(0, 2).join(' and ').toLowerCase()}. Excited to contribute to ${analysis.name}'s mission of ${culture.environment.split(' ').slice(-3).join(' ')}.`

    // Optimize skills based on company tech stack
    const allCompanyTech = [...techStack.frontend, ...techStack.backend, ...techStack.databases, ...techStack.cloud, ...techStack.tools]
    const keywordOptimizedSkills = userProfile.skills?.filter((skill: string) => 
      allCompanyTech.some(tech => 
        skill.toLowerCase().includes(tech.toLowerCase()) || 
        tech.toLowerCase().includes(skill.toLowerCase())
      )
    ) || []

    // Align experience descriptions with company culture
    const cultureAlignedExperience = culture.values.map(value => 
      `Demonstrated ${value.toLowerCase()} through collaborative development projects and user-focused solutions`
    )

    return {
      tailoredSummary,
      keywordOptimizedSkills,
      cultureAlignedExperience
    }
  }
}
