import mongoose from 'mongoose'

// User Profile Schema
const UserProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  education: [{
    degree: String,
    institution: String,
    year: String,
    gpa: String
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    technologies: String,
    link: String
  }],
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isRegistered: {
    type: Boolean,
    default: false
  },
  descopeUserId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// Job Schema
const JobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  salary: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  },
  source: {
    type: String,
    enum: ['rapidapi', 'indeed', 'linkedin', 'stackoverflow', 'mock'],
    required: true
  },
  sourceUrl: {
    type: String,
    default: ''
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Resume Generation Log Schema
const ResumeLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: String,
    required: true
  },
  jobTitle: String,
  company: String,
  resumeData: {
    type: mongoose.Schema.Types.Mixed
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Export models
export const User = mongoose.models.User || mongoose.model('User', UserProfileSchema)
export const Job = mongoose.models.Job || mongoose.model('Job', JobSchema)
export const ResumeLog = mongoose.models.ResumeLog || mongoose.model('ResumeLog', ResumeLogSchema)
