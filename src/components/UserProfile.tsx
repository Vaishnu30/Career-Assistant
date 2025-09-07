'use client'

import { useState } from 'react'
import { UserProfile as UserProfileType } from '@/types'

interface UserProfileProps {
  profile: UserProfileType
  setProfile: (profile: UserProfileType) => void
}

export default function UserProfile({ profile, setProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [originalProfile, setOriginalProfile] = useState(profile)
  const [newSkill, setNewSkill] = useState('')
  
  // States for adding new items
  const [showAddEducation, setShowAddEducation] = useState(false)
  const [showAddExperience, setShowAddExperience] = useState(false)
  const [showAddProject, setShowAddProject] = useState(false)
  
  // States for editing existing items
  const [editingEducation, setEditingEducation] = useState<number | null>(null)
  const [editingExperience, setEditingExperience] = useState<number | null>(null)
  const [editingProject, setEditingProject] = useState<number | null>(null)
  
  // New item forms
  const [newEducation, setNewEducation] = useState({
    degree: '',
    school: '',
    year: '',
    gpa: ''
  })
  
  const [newExperience, setNewExperience] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  })
  
  const [newProject, setNewProject] = useState({
    name: '',
    technologies: '',
    description: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setProfile({
      ...profile,
      [field]: value
    })
  }

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (index: number) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((_, i) => i !== index)
    })
  }

  // Education handlers
  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.school && newEducation.year) {
      setProfile({
        ...profile,
        education: [...profile.education, newEducation]
      })
      setNewEducation({ degree: '', school: '', year: '', gpa: '' })
      setShowAddEducation(false)
    }
  }

  const handleRemoveEducation = (index: number) => {
    setProfile({
      ...profile,
      education: profile.education.filter((_, i) => i !== index)
    })
  }

  // Experience handlers
  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company && newExperience.duration) {
      setProfile({
        ...profile,
        experience: [...profile.experience, newExperience]
      })
      setNewExperience({ title: '', company: '', duration: '', description: '' })
      setShowAddExperience(false)
    }
  }

  const handleRemoveExperience = (index: number) => {
    setProfile({
      ...profile,
      experience: profile.experience.filter((_, i) => i !== index)
    })
  }

  // Project handlers
  const handleAddProject = () => {
    if (newProject.name && newProject.technologies && newProject.description) {
      setProfile({
        ...profile,
        projects: [...profile.projects, newProject]
      })
      setNewProject({ name: '', technologies: '', description: '' })
      setShowAddProject(false)
    }
  }

  const handleRemoveProject = (index: number) => {
    setProfile({
      ...profile,
      projects: profile.projects.filter((_, i) => i !== index)
    })
  }

  // Handle starting edit mode
  const handleStartEdit = () => {
    setIsEditing(true)
    setOriginalProfile({ ...profile }) // Store original data for discard
  }

  // Handle discarding changes
  const handleDiscardChanges = () => {
    setProfile(originalProfile) // Restore original data
    setIsEditing(false)
    // Close all forms
    setShowAddEducation(false)
    setShowAddExperience(false)
    setShowAddProject(false)
    setEditingEducation(null)
    setEditingExperience(null)
    setEditingProject(null)
    alert('Changes discarded! 🔄')
  }

  // Edit existing items handlers
  const handleEditEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...profile.education]
    updatedEducation[index] = { ...updatedEducation[index], [field]: value }
    setProfile({ ...profile, education: updatedEducation })
  }

  const handleEditExperience = (index: number, field: string, value: string) => {
    const updatedExperience = [...profile.experience]
    updatedExperience[index] = { ...updatedExperience[index], [field]: value }
    setProfile({ ...profile, experience: updatedExperience })
  }

  const handleEditProject = (index: number, field: string, value: string) => {
    const updatedProjects = [...profile.projects]
    updatedProjects[index] = { ...updatedProjects[index], [field]: value }
    setProfile({ ...profile, projects: updatedProjects })
  }

  const handleSave = async () => {
    setIsEditing(false)
    // Close all add forms and editing modes when saving
    setShowAddEducation(false)
    setShowAddExperience(false)
    setShowAddProject(false)
    setEditingEducation(null)
    setEditingExperience(null)
    setEditingProject(null)
    // Update the original profile to current state
    setOriginalProfile({ ...profile })
    
    // Save to localStorage for persistence
    localStorage.setItem('userProfile', JSON.stringify(profile))
    
    // Save to database
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      })
      
      const result = await response.json()
      if (result.success) {
        console.log('✅ User profile saved to database successfully')
      } else {
        console.error('❌ Failed to save profile to database:', result.error)
      }
    } catch (error) {
      console.error('❌ Database save error:', error)
    }
    
    alert('Profile saved successfully! 🎉 Your changes will be reflected in AI-generated resumes.')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
            <p className="text-gray-600">Manage your information for AI-powered resume customization</p>
          </div>
          
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleDiscardChanges}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Discard Changes
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Basic Information */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h3>
          <textarea
            value={profile.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            disabled={!isEditing}
            rows={4}
            className="input-field"
            placeholder="Write a brief summary of your professional background and goals..."
          />
        </div>

        {/* Skills */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span
                key={index}
                className="skill-tag"
              >
                {skill}
                {isEditing && (
                  <button 
                    className="ml-2 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveSkill(index)}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <input
              type="text"
              placeholder="Add a new skill and press Enter"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
              className="input-field mt-4"
            />
          )}
        </div>

        {/* Education */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Education</h3>
            {isEditing && (
              <button
                onClick={() => setShowAddEducation(true)}
                className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
              >
                + Add Education
              </button>
            )}
          </div>
          
          {profile.education.map((edu, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 relative">
              {isEditing && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => setEditingEducation(editingEducation === index ? null : index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit this education"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemoveEducation(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove this education"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {editingEducation === index ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => handleEditEducation(index, 'degree', e.target.value)}
                    className="input-field"
                    placeholder="Degree"
                  />
                  <input
                    type="text"
                    value={edu.school}
                    onChange={(e) => handleEditEducation(index, 'school', e.target.value)}
                    className="input-field"
                    placeholder="School/University"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => handleEditEducation(index, 'year', e.target.value)}
                    className="input-field"
                    placeholder="Year"
                  />
                  <input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => handleEditEducation(index, 'gpa', e.target.value)}
                    className="input-field"
                    placeholder="GPA (optional)"
                  />
                  <div className="md:col-span-2">
                    <button
                      onClick={() => setEditingEducation(null)}
                      className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Done Editing
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.school}</p>
                  <p className="text-sm text-gray-500">{edu.year}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                </>
              )}
            </div>
          ))}

          {/* Add Education Form */}
          {showAddEducation && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Add New Education</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Degree (e.g., Bachelor of Science in Computer Science)"
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({...newEducation, degree: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="School/University"
                  value={newEducation.school}
                  onChange={(e) => setNewEducation({...newEducation, school: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Year (e.g., 2021-2025)"
                  value={newEducation.year}
                  onChange={(e) => setNewEducation({...newEducation, year: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="GPA (optional)"
                  value={newEducation.gpa}
                  onChange={(e) => setNewEducation({...newEducation, gpa: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleAddEducation}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Education
                </button>
                <button
                  onClick={() => setShowAddEducation(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Experience */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Experience</h3>
            {isEditing && (
              <button
                onClick={() => setShowAddExperience(true)}
                className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
              >
                + Add Experience
              </button>
            )}
          </div>
          
          {profile.experience.map((exp, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 relative">
              {isEditing && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => setEditingExperience(editingExperience === index ? null : index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit this experience"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemoveExperience(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove this experience"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {editingExperience === index ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => handleEditExperience(index, 'title', e.target.value)}
                      className="input-field"
                      placeholder="Job Title"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleEditExperience(index, 'company', e.target.value)}
                      className="input-field"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleEditExperience(index, 'duration', e.target.value)}
                      className="input-field md:col-span-2"
                      placeholder="Duration"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleEditExperience(index, 'description', e.target.value)}
                    className="input-field h-24 resize-none"
                    placeholder="Job description"
                    rows={4}
                  />
                  <button
                    onClick={() => setEditingExperience(null)}
                    className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Done Editing
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                  <p className="text-gray-700">{exp.description}</p>
                </>
              )}
            </div>
          ))}

          {/* Add Experience Form */}
          {showAddExperience && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Add New Experience</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={newExperience.title}
                  onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newExperience.company}
                  onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., Summer 2024, Jan 2023 - Dec 2023)"
                  value={newExperience.duration}
                  onChange={(e) => setNewExperience({...newExperience, duration: e.target.value})}
                  className="input-field md:col-span-2"
                />
              </div>
              <textarea
                placeholder="Job description, responsibilities, and achievements..."
                value={newExperience.description}
                onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                className="input-field mt-4 h-24 resize-none"
                rows={4}
              />
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleAddExperience}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Experience
                </button>
                <button
                  onClick={() => setShowAddExperience(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Projects</h3>
            {isEditing && (
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
              >
                + Add Project
              </button>
            )}
          </div>
          
          {profile.projects.map((project, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 relative">
              {isEditing && (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => setEditingProject(editingProject === index ? null : index)}
                    className="text-blue-500 hover:text-blue-700"
                    title="Edit this project"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemoveProject(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove this project"
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {editingProject === index ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => handleEditProject(index, 'name', e.target.value)}
                    className="input-field"
                    placeholder="Project Name"
                  />
                  <input
                    type="text"
                    value={project.technologies}
                    onChange={(e) => handleEditProject(index, 'technologies', e.target.value)}
                    className="input-field"
                    placeholder="Technologies Used"
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => handleEditProject(index, 'description', e.target.value)}
                    className="input-field h-24 resize-none"
                    placeholder="Project description"
                    rows={4}
                  />
                  <button
                    onClick={() => setEditingProject(null)}
                    className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Done Editing
                  </button>
                </div>
              ) : (
                <>
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  <p className="text-sm text-blue-600 mb-2">{project.technologies}</p>
                  <p className="text-gray-700">{project.description}</p>
                </>
              )}
            </div>
          ))}

          {/* Add Project Form */}
          {showAddProject && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-3">Add New Project</h4>
              <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  placeholder="Project Name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
                  value={newProject.technologies}
                  onChange={(e) => setNewProject({...newProject, technologies: e.target.value})}
                  className="input-field"
                />
                <textarea
                  placeholder="Project description, features, and achievements..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="input-field h-24 resize-none"
                  rows={4}
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={handleAddProject}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Add Project
                </button>
                <button
                  onClick={() => setShowAddProject(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🤖 AI Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
              <p className="text-gray-700">Your profile shows strong full-stack development skills - great for both frontend and backend roles!</p>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></span>
              <p className="text-gray-700">Consider adding more cloud platform experience (Azure, GCP) to complement your AWS skills.</p>
            </div>
            <div className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <p className="text-gray-700">Your AI project experience will be valuable for modern tech companies embracing AI integration.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
