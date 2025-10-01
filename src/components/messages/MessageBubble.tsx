'use client';

import { Clock } from 'lucide-react';
import Image from 'next/image';
import S3Image from '@/components/common/S3Image';
import { MessageContent } from '@/components/messages/MessageContent';
import { LinkPreview } from '@/components/messages/LinkPreview';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    sentAt: string;
    isRead: boolean;
    readAt?: string;
    senderId: {
      _id: string;
      fullName: string;
      avatar?: string;
      role: string;
    };
    receiverId: {
      _id: string;
      fullName: string;
      avatar?: string;
      role: string;
    };
    messageType: 'text' | 'system';
    isSystemMessage: boolean;
    linkPreviews?: Array<{
      url: string;
      title?: string;
      description?: string;
      image?: string;
      domain: string;
    }>;
  };
  isOwn: boolean;
  showSender?: boolean;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
    role: string;
  };
  otherUser?: {
    id: string;
    fullName: string;
    avatar?: string;
    role: string;
  };
  onLinkClick?: (url: string) => void;
}

export function MessageBubble({ 
  message, 
  isOwn, 
  showSender = true, 
  user, 
  otherUser,
  onLinkClick 
}: MessageBubbleProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'seller': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'admin': return 'text-red-700 bg-red-50 border-red-200';
      case 'buyer': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  // Handle system messages
  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md">
          <p className="text-xs text-blue-800 text-center font-medium">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2`}>
      {/* Avatar for received messages (left side) */}
      {!isOwn && (
        <div className="flex-shrink-0">
          {message.senderId?.avatar ? (
            <S3Image
              src={message.senderId.avatar}
              alt={message.senderId.fullName || otherUser?.fullName || 'User'}
              className="w-7 h-7 rounded-lg object-cover"
              width={28}
              height={28}
              fallbackText={(message.senderId?.fullName || otherUser?.fullName || 'U').charAt(0).toUpperCase()}
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xs font-medium">
              {(message.senderId?.fullName || otherUser?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div className={`max-w-sm px-3 py-2 rounded-2xl relative ${
        isOwn 
          ? 'bg-primary text-primary-foreground rounded-br-md ml-auto' 
          : 'bg-card border border-border text-foreground rounded-bl-md'
      }`}>
        {/* Sender name for received messages only */}
        {!isOwn && showSender && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-medium text-muted-foreground">
              {message.senderId?.fullName || otherUser?.fullName || 'User'}
            </span>
            <span className={`px-1 py-0.5 text-xs rounded border ${getRoleColor(message.senderId?.role || otherUser?.role || 'buyer')}`}>
              {message.senderId?.role || otherUser?.role || 'buyer'}
            </span>
          </div>
        )}
        
        {/* Message content with link detection and formatting */}
        <MessageContent 
          content={message.content}
          isOwn={isOwn}
          onLinkClick={onLinkClick}
        />
        
        {/* Link previews if available */}
        {message.linkPreviews && message.linkPreviews.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.linkPreviews.map((preview, index) => (
              <LinkPreview
                key={`${message.id}-preview-${index}`}
                preview={preview}
                isOwn={isOwn}
                onLinkClick={onLinkClick}
              />
            ))}
          </div>
        )}
        
        {/* Time and read status */}
        <div className={`text-xs mt-1 flex items-center gap-1 ${
          isOwn ? 'justify-end text-primary-foreground/70' : 'justify-start text-muted-foreground'
        }`}>
          <Clock className="w-3 h-3" />
          <span>{formatTime(message.sentAt)}</span>
          {isOwn && (
            <span className={message.isRead ? 'text-blue-200' : 'text-primary-foreground/70'}>
              {message.isRead ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>

      {/* Avatar for sent messages (right side) */}
      {isOwn && (
        <div className="flex-shrink-0">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.fullName}
              className="w-7 h-7 rounded-lg object-cover"
              width={28}
              height={28}
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xs font-medium">
              {user?.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 