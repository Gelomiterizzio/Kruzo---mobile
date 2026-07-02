import { useEffect, useState } from 'react'
import {
  type DimensionValue,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'

export interface SkeletonProps {
  width?: DimensionValue
  height?: number
  radius?: number
  style?: StyleProp<ViewStyle>
}

// Premium shimmer: a soft highlight band sweeps left→right over a muted block
// (the loading pattern used by Airbnb/LinkedIn), with a gentle base opacity pulse
// underneath. Dependency-free — the band is a translucent overlay, measured via
// onLayout so it works for both fixed and percentage widths.
export function Skeleton({ width = '100%', height = 16, radius, style }: SkeletonProps) {
  const { theme } = useTheme()
  const [w, setW] = useState(0)
  const pulse = useSharedValue(0.6)
  const sweep = useSharedValue(0)

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    )
  }, [pulse])

  useEffect(() => {
    if (w > 0) {
      sweep.value = 0
      sweep.value = withRepeat(
        withTiming(1, { duration: 1150, easing: Easing.inOut(Easing.quad) }),
        -1,
        false,
      )
    }
  }, [w, sweep])

  const baseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }))
  const bandWidth = Math.max(40, w * 0.55)
  const bandStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(sweep.value, [0, 1], [-bandWidth, w]) }],
  }))

  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)

  return (
    <Animated.View
      onLayout={onLayout}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.md,
          backgroundColor: theme.colors.muted,
          overflow: 'hidden',
        },
        baseStyle,
        style,
      ]}
    >
      {w > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: bandWidth,
              backgroundColor: 'rgba(255,255,255,0.28)',
            },
            bandStyle,
          ]}
        />
      ) : null}
    </Animated.View>
  )
}
