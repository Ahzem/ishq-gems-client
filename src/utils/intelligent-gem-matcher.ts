/**
 * Intelligent gem data matcher for OCR extraction
 * Handles complex matching scenarios with fuzzy logic and domain knowledge
 */

import {
  GEM_TYPES,
  GEM_VARIETIES,
  SHAPE_CUT_OPTIONS,
  COLOR_OPTIONS,
  CLARITY_GRADES,
  ORIGIN_OPTIONS,
  TREATMENT_OPTIONS,
  LAB_NAMES,
  INVESTMENT_GRADES,
  MARKET_TRENDS,
  FLUORESCENCE_INTENSITIES,
  FLUORESCENCE_COLORS,
  POLISH_SYMMETRY_GRADES
} from '@/constants/gem-options'
import type { GemMetadata } from '@/types/entities/gem'

// Levenshtein distance for fuzzy string matching
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

// Calculate similarity score (0-1, where 1 is perfect match)
function getSimilarityScore(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length)
  if (maxLength === 0) return 1
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return (maxLength - distance) / maxLength
}

// Shape/Cut specific matching patterns
const SHAPE_CUT_PATTERNS = {
  // Common OCR misreadings and variations
  'round': ['round', 'round brilliant', 'brilliant', 'rd', 'rnd'],
  'oval': ['oval', 'ov', 'oval mixed', 'oval brilliant'],
  'cushion': ['cushion', 'cush', 'square cushion', 'rectangular cushion', 'antique cushion', 'sahepe', 'sahape'],
  'emerald': ['emerald', 'emerald cut', 'em', 'step cut'],
  'pear': ['pear', 'pear shape', 'tear drop', 'teardrop', 'pr'],
  'marquise': ['marquise', 'marquis', 'navette', 'mq'],
  'princess': ['princess', 'square', 'pr', 'princess cut'],
  'asscher': ['asscher', 'square emerald', 'step cut square'],
  'radiant': ['radiant', 'rectangular', 'rect', 'ra'],
  'heart': ['heart', 'heart shape', 'ht'],
  'trillion': ['trillion', 'trilliant', 'triangular', 'tri', 'tr'],
  'baguette': ['baguette', 'bag', 'rectangular', 'step cut'],
  'cabochon': ['cabochon', 'cab', 'dome', 'smooth', 'polished'],
  'rose cut': ['rose', 'rose cut', 'antique'],
  'mixed cut': ['mixed', 'mixed cut', 'combination']
}

// Color matching patterns with trade names
const COLOR_PATTERNS = {
  'pigeon blood red': ['pigeon blood', 'pigeon-blood', 'pigeonblood', 'vivid red'],
  'padparadscha': ['padparadscha', 'padparadsha', 'lotus', 'pink-orange', 'salmon'],
  'cornflower blue': ['cornflower', 'corn flower', 'vivid blue', 'intense blue'],
  'royal blue': ['royal', 'deep blue', 'intense blue'],
  'ceylon blue': ['ceylon', 'light blue', 'sky blue'],
  'vivid green': ['vivid green', 'intense green', 'emerald green'],
  'canary yellow': ['canary', 'vivid yellow', 'intense yellow'],
  'champagne': ['champagne', 'light brown', 'golden brown'],
  'cognac': ['cognac', 'brown', 'dark brown'],
  'paraíba blue': ['paraiba', 'neon blue', 'electric blue', 'turquoise']
}

// Origin matching patterns
const ORIGIN_PATTERNS = {
  'sri lanka (ceylon)': ['sri lanka', 'ceylon', 'srilanka'],
  'myanmar (burma)': ['myanmar', 'burma', 'burma (myanmar)'],
  'mogok (myanmar)': ['mogok', 'mogok burma', 'mogok myanmar'],
  'kashmir': ['kashmir', 'kashmir valley', 'kashmir india'],
  'madagascar': ['madagascar', 'malagasy'],
  'montana (usa)': ['montana', 'usa montana', 'united states'],
  'colombia': ['colombia', 'columbian', 'south america'],
  'zambia': ['zambia', 'african'],
  'brazil': ['brazil', 'brazilian'],
  'thailand': ['thailand', 'thai', 'siam'],
  'australia': ['australia', 'australian'],
  'tanzania': ['tanzania', 'tanzanian'],
  'afghanistan': ['afghanistan', 'afghan'],
  'panjshir (afghanistan)': ['panjshir', 'panjsher', 'afghanistan panjshir']
}

// Treatment matching patterns
const TREATMENT_PATTERNS = {
  'none (natural/untreated)': ['none', 'natural', 'untreated', 'no treatment', 'n'],
  'no indication of treatment': ['no indication', 'no evidence', 'not detected'],
  'heat treatment': ['heat', 'heated', 'heat treatment', 'thermal', 'h'],
  'heat only': ['heat only', 'heated only', 'thermal only'],
  'no heat': ['no heat', 'unheated', 'nh'],
  'oiling': ['oil', 'oiled', 'oiling', 'cedar oil', 'minor oil'],
  'minor oil': ['minor oil', 'slight oil', 'light oil'],
  'moderate oil': ['moderate oil', 'medium oil'],
  'significant oil': ['significant oil', 'heavy oil', 'major oil'],
  'irradiation': ['irradiated', 'irradiation', 'gamma', 'electron'],
  'diffusion': ['diffusion', 'diffused', 'surface diffusion'],
  'fracture filling': ['fracture filling', 'filled', 'glass filled'],
  'clarity enhancement': ['clarity enhanced', 'enhanced', 'ce']
}

