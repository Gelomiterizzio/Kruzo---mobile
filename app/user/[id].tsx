import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { BadgeCheck, CalendarDays, Store, Star } from 'lucide-react-native'
import { Screen } from '@/components/layout/Screen'
import { Header } from '@/components/layout/Header'
import { LoadingState } from '@/components/feedback/LoadingState'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { useUserById } from '@/hooks/useDocQueries'
import { useTheme } from '@/providers/ThemeProvider'
import { formatDate } from '@/utils/formatters'

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { theme } = useTheme()
  const { data: user, isLoading } = useUserById(id ?? '')

  return (
    <Screen edges={['bottom']} padded={false}>
      <Header title="Perfil" />
      {isLoading ? (
        <LoadingState fullScreen label="Cargando perfil…" />
      ) : !user || user.isBanned ? (
        <EmptyState title="Usuario no encontrado" emoji="🔍" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <Avatar uri={user.photoURL} name={user.displayName} size={80} ring />
              <View style={styles.meta}>
                <View style={styles.nameRow}>
                  <Text style={[styles.name, { color: theme.colors.foreground }]} numberOfLines={1}>
                    {user.displayName}
                  </Text>
                  {user.isVerified ? <BadgeCheck size={18} color="#3b82f6" /> : null}
                </View>
                {user.location ? (
                  <Text style={[styles.location, { color: theme.colors.mutedForeground }]}>
                    📍 {user.location}
                  </Text>
                ) : null}
              </View>
            </View>

            {user.bio ? (
              <Text style={[styles.bio, { color: theme.colors.foreground }]}>{user.bio}</Text>
            ) : null}

            <View style={styles.statsRow}>
              <Stat
                icon={<CalendarDays size={13} color={theme.colors.mutedForeground} />}
                text={`Desde ${formatDate(user.createdAt)}`}
              />
              <Stat
                icon={<Store size={13} color={theme.colors.mutedForeground} />}
                text={`${user.businessIds?.length ?? 0} negocios`}
              />
              <Stat
                icon={<Star size={13} color={theme.colors.mutedForeground} />}
                text={`${user.reviewCount ?? 0} reseñas`}
              />
            </View>
          </Card>
        </ScrollView>
      )}
    </Screen>
  )
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  const { theme } = useTheme()
  return (
    <View style={styles.stat}>
      {icon}
      <Text style={[styles.statText, { color: theme.colors.mutedForeground }]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16 },
  card: { gap: 14 },
  headerRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  meta: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 20, fontWeight: '800', flexShrink: 1 },
  location: { fontSize: 13, marginTop: 2 },
  bio: { fontSize: 14, lineHeight: 20 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12 },
})
