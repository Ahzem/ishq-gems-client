'use client';

import { ExternalLink } from 'lucide-react';

interface MessageContentProps {
  content: string;
  isOwn: boolean;
  onLinkClick?: (url: string) => void;
}

export function MessageContent({ content, isOwn, onLinkClick }: MessageContentProps) {
  // URL regex pattern to detect links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  const handleLinkClick = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(url);
    } else {
      // Default behavior: open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderContentWithLinks = (text: string) => {
    // Split text by URLs while keeping the URLs
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      // Check if this part is a URL
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            onClick={(e) => handleLinkClick(part, e)}
            className={`inline-flex items-center gap-1 underline hover:no-underline transition-colors ${
              isOwn 
                ? 'text-primary-foreground/90 hover:text-primary-foreground' 
                : 'text-primary hover:text-primary/80'
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="break-all">{part}</span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      }
      
      // Regular text - handle line breaks
      return (
        <span key={index}>
          {part.split('\n').map((line, lineIndex, lines) => (
            <span key={lineIndex}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </span>
          ))}
        </span>
      );
    });
  };

  return (
    <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
      {renderContentWithLinks(content)}
    </div>
  );
} 