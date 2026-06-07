import type { Timestamp } from 'firebase/firestore'

export type BusinessPlan = 'free' | 'pro' | 'premium'
export type BusinessStatus = 'active' | 'pending' | 'suspended' | 'rejected'

export interface BusinessHours {
  open: string
  close: string
}
export interface BusinessSchedule {
  mon: BusinessHours | null
  tue: BusinessHours | null
  wed: BusinessHours | null
  thu: BusinessHours | null
  fri: BusinessHours | null
  sat: BusinessHours | null
  sun: BusinessHours | null
}

export interface Business {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  ownerId: string
  ownerName: string
  category: string[]
  subcategory: string
  tags: string[]
  logo: string
  coverImage: string
  images: string[]
  whatsapp: string
  phone: string
  email: string
  instagram: string
  facebook: string
  tiktok: string
  website: string
  address: string
  zone: string
  city: string
  coordinates: { lat: number; lng: number } | null
  mapUrl: string
  hours: BusinessSchedule
  isOpenNow?: boolean
  rating: number
  reviewCount: number
  viewCount: number
  // Per-star review counts, maintained by the onReviewWritten Cloud Function.
  ratingDistribution?: { [star: string]: number }
  favoriteCount: number
  shareCount: number
  contactCount: number
  status: BusinessStatus
  isVerified: boolean
  isFeatured: boolean
  featuredUntil: Timestamp | null
  plan: BusinessPlan
  hasDelivery: boolean
  hasOnlinePayment: boolean
  acceptsQR: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface BusinessFormData {
  name: string
  tagline: string
  description: string
  category: string[]
  subcategory: string
  tags: string
  whatsapp: string
  phone: string
  email: string
  instagram: string
  facebook: string
  tiktok: string
  website: string
  address: string
  zone: string
  hasDelivery: boolean
  hasOnlinePayment: boolean
  acceptsQR: boolean
}

export interface BusinessStats {
  totalViews: number
  totalContacts: number
  totalFavorites: number
  viewsThisWeek: number
  contactsThisWeek: number
  topPosts: string[]
}
