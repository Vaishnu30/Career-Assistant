'use client'

import { useState } from 'react'

interface LandingPageProps {
  onSignIn: () => void
  onRegister: () => void
}

export default function LandingPage({ onSignIn, onRegister }: LandingPageProps) {
  const [showFeatures, setShowFeatures] = useState(false)
  console.log('🎨 LandingPage render - showFeatures:', showFeatures)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
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
              <button
                onClick={onSignIn}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onRegister}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Build Your Perfect Resume with
            <span className="text-blue-600"> AI Power</span>
          </h1>
          
          {/* MCP Hackathon Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
              🏆 Global MCP Hackathon • Theme 1: Purposeful AI Agent
            </div>
          </div>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Transform your career journey with our intelligent resume builder powered by 
            <strong> Descope Outbound Apps</strong>. Get personalized resumes for every job application, 
            discover skill gaps with GitHub integration, schedule interviews via Google Calendar, 
            and receive AI-powered career guidance through Slack notifications.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onRegister}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              🚀 Start Building Your Resume
            </button>
            <button
              onClick={() => {
                console.log('🔍 SEE HOW IT WORKS button clicked! Current showFeatures:', showFeatures)
                setShowFeatures(!showFeatures)
              }}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              {showFeatures ? '❌ Hide Features' : '📋 See How It Works'}
            </button>
          </div>

          {/* Demo Preview */}
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-lg mb-6">
              <h3 className="text-2xl font-bold mb-2">🤖 MCP Hackathon Compliant AI Agent</h3>
              <p className="text-blue-100">Secure external integrations via Descope Outbound Apps</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 border rounded-lg">
                <div className="text-3xl mb-3">�</div>
                <h4 className="font-semibold text-gray-900 mb-2">GitHub Portfolio Analysis</h4>
                <p className="text-gray-600 text-sm">AI analyzes your repositories to identify skills and suggest improvements</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-3xl mb-3">📅</div>
                <h4 className="font-semibold text-gray-900 mb-2">Smart Interview Scheduling</h4>
                <p className="text-gray-600 text-sm">Automatic Google Calendar integration for seamless interview management</p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-3xl mb-3">�</div>
                <h4 className="font-semibold text-gray-900 mb-2">Career Notifications</h4>
                <p className="text-gray-600 text-sm">Real-time Slack alerts for job matches and career opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {showFeatures && (
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AI Career Assistant?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Built specifically for students and early-career professionals who want to stand out in today's competitive job market.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg bg-blue-50 border border-blue-100">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🎓</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Student-Focused</h3>
                <p className="text-gray-600">
                  Designed for students and new graduates. Highlight your projects, coursework, and potential.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-green-50 border border-green-100">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600">
                  Generate customized resumes in seconds. No more spending hours tweaking layouts.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-purple-50 border border-purple-100">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🧠</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Get intelligent recommendations on skills to learn and experiences to highlight.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-yellow-50 border border-yellow-100">
                <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy to Use</h3>
                <p className="text-gray-600">
                  Intuitive interface that makes resume building enjoyable, not stressful.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-red-50 border border-red-100">
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
                <p className="text-gray-600">
                  Your data is protected with enterprise-grade security. Own your information.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-indigo-50 border border-indigo-100">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Results Driven</h3>
                <p className="text-gray-600">
                  Increase your interview chances with resumes tailored to each job opportunity.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Career?</h2>
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of students who have successfully landed their dream jobs with AI-powered resumes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRegister}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🎉 Create Free Account
            </button>
            <button
              onClick={onSignIn}
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <span className="text-xl font-bold text-white">Career Assistant</span>
          </div>
          <p className="text-gray-400 mb-4">
            Built for the Global MCP Hackathon • Empowering students worldwide
          </p>
          <div className="text-sm text-gray-500">
            © 2025 AI Career Assistant. Made with ❤️ for students everywhere.
          </div>
        </div>
      </footer>
    </div>
  )
}
