import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { useTheme } from '@/providers/ThemeProvider'
import type { Theme } from '@/theme'

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'gold'
  | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps {
  label: string
  variant?: BadgeVariant
  size?: BadgeSize
  leftIcon?: React.ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
}

// Soft (tinted) badges. bg = tint, fg = strong. Kept theme-aware where it maps to
// semantic tokens; the categorical colors are constant across light/dark.
function palette(theme: Theme, variant: BadgeVariant): { bg: string; fg: string } {
  switch (variant) {
    case 'primary':
      return { bg: theme.brand[100], fg: theme.brand[700] }
    case 'success':
      return { bg: '#dcfce7', fg: '#15803d' }
    case 'warning':
      return { bg: '#fef3c7', fg: '#b45309' }
    case 'danger':
      return { bg: '#fee2e2', fg: '#b91c1c' }
    case 'gold':
      return { bg: '#fef9c3', fg: theme.gold[600] }
    case 'info':
      return { bg: '#dbeafe', fg: '#1d4ed8' }
    case 'neutral':
    default:
      return { bg: theme.colors.muted, fg: theme.colors.mutedForeground }
  }
}

export function Badge({
  label,
  variant = 'neutral',
  size = 'sm',
  leftIcon,
  style,
  testID,
}: BadgeProps) {
  const { theme } = useTheme()
  const colors = palette(theme, variant)
  const isSm = size === 'sm'

  return (
    <View
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: colors.bg,
          borderRadius: theme.radius.full,
          paddingHorizontal: isSm ? 8 : 10,
          paddingVertical: isSm ? 2 : 4,
          gap: 4,
        },
        style,
      ]}
    >
      {leftIcon}
      <Text
        style={[styles.label, { color: colors.fg, fontSize: isSm ? 11 : 13 }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  label: { fontWeight: '600' },
})
