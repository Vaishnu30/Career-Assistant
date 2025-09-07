'use client'

import React, { useState } from 'react'
import { resumeTemplates, ResumeTemplate } from '@/lib/enhanced-pdf-generator'

interface TemplateSelectorProps {
  selectedTemplate: string
  onTemplateSelect: (templateId: string) => void
  onGenerate: () => void
  isGenerating?: boolean
}

export default function TemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  onGenerate, 
  isGenerating = false 
}: TemplateSelectorProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Choose Resume Template</h3>
          <p className="text-sm text-gray-600">Select a template that matches your target role</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {resumeTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={onTemplateSelect}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {resumeTemplates.map((template) => (
            <TemplateListItem
              key={template.id}
              template={template}
              isSelected={selectedTemplate === template.id}
              onSelect={onTemplateSelect}
            />
          ))}
        </div>
      )}

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="border-t pt-6">
          {(() => {
            const template = resumeTemplates.find(t => t.id === selectedTemplate)
            return template ? (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{template.preview}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: template.color }}
                    ></div>
                    Color Theme
                  </span>
                  <span className="capitalize">{template.style} Style</span>
                </div>
              </div>
            ) : null
          })()}

          {/* Generation Options */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-900 mb-2">✨ AI Optimization Features</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Skills prioritized based on job requirements</li>
              <li>• Experience highlighted for relevance</li>
              <li>• ATS-friendly formatting and keywords</li>
              <li>• Company-specific content adaptation</li>
            </ul>
          </div>

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
              isGenerating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
            } text-white`}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Your Resume...
              </div>
            ) : (
              '📄 Generate & Download Resume'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function TemplateCard({ 
  template, 
  isSelected, 
  onSelect 
}: { 
  template: ResumeTemplate
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <div
      onClick={() => onSelect(template.id)}
      className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="text-center mb-3">
        <div 
          className="w-16 h-20 mx-auto rounded border-2 flex items-center justify-center text-2xl"
          style={{ 
            borderColor: template.color,
            backgroundColor: isSelected ? template.color + '20' : '#f9fafb'
          }}
        >
          {template.preview}
        </div>
      </div>
      
      <h4 className="font-medium text-gray-900 text-sm mb-1">{template.name}</h4>
      <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
      
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="capitalize text-gray-500">{template.style}</span>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: template.color }}
        ></div>
      </div>
    </div>
  )
}

function TemplateListItem({ 
  template, 
  isSelected, 
  onSelect 
}: { 
  template: ResumeTemplate
  isSelected: boolean
  onSelect: (id: string) => void
}) {
  return (
    <div
      onClick={() => onSelect(template.id)}
      className={`cursor-pointer border rounded-lg p-4 transition-all hover:shadow-sm ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div 
          className="w-12 h-16 rounded border flex items-center justify-center text-xl flex-shrink-0"
          style={{ 
            borderColor: template.color,
            backgroundColor: isSelected ? template.color + '20' : '#f9fafb'
          }}
        >
          {template.preview}
        </div>
        
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center text-gray-500">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: template.color }}
              ></div>
              Color Theme
            </span>
            <span className="capitalize text-gray-500">{template.style} Style</span>
          </div>
        </div>

        {isSelected && (
          <div className="text-blue-600">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
