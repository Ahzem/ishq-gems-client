import { Metadata } from 'next'
import { appConfig } from '@/config/environment'

/**
 * Creates metadata with proper metadataBase for consistent URL resolution
 */
export function createMetadata(metadata: Metadata): Metadata {
  return {
    metadataBase: new URL(appConfig.baseUrl),
    ...metadata
  }
}

/**
 * Creates page-specific metadata with consistent base configuration
 */
export function createPageMetadata({
  title,
  description,
  keywords,
  openGraph,
  twitter,
  ...rest
}: Omit<Metadata, 'metadataBase'>): Metadata {
  return createMetadata({
    title,
    description,
    keywords,
    openGraph: openGraph ? {
      title: title as string,
      description: description as string,
      ...openGraph
    } : undefined,
    twitter: twitter ? {
      title: title as string,
      description: description as string,
      ...twitter
    } : undefined,
    ...rest
  })
}
