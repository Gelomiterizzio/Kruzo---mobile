import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { Eye, MessageCircle, Heart, Share2, Star, FileText } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { useMyBusiness } from '@/hooks/useMyBusiness'
import { useTheme } from '@/providers/ThemeProvider'
import { formatNumber } from '@/utils/formatters'

// Real totals from the business document (counters maintained by Cloud Functions
// / server). The web analytics page used random mock time-series + charts; we
// surface the real cumulative metrics instead of fabricated trends.
export default function AnalyticsScreen() {
  const { theme } = useTheme()
  const { business, hasBusiness, isLoading } = useMyBusiness()

  const cards = business
    ? [
        { icon: Eye, label: 'Visitas', value: formatNumber(business.viewCount), color: '#3b82f6' },
        {
          icon: MessageCircle,
          label: 'Contactos',
          value: formatNumber(business.contactCount),
          color: '#16a34a',
        },
        {
          icon: Heart,
          label: 'Guardados',
          value: formatNumber(business.favoriteCount),
          color: '#ef4444',
        },
        {
          icon: Share2,
          label: 'Compartidos',
          value: formatNumber(business.shareCount),
          color: '#8b5cf6',
        },
        {
          icon: Star,
          label: 'Rating',
          value: business.reviewCount > 0 ? business.rating.toFixed(1) : '—',
          color: theme.gold[500],
        },
        {
          icon: FileText,
          label: 'Reseñas',
          value: formatNumber(business.reviewCount),
          color: theme.colors.primary,
        },
      ]
    : []

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Estadísticas" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando…" />
      ) : !hasBusiness || !business ? (
        <EmptyState
          title="Sin estadísticas"
          description="Crea tu negocio para empezar a ver métricas reales."
          emoji="📊"
        />
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
            Métricas acumuladas de tu negocio
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
        </ScrollView>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  subtitle: { fontSize: 14 },
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
})
