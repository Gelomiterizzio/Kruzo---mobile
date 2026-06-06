import type { Timestamp } from 'firebase/firestore'

export type PostStatus = 'active' | 'sold' | 'paused' | 'deleted'
export type PriceType = 'fixed' | 'negotiable' | 'free' | 'consult'

export interface Post {
  id: string
  businessId: string
  businessName: string
  businessSlug: string
  businessLogo: string
  ownerId: string
  title: string
  description: string
  images: string[]
  price: number
  currency: 'BOB'
  priceType: PriceType
  originalPrice?: number
  category: string
  subcategory: string
  tags: string[]
  inStock: boolean
  stockCount: number | null
  hasDelivery: boolean
  deliveryZones: string[]
  deliveryPrice: number
  whatsapp: string
  whatsappMessage: string
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  status: PostStatus
  isFeatured: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface PostFormData {
  title: string
  description: string
  price: number
  priceType: PriceType
  originalPrice?: number
  category: string
  subcategory: string
  tags: string
  inStock: boolean
  stockCount?: number
  hasDelivery: boolean
  deliveryZones: string
  deliveryPrice: number
  whatsappMessage: string
}

export interface PostComment {
  id: string
  postId: string
  userId: string
  userName: string
  userPhoto: string
  text: string
  createdAt: Timestamp
}
