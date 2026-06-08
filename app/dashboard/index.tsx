import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useRouter, type Href } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { collection, getCountFromServer, query, where } from 'firebase/firestore'
import {
  Eye,
  Star,
  MessageSquare,
  FileText,
  Store,
  Plus,
  TrendingUp,
  Settings,
} from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { db } from '@/services/firebase'
import { getBusinessById } from '@/services/firestore'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/providers/ThemeProvider'
import { formatNumber } from '@/utils/formatters'

export default function DashboardHomeScreen() {
  const { theme } = useTheme()
  const router = useRouter()
  const { user } = useAuth()
  const businessId = user?.businessIds?.[0]

  // Real stats — the business doc is kept current by Cloud Functions.
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', businessId],
    enabled: !!businessId,
    queryFn: async () => {
      if (!businessId) return null
      const business = await getBusinessById(businessId)
      const postsSnap = await getCountFromServer(
        query(
          collection(db, 'posts'),
          where('businessId', '==', businessId),
          where('status', '==', 'active'),
        ),
      )
      return {
        views: business?.viewCount ?? 0,
        rating: business?.rating ?? 0,
        reviews: business?.reviewCount ?? 0,
        posts: postsSnap.data().count,
      }
    },
  })

  const cards = [
    {
      icon: Eye,
      label: 'Visitas',
      value: stats ? formatNumber(stats.views) : '—',
      color: '#3b82f6',
    },
    {
      icon: Star,
      label: 'Rating',
      value: stats && stats.reviews > 0 ? stats.rating.toFixed(1) : '—',
      color: theme.gold[500],
    },
    {
      icon: MessageSquare,
      label: 'Reseñas',
      value: stats ? formatNumber(stats.reviews) : '—',
      color: theme.colors.primary,
    },
    {
      icon: FileText,
      label: 'Publicaciones',
      value: stats ? formatNumber(stats.posts) : '—',
      color: '#16a34a',
    },
  ]

  const actions: { icon: typeof Store; label: string; desc: string; to: Href }[] = [
    {
      icon: Store,
      label: 'Gestionar mi negocio',
      desc: 'Editar información y fotos',
      to: '/dashboard/business',
    },
    {
      icon: Plus,
      label: 'Nueva publicación',
      desc: 'Agregar producto o servicio',
      to: '/dashboard/posts/new',
    },
    { icon: FileText, label: 'Mis publicaciones', desc: 'Ver y editar', to: '/dashboard/posts' },
    {
      icon: TrendingUp,
      label: 'Estadísticas',
      desc: 'Métricas de tu negocio',
      to: '/dashboard/analytics',
    },
    { icon: Star, label: 'Reseñas', desc: 'Opiniones de clientes', to: '/dashboard/reviews' },
    {
      icon: Settings,
      label: 'Configuración',
      desc: 'Perfil y notificaciones',
      to: '/dashboard/settings',
    },
  ]

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Panel de control" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.greeting, { color: theme.colors.foreground }]}>
          Hola, {user?.displayName?.split(' ')[0] ?? ''} 👋
        </Text>
        <Text style={[styles.sub, { color: theme.colors.mutedForeground }]}>
          Aquí está el resumen de tu actividad
        </Text>

        <View style={styles.grid}>
          {cards.map(({ icon: Icon, label, value, color }) => (
            <Card key={label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: color + '1A' }]}>
                <Icon size={18} color={color} />
              </View>
              <Text style={[styles.statValue, { color: theme.colors.foreground }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
                {label}
              </Text>
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          {actions.map(({ icon: Icon, label, desc, to }) => (
            <Card key={label} onPress={() => router.push(to)} style={styles.actionCard}>
              <Icon size={20} color={theme.colors.primary} />
              <View style={styles.actionMeta}>
                <Text style={[styles.actionLabel, { color: theme.colors.foreground }]}>
                  {label}
                </Text>
                <Text style={[styles.actionDesc, { color: theme.colors.mutedForeground }]}>
                  {desc}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {!user?.businessIds?.length ? (
          <Card onPress={() => router.push('/dashboard/business')} style={styles.setup}>
            <Text style={[styles.setupTitle, { color: theme.colors.foreground }]}>
              Empieza registrando tu negocio
            </Text>
            <Text style={[styles.setupDesc, { color: theme.colors.mutedForeground }]}>
              Crea tu perfil de negocio para empezar a aparecer en KRUZO.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8 },
  greeting: { fontSize: 22, fontWeight: '800' },
  sub: { fontSize: 14, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', flexGrow: 1, gap: 6 },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  actions: { gap: 10, marginTop: 8 },
  actionCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  actionMeta: { flex: 1 },
  actionLabel: { fontSize: 14, fontWeight: '600' },
  actionDesc: { fontSize: 12, marginTop: 1 },
  setup: { marginTop: 8, gap: 4 },
  setupTitle: { fontSize: 15, fontWeight: '700' },
  setupDesc: { fontSize: 13, lineHeight: 18 },
})
