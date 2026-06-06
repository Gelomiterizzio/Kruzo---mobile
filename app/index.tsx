import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'
import { APP_NAME, APP_TAGLINE } from '@/constants'

// Scaffold bootstrap screen. Real product screens (Home, Explore, etc.) are
// built in Phase 3 inside route groups. This proves the provider + theme +
// router wiring boots correctly.
export default function BootstrapScreen() {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background, paddingTop: insets.top },
      ]}
    >
      <View style={[styles.badge, { backgroundColor: theme.brand[500] }]}>
        <Text style={styles.badgeText}>K</Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.primary }]}>{APP_NAME}</Text>
      <Text style={[styles.tagline, { color: theme.colors.mutedForeground }]}>{APP_TAGLINE}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
  },
})
