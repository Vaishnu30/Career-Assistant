// Adaptive Learning Path Generator
// Creates personalized, intelligent learning sequences based on skill assessments

import { SkillAssessment } from './skill-assessor'

export interface LearningStep {
  id: string
  title: string
  description: string
  type: 'tutorial' | 'project' | 'quiz' | 'reading' | 'video' | 'practice'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedTime: string
  prerequisites: string[]
  resources: LearningResource[]
  completionCriteria: string
  nextSteps: string[]
  skillsGained: string[]
}

export interface LearningResource {
  title: string
  url: string
  type: 'video' | 'article' | 'course' | 'documentation' | 'interactive'
  duration?: string
  rating?: number
  free: boolean
  description: string
}

export interface LearningPath {
  id: string
  title: string
  description: string
  targetSkill: string
  currentLevel: string
  targetLevel: string
  totalEstimatedTime: string
  steps: LearningStep[]
  milestones: Milestone[]
  adaptiveElements: AdaptiveElement[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  stepIds: string[]
  completionReward: string
  assessmentRequired: boolean
}

export interface AdaptiveElement {
  trigger: 'struggling' | 'excelling' | 'bored' | 'confused'
  condition: string
  action: 'provide_extra_help' | 'skip_ahead' | 'change_approach' | 'add_challenge'
  description: string
}

export class LearningPathGenerator {
  // Comprehensive learning resources database
  private static readonly learningResources: { [skill: string]: { [level: string]: LearningResource[] } } = {
    react: {
      beginner: [
        {
          title: 'React Official Tutorial - Tutorial: Intro to React',
          url: 'https://reactjs.org/tutorial/tutorial.html',
          type: 'interactive',
          duration: '2-3 hours',
          rating: 4.8,
          free: true,
          description: 'Official hands-on tutorial building a tic-tac-toe game'
        },
        {
          title: 'React Crash Course For Beginners 2024',
          url: 'https://www.youtube.com/watch?v=w7ejDZ8SWv8',
          type: 'video',
          duration: '1.5 hours',
          rating: 4.7,
          free: true,
          description: 'Complete beginner-friendly crash course by Traversy Media'
        },
        {
          title: 'freeCodeCamp React Course',
          url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/',
          type: 'course',
          duration: '10 hours',
          rating: 4.9,
          free: true,
          description: 'Comprehensive free course with hands-on projects'
        }
      ],
      intermediate: [
        {
          title: 'React Hooks Complete Guide',
          url: 'https://www.udemy.com/course/react-hooks/',
          type: 'course',
          duration: '8 hours',
          rating: 4.6,
          free: false,
          description: 'Deep dive into React Hooks with practical examples'
        },
        {
          title: 'React Router Tutorial',
          url: 'https://reactrouter.com/en/main/start/tutorial',
          type: 'interactive',
          duration: '3 hours',
          rating: 4.5,
          free: true,
          description: 'Official React Router tutorial with step-by-step guidance'
        }
      ],
      advanced: [
        {
          title: 'React Performance Optimization',
          url: 'https://kentcdodds.com/blog/fix-the-slow-render-before-you-fix-the-re-render',
          type: 'article',
          duration: '45 minutes',
          rating: 4.9,
          free: true,
          description: 'Advanced performance optimization techniques by Kent C. Dodds'
        }
      ]
    },
    javascript: {
      beginner: [
        {
          title: 'JavaScript Basics - MDN Web Docs',
          url: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics',
          type: 'documentation',
          duration: '2 hours',
          rating: 4.8,
          free: true,
          description: 'Comprehensive introduction to JavaScript fundamentals'
        },
        {
          title: 'JavaScript Tutorial for Beginners',
          url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
          type: 'video',
          duration: '3 hours',
          rating: 4.7,
          free: true,
          description: 'Complete JavaScript course for absolute beginners'
        }
      ],
      intermediate: [
        {
          title: 'You Don\'t Know JS (book series)',
          url: 'https://github.com/getify/You-Dont-Know-JS',
          type: 'article',
          duration: '20 hours',
          rating: 4.9,
          free: true,
          description: 'Deep dive into JavaScript concepts and mechanisms'
        }
      ],
      advanced: [
        {
          title: 'JavaScript Design Patterns',
          url: 'https://addyosmani.com/resources/essentialjsdesignpatterns/book/',
          type: 'article',
          duration: '8 hours',
          rating: 4.8,
          free: true,
          description: 'Essential JavaScript design patterns for experienced developers'
        }
      ]
    }
  }

