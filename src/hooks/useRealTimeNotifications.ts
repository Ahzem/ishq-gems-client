'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { env } from '@/config/environment'
import type { 
  Notification,
  UseRealTimeNotificationsOptions,
  UseRealTimeNotificationsReturn,
  NotificationBidUpdate,
  SystemMessage
} from '@/types'

export function useRealTimeNotifications(options: UseRealTimeNotificationsOptions = {}): UseRealTimeNotificationsReturn {
  const { autoConnect = true, enableBidUpdates = true, gemIds = [] } = options
  const { user, token } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [bidUpdates, setBidUpdates] = useState<NotificationBidUpdate[]>([])
  const [systemMessages, setSystemMessages] = useState<SystemMessage[]>([])
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user || !token || socket?.connected) return

    console.log('🔗 Connecting to real-time notifications...')
    
    // Use the legacy API URL (without /api suffix) for Socket.IO
    const serverUrl = env.API_URL;
    
    const newSocket = io(serverUrl, {
      auth: {
        token: token
      },
      transports: ['websocket'],
      autoConnect: false
    })

    newSocket.connect()

    newSocket.on('connect', () => {
      console.log('✅ Connected to real-time notifications')
      setIsConnected(true)
      setConnectionError(null)
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from real-time notifications')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ Real-time connection error:', error)
      setConnectionError(error.message)
      setIsConnected(false)
    })

    newSocket.on('connected', (data) => {
      console.log('🎉 Real-time service confirmed:', data.message)
    })

    // Handle incoming notifications
    newSocket.on('notification', (notification: Notification) => {
      console.log('📬 Real-time notification received:', notification.title)
      setNotifications(prev => [notification, ...prev.slice(0, 49)]) // Keep last 50
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new window.Notification(notification.title, {
          body: notification.message,
          icon: '/images/gem-placeholder.svg',
          tag: notification._id
        })
      }
    })

    // Handle bid updates
    if (enableBidUpdates) {
      newSocket.on('bid_update', (bidUpdate: NotificationBidUpdate) => {
        console.log('🔨 Bid update received:', bidUpdate)
        setBidUpdates(prev => [bidUpdate, ...prev.slice(0, 19)]) // Keep last 20
      })

      newSocket.on('auction_ending', (data: { gemId: string; gemTitle: string; timeLeft: string }) => {
        console.log('⏰ Auction ending soon:', data.gemTitle)
        setBidUpdates(prev => [{
          type: 'auction_ended',
          gemId: data.gemId,
          gemTitle: data.gemTitle,
          timeLeft: data.timeLeft,
          timestamp: new Date().toISOString()
        }, ...prev.slice(0, 19)])
      })
    }

    // Handle system messages
    newSocket.on('system_message', (message: SystemMessage) => {
      console.log('📢 System message:', message.message)
      setSystemMessages(prev => [message, ...prev.slice(0, 9)]) // Keep last 10
    })

    setSocket(newSocket)

    return newSocket
  }, [user, token, enableBidUpdates, socket])

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socket) {
      console.log('🔌 Disconnecting from real-time notifications...')
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }, [socket])

  // Subscribe to gem updates
  const subscribeToGem = useCallback((gemId: string) => {
    if (socket && socket.connected) {
      socket.emit('subscribe_gem', gemId)
      console.log(`📍 Subscribed to gem ${gemId} updates`)
    }
  }, [socket])

  // Unsubscribe from gem updates
  const unsubscribeFromGem = useCallback((gemId: string) => {
    if (socket && socket.connected) {
      socket.emit('unsubscribe_gem', gemId)
      console.log(`📍 Unsubscribed from gem ${gemId} updates`)
    }
  }, [socket])

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Clear bid updates
  const clearBidUpdates = useCallback(() => {
    setBidUpdates([])
  }, [])

  // Clear system messages
  const clearSystemMessages = useCallback(() => {
    setSystemMessages([])
  }, [])

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await window.Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (autoConnect && user && token && !socket) {
      connect()
    }

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [autoConnect, user, token, connect, socket])

  // Auto-subscribe to provided gem IDs
  useEffect(() => {
    if (socket && socket.connected && gemIds.length > 0) {
      gemIds.forEach(subscribeToGem)
      
      // Cleanup: unsubscribe when component unmounts or gemIds change
      return () => {
        gemIds.forEach(unsubscribeFromGem)
      }
    }
  }, [socket, isConnected, gemIds, subscribeToGem, unsubscribeFromGem])

  return {
    // Connection state
    isConnected,
    connectionError,
    
    // Data
    notifications,
    bidUpdates,
    systemMessages,
    
    // Actions
    connect,
    disconnect,
    subscribeToGem,
    unsubscribeFromGem,
    clearNotifications,
    clearBidUpdates,
    clearSystemMessages,
    requestNotificationPermission,
    
    // Socket instance (for advanced usage)
    socket
  }
} 