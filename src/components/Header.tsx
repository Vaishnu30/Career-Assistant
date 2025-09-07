'use client'

import { useState, useEffect } from 'react'
import { useDescope } from './DescopeAuth'
import { UserProfile } from '@/types'

interface HeaderProps {
  profile?: UserProfile
  onSignOut?: () => void
  isAuthenticated?: boolean  // Add this prop for custom authentication
}

export default function Header({ profile, onSignOut, isAuthenticated: customAuth }: HeaderProps) {
  const { isAuthenticated: descopeAuth, user, loading, signIn, signOut } = useDescope()

  // Use ONLY custom authentication if it's provided
  // This prevents conflicts between the two auth systems
  const isSignedIn = customAuth !== undefined ? customAuth : descopeAuth
  const effectiveUser = customAuth !== undefined ? null : user // Don't use Descope user data when custom auth is active

  // Debug authentication states
  useEffect(() => {
    console.log('🔍 Header Auth State:', {
      customAuthProvided: customAuth !== undefined,
      customAuth: customAuth,
      descopeAuth: descopeAuth,
      finalIsSignedIn: isSignedIn,
      profileName: profile?.name,
      descopeUserName: user?.name,
      usingCustomAuth: customAuth !== undefined,
      timestamp: new Date().toISOString()
    })
  }, [customAuth, descopeAuth, isSignedIn, profile?.name, user?.name])

  // Log when props change
  useEffect(() => {
    console.log('🔄 Header props changed:', {
      'profile.name': profile?.name,
      'profile.email': profile?.email,
      'isAuthenticated prop': customAuth,
      'hasOnSignOut': !!onSignOut
    })
  }, [profile?.name, profile?.email, customAuth, onSignOut])

  const handleSignIn = async () => {
    try {
      // If custom auth is being used, redirect to parent's sign-in flow
      if (customAuth !== undefined && onSignOut) {
        console.log('🔄 Using custom sign-in flow')
        window.dispatchEvent(new CustomEvent('requestSignIn'))
      } else {
        // Use Descope authentication
        console.log('🔄 Using Descope sign-in')
        await signIn()
      }
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      // If using custom auth, call the parent's sign-out handler
      if (customAuth !== undefined && onSignOut) {
        console.log('🔄 Using custom sign-out flow')
        onSignOut()
      } else {
        // Use Descope sign-out
        console.log('🔄 Using Descope sign-out')
        await signOut()
        // Call the parent's sign out handler to redirect to landing page
        if (onSignOut) {
          onSignOut()
        }
      }
    } catch (error) {
      console.error('Sign out failed:', error)
    }
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
            
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Loading...</span>
              </div>
            ) : isSignedIn ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {profile?.name || effectiveUser?.name || 'User'}!
                </span>
                <button 
                  onClick={handleSignOut}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
