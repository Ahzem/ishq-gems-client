/**
 * SEO and Open Graph types for social media sharing
 */

import type { StructuredDataSchema } from '@/components/seo/StructuredData'

export interface OpenGraphImage {
  url: string
  width?: number
  height?: number
  alt?: string
  type?: string
}

export interface OpenGraphVideo {
  url: string
  width?: number
  height?: number
  type?: string
}

export interface TwitterCard {
  card: 'summary' | 'summary_large_image' | 'app' | 'player'
  site?: string
  creator?: string
  title?: string
  description?: string
  image?: string
}

export interface OpenGraph {
  title: string
  description: string
  type: 'article' | 'website' | 'profile'
  url?: string
  siteName?: string
  locale?: string
  images?: OpenGraphImage[]
  videos?: OpenGraphVideo[]
  // Product-specific fields as article metadata
  article?: {
    publishedTime?: string
    modifiedTime?: string
    section?: string
    tags?: string[]
    // Custom properties for product info
    price?: {
      amount: number
      currency: string
    }
    availability?: 'in stock' | 'out of stock' | 'preorder' | 'backorder' | 'discontinued'
    condition?: 'new' | 'refurbished' | 'used'
    brand?: string
    category?: string
    retailer?: string
  }
}

export interface SEOMetadata {
  title: string
  description: string
  keywords?: string
  canonical?: string
  robots?: {
    index?: boolean
    follow?: boolean
    noarchive?: boolean
    nosnippet?: boolean
    noimageindex?: boolean
  }
  openGraph: OpenGraph
  twitter?: TwitterCard
  structuredData?: StructuredDataSchema[]
}

export interface GemSEOData {
  id: string
  name: string
  gemType: string
  color: string
  weight: {
    value: number
    unit: string
  }
  price?: number
  startingBid?: number
  listingType: 'direct-sale' | 'auction'
  origin: string
  images: Array<{
    url: string
    alt: string
  }>
  seller: {
    name: string
    verified: boolean
  }
  status: string
  description?: string
} 