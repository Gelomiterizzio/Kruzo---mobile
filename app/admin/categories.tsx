import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/feedback/LoadingState'
import { db } from '@/services/firebase'
import { BUSINESS_CATEGORIES } from '@/constants'
import { useTheme } from '@/providers/ThemeProvider'

// Read-only: the app's category taxonomy is a hardcoded constant (the source of
// truth for the UI, same as web). The web admin "categories" screen is a static
// mock with no Firestore writes, so we surface the real per-category business
// counts instead of fake add/edit/delete controls.
export default function AdminCategoriesScreen() {
  const { theme } = useTheme()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-category-counts'],
    queryFn: async () => {
      const counts = await Promise.all(
        BUSINESS_CATEGORIES.map((c) =>
          getCountFromServer(
            query(collection(db, 'businesses'), where('category', 'array-contains', c.key)),
          ),
        ),
      )
      return BUSINESS_CATEGORIES.map((c, i) => ({ ...c, count: counts[i]?.data().count ?? 0 }))
    },
  })

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Categorías" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.note, { color: theme.colors.mutedForeground }]}>
            {BUSINESS_CATEGORIES.length} categorías · taxonomía fija de la app
          </Text>
          <View style={styles.grid}>
            {(data ?? []).map((c) => (
              <Card key={c.key} style={styles.card}>
                <Text style={styles.emoji}>{c.emoji}</Text>
                <View style={styles.meta}>
                  <Text
                    style={[styles.label, { color: theme.colors.foreground }]}
                    numberOfLines={1}
                  >
                    {c.label}
                  </Text>
                  <Text style={[styles.count, { color: theme.colors.mutedForeground }]}>
                    {c.count} negocios
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  note: { fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 24 },
  meta: { flex: 1, minWidth: 0 },
  label: { fontSize: 14, fontWeight: '600' },
  count: { fontSize: 12, marginTop: 1 },
})
