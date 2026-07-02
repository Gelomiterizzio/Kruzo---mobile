import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// Reads the user's notifications subcollection (defined in firestore.rules).
// Cloud Functions write these via notify(): new reviews (onReviewWritten) and
// business approval (onBusinessWritten). The owner may read/update/delete them.
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

// Marks the given notifications as read in one batch (mirror of the web's
// markAllNotificationsAsRead). Rules allow the owner to update their own
// notification docs. No-ops when everything is already read.
export async function markNotificationsRead(uid: string, items: AppNotification[]) {
  const unread = items.filter((n) => !n.read)
  if (unread.length === 0) return
  const batch = writeBatch(db)
  unread.forEach((n) => batch.update(doc(db, 'users', uid, 'notifications', n.id), { read: true }))
  await batch.commit()
}

// Stores the device's Expo push token on the user doc (own-doc write, allowed by
// rules). A future server sender reads this to deliver notifications.
export async function savePushToken(uid: string, token: string) {
  await updateDoc(doc(db, 'users', uid), { expoPushToken: token, lastSeen: serverTimestamp() })
}
