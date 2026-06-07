import { Stack } from 'expo-router'
import { RouteGuard } from '@/features/auth/RouteGuard'

// Admin area — requires role admin. Defense-in-depth over Firestore rules.
export default function AdminLayout() {
  return (
    <RouteGuard group="admin">
      <Stack screenOptions={{ headerShown: false }} />
    </RouteGuard>
  )
}
