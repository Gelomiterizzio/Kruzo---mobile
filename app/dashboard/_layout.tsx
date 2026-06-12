import { Stack } from 'expo-router'
import { RouteGuard } from '@/features/auth/RouteGuard'

// Dashboard — auth-only, like the web's /dashboard (proxy.ts). A plain user
// needs in here to create their first business; the onBusinessWritten Cloud
// Function promotes them to entrepreneur afterwards. Firestore rules are the
// real authority; this guard is for UX.
export default function DashboardLayout() {
  return (
    <RouteGuard group="protected">
      <Stack screenOptions={{ headerShown: false }} />
    </RouteGuard>
  )
}
