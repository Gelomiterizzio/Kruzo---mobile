import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IconButton } from '@/components/ui/IconButton'
import { useTheme } from '@/providers/ThemeProvider'

export interface HeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  right?: React.ReactNode
  transparent?: boolean
}

// Reusable top bar for stack (detail) screens, since the root Stack hides its
// native header. Respects the safe-area top inset.
export function Header({
  title,
  showBack = true,
  onBack,
  right,
  transparent = false,
}: HeaderProps) {
  const { theme } = useTheme()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleBack = () => {
    if (onBack) return onBack()
    if (router.canGoBack()) router.back()
    else router.replace('/')
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 6,
          backgroundColor: transparent ? 'transparent' : theme.colors.background,
          borderBottomColor: transparent ? 'transparent' : theme.colors.border,
          borderBottomWidth: transparent ? 0 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.side}>
        {showBack ? (
          <IconButton
            icon={<ChevronLeft size={22} color={theme.colors.foreground} />}
            accessibilityLabel="Volver"
            onPress={handleBack}
            variant={transparent ? 'soft' : 'ghost'}
          />
        ) : null}
      </View>

      {title ? (
        <Text style={[styles.title, { color: theme.colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.flex} />
      )}

      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 6,
    gap: 4,
  },
  side: { minWidth: 44, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  flex: { flex: 1 },
  title: { flex: 1, fontSize: 17, fontWeight: '700', textAlign: 'center' },
})
