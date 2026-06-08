import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import Constants from 'expo-constants'
import { router } from 'expo-router'
import { useAuthContext } from '@/providers/AuthProvider'
import { savePushToken } from '@/services/notifications'
import { logger } from '@/lib/logger'

// Foreground display behavior — set once at module load.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

// Client-side push readiness: requests permission, registers the Expo push token
// and stores it on the user doc, and routes notification taps to deep links.
// Token registration needs an EAS projectId (run `eas init`); until then it
// degrades to a logged no-op. Server sender is documented as the remaining gap.
export function usePushRegistration() {
  const { firebaseUser } = useAuthContext()
  const registered = useRef(false)

  useEffect(() => {
    if (!firebaseUser) {
      registered.current = false
      return
    }
    if (registered.current) return
    registered.current = true

    const register = async () => {
      try {
        const settings = await Notifications.getPermissionsAsync()
        let status = settings.status
        if (status !== 'granted') {
          status = (await Notifications.requestPermissionsAsync()).status
        }
        if (status !== 'granted') return

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'KRUZO',
            importance: Notifications.AndroidImportance.DEFAULT,
            lightColor: '#ff4500',
          })
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined
        if (!projectId) {
          logger.warn('Push: no EAS projectId yet — token registration skipped (run `eas init`).')
          return
        }
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
        await savePushToken(firebaseUser.uid, tokenData.data)
        logger.info('Push token registered')
      } catch (e) {
        logger.warn('Push registration failed', e)
      }
    }
    void register()
  }, [firebaseUser])

  // Deep-link when the user taps a notification (payload data.url or data.path).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { url?: string; path?: string }
        | undefined
      const target = data?.url ?? data?.path
      if (typeof target === 'string') router.push(target as never)
    })
    return () => sub.remove()
  }, [])
}
