// Enhanced filter options using comprehensive gem-options.ts data
import { 
  GEM_TYPES, 
  COLOR_OPTIONS, 
  SHAPE_CUT_OPTIONS, 
  ORIGIN_OPTIONS, 
  TREATMENT_OPTIONS,
  LAB_NAMES,
  INVESTMENT_GRADES,
  CLARITY_GRADES,
  POLISH_SYMMETRY_GRADES
} from './gem-options'

// Popular gem types for quick filters (most commonly searched)
export const popularGemTypes = [
  'Ruby', 'Sapphire', 'Emerald', 'Diamond', 'Tanzanite', 
  'Spinel', 'Tourmaline', 'Garnet', 'Peridot', 'Aquamarine'
]

// Popular colors for quick filters
export const popularColors = [
  'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 
  'Orange', 'White', 'Colorless', 'Padparadscha'
]

// Popular shapes for quick filters
export const popularShapes = [
  'Round Brilliant', 'Oval', 'Cushion', 'Emerald Cut', 
  'Pear', 'Princess', 'Heart', 'Marquise'
]

// Popular origins for quick filters
export const popularOrigins = [
  'Sri Lanka (Ceylon)', 'Myanmar (Burma)', 'Colombia', 'Madagascar',
  'Tanzania', 'Thailand', 'Brazil', 'Kashmir', 'Mozambique'
]

// Use comprehensive data from gem-options.ts
export const fixedGemTypes = GEM_TYPES
export const fixedColors = COLOR_OPTIONS
export const fixedShapes = SHAPE_CUT_OPTIONS
export const fixedOrigins = ORIGIN_OPTIONS
export const fixedTreatments = TREATMENT_OPTIONS.map(treatment => 
  treatment.replace(/\([^)]*\)/g, '').trim() // Remove parenthetical descriptions for cleaner filter display
)
export const fixedCertifyingLabs = LAB_NAMES.map(lab => 
  lab.replace(/\([^)]*\)/g, '').trim() // Remove parenthetical descriptions
)
export const fixedInvestmentGrades = INVESTMENT_GRADES
export const fixedClarityGrades = CLARITY_GRADES
export const fixedPolishGrades = POLISH_SYMMETRY_GRADES

export const fixedRarities = [
  "Exceptional", "Rare", "Uncommon", "Common"
]

export const fixedSellerTypes = [
  "Ishq Gems", "Verified Seller", "Third-Party"
]

export const fixedAvailabilities = [
  "Available", "Reserved", "Sold"
]

// Additional filter categories for enhanced filtering
export const treatmentCategories = {
  natural: ['None (Natural/Untreated)', 'No Indication of Treatment', 'No Heat'],
  heated: ['Heat Treatment', 'Heat Only', 'Heated'],
  enhanced: ['Oil Treatment', 'Fracture Filling', 'Clarity Enhancement', 'Glass Filling'],
  synthetic: ['HPHT (High Pressure High Temperature)', 'Irradiation', 'Diffusion']
}

export const priceRanges = [
  { label: 'Under $1,000', min: 0, max: 1000 },
  { label: '$1,000 - $5,000', min: 1000, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: '$10,000 - $25,000', min: 10000, max: 25000 },
  { label: '$25,000 - $50,000', min: 25000, max: 50000 },
  { label: 'Over $50,000', min: 50000, max: 1000000 }
]

export const caratRanges = [
  { label: 'Under 1ct', min: 0, max: 1 },
  { label: '1-3ct', min: 1, max: 3 },
  { label: '3-5ct', min: 3, max: 5 },
  { label: '5-10ct', min: 5, max: 10 },
  { label: 'Over 10ct', min: 10, max: 100 }
]

// Helper function to create a case-insensitive regex pattern for filtering
export const createFilterRegex = (filterValue: string): RegExp => {
  // Escape special regex characters and create case-insensitive pattern
  const escapedValue = filterValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedValue, 'i');
};

// Helper function to check if a gem field matches any of the selected filters
export const matchesAnyFilter = (
  gemField: string | undefined,
  selectedFilters: string[]
): boolean => {
  if (!gemField || selectedFilters.length === 0) return true;
  
  return selectedFilters.some(filter => {
    const regex = createFilterRegex(filter);
    return regex.test(gemField);
  });
};

// Type definitions for filter options (matching the expected frontend format)
export interface FilterOptions {
  gemTypes: string[];
  colors: string[];
  shapes: string[];
  origins: string[];
  clarities: string[];
  treatments: string[];
  investmentGrades: string[];
  fluorescenceTypes: string[];
  polishGrades: string[];
  symmetryGrades: string[];
  priceRange: { min: number; max: number };
  caratRange: { min: number; max: number };
  labNames: string[];
}

// Comprehensive filter options using gem-options.ts data
export const fixedFilterOptions = {
  gemTypes: fixedGemTypes,
  colors: fixedColors,
  shapes: fixedShapes,
  origins: fixedOrigins,
  clarities: fixedClarityGrades,
  treatments: fixedTreatments,
  investmentGrades: fixedInvestmentGrades,
  polishGrades: fixedPolishGrades,
  symmetryGrades: fixedPolishGrades, // Same as polish grades
  labNames: fixedCertifyingLabs,
  rarities: fixedRarities,
  sellerTypes: fixedSellerTypes,
  availabilities: fixedAvailabilities,
  
  // Quick filter options for chips
  popularGemTypes,
  popularColors,
  popularShapes,
  popularOrigins,
  
  // Categorized filters
  treatmentCategories,
  priceRanges,
  caratRanges
} as const

export type FixedFilterOptions = typeof fixedFilterOptions 