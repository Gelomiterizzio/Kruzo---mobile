import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/providers/ThemeProvider'
import { haptics } from '@/utils/haptics'
import { BUSINESS_CATEGORIES } from '@/constants'

export interface CategoryGridProps {
  onSelect?: (key: string) => void
}

const TILE = 52

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
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            },
          ]}
        >
          {/* The icon column is centered as one optical unit. The emoji Text fills
              the tile (flex:1) and is centered on BOTH axes via Android text
              alignment — the most reliable glyph-centering technique (no lineHeight
              guesswork, no asymmetric includeFontPadding). */}
          <View style={styles.iconCol}>
            <View style={[styles.iconTile, { backgroundColor: tint(c.gradient[0]) }]}>
              <Text style={styles.emoji} allowFontScaling={false}>
                {c.emoji}
              </Text>
            </View>
            <Text style={[styles.label, { color: theme.colors.foreground }]} numberOfLines={1}>
              {c.label}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  // Fixed height (NOT aspectRatio): aspectRatio was being ignored here so the cell
  // height was driven by content+padding, which made vertical centering unstable.
  // A fixed height + justifyContent center centers the emoji+label unit
  // deterministically and identically across the grid.
  cell: {
    width: '31%',
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  // Tile + label centered together as one unit.
  iconCol: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  // The tile flex-centers the emoji; a line box slightly taller than the glyph
  // (lineHeight 30 vs fontSize 25) lets flexbox seat it true-center on Android.
  iconTile: {
    width: TILE,
    height: TILE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 25,
    lineHeight: 30,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  label: {
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
    includeFontPadding: false,
  },
})
