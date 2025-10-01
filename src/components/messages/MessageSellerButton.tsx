'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface MessageSellerButtonProps {
  sellerId: string;
  sellerName: string;
  gemId?: string;
  gemName?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function MessageSellerButton({
  sellerId,
  sellerName,
  gemId,
  gemName,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = ''
}: MessageSellerButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const getButtonClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2'
    };

    const variantClasses = {
      primary: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border border-amber-600 text-amber-600 hover:bg-amber-50 focus:ring-amber-500'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`;
  };

  // Don't show button if user is the seller themselves
  if (user?.id === sellerId) {
    return null;
  }

  // Don't show if user is not authenticated
  if (!isAuthenticated) {
    return (
      <button
        onClick={() => router.push('/signin')}
        className={getButtonClasses()}
        disabled={disabled}
      >
        <MessageIcon />
        Sign in to Message
      </button>
    );
  }

  // Only buyers can message sellers
  if (user?.role !== 'buyer') {
    return null;
  }

  const handleMessageSeller = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    
    try {
      // Navigate to the appropriate chat route based on user role
      const chatPath = user?.role === 'buyer' 
        ? `/account/messages/${sellerId}`
        : `/dashboard/messages/${sellerId}`;
      
      // If there's a gem context, pass it as URL parameters
      if (gemId && gemName) {
        const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const gemLink = `${currentUrl}/gem/${gemId}`;
        const params = new URLSearchParams({
          gemId,
          gemName,
          gemLink
        });
        router.push(`${chatPath}?${params.toString()}`);
      } else {
        // Check if we're already on a messages page with a different user
        const currentPath = window.location.pathname;
        const isOnMessagesPage = currentPath.includes('/messages/') && !currentPath.endsWith('/welcome');
        
        if (isOnMessagesPage && currentPath !== chatPath) {
          // Force navigation to ensure state is properly cleared
          router.replace(chatPath);
        } else {
          router.push(chatPath);
        }
      }
    } catch (error) {
      console.error('Error navigating to chat:', error);
      // Still navigate to chat even if there's an error
      const chatPath = user?.role === 'buyer' 
        ? `/account/messages/${sellerId}`
        : `/dashboard/messages/${sellerId}`;
      router.push(chatPath);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleMessageSeller}
      className={getButtonClasses()}
      disabled={disabled || isLoading}
      title={`Send a message to ${sellerName}`}
    >
      {isLoading ? (
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <MessageIcon />
      )}
      {gemId ? 'Contact Seller' : 'Message Seller'}
    </button>
  );
}

function MessageIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-4.906-1.456L3 21l2.456-5.094A8.959 8.959 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" 
      />
    </svg>
  );
} 