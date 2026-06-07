import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'
import type { Theme } from '@/theme'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps {
  label: string
  onPress?: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const SIZE = {
  sm: { height: 36, paddingH: 14, font: 14, gap: 6 },
  md: { height: 46, paddingH: 18, font: 15, gap: 8 },
  lg: { height: 54, paddingH: 24, font: 17, gap: 10 },
} as const

function palette(theme: Theme, variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return { bg: theme.colors.primary, fg: theme.colors.primaryForeground, border: 'transparent' }
    case 'secondary':
      return {
        bg: theme.colors.secondary,
        fg: theme.colors.secondaryForeground,
        border: 'transparent',
      }
    case 'outline':
      return { bg: 'transparent', fg: theme.colors.foreground, border: theme.colors.border }
    case 'ghost':
      return { bg: 'transparent', fg: theme.colors.foreground, border: 'transparent' }
    case 'destructive':
      return {
        bg: theme.colors.destructive,
        fg: theme.colors.destructiveForeground,
        border: 'transparent',
      }
  }
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  accessibilityLabel,
  testID,
  style,
}: ButtonProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const colors = palette(theme, variant)
  const s = SIZE[size]
  const isDisabled = disabled || loading

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={isDisabled}
      onPressIn={() => {
        scale.value = withTiming(0.97, { duration: 80 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 })
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      testID={testID}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.paddingH,
          gap: s.gap,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth * 2 : 0,
          borderRadius: theme.radius.lg,
          opacity: isDisabled ? 0.55 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.fg} size="small" />
      ) : (
        <>
          {leftIcon ? <View>{leftIcon}</View> : null}
          <Text style={[styles.label, { color: colors.fg, fontSize: s.font }]} numberOfLines={1}>
            {label}
          </Text>
          {rightIcon ? <View>{rightIcon}</View> : null}
        </>
      )}
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
})
