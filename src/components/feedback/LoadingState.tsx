import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '@/providers/ThemeProvider'

export interface LoadingStateProps {
  label?: string
  fullScreen?: boolean
  style?: StyleProp<ViewStyle>
}

export function LoadingState({ label, fullScreen = false, style }: LoadingStateProps) {
  const { theme } = useTheme()
  return (
    <View
      style={[
        styles.container,
        fullScreen && { flex: 1, backgroundColor: theme.colors.background },
        !fullScreen && styles.inline,
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Cargando'}
    >
      <ActivityIndicator size={fullScreen ? 'large' : 'small'} color={theme.colors.primary} />
      {label ? (
        <Text style={[styles.label, { color: theme.colors.mutedForeground }]}>{label}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  inline: { padding: 24 },
  label: { fontSize: 14 },
})
