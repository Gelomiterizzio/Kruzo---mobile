import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'user' | 'entrepreneur' | 'admin'

export interface UserNotificationSettings {
  email: boolean
  whatsapp: boolean
  push: boolean
  newReviews: boolean
  newMessages: boolean
  promotions: boolean
}

export interface AppUser {
  id: string
  email: string
  displayName: string
  photoURL: string
  phone: string
  bio: string
  location: string
  role: UserRole
  businessIds: string[]
  favoriteIds: string[]
  postCount: number
  reviewCount: number
  reputation: number
  notifications: UserNotificationSettings
  isVerified: boolean
  isBanned: boolean
  banReason: string
  createdAt: Timestamp
  lastSeen: Timestamp
  // Mobile-only: Expo push token, written by the client for push readiness.
  // Consumed by a future server sender (see docs/06). Optional; absent on web.
  expoPushToken?: string
}
