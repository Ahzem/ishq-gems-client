/**
 * Message-related API response types
 */

import type { Message, ChatThread, MessageUser } from '../entities/message'

export interface MessagesResponse {
  messages: Message[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

export interface ChatsResponse {
  chats: ChatThread[]
  pagination: {
    total: number
    page: number
    pages: number
    limit: number
  }
}

export interface MessageUnreadCountResponse {
  unreadCount: number
}

export interface UserInfoResponse {
  user: MessageUser
}

export interface SendMessageResponse {
  _id: string
  content: string
  sentAt: string
  isRead: boolean
  readAt?: string
  senderId: MessageUser
  receiverId: MessageUser
}

export interface BlockedUsersResponse {
  users: MessageUser[]
}

export interface MessageActionResponse {
  success: boolean
  message: string
}
