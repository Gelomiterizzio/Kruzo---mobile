import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'

export interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  padding?: number
  elevated?: boolean
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export function Card({
  children,
  onPress,
  padding,
  elevated = false,
  accessibilityLabel,
  testID,
  style,
}: CardProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  const base: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.xl,
    padding: padding ?? theme.spacing.lg,
    ...(elevated ? shadow : null),
  }

  if (!onPress) {
    return (
      <View style={[base, style]} testID={testID}>
        {children}
      </View>
    )
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.98, { duration: 90 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 130 })
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={[base, animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  )
}

// Subtle elevation that works on both Android (elevation) and iOS (shadow*).
const shadow: ViewStyle = {
  elevation: 2,
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
}
