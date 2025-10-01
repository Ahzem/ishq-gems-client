/**
 * Message-related API request types
 */

import type { LinkPreview } from '@/utils/linkUtils'

export interface SendMessageRequest {
  receiverId: string
  content: string
  linkPreviews?: LinkPreview[]
}

export interface GetMessagesRequest {
  userId: string
  page?: number
  limit?: number
}

export interface GetChatsRequest {
  page?: number
  limit?: number
}

export interface MarkAsReadRequest {
  userId: string
}

export interface ReportMessageRequest {
  messageId: string
  reason: string
}

export interface BlockUserRequest {
  userId: string
}

export interface UnblockUserRequest {
  userId: string
}
