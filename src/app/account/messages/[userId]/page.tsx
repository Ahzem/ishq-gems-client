'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRealTimeMessages } from '@/hooks/useRealTimeMessages';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { MessageBubble } from '@/components/messages/MessageBubble';
import { MessageInputLinkPreview } from '@/components/messages/MessageInputLinkPreview';
import { processMessageForLinks, detectLinks, type LinkPreview } from '@/utils/linkUtils';
import messageService from '@/services/message.service';
import type { Message, ChatThread, MessageUser } from '@/types';
import { ArrowLeft, Send, Shield, Star, Users, MoreVertical, Search, MessageCircle, Gem, Home, UserX, Flag, Archive, Trash2, Bell, BellOff } from 'lucide-react';
import { environment } from '@/config/environment';

function MessagesContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  
  // Check if this is a welcome screen navigation (no specific user selected)
  const isWelcomeRoute = !userId || userId === 'undefined' || userId === 'welcome' || userId === 'null';

  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [currentLinkPreviews, setCurrentLinkPreviews] = useState<LinkPreview[]>([]);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{
    id: string;
    fullName: string;
    avatar?: string;
    role: string;
  } | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousUserIdRef = useRef<string | null>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Handle URL parameters for gem context
  useEffect(() => {
    const gemId = searchParams.get('gemId');
    const gemName = searchParams.get('gemName');
    const gemLink = searchParams.get('gemLink');
    
    if (gemId && gemName && gemLink) {
      // Pre-populate message input with gem link and context
      const initialMessage = `Hi! I'm interested in this gem: ${gemName}\n\n${gemLink}\n\nCould you please provide more details?`;
      setNewMessage(initialMessage);
      
      // Clear URL parameters after setting the message
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Real-time messaging hook
  const {
    isConnected: socketConnected,
    joinChat,
    leaveChat,
    sendTypingStart,
    sendTypingStop,
    typingIndicators,
    clearTypingIndicator
  } = useRealTimeMessages({
    onNewMessage: (message) => {
      // Add new message to the current conversation if it's from the active chat
      if (!isWelcomeRoute) {
        const messageSenderId = getSenderId(message.senderId);
        
        // Only add message if it's part of current conversation
        if (messageSenderId === userId || messageSenderId === user?.id) {
          setMessages(prev => {
            // Prevent duplicate messages
            const messageExists = prev.some(m => m.id === message.id);
            if (messageExists) return prev;
            
            // Debug log real-time message
            if (environment.isDevelopment) {
              console.log('Real-time message received:', {
                messageId: message.id,
                senderId: message.senderId,
                senderIdType: typeof message.senderId,
                extractedSenderId: messageSenderId,
                fullMessage: JSON.stringify(message)
              });
            }
            
            // Ensure consistent message format for side detection
            const processedMessage: Message = {
              ...message as Message,
              senderId: {
                _id: messageSenderId || '',
                id: messageSenderId || '',
                fullName: message.senderId.fullName,
                avatar: message.senderId.avatar,
                role: message.senderId.role
              }
            };
            
            return [...prev, processedMessage];
          });
          // Use setTimeout to ensure smooth scrolling without blocking render
          setTimeout(scrollToBottom, 50);
        }
      }
      
      // Debounce chat refresh to prevent excessive updates
      setTimeout(() => fetchChats(), 100);
    },
    onTypingIndicator: (indicator) => {
      // Typing indicators are handled by the hook's state
      // Could be used for additional logic like sound notifications
      if (indicator.isTyping && indicator.senderId === userId) {
        console.debug(`${indicator.senderName} is typing...`);
      }
    },
    onReadReceipt: (receipt) => {
      // Update message read status for individual messages
      if (receipt.messageId !== 'batch') {
        setMessages(prev => prev.map(msg => 
          msg.id === receipt.messageId 
            ? { ...msg, isRead: true, readAt: receipt.readAt }
            : msg
        ));
      } else {
        // Handle batch read receipts - mark all messages from this user as read
        setMessages(prev => prev.map(msg => 
          msg.senderId._id === user?.id && msg.receiverId._id === receipt.readById
            ? { ...msg, isRead: true, readAt: receipt.readAt }
            : msg
        ));
      }
    }
  });

  // Online status hook - only get what we need
  const { getOnlineStatus, isUserOnline } = useOnlineStatus();

  // Clear state when userId changes
  useEffect(() => {
    if (previousUserIdRef.current && previousUserIdRef.current !== userId) {
      // Clear all chat-specific state when switching to a different user
      setMessages([]);
      setOtherUser(null);
      setNewMessage('');
      setError(null);
      setCurrentLinkPreviews([]);
      setSending(false);
      setLoading(true); // Set loading to true when switching users
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
    previousUserIdRef.current = userId;
  }, [userId]);

  // Clear typing indicators when switching users
  useEffect(() => {
    if (previousUserIdRef.current && previousUserIdRef.current !== userId && clearTypingIndicator) {
      clearTypingIndicator(previousUserIdRef.current);
    }
  }, [userId, clearTypingIndicator]);

  const markAllAsRead = useCallback(async () => {
    if (isWelcomeRoute) return;
    
    try {
      await messageService.markAllAsRead(userId);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [isWelcomeRoute, userId]);

  const fetchMessages = useCallback(async () => {
    if (isWelcomeRoute) {
      return;
    }
    
    try {
      // Clear any cached messages to get fresh data from server
      messageService.clearCache();
      const response = await messageService.getMessages(userId);
      
      if (response.success && response.data) {
        // Debug log to see what we're getting from the API
        if (environment.isDevelopment) {
          console.log('API Response messages:', {
            totalMessages: response.data.messages.length,
            firstMessage: response.data.messages[0],
            firstMessageSenderId: response.data.messages[0]?.senderId,
            firstMessageSenderIdType: typeof response.data.messages[0]?.senderId,
            firstMessageStringified: JSON.stringify(response.data.messages[0])
          });
        }
        
        // Trust server payload (already includes isOwn); minimal normalization only
        setMessages(response.data.messages as unknown as Message[]);
        
        // Mark all messages as read
        markAllAsRead();
      } else {
        if (response.error === 'FORBIDDEN') {
          throw new Error('You are not allowed to message this user');
        }
        throw new Error(response.message || 'Failed to fetch messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [isWelcomeRoute, userId, markAllAsRead]);

  const fetchChats = useCallback(async () => {
    try {
      const response = await messageService.getChats();
      
      if (response.success && response.data) {
        let chatsData = response.data.chats;
        
        // If there's an active userId (not welcome route), move that chat to the top
        if (!isWelcomeRoute && userId) {
          const activeChat = chatsData.find(chat => chat.otherUser.id === userId);
          if (activeChat) {
            // Remove the active chat from its current position
            chatsData = chatsData.filter(chat => chat.otherUser.id !== userId);
            // Add it to the beginning of the array
            chatsData.unshift(activeChat);
          }
        }
        
        setChats(chatsData);
        
        // Fetch online status for all users in chats
        const userIds = chatsData.map(chat => chat.otherUser.id).filter(Boolean);
        if (userIds.length > 0) {
          getOnlineStatus(userIds);
        }
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    }
  }, [isWelcomeRoute, userId, getOnlineStatus]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await messageService.getUnreadCount();
      
      if (response.success && response.data) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Separate useEffect to set other user info when chats are loaded
  useEffect(() => {
    if (!isWelcomeRoute && userId && !otherUser) {
      // First try to find the other user from chats list
      if (chats.length > 0) {
        const existingChat = chats.find(chat => chat.otherUser?.id === userId);
        if (existingChat) {
          setOtherUser({
            id: existingChat.otherUser.id,
            fullName: existingChat.otherUser.fullName,
            avatar: existingChat.otherUser.avatar,
            role: existingChat.otherUser.role
          });
          return;
        }
      }
      
      // Second: Extract from messages if they're available and have sender info
      if (messages.length > 0) {
        const messageWithSender = messages.find(msg => {
          const senderId = getSenderId(msg.senderId);
          return senderId === userId && msg.senderId?.fullName;
        });
        
        if (messageWithSender && messageWithSender.senderId) {
          setOtherUser({
            id: messageWithSender.senderId._id,
            fullName: messageWithSender.senderId.fullName,
            avatar: messageWithSender.senderId.avatar,
            role: messageWithSender.senderId.role
          });
          return;
        }
        
        // Also check receiverId for cases where current user sent messages
        const messageWithReceiver = messages.find(msg => {
          const receiverId = msg.receiverId?._id;
          return receiverId === userId && msg.receiverId?.fullName;
        });
        
        if (messageWithReceiver && messageWithReceiver.receiverId) {
          setOtherUser({
            id: messageWithReceiver.receiverId._id,
            fullName: messageWithReceiver.receiverId.fullName,
            avatar: messageWithReceiver.receiverId.avatar,
            role: messageWithReceiver.receiverId.role
          });
          return;
        }
      }
      
      // Fallback: Fetch user info directly if not found in chats or messages
      const fetchUserInfo = async () => {
        try {
          const response = await messageService.getUserById(userId);
          
          if (response.success && response.data?.user) {
            setOtherUser({
              id: response.data.user._id || response.data.user.id || '',
              fullName: response.data.user.fullName,
              avatar: response.data.user.avatar,
              role: response.data.user.role
            });
          }
        } catch (err) {
          console.error('Failed to fetch user info:', err);
        }
      };

      fetchUserInfo();
    }
  }, [chats, userId, isWelcomeRoute, otherUser, messages, user?.id]);

  // Split the main useEffect to prevent infinite re-renders
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }
    
    // Always fetch chats
    fetchChats();
    fetchUnreadCount();
    
    // Only fetch messages if userId is provided and it's not a welcome route
    if (!isWelcomeRoute) {
      setLoading(true); // Ensure loading is true before fetching
      fetchMessages();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, userId, isWelcomeRoute, fetchChats, fetchMessages, fetchUnreadCount, router]);

  // Separate useEffect for socket connections
  useEffect(() => {
    if (!isWelcomeRoute && socketConnected && userId) {
      joinChat(userId);
      
      return () => {
        leaveChat(userId);
      };
    }
  }, [socketConnected, userId, isWelcomeRoute, joinChat, leaveChat]);

  // Separate useEffect for periodic refresh
  useEffect(() => {
    // Setup periodic refresh for chats and unread count (less frequent since messages are real-time)
    const interval = setInterval(() => {
      fetchChats();
      fetchUnreadCount();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchChats, fetchUnreadCount]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  // Handle clicking outside more menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Helper function to safely get ID from senderId object - enhanced for consistency
  const getSenderId = (senderId: string | MessageUser | unknown): string | undefined => {
    if (!senderId) return undefined;
    
    // Debug logging to understand the data structure
    if (environment.isDevelopment) {
      console.log('getSenderId input:', {
        senderId,
        type: typeof senderId,
        isArray: Array.isArray(senderId),
        keys: typeof senderId === 'object' ? Object.keys(senderId) : [],
        stringified: JSON.stringify(senderId)
      });
    }
    
    // Handle string format (direct ID) - this was the corrupted case
    if (typeof senderId === 'string') {
      // If it's the corrupted "[object Object]" string, return undefined to trigger fallback
      if (senderId === '[object Object]') {
        console.warn('Detected corrupted senderId string: "[object Object]"');
        return undefined;
      }
      return senderId;
    }
    
    // Handle proper object format - prioritize _id then id
    if (typeof senderId === 'object' && !Array.isArray(senderId)) {
      const obj = senderId as Record<string, unknown>;
      
      // Try _id first (MongoDB format) - handle both string and ObjectId
      if (obj._id) {
        const id = obj._id;
        return typeof id === 'string' ? id : String(id);
      }
      
      // Try id second (standard format)
      if (obj.id) {
        const id = obj.id;
        return typeof id === 'string' ? id : String(id);
      }
    }
    
    // Handle corrupted case where senderId might be a string converted to array-like object
    if (typeof senderId === 'object' && Object.keys(senderId).every(key => !isNaN(Number(key)))) {
      // This looks like a string that was converted to an array-like object
      // Try to reconstruct the string
      const reconstructed = Object.values(senderId).join('');
      if (environment.isDevelopment) {
        console.log('Reconstructed string from array-like object:', reconstructed);
      }
      return reconstructed.length === 24 ? reconstructed : undefined; // MongoDB ObjectId is 24 chars
    }
    
    return undefined;
  };

  // Super fast message side detection - determines if message is from current user
  const isMessageFromCurrentUser = (message: Message): boolean => {
    if (!user) return false;

    // Prefer server-computed isOwn when present
    if (typeof message.isOwn === 'boolean') {
      return message.isOwn;
    }

    // Get sender ID from the message - handle both string and object formats
    const senderId = getSenderId(message.senderId);
    
    // Primary check: Compare sender ID with current user ID
    if (senderId && senderId === user.id) {
      return true; // Message is from current user (right side)
    }
    
    // Secondary check: If sender ID matches the other user we're chatting with
    if (senderId && senderId === userId) {
      return false; // Message is from other user (left side)
    }
    
    // If getSenderId failed, try direct object access
    if (!senderId && message.senderId && typeof message.senderId === 'object') {
      // Try different possible ID field names
      const possibleIds = [
        message.senderId._id,
        message.senderId.id
      ];
      
      for (const possibleId of possibleIds) {
        if (possibleId) {
          const idStr = typeof possibleId === 'string' ? possibleId : String(possibleId);
          if (idStr === user.id) return true;
          if (idStr === userId) return false;
        }
      }
    }
    
    // Final fallback: check by full name (least reliable)
    if (message.senderId && typeof message.senderId === 'object' && 'fullName' in message.senderId) {
      if (message.senderId.fullName === user.fullName) return true;
      if (otherUser && message.senderId.fullName === otherUser.fullName) return false;
    }
    
    // Ultimate fallback: assume it's not from current user
    if (environment.isDevelopment) {
      console.warn('Could not determine message ownership:', {
        messageId: message.id,
        senderId,
        currentUserId: user.id,
        otherUserId: userId,
        senderObject: message.senderId,
        senderObjectType: typeof message.senderId,
        senderObjectKeys: message.senderId ? Object.keys(message.senderId) : [],
        senderObjectStringified: JSON.stringify(message.senderId),
        rawMessage: JSON.stringify(message)
      });
    }
    return false;
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || isWelcomeRoute) return;

    setSending(true);
    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Stop typing indicator
    if (socketConnected && user) {
      sendTypingStop(userId, user.fullName);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }

    try {
      // Use current link previews if available, otherwise check for links in the message
      let processedData = {
        content: messageContent,
        linkPreviews: currentLinkPreviews
      };

      if (currentLinkPreviews.length === 0) {
        const hasLinks = detectLinks(messageContent).length > 0;
        if (hasLinks) {
          try {
            processedData = await processMessageForLinks(messageContent);
          } catch (linkError) {
            console.warn('Failed to process links:', linkError);
            // Continue with original message if link processing fails
          }
        }
      }

      const response = await messageService.sendMessage({
        receiverId: userId,
        content: processedData.content,
        linkPreviews: processedData.linkPreviews
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to send message');
      }

      if (response.success && response.data) {
        // Add the sent message to local state immediately with proper sender/receiver info
        const sentMessage = response.data;
        
        // Ensure proper message structure for consistent side detection
        const transformedMessage: Message = {
          id: sentMessage._id,
          content: sentMessage.content,
          sentAt: sentMessage.sentAt,
          isRead: sentMessage.isRead || false,
          readAt: sentMessage.readAt,
          // Critical: Ensure sender is current user with consistent ID format
          senderId: {
            _id: user!.id, // Use user.id consistently
            id: user!.id,  // Also provide id field for compatibility
            fullName: user!.fullName,
            avatar: user!.avatar,
            role: user!.role
          },
          // Ensure receiver is the other user with consistent ID format  
          receiverId: {
            _id: userId,
            id: userId, // Also provide id field for compatibility
            fullName: otherUser?.fullName || 'User',
            avatar: otherUser?.avatar,
            role: otherUser?.role || 'buyer'
          },
          messageType: 'text',
          isSystemMessage: false,
          linkPreviews: processedData.linkPreviews || []
        };
        
        // Debug log to verify message structure (development only)
        if (environment.isDevelopment) {
          console.log('Adding sent message to state:', {
            messageId: transformedMessage.id,
            senderId: transformedMessage.senderId._id,
            currentUserId: user!.id,
            shouldBeOnRight: transformedMessage.senderId._id === user!.id
          });
        }
        
        setMessages(prev => [...prev, transformedMessage]);
        
        scrollToBottom();
      }

      // Clear success state
      setError(null);
      setRetryMessage(null);
      setCurrentLinkPreviews([]);

      // Refresh sidebar to update last message
      await fetchChats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      
      // Store message for retry and restore in input
      setRetryMessage(messageContent);
      setNewMessage(messageContent);
      
      // Show user-friendly error notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new window.Notification('Message Failed', {
          body: 'Your message could not be sent. Please try again.',
          icon: '/images/error-icon.png'
        });
      }
      
      // Log error for debugging (development only)
      if (environment.isDevelopment) {
        console.error('Message send error:', {
          error: errorMessage,
          userId,
          messageLength: messageContent.length,
          timestamp: new Date().toISOString()
        });
      }
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  const formatSidebarTime = (dateString: string) => {
    if (!dateString) return '';
    
    try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) {
        return 'now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes}m`;
      } else if (diffHours < 24) {
        return `${diffHours}h`;
    } else if (diffDays === 1) {
        return '1d';
    } else if (diffDays < 7) {
        return `${diffDays}d`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      }
    } catch (error) {
      console.error('Error formatting sidebar time:', error);
      return '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value || '';
    setNewMessage(value);
    
    // Handle typing indicators
    if (!isWelcomeRoute && socketConnected && user) {
      if (value.length > 0) {
        // User is typing
        sendTypingStart(userId, user.fullName);
        
        // Clear existing timeout and set new one
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Stop typing indicator after 3 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingStop(userId, user.fullName);
        }, 3000);
      } else {
        // User cleared input, stop typing
        sendTypingStop(userId, user.fullName);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'seller': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'admin': return 'text-red-700 bg-red-50 border-red-200';
      case 'buyer': return 'text-blue-700 bg-blue-50 border-blue-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'seller': return <Star className="w-3 h-3" />;
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'buyer': return <Users className="w-3 h-3" />;
      default: return null;
    }
  };

  const handleChatClick = (chatUserId: string) => {
    router.push(`/account/messages/${chatUserId}`);
  };

  const handleBack = () => {
    router.back();
  };

  // More menu handlers
  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    // TODO: Implement API call to update notification preferences
    console.log(`Notifications ${!notifications ? 'enabled' : 'disabled'} for user ${userId}`);
  };

  const handleArchiveConversation = () => {
    setIsArchived(!isArchived);
    // TODO: Implement API call to archive/unarchive conversation
    console.log(`Conversation ${!isArchived ? 'archived' : 'unarchived'} with user ${userId}`);
    setShowMoreMenu(false);
  };

  const handleBlockUser = () => {
    const confirmed = window.confirm(`Are you sure you want to block ${otherUser?.fullName}? You will no longer receive messages from them.`);
    if (confirmed) {
      // TODO: Implement API call to block user
      console.log(`Blocked user ${userId}`);
      router.push('/account/messages/welcome');
    }
    setShowMoreMenu(false);
  };

  const handleReportUser = () => {
    const reason = window.prompt('Please provide a reason for reporting this user:');
    if (reason && reason.trim()) {
      // TODO: Implement API call to report user
      console.log(`Reported user ${userId} for: ${reason}`);
      alert('User has been reported. Our team will review this shortly.');
    }
    setShowMoreMenu(false);
  };

  const handleDeleteConversation = () => {
    const confirmed = window.confirm(`Are you sure you want to delete this conversation with ${otherUser?.fullName}? This action cannot be undone.`);
    if (confirmed) {
      // TODO: Implement API call to delete conversation
      console.log(`Deleted conversation with user ${userId}`);
      router.push('/account/messages/welcome');
    }
    setShowMoreMenu(false);
  };

  const handleClearHistory = () => {
    const confirmed = window.confirm(`Are you sure you want to clear all message history with ${otherUser?.fullName}? This action cannot be undone.`);
    if (confirmed) {
      setMessages([]);
      // TODO: Implement API call to clear message history
      console.log(`Cleared message history with user ${userId}`);
    }
    setShowMoreMenu(false);
  };

  const filteredChats = chats.filter(chat =>
    chat.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = new Date(message.sentAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  const totalConversations = chats.length;
  const isShowingChat = !isWelcomeRoute && otherUser;

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Top Header with Back Button, Home Button, and User Profile */}
        <div className="bg-card border-b border-border p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Back to Home"
              >
                <Home className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="h-6 w-px bg-border mx-1"></div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground">Messages</h1>
              </div>
            </div>
            
            {/* User Profile Display */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <div className="relative">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.fullName}
                      width={32}
                      height={32}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-medium text-xs sm:text-sm border-2 border-border">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getRoleColor(user.role).split(' ')[0] === 'text-amber-700' ? 'bg-amber-500' : user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat List Sidebar - Loading */}
          <div className="w-full sm:w-80 lg:w-96 bg-card border-r border-border flex flex-col">
            <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value=""
                  onChange={() => {}}
                  className="w-full pl-10 pr-4 py-2 sm:py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
                  disabled
                />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">Loading chats...</p>
              </div>
            </div>
          </div>

          {/* Main Loading Area - Hidden on mobile when showing sidebar */}
          <div className="hidden sm:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MessageCircle className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Top Header with Back Button, Home Button, and User Profile */}
        <div className="bg-card border-b border-border p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-secondary rounded-lg transition-colors"
                title="Back to Home"
              >
                <Home className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="h-6 w-px bg-border mx-1"></div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground">Messages</h1>
              </div>
            </div>
            
            {/* User Profile Display */}
            {user && (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                </div>
                <div className="relative">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={user.fullName}
                      width={32}
                      height={32}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-medium text-xs sm:text-sm border-2 border-border">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getRoleColor(user.role).split(' ')[0] === 'text-amber-700' ? 'bg-amber-500' : user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Chat List Sidebar - Error state but show available chats */}
          <div className="w-full sm:w-80 lg:w-96 bg-card border-r border-border flex flex-col">
          <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value || '')}
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-4 text-center">
                <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {filteredChats.map((chat, index) => (
                  <div
                    key={chat.otherUser?.id || `chat-${index}`}
                    className={`p-3 sm:p-4 hover:bg-muted/30 cursor-pointer transition-all duration-200 group ${
                      !isWelcomeRoute && chat.otherUser?.id === userId ? 'bg-primary/5 border-r-2 border-primary' : ''
                    }`}
                    onClick={() => chat.otherUser?.id && handleChatClick(chat.otherUser.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        {chat.otherUser.avatar ? (
                          <Image
                            src={chat.otherUser.avatar}
                            alt={chat.otherUser.fullName}
                            width={40}
                            height={40}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all duration-200"
                          />
                        ) : (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-medium text-xs sm:text-sm ring-2 ring-border group-hover:ring-primary/30 transition-all duration-200">
                            {chat.otherUser.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </div>
                        )}
                        {isUserOnline(chat.otherUser.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate text-sm group-hover:text-primary transition-colors">
                              {chat.otherUser.fullName}
                            </h4>
                            <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 flex-shrink-0 ${getRoleColor(chat.otherUser.role)}`}>
                              {getRoleIcon(chat.otherUser.role)}
                              <span className="hidden sm:inline">{chat.otherUser.role.charAt(0).toUpperCase() + chat.otherUser.role.slice(1)}</span>
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatSidebarTime(chat.lastMessage.sentAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSenderId(chat.lastMessage.senderId) === user?.id && (
                            <div className="text-primary flex-shrink-0">
                              <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                          <p className={`text-xs sm:text-sm truncate ${
                            chat.unreadCount > 0 && getSenderId(chat.lastMessage.senderId) !== user?.id
                              ? 'text-foreground font-medium' 
                              : 'text-muted-foreground'
                          }`}>
                            {chat.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Main Error Area - Hidden on mobile when showing sidebar */}
          <div className="hidden sm:flex flex-1 items-center justify-center p-4">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl font-bold">!</span>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Unable to load conversation</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={() => router.push('/account/messages/welcome')}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm"
                >
                  Back to Messages
                </button>
                <button
                  onClick={fetchMessages}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Header with Back Button, Home Button, and User Profile */}
      <div className="bg-card border-b border-border p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Back to Home"
            >
              <Home className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="h-6 w-px bg-border mx-1"></div>
            <div className="flex items-center gap-2 flex-1">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground">
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {totalConversations} conversation{totalConversations !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
          </div>
          
          {/* User Profile Display */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{user.fullName}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <div className="relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.fullName}
                    width={32}
                    height={32}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-border"
                  />
                ) : (
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-medium text-xs sm:text-sm border-2 border-border">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${getRoleColor(user.role).split(' ')[0] === 'text-amber-700' ? 'bg-amber-500' : user.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar - Responsive */}
        <div className={`${isShowingChat ? 'hidden sm:flex' : 'flex'} w-full sm:w-80 lg:w-96 bg-card border-r border-border flex-col`}>
          {/* Search Header */}
          <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value || '')}
                className="w-full pl-10 pr-4 py-2 sm:py-3 bg-muted/50 border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all duration-200 text-sm"
              />
            </div>
          </div>

          {/* Scrollable Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Start browsing gems to connect with sellers'
                  }
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => router.push('/explore')}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm"
                  >
                    Explore Gems
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {filteredChats.map((chat, index) => (
                  <div
                    key={chat.otherUser?.id || `chat-${index}`}
                    className={`p-3 sm:p-4 hover:bg-muted/30 cursor-pointer transition-all duration-200 group ${
                      !isWelcomeRoute && chat.otherUser?.id === userId ? 'bg-primary/5 border-r-2 border-primary' : ''
                    }`}
                    onClick={() => chat.otherUser?.id && handleChatClick(chat.otherUser.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        {chat.otherUser.avatar ? (
                          <Image
                            src={chat.otherUser.avatar}
                            alt={chat.otherUser.fullName}
                            width={40}
                            height={40}
                            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all duration-200"
                          />
                        ) : (
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-medium text-xs sm:text-sm ring-2 ring-border group-hover:ring-primary/30 transition-all duration-200">
                            {chat.otherUser.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {chat.unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                          </div>
                        )}
                        {/* Online indicator */}
                        {isUserOnline(chat.otherUser.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate text-sm group-hover:text-primary transition-colors">
                              {chat.otherUser.fullName}
                            </h3>
                            <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full border flex items-center gap-1 flex-shrink-0 ${getRoleColor(chat.otherUser.role)}`}>
                              {getRoleIcon(chat.otherUser.role)}
                              <span className="hidden sm:inline">{chat.otherUser.role.charAt(0).toUpperCase() + chat.otherUser.role.slice(1)}</span>
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                            {formatSidebarTime(chat.lastMessage.sentAt)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getSenderId(chat.lastMessage.senderId) === user?.id && (
                            <div className="text-primary flex-shrink-0">
                              <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          )}
                          <p className={`text-xs sm:text-sm truncate ${
                            chat.unreadCount > 0 && getSenderId(chat.lastMessage.senderId) !== user?.id
                              ? 'text-foreground font-medium' 
                              : 'text-muted-foreground'
                          }`}>
                            {chat.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area - Responsive */}
        <div className={`${isShowingChat ? 'flex' : 'hidden sm:flex'} flex-1 flex-col`}>
          {isShowingChat ? (
              <>
                {/* Chat Header - Mobile Back Button */}
                <div className="bg-muted/20 border-b border-border p-3 sm:p-4 flex-shrink-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {otherUser?.avatar ? (
                          <Image
                            src={otherUser.avatar}
                            alt={otherUser.fullName}
                            width={36}
                            height={36}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-medium text-sm">
                            {otherUser?.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {otherUser && isUserOnline(otherUser.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border border-card"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">{otherUser?.fullName}</h2>
                          <span className={`px-1.5 py-0.5 text-xs font-medium rounded-md border flex items-center gap-1 flex-shrink-0 ${getRoleColor(otherUser?.role || 'buyer')}`}>
                            {getRoleIcon(otherUser?.role || 'buyer')}
                            <span className="hidden sm:inline">{(otherUser?.role || 'buyer').charAt(0).toUpperCase() + (otherUser?.role || 'buyer').slice(1)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {otherUser && isUserOnline(otherUser.id) ? (
                            <p className="text-xs sm:text-sm text-green-600 font-medium">Online</p>
                          ) : (
                            <p className="text-xs sm:text-sm text-gray-500 font-medium">Offline</p>
                          )}
                          {socketConnected ? (
                            <span className="text-xs text-green-600 font-medium hidden sm:inline">• Real-time</span>
                          ) : (
                            <span className="text-xs text-orange-600 font-medium hidden sm:inline">• Connecting...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* More Actions Dropdown */}
                    <div className="relative" ref={moreMenuRef}>
                      <button 
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                        className="p-1.5 sm:p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all duration-200"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                      
                      {showMoreMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                          <div className="py-2">
                            {/* Notification Toggle */}
                            <button
                              onClick={handleToggleNotifications}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                            >
                              {notifications ? (
                                <BellOff className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Bell className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span>{notifications ? 'Mute notifications' : 'Enable notifications'}</span>
                            </button>
                            
                            {/* Archive Conversation */}
                            <button
                              onClick={handleArchiveConversation}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                            >
                              <Archive className="w-4 h-4 text-muted-foreground" />
                              <span>{isArchived ? 'Unarchive conversation' : 'Archive conversation'}</span>
                            </button>
                            
                            {/* Clear History */}
                            <button
                              onClick={handleClearHistory}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                              <span>Clear message history</span>
                            </button>
                            
                            <div className="border-t border-border my-2"></div>
                            
                            {/* Report User */}
                            <button
                              onClick={handleReportUser}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3 text-orange-600"
                            >
                              <Flag className="w-4 h-4" />
                              <span>Report user</span>
                            </button>
                            
                            {/* Block User */}
                            <button
                              onClick={handleBlockUser}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3 text-red-600"
                            >
                              <UserX className="w-4 h-4" />
                              <span>Block user</span>
                            </button>
                            
                            {/* Delete Conversation */}
                            <button
                              onClick={handleDeleteConversation}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary transition-colors flex items-center gap-3 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete conversation</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Scrollable Messages Area */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-muted/5">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                          <Send className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Start the conversation</h3>
                        <p className="text-muted-foreground">Send a message to begin your secure conversation.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* System warning message */}
                      <div className="flex justify-center">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 max-w-md">
                          <p className="text-xs text-amber-800 text-center font-medium">
                            🔒 This conversation is monitored for safety. Do not share personal contact information.
                          </p>
                        </div>
                      </div>

                      {Object.entries(groupedMessages).map(([date, dayMessages], dateIndex) => (
                        <div key={`date-${date}-${dateIndex}`} className="space-y-4">
                          {/* Date separator */}
                          <div className="flex justify-center">
                            <span className="bg-card border border-border px-4 py-1 rounded-full text-xs text-muted-foreground font-medium">
                              {formatDate(date)}
                            </span>
                          </div>

                          {/* Messages for this date */}
                          {dayMessages.map((message, messageIndex) => {
                            // Super fast detection: Use improved detection method
                            const isOwn = isMessageFromCurrentUser(message);
                            
                            // Debug logging for message side detection
                            if (environment.isDevelopment) {
                              const extractedSenderId = getSenderId(message.senderId);
                              console.log('Message side detection:', {
                                messageId: message.id,
                                senderId: extractedSenderId,
                                senderIdRaw: message.senderId,
                                currentUserId: user?.id,
                                otherUserId: userId,
                                isOwn,
                                comparison: {
                                  senderEqualsCurrentUser: extractedSenderId === user?.id,
                                  senderEqualsOtherUser: extractedSenderId === userId
                                }
                              });
                            }
                            
                            if (message.isSystemMessage) {
                              return (
                                <div key={`system-${message.id}-${messageIndex}`} className="flex justify-center">
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 max-w-md">
                                    <p className="text-xs text-blue-800 text-center font-medium">{message.content}</p>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <MessageBubble
                                key={`message-${message.id}-${messageIndex}`}
                                message={message}
                                isOwn={isOwn}
                                showSender={true}
                                user={user ? {
                                  id: user.id,
                                  fullName: user.fullName,
                                  avatar: user.avatar,
                                  role: user.role
                                } : undefined}
                                otherUser={otherUser}
                              />
                            );
                          })}
                        </div>
                      ))}
                      
                      {/* Real-time typing indicators */}
                      {!isWelcomeRoute && Array.from(typingIndicators.values()).map((indicator, index) => {
                        // Only show typing indicators for the current chat - person we're chatting with is typing
                        if (indicator.senderId === userId && indicator.isTyping) {
                          return (
                            <div key={`typing-${indicator.senderId}-${index}`} className="flex justify-start gap-2">
                              <div className="flex-shrink-0">
                                {otherUser?.avatar ? (
                                  <Image
                                    src={otherUser.avatar}
                                    alt={otherUser.fullName}
                                    width={28}
                                    height={28}
                                    className="w-7 h-7 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-xs font-medium">
                                    {otherUser?.fullName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-3 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{otherUser?.fullName || indicator.senderName} is typing...</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input at Bottom */}
                <div className="bg-card border-t border-border p-3 sm:p-4 flex-shrink-0">
                  <div className="flex items-end gap-2 sm:gap-3">
                    <div className="flex-1 relative">
                      {/* Link Preview Popup */}
                      <MessageInputLinkPreview
                        message={newMessage}
                        onPreviewReady={setCurrentLinkPreviews}
                        className="max-w-md"
                      />
                      
                      <textarea
                        ref={textareaRef}
                        value={newMessage || ''}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full px-3 py-2 sm:px-4 sm:py-2 bg-muted/50 border border-border rounded-lg resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-sm sm:text-base"
                        style={{ minHeight: '40px', maxHeight: '120px' }}
                        disabled={sending}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className={`p-2.5 sm:p-3 rounded-lg transition-all duration-200 flex-shrink-0 ${
                        newMessage.trim() && !sending
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105' 
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {sending ? (
                        <div className="w-4 h-4 sm:w-5 sm:h-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      ) : (
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Character count, hints, and retry button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-2 sm:gap-0 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
                      <span className="sm:hidden">Enter to send, Shift+Enter for new line</span>
                      {error && retryMessage && (
                        <button
                          onClick={() => {
                            setError(null);
                            setRetryMessage(null);
                            sendMessage();
                          }}
                          className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                        >
                          Retry Send
                        </button>
                      )}
                    </div>
                    <span className={newMessage.length > 1800 ? 'text-red-500 font-medium' : ''}>
                      {newMessage.length}/2000
                    </span>
                  </div>
                  
                  {/* Error message display */}
                  {error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-700">{error}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Welcome Area - No Chat Selected - Hidden on mobile */
              <div className="flex-1 flex items-center justify-center bg-muted/5 p-4">
                <div className="text-center max-w-md mx-auto">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-3 sm:mb-4">
                    Welcome to Ishq Gems Messages
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
                    Select a conversation from the sidebar to start chatting with verified sellers. 
                    All conversations are monitored for your safety and security.
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                      <span>End-to-end encrypted messaging</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 flex-shrink-0" />
                      <span>Verified seller interactions only</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <span>Secure gemstone transactions</span>
                    </div>
                  </div>
                  
                  {filteredChats.length === 0 && (
                    <div className="mt-6 sm:mt-8">
                      <button
                        onClick={() => router.push('/explore')}
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 sm:px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base"
                      >
                        Start Exploring Gems
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col h-screen bg-background">
        {/* Top Header */}
        <div className="bg-card border-b border-border p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="p-2 rounded-lg bg-secondary">
                <Home className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="h-6 w-px bg-border mx-1"></div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h1 className="text-lg sm:text-xl font-serif font-bold text-foreground">Messages</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-full sm:w-80 lg:w-96 bg-card border-r border-border flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-xs text-muted-foreground">Loading chats...</p>
            </div>
          </div>
          <div className="hidden sm:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MessageCircle className="w-6 h-6 text-primary animate-pulse" />
              </div>
              <p className="text-muted-foreground">Loading conversations...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
} 