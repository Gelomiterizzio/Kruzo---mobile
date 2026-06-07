import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'

export interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  emoji?: string
  leftIcon?: React.ReactNode
  disabled?: boolean
  testID?: string
  style?: StyleProp<ViewStyle>
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

// Selectable pill used for category/zone filters. `selected` flips to the brand
// tint; exposes accessibilityState.selected for screen readers.
export function Chip({
  label,
  selected = false,
  onPress,
  emoji,
  leftIcon,
  disabled = false,
  testID,
  style,
}: ChipProps) {
  const { theme } = useTheme()
  const scale = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 80 })
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 120 })
      }}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      testID={testID}
      style={[
        styles.base,
        {
          backgroundColor: selected ? theme.colors.primary : theme.colors.muted,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.full,
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : leftIcon}
      <Text
        style={[
          styles.label,
          { color: selected ? theme.colors.primaryForeground : theme.colors.foreground },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emoji: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600' },
})