  // Generate adaptive learning path based on assessment
  static async generateLearningPath(
    assessment: SkillAssessment,
    targetLevel: 'intermediate' | 'advanced' = 'intermediate',
    timeConstraint?: '2weeks' | '1month' | '3months' | 'flexible'
  ): Promise<LearningPath> {
    const skill = assessment.skill.toLowerCase()
    const currentLevel = assessment.level
    
    // Determine learning steps based on current and target level
    const steps = await this.createLearningSteps(skill, currentLevel, targetLevel, assessment)
    const milestones = this.createMilestones(steps)
    const adaptiveElements = this.createAdaptiveElements(assessment)
    
    const totalTime = this.calculateTotalTime(steps, timeConstraint)

    return {
      id: `${skill}-${currentLevel}-to-${targetLevel}-${Date.now()}`,
      title: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Learning Path`,
      description: `Personalized learning path from ${currentLevel} to ${targetLevel} level`,
      targetSkill: skill,
      currentLevel,
      targetLevel,
      totalEstimatedTime: totalTime,
      steps,
      milestones,
      adaptiveElements
    }
  }

  private static async createLearningSteps(
    skill: string,
    currentLevel: string,
    targetLevel: string,
    assessment: SkillAssessment
  ): Promise<LearningStep[]> {
    const steps: LearningStep[] = []
    const resources = this.learningResources[skill] || {}

    // Start with fundamentals if beginner
    if (currentLevel === 'beginner') {
      steps.push({
        id: `${skill}-fundamentals`,
        title: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Fundamentals`,
        description: 'Master the core concepts and syntax',
        type: 'tutorial',
        difficulty: 'easy',
        estimatedTime: '1-2 weeks',
        prerequisites: [],
        resources: resources.beginner || [],
        completionCriteria: 'Complete all tutorials and pass quiz with 80% score',
        nextSteps: [`${skill}-practice-projects`],
        skillsGained: ['Basic syntax', 'Core concepts', 'Problem-solving basics']
      })

      steps.push({
        id: `${skill}-practice-projects`,
        title: 'Hands-on Practice Projects',
        description: 'Build real projects to solidify understanding',
        type: 'project',
        difficulty: 'medium',
        estimatedTime: '2-3 weeks',
        prerequisites: [`${skill}-fundamentals`],
        resources: this.getProjectResources(skill, 'beginner'),
        completionCriteria: 'Complete 3 guided projects and 1 independent project',
        nextSteps: [`${skill}-intermediate-concepts`],
        skillsGained: ['Practical application', 'Project structure', 'Best practices']
      })
    }

    // Intermediate concepts
    if (targetLevel === 'intermediate' || targetLevel === 'advanced') {
      steps.push({
        id: `${skill}-intermediate-concepts`,
        title: 'Intermediate Concepts & Patterns',
        description: 'Learn advanced features and common patterns',
        type: 'tutorial',
        difficulty: 'medium',
        estimatedTime: '2-3 weeks',
        prerequisites: currentLevel === 'beginner' ? [`${skill}-practice-projects`] : [],
        resources: resources.intermediate || [],
        completionCriteria: 'Master key intermediate concepts and patterns',
        nextSteps: [`${skill}-real-world-project`],
        skillsGained: ['Advanced patterns', 'Performance optimization', 'Code organization']
      })

      steps.push({
        id: `${skill}-real-world-project`,
        title: 'Real-World Application Project',
        description: 'Build a comprehensive application using best practices',
        type: 'project',
        difficulty: 'hard',
        estimatedTime: '3-4 weeks',
        prerequisites: [`${skill}-intermediate-concepts`],
        resources: this.getProjectResources(skill, 'intermediate'),
        completionCriteria: 'Build and deploy a full-featured application',
        nextSteps: targetLevel === 'advanced' ? [`${skill}-advanced-topics`] : [],
        skillsGained: ['Full-stack development', 'Deployment', 'Testing', 'Code review']
      })
    }

    // Advanced topics
    if (targetLevel === 'advanced') {
      steps.push({
        id: `${skill}-advanced-topics`,
        title: 'Advanced Topics & Architecture',
        description: 'Master complex patterns and system design',
        type: 'tutorial',
        difficulty: 'hard',
        estimatedTime: '4-6 weeks',
        prerequisites: [`${skill}-real-world-project`],
        resources: resources.advanced || [],
        completionCriteria: 'Demonstrate mastery of advanced concepts',
        nextSteps: [`${skill}-contribution`],
        skillsGained: ['System design', 'Performance tuning', 'Advanced debugging']
      })

      steps.push({
        id: `${skill}-contribution`,
        title: 'Open Source Contribution',
        description: 'Contribute to open source projects to demonstrate expertise',
        type: 'practice',
        difficulty: 'hard',
        estimatedTime: '4-8 weeks',
        prerequisites: [`${skill}-advanced-topics`],
        resources: this.getContributionResources(skill),
        completionCriteria: 'Make meaningful contributions to 2+ open source projects',
        nextSteps: [],
        skillsGained: ['Code review', 'Collaboration', 'Industry best practices']
      })
    }

