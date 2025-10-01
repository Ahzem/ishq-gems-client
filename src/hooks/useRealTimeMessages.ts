'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { env } from '@/config/environment';
import { waitForSocketIOServer } from '@/utils/socketTest';
import type {
  Message,
  ConnectionError,
  IncomingMessageData,
  TypingIndicator,
  ReadReceipt,
  UseRealTimeMessagesOptions,
  UseRealTimeMessagesReturn
} from '@/types';

// Extended window interface for socket assignment
declare global {
  interface Window {
    socket?: Socket;
  }
}

export function useRealTimeMessages(options: UseRealTimeMessagesOptions = {}): UseRealTimeMessagesReturn {
  const { 
    autoConnect = true, 
    onNewMessage, 
    onTypingIndicator,
    onReadReceipt 
  } = options;
  
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<Map<string, TypingIndicator>>(new Map());
  
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!user || !token || socket?.connected) return;
    // Determine the correct server URL for Socket.IO
    // Remove /api suffix from API_BASE_URL to get the Socket.IO server URL
    let serverUrl = env.API_BASE_URL.replace('/api', '');
    
    // Ensure we're using the correct protocol and host for production
    if (env.isProduction && serverUrl.includes('localhost')) {
      // Fallback to AWS EC2 instance if localhost is detected in production
      serverUrl = 'http://34.229.40.129:5000';
    }
    

    // Test server availability with improved error handling
    try {
      const isServerAvailable = await waitForSocketIOServer(serverUrl, 2, 2000);
      
      if (!isServerAvailable) {
        console.warn('⚠️ Socket.IO server is not available, continuing without real-time features');
        setConnectionError('Real-time features unavailable - server not responding');
        // Don't return here, let the app continue without real-time features
      }
    } catch (error) {
      console.error('❌ Error testing server availability:', error);
      console.warn('⚠️ Continuing without real-time features due to server connectivity issues');
      setConnectionError('Real-time features unavailable - connection failed');
      // Don't return here, let the app continue without real-time features
    }
    
    const newSocket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      autoConnect: false,
      forceNew: false, // Allow connection reuse
      path: '/socket.io',
      timeout: 20000, // 20 second timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      upgrade: true,
      rememberUpgrade: true
    });

    // Add detailed connection logging
    newSocket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      
      // Expose socket globally for other hooks to use
      window.socket = newSocket;
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.connect();

    newSocket.on('connect_error', (error: ConnectionError) => {
      
      
      // Provide more helpful error messages based on the error type
      let userFriendlyError = error.message;
      if (error.message.includes('xhr poll error')) {
        userFriendlyError = 'Cannot connect to real-time server. Please check if the server is running.';
      } else if (error.message.includes('Authentication')) {
        userFriendlyError = 'Authentication failed. Please refresh the page and try again.';
      } else if (error.message.includes('timeout')) {
        userFriendlyError = 'Connection timeout. Please check your internet connection.';
      }
      
      setConnectionError(userFriendlyError);
      setIsConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('🎉 Real-time message service confirmed:', data.message);
    });

    // Handle incoming messages
    newSocket.on('new_message', (messageData: IncomingMessageData) => {
      
      const message: Message = {
        id: messageData.id,
        content: messageData.content,
        sentAt: messageData.sentAt,
        isRead: messageData.isRead,
        readAt: messageData.readAt,
        senderId: {
          _id: messageData.senderId,
          fullName: messageData.senderName,
          avatar: messageData.senderAvatar,
          role: messageData.senderRole
        },
        receiverId: {
          _id: user!.id,
          fullName: user!.fullName,
          avatar: user!.avatar,
          role: user!.role
        },
        messageType: 'text',
        isSystemMessage: false,
        linkPreviews: messageData.linkPreviews || []
      };

      setMessages(prev => [...prev, message]);
      onNewMessage?.(message);

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new window.Notification(`New message from ${messageData.senderName}`, {
          body: messageData.content,
          icon: messageData.senderAvatar || '/images/gem-placeholder.svg',
          tag: messageData.id
        });
      }
    });

    // Handle typing indicators
    newSocket.on('typing_indicator', (data: TypingIndicator) => {
      
      setTypingIndicators(prev => {
        const newMap = new Map(prev);
        
        if (data.isTyping) {
          newMap.set(data.senderId, data);
          
          // Clear any existing timeout for this user
          const existingTimeout = typingTimeoutRef.current.get(data.senderId);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
          }
          
          // Set new timeout to clear typing indicator
          const timeout = setTimeout(() => {
            setTypingIndicators(current => {
              const updated = new Map(current);
              updated.delete(data.senderId);
              return updated;
            });
            typingTimeoutRef.current.delete(data.senderId);
          }, 5000); // Clear after 5 seconds of inactivity
          
          typingTimeoutRef.current.set(data.senderId, timeout);
        } else {
          newMap.delete(data.senderId);
          
          // Clear timeout if exists
          const existingTimeout = typingTimeoutRef.current.get(data.senderId);
          if (existingTimeout) {
            clearTimeout(existingTimeout);
            typingTimeoutRef.current.delete(data.senderId);
          }
        }
        
        return newMap;
      });
      
      onTypingIndicator?.(data);
    });

    // Handle read receipts
    newSocket.on('message_read', (data: ReadReceipt) => {
      
      // Update message read status in local state
      if (data.messageId !== 'batch') {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        ));
      } else {
        // Handle batch read receipts - mark all messages to this reader as read
        setMessages(prev => prev.map(msg => 
          msg.receiverId._id === data.readById
            ? { ...msg, isRead: true, readAt: data.readAt }
            : msg
        ));
      }
      
      onReadReceipt?.(data);
    });

    setSocket(newSocket);
    return newSocket;
  }, [user, token, socket, onNewMessage, onTypingIndicator, onReadReceipt]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      
      // Clear all typing timeouts
      const currentTimeouts = typingTimeoutRef.current;
      currentTimeouts.forEach(timeout => clearTimeout(timeout));
      currentTimeouts.clear();
      setTypingIndicators(new Map());
    }
  }, [socket]);

  // Join a chat room
  const joinChat = useCallback((otherUserId: string) => {
    if (socket && isConnected) {
      socket.emit('join_chat', otherUserId);
    }
  }, [socket, isConnected]);

  // Leave a chat room
  const leaveChat = useCallback((otherUserId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_chat', otherUserId);
    }
  }, [socket, isConnected]);

  // Send typing start indicator
  const sendTypingStart = useCallback((receiverId: string, senderName: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { receiverId, senderName });
    }
  }, [socket, isConnected]);

  // Send typing stop indicator
  const sendTypingStop = useCallback((receiverId: string, senderName: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { receiverId, senderName });
    }
  }, [socket, isConnected]);

  // Clear typing indicator manually
  const clearTypingIndicator = useCallback((senderId: string) => {
    setTypingIndicators(prev => {
      const newMap = new Map(prev);
      newMap.delete(senderId);
      return newMap;
    });
    
    const existingTimeout = typingTimeoutRef.current.get(senderId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      typingTimeoutRef.current.delete(senderId);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user && token && !socket) {
      connect();
    }

    // Capture current ref value at effect setup time
    const currentTimeouts = typingTimeoutRef.current;

    return () => {
      // Cleanup timeouts on unmount using captured reference
      if (currentTimeouts) {
        currentTimeouts.forEach(timeout => clearTimeout(timeout));
        currentTimeouts.clear();
      }
    };
  }, [autoConnect, user, token, socket, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinChat,
    leaveChat,
    sendTypingStart,
    sendTypingStop,
    messages,
    typingIndicators,
    clearTypingIndicator
  };
} 