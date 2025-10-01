import { Metadata } from 'next';
import { env } from '@/config/environment';

interface GemLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

interface GemMedia {
  type: 'image' | 'video' | 'lab-report';
  url: string;
}

interface GemResponse {
  success: boolean;
  data: {
    gemType: string;
    color: string;
    weight: {
      value: number;
      unit: string;
    };
    origin: string;
    media?: GemMedia[];
  };
}



type MetadataProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: MetadataProps
): Promise<Metadata> {
  // Read route params - await params in Next.js 15+
  const { id } = await params;
  
  try {
    // Fetch gem data for metadata - using direct fetch for server-side metadata generation
    // Note: We can't use our client-side services in server components, so we keep fetch here
    const apiBaseUrl = env.API_BASE_URL;
    const response = await fetch(
      `${apiBaseUrl}/gems/${id}`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );
    const data = await response.json() as GemResponse;
    
    if (!data.success) {
      return {
        title: 'Gem Not Found',
        description: 'The requested gem could not be found.'
      };
    }

    const gem = data.data;
    
    return {
      title: `${gem.gemType} - ${gem.color} | Ishq Gems`,
      description: `${gem.weight.value}${gem.weight.unit} ${gem.color} ${gem.gemType} from ${gem.origin}. View detailed specifications and pricing.`,
      openGraph: {
        title: `${gem.gemType} - ${gem.color} | Ishq Gems`,
        description: `${gem.weight.value}${gem.weight.unit} ${gem.color} ${gem.gemType} from ${gem.origin}. View detailed specifications and pricing.`,
        images: gem.media?.filter(m => m.type === 'image').map(m => m.url) || []
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Gem Details | Ishq Gems',
      description: 'View detailed gem specifications and pricing.'
    };
  }
}

/**
 * Gem detail page layout with dynamic metadata
 */
export default function GemLayout({ children }: GemLayoutProps) {
  return (
    <>
      {children}
      {/* Add structured data script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Gem Detail Page',
            description: 'Premium gemstone marketplace with verified sellers and certified gems',
            isPartOf: {
              '@type': 'WebSite',
              name: 'Ishq Gems',
              url: env.APP_BASE_URL
            }
          })
        }}
      />
    </>
  )
} 