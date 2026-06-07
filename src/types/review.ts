import type { Timestamp } from 'firebase/firestore'

export interface Review {
  id: string
  businessId: string
  userId: string
  userName: string
  userPhoto: string
  rating: number
  comment: string
  images: string[]
  ownerReply: string | null
  ownerRepliedAt: Timestamp | null
  isVerified: boolean
  reportCount: number
  isHidden: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ReviewFormData {
  rating: number
  comment: string
}
