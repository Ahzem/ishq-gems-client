'use client';

import { useState, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { OnlineStatusHook } from '@/types';

export function useOnlineStatus(): OnlineStatusHook {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: boolean }>({});
  const [socket, setSocket] = useState<Socket | null>(null);

  // Get online status for multiple users
  const getOnlineStatus = useCallback(async (userIds: string[]) => {
    if (!user || userIds.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/online-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userIds })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOnlineUsers(prev => ({
            ...prev,
            ...data.data.onlineStatus
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch online status:', error);
    }
  }, [user]);

  // Check if a specific user is online
  const isUserOnline = useCallback((userId: string): boolean => {
    return onlineUsers[userId] || false;
  }, [onlineUsers]);

  // Subscribe to real-time status changes
  const subscribeToStatusChanges = useCallback(() => {
    if (!user) return;

    // Use existing socket from real-time messages hook or create new connection
    const globalSocket = (window as Window & { socket?: Socket }).socket;
    if (globalSocket) {
      setSocket(globalSocket);
      
      // Listen for user status changes
      globalSocket.on('user_status_change', (data: {
        userId: string;
        isOnline: boolean;
        userInfo?: { fullName: string; avatar?: string };
        timestamp: string;
      }) => {
        console.log('👤 User status change:', data);
        setOnlineUsers(prev => ({
          ...prev,
          [data.userId]: data.isOnline
        }));
      });
    }
  }, [user]);

  // Unsubscribe from status changes
  const unsubscribeFromStatusChanges = useCallback(() => {
    if (socket) {
      socket.off('user_status_change');
    }
  }, [socket]);

  // Auto-subscribe when user is available
  useEffect(() => {
    if (user) {
      subscribeToStatusChanges();
    }

    return () => {
      unsubscribeFromStatusChanges();
    };
  }, [user, subscribeToStatusChanges, unsubscribeFromStatusChanges]);

  return {
    onlineUsers,
    getOnlineStatus,
    isUserOnline,
    subscribeToStatusChanges,
    unsubscribeFromStatusChanges
  };
} 