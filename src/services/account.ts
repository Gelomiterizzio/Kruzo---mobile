import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'
import { logout } from './auth'

// Play Store policy requires an in-app path to delete the account and its data.
// The Firestore rules deny self-delete of users/{uid}, so deletion runs in the
// `deleteAccount` Cloud Function (Admin SDK) which removes the Auth account, the
// user doc + subcollections, the businesses they own (and reviews/posts under
// them), and the reviews they authored elsewhere. See web/functions/index.js.
export async function deleteMyAccount(): Promise<void> {
  const callable = httpsCallable<void, { ok: boolean }>(functions, 'deleteAccount')
  await callable()
  // The Auth user is already gone server-side; sign out locally to clear the
  // cached session and trigger onAuthChange → app returns to the signed-out UI.
  await logout().catch(() => {})
}
