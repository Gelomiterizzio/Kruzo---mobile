import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { MapPin, Store, Users, TrendingUp } from 'lucide-react-native'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/providers/ThemeProvider'
import { APP_CITY } from '@/constants'

const STATS = [
  { icon: Store, value: '500+', label: 'Negocios' },
  { icon: Users, value: '10k+', label: 'Usuarios' },
  { icon: TrendingUp, value: '12', label: 'Categorías' },
  { icon: MapPin, value: 'SCZ', label: 'Bolivia' },
]

// Mobile hero. The web hero embeds a (non-functional) search box; on mobile we
// surface an explicit "Explorar" CTA into the filter-based discovery instead.
export function HomeHero() {
  const { theme } = useTheme()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: theme.colors.primary + '1A' }]}>
        <MapPin size={12} color={theme.colors.primary} />
        <Text style={[styles.badgeText, { color: theme.colors.primary }]}>{APP_CITY}, Bolivia</Text>
      </View>

      <Text style={[styles.title, { color: theme.colors.foreground }]}>Tu Ciudad.</Text>
      <Text style={[styles.title, { color: theme.colors.primary }]}>Tu Mercado.</Text>

      <Text style={[styles.subtitle, { color: theme.colors.mutedForeground }]}>
        Descubre negocios, emprendimientos y servicios locales. Conecta directamente por WhatsApp.
      </Text>

      <Button
        label="Explorar negocios"
        onPress={() => router.push('/explore')}
        size="lg"
        style={styles.cta}
      />

      <View style={[styles.stats, { borderTopColor: theme.colors.border }]}>
        {STATS.map((s) => (
          <View key={s.label} style={styles.stat}>
            <s.icon size={14} color={theme.colors.primary} />
            <Text style={[styles.statValue, { color: theme.colors.foreground }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.mutedForeground }]}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  title: { fontSize: 40, fontWeight: '900', lineHeight: 42, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', marginTop: 12, lineHeight: 21, maxWidth: 320 },
  cta: { marginTop: 20, alignSelf: 'stretch' },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignSelf: 'stretch',
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  stat: { alignItems: 'center', gap: 3 },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
})
