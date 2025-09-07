// Enhanced PDF generator with multiple templates

import { UserProfile } from '@/types'

export interface ResumeTemplate {
  id: string
  name: string
  description: string
  preview: string
  color: string
  style: 'modern' | 'classic' | 'minimal' | 'creative'
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern-blue',
    name: 'Modern Professional',
    description: 'Clean, modern design with blue accents. Perfect for tech roles.',
    preview: '🔷',
    color: '#3B82F6',
    style: 'modern'
  },
  {
    id: 'classic-black',
    name: 'Classic Corporate',
    description: 'Traditional black and white design. Ideal for conservative industries.',
    preview: '⬛',
    color: '#1F2937',
    style: 'classic'
  },
  {
    id: 'minimal-green',
    name: 'Minimal Clean',
    description: 'Ultra-clean minimal design with green highlights.',
    preview: '🟢',
    color: '#10B981',
    style: 'minimal'
  },
  {
    id: 'creative-purple',
    name: 'Creative Impact',
    description: 'Bold, creative design for design and startup roles.',
    preview: '🟣',
    color: '#8B5CF6',
    style: 'creative'
  },
  {
    id: 'tech-orange',
    name: 'Tech Innovator',
    description: 'Modern tech-focused design with orange energy.',
    preview: '🟠',
    color: '#F97316',
    style: 'modern'
  },
  {
    id: 'executive-navy',
    name: 'Executive Level',
    description: 'Sophisticated navy design for senior positions.',
    preview: '🔵',
    color: '#1E40AF',
    style: 'classic'
  }
]

interface GenerateResumeOptions {
  template: string
  userProfile: UserProfile
  jobInfo?: {
    title: string
    company: string
    id: string | number
  }
  aiAnalysis?: any
  customizations?: {
    includePhoto?: boolean
    fontSize?: 'small' | 'medium' | 'large'
    pageMargins?: 'narrow' | 'normal' | 'wide'
  }
}

export async function generateAndDownloadResume(options: GenerateResumeOptions): Promise<void> {
  try {
    // Dynamic import to avoid SSR issues
    const jsPDFModule = await import('jspdf')
    const jsPDF = jsPDFModule.default

    const { template, userProfile, jobInfo, aiAnalysis, customizations } = options
    const selectedTemplate = resumeTemplates.find(t => t.id === template) || resumeTemplates[0]
    
    const doc = new jsPDF()
    
    // Apply template-specific styling
    switch (selectedTemplate.style) {
      case 'modern':
        generateModernTemplate(doc, selectedTemplate, userProfile, jobInfo, aiAnalysis, customizations)
        break
      case 'classic':
        generateClassicTemplate(doc, selectedTemplate, userProfile, jobInfo, aiAnalysis, customizations)
        break
      case 'minimal':
        generateMinimalTemplate(doc, selectedTemplate, userProfile, jobInfo, aiAnalysis, customizations)
        break
      case 'creative':
        generateCreativeTemplate(doc, selectedTemplate, userProfile, jobInfo, aiAnalysis, customizations)
        break
      default:
        generateModernTemplate(doc, selectedTemplate, userProfile, jobInfo, aiAnalysis, customizations)
    }

    // Generate filename
    const fileName = jobInfo 
      ? `${userProfile.name.replace(/\s+/g, '_')}_Resume_${jobInfo.company.replace(/\s+/g, '_')}_${jobInfo.title.replace(/\s+/g, '_')}.pdf`
      : `${userProfile.name.replace(/\s+/g, '_')}_Resume.pdf`

    // Download the PDF
    doc.save(fileName)
    
  } catch (error) {
    console.error('PDF generation error:', error)
    throw new Error('Failed to generate PDF resume')
  }
}