// Lab name matching patterns
const LAB_PATTERNS = {
  'gia (gemological institute of america)': ['gia', 'gemological institute', 'america'],
  'ssef (swiss gemmological institute)': ['ssef', 'swiss', 'basel'],
  'gübelin gem lab': ['gubelin', 'gübelin', 'guebelin'],
  'grs (gem research swisslab)': ['grs', 'gem research', 'swisslab'],
  'aigs (asian institute of gemological sciences)': ['aigs', 'asian institute'],
  'lotus gemology': ['lotus', 'lotus gemology'],
  'guild laboratories': ['guild', 'guild lab'],
  'agl (american gemological laboratories)': ['agl', 'american gemological'],
  'cgl (central gem laboratory)': ['cgl', 'central gem'],
  'gic (gemmological institute of colombo)': ['gic', 'colombo', 'institute colombo'],
  'ngja (sri lanka)': ['ngja', 'sri lanka authority', 'national gem'],
  'kandy gem laboratory': ['kandy', 'kandy lab'],
  'sapphire testing lab (beruwala)': ['beruwala', 'sapphire testing']
}

// Clarity matching patterns
const CLARITY_PATTERNS = {
  'fl (flawless)': ['fl', 'flawless', 'perfect'],
  'if (internally flawless)': ['if', 'internally flawless', 'internal flawless'],
  'vvs1 (very very slightly included)': ['vvs1', 'vvs 1', 'very very slight'],
  'vvs2 (very very slightly included)': ['vvs2', 'vvs 2'],
  'vs1 (very slightly included)': ['vs1', 'vs 1', 'very slight'],
  'vs2 (very slightly included)': ['vs2', 'vs 2'],
  'si1 (slightly included)': ['si1', 'si 1', 'slight'],
  'si2 (slightly included)': ['si2', 'si 2'],
  'i1 (included)': ['i1', 'i 1', 'included'],
  'i2 (included)': ['i2', 'i 2'],
  'i3 (included)': ['i3', 'i 3'],
  'eye clean': ['eye clean', 'eyeclean', 'clean'],
  'transparent': ['transparent', 'clear'],
  'translucent': ['translucent', 'semi-transparent'],
  'type i (usually eye-clean)': ['type 1', 'type i', 'type one'],
  'type ii (usually included)': ['type 2', 'type ii', 'type two'],
  'type iii (almost always included)': ['type 3', 'type iii', 'type three']
}

// Generic intelligent matcher
function findBestMatch(
  inputValue: string,
  options: string[],
  patterns?: Record<string, string[]>,
  minSimilarity: number = 0.6
): string | null {
  if (!inputValue) return null
  
  const normalizedInput = inputValue.toLowerCase().trim()
  
  // 1. Exact match
  const exactMatch = options.find(option => 
    option.toLowerCase() === normalizedInput
  )
  if (exactMatch) return exactMatch
  
  // 2. Pattern-based matching (if patterns provided)
  if (patterns) {
    for (const [standardForm, variations] of Object.entries(patterns)) {
      if (variations.some(variation => 
        normalizedInput.includes(variation) || variation.includes(normalizedInput)
      )) {
        const matchedOption = options.find(option => 
          option.toLowerCase() === standardForm
        )
        if (matchedOption) return matchedOption
      }
    }
  }
  
  // 3. Fuzzy matching with similarity scoring
  let bestMatch = null
  let bestScore = 0
  
  for (const option of options) {
    const similarity = getSimilarityScore(normalizedInput, option.toLowerCase())
    
    if (similarity > bestScore && similarity >= minSimilarity) {
      bestScore = similarity
      bestMatch = option
    }
    
    // Also check if input is contained in option or vice versa
    if (option.toLowerCase().includes(normalizedInput) || 
        normalizedInput.includes(option.toLowerCase())) {
      const containmentScore = Math.min(normalizedInput.length, option.length) / 
                              Math.max(normalizedInput.length, option.length)
      
      if (containmentScore > bestScore && containmentScore >= minSimilarity) {
        bestScore = containmentScore
        bestMatch = option
      }
    }
  }
  
  return bestMatch
}

