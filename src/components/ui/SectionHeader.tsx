import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { useTheme } from '@/providers/ThemeProvider'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onActionPress?: () => void
  style?: StyleProp<ViewStyle>
}

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  style,
}: SectionHeaderProps) {
  const { theme } = useTheme()
  return (
    <View style={[styles.row, style]}>
      <View style={styles.titles}>
        <Text style={[styles.title, { color: theme.colors.foreground }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: theme.colors.mutedForeground }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={styles.action}
        >
          <Text style={[styles.actionLabel, { color: theme.colors.primary }]}>{actionLabel}</Text>
          <ChevronRight size={16} color={theme.colors.primary} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  titles: { flex: 1, minWidth: 0 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionLabel: { fontSize: 14, fontWeight: '600' },
})
