'use client'

import { useState, useEffect } from 'react'

// Descope Authentication Hook (mock implementation)
// In production, you would use the @descope/nextjs-sdk package
export function useDescope() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock authentication check
    const checkAuth = () => {
      const mockUser = localStorage.getItem('mockUser')
      if (mockUser) {
        setUser(JSON.parse(mockUser))
        setIsAuthenticated(true)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const signIn = async () => {
    try {
      setLoading(true)
      
      // Mock sign in process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockUserData = {
        id: 'user_123',
        email: 'john.doe@email.com',
        name: 'John Doe',
        loginTime: new Date().toISOString()
      }
      
      localStorage.setItem('mockUser', JSON.stringify(mockUserData))
      setUser(mockUserData)
      setIsAuthenticated(true)
      
      return { success: true }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'Failed to sign in' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      
      // Mock sign out process
      await new Promise(resolve => setTimeout(resolve, 500))
      
      localStorage.removeItem('mockUser')
      setUser(null)
      setIsAuthenticated(false)
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: 'Failed to sign out' }
    } finally {
      setLoading(false)
    }
  }

  return {
    isAuthenticated,
    user,
    loading,
    signIn,
    signOut
  }
}

// Enhanced Header component with real Descope integration
export default function EnhancedHeader() {
  const { isAuthenticated, user, loading, signIn, signOut } = useDescope()

  const handleSignIn = async () => {
    const result = await signIn()
    if (result.success) {
      alert('🎉 Successfully signed in with Descope!')
    } else {
      alert('❌ Sign in failed: ' + result.error)
    }
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      alert('👋 Signed out successfully!')
    }
  }

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Career Assistant</h1>
                <p className="text-sm text-gray-600">Smart Resume Builder for Students</p>
              </div>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Career Assistant</h1>
              <p className="text-sm text-gray-600">Smart Resume Builder for Students</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Global MCP Hackathon</span>
            </div>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>🔐</span>
                <span>Sign In with Descope</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
