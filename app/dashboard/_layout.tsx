import { Stack } from 'expo-router'
import { RouteGuard } from '@/features/auth/RouteGuard'

// Entrepreneur area — requires role entrepreneur or admin (Firestore rules are
// the real authority; this guard is for UX).
export default function DashboardLayout() {
  return (
    <RouteGuard group="entrepreneur">
      <Stack screenOptions={{ headerShown: false }} />
    </RouteGuard>
  )
}
