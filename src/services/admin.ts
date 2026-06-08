import { collection, query, orderBy, limit, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { AppUser, UserRole } from '@/types/user'
import type { Business, BusinessStatus } from '@/types/business'
import type { Post, PostStatus } from '@/types/post'

// Admin operations — mirror of web/app/admin/*. Every write targets an EXISTING
// field allowed by firestore.rules for admins (role/isBanned on users; status/
// isFeatured/isVerified on businesses; status on posts). No new collections.

// ─── USERS ────────────────────────────────────────────────────────────────────
export async function getAllUsers(max = 100): Promise<AppUser[]> {
  const snap = await getDocs(
    query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(max)),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser)
}

export async function setUserRole(uid: string, role: UserRole) {
  await updateDoc(doc(db, 'users', uid), { role })
}

export async function setUserBanned(uid: string, isBanned: boolean) {
  await updateDoc(doc(db, 'users', uid), { isBanned })
}

// ─── BUSINESSES ─────────────────────────────────────────────────────────────
export async function getAllBusinesses(max = 100): Promise<Business[]> {
  const snap = await getDocs(
    query(collection(db, 'businesses'), orderBy('createdAt', 'desc'), limit(max)),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Business)
}

export async function setBusinessStatus(id: string, status: BusinessStatus) {
  await updateDoc(doc(db, 'businesses', id), { status })
}

export async function setBusinessFeatured(id: string, isFeatured: boolean) {
  await updateDoc(doc(db, 'businesses', id), { isFeatured })
}

export async function setBusinessVerified(id: string, isVerified: boolean) {
  await updateDoc(doc(db, 'businesses', id), { isVerified })
}

// ─── POSTS ──────────────────────────────────────────────────────────────────
export async function getAllPosts(max = 100): Promise<Post[]> {
  const snap = await getDocs(
    query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(max)),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Post)
}

export async function setPostStatus(id: string, status: PostStatus) {
  await updateDoc(doc(db, 'posts', id), { status })
}

// ─── REPORTS (admin-readable; no writer pipeline exists yet) ───────────────────
export interface ReportDoc {
  id: string
  [key: string]: unknown
}
export async function getReports(max = 100): Promise<ReportDoc[]> {
  const snap = await getDocs(
    query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(max)),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
