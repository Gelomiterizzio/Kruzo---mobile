import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { OfflineBanner } from '@/components/feedback/OfflineBanner'
import { ToastHost } from '@/components/overlay/ToastHost'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider, useAuthContext } from '@/providers/AuthProvider'
import { initNetworkManagers } from '@/lib/network'
import { usePushRegistration } from '@/hooks/usePushRegistration'

// Keep the native splash up until auth has resolved, so the app never flashes a
// signed-out state before restoring the session.
void SplashScreen.preventAutoHideAsync()
// Wire React Query to network + app-focus state (offline-first).
initNetworkManagers()

function RootNavigator() {
  const { loading } = useAuthContext()
  usePushRegistration()

  useEffect(() => {
    if (!loading) void SplashScreen.hideAsync()
  }, [loading])

  if (loading) return null

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="business/[slug]" />
      <Stack.Screen name="post/[id]" />
      <Stack.Screen name="user/[id]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="notifications" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryProvider>
            <ThemeProvider>
              <AuthProvider>
                <RootNavigator />
                <OfflineBanner />
                <ToastHost />
                <StatusBar style="auto" />
              </AuthProvider>
            </ThemeProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}
