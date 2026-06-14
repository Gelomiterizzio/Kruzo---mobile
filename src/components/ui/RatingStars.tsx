import { View, Pressable, StyleSheet } from 'react-native'
import { Star } from 'lucide-react-native'
import { useTheme } from '@/providers/ThemeProvider'

export interface RatingStarsProps {
  value: number
  max?: number
  size?: number
  readonly?: boolean
  onChange?: (value: number) => void
  testID?: string
}

// Display (readonly, rounds to nearest star) or interactive (tap to set). Uses
// the gold token for filled stars to match the web rating UI.
export function RatingStars({
  value,
  max = 5,
  size = 18,
  readonly = true,
  onChange,
  testID,
}: RatingStarsProps) {
  const { theme } = useTheme()
  // Defensive: legacy/partial docs may carry an undefined/NaN rating. Coerce to a
  // finite number so Math.round and the fill comparison never produce NaN.
  const safeValue = Number.isFinite(value) ? value : 0
  const filledCount = readonly ? Math.round(safeValue) : safeValue
  const stars = Array.from({ length: max }, (_, i) => i)

  return (
    <View
      style={styles.row}
      testID={testID}
      accessibilityRole={readonly ? 'image' : 'adjustable'}
      accessibilityLabel={`Calificación: ${safeValue} de ${max}`}
    >
      {stars.map((i) => {
        const filled = i < filledCount
        const star = (
          <Star
            size={size}
            color={filled ? theme.gold[400] : theme.colors.border}
            fill={filled ? theme.gold[400] : 'transparent'}
          />
        )
        if (readonly || !onChange) {
          return <View key={i}>{star}</View>
        }
        return (
          <Pressable
            key={i}
            onPress={() => onChange(i + 1)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1} ${i + 1 === 1 ? 'estrella' : 'estrellas'}`}
          >
            {star}
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2, alignItems: 'center' },
})
