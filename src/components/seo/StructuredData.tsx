/**
 * Component for rendering structured data (JSON-LD) in the document head
 */

// Common structured data schema types
interface BaseSchema {
  '@context': string
  '@type': string
}

interface ProductSchema extends BaseSchema {
  '@type': 'Product'
  name: string
  description?: string
  image?: string | string[]
  brand?: string | { '@type': 'Brand'; name: string }
  category?: string
  sku?: string
  offers?: {
    '@type': 'Offer'
    price: string | number
    priceCurrency: string
    availability: string
    seller?: {
      '@type': 'Organization' | 'Person'
      name: string
    }
  }
  aggregateRating?: {
    '@type': 'AggregateRating'
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }
}

interface OrganizationSchema extends BaseSchema {
  '@type': 'Organization'
  name: string
  url?: string
  logo?: string
  description?: string
  address?: {
    '@type': 'PostalAddress'
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  contactPoint?: {
    '@type': 'ContactPoint'
    telephone?: string
    email?: string
    contactType?: string
  }
}

interface WebsiteSchema extends BaseSchema {
  '@type': 'WebSite'
  name: string
  url: string
  description?: string
  publisher?: {
    '@type': 'Organization'
    name: string
    logo?: string
  }
  potentialAction?: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
}

interface ArticleSchema extends BaseSchema {
  '@type': 'Article'
  headline: string
  description?: string
  image?: string | string[]
  author?: {
    '@type': 'Person' | 'Organization'
    name: string
  }
  publisher?: {
    '@type': 'Organization'
    name: string
    logo?: {
      '@type': 'ImageObject'
      url: string
    }
  }
  datePublished?: string
  dateModified?: string
}

interface PersonSchema extends BaseSchema {
  '@type': 'Person'
  name: string
  url?: string
  image?: string
  description?: string
  jobTitle?: string
  worksFor?: {
    '@type': 'Organization'
    name: string
  }
}

// Union type for all supported structured data schemas
export type StructuredDataSchema = 
  | ProductSchema 
  | OrganizationSchema 
  | WebsiteSchema 
  | ArticleSchema 
  | PersonSchema
  | (BaseSchema & Record<string, unknown>) // Fallback for custom schemas

interface StructuredDataProps {
  data: StructuredDataSchema | StructuredDataSchema[]
}

export default function StructuredData({ data }: StructuredDataProps) {
  const structuredData = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {structuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item, null, 2)
          }}
        />
      ))}
    </>
  )
} 