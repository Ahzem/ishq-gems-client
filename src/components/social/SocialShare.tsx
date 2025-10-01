/**
 * Social sharing component with optimized sharing URLs
 */

'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, MessageSquare, Link } from 'lucide-react'

interface SocialShareProps {
  title: string
  description: string
  url: string
  image?: string
  className?: string
}

const SHARE_PLATFORMS = {
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    url: (props: SocialShareProps) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    url: (props: SocialShareProps) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.title)}&url=${encodeURIComponent(props.url)}`
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: MessageSquare,
    url: (props: SocialShareProps) => 
      `https://wa.me/?text=${encodeURIComponent(`${props.title} - ${props.url}`)}`
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Share2,
    url: (props: SocialShareProps) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(props.url)}`
  }
}

export default function SocialShare({ title, description, url, image, className = '' }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const openShare = (platform: keyof typeof SHARE_PLATFORMS) => {
    const shareUrl = SHARE_PLATFORMS[platform].url({ title, description, url, image })
    window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
    setShowDropdown(false)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        })
      } catch (err) {
        console.error('Native sharing failed:', err)
        // Only show dropdown if the error wasn't due to user cancellation
        if (err instanceof Error && err.name !== 'AbortError') {
          setShowDropdown(!showDropdown)
        }
      }
    } else {
      setShowDropdown(!showDropdown)
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={handleNativeShare}
        className="p-1.5 sm:p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 group"
        title="Share this gem"
      >
        <Share2 className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg z-50 p-2 max-w-[calc(100vw-2rem)] sm:max-w-none">
            <div className="text-sm font-medium text-foreground mb-3 px-2">Share this gem</div>
            
            {/* Social platforms */}
            <div className="space-y-1 mb-3">
              {Object.entries(SHARE_PLATFORMS).map(([key, platform]) => {
                const IconComponent = platform.icon
                return (
                  <button
                    key={key}
                    onClick={() => openShare(key as keyof typeof SHARE_PLATFORMS)}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                  >
                    <IconComponent className="w-4 h-4" />
                    {platform.name}
                  </button>
                )
              })}
            </div>

            {/* Copy link */}
            <div className="border-t border-border pt-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              >
                <Link className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
} 