import { FlatList, View, Text, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Flag } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getReports } from '@/services/admin'
import { useTheme } from '@/providers/ThemeProvider'

export default function AdminReportsScreen() {
  const { theme } = useTheme()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => getReports(100),
  })

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Reportes" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const reason = (item.reason ?? item.type ?? 'Reporte') as string
            const target = (item.targetType ?? item.targetId ?? '') as string
            return (
              <Card style={styles.row}>
                <Flag size={18} color={theme.colors.destructive} />
                <View style={styles.meta}>
                  <Text
                    style={[styles.title, { color: theme.colors.foreground }]}
                    numberOfLines={2}
                  >
                    {reason}
                  </Text>
                  {target ? (
                    <Text
                      style={[styles.sub, { color: theme.colors.mutedForeground }]}
                      numberOfLines={1}
                    >
                      {target}
                    </Text>
                  ) : null}
                </View>
              </Card>
            )
          }}
          ListEmptyComponent={
            <EmptyState
              title="No hay reportes pendientes"
              description="Los reportes de usuarios aparecerán aquí."
              emoji="🚩"
            />
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10, flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  meta: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 12, marginTop: 2 },
})
