'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { MessageCircle } from 'lucide-react';
import  messageService  from '@/services/message.service';

interface MessagesIconProps {
  className?: string;
}

export default function MessagesIcon({ className = '' }: MessagesIconProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchUnreadCount();
    
    // Set up polling for unread count (every 60 seconds to reduce server load)
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount();

      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    } else {
      router.push('/account/messages/welcome');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl hover:bg-secondary/50 transition-all duration-300 group border border-border/20 hover:border-primary/30 min-w-[44px] min-h-[44px] flex items-center justify-center ${className}`}
      title={`Messages${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl sm:rounded-2xl"></span>
      
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-foreground group-hover:text-primary transition-colors duration-300" />
      </div>
      
      {!loading && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      
      {loading && (
        <span className="absolute -top-1 -right-1 bg-muted text-muted-foreground text-xs rounded-full h-3 w-3 flex items-center justify-center animate-pulse">
        </span>
      )}
    </button>
  );
} 