    return steps
  }

  private static createMilestones(steps: LearningStep[]): Milestone[] {
    const milestones: Milestone[] = []
    let currentStepIds: string[] = []

    steps.forEach((step, index) => {
      currentStepIds.push(step.id)
      
      // Create milestone every 2-3 steps or at major transitions
      if ((index + 1) % 2 === 0 || index === steps.length - 1) {
        milestones.push({
          id: `milestone-${milestones.length + 1}`,
          title: `Milestone ${milestones.length + 1}: ${step.title}`,
          description: `Complete ${currentStepIds.length} learning steps`,
          stepIds: [...currentStepIds],
          completionReward: this.getRewardForMilestone(milestones.length + 1),
          assessmentRequired: true
        })
        currentStepIds = []
      }
    })

    return milestones
  }

  private static createAdaptiveElements(assessment: SkillAssessment): AdaptiveElement[] {
    return [
      {
        trigger: 'struggling',
        condition: 'User fails quiz twice or takes 150% of estimated time',
        action: 'provide_extra_help',
        description: 'Provide additional resources and break down complex concepts'
      },
      {
        trigger: 'excelling',
        condition: 'User completes tasks in 70% of estimated time with high accuracy',
        action: 'add_challenge',
        description: 'Offer bonus challenges and advanced topics'
      },
      {
        trigger: 'bored',
        condition: 'User shows low engagement or skips optional content',
        action: 'change_approach',
        description: 'Switch to more interactive or project-based learning'
      },
      {
        trigger: 'confused',
        condition: 'User asks many clarification questions or gets stuck frequently',
        action: 'provide_extra_help',
        description: 'Provide simplified explanations and additional examples'
      }
    ]
  }

  private static getProjectResources(skill: string, level: string): LearningResource[] {
    const projectIdeas: { [key: string]: { [key: string]: LearningResource[] } } = {
      react: {
        beginner: [
          {
            title: 'Build a Todo App',
            url: 'https://github.com/topics/todo-app-react',
            type: 'interactive' as const,
            duration: '4-6 hours',
            rating: 4.5,
            free: true,
            description: 'Classic beginner project to learn state management'
          }
        ],
        intermediate: [
          {
            title: 'E-commerce Site with React',
            url: 'https://github.com/topics/ecommerce-react',
            type: 'interactive' as const,
            duration: '20-30 hours',
            rating: 4.7,
            free: true,
            description: 'Full-featured e-commerce application'
          }
        ]
      },
      javascript: {
        beginner: [
          {
            title: 'JavaScript30 Challenge',
            url: 'https://javascript30.com/',
            type: 'interactive' as const,
            duration: '30 days',
            rating: 4.8,
            free: true,
            description: '30 vanilla JavaScript projects in 30 days'
          }
        ]
      }
    }

    return projectIdeas[skill]?.[level] || []
  }

  private static getContributionResources(skill: string): LearningResource[] {
    return [
      {
        title: 'First Contributions Guide',
        url: 'https://github.com/firstcontributions/first-contributions',
        type: 'interactive',
        duration: '2 hours',
        rating: 4.9,
        free: true,
        description: 'Step-by-step guide to making your first open source contribution'
      },
      {
        title: 'Good First Issues',
        url: `https://github.com/topics/${skill}?q=label%3A%22good+first+issue%22`,
        type: 'interactive',
        duration: 'Ongoing',
        rating: 4.6,
        free: true,
        description: 'Beginner-friendly issues in open source projects'
      }
    ]
  }

  private static calculateTotalTime(steps: LearningStep[], timeConstraint?: string): string {
    // Calculate based on step estimates and constraints
    const totalWeeks = steps.reduce((total, step) => {
      const weeks = step.estimatedTime.includes('week') 
        ? parseInt(step.estimatedTime.split('-')[0]) 
        : 1
      return total + weeks
    }, 0)

    if (timeConstraint === '2weeks' && totalWeeks > 2) {
      return '2 weeks (intensive)'
    } else if (timeConstraint === '1month' && totalWeeks > 4) {
      return '1 month (intensive)'
    }

    return `${totalWeeks}-${totalWeeks + 2} weeks`
  }

  private static getRewardForMilestone(milestoneNumber: number): string {
    const rewards = [
      '🎯 Foundation Builder Badge',
      '⚡ Rapid Learner Badge',
      '🏗️ Project Master Badge',
      '🚀 Advanced Developer Badge',
      '👑 Expert Contributor Badge'
    ]
    return rewards[milestoneNumber - 1] || '🌟 Achievement Unlocked'
  }
}

export default LearningPathGenerator
