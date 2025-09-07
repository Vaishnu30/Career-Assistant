// Input validation utilities
import crypto from 'crypto'

export class ValidationUtils {
  // Email validation
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    return emailRegex.test(email.trim().toLowerCase())
  }

  // Password validation
  static isValidPassword(password: string): { valid: boolean; message?: string } {
    if (!password || password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters long' }
    }
    if (password.length > 128) {
      return { valid: false, message: 'Password must be less than 128 characters' }
    }
    // Additional security: require at least one number or special character
    if (!/(?=.*[0-9!@#$%^&*])/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number or special character' }
    }
    return { valid: true }
  }

  // Hash password for storage using Node.js crypto
  static async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return `${salt}:${hash}`
  }

  // Verify password against hash using Node.js crypto
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const [salt, hash] = hashedPassword.split(':')
      const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
      return hash === verifyHash
    } catch (error) {
      return false
    }
  }

  // Name validation
  static isValidName(name: string): { valid: boolean; message?: string } {
    if (!name || name.trim().length < 2) {
      return { valid: false, message: 'Name must be at least 2 characters long' }
    }
    if (name.trim().length > 100) {
      return { valid: false, message: 'Name must be less than 100 characters' }
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return { valid: false, message: 'Name can only contain letters, spaces, hyphens, and apostrophes' }
    }
    return { valid: true }
  }

  // Phone validation (optional field)
  static isValidPhone(phone: string): { valid: boolean; message?: string } {
    if (!phone || phone.trim() === '') {
      return { valid: true } // Optional field
    }
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/
    if (!phoneRegex.test(phone.trim())) {
      return { valid: false, message: 'Please enter a valid phone number' }
    }
    return { valid: true }
  }

  // Sanitize input (remove potentially harmful characters)
  static sanitizeString(input: string): string {
    if (!input) return ''
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .substring(0, 1000) // Limit length
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>()
    
    return (identifier: string): boolean => {
      const now = Date.now()
      const windowStart = now - windowMs
      
      // Clean old entries
      requests.forEach((timestamps, key) => {
        const validTimestamps = timestamps.filter(time => time > windowStart)
        if (validTimestamps.length === 0) {
          requests.delete(key)
        } else {
          requests.set(key, validTimestamps)
        }
      })
      
      // Check current identifier
      const userRequests = requests.get(identifier) || []
      if (userRequests.length >= maxRequests) {
        return false // Rate limit exceeded
      }
      
      // Add current request
      userRequests.push(now)
      requests.set(identifier, userRequests)
      return true
    }
  }

  // Security headers helper
  static getSecurityHeaders() {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
}
