import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import { Users, Store, CheckCircle2, ShieldAlert, FileText, Flag } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/feedback/LoadingState'
import { db } from '@/services/firebase'
import { useTheme } from '@/providers/ThemeProvider'
import { BUSINESS_CATEGORIES } from '@/constants'

export default function AdminHomeScreen() {
  const { theme } = useTheme()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [users, businesses, active, pending, posts, reports] = await Promise.all([
        getCountFromServer(collection(db, 'users')),
        getCountFromServer(collection(db, 'businesses')),
        getCountFromServer(query(collection(db, 'businesses'), where('status', '==', 'active'))),
        getCountFromServer(query(collection(db, 'businesses'), where('status', '==', 'pending'))),
        getCountFromServer(collection(db, 'posts')),
        getCountFromServer(collection(db, 'reports')),
      ])
      const catCounts = await Promise.all(
        BUSINESS_CATEGORIES.map((c) =>
          getCountFromServer(
            query(collection(db, 'businesses'), where('category', 'array-contains', c.key)),
          ),
        ),
      )
      return {
        users: users.data().count,
        businesses: businesses.data().count,
        active: active.data().count,
        pending: pending.data().count,
        posts: posts.data().count,
        reports: reports.data().count,
        categories: BUSINESS_CATEGORIES.map((c, i) => ({
          key: c.key,
          emoji: c.emoji,
          label: c.label,
          count: catCounts[i]?.data().count ?? 0,
        })),
      }
    },
  })

  const metrics = data
    ? [
        { icon: Users, label: 'Usuarios', value: data.users, color: '#3b82f6' },
        { icon: Store, label: 'Negocios', value: data.businesses, color: theme.colors.primary },
        { icon: CheckCircle2, label: 'Activos', value: data.active, color: '#16a34a' },
        { icon: ShieldAlert, label: 'Pendientes', value: data.pending, color: '#f59e0b' },
        { icon: FileText, label: 'Publicaciones', value: data.posts, color: '#8b5cf6' },
        { icon: Flag, label: 'Reportes', value: data.reports, color: '#ef4444' },
      ]
    : []

  const maxCat = Math.max(1, ...(data?.categories.map((c) => c.count) ?? [1]))

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Administración" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando métricas…" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>
            Vista general de la plataforma
          </Text>

          <View style={styles.grid}>
            {metrics.map(({ icon: Icon, label, value, color }) => (
              <Card key={label} style={styles.metricCard}>
                <View style={[styles.metricIcon, { backgroundColor: color + '1A' }]}>
                  <Icon size={18} color={color} />
                </View>
                <Text style={[styles.metricValue, { color: theme.colors.foreground }]}>
                  {value.toLocaleString()}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.colors.mutedForeground }]}>
                  {label}
                </Text>
              </Card>
            ))}
          </View>

          <Card style={styles.distCard}>
            <Text style={[styles.distTitle, { color: theme.colors.foreground }]}>
              Distribución por categorías
            </Text>
            {data?.categories.map((c) => (
              <View key={c.key} style={styles.distRow}>
                <Text style={styles.distLabel} numberOfLines={1}>
                  {c.emoji} {c.label}
                </Text>
                <View style={[styles.distTrack, { backgroundColor: theme.colors.muted }]}>
                  <View
                    style={[
                      styles.distFill,
                      {
                        width: `${(c.count / maxCat) * 100}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.distCount, { color: theme.colors.foreground }]}>
                  {c.count}
                </Text>
              </View>
            ))}
          </Card>
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 14 },
  title: { fontSize: 16, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: { width: '30%', flexGrow: 1, gap: 6 },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: { fontSize: 20, fontWeight: '800' },
  metricLabel: { fontSize: 11 },
  distCard: { gap: 10 },
  distTitle: { fontSize: 15, fontWeight: '700' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distLabel: { fontSize: 13, width: 110 },
  distTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  distFill: { height: '100%', borderRadius: 4 },
  distCount: { fontSize: 13, fontWeight: '600', width: 32, textAlign: 'right' },
})
