import { useEffect, useRef } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, type LayoutChangeEvent } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { useTheme } from '@/providers/ThemeProvider'

export interface TabsProps {
  items: string[]
  value: number
  onChange: (index: number) => void
  scrollable?: boolean
  testID?: string
}

// Segmented tab bar with a sliding underline indicator (Reanimated). Tab widths
// are measured via onLayout so the indicator tracks content-sized tabs.
export function Tabs({ items, value, onChange, scrollable = false, testID }: TabsProps) {
  const { theme } = useTheme()
  const layouts = useRef<Record<number, { x: number; width: number }>>({})
  const x = useSharedValue(0)
  const w = useSharedValue(0)

  useEffect(() => {
    const l = layouts.current[value]
    if (l) {
      x.value = withTiming(l.x, { duration: 200 })
      w.value = withTiming(l.width, { duration: 200 })
    }
  }, [value, x, w])

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
    width: w.value,
  }))

  const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x: lx, width } = e.nativeEvent.layout
    layouts.current[index] = { x: lx, width }
    if (index === value && w.value === 0) {
      x.value = lx
      w.value = width
    }
  }

  const content = (
    <View style={styles.inner}>
      {items.map((item, i) => {
        const active = i === value
        return (
          <Pressable
            key={item}
            onLayout={onTabLayout(i)}
            onPress={() => onChange(i)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={item}
            style={styles.tab}
          >
            <Text
              style={[
                styles.label,
                { color: active ? theme.colors.primary : theme.colors.mutedForeground },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )
      })}
      <Animated.View
        style={[styles.indicator, { backgroundColor: theme.colors.primary }, indicatorStyle]}
      />
    </View>
  )

  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]} testID={testID}>
      {scrollable ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: StyleSheet.hairlineWidth },
  inner: { flexDirection: 'row', position: 'relative' },
  tab: { paddingHorizontal: 16, paddingVertical: 12 },
  label: { fontSize: 14, fontWeight: '600' },
  indicator: { position: 'absolute', left: 0, bottom: 0, height: 2, borderRadius: 2 },
})
