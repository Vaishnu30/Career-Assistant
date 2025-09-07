// Simple PDF Resume Generator using browser APIs
interface ResumeData {
  personal_info: any
  tailored_summary: string
  highlighted_skills: string[]
  relevant_experience: any[]
  relevant_projects: any[]
  relevant_education: any[]
}

interface JobInfo {
  title: string
  company: string
  id: number
}

// Create HTML template for PDF generation
const createResumeHTML = (resumeData: ResumeData, jobInfo: JobInfo): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Resume - ${resumeData.personal_info.name}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
          max-width: 800px;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .name {
          font-size: 32px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .contact {
          font-size: 14px;
          color: #666;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .summary {
          font-size: 14px;
          text-align: justify;
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
        }
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .skill-tag {
          background: #dbeafe;
          color: #1e40af;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .experience-item, .project-item, .education-item {
          margin-bottom: 20px;
          padding: 15px;
          border-left: 4px solid #2563eb;
          background: #f9fafb;
        }
        .item-title {
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
        }
        .item-company {
          font-size: 14px;
          color: #666;
          font-style: italic;
        }
        .item-duration {
          font-size: 12px;
          color: #888;
          float: right;
        }
        .item-description {
          font-size: 13px;
          margin-top: 8px;
        }
        .technologies {
          font-size: 12px;
          color: #2563eb;
          font-weight: 500;
          margin-top: 5px;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          color: #888;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        @media print {
          body { padding: 0; }
          .section { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${resumeData.personal_info.name}</div>
        <div class="contact">
          ${resumeData.personal_info.email} | ${resumeData.personal_info.phone} | ${resumeData.personal_info.location}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Professional Summary</div>
        <div class="summary">${resumeData.tailored_summary}</div>
      </div>

      <div class="section">
        <div class="section-title">Technical Skills</div>
        <div class="skills">
          ${resumeData.highlighted_skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Professional Experience</div>
        ${resumeData.relevant_experience.map(exp => `
          <div class="experience-item">
            <div class="item-title">${exp.title}</div>
            <div class="item-company">${exp.company} <span class="item-duration">${exp.duration}</span></div>
            <div class="item-description">${exp.description}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">Key Projects</div>
        ${resumeData.relevant_projects.map(project => `
          <div class="project-item">
            <div class="item-title">${project.name}</div>
            <div class="technologies">Technologies: ${project.technologies}</div>
            <div class="item-description">${project.description}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">Education</div>
        ${resumeData.relevant_education.map(edu => `
          <div class="education-item">
            <div class="item-title">${edu.degree}</div>
            <div class="item-company">${edu.school} <span class="item-duration">${edu.year}</span></div>
            ${edu.gpa ? `<div class="item-description">GPA: ${edu.gpa}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="footer">
        Resume customized for ${jobInfo.title} at ${jobInfo.company} - Generated by AI Career Assistant
      </div>
    </body>
    </html>
  `
}

// Generate and download PDF using browser print functionality
export const generateAndDownloadResume = (resumeData: ResumeData, jobInfo: JobInfo): void => {
  try {
    // Create the HTML content
    const htmlContent = createResumeHTML(resumeData, jobInfo)
    
    // Create a new window with the resume content
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Failed to open print window. Please check your browser popup settings.')
    }
    
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        
        // Close the window after printing (optional)
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 500)
    }
    
  } catch (error) {
    console.error('PDF generation error:', error)
    
    // Fallback: create downloadable HTML file
    const htmlContent = createResumeHTML(resumeData, jobInfo)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `Resume_${jobInfo.company}_${jobInfo.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }
}
