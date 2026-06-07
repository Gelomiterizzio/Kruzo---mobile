import { View, StyleSheet, type ViewStyle } from 'react-native'
import { type Edge, SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/providers/ThemeProvider'

// Base screen container: applies the themed background and safe-area insets.
// Every product screen (Phase 3) should render inside this for consistent
// padding and theming.
export function Screen({
  children,
  edges = ['top', 'bottom'],
  padded = true,
  style,
}: {
  children: React.ReactNode
  edges?: readonly Edge[]
  padded?: boolean
  style?: ViewStyle
}) {
  const { theme } = useTheme()
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.content, padded && { padding: theme.spacing.lg }, style]}>
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
})
