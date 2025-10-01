import { env, appConfig, apiConfig } from '@/config/environment'

// App Configuration
export const APP_CONFIG = {
  name: appConfig.name,
  description: 'Luxury Gems & Jewelry Marketplace',
  url: env.APP_BASE_URL,
  version: appConfig.version,
} as const

// API Configuration
export const API_CONFIG = {
  baseUrl: env.API_BASE_URL,
  timeout: apiConfig.timeout,
} as const

// Navigation Links
export const NAVIGATION_LINKS = [
  { href: '/', label: 'Home', requiresAuth: false },
  { href: '/explore', label: 'Explore', requiresAuth: false },
  { href: '/about', label: 'About Us', requiresAuth: false },
  { href: '/contact', label: 'Contact', requiresAuth: false },
  { href: '/help', label: 'Help', requiresAuth: false },
  { href: '/sell', label: 'Sell with Us', requiresAuth: true },
] as const

// Theme Configuration
export const THEME_CONFIG = {
  defaultTheme: 'system',
  storageKey: 'ishq-gems-theme',
  enableSystem: true,
} as const

// Gemstone Filters
export const GEM_COLORS = [
  { name: 'Blue', value: 'Blue', hex: '#0066CC', count: 0 },
  { name: 'Red', value: 'Red', hex: '#DC2626', count: 0 },
  { name: 'Green', value: 'Green', hex: '#059669', count: 0 },
  { name: 'Yellow', value: 'Yellow', hex: '#FBBF24', count: 0 },
  { name: 'Pink', value: 'Pink', hex: '#EC4899', count: 0 },
  { name: 'Purple', value: 'Purple', hex: '#7C3AED', count: 0 },
  { name: 'Orange', value: 'Orange', hex: '#EA580C', count: 0 },
  { name: 'White', value: 'White', hex: '#F8FAFC', count: 0 },
  { name: 'Black', value: 'Black', hex: '#1E293B', count: 0 },
] as const

export const GEM_SHAPES = [
  { name: 'Round', value: 'Round', icon: '●' },
  { name: 'Oval', value: 'Oval', icon: '◯' },
  { name: 'Cushion', value: 'Cushion', icon: '◆' },
  { name: 'Emerald', value: 'Emerald', icon: '▢' },
  { name: 'Princess', value: 'Princess', icon: '◼' },
  { name: 'Asscher', value: 'Asscher', icon: '⬜' },
  { name: 'Marquise', value: 'Marquise', icon: '◊' },
  { name: 'Pear', value: 'Pear', icon: '💧' },
  { name: 'Heart', value: 'Heart', icon: '♥' },
  { name: 'Radiant', value: 'Radiant', icon: '⬧' },
] as const

export const CLARITY_GRADES = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'
] as const

export const TREATMENT_TYPES = [
  'None',
  'No Heat',
  'Heat Only',
  'Minor Oil',
  'Moderate Oil',
  'Significant Oil',
  'Irradiation',
  'Diffusion'
] as const

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  uploadPreset: env.CLOUDINARY_UPLOAD_PRESET,
  apiKey: env.CLOUDINARY_API_KEY,
} as const

// Pagination
export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 50,
} as const

// File Upload Limits
export const UPLOAD_LIMITS = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  maxFileSize: 5 * 1024 * 1024, // 5MB (for backward compatibility)
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  allowedVideoTypes: ['video/mp4', 'video/mov', 'video/avi'] as const,
  maxImages: 5,
  maxVideos: 2,
} as const

// Validation Rules
export const VALIDATION_RULES = {
  password: {
    minLength: 8,
    requireSpecialChar: true,
    requireNumber: true,
    requireUppercase: true,
  },
  title: {
    minLength: 3,
    maxLength: 100,
  },
  description: {
    minLength: 10,
    maxLength: 1000,
  },
  price: {
    min: 1,
    max: 1000000,
  },
} as const

// Company Information
export const companyInfo = {
  name: "Ishq Gems",
  fullName: "Ishq (Gems Pvt) Ltd",
  address: "Sri Lanka", // No physical showroom yet
  phone: "+94 76 495 9148",
  whatsapp: "+94 76 495 9148",
  email: "gemsishq@gmail.com",
  futureEmailDomain: "@ishqgems.com",
  social: {
    facebook: "https://web.facebook.com/ishqgems",
    instagram: "https://www.instagram.com/ishq.gems",
  },
} as const

// Social Links (Legacy - use companyInfo.social instead)
export const SOCIAL_LINKS = {
  facebook: companyInfo.social.facebook,
  twitter: 'https://twitter.com/ishqgems', // Keep for backward compatibility
  instagram: companyInfo.social.instagram,
  email: companyInfo.email,
  phone: companyInfo.phone,
} as const

// SEO Defaults
export const SEO_DEFAULTS = {
  titleTemplate: `%s | ${companyInfo.name}`,
  defaultTitle: `${companyInfo.name} - Luxury Gems & Jewelry Marketplace`,
  description: 'Discover exquisite gems and handcrafted jewelry. Premium collection of diamonds, emeralds, rubies, and more.',
  keywords: 'luxury jewelry, gems, diamonds, emeralds, rubies, sapphires, handcrafted jewelry, premium gems',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: companyInfo.name,
  },
} as const

// Profile Configuration
export const PROFILE_CONFIG = {
  maxBioLength: 500,
  maxAvatarSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  defaultAvatarBg: 'bg-gradient-to-br from-primary/20 to-accent/20'
}

// Profile Navigation Links
export const PROFILE_LINKS = {
  buyer: [
    { label: 'My Profile', href: '/account/profile', icon: 'User' },
    { label: 'My Orders', href: '/orders', icon: 'ShoppingBag' },
    { label: 'Wishlist', href: '/wishlist', icon: 'Heart' },
    { label: 'Become a Seller', href: '/account/become-seller', icon: 'Star' },
    { label: 'Account Settings', href: '/account/settings', icon: 'Settings' },
  ],
  seller: [
    { label: 'My Profile', href: '/account/profile', icon: 'User' },
    { label: 'Seller Dashboard', href: '/seller', icon: 'Settings' },
    { label: 'Add Gem', href: '/dashboard/add-gem', icon: 'Gem' },
    { label: 'My Listings', href: '/dashboard/listings', icon: 'Package' },
    { label: 'Account Settings', href: '/account/settings', icon: 'Settings' },
  ],
  admin: [
    { label: 'My Profile', href: '/account/profile', icon: 'User' },
    { label: 'Admin Dashboard', href: '/admin', icon: 'Shield' },
    { label: 'Manage Sellers', href: '/admin/sellers', icon: 'Users' },
    { label: 'Reports', href: '/admin/reports', icon: 'BarChart' },
    { label: 'Account Settings', href: '/account/settings', icon: 'Settings' },
  ]
} 