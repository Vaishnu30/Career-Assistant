'use client'

import { useState, useEffect } from 'react'
import JobBoard from '@/components/JobBoard'
import Header from '@/components/Header'
import UserProfile from '@/components/UserProfile'
import LandingPage from '@/components/LandingPage'
import AuthChoice from '@/components/AuthChoice'
import Registration from '@/components/Registration'
import SignIn from '@/components/SignIn'
import AdvancedStudyPlanner from '@/components/AdvancedStudyPlanner'
import IntegrationHub from '@/components/IntegrationHub'
import { useDescope } from '@/components/DescopeAuth'
import { UserProfile as UserProfileType } from '@/types'

export default function HomePage() {
  const { isAuthenticated, loading, signIn, signOut } = useDescope()
  const [activeTab, setActiveTab] = useState<'jobs' | 'profile' | 'study' | 'integrations'>('jobs')
  const [currentView, setCurrentView] = useState<'landing' | 'auth-choice' | 'register' | 'signin' | 'app'>('landing')
  const [isRegistered, setIsRegistered] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false) // Track if user just registered
  const [userType, setUserType] = useState<'new' | 'existing' | null>(null) // Track user choice
  
  // New state for AI career coach integration
  const [lastJobAnalysis, setLastJobAnalysis] = useState<{
    skillGaps: string[]
    jobTitle: string
    company: string
    analysis: any
  } | null>(null)
  
  // Shared profile state - Initialize with empty profile for new users
  const [profile, setProfile] = useState<UserProfileType>({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    education: [],
    experience: [],
    projects: []
  })

  // Load saved profile data on component mount (ENHANCED)
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile')
    const savedRegistered = localStorage.getItem('isRegistered')
    
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
      console.log('✅ Restored user profile from localStorage')
    }
    if (savedRegistered === 'true') {
      setIsRegistered(true)
      console.log('✅ Restored registration state from localStorage')
    }
  }, [])

  // Save profile data whenever it changes
  useEffect(() => {
    if (profile.name || profile.email) { // Only save if profile has some data
      localStorage.setItem('userProfile', JSON.stringify(profile))
    }
  }, [profile])

  // Check authentication status and user registration (FIXED - ONLY SETS INITIAL VIEW)
  useEffect(() => {
    if (!loading) {
      // Priority 1: If user is registered via custom auth, show app
      if (isRegistered && currentView !== 'app') {
        setCurrentView('app')
        console.log('🎯 User is registered, showing app')
      }
      // Priority 2: If Descope is authenticated but not registered, show registration
      else if (isAuthenticated && !isRegistered && currentView !== 'register') {
        setCurrentView('register')
        console.log('🎯 Descope authenticated but not registered, showing registration')
      }
      // Priority 3: ONLY set to landing on initial load, not on every state change
      else if (!isAuthenticated && !isRegistered && currentView === 'landing') {
        console.log('🎯 User not authenticated, staying on current view:', currentView)
      }
    }
  }, [isAuthenticated, loading, isRegistered]) // Don't include currentView to avoid loops

  // Auto-register authenticated users if they have profile data
  useEffect(() => {
    if (isAuthenticated && !isRegistered && (profile.name || profile.email)) {
      // User is authenticated and has profile data, mark as registered
      setIsRegistered(true)
      localStorage.setItem('isRegistered', 'true')
      console.log('✅ Auto-registered user with existing profile data')
    }
  }, [isAuthenticated, isRegistered, profile.name, profile.email])

  // Enhanced debug authentication state
  useEffect(() => {
    console.log('🔍 Main Page Auth State Debug:', {
      'Descope isAuthenticated': isAuthenticated,
      'Custom isRegistered': isRegistered,
      'Descope loading': loading,
      'Current view': currentView,
      'Profile has data': !!(profile.name || profile.email),
      'Profile email': profile.email,
      'Header will receive isAuthenticated': isRegistered
    })
  }, [isAuthenticated, isRegistered, loading, currentView, profile.name, profile.email])

  // Listen for custom sign-in requests from Header
  useEffect(() => {
    const handleSignInRequest = () => {
      console.log('📞 Received sign-in request from Header')
      handleSignIn()
    }

    window.addEventListener('requestSignIn', handleSignInRequest)
    return () => window.removeEventListener('requestSignIn', handleSignInRequest)
  }, [])

  const handleSignIn = async () => {
    console.log('🔵 LandingPage: Sign In button clicked!')
    // IMPROVED UX: Direct to sign-in form for existing users
    setUserType('existing')
    setCurrentView('signin')
  }

  const handleCreateNewAccount = () => {
    setUserType('new')
    setCurrentView('register')
  }

  const handleSignInToExisting = () => {
    setUserType('existing')
    setCurrentView('signin')
  }

  const handleSignInSubmit = async (email: string, password: string) => {
    console.log('🔐 Starting sign-in process with:', { email, password: '***' })
    
    try {
      // Call the signin API to authenticate and get user data
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const result = await response.json()
      console.log('🔐 Sign-in API response:', { success: result.success, hasUser: !!result.user })

      if (result.success && result.user) {
        // Load the authenticated user's profile data
        const userProfile = {
          name: result.user.name || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          location: result.user.location || '',
          summary: result.user.summary || '',
          skills: result.user.skills || [],
          education: result.user.education || [],
          experience: result.user.experience || [],
          projects: result.user.projects || []
        }
        
        console.log('🔐 Setting user profile:', userProfile)
        setProfile(userProfile)
        
        // Mark user as registered and navigate to app
        console.log('🔐 Setting isRegistered to true and navigating to app')
        setIsRegistered(true)
        
        // Save to localStorage for persistence
        localStorage.setItem('userProfile', JSON.stringify(result.user))
        localStorage.setItem('isRegistered', 'true')
        
        // Small delay to ensure state updates are processed
        setTimeout(() => {
          setCurrentView('app')
          console.log('✅ User signed in successfully - navigated to app')
        }, 100)
      } else {
        console.error('❌ Sign-in failed:', result.error)
        alert(`Sign-in failed: ${result.error || 'Invalid credentials'}`)
      }
    } catch (error) {
      console.error('❌ Sign-in error:', error)
      alert('Network error. Please check your connection and try again.')
    }
  }

  const handleBackToRegistration = () => {
    setCurrentView('auth-choice')
  }

  const handleSignOut = async () => {
    try {
      // Use Descope sign out
      await signOut()
      
      // Reset all local states and data
      setIsRegistered(false)
      setIsNewUser(false)
      setCurrentView('landing')
      setActiveTab('jobs') // Reset to default tab
      
      // Clear all saved data from both authentication systems
      localStorage.removeItem('userProfile')
      localStorage.removeItem('isRegistered')
      localStorage.removeItem('mockUser') // Clear Descope mock user as well
      
      // Reset profile to empty state
      setProfile({
        name: '',
        email: '',
        phone: '',
        location: '',
        summary: '',
        skills: [],
        education: [],
        experience: [],
        projects: []
      })
      
      console.log('✅ User signed out successfully - cleared all auth data')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleRegister = async (newProfile: UserProfileType) => {
    setProfile(newProfile)
    setIsRegistered(true)
    setIsNewUser(true) // Mark as new user
    setCurrentView('app')
    setActiveTab('profile') // Direct new users to profile tab
    
    // Save registration data to localStorage
    localStorage.setItem('userProfile', JSON.stringify(newProfile))
    localStorage.setItem('isRegistered', 'true')

    // Also save to database (this might have been done already in Registration component,
    // but ensure it's saved when profile is updated)
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProfile)
      })
      
      const result = await response.json()
      if (result.success) {
        console.log('✅ User profile synced to database')
      }
    } catch (error) {
      console.error('⚠️ Failed to sync user profile to database:', error)
    }
  }

  const handleShowRegister = () => {
    console.log('🟢 LandingPage: Get Started Free button clicked!')
    // IMPROVED UX: Direct to registration form for new users
    setUserType('new')
    setCurrentView('register')
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page for non-authenticated users
  console.log('🔍 Current view state:', { currentView, isAuthenticated, isRegistered, loading })
  
  if (currentView === 'landing') {
    return (
      <LandingPage
        onSignIn={handleSignIn}
        onRegister={handleShowRegister}
      />
    )
  }

  // Show authentication choice page
  if (currentView === 'auth-choice') {
    return (
      <AuthChoice
        onCreateAccount={handleCreateNewAccount}
        onSignIn={handleSignInToExisting}
        onBackToLanding={handleBackToLanding}
      />
    )
  }

  // Show registration form
  if (currentView === 'register') {
    return (
      <Registration
        onRegister={handleRegister}
        onBackToLanding={handleBackToLanding}
        onSignIn={handleSignInToExisting}
      />
    )
  }

  // Show sign-in form
  if (currentView === 'signin') {
    return (
      <SignIn
        onSignIn={handleSignInSubmit}
        onBackToRegistration={handleBackToRegistration}
        onBackToLanding={handleBackToLanding}
      />
    )
  }

  // Show main application for authenticated users
  const isProfileIncomplete = !profile.summary || profile.skills.length === 0 || profile.education.length === 0

  return (
    <div className="min-h-screen">
      <Header 
        profile={profile} 
        onSignOut={handleSignOut} 
        isAuthenticated={isRegistered}
      />
      
      {/* Welcome Banner for New Users */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎉</span>
                <div>
                  <h3 className="font-semibold">Welcome to AI Career Assistant, {profile.name}!</h3>
                  <p className="text-green-100 text-sm">Let's complete your profile to generate amazing AI-powered resumes</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewUser(false)}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Got it! ✨
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Completion Banner */}
      {!isNewUser && isProfileIncomplete && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold">Complete your profile to get better AI resumes!</h3>
                  <p className="text-blue-100 text-sm">Add your education, skills, and experience for personalized job matching</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('profile')}
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔍 Job Opportunities
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👤 My Profile
          </button>
          <button
            onClick={() => setActiveTab('study')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'study'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📚 Study Planner
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'integrations'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔗 Integrations
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' && (
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-400 text-xl">🤖</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>AI-Powered Resume Generation:</strong> Select any job below and click "Customize Resume with AI" to generate a tailored resume with real PDF download!
                  </p>
                </div>
              </div>
            </div>
            <JobBoard 
              profile={profile} 
              onJobAnalysis={setLastJobAnalysis}
            />
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400 text-xl">✏️</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Editable Profile:</strong> Click "Edit Profile" to modify your information. Your changes will be used for AI resume customization!
                  </p>
                </div>
              </div>
            </div>
            <UserProfile profile={profile} setProfile={setProfile} />
          </div>
        )}

        {activeTab === 'study' && (
          <div>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-purple-400 text-xl">🎓</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-purple-700">
                    <strong>AI Career Coach:</strong> Get personalized study plans, skill recommendations, and learning resources based on your career goals!
                    {!lastJobAnalysis && (
                      <span className="block mt-1 text-purple-600">
                        💡 Tip: Analyze a job in the Jobs tab first to get personalized recommendations!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <AdvancedStudyPlanner 
              profile={profile}
              skillGaps={lastJobAnalysis?.skillGaps || []}
              jobTitle={lastJobAnalysis?.jobTitle || 'Software Developer'}
              lastAnalysis={lastJobAnalysis?.analysis}
              onAnalysisUpdate={setLastJobAnalysis}
            />
          </div>
        )}

        {activeTab === 'integrations' && (
          <div>
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-indigo-400 text-xl">🔗</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-indigo-700">
                    <strong>Connect Your Tools:</strong> Import data from GitHub, LinkedIn, Coursera and more to enhance your profile automatically!
                  </p>
                </div>
              </div>
            </div>
            <IntegrationHub 
              profile={profile}
              onProfileUpdate={setProfile}
            />
          </div>
        )}
      </div>
    </div>
  )
}
