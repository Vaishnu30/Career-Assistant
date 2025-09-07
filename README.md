# Career Assistant 🤖💼

## AI-Powered Career Development Platform

An intelligent platform that helps students and professionals customize resumes for specific job postings, provides skill gap analysis, and suggests learning paths to improve their candidacy.

## 🚀 Features

### Core Functionality
- **Job Posting Portal**: Browse available job opportunities with detailed descriptions
- **AI Resume Customization**: Generate tailored resumes based on specific job descriptions
- **Skill Gap Analysis**: Identify missing skills and get personalized recommendations
- **Study Path Generation**: Receive curated learning resources and timelines
- **Company-Specific Tailoring**: Adapt resume content to match company culture and requirements
- **PDF Generation**: Download professionally formatted resumes

### AI Capabilities
- **Job Description Analysis**: Extract key requirements and technologies
- **Skill Matching**: Compare user profile against job requirements
- **Content Optimization**: Highlight most relevant experience and projects
- **Learning Recommendations**: Suggest courses, tutorials, and practice resources

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management and side effects

### Backend & APIs
- **Next.js API Routes** - Serverless backend functions
- **OpenAI API** - AI-powered analysis and content generation
- **Descope** - Secure authentication and user management

### Data & Storage
- **MongoDB** - Document database for user profiles and job data
- **File System** - PDF storage and temporary file handling

### AI & ML
- **OpenAI GPT-4** - Job analysis and resume optimization
- **Custom Algorithms** - Skill matching and gap analysis

### PDF Generation
- **jsPDF** - Client-side PDF generation
- **Puppeteer** - Server-side PDF rendering (alternative)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- OpenAI API key
- Descope account and project

### Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ai-career-assistant
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # Descope Authentication
   DESCOPE_PROJECT_ID=your_descope_project_id
   DESCOPE_ACCESS_KEY=your_descope_access_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/ai-career-assistant
   
   # App Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 How It Works

### 1. User Profile Setup
Students create comprehensive profiles including:
- Personal information and contact details
- Skills and technical competencies
- Education history and achievements
- Work experience and internships
- Personal projects and portfolios

### 2. Job Discovery
- Browse curated job postings from various companies
- View detailed job descriptions and requirements
- Filter by location, type, and experience level

### 3. AI-Powered Analysis
When a user selects a job:
- AI analyzes the job description and requirements
- Compares user skills against job needs
- Identifies skill gaps and missing competencies
- Determines focus areas (Frontend, Backend, Full-stack, etc.)

### 4. Resume Customization
- Generates tailored professional summary
- Prioritizes relevant skills and technologies
- Highlights most applicable experience
- Selects best-matching projects
- Formats content for ATS compatibility

### 5. Skill Development Planning
- Creates personalized study plans
- Recommends specific courses and resources
- Estimates learning timeframes
- Prioritizes skills by importance and impact

### 6. PDF Generation & Download
- Produces professional resume in PDF format
- Applies clean, modern formatting
- Ensures ATS-friendly structure
- Provides instant download capability

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── generate-resume/
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── Header.tsx         # Navigation header
│   ├── JobBoard.tsx       # Job listings and details
│   └── UserProfile.tsx    # Profile management
├── lib/                   # Utility functions
│   └── ai-service.ts      # AI analysis logic
└── types/                 # TypeScript definitions
    └── index.ts           # Interface definitions
```

## 🤖 AI Integration

### Job Analysis Engine
- **Technology Extraction**: Identifies required programming languages, frameworks, and tools
- **Experience Level Detection**: Determines seniority requirements (Junior, Mid-level, Senior)
- **Company Culture Analysis**: Extracts cultural indicators and work environment preferences
- **Growth Potential Assessment**: Evaluates learning and advancement opportunities

### Skill Matching Algorithm
- **Semantic Matching**: Goes beyond exact keyword matching
- **Skill Prioritization**: Ranks skills by relevance and importance
- **Gap Identification**: Finds missing competencies
- **Learning Path Generation**: Creates structured improvement plans

### Content Optimization
- **Dynamic Summarization**: Generates role-specific professional summaries
- **Experience Prioritization**: Reorders experience by relevance
- **Project Selection**: Chooses most applicable portfolio pieces
- **Keyword Optimization**: Ensures ATS compatibility

## 🔐 Security & Authentication

### Descope Integration
- **Secure OAuth**: No hardcoded tokens or custom authentication logic
- **User Management**: Streamlined signup and signin flows
- **Session Handling**: Secure session management
- **Access Control**: Role-based permissions

### Data Protection
- **Environment Variables**: Sensitive data stored securely
- **API Security**: Protected routes and request validation
- **Input Sanitization**: XSS and injection prevention
- **HTTPS Enforcement**: Secure data transmission

## 🎨 Design & UX

### Modern Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Clean Aesthetics**: Professional and student-friendly interface
- **Intuitive Navigation**: Easy-to-use job browsing and profile management
- **Loading States**: Clear feedback during AI processing

### Accessibility
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG-compliant color schemes
- **Focus Management**: Clear focus indicators

## 🚀 Deployment

### Recommended Platforms
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Alternative with good Next.js support
- **Railway**: Full-stack deployment with database

### Environment Setup
1. Configure production environment variables
2. Set up MongoDB Atlas for production database
3. Configure Descope for production domain
4. Set up OpenAI API billing and rate limits

## 🏆 Hackathon Alignment

### Theme 1 Requirements ✅
- **Purposeful AI Agent**: Solves real career challenges for students
- **Third-party Integration**: Uses Descope for secure authentication
- **Real-world Problem**: Addresses job application difficulties
- **Beginner to Intermediate**: Accessible to various skill levels
- **Automation & Value**: Delivers immediate, practical benefits

### Innovation Points
- **AI-Driven Personalization**: Custom resume generation per job
- **Educational Integration**: Combines job applications with skill development
- **Holistic Approach**: End-to-end career assistance platform
- **Scalable Architecture**: Ready for real-world deployment

## 🔄 Future Enhancements

### Phase 2 Features
- **Interview Preparation**: AI-generated practice questions
- **Application Tracking**: Monitor application status and responses
- **Networking Integration**: Connect with industry professionals
- **Salary Insights**: Market rate analysis and negotiation tips

### Advanced AI Features
- **Cover Letter Generation**: Personalized cover letters
- **LinkedIn Optimization**: Profile enhancement suggestions
- **Interview Analysis**: Video interview practice with feedback
- **Market Trend Analysis**: Industry demand forecasting

## 🤝 Contributing

This project was built for the Global MCP Hackathon. Contributions and feedback are welcome!

### Development Guidelines
1. Follow TypeScript best practices
2. Maintain component modularity
3. Write descriptive commit messages
4. Test AI integration thoroughly
5. Ensure responsive design

## 📄 License

This project is created for the Global MCP Hackathon. Please refer to hackathon guidelines for usage terms.

## 🙏 Acknowledgments

- **Global MCP Hackathon** for the opportunity and platform
- **Descope** for secure authentication infrastructure
- **OpenAI** for AI capabilities and GPT models
- **Next.js Team** for the excellent React framework
- **Tailwind CSS** for the utility-first styling approach

---

Built with ❤️ for the Global MCP Hackathon - Theme 1: Build a purposeful AI agent
