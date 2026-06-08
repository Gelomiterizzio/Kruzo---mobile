import { FlatList, View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/feedback/EmptyState'
import { LoadingState } from '@/components/feedback/LoadingState'
import { getNotifications } from '@/services/notifications'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/ThemeProvider'
import { formatRelativeTime } from '@/utils/formatters'

export default function NotificationsScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { user, isAuthenticated } = useAuth()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    enabled: isAuthenticated && !!user,
    queryFn: async () => (user ? await getNotifications(user.id) : []),
  })

  if (!isAuthenticated) {
    return (
      <Screen edges={['bottom']} padded={false}>
        <Header title="Notificaciones" />
        <EmptyState
          title="Notificaciones"
          description="Inicia sesión para ver tus notificaciones."
          emoji="🔔"
          actionLabel="Iniciar sesión"
          onAction={() => router.push('/login')}
        />
      </Screen>
    )
  }

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Notificaciones" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card style={[styles.row, !item.read && { borderColor: theme.colors.primary }]}>
              <Text style={styles.icon}>🔔</Text>
              <View style={styles.meta}>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>
                  {item.title ?? 'Notificación'}
                </Text>
                {item.body ? (
                  <Text style={[styles.body, { color: theme.colors.mutedForeground }]}>
                    {item.body}
                  </Text>
                ) : null}
                {item.createdAt ? (
                  <Text style={[styles.time, { color: theme.colors.mutedForeground }]}>
                    {formatRelativeTime(item.createdAt)}
                  </Text>
                ) : null}
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <EmptyState
              title="No tienes notificaciones"
              description="Aquí aparecerán tus notificaciones cuando estén disponibles."
              emoji="🔔"
            />
          }
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 10, flexGrow: 1 },
  row: { flexDirection: 'row', gap: 12 },
  icon: { fontSize: 20 },
  meta: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 14, fontWeight: '600' },
  body: { fontSize: 13, lineHeight: 18 },
  time: { fontSize: 11, marginTop: 2 },
})
