/**
 * SEO utility functions for generating meta tags and structured data
 */

import { Metadata } from 'next'
import { SEOMetadata, GemSEOData, OpenGraph, TwitterCard } from '@/types/seo'
import { SEO_DEFAULTS } from './constants'
import { appConfig, environment } from '@/config/environment'

/**
 * Get the base URL for the application
 */
export function getBaseUrl(): string {
  if (environment.isProduction) {
    return appConfig.baseUrl || 'https://ishqgems.com'
  }
  return 'http://localhost:3000'
}

/**
 * Generate SEO metadata for gem detail pages
 */
export function generateGemSEO(gem: GemSEOData): SEOMetadata {
  const baseUrl = getBaseUrl()
  const gemUrl = `${baseUrl}/gem/${gem.id}`
  
  // Generate title with gem details
  const title = `${gem.gemType} ${gem.color ? `- ${gem.color}` : ''} ${gem.weight.value}${gem.weight.unit} | ${SEO_DEFAULTS.openGraph.siteName}`
  
  // Generate description
  const priceText = gem.listingType === 'auction' && gem.startingBid 
    ? `Starting at $${gem.startingBid.toLocaleString()}`
    : gem.price 
    ? `$${gem.price.toLocaleString()}`
    : 'Price on request'
    
  const description = gem.description || 
    `${gem.weight.value}${gem.weight.unit} ${gem.color} ${gem.gemType} from ${gem.origin}. ${priceText}. Premium quality gemstone${gem.seller.verified ? ' from verified seller' : ''}. View details and ${gem.listingType === 'auction' ? 'place your bid' : 'purchase'} on Ishq Gems.`

  // Generate keywords
  const keywords = [
    gem.gemType.toLowerCase(),
    gem.color.toLowerCase(),
    gem.origin.toLowerCase(),
    'luxury gems',
    'natural gemstones',
    'certified gems',
    gem.listingType === 'auction' ? 'gem auction' : 'buy gems online'
  ].join(', ')

  // Select best image for Open Graph
  const primaryImage = gem.images[0]
  const ogImages = primaryImage ? [{
    url: primaryImage.url,
    width: 1200,
    height: 630,
    alt: primaryImage.alt || title,
    type: 'image/jpeg'
  }] : []

  const openGraph: OpenGraph = {
    title,
    description,
    type: 'article',
    url: gemUrl,
    siteName: SEO_DEFAULTS.openGraph.siteName,
    locale: SEO_DEFAULTS.openGraph.locale,
    images: ogImages,
    article: {
      publishedTime: new Date().toISOString(),
      section: 'Gems',
      tags: [gem.gemType, gem.color, gem.origin, 'luxury gems', 'gemstones'],
      // Product info as custom properties
      price: gem.price ? {
        amount: gem.price,
        currency: 'USD'
      } : undefined,
      availability: gem.status === 'published' ? 'in stock' : 'out of stock',
      condition: 'new',
      brand: SEO_DEFAULTS.openGraph.siteName,
      category: gem.gemType,
      retailer: SEO_DEFAULTS.openGraph.siteName
    }
  }

  const twitter: TwitterCard = {
    card: 'summary_large_image',
    title,
    description: description.substring(0, 200), // Twitter has character limits
    image: primaryImage?.url,
    site: '@ishqgems', // Replace with actual Twitter handle
    creator: '@ishqgems'
  }

  const structuredData = [
    generateGemStructuredData(gem, gemUrl, title, description)
  ]

  return {
    title,
    description,
    keywords,
    canonical: gemUrl,
    robots: {
      index: gem.status === 'published',
      follow: true,
      noarchive: false,
      nosnippet: false,
      noimageindex: false
    },
    openGraph,
    twitter,
    structuredData
  }
}

/**
 * Generate structured data (JSON-LD) for a gem
 */
function generateGemStructuredData(gem: GemSEOData, url: string, title: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    description,
    url,
    sku: gem.id,
    category: gem.gemType,
    brand: {
      '@type': 'Brand',
      name: SEO_DEFAULTS.openGraph.siteName
    },
    image: gem.images.map(img => img.url),
    offers: {
      '@type': gem.listingType === 'auction' ? 'AggregateOffer' : 'Offer',
      url,
      priceCurrency: 'USD',
      price: gem.price || gem.startingBid,
      availability: gem.status === 'published' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: gem.seller.name,
        ...(gem.seller.verified && { 
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            reviewCount: '100'
          }
        })
      }
    },
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Color',
        value: gem.color
      },
      {
        '@type': 'PropertyValue',
        name: 'Weight',
        value: `${gem.weight.value} ${gem.weight.unit}`
      },
      {
        '@type': 'PropertyValue',
        name: 'Origin',
        value: gem.origin
      },
      {
        '@type': 'PropertyValue',
        name: 'Gem Type',
        value: gem.gemType
      }
    ]
  }
}

/**
 * Convert SEO metadata to Next.js Metadata object
 */
export function seoToMetadata(seo: SEOMetadata): Metadata {
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.openGraph.title,
      description: seo.openGraph.description,
      type: seo.openGraph.type,
      url: seo.openGraph.url,
      siteName: seo.openGraph.siteName,
      locale: seo.openGraph.locale,
      images: seo.openGraph.images?.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt,
        type: img.type
      })),
      videos: seo.openGraph.videos?.map(video => ({
        url: video.url,
        width: video.width,
        height: video.height,
        type: video.type
      })),
      ...(seo.openGraph.article && {
        article: {
          publishedTime: seo.openGraph.article.publishedTime,
          modifiedTime: seo.openGraph.article.modifiedTime,
          section: seo.openGraph.article.section,
          tags: seo.openGraph.article.tags
        }
      })
    },
    twitter: seo.twitter ? {
      card: seo.twitter.card,
      site: seo.twitter.site,
      creator: seo.twitter.creator,
      title: seo.twitter.title,
      description: seo.twitter.description,
      images: seo.twitter.image ? [seo.twitter.image] : undefined
    } : undefined,
    robots: seo.robots ? {
      index: seo.robots.index,
      follow: seo.robots.follow,
      googleBot: {
        index: seo.robots.index,
        follow: seo.robots.follow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
        noarchive: seo.robots.noarchive,
        nosnippet: seo.robots.nosnippet,
        noimageindex: seo.robots.noimageindex
      }
    } : undefined,
    alternates: seo.canonical ? {
      canonical: seo.canonical
    } : undefined,
    other: seo.structuredData ? {
      'structured-data': JSON.stringify(seo.structuredData)
    } : undefined
  }
}

/**
 * Generate default SEO metadata for non-gem pages
 */
export function generateDefaultSEO(
  title: string, 
  description?: string, 
  path?: string
): SEOMetadata {
  const baseUrl = getBaseUrl()
  const url = path ? `${baseUrl}${path}` : baseUrl
  
  return {
    title: `${title} | ${SEO_DEFAULTS.openGraph.siteName}`,
    description: description || SEO_DEFAULTS.description,
    canonical: url,
    robots: {
      index: true,
      follow: true
    },
    openGraph: {
      title: `${title} | ${SEO_DEFAULTS.openGraph.siteName}`,
      description: description || SEO_DEFAULTS.description,
      type: 'website',
      url,
      siteName: SEO_DEFAULTS.openGraph.siteName,
      locale: SEO_DEFAULTS.openGraph.locale
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SEO_DEFAULTS.openGraph.siteName}`,
      description: description || SEO_DEFAULTS.description,
      site: '@ishqgems'
    }
  }
} 