function generateModernTemplate(
  doc: any, 
  template: ResumeTemplate, 
  profile: UserProfile, 
  jobInfo?: any, 
  aiAnalysis?: any,
  customizations?: any
): void {
  const primaryColor = template.color
  const pageWidth = doc.internal.pageSize.width
  const margin = customizations?.pageMargins === 'narrow' ? 15 : customizations?.pageMargins === 'wide' ? 25 : 20
  
  let yPosition = margin

  // Header Section with colored background
  doc.setFillColor(primaryColor)
  doc.rect(0, 0, pageWidth, 45, 'F')
  
  // Name
  doc.setFontSize(24)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text(profile.name, margin, 25)
  
  // Contact Info
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const contactInfo = `${profile.email} | ${profile.phone} | ${profile.location}`
  doc.text(contactInfo, margin, 35)
  
  yPosition = 60

  // Professional Summary
  if (profile.summary) {
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PROFESSIONAL SUMMARY', margin, yPosition)
    
    yPosition += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const summaryLines = doc.splitTextToSize(profile.summary, pageWidth - 2 * margin)
    doc.text(summaryLines, margin, yPosition)
    yPosition += summaryLines.length * 4 + 10
  }

  // Skills Section
  if (profile.skills.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('TECHNICAL SKILLS', margin, yPosition)
    
    yPosition += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Organize skills in rows
    const skillsPerRow = 4
    const skillRows = []
    for (let i = 0; i < profile.skills.length; i += skillsPerRow) {
      skillRows.push(profile.skills.slice(i, i + skillsPerRow).join(' • '))
    }
    
    skillRows.forEach(row => {
      doc.text(row, margin, yPosition)
      yPosition += 5
    })
    yPosition += 8
  }

  // Experience Section
  if (profile.experience.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PROFESSIONAL EXPERIENCE', margin, yPosition)
    yPosition += 8

    profile.experience.forEach((exp, index) => {
      // Job title and company
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${exp.title} | ${exp.company}`, margin, yPosition)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'italic')
      doc.text(exp.duration, pageWidth - margin - 40, yPosition)
      
      yPosition += 6
      
      // Description
      doc.setFont('helvetica', 'normal')
      const descLines = doc.splitTextToSize(exp.description, pageWidth - 2 * margin)
      doc.text(descLines, margin, yPosition)
      yPosition += descLines.length * 4 + 8
    })
  }

  // Education Section
  if (profile.education.length > 0) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('EDUCATION', margin, yPosition)
    yPosition += 8

    profile.education.forEach(edu => {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(`${edu.degree}`, margin, yPosition)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`${edu.school} | ${edu.year}`, margin, yPosition + 5)
      
      if (edu.gpa) {
        doc.text(`GPA: ${edu.gpa}`, pageWidth - margin - 30, yPosition + 5)
      }
      
      yPosition += 15
    })
  }

  // Projects Section
  if (profile.projects.length > 0) {
    if (yPosition > 240) {
      doc.addPage()
      yPosition = margin
    }
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('KEY PROJECTS', margin, yPosition)
    yPosition += 8

    profile.projects.forEach(project => {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(project.name, margin, yPosition)
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(`Technologies: ${project.technologies}`, margin, yPosition + 5)
      
      yPosition += 10
      doc.setFont('helvetica', 'normal')
      const projectLines = doc.splitTextToSize(project.description, pageWidth - 2 * margin)
      doc.text(projectLines, margin, yPosition)
      yPosition += projectLines.length * 4 + 8
    })
  }

  // AI Analysis Footer (if available)
  if (aiAnalysis && jobInfo) {
    const footerY = doc.internal.pageSize.height - 20
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text(`✨ AI-optimized for ${jobInfo.title} at ${jobInfo.company} | Match Score: ${aiAnalysis.skill_match_percentage}%`, margin, footerY)
  }
}

function generateClassicTemplate(doc: any, template: ResumeTemplate, profile: UserProfile, jobInfo?: any, aiAnalysis?: any, customizations?: any): void {
  const pageWidth = doc.internal.pageSize.width
  const margin = 20
  let yPosition = margin

  // Header - Classic style with line separator
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(profile.name.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' })
  
  yPosition += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const contactLine = `${profile.email} • ${profile.phone} • ${profile.location}`
  doc.text(contactLine, pageWidth / 2, yPosition, { align: 'center' })
  
  // Horizontal line
  yPosition += 8
  doc.setLineWidth(0.5)
  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  // Rest of the content similar to modern but with classic styling
  // ... (implement classic-specific styling)
}

function generateMinimalTemplate(doc: any, template: ResumeTemplate, profile: UserProfile, jobInfo?: any, aiAnalysis?: any, customizations?: any): void {
  // Ultra-clean minimal design implementation
  // ... (implement minimal-specific styling)
}

function generateCreativeTemplate(doc: any, template: ResumeTemplate, profile: UserProfile, jobInfo?: any, aiAnalysis?: any, customizations?: any): void {
  // Creative design with more visual elements
  // ... (implement creative-specific styling)
}

// Legacy function for backward compatibility
export async function generateAndDownloadResume_Legacy(
  resumeData: any, 
  jobInfo: any
): Promise<void> {
  return generateAndDownloadResume({
    template: 'modern-blue',
    userProfile: resumeData.personal_info,
    jobInfo,
    customizations: {}
  })
}
