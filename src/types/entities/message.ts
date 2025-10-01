/**
 * Message and chat related entity types
 */

import { LinkPreview } from '@/utils/linkUtils'

export interface MessageUser {
  _id: string
  id?: string
  fullName: string
  avatar?: string
  role: string
}

export interface Message {
  id: string
  _id?: string
  content: string
  sentAt: string
  isRead: boolean
  readAt?: string
  senderId: MessageUser
  receiverId: MessageUser
  messageType: 'text' | 'system'
  isSystemMessage: boolean
  isOwn?: boolean
  linkPreviews?: LinkPreview[]
}

export interface ChatThread {
  otherUser: {
    id: string
    fullName: string
    avatar?: string
    role: string
  }
  lastMessage: {
    content: string
    sentAt: string
    isRead: boolean
    senderId: string
  }
  unreadCount: number
}

// Re-export LinkPreview from linkUtils to maintain consistency
export type { LinkPreview } from '@/utils/linkUtils'

// All API response interfaces have been moved to @/types/api/message-responses.ts
