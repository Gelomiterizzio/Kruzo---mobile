import { Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
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
    <Animated.View
      entering={FadeInDown.duration(420).springify().damping(18)}
      style={[styles.container, style]}
      accessibilityRole="summary"
    >
      {/* Soft tinted disc behind the glyph adds depth instead of a bare emoji. */}
      <Animated.View style={[styles.disc, { backgroundColor: theme.colors.muted }]}>
        {icon ?? (
          <Text style={styles.emoji} allowFontScaling={false}>
            {emoji}
          </Text>
        )}
      </Animated.View>
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
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  disc: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  emoji: { fontSize: 40, textAlign: 'center', includeFontPadding: false },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  description: { fontSize: 14, textAlign: 'center', maxWidth: 300, lineHeight: 20 },
  action: { marginTop: 12 },
})
