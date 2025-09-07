'use client'

import React from 'react'

interface AuthChoiceProps {
  onCreateAccount: () => void
  onSignIn: () => void
  onBackToLanding: () => void
}

export default function AuthChoice({ onCreateAccount, onSignIn, onBackToLanding }: AuthChoiceProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Career Assistant</h1>
          <p className="text-gray-600">Choose how you'd like to continue</p>
        </div>

        {/* Authentication Options */}
        <div className="space-y-4">
          {/* Create New Account */}
          <button
            onClick={onCreateAccount}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-3 group"
          >
            <span className="text-xl">🆕</span>
            <div className="text-left">
              <div className="font-semibold">Create New Account</div>
              <div className="text-blue-100 text-sm">I'm new to AI Career Assistant</div>
            </div>
            <span className="text-blue-200 group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Sign In to Existing Account */}
          <button
            onClick={onSignIn}
            className="w-full bg-gray-100 text-gray-900 py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-3 group"
          >
            <span className="text-xl">🔐</span>
            <div className="text-left">
              <div className="font-semibold">Sign In</div>
              <div className="text-gray-600 text-sm">I already have an account</div>
            </div>
            <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl">
          <h3 className="font-semibold text-gray-900 mb-2">✨ What you'll get:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>AI-powered resume customization for any job</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Real-time job matching from multiple boards</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Skill gap analysis and learning recommendations</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>PDF resume generation and download</span>
            </li>
          </ul>
        </div>

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={onBackToLanding}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
