'use client'

import React from 'react'
import { UserProfile } from '@/types'

interface StudyPlannerProps {
  profile: UserProfile
  skillGaps?: string[]
  jobTitle?: string
  lastAnalysis?: string
  onAnalysisUpdate?: (analysis: any) => void
}

export default function StudyPlannerTest({ profile, skillGaps = [], jobTitle, lastAnalysis, onAnalysisUpdate }: StudyPlannerProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎓 AI Study Planner</h2>
      <p>Study Planner Test Component - Basic version working!</p>
      <p>Profile name: {profile?.name || 'No name'}</p>
      <p>Skill gaps: {skillGaps.join(', ') || 'None'}</p>
    </div>
  )
}
