// Enhanced reset token storage with MongoDB persistence
// Handles both in-memory caching and database persistence for development stability

import connectDB from './mongodb'
import mongoose from 'mongoose'

interface ResetTokenData {
  email: string
  expires: number
  createdAt: number
}

// MongoDB schema for reset tokens
const resetTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  expires: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
})

// Create model if it doesn't exist
const ResetToken = mongoose.models.ResetToken || mongoose.model('ResetToken', resetTokenSchema)

class ResetTokenManager {
  private static tokens = new Map<string, ResetTokenData>()

  static async storeToken(token: string, email: string, expiresInMs: number = 15 * 60 * 1000): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInMs)
    const tokenData: ResetTokenData = {
      email: email.toLowerCase(),
      expires: expiresAt.getTime(),
      createdAt: Date.now()
    }
    
    // Store in memory for quick access
    this.tokens.set(token, tokenData)
    
    try {
      // Store in database for persistence across server restarts
      await connectDB()
      
      // Remove any existing tokens for this email
      await ResetToken.deleteMany({ email: tokenData.email })
      
      // Store new token
      await ResetToken.create({
        token,
        email: tokenData.email,
        expires: expiresAt,
        createdAt: new Date()
      })
      
      console.log(`🔐 Reset token stored for ${email}, expires at ${expiresAt.toISOString()}`)
    } catch (error) {
      console.error('❌ Failed to store token in database:', error)
      // Still works with in-memory storage as fallback
    }
  }

  static async verifyToken(token: string): Promise<{ valid: boolean; email?: string }> {
    // First check in-memory cache
    let tokenData = this.tokens.get(token)
    
    // If not in memory, check database
    if (!tokenData) {
      try {
        await connectDB()
        
        const dbToken = await ResetToken.findOne({ token })
        
        if (dbToken) {
          tokenData = {
            email: dbToken.email,
            expires: dbToken.expires.getTime(),
            createdAt: dbToken.createdAt.getTime()
          }
          
          // Cache in memory for future quick access
          this.tokens.set(token, tokenData)
          console.log(`🔄 Token recovered from database for ${tokenData.email}`)
        }
      } catch (error) {
        console.error('❌ Failed to check token in database:', error)
      }
    }
    
    if (!tokenData) {
      console.log(`❌ Reset token not found: ${token}`)
      return { valid: false }
    }
    
    if (Date.now() > tokenData.expires) {
      console.log(`⏰ Reset token expired for ${tokenData.email}`)
      await this.invalidateToken(token)
      return { valid: false }
    }
    
    console.log(`✅ Reset token valid for ${tokenData.email}`)
    return { valid: true, email: tokenData.email }
  }

  static async invalidateToken(token: string): Promise<void> {
    const tokenData = this.tokens.get(token)
    if (tokenData) {
      console.log(`🗑️ Invalidating reset token for ${tokenData.email}`)
    }
    
    // Remove from memory
    this.tokens.delete(token)
    
    try {
      // Remove from database
      await connectDB()
      await ResetToken.deleteOne({ token })
    } catch (error) {
      console.error('❌ Failed to invalidate token in database:', error)
    }
  }

  static async cleanupExpiredTokens(): Promise<number> {
    const now = Date.now()
    let cleaned = 0
    
    // Clean memory cache
    this.tokens.forEach((data, token) => {
      if (now > data.expires) {
        this.tokens.delete(token)
        cleaned++
      }
    })
    
    try {
      // Clean database
      await connectDB()
      const result = await ResetToken.deleteMany({ expires: { $lt: new Date() } })
      cleaned += result.deletedCount || 0
    } catch (error) {
      console.error('❌ Failed to cleanup tokens in database:', error)
    }
    
    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired reset tokens`)
    }
    
    return cleaned
  }

  static getTokenCount(): number {
    return this.tokens.size
  }

  static async getAllTokens(): Promise<Array<{ token: string; email: string; expires: Date; createdAt: Date }>> {
    const result: Array<{ token: string; email: string; expires: Date; createdAt: Date }> = []
    
    // Add memory tokens
    this.tokens.forEach((data, token) => {
      result.push({
        token: token.substring(0, 8) + '...', // Only show first 8 chars for security
        email: data.email,
        expires: new Date(data.expires),
        createdAt: new Date(data.createdAt)
      })
    })
    
    try {
      // Add database tokens not in memory
      await connectDB()
      const dbTokens = await ResetToken.find({})
      
      for (const dbToken of dbTokens) {
        if (!this.tokens.has(dbToken.token)) {
          result.push({
            token: dbToken.token.substring(0, 8) + '...', // Only show first 8 chars for security
            email: dbToken.email,
            expires: dbToken.expires,
            createdAt: dbToken.createdAt
          })
        }
      }
    } catch (error) {
      console.error('❌ Failed to get tokens from database:', error)
    }
    
    return result
  }
}

export default ResetTokenManager
