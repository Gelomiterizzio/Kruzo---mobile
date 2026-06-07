import { View, Text, StyleSheet } from 'react-native'
import { Screen } from '@/components/layout/Screen'
import { useTheme } from '@/providers/ThemeProvider'

// Temporary screen body used while the navigation skeleton is in place but the
// real UI (Phase 2 Design System + Phase 3 screens) is not yet built.
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  const { theme } = useTheme()
  return (
    <Screen>
      <View style={styles.center}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>{title}</Text>
        <Text style={[styles.note, { color: theme.colors.mutedForeground }]}>
          {note ?? 'En construcción — se implementa en la Fase 3.'}
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  note: { fontSize: 14, textAlign: 'center' },
})
