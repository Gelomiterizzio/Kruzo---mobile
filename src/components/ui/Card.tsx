import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated'
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
  const opacity = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

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
        // Spring press-in (natural overshoot-free settle) + a faint dim so taps on
        // image-heavy cards still register a clear "pressed" state.
        scale.value = withSpring(0.965, { damping: 18, stiffness: 320, mass: 0.4 })
        opacity.value = withTiming(0.92, { duration: 90 })
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 260, mass: 0.5 })
        opacity.value = withTiming(1, { duration: 140 })
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
