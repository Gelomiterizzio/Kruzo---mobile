import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Reads the user's notifications subcollection (defined in firestore.rules).
// NOTE: no backend currently WRITES notifications (web used mock data, and no
// Cloud Function emits them), so this is expected to be empty until a sending
// pipeline is added. We read the real collection rather than fake data.
export interface AppNotification {
  id: string
  type?: string
  title?: string
  body?: string
  read?: boolean
  createdAt?: Timestamp
}

export async function getNotifications(uid: string, max = 50): Promise<AppNotification[]> {
  const snap = await getDocs(
    query(collection(db, 'users', uid, 'notifications'), orderBy('createdAt', 'desc'), limit(max)),
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Stores the device's Expo push token on the user doc (own-doc write, allowed by
// rules). A future server sender reads this to deliver notifications.
export async function savePushToken(uid: string, token: string) {
  await updateDoc(doc(db, 'users', uid), { expoPushToken: token, lastSeen: serverTimestamp() })
}
