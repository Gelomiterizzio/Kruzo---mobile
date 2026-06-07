import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '@/providers/ThemeProvider'
import { Button } from '@/components/ui/Button'

export interface EmptyStateProps {
  title: string
  description?: string
  emoji?: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  style?: StyleProp<ViewStyle>
}

export function EmptyState({
  title,
  description,
  emoji = '🔍',
  icon,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { theme } = useTheme()
  return (
    <View style={[styles.container, style]} accessibilityRole="summary">
      {icon ?? <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: theme.colors.mutedForeground }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="primary"
          size="md"
          style={styles.action}
        />
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emoji: { fontSize: 44, marginBottom: 4 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  description: { fontSize: 14, textAlign: 'center', maxWidth: 300, lineHeight: 20 },
  action: { marginTop: 12 },
})
