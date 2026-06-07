import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '@/providers/ThemeProvider'
import { BUSINESS_CATEGORIES } from '@/constants'

export interface CategoryGridProps {
  onSelect?: (key: string) => void
}

export function CategoryGrid({ onSelect }: CategoryGridProps) {
  const { theme } = useTheme()
  const router = useRouter()

  const handle = (key: string) => {
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
          style={[
            styles.cell,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.xl,
            },
          ]}
        >
          <Text style={styles.emoji}>{c.emoji}</Text>
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
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emoji: { fontSize: 28 },
  label: { fontSize: 11, fontWeight: '600' },
})
