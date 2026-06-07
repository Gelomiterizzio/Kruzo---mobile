import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { ToastHost } from '@/components/overlay/ToastHost'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { AuthProvider, useAuthContext } from '@/providers/AuthProvider'

// Keep the native splash up until auth has resolved, so the app never flashes a
// signed-out state before restoring the session.
void SplashScreen.preventAutoHideAsync()

function RootNavigator() {
  const { loading } = useAuthContext()

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
              <BottomSheetModalProvider>
                <AuthProvider>
                  <RootNavigator />
                  <ToastHost />
                  <StatusBar style="auto" />
                </AuthProvider>
              </BottomSheetModalProvider>
            </ThemeProvider>
          </QueryProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}
