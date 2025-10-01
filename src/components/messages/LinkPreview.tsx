'use client';

import { ExternalLink, Globe, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface LinkPreviewProps {
  preview: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    domain: string;
  };
  isOwn: boolean;
  onLinkClick?: (url: string) => void;
}

export function LinkPreview({ preview, isOwn, onLinkClick }: LinkPreviewProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(preview.url);
    } else {
      window.open(preview.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md
        ${isOwn 
          ? 'border-primary-foreground/20 bg-primary-foreground/5 hover:bg-primary-foreground/10' 
          : 'border-border bg-muted/30 hover:bg-muted/50'
        }
      `}
    >
      {/* Image Section */}
      {preview.image && !imageError ? (
        <div className="aspect-video w-full bg-muted/50 relative overflow-hidden">
          <Image
            src={preview.image}
            alt={preview.title || 'Link preview'}
            className="w-full h-full object-cover"
            fill
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      ) : (
        <div className={`aspect-video w-full flex items-center justify-center ${
          isOwn ? 'bg-primary-foreground/10' : 'bg-muted/50'
        }`}>
          <div className="flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full ${
              isOwn ? 'bg-primary-foreground/20' : 'bg-primary/10'
            }`}>
              {imageError && preview.image ? (
                <ImageIcon className={`w-6 h-6 ${
                  isOwn ? 'text-primary-foreground/70' : 'text-primary/70'
                }`} />
              ) : (
                <Globe className={`w-6 h-6 ${
                  isOwn ? 'text-primary-foreground/70' : 'text-primary/70'
                }`} />
              )}
            </div>
            <span className={`text-xs font-medium ${
              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}>
              {preview.domain}
            </span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="p-3">
        {/* Title */}
        {preview.title && (
          <h4 className={`font-semibold text-sm line-clamp-2 mb-1 ${
            isOwn ? 'text-primary-foreground' : 'text-foreground'
          }`}>
            {preview.title}
          </h4>
        )}

        {/* Description */}
        {preview.description && (
          <p className={`text-xs line-clamp-2 mb-2 ${
            isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}>
            {preview.description}
          </p>
        )}

        {/* URL and Domain */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Globe className={`w-3 h-3 flex-shrink-0 ${
              isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground/70'
            }`} />
            <span className={`text-xs truncate ${
              isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
            }`}>
              {preview.domain}
            </span>
          </div>
          <ExternalLink className={`w-3 h-3 flex-shrink-0 ml-2 ${
            isOwn ? 'text-primary-foreground/50' : 'text-muted-foreground/70'
          }`} />
        </div>
      </div>
    </div>
  );
} 