'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, X, Globe } from 'lucide-react';
import Image from 'next/image';
import { detectLinks, fetchLinkPreview, generateBasicPreview, type LinkPreview } from '@/utils/linkUtils';

interface MessageInputLinkPreviewProps {
  message: string;
  onPreviewReady?: (previews: LinkPreview[]) => void;
  className?: string;
}

export function MessageInputLinkPreview({ 
  message, 
  onPreviewReady,
  className = '' 
}: MessageInputLinkPreviewProps) {
  const [linkPreviews, setLinkPreviews] = useState<LinkPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const links = detectLinks(message);
    
    if (links.length === 0) {
      setLinkPreviews([]);
      setVisible(false);
      onPreviewReady?.([]);
      return;
    }

    // Show the popup and start loading previews
    setVisible(true);
    setLoading(true);

    const loadPreviews = async () => {
      try {
        const uniqueLinks = [...new Set(links)];
        const previews = await Promise.all(
          uniqueLinks.slice(0, 3).map(async (url) => {
            try {
              return await fetchLinkPreview(url);
            } catch (error) {
              console.warn('Failed to fetch preview for:', url, error);
              return generateBasicPreview(url);
            }
          })
        );
        
        setLinkPreviews(previews);
        onPreviewReady?.(previews);
      } catch (error) {
        console.error('Error loading link previews:', error);
        // Fallback to basic previews
        const basicPreviews = links.slice(0, 3).map(generateBasicPreview);
        setLinkPreviews(basicPreviews);
        onPreviewReady?.(basicPreviews);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the preview loading
    const timeoutId = setTimeout(loadPreviews, 500);
    
    return () => clearTimeout(timeoutId);
  }, [message, onPreviewReady]);

  if (!visible || linkPreviews.length === 0) {
    return null;
  }

  return (
    <div className={`absolute bottom-full left-0 right-0 mb-2 z-50 ${className}`}>
      <div className="bg-card border border-border rounded-lg shadow-lg overflow-hidden backdrop-blur-sm bg-opacity-95 max-h-64 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-muted/50 border-b border-border">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Link Preview{linkPreviews.length > 1 ? 's' : ''}
            </span>
            {loading && (
              <div className="w-3 h-3 animate-spin rounded-full border border-primary border-t-transparent"></div>
            )}
          </div>
          <button
            onClick={() => setVisible(false)}
            className="p-1 hover:bg-secondary rounded-md transition-colors"
            title="Close preview"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>

        {/* Preview Cards */}
        <div className="p-2 space-y-2">
          {linkPreviews.map((preview, index) => (
            <LinkPreviewCard key={`${preview.url}-${index}`} preview={preview} />
          ))}
        </div>

        {/* Footer */}
        <div className="p-2 bg-muted/30 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Link preview will be included with your message
          </p>
        </div>
      </div>
    </div>
  );
}

function LinkPreviewCard({ preview }: { preview: LinkPreview }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex gap-3 p-2 bg-secondary/30 rounded-md hover:bg-secondary/50 transition-colors">
      {/* Image/Icon */}
      <div className="flex-shrink-0">
        {preview.image && !imageError ? (
          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
            <Image
              src={preview.image}
              alt={preview.title || 'Link preview'}
              className="w-full h-full object-cover"
              width={48}
              height={48}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
            <Globe className="w-6 h-6 text-primary/70" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        {preview.title && (
          <h4 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
            {preview.title}
          </h4>
        )}

        {/* Description */}
        {preview.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
            {preview.description}
          </p>
        )}

        {/* Domain */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span className="truncate">{preview.domain}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
} 