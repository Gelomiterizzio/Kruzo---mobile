import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/providers/ThemeProvider'
import { haptics } from '@/utils/haptics'
import { BUSINESS_CATEGORIES } from '@/constants'

export interface CategoryGridProps {
  onSelect?: (key: string) => void
}

// Low-alpha tint of a category's brand color, used as the icon-tile background.
// The 6-digit hex from constants + '22' ≈ 13% opacity reads well in both themes.
const tint = (hex: string) => `${hex}22`

export function CategoryGrid({ onSelect }: CategoryGridProps) {
  const { theme } = useTheme()
  const router = useRouter()

  const handle = (key: string) => {
    haptics.selection()
    if (onSelect) onSelect(key)
    else router.push({ pathname: '/explore', params: { cat: key } })
  }

  return (
    <View style={styles.grid}>
      {BUSINESS_CATEGORIES.map((c) => (
        <Pressable
          key={c.key}
          onPress={() => handle(c.key)}
          accessibilityRole="button"
          accessibilityLabel={c.label}
          style={({ pressed }) => [
            styles.cell,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.xl,
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          {/* Colored icon tile gives the emoji a defined, perfectly-centered box
              (includeFontPadding:false removes Android's asymmetric glyph padding). */}
          <View style={[styles.iconTile, { backgroundColor: tint(c.gradient[0]) }]}>
            <Text style={styles.emoji} allowFontScaling={false}>
              {c.emoji}
            </Text>
          </View>
          <Text style={[styles.label, { color: theme.colors.foreground }]} numberOfLines={1}>
            {c.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  cell: {
    width: '31%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  label: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
})
