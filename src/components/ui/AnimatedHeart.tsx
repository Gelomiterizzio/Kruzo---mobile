import { useEffect, useRef } from 'react'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { Heart } from 'lucide-react-native'

export interface AnimatedHeartProps {
  active: boolean
  size?: number
  activeColor?: string
  inactiveColor: string
}

// Premium "like" feedback: the heart pops (overshoot + settle) the moment it is
// toggled on, the way Instagram/Airbnb favorites feel. The first render is
// skipped so an already-favorited item doesn't animate on mount.
export function AnimatedHeart({
  active,
  size = 15,
  activeColor = '#ef4444',
  inactiveColor,
}: AnimatedHeartProps) {
  const scale = useSharedValue(1)
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }
    // A slightly bigger pop when turning ON than OFF.
    const peak = active ? 1.4 : 1.18
    scale.value = withSequence(
      withTiming(peak, { duration: 120 }),
      withSpring(1, { damping: 7, stiffness: 240, mass: 0.5 }),
    )
  }, [active, scale])

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

  return (
    <Animated.View style={style}>
      <Heart
        size={size}
        color={active ? activeColor : inactiveColor}
        fill={active ? activeColor : 'transparent'}
      />
    </Animated.View>
  )
}
