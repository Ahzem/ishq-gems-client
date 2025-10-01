import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price to display with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price)
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

/**
 * Truncates text to a specified length
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}

/**
 * Capitalizes the first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Generates a slug from a string
 */
export function createSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Extracts primary color from gem color description
 */
export function extractPrimaryColor(colorDescription: string): string {
  const colorMap: Record<string, string> = {
    'blue': 'Blue',
    'red': 'Red', 
    'green': 'Green',
    'yellow': 'Yellow',
    'pink': 'Pink',
    'purple': 'Purple',
    'violet': 'Purple',
    'orange': 'Orange',
    'white': 'White',
    'black': 'Black',
    'peach': 'Pink'
  }
  
  const description = colorDescription.toLowerCase()
  
  for (const [key, value] of Object.entries(colorMap)) {
    if (description.includes(key)) {
      return value
    }
  }
  
  return 'Other'
}

/**
 * Normalizes shape/cut names for consistent filtering
 */
export function normalizeShape(shape: string): string {
  const shapeMap: Record<string, string> = {
    'round': 'Round',
    'oval': 'Oval',
    'cushion': 'Cushion',
    'emerald': 'Emerald',
    'princess': 'Princess',
    'asscher': 'Asscher',
    'marquise': 'Marquise',
    'pear': 'Pear',
    'heart': 'Heart',
    'radiant': 'Radiant'
  }
  
  return shapeMap[shape.toLowerCase()] || shape
}

/**
 * Checks if color matches filter selection
 */
export function matchesColorFilter(gemColor: string, selectedColors: string[]): boolean {
  if (selectedColors.length === 0) return true
  
  const primaryColor = extractPrimaryColor(gemColor)
  return selectedColors.includes(primaryColor)
}

/**
 * Checks if shape matches filter selection
 */
export function matchesShapeFilter(gemShape: string, selectedShapes: string[]): boolean {
  if (selectedShapes.length === 0) return true
  
  const normalizedShape = normalizeShape(gemShape)
  return selectedShapes.includes(normalizedShape)
}

/**
 * Gets color statistics from gem data
 */
export function getColorStats(gems: { color: string }[]): Record<string, number> {
  const colorCounts: Record<string, number> = {}
  
  gems.forEach(gem => {
    const primaryColor = extractPrimaryColor(gem.color)
    colorCounts[primaryColor] = (colorCounts[primaryColor] || 0) + 1
  })
  
  return colorCounts
}

/**
 * Gets shape statistics from gem data
 */
export function getShapeStats(gems: { cut: string }[]): Record<string, number> {
  const shapeCounts: Record<string, number> = {}
  
  gems.forEach(gem => {
    const normalizedShape = normalizeShape(gem.cut)
    shapeCounts[normalizedShape] = (shapeCounts[normalizedShape] || 0) + 1
  })
  
  return shapeCounts
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generates a random ID
 */
export function generateId(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Formats file size in bytes to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Safely parses JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/**
 * Creates a delay/sleep function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
} 