import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithCredential,
  updateProfile,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { AppUser } from '@/types/user'

// Ported from web/lib/firebase/auth.ts. The web-only session-cookie sync
// (syncSession/clearSession + /api/session) is intentionally removed: on mobile
// the Firebase SDK persists the session via AsyncStorage, and Firestore rules
// remain the authority for role checks.

export async function createUserDocument(user: User, extra?: Partial<AppUser>) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    await updateDoc(ref, { lastSeen: serverTimestamp() })
    return
  }
  await setDoc(ref, {
    id: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    photoURL: user.photoURL ?? '',
    phone: '',
    bio: '',
    location: 'Santa Cruz de la Sierra, Bolivia',
    role: 'user',
    businessIds: [],
    favoriteIds: [],
    postCount: 0,
    reviewCount: 0,
    reputation: 0,
    notifications: {
      email: true,
      whatsapp: false,
      push: true,
      newReviews: true,
      newMessages: true,
      promotions: false,
    },
    isVerified: false,
    isBanned: false,
    banReason: '',
    createdAt: serverTimestamp(),
    lastSeen: serverTimestamp(),
    ...extra,
  })
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName: name })
  await createUserDocument(result.user)
  return result.user
}

/**
 * Completes Google sign-in given an idToken obtained natively by
 * @react-native-google-signin (see features/auth/useGoogleSignIn). Keeping the
 * native lib out of this service makes it platform-agnostic and easy to test.
 */
export async function signInWithGoogleCredential(idToken: string) {
  const credential = GoogleAuthProvider.credential(idToken)
  const result = await signInWithCredential(auth, credential)
  await createUserDocument(result.user)
  return result.user
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function logout() {
  await signOut(auth)
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}
