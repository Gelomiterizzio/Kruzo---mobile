import { Stack } from 'expo-router'
import { RouteGuard } from '@/features/auth/RouteGuard'

// Auth screens: already-signed-in users are redirected to the app by the guard.
export default function AuthLayout() {
  return (
    <RouteGuard group="auth">
      <Stack screenOptions={{ headerShown: false }} />
    </RouteGuard>
  )
}
