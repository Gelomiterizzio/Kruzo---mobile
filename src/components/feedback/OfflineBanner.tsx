import { Text, StyleSheet } from 'react-native'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { WifiOff } from 'lucide-react-native'
import { useIsOnline } from '@/hooks/useIsOnline'

// Floating pill shown while the device is offline. React Query still serves the
// persisted cache, so the app stays usable; this just communicates the state.
export function OfflineBanner() {
  const online = useIsOnline()
  const insets = useSafeAreaInsets()

  if (online) return null

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(200)}
      pointerEvents="none"
      accessibilityRole="alert"
      style={[styles.banner, { bottom: insets.bottom + 16 }]}
    >
      <WifiOff size={14} color="#fff" />
      <Text style={styles.text}>Sin conexión · mostrando datos guardados</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20,20,20,0.92)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    zIndex: 2000,
    elevation: 6,
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
})