// Specialized matchers for each field type
export const intelligentMatchers: Record<string, MatcherFunction> = {
  gemType: (value: string) => findBestMatch(value, GEM_TYPES),
  
  variety: (value: string) => findBestMatch(value, GEM_VARIETIES),
  
  shapeCut: (value: string) => findBestMatch(value, SHAPE_CUT_OPTIONS, SHAPE_CUT_PATTERNS),
  
  color: (value: string) => findBestMatch(value, COLOR_OPTIONS, COLOR_PATTERNS),
  
  clarity: (value: string) => findBestMatch(value, CLARITY_GRADES, CLARITY_PATTERNS),
  
  origin: (value: string) => findBestMatch(value, ORIGIN_OPTIONS, ORIGIN_PATTERNS),
  
  treatments: (value: string) => findBestMatch(value, TREATMENT_OPTIONS, TREATMENT_PATTERNS),
  
  labName: (value: string) => findBestMatch(value, LAB_NAMES, LAB_PATTERNS),
  
  investmentGrade: (value: string) => findBestMatch(value, INVESTMENT_GRADES),
  
  marketTrend: (value: string) => findBestMatch(value, MARKET_TRENDS),
  
  fluorescence: (value: string) => findBestMatch(value, FLUORESCENCE_INTENSITIES),
  
  fluorescenceColor: (value: string) => findBestMatch(value, FLUORESCENCE_COLORS),
  
  polish: (value: string) => findBestMatch(value, POLISH_SYMMETRY_GRADES),
  
  symmetry: (value: string) => findBestMatch(value, POLISH_SYMMETRY_GRADES)
}

// Interface for tracking intelligent matches
export interface IntelligentMatchResult {
  matchedData: GemMetadata
  matchSummary: Array<{
    field: string
    original: string
    matched: string
    confidence: 'high' | 'medium' | 'low'
  }>
}

// Interface for matcher functions
type MatcherFunction = (value: string) => string | null

// Main intelligent matching function with match tracking
export function intelligentlyMatchGemData(extractedData: GemMetadata): GemMetadata {
  const matchedData: GemMetadata = { ...extractedData }
  
  // Apply intelligent matching to each field
  if (extractedData.gemType) {
    matchedData.gemType = intelligentMatchers.gemType(extractedData.gemType) || extractedData.gemType
  }
  
  if (extractedData.variety) {
    matchedData.variety = intelligentMatchers.variety(extractedData.variety) || extractedData.variety
  }
  
  if (extractedData.shapeCut) {
    matchedData.shapeCut = intelligentMatchers.shapeCut(extractedData.shapeCut) || extractedData.shapeCut
  }
  
  if (extractedData.color) {
    matchedData.color = intelligentMatchers.color(extractedData.color) || extractedData.color
  }
  
  if (extractedData.clarity) {
    matchedData.clarity = intelligentMatchers.clarity(extractedData.clarity) || extractedData.clarity
  }
  
  if (extractedData.origin) {
    matchedData.origin = intelligentMatchers.origin(extractedData.origin) || extractedData.origin
  }
  
  if (extractedData.treatments) {
    matchedData.treatments = intelligentMatchers.treatments(extractedData.treatments) || extractedData.treatments
  }
  
  if (extractedData.labName) {
    matchedData.labName = intelligentMatchers.labName(extractedData.labName) || extractedData.labName
  }
  
  return matchedData
}

// Enhanced version that tracks what was matched
export function intelligentlyMatchGemDataWithTracking(extractedData: GemMetadata): IntelligentMatchResult {
  const matchedData: GemMetadata = { ...extractedData }
  const matchSummary: IntelligentMatchResult['matchSummary'] = []
  
  const fields: Array<{
    key: keyof GemMetadata
    matcher: MatcherFunction
    label: string
  }> = [
    { key: 'gemType', matcher: intelligentMatchers.gemType, label: 'Gem Type' },
    { key: 'variety', matcher: intelligentMatchers.variety, label: 'Variety' },
    { key: 'shapeCut', matcher: intelligentMatchers.shapeCut, label: 'Shape/Cut' },
    { key: 'color', matcher: intelligentMatchers.color, label: 'Color' },
    { key: 'clarity', matcher: intelligentMatchers.clarity, label: 'Clarity' },
    { key: 'origin', matcher: intelligentMatchers.origin, label: 'Origin' },
    { key: 'treatments', matcher: intelligentMatchers.treatments, label: 'Treatments' },
    { key: 'labName', matcher: intelligentMatchers.labName, label: 'Lab Name' }
  ]
  
  for (const field of fields) {
    const originalValue = extractedData[field.key]
    if (originalValue && typeof originalValue === 'string') {
      const matched = field.matcher(originalValue)
      
      if (matched && matched !== originalValue) {
        // Type assertion is safe here because we know the field exists and is a string
        ;(matchedData as Record<string, unknown>)[field.key] = matched
        
        // Determine confidence based on similarity
        const similarity = getSimilarityScore(originalValue.toLowerCase(), matched.toLowerCase())
        let confidence: 'high' | 'medium' | 'low'
        
        if (similarity >= 0.8) confidence = 'high'
        else if (similarity >= 0.6) confidence = 'medium'
        else confidence = 'low'
        
        matchSummary.push({
          field: field.label,
          original: originalValue,
          matched,
          confidence
        })
      }
    }
  }
  
  return { matchedData, matchSummary }
}
