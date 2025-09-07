// Database initialization script for production deployment
// Run this script to create the required MongoDB collections and indexes

import { MongoClient } from 'mongodb'

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/ai-career-assistant'
const DATABASE_NAME = 'ai-career-assistant'

async function initializeDatabase() {
  const client = new MongoClient(DATABASE_URL)
  
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    
    const db = client.db(DATABASE_NAME)
    
    // Create collections
    const collections = [
      'users',
      'learning_progress',
      'skill_assessments',
      'study_sessions',
      'learning_milestones',
      'assessment_sessions',
      'learning_resources',
      'user_achievements'
    ]
    
    for (const collectionName of collections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext()
      if (!exists) {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      }
    }
    
    // Create indexes for performance
    
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('users').createIndex({ descopeUserId: 1 }, { unique: true })
    
    // Learning progress indexes
    await db.collection('learning_progress').createIndex({ userId: 1, skillName: 1 }, { unique: true })
    await db.collection('learning_progress').createIndex({ userId: 1 })
    await db.collection('learning_progress').createIndex({ skillName: 1 })
    await db.collection('learning_progress').createIndex({ lastUpdated: -1 })
    
    // Study sessions indexes
    await db.collection('study_sessions').createIndex({ userId: 1 })
    await db.collection('study_sessions').createIndex({ skill: 1 })
    await db.collection('study_sessions').createIndex({ startTime: -1 })
    await db.collection('study_sessions').createIndex({ userId: 1, startTime: -1 })
    
    // Skill assessments indexes
    await db.collection('skill_assessments').createIndex({ userId: 1 })
    await db.collection('skill_assessments').createIndex({ skill: 1 })
    await db.collection('skill_assessments').createIndex({ createdAt: -1 })
    await db.collection('skill_assessments').createIndex({ userId: 1, skill: 1, createdAt: -1 })
    
    // Assessment sessions indexes
    await db.collection('assessment_sessions').createIndex({ userId: 1 })
    await db.collection('assessment_sessions').createIndex({ status: 1 })
    await db.collection('assessment_sessions').createIndex({ createdAt: -1 })
    
    // Learning milestones indexes
    await db.collection('learning_milestones').createIndex({ userId: 1 })
    await db.collection('learning_milestones').createIndex({ skillName: 1 })
    await db.collection('learning_milestones').createIndex({ completed: 1 })
    await db.collection('learning_milestones').createIndex({ targetDate: 1 })
    
    // Learning resources indexes
    await db.collection('learning_resources').createIndex({ skill: 1 })
    await db.collection('learning_resources').createIndex({ type: 1 })
    await db.collection('learning_resources').createIndex({ difficulty: 1 })
    
    // User achievements indexes
    await db.collection('user_achievements').createIndex({ userId: 1 })
    await db.collection('user_achievements').createIndex({ type: 1 })
    await db.collection('user_achievements').createIndex({ earnedAt: -1 })
    
    console.log('All indexes created successfully')
    
    // Insert sample learning resources
    const sampleResources = [
      {
        title: 'React Official Documentation',
        url: 'https://react.dev',
        skill: 'react',
        type: 'documentation',
        difficulty: 'beginner',
        description: 'Official React documentation with tutorials and API reference',
        estimatedHours: 10,
        tags: ['react', 'frontend', 'javascript'],
        createdAt: new Date()
      },
      {
        title: 'JavaScript: The Definitive Guide',
        url: 'https://www.oreilly.com/library/view/javascript-the-definitive/9781491952016/',
        skill: 'javascript',
        type: 'book',
        difficulty: 'intermediate',
        description: 'Comprehensive guide to JavaScript programming',
        estimatedHours: 40,
        tags: ['javascript', 'programming', 'fundamentals'],
        createdAt: new Date()
      },
      {
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs/',
        skill: 'typescript',
        type: 'documentation',
        difficulty: 'intermediate',
        description: 'Official TypeScript documentation and tutorials',
        estimatedHours: 15,
        tags: ['typescript', 'javascript', 'types'],
        createdAt: new Date()
      },
      {
        title: 'CSS Grid Garden',
        url: 'https://cssgridgarden.com/',
        skill: 'css',
        type: 'interactive',
        difficulty: 'beginner',
        description: 'Interactive game for learning CSS Grid',
        estimatedHours: 2,
        tags: ['css', 'grid', 'layout'],
        createdAt: new Date()
      },
      {
        title: 'Node.js Best Practices',
        url: 'https://github.com/goldbergyoni/nodebestpractices',
        skill: 'nodejs',
        type: 'guide',
        difficulty: 'intermediate',
        description: 'Collection of Node.js best practices and patterns',
        estimatedHours: 8,
        tags: ['nodejs', 'backend', 'best-practices'],
        createdAt: new Date()
      }
    ]
    
    const resourcesExists = await db.collection('learning_resources').countDocuments()
    if (resourcesExists === 0) {
      await db.collection('learning_resources').insertMany(sampleResources)
      console.log('Inserted sample learning resources')
    }
    
    // Insert sample achievement types
    const sampleAchievements = [
      {
        type: 'first_session',
        title: 'Getting Started',
        description: 'Completed your first study session',
        icon: '🚀',
        points: 10
      },
      {
        type: 'streak_7',
        title: 'Week Warrior',
        description: 'Maintained a 7-day study streak',
        icon: '🔥',
        points: 50
      },
      {
        type: 'streak_30',
        title: 'Monthly Master',
        description: 'Maintained a 30-day study streak',
        icon: '💎',
        points: 200
      },
      {
        type: 'hours_10',
        title: 'Dedicated Learner',
        description: 'Completed 10 hours of study',
        icon: '📚',
        points: 25
      },
      {
        type: 'hours_50',
        title: 'Study Champion',
        description: 'Completed 50 hours of study',
        icon: '🏆',
        points: 100
      },
      {
        type: 'skill_mastery',
        title: 'Skill Master',
        description: 'Achieved 90% proficiency in a skill',
        icon: '⭐',
        points: 150
      },
      {
        type: 'assessment_perfect',
        title: 'Perfect Score',
        description: 'Scored 100% on a skill assessment',
        icon: '🎯',
        points: 75
      }
    ]
    
    const achievementTypesExists = await db.collection('achievement_types').countDocuments()
    if (achievementTypesExists === 0) {
      await db.collection('achievement_types').insertMany(sampleAchievements)
      console.log('Inserted achievement types')
    }
    
    console.log('Database initialization completed successfully!')
    
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  } finally {
    await client.close()
  }
}

// Export for use in deployment scripts
export { initializeDatabase }

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}
