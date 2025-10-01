export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  domain: string;
}

/**
 * Detects URLs in text content
 */
export function detectLinks(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches || [];
}

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}

/**
 * Generates basic link preview with domain fallback
 */
export function generateBasicPreview(url: string): LinkPreview {
  return {
    url,
    domain: extractDomain(url),
    title: extractDomain(url),
    description: `Visit ${extractDomain(url)}`
  };
}

/**
 * Fetches link metadata from server
 */
export async function fetchLinkPreview(url: string): Promise<LinkPreview> {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/messages/link-preview', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch link preview');
    }

    const data = await response.json();
    if (data.success && data.data) {
      return {
        url,
        domain: extractDomain(url),
        ...data.data
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.warn('Failed to fetch link preview for:', url, error);
    // Return basic preview as fallback
    return generateBasicPreview(url);
  }
}

/**
 * Processes message content to generate link previews
 */
export async function processMessageForLinks(content: string): Promise<{
  content: string;
  linkPreviews: LinkPreview[];
}> {
  const links = detectLinks(content);
  
  if (links.length === 0) {
    return {
      content,
      linkPreviews: []
    };
  }

  // Fetch previews for all unique links
  const uniqueLinks = [...new Set(links)];
  const linkPreviews = await Promise.all(
    uniqueLinks.map(link => fetchLinkPreview(link))
  );

  return {
    content,
    linkPreviews
  };
}

/**
 * Validates if URL is safe to preview
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol;
    
    // Only allow http and https
    if (protocol !== 'http:' && protocol !== 'https:') {
      return false;
    }

    // Block potentially harmful or private domains
    const hostname = parsedUrl.hostname.toLowerCase();
    const blockedPatterns = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '.local',
      '.internal'
    ];

    return !blockedPatterns.some(pattern => hostname.includes(pattern));
  } catch {
    return false;
  }
}

/**
 * Truncates text for preview display
 */
export function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
} 