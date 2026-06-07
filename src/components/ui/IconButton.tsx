import {
  Pressable,
  StyleSheet,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'
import type { Theme } from '@/theme'

export type IconButtonVariant = 'solid' | 'soft' | 'ghost' | 'outline'
export type IconButtonSize = 'sm' | 'md' | 'lg'

export interface IconButtonProps {
  icon: React.ReactNode
  /** Required for accessibility — icon-only controls must be labelled. */
  accessibilityLabel: string
  onPress?: () => void
  variant?: IconButtonVariant
  size?: IconButtonSize
  disabled?: boolean
  loading?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const DIM = { sm: 32, md: 40, lg: 48 } as const

function palette(theme: Theme, variant: IconButtonVariant) {
  switch (variant) {
    case 'solid':
      return { bg: theme.colors.primary, border: 'transparent' }
    case 'soft':
      return { bg: theme.colors.muted, border: 'transparent' }
    case 'outline':
      return { bg: 'transparent', border: theme.colors.border }
    case 'ghost':
      return { bg: 'transparent', border: 'transparent' }
  }
}

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  testID,
  style,
}: IconButtonProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))
  const colors = palette(theme, variant)
  const dim = DIM[size]
  const isDisabled = disabled || loading

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withTiming(0.9, { duration: 80 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 })
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={[
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: theme.radius.full,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={theme.colors.mutedForeground} /> : icon}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
